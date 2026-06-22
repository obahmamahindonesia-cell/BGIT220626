import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const waitlist = await prisma.waitlist.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ waitlist })
}
