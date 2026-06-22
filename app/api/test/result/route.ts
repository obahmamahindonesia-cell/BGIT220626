import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID wajib diisi' }, { status: 400 })
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { result: true },
    })

    if (!testSession) {
      return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      session: {
        id: testSession.id,
        status: testSession.status,
        startedAt: testSession.startedAt,
        finishedAt: testSession.finishedAt,
        durationSeconds: testSession.durationSeconds,
      },
      result: testSession.result,
    })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
