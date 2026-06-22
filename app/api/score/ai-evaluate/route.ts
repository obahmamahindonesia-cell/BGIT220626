import { NextResponse } from 'next/server'
import { evaluateWithAI } from '@/lib/scoring/ai-scorer'

export async function POST(request: Request) {
  try {
    const { prompt, response, rubric } = await request.json()

    if (!prompt || !response) {
      return NextResponse.json({ error: 'Prompt dan response wajib diisi' }, { status: 400 })
    }

    const result = await evaluateWithAI(prompt, response, rubric)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Gagal melakukan evaluasi AI' }, { status: 500 })
  }
}
