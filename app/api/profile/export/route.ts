import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
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
      include: {
        profile: true,
        testSessions: {
          include: { result: true, sessionItems: { include: { answer: true } } },
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: dbUser.id },
      orderBy: { issuedAt: 'desc' },
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        createdAt: dbUser.createdAt.toISOString(),
      },
      profile: dbUser.profile ? {
        age: dbUser.profile.age,
        profession: dbUser.profile.profession,
        country: dbUser.profile.country,
        city: dbUser.profile.city,
        firstLanguage: dbUser.profile.firstLanguage,
        bio: dbUser.profile.bio,
        institution: dbUser.profile.institution,
        occupation: dbUser.profile.occupation,
        targetLevel: dbUser.profile.targetLevel,
        currentLevel: dbUser.profile.currentLevel,
        testGoals: dbUser.profile.testGoals,
        focusSkills: dbUser.profile.focusSkills,
        preferredDuration: dbUser.profile.preferredDuration,
        practiceMode: dbUser.profile.practiceMode,
        certificateVisibility: dbUser.profile.certificateVisibility,
        onboardingCompleted: dbUser.profile.onboardingCompleted,
      } : null,
      testSessions: dbUser.testSessions.map(s => ({
        id: s.id,
        status: s.status,
        startedAt: s.startedAt.toISOString(),
        completedAt: s.completedAt?.toISOString() || null,
        questionCount: s.questionCount,
        answerCount: s.sessionItems.length,
        result: s.result ? {
          overallLevel: s.result.overallLevel,
          overallScore: s.result.overallScore,
          listeningScore: s.result.listeningScore,
          readingScore: s.result.readingScore,
          speakingScore: s.result.speakingScore,
          writingScore: s.result.writingScore,
        } : null,
      })),
      certificates: certificates.map(c => ({
        certificateId: c.certificateId,
        level: c.overallLevel,
        score: c.overallScore,
        issuedAt: c.issuedAt.toISOString(),
        isActive: c.isActive,
      })),
    }

    return NextResponse.json({ success: true, data: exportData })
  } catch (err: any) {
    console.error('Error exporting data:', err)
    return NextResponse.json({ success: false, error: 'Gagal mengekspor data.' }, { status: 500 })
  }
}
