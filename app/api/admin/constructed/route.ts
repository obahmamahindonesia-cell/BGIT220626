import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { validateReviewerScore } from '@/lib/rubrics/bigt-constructed-rubrics'
import { sanitizeSnapshot, computeConstructedScore, buildFinalScoreJson } from '@/lib/scoring/constructed-scoring'
import { getPlagiarismResult } from '@/lib/plagiarism'
import { REVIEW_STATUS, isValidReviewStatus, isBlockedFromFinalization } from '@/lib/scoring/review-status'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const sessionId = searchParams.get('sessionId')
  const userId = searchParams.get('userId')
  const examMode = searchParams.get('examMode')
  const level = searchParams.get('level')
  const dimension = searchParams.get('dimension')

  const where: any = {
    responseText: { not: null },
  }

  if (status) where.responseStatus = status
  if (sessionId) {
    where.sessionItem = { sessionId }
  }
  if (userId) where.userId = userId
  if (examMode) {
    const sessionProductFilter: any = {}
    if (examMode === 'trial_constructed') {
      sessionProductFilter.product = { in: ['TRIAL_A1', 'TRIAL_A2'] }
    } else if (examMode === 'dev_full') {
      sessionProductFilter.product = 'DEV_FULL'
    } else if (examMode === 'live') {
      sessionProductFilter.product = { notIn: ['TRIAL_A1', 'TRIAL_A2', 'DEV_FULL'] }
    }
    where.sessionItem = { ...(where.sessionItem || {}), session: sessionProductFilter }
  }
  if (level) {
    where.sessionItem = { ...(where.sessionItem || {}), level }
  }
  if (dimension) {
    where.sessionItem = { ...(where.sessionItem || {}), dimension }
  }

  try {
    const answers = await prisma.userAnswer.findMany({
      where,
      include: {
        sessionItem: {
          include: {
            session: {
              select: { id: true, product: true, targetLevel: true, status: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    })

    const userIds = [...new Set(answers.map(a => a.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const data = await Promise.all(answers.map(async a => ({
      id: a.id,
      sessionItemId: a.sessionItemId,
      sessionId: a.sessionItem.session.id,
      userId: a.userId,
      userName: userMap.get(a.userId)?.name || userMap.get(a.userId)?.email || 'Unknown',
      product: a.sessionItem.session.product,
      targetLevel: a.sessionItem.session.targetLevel,
      responseText: a.responseText,
      responseAudioUrl: a.responseAudioUrl,
      responseAudioMimeType: a.responseAudioMimeType,
      audioDurationSec: a.audioDurationSec,
      audioFileSize: a.audioFileSize,
      audioStoragePath: a.audioStoragePath,
      audioStorageProvider: a.audioStorageProvider,
      hasAudio: !!(a.audioStoragePath || a.responseAudioUrl),
      wordCount: a.wordCount,
      snapshot: sanitizeSnapshot(a.sessionItem.questionSnapshot),
      dimension: a.sessionItem.dimension,
      level: a.sessionItem.level,
      submittedAt: a.submittedAt.toISOString(),
      responseStatus: a.responseStatus,
      reviewerScoreJson: a.reviewerScoreJson,
      finalScoreJson: a.finalScoreJson,
      autoScoreJson: a.autoScoreJson,
      internalNotes: a.internalNotes,
      reviewedAt: a.reviewedAt?.toISOString() || null,
      feedback: a.feedback,
      score: a.score,
      aiScore: a.aiScore,
      aiFeedback: a.aiFeedback,
      plagiarismReport: await getPlagiarismResult(a.id),
    })))

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  try {
    const body = await request.json()
    const { id, reviewerScoreJson, internalNotes, feedback, responseStatus } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'id wajib diisi.' }, { status: 400 })
    }

    // Fetch existing answer with snapshot for rubricRef
    const existing = await prisma.userAnswer.findUnique({
      where: { id },
      include: {
        sessionItem: {
          select: { questionSnapshot: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Jawaban tidak ditemukan.' }, { status: 404 })
    }

    // Validate responseStatus if provided
    if (responseStatus && !isValidReviewStatus(responseStatus)) {
      return NextResponse.json({ success: false, error: `Status "${responseStatus}" tidak valid.` }, { status: 400 })
    }

    // Prevent changing away from rejected unless admin override
    if (existing.responseStatus === REVIEW_STATUS.REJECTED && responseStatus && responseStatus !== REVIEW_STATUS.REJECTED) {
      return NextResponse.json({ success: false, error: 'Status rejected tidak dapat diubah.' }, { status: 400 })
    }

    const snapshot = existing.sessionItem.questionSnapshot as any
    const rubricRef = snapshot?.rubricRef

    // Validate dimensions against rubric if reviewerScoreJson provided
    if (reviewerScoreJson) {
      if (rubricRef) {
        const validation = validateReviewerScore(rubricRef, reviewerScoreJson)
        if (!validation.valid) {
          return NextResponse.json({
            success: false,
            error: `Skor tidak valid: ${validation.errors.join('; ')}`,
          }, { status: 400 })
        }
      }
    }

    const updateData: any = {}
    const statusChangingTo = responseStatus || existing.responseStatus

    if (reviewerScoreJson) updateData.reviewerScoreJson = reviewerScoreJson
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes
    if (feedback !== undefined) updateData.feedback = feedback

    if (responseStatus) {
      updateData.responseStatus = responseStatus
    }

    // Auto-compute finalScoreJson when status transitions to 'reviewed'
    // and all dimension scores are present
    if (statusChangingTo === REVIEW_STATUS.REVIEWED && !isBlockedFromFinalization(statusChangingTo)) {
      const currentReviewerScore = reviewerScoreJson || existing.reviewerScoreJson
      if (currentReviewerScore && rubricRef) {
        const dimensionScores = currentReviewerScore.dimensions?.reduce(
          (acc: Record<string, number>, d: any) => {
            acc[d.id] = d.score
            return acc
          },
          {}
        )
        if (dimensionScores && Object.keys(dimensionScores).length > 0) {
          const computed = computeConstructedScore({ rubricRef, dimensionScores })
          if (computed.validationErrors.length === 0) {
            updateData.finalScoreJson = buildFinalScoreJson(computed)
          }
        }
      }
    } else if (statusChangingTo !== REVIEW_STATUS.REVIEWED) {
      // Clear finalScoreJson when moving away from reviewed
      if (existing.finalScoreJson) {
        updateData.finalScoreJson = null
      }
    }

    updateData.reviewedAt = new Date()

    const updated = await prisma.userAnswer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        responseStatus: updated.responseStatus,
        reviewedAt: updated.reviewedAt?.toISOString() || null,
        reviewerScoreJson: updated.reviewerScoreJson,
        finalScoreJson: updated.finalScoreJson,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
