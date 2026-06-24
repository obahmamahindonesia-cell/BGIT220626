import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const questions = await prisma.practiceQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: questions })
  } catch (err: any) {
    console.error('Error listing questions:', err)
    return NextResponse.json({ success: false, error: 'Gagal memuat daftar soal.' }, { status: 500 })
  }
}
