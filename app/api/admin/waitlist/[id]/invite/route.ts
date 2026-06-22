import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const waitlist = await prisma.waitlist.findUnique({
    where: { id: params.id },
  })

  if (!waitlist) {
    return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
  }

  if (waitlist.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Can only invite pending entries' },
      { status: 400 }
    )
  }

  await prisma.waitlist.update({
    where: { id: params.id },
    data: {
      status: 'INVITED',
      invitedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}
