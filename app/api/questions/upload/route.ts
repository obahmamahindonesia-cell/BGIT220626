import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { uploadQuestionPdf } from '@/lib/supabase/storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
      },
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const dimension = formData.get('dimension') as string
    const cefrLevel = formData.get('cefrLevel') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const difficulty = formData.get('difficulty') as string
    const tagsRaw = formData.get('tags') as string

    if (!file || !dimension || !cefrLevel || !title) {
      return NextResponse.json({
        success: false,
        error: 'File, dimensi, level CEFR, dan judul wajib diisi.',
      }, { status: 400 })
    }

    const validDims = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED']
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    if (!validDims.includes(dimension) || !validLevels.includes(cefrLevel)) {
      return NextResponse.json({ success: false, error: 'Dimensi atau level CEFR tidak valid.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const { path: storagePath } = await uploadQuestionPdf(buffer, fileName)

    const tags = tagsRaw
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const question = await prisma.practiceQuestion.create({
      data: {
        dimension: dimension as any,
        cefrLevel: cefrLevel as any,
        title,
        description: description || null,
        pdfUrl: storagePath,
        storagePath,
        difficulty: difficulty ? parseInt(difficulty, 10) : 3,
        tags,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: question,
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Gagal mengunggah soal.',
    }, { status: 500 })
  }
}
