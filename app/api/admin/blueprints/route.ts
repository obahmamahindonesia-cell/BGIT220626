import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { seedBlueprints } from '@/lib/blueprints'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  await seedBlueprints()

  const blueprints = await prisma.testBlueprint.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ success: true, data: blueprints })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()

  const blueprint = await prisma.testBlueprint.create({ data: body })

  return NextResponse.json({ success: true, data: blueprint })
}
