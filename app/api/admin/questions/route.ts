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
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const where: any = {}
  if (dimension) where.dimension = dimension
  if (level) where.level = level
  if (status) where.status = status
  if (type) where.questionType = type
  if (search) {
    where.OR = [
      { prompt: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
      { code: { contains: search, mode: 'insensitive' } },
      { topic: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [questions, total] = await Promise.all([
    prisma.questionItem.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        options: { orderBy: { order: 'asc' } },
        stimulus: true,
        _count: { select: { sessionItems: true } },
      },
    }),
    prisma.questionItem.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: questions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()

  const { options, stimulus, ...questionFields } = body

  const question = await prisma.questionItem.create({
    data: {
      ...questionFields,
      options: options
        ? { create: options.map((o: any, i: number) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect || false, order: i })) }
        : undefined,
      stimulus: stimulus
        ? { connectOrCreate: { where: { id: stimulus.id || '' }, create: { type: stimulus.type || 'TEXT', title: stimulus.title, content: stimulus.content, transcript: stimulus.transcript } } }
        : undefined,
    },
    include: { options: { orderBy: { order: 'asc' } }, stimulus: true },
  })

  return NextResponse.json({ success: true, data: question })
}
