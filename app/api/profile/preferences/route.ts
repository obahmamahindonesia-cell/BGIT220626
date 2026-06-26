import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(request: NextRequest) {
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

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { targetLevel, currentLevel, testGoals, focusSkills, preferredDuration, practiceMode, preferredLanguage, emailNotifications, productUpdates, certificateVisibility } = body

    const updateData: any = {}

    const VALID_CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    if (targetLevel !== undefined) {
      if (!VALID_CEFR.includes(targetLevel)) {
        return NextResponse.json({ success: false, error: 'Level tidak valid.' }, { status: 400 })
      }
      updateData.targetLevel = targetLevel
    }

    if (currentLevel !== undefined) {
      if (!VALID_CEFR.includes(currentLevel)) {
        return NextResponse.json({ success: false, error: 'Level tidak valid.' }, { status: 400 })
      }
      updateData.currentLevel = currentLevel
    }

    if (testGoals !== undefined) {
      if (!Array.isArray(testGoals)) {
        return NextResponse.json({ success: false, error: 'Format tujuan tes tidak valid.' }, { status: 400 })
      }
      updateData.testGoals = testGoals
    }

    if (focusSkills !== undefined) {
      if (!Array.isArray(focusSkills)) {
        return NextResponse.json({ success: false, error: 'Format fokus kemahiran tidak valid.' }, { status: 400 })
      }
      updateData.focusSkills = focusSkills
    }

    if (preferredDuration !== undefined) {
      const validDurations = [15, 30, 45, 60, 90, 120]
      if (!validDurations.includes(preferredDuration)) {
        return NextResponse.json({ success: false, error: 'Durasi tidak valid.' }, { status: 400 })
      }
      updateData.preferredDuration = preferredDuration
    }

    if (practiceMode !== undefined) updateData.practiceMode = Boolean(practiceMode)
    if (preferredLanguage !== undefined) {
      if (!['id', 'en'].includes(preferredLanguage)) {
        return NextResponse.json({ success: false, error: 'Bahasa tidak valid.' }, { status: 400 })
      }
      updateData.preferredLanguage = preferredLanguage
    }
    if (emailNotifications !== undefined) updateData.emailNotifications = Boolean(emailNotifications)
    if (productUpdates !== undefined) updateData.productUpdates = Boolean(productUpdates)
    if (certificateVisibility !== undefined) {
      if (!['private', 'public', 'link_only'].includes(certificateVisibility)) {
        return NextResponse.json({ success: false, error: 'Visibilitas tidak valid.' }, { status: 400 })
      }
      updateData.certificateVisibility = certificateVisibility
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: dbUser.id },
        create: { userId: dbUser.id, ...updateData },
        update: updateData,
      })
    }

    return NextResponse.json({ success: true, message: 'Preferensi berhasil disimpan.' })
  } catch (err: any) {
    console.error('Error updating preferences:', err)
    return NextResponse.json({ success: false, error: 'Gagal menyimpan preferensi.' }, { status: 500 })
  }
}
