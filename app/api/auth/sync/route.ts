import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { supabaseId, email, name } = await request.json()

    if (!supabaseId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.user.upsert({
      where: { supabaseId },
      update: { email, name: name || undefined },
      create: { supabaseId, email, name: name || null },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error syncing user:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
