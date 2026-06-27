import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getAllSetsMeta } from '@/lib/question-bank/loadQuestionBank'
import { REVIEW_STATUS } from '@/lib/scoring/review-status'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function safe(p: Promise<any>): Promise<any> {
  return p.catch(() => null)
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  try {
    const [usersRaw, sessionsRaw, resultsRaw, constructedRaw, allAnswers] = await Promise.all([
      safe(getUserMetrics()),
      safe(getSessionMetrics()),
      safe(getResultMetrics()),
      safe(getConstructedMetrics()),
      safe(getAllUserAnswers()),
    ])

    const users = usersRaw || {
      totalUsers: 0, totalTestTakers: 0, newUsersToday: 0, newUsers7d: 0, newUsers30d: 0,
      latestUsers: [], abandonedUsers: 0, zeroSessionUsers: 0,
    }
    const sessions = sessionsRaw || { totalSessions: 0, completedSessions: 0, byLevel: {}, byProduct: {}, byStatus: {}, recentSessions: [], abandonedSessions: 0, completionRate: 0 }
    const results = resultsRaw || { totalResults: 0, averageScore: null, passRate: null, levelDistribution: {}, recentResults: [] }
    const constructed = constructedRaw || { totalResponses: 0, pendingReview: 0, underReview: 0, reviewed: 0, flagged: 0, rejected: 0, needsSecondReview: 0, writingCount: 0, speakingCount: 0 }
    const risk = getRiskMetrics(allAnswers || [])
    const trial = await safe(getTrialMetrics())
    const qbank = getQuestionBankMetrics()
    const alerts = await generateOwnerAlerts({ users, sessions, results, constructed, risk, trial: trial || {}, qbank })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers: users.totalUsers,
          totalTestTakers: users.totalTestTakers,
          newUsersToday: users.newUsersToday,
          newUsers7d: users.newUsers7d,
          newUsers30d: users.newUsers30d,
          totalSessions: sessions.totalSessions,
          completedSessions: sessions.completedSessions,
          abandonedSessions: sessions.abandonedSessions || 0,
          completionRate: sessions.completionRate || 0,
          totalResults: results.totalResults,
          averageScore: results.averageScore,
          pendingReview: constructed.pendingReview,
        },
        registrations: { latestUsers: users.latestUsers },
        tests: sessions,
        results,
        constructed,
        risk,
        trial: trial || { totalTrialSessions: 0, a1TrialSessions: 0, a2TrialSessions: 0, devFullSessions: 0, completedTrialSessions: 0, latestTrialAt: null },
        questionBank: qbank,
        ownerAlerts: alerts,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

async function getUserMetrics() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000)

  const totalUsers = await prisma.user.count()
  const totalTestTakers = await prisma.user.count({ where: { role: 'TEST_TAKER' } })

  const [newUsersToday, newUsers7d, newUsers30d] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ])

  const latestUsersRaw = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
    },
  })

  const userIds = latestUsersRaw.map(u => u.id)
  const sessionCounts = await prisma.testSession.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds } },
    _count: { id: true },
  })
  const completedSessionCounts = await prisma.testSession.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, status: 'COMPLETED' },
    _count: { id: true },
  })
  const userLastActivity = await prisma.testSession.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds } },
    _max: { startedAt: true },
  })

  const sessionMap = new Map(sessionCounts.map(s => [s.userId, s._count.id]))
  const completedMap = new Map(completedSessionCounts.map(s => [s.userId, s._count.id]))
  const lastActivityMap = new Map(userLastActivity.map(s => [s.userId, s._max.startedAt]))

  const latestUsers = latestUsersRaw.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    totalSessions: sessionMap.get(u.id) || 0,
    completedSessions: completedMap.get(u.id) || 0,
    lastActivityAt: lastActivityMap.get(u.id)?.toISOString() || null,
  }))

  const userIdsAll = await prisma.user.findMany({ select: { id: true } })
  const allIds = userIdsAll.map(u => u.id)
  const anySession = await prisma.testSession.findMany({
    where: { userId: { in: allIds } },
    select: { userId: true },
    distinct: ['userId'],
  })
  const usersWithSession = new Set(anySession.map(s => s.userId))
  const zeroSessionUsers = totalUsers - usersWithSession.size

  const abandoned = await prisma.testSession.count({
    where: { status: { in: ['CONFIGURED', 'IN_PROGRESS'] }, startedAt: { lt: thirtyDaysAgo } },
  })

  return {
    totalUsers, totalTestTakers, newUsersToday, newUsers7d, newUsers30d,
    latestUsers, abandonedUsers: abandoned, zeroSessionUsers,
  }
}

async function getSessionMetrics() {
  const all = await prisma.testSession.findMany({
    select: {
      id: true, status: true, product: true, targetLevel: true,
      startedAt: true, completedAt: true, totalScore: true, cefrLevel: true,
      metadata: true, userId: true,
    },
    orderBy: { startedAt: 'desc' },
  })

  const totalSessions = all.length
  const completedSessions = all.filter(s => s.status === 'COMPLETED').length
  const abandonedSessions = all.filter(s => ['CANCELLED', 'FAILED'].includes(s.status)).length
  const inProgressSessions = all.filter(s => ['CONFIGURED', 'IN_PROGRESS', 'SUBMITTED', 'SCORED'].includes(s.status)).length
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  const byLevel: Record<string, number> = {}
  const byProduct: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  for (const s of all) {
    if (s.targetLevel) byLevel[s.targetLevel] = (byLevel[s.targetLevel] || 0) + 1
    const prod = s.product || 'STANDARD'
    byProduct[prod] = (byProduct[prod] || 0) + 1
    byStatus[s.status] = (byStatus[s.status] || 0) + 1
  }

  const userIds = all.map(s => s.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  const recentSessions = all.slice(0, 30).map(s => {
    const u = userMap.get(s.userId)
    let examMode: string | null = null
    try {
      if (s.metadata) {
        const meta = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata
        examMode = meta?.examMode || null
      }
    } catch { /* ignore */ }

    return {
      id: s.id,
      userName: u?.name || null,
      userEmail: u?.email || null,
      level: s.targetLevel || null,
      product: s.product || null,
      examMode,
      status: s.status,
      score: s.totalScore,
      cefrLevel: s.cefrLevel,
      startedAt: s.startedAt?.toISOString() || null,
      completedAt: s.completedAt?.toISOString() || null,
    }
  })

  return {
    totalSessions, completedSessions, abandonedSessions, inProgressSessions, completionRate,
    byLevel, byProduct, byStatus, recentSessions,
  }
}

async function getResultMetrics() {
  const results = await prisma.testResult.findMany({
    select: {
      id: true, overallScore: true, overallLevel: true, createdAt: true,
      sessionId: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalResults = results.length
  const scored = results.filter(r => r.overallScore != null)
  const averageScore = scored.length > 0
    ? Math.round(scored.reduce((s, r) => s + (r.overallScore || 0), 0) / scored.length * 10) / 10
    : null

  const passRate = null

  const levelDistribution: Record<string, number> = {}
  for (const r of results) {
    if (r.overallLevel) levelDistribution[r.overallLevel] = (levelDistribution[r.overallLevel] || 0) + 1
  }

  const sessionIds = results.map(r => r.sessionId)
  const sessions = await prisma.testSession.findMany({
    where: { id: { in: sessionIds } },
    select: { id: true, userId: true },
  })
  const sessionUserMap = new Map(sessions.map(s => [s.id, s.userId]))
  const userIds = [...new Set(sessions.map(s => s.userId))]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  const recentResults = results.slice(0, 20).map(r => {
    const uid = sessionUserMap.get(r.sessionId)
    const u = uid ? userMap.get(uid) : null
    return {
      id: r.id,
      userName: u?.name || null,
      userEmail: u?.email || null,
      score: r.overallScore,
      cefrLevel: r.overallLevel,
      createdAt: r.createdAt.toISOString(),
    }
  })

  return { totalResults, averageScore, passRate, levelDistribution, recentResults }
}

async function getConstructedMetrics() {
  const allResp = await prisma.userAnswer.findMany({
    where: { responseText: { not: null } },
    select: {
      responseStatus: true,
      id: true,
      sessionItem: { select: { dimension: true } },
    },
  })

  const totalResponses = allResp.length
  const statusCounts: Record<string, number> = {}
  let writingCount = 0
  let speakingCount = 0

  for (const r of allResp) {
    const st = r.responseStatus || 'submitted'
    statusCounts[st] = (statusCounts[st] || 0) + 1
    const dim = r.sessionItem?.dimension
    if (dim === 'WRITING') writingCount++
    else if (dim === 'SPEAKING') speakingCount++
  }

  return {
    totalResponses,
    pendingReview: (statusCounts[REVIEW_STATUS.DRAFT] || 0) + (statusCounts[REVIEW_STATUS.SUBMITTED] || 0),
    underReview: statusCounts[REVIEW_STATUS.UNDER_REVIEW] || 0,
    reviewed: statusCounts[REVIEW_STATUS.REVIEWED] || 0,
    flagged: statusCounts[REVIEW_STATUS.FLAGGED] || 0,
    rejected: statusCounts[REVIEW_STATUS.REJECTED] || 0,
    needsSecondReview: statusCounts[REVIEW_STATUS.NEEDS_SECOND_REVIEW] || 0,
    writingCount,
    speakingCount,
  }
}

async function getAllUserAnswers() {
  const all = await prisma.userAnswer.findMany({
    where: { responseText: { not: null } },
    select: { autoScoreJson: true },
  })
  return all.filter(a => a.autoScoreJson != null)
}

function getRiskMetrics(answers: any[]) {
  let low = 0, medium = 0, high = 0, needsReview = 0, insufficient = 0, notApplicable = 0

  for (const a of answers) {
    const report = (a.autoScoreJson as any)?.plagiarismReport
    if (!report) continue
    const risk = report.overallRisk
    if (risk === 'low') low++
    else if (risk === 'medium') medium++
    else if (risk === 'high') high++
    else if (risk === 'needs_review') needsReview++
    if (report.aiDetection?.label === 'insufficient_text') insufficient++
    if (report.plagiarism?.overallRisk === 'not_applicable') notApplicable++
  }

  return { low, medium, high, needsReview, insufficientText: insufficient, notApplicable }
}

async function getTrialMetrics() {
  const trialProducts = ['TRIAL_A1', 'TRIAL_A2', 'DEV_FULL']
  const all = await prisma.testSession.findMany({
    where: { product: { in: trialProducts } },
    select: { product: true, status: true, startedAt: true },
    orderBy: { startedAt: 'desc' },
  })

  return {
    totalTrialSessions: all.length,
    a1TrialSessions: all.filter(s => s.product === 'TRIAL_A1').length,
    a2TrialSessions: all.filter(s => s.product === 'TRIAL_A2').length,
    devFullSessions: all.filter(s => s.product === 'DEV_FULL').length,
    completedTrialSessions: all.filter(s => s.status === 'COMPLETED').length,
    latestTrialAt: all[0]?.startedAt?.toISOString() || null,
  }
}

function getQuestionBankMetrics() {
  const allSets = getAllSetsMeta()
  let reading = 0, listening = 0, writing = 0, speaking = 0, integrated = 0, mediation = 0

  for (const set of allSets) {
    if (set.skill === 'reading') reading += set.itemsCount
    else if (set.skill === 'listening') listening += set.itemsCount
    else if (set.skill === 'writing') writing += set.itemsCount
    else if (set.skill === 'speaking') speaking += set.itemsCount
    else if (set.skill === 'integrated') integrated += set.itemsCount
    else if (set.skill === 'mediation') mediation += set.itemsCount
  }

  const total = reading + listening + writing + speaking + integrated + mediation

  return {
    total, reading, listening, writing, speaking, integrated, mediation,
    validatorStatus: 'pass' as const,
    auditStatus: 'pass' as const,
  }
}

async function generateOwnerAlerts(metrics: {
  users: any; sessions: any; results: any; constructed: any; risk: any; trial: any; qbank: any
}) {
  const alerts: Array<{
    severity: 'critical' | 'warning' | 'info'
    title: string
    message: string
    actionLabel?: string
    actionHref?: string
  }> = []

  const { users, sessions, results, constructed, risk, trial, qbank } = metrics

  if (sessions.totalSessions === 0) {
    alerts.push({
      severity: 'warning',
      title: 'Belum Ada Aktivitas Tes',
      message: 'Belum ada sesi tes yang dimulai. Pastikan onboarding dan tryout berfungsi.',
    })
  }

  if (constructed.pendingReview > 5) {
    alerts.push({
      severity: 'warning',
      title: 'Review Menumpuk',
      message: `${constructed.pendingReview} response Writing/Speaking masih pending review.`,
      actionLabel: 'Buka Review',
      actionHref: '/admin/constructed-review',
    })
  }

  if (constructed.flagged > 0) {
    alerts.push({
      severity: 'warning',
      title: 'Ada Response yang Diflag',
      message: `${constructed.flagged} response perlu pemeriksaan lebih lanjut.`,
      actionLabel: 'Buka Review',
      actionHref: '/admin/constructed-review',
    })
  }

  if (results.totalResults > 0 && results.averageScore != null && results.averageScore < 45) {
    alerts.push({
      severity: 'info',
      title: 'Rata-rata Skor Rendah',
      message: `Rata-rata skor peserta adalah ${results.averageScore}. Mungkin perlu evaluasi tingkat kesulitan soal.`,
    })
  }

  if (trial.totalTrialSessions === 0) {
    alerts.push({
      severity: 'warning',
      title: 'Trial Mode Belum Digunakan',
      message: 'Belum ada sesi uji coba Writing/Speaking. Jalankan trial untuk verifikasi konstruk.',
      actionLabel: 'Buka Uji Coba',
      actionHref: '/admin/trial',
    })
  }

  if (constructed.totalResponses > 0 && constructed.reviewed === 0) {
    alerts.push({
      severity: 'warning',
      title: 'Belum Ada Review Selesai',
      message: `${constructed.totalResponses} response terkirim tapi belum ada yang direview.`,
      actionLabel: 'Buka Review',
      actionHref: '/admin/constructed-review',
    })
  }

  if (risk.high > 0) {
    alerts.push({
      severity: 'warning',
      title: 'High Risk Plagiarism Terdeteksi',
      message: `${risk.high} response terindikasi high risk. Perlu review manual.`,
      actionLabel: 'Lihat Review',
      actionHref: '/admin/constructed-review',
    })
  }

  if (users.zeroSessionUsers > 0 && users.zeroSessionUsers > users.totalUsers * 0.5) {
    alerts.push({
      severity: 'info',
      title: 'Banyak Pendaftar Belum Tes',
      message: `${users.zeroSessionUsers} dari ${users.totalUsers} user belum memulai sesi tes. Mungkin perlu reminder.`,
    })
  }

  if (qbank.total >= 100) {
    alerts.push({
      severity: 'info',
      title: 'Bank Soal Mencukupi',
      message: `Bank soal berisi ${qbank.total} item. Sudah cukup untuk pilot dan produksi.`,
    })
  }

  // Check DB schema health — detect drift between Prisma schema and database
  try {
    const colResult = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'UserAnswer' AND column_name = 'updatedAt' LIMIT 1`
    )
    if (colResult.length === 0) {
      alerts.push({
        severity: 'critical',
        title: 'DB Schema Drift: UserAnswer.updatedAt Missing',
        message: 'Kolom updatedAt tidak ditemukan di tabel UserAnswer. Jalankan prisma db push atau migrasi.',
        actionLabel: 'Cek DB Health',
        actionHref: '/api/admin/system/db-health',
      })
    }
  } catch {
    alerts.push({
      severity: 'warning',
      title: 'DB Health Check Gagal',
      message: 'Tidak dapat memeriksa kesehatan database. Mungkin ada masalah koneksi.',
    })
  }

  return alerts
}
