import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { selectQuestions } from '@/lib/assessment/question-selector'
import { runAdaptivePlacement } from '@/lib/assessment/adaptive-lite'
import { selectItemsForBlueprint } from '@/lib/test-assembly/selectTestItems'
import { selectLevelExamItems } from '@/lib/test-assembly/selectLevelExamItems'
import { getBlueprint } from '@/lib/test-blueprint/bigtBlueprint'
import { getLevelBlueprint, findBlueprintByTargetLevel, type LevelBlueprintId } from '@/lib/test-blueprint/bigtLevelBlueprint'
import { syncQuestionItem } from '@/lib/question-bank/syncQuestionItem'
import type { BlueprintId } from '@/lib/test-blueprint/bigtBlueprint'
import type { SanitizedQuestion } from '@/types/question-bank'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SKILL_TO_DIMENSION: Record<string, 'LISTENING' | 'READING'> = {
  listening: 'LISTENING',
  reading: 'READING',
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: { profile: true },
    })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { blueprintId, targetLevel } = body

    // Resolve blueprintId from targetLevel shorthand
    let resolvedBlueprintId = blueprintId
    let levelBlueprint = null
    let legacyBlueprint = null

    if (!resolvedBlueprintId && targetLevel) {
      levelBlueprint = findBlueprintByTargetLevel(targetLevel)
      if (levelBlueprint) {
        resolvedBlueprintId = levelBlueprint.id
      }
    }

    if (resolvedBlueprintId) {
      // Check new level blueprints first
      levelBlueprint = getLevelBlueprint(resolvedBlueprintId)
      if (!levelBlueprint) {
        legacyBlueprint = getBlueprint(resolvedBlueprintId)
      }

      if (!levelBlueprint && !legacyBlueprint) {
        return NextResponse.json({ success: false, error: `Blueprint "${resolvedBlueprintId}" tidak ditemukan.` }, { status: 400 })
      }

      // === NEW LEVEL-BASED BLUEPRINT FLOW ===
      if (levelBlueprint) {
        const assembly = selectLevelExamItems(levelBlueprint)
        if (!assembly.success || assembly.items.length === 0) {
          return NextResponse.json({ success: false, error: 'Gagal menyusun tes: ' + (assembly.error || 'tidak ada soal tersedia.') }, { status: 422 })
        }

        const session = await prisma.testSession.create({
          data: {
            userId: dbUser.id,
            product: resolvedBlueprintId,
            targetLevel: levelBlueprint.targetLevel,
            status: 'IN_PROGRESS',
            questionCount: assembly.items.length,
            metadata: {
              blueprintId: resolvedBlueprintId,
              durationMinutes: levelBlueprint.estimatedDurationMinutes,
              sections: levelBlueprint.sections.map(s => ({ skill: s.skill, count: s.totalItems })),
              warnings: assembly.log.warnings,
            },
          },
        })

        for (let i = 0; i < assembly.items.length; i++) {
          const q = assembly.items[i]
          const prismaId = await syncQuestionItem(q.questionId)

          if (!prismaId) {
            console.warn(`Could not sync question ${q.questionId}, skipping`)
            continue
          }

          const dimMap: Record<string, string> = {
            reading: 'READING', listening: 'LISTENING',
            writing: 'WRITING', speaking: 'SPEAKING', integrated: 'INTEGRATED',
          }

          const sectionForItem = assembly.sections.find(s => s.items.find(i => i.questionId === q.questionId))
          const cefrGuess = q.questionId?.startsWith('BIGT-A1') ? 'A1' : q.questionId?.startsWith('BIGT-A2') ? 'A2' : 'A1'

          await prisma.testSessionItem.create({
            data: {
              sessionId: session.id,
              questionId: prismaId,
              order: i + 1,
              dimension: (dimMap[sectionForItem?.skill || 'reading'] || 'READING') as any,
              level: cefrGuess as any,
              difficulty: Math.max(1, Math.round((q.difficulty || 0.3) * 18)),
              questionSnapshot: q as any,
              maxScore: 10,
            },
          })
        }

        const finalItems = await prisma.testSessionItem.count({ where: { sessionId: session.id } })
        if (finalItems === 0) {
          await prisma.testSession.delete({ where: { id: session.id } })
          return NextResponse.json({ success: false, error: 'Gagal menyinkronkan soal ke database.' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            blueprintId: resolvedBlueprintId,
            targetLevel: levelBlueprint.targetLevel,
            totalItems: finalItems,
            estimatedDurationMinutes: levelBlueprint.estimatedDurationMinutes,
            sections: assembly.sections.map(s => ({
              skill: s.skill,
              count: s.items.length,
              items: s.items,
            })),
            questions: assembly.items,
          },
        })
      }

      // === LEGACY BLUEPRINT FLOW (backward compat) ===
      if (legacyBlueprint) {
        const assembly = selectItemsForBlueprint(legacyBlueprint)
        if (!assembly.success || assembly.items.length === 0) {
          return NextResponse.json({ success: false, error: 'Gagal menyusun tes: ' + (assembly.error || 'tidak ada soal tersedia.') }, { status: 422 })
        }

        const session = await prisma.testSession.create({
          data: {
            userId: dbUser.id,
            product: resolvedBlueprintId,
            targetLevel: null,
            status: 'IN_PROGRESS',
            questionCount: assembly.items.length,
            metadata: {
              blueprintId: resolvedBlueprintId,
              durationMinutes: legacyBlueprint.estimatedDurationMinutes,
              sections: legacyBlueprint.sections.map(s => ({ skill: s.skill, count: s.count })),
              warnings: assembly.log.warnings,
            },
          },
        })

        for (let i = 0; i < assembly.items.length; i++) {
          const q = assembly.items[i]
          const prismaId = await syncQuestionItem(q.questionId)

          if (!prismaId) {
            console.warn(`Could not sync question ${q.questionId}, skipping`)
            continue
          }

          const dimMap: Record<string, string> = {
            reading: 'READING', listening: 'LISTENING',
            writing: 'WRITING', speaking: 'SPEAKING', integrated: 'INTEGRATED',
          }

          const sectionForItem = assembly.sections.find(s => s.items.find(i => i.questionId === q.questionId))
          const cefrGuess = q.questionId?.startsWith('BIGT-A1') ? 'A1' : q.questionId?.startsWith('BIGT-A2') ? 'A2' : 'A1'

          await prisma.testSessionItem.create({
            data: {
              sessionId: session.id,
              questionId: prismaId,
              order: i + 1,
              dimension: (dimMap[sectionForItem?.skill || 'reading'] || 'READING') as any,
              level: cefrGuess as any,
              difficulty: Math.max(1, Math.round((q.difficulty || 0.3) * 18)),
              questionSnapshot: q as any,
              maxScore: 10,
            },
          })
        }

        const finalItems = await prisma.testSessionItem.count({ where: { sessionId: session.id } })
        if (finalItems === 0) {
          await prisma.testSession.delete({ where: { id: session.id } })
          return NextResponse.json({ success: false, error: 'Gagal menyinkronkan soal ke database.' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            blueprintId: resolvedBlueprintId,
            totalItems: finalItems,
            estimatedDurationMinutes: legacyBlueprint.estimatedDurationMinutes,
            sections: assembly.sections.map(s => ({
              skill: s.skill,
              count: s.items.length,
              items: s.items,
            })),
            questions: assembly.items,
          },
        })
      }
    }

    // === LEGACY PRODUCT-BASED FLOW (DB) ===
    const product = body.product
    const dimensions = body.dimensions

    if (!product) {
      return NextResponse.json({ success: false, error: 'Produk tes atau blueprintId wajib diisi.' }, { status: 400 })
    }

    const productCode = product.toUpperCase()

    let selectedQuestions: any[] = []
    let metadata: any = {}

    if (productCode === 'PLACEMENT') {
      const recentIds = await getRecentQuestionIds(dbUser.id, 30)
      const adaptiveResult = await runAdaptivePlacement(dbUser.id, dimensions || [], recentIds)
      selectedQuestions = adaptiveResult.questions
    } else {
      const dims = dimensions && dimensions.length > 0
        ? dimensions
        : ['LISTENING', 'READING']

      const level = targetLevel || dbUser.profile?.targetLevel || 'B1'

      const dimDistribution = Object.fromEntries(dims.map((d: string) => [d, Math.floor(25 / dims.length)]))

      const dimTotal = Object.values(dimDistribution).reduce((a: number, b: number) => a + b, 0)
      if (dimTotal < 25 && dims.length > 0) {
        dimDistribution[dims[0]] = (dimDistribution[dims[0]] || 0) + (25 - dimTotal)
      }

      const recentIds = await getRecentQuestionIds(dbUser.id, 30)
      const allQuestions: any[] = []

      for (const dim of Object.keys(dimDistribution)) {
        const count = dimDistribution[dim]
        if (count <= 0) continue

        const result = await selectQuestions({
          product: productCode,
          dimensions: [dim],
          targetLevel: level,
          questionCount: count,
          excludeQuestionIds: [...recentIds, ...allQuestions.map(q => q.id)],
        })

        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error,
            metadata: result.metadata,
          }, { status: 422 })
        }

        allQuestions.push(...result.questions)
        metadata = result.metadata
      }

      selectedQuestions = allQuestions.slice(0, 25)
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tidak ada soal yang tersedia untuk konfigurasi ini.',
      }, { status: 422 })
    }

    const session = await prisma.testSession.create({
      data: {
        userId: dbUser.id,
        product: productCode,
        targetLevel: targetLevel || null,
        status: 'IN_PROGRESS',
        questionCount: selectedQuestions.length,
        metadata: {
          dimensions: dimensions || null,
          durationMinutes: 30,
        },
      },
    })

    for (let i = 0; i < selectedQuestions.length; i++) {
      const q = selectedQuestions[i]
      const snapshot = {
        prompt: q.prompt,
        instruction: q.instruction,
        questionType: q.questionType,
        options: q.options,
        stimulus: q.stimulus,
        estimatedTime: q.estimatedTime,
        tags: q.tags,
        subskill: q.subskill,
        topic: q.topic,
      }

      await prisma.testSessionItem.create({
        data: {
          sessionId: session.id,
          questionId: q.id,
          order: i + 1,
          dimension: q.dimension as any,
          level: q.level as any,
          difficulty: q.difficulty,
          questionSnapshot: snapshot,
          maxScore: q.maxScore || 10,
          stage: (q as any).stage || null,
        },
      })
    }

    for (const q of selectedQuestions) {
      await prisma.questionItem.update({
        where: { id: q.id },
        data: { exposureCount: { increment: 1 } },
      })
      await prisma.itemStatistic.upsert({
        where: { questionId: q.id },
        update: { attempts: { increment: 1 }, lastUsedAt: new Date() },
        create: { questionId: q.id, attempts: 1, lastUsedAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      redirectTo: `/test/${session.id}`,
      questionCount: selectedQuestions.length,
    })
  } catch (err: any) {
    console.error('Error starting test:', err)
    return NextResponse.json({ success: false, error: err.message || 'Gagal memulai tes.' }, { status: 500 })
  }
}

async function getRecentQuestionIds(userId: string, days: number): Promise<string[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days)

  const recentItems = await prisma.testSessionItem.findMany({
    where: {
      session: { userId, startedAt: { gte: thirtyDaysAgo } },
    },
    select: { questionId: true },
  })

  return Array.from(new Set(recentItems.map(i => i.questionId)))
}
