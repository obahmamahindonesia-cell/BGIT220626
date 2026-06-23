import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { profile: true },
    })

    if (!dbUser) {
      return NextResponse.json({ needsOnboarding: true })
    }

    return NextResponse.json({
      needsOnboarding: !dbUser.profile?.onboardingCompleted,
      profile: dbUser.profile || null,
      user: { name: dbUser.name, email: dbUser.email },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()

    const profile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: {
        age: body.age ?? null,
        profession: body.profession ?? null,
        targetLevel: body.targetLevel ?? null,
        testGoals: body.testGoals ?? [],
        hasPreviousTest: body.hasPreviousTest ?? false,
        previousTestType: body.previousTestType ?? null,
        learningDuration: body.learningDuration ?? null,
        estimatedLevel: body.estimatedLevel ?? null,
        preferredDuration: body.preferredDuration ?? 60,
        practiceMode: body.practiceMode ?? true,
        emailNotifications: body.emailNotifications ?? true,
        technicalCheckPassed: body.technicalCheckPassed ?? false,
        onboardingCompleted: body.onboardingCompleted ?? false,
      },
      create: {
        userId: dbUser.id,
        age: body.age ?? null,
        profession: body.profession ?? null,
        targetLevel: body.targetLevel ?? null,
        testGoals: body.testGoals ?? [],
        hasPreviousTest: body.hasPreviousTest ?? false,
        previousTestType: body.previousTestType ?? null,
        learningDuration: body.learningDuration ?? null,
        estimatedLevel: body.estimatedLevel ?? null,
        preferredDuration: body.preferredDuration ?? 60,
        practiceMode: body.practiceMode ?? true,
        emailNotifications: body.emailNotifications ?? true,
        technicalCheckPassed: body.technicalCheckPassed ?? false,
        onboardingCompleted: body.onboardingCompleted ?? false,
      },
    })

    return NextResponse.json({ ok: true, profile })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
