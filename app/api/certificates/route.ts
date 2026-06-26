import { NextRequest, NextResponse } from 'next/server'
import { createCertificate } from '@/lib/certificate'
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

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: dbUser.id, isActive: true },
      orderBy: { issuedAt: 'desc' },
      include: { testResult: true },
    })

    return NextResponse.json({
      success: true,
      data: certificates.map(c => ({
        id: c.id,
        certificateId: c.certificateId,
        overallLevel: c.overallLevel,
        overallScore: c.overallScore,
        issuedAt: c.issuedAt.toISOString(),
        qrCodeUrl: c.qrCodeUrl,
        pdfUrl: c.pdfUrl,
        isActive: c.isActive,
        result: c.testResult
          ? {
              overallLevel: c.testResult.overallLevel,
              overallScore: c.testResult.overallScore,
              listeningScore: c.testResult.listeningScore,
              readingScore: c.testResult.readingScore,
              speakingScore: c.testResult.speakingScore,
              writingScore: c.testResult.writingScore,
              mediationScore: c.testResult.mediationScore,
              integratedScore: c.testResult.integratedScore,
            }
          : null,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching certificates:', err)
    return NextResponse.json({ success: false, error: 'Gagal memuat sertifikat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await request.json()
  const { testResultId } = body

  const testResult = await prisma.testResult.findUnique({
    where: { id: testResultId },
    include: {
      session: true,
    },
  })

  if (!testResult) {
    return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
  }

  if (testResult.session.userId !== dbUser.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const certificate = await createCertificate(testResultId)
    return NextResponse.json({ certificate })
  } catch (error: any) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}
