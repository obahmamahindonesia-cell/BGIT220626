import { NextResponse } from 'next/server'
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

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: {
        profile: true,
        testSessions: {
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const lastTest = dbUser.testSessions[0] || null

    const lastCertificate = await prisma.certificate.findFirst({
      where: { userId: dbUser.id },
      orderBy: { issuedAt: 'desc' },
    })

    const lastLogin = authUser.last_sign_in_at || null

    return NextResponse.json({
      success: true,
      data: {
        lastTest: lastTest
          ? { id: lastTest.id, status: lastTest.status, startedAt: lastTest.startedAt.toISOString() }
          : null,
        lastCertificate: lastCertificate
          ? { id: lastCertificate.id, certificateId: lastCertificate.certificateId, level: lastCertificate.overallLevel, issuedAt: lastCertificate.issuedAt.toISOString() }
          : null,
        lastLogin: lastLogin,
        memberSince: dbUser.createdAt.toISOString(),
      },
    })
  } catch (err: any) {
    console.error('Error fetching activity:', err)
    return NextResponse.json({ success: false, error: 'Gagal memuat aktivitas.' }, { status: 500 })
  }
}
