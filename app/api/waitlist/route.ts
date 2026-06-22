import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, institution, role } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const existing = await prisma.waitlist.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    const waitlist = await prisma.waitlist.create({
      data: {
        name,
        email,
        institution: institution || null,
        role: role || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      waitlist,
    })
  } catch (error: any) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  const waitlist = await prisma.waitlist.findUnique({
    where: { email },
  })

  if (!waitlist) {
    return NextResponse.json(
      { error: 'Email not found on waitlist' },
      { status: 404 }
    )
  }

  return NextResponse.json({ waitlist })
}
