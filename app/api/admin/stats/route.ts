import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const [totalQuestions, totalUsers, totalSessions, waitlistCount] = await Promise.all([
    prisma.questionItem.count(),
    prisma.user.count(),
    prisma.testSession.count(),
    prisma.waitlist.count({ where: { status: 'PENDING' } }),
  ])

  return NextResponse.json({
    totalQuestions,
    totalUsers,
    totalSessions,
    waitlistCount,
  })
}
