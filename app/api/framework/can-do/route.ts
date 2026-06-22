import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CEFRLevel, Dimension } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') as CEFRLevel | null
    const skill = searchParams.get('skill') as Dimension | null

    const where: any = {}
    if (level) where.level = level
    if (skill) where.skill = skill

    const descriptors = await prisma.canDoDescriptor.findMany({
      where,
      orderBy: [
        { level: 'asc' },
        { skill: 'asc' },
        { category: 'asc' },
      ],
    })

    return NextResponse.json({ descriptors })
  } catch (error) {
    console.error('Error fetching can-do descriptors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch can-do descriptors' },
      { status: 500 }
    )
  }
}
