import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    if (!user) return NextResponse.json({ success: false, error: 'Anda harus masuk terlebih dahulu.' }, { status: 401 })

    const body = await request.json()

    const fullName = body.name ?? body.fullName ?? body.nama ?? user.user_metadata?.name ?? null

    if (body.age === undefined || body.age === null || !body.profession) {
      return NextResponse.json({ success: false, error: 'Data onboarding belum lengkap.' }, { status: 400 })
    }

    // Ensure User row exists (create if missing — handles new registrations)
    const dbUser = await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: { email: user.email!, name: fullName },
      create: {
        supabaseId: user.id,
        email: user.email!,
        name: fullName,
      },
    })

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

    // Also update supabase user metadata
    await supabase.auth.updateUser({
      data: { name: fullName, onboardingCompleted: true },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      profile: {
        fullName,
        age: profile.age,
        profession: profile.profession,
        onboardingCompleted: profile.onboardingCompleted,
      },
      redirectTo: '/dashboard',
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal menyimpan onboarding. Silakan coba lagi.' }, { status: 500 })
  }
}
