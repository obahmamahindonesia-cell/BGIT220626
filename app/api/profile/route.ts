import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

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

    let dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: { profile: true },
    })

    // Auto-create User row if missing (handles new registrations)
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || null,
        },
        include: { profile: true },
      })
    }

    const profile = dbUser.profile

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id,
        supabaseId: dbUser.supabaseId,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        avatarUrl: profile?.avatarUrl || authUser.user_metadata?.avatar_url || null,
        displayName: profile?.displayName || null,
        age: profile?.age || null,
        country: profile?.country || null,
        city: profile?.city || null,
        firstLanguage: profile?.firstLanguage || null,
        bio: profile?.bio || null,
        profession: profile?.profession || null,
        institution: profile?.institution || null,
        occupation: profile?.occupation || null,
        targetLevel: profile?.targetLevel || null,
        currentLevel: profile?.currentLevel || null,
        testGoals: profile?.testGoals || [],
        focusSkills: profile?.focusSkills || [],
        preferredDuration: profile?.preferredDuration || 60,
        practiceMode: profile?.practiceMode ?? true,
        preferredLanguage: profile?.preferredLanguage || 'id',
        timezone: profile?.timezone || null,
        certificateVisibility: profile?.certificateVisibility || 'private',
        emailNotifications: profile?.emailNotifications ?? true,
        productUpdates: profile?.productUpdates ?? true,
        onboardingCompleted: profile?.onboardingCompleted ?? false,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: (profile?.updatedAt || dbUser.updatedAt).toISOString(),
      },
    })
  } catch (err: any) {
    console.error('Error fetching profile:', err)
    return NextResponse.json({ success: false, error: 'Gagal memuat profil.' }, { status: 500 })
  }
}

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
    const { name, displayName, country, city, firstLanguage, bio, institution, occupation, timezone } = body

    if (name !== undefined) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { name: String(name).slice(0, 100) },
      })
      await supabase.auth.updateUser({ data: { name: String(name).slice(0, 100) } })
    }

    if (bio !== undefined && bio.length > 160) {
      return NextResponse.json({ success: false, error: 'Bio maksimal 160 karakter.' }, { status: 400 })
    }

    const updateData: any = {}
    if (displayName !== undefined) updateData.displayName = String(displayName).slice(0, 100)
    if (country !== undefined) updateData.country = String(country).slice(0, 100)
    if (city !== undefined) updateData.city = String(city).slice(0, 100)
    if (firstLanguage !== undefined) updateData.firstLanguage = String(firstLanguage).slice(0, 50)
    if (bio !== undefined) updateData.bio = String(bio).slice(0, 160)
    if (institution !== undefined) updateData.institution = String(institution).slice(0, 200)
    if (occupation !== undefined) updateData.occupation = String(occupation).slice(0, 200)
    if (timezone !== undefined) updateData.timezone = String(timezone).slice(0, 50)

    if (Object.keys(updateData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: dbUser.id },
        create: { userId: dbUser.id, ...updateData },
        update: updateData,
      })
    }

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui.' })
  } catch (err: any) {
    console.error('Error updating profile:', err)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui profil.' }, { status: 500 })
  }
}
