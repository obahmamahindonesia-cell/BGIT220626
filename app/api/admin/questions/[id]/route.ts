import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const question = await prisma.questionItem.findUnique({
    where: { id: params.id },
    include: {
      options: { orderBy: { order: 'asc' } },
      stimulus: true,
      rubric: true,
      _count: { select: { sessionItems: true } },
    },
  })

  if (!question) {
    return NextResponse.json({ success: false, error: 'Soal tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: question })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { options, stimulus, ...questionFields } = body

  const question = await prisma.questionItem.update({
    where: { id: params.id },
    data: {
      ...questionFields,
      options: options
        ? {
            deleteMany: {},
            create: options.map((o: any, i: number) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect || false, order: i })),
          }
        : undefined,
    },
    include: { options: { orderBy: { order: 'asc' } }, stimulus: true },
  })

  return NextResponse.json({ success: true, data: question })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  // Soft delete - set to RETIRED
  await prisma.questionItem.update({
    where: { id: params.id },
    data: { status: 'RETIRED' },
  })

  return NextResponse.json({ success: true, message: 'Soal di-retire.' })
}
