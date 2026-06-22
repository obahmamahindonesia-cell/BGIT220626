import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const dimension = searchParams.get('dimension')
  const level = searchParams.get('level')
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const where: any = {}
  if (dimension) where.dimension = dimension
  if (level) where.level = level
  if (type) where.type = type
  if (search) {
    where.OR = [
      { content: { path: ['prompt'], string_contains: search } },
      { tags: { has: search } },
    ]
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.question.count({ where }),
  ])

  return NextResponse.json({
    questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()
  
  const question = await prisma.question.create({
    data: {
      dimension: body.dimension,
      skill: body.skill,
      subskill: body.subskill,
      type: body.type,
      level: body.level,
      difficulty: body.difficulty || 3,
      content: body.content,
      rubric: body.rubric,
      tags: body.tags || [],
      points: body.points || 10,
    },
  })

  return NextResponse.json({ question })
}
