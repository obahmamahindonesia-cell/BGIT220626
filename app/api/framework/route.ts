import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SKILL_NAMES: Record<string, string> = {
  LISTENING: 'Menyimak',
  READING: 'Membaca',
  SPEAKING: 'Berbicara',
  WRITING: 'Menulis',
  MEDIATION: 'Mediasi',
  INTEGRATED: 'Tugas Terintegrasi',
}

export async function GET() {
  try {
    const levels = [
      { code: 'A1', name: 'Pemula', description: 'Dapat memahami dan menggunakan ekspresi sehari-hari yang familiar dan frasa sangat dasar' },
      { code: 'A2', name: 'Dasar', description: 'Dapat berkomunikasi dalam tugas sederhana dan rutin yang memerlukan pertukaran informasi sederhana' },
      { code: 'B1', name: 'Madya', description: 'Dapat menangani sebagian besar situasi yang mungkin ditemui saat bepergian di area di mana bahasa tersebut digunakan' },
      { code: 'B2', name: 'Madya Atas', description: 'Dapat berinteraksi dengan tingkat kelancaran dan spontanitas yang memungkinkan interaksi reguler dengan penutur asli' },
      { code: 'C1', name: 'Mahir', description: 'Dapat menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial, akademis, dan profesional' },
      { code: 'C2', name: 'Sangat Mahir', description: 'Dapat mengekspresikan diri secara spontan, sangat lancar dan tepat, membedakan nuansa makna yang lebih halus' },
    ]

    const skills = [
      { code: 'LISTENING', name: 'Menyimak' },
      { code: 'READING', name: 'Membaca' },
      { code: 'SPEAKING', name: 'Berbicara' },
      { code: 'WRITING', name: 'Menulis' },
      { code: 'MEDIATION', name: 'Mediasi' },
      { code: 'INTEGRATED', name: 'Tugas Terintegrasi' },
    ]

    const levelsWithDescriptors = await Promise.all(
      levels.map(async (level) => {
        const descriptors = await prisma.canDoDescriptor.findMany({
          where: { level: level.code as any },
          orderBy: [{ skill: 'asc' }, { category: 'asc' }],
        })

        const descriptorsBySkill = skills.reduce((acc, skill) => {
          acc[skill.code] = descriptors.filter(d => d.skill === skill.code)
          return acc
        }, {} as Record<string, any[]>)

        return {
          ...level,
          descriptorsBySkill,
        }
      })
    )

    return NextResponse.json({
      levels: levelsWithDescriptors,
      skills,
    })
  } catch (error) {
    console.error('Error fetching framework:', error)
    return NextResponse.json(
      { error: 'Failed to fetch framework' },
      { status: 500 }
    )
  }
}
