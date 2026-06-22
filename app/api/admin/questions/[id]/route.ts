import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { answers: true },
      },
    },
  })

  if (!question) {
    return NextResponse.json(
      { error: 'Question not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ question })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()

  const question = await prisma.question.update({
    where: { id: params.id },
    data: {
      dimension: body.dimension,
      skill: body.skill,
      subskill: body.subskill,
      type: body.type,
      level: body.level,
      difficulty: body.difficulty,
      content: body.content,
      rubric: body.rubric,
      tags: body.tags,
      points: body.points,
      isActive: body.isActive,
    },
  })

  return NextResponse.json({ question })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  await prisma.question.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
