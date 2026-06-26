import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getQuestionsForTest } from '@/lib/question-bank/loadQuestionBank'
import type { Cefr, Skill } from '@/types/question-bank'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const cefr = (searchParams.get('cefr') || '').toUpperCase() as Cefr
    const skill = (searchParams.get('skill') || '').toLowerCase() as Skill
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const validCefr: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const validSkills: Skill[] = ['reading', 'listening', 'writing', 'speaking', 'integrated']

    if (!validCefr.includes(cefr)) {
      return NextResponse.json({ success: false, error: `CEFR "${cefr}" tidak valid.` }, { status: 400 })
    }
    if (!validSkills.includes(skill)) {
      return NextResponse.json({ success: false, error: `Skill "${skill}" tidak valid.` }, { status: 400 })
    }

    const questions = getQuestionsForTest({ cefr, skill, limit })

    return NextResponse.json({
      success: true,
      data: {
        cefr,
        skill,
        count: questions.length,
        questions,
      },
    })
  } catch (err: any) {
    console.error('Error fetching question bank:', err)
    return NextResponse.json({ success: false, error: 'Gagal memuat bank soal.' }, { status: 500 })
  }
}
