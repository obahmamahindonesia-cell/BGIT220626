import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()

  const blueprint = await prisma.testBlueprint.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json({ success: true, data: blueprint })
}
