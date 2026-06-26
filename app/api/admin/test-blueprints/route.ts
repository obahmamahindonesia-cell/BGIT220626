import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { listBlueprints, getBlueprint } from '@/lib/test-blueprint/bigtBlueprint'
import { getLevelBlueprint, listLevelBlueprints } from '@/lib/test-blueprint/bigtLevelBlueprint'
import { selectItemsForBlueprint, checkAudioAvailability } from '@/lib/test-assembly/selectTestItems'
import { selectLevelExamItems } from '@/lib/test-assembly/selectLevelExamItems'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const legacy = getBlueprint(id)
    const level = getLevelBlueprint(id)
    const blueprint = legacy || level
    if (!blueprint) {
      return NextResponse.json({ success: false, error: 'Blueprint tidak ditemukan.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: blueprint })
  }

  const legacy = listBlueprints()
  const level = listLevelBlueprints().map(b => ({
    id: b.id,
    name: b.label,
    description: b.description,
    totalItems: b.totalItems,
    estimatedDurationMinutes: b.estimatedDurationMinutes,
  }))
  return NextResponse.json({ success: true, data: [...legacy, ...level] })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { blueprintId, runs = 1 } = body

  if (!blueprintId) {
    return NextResponse.json({ success: false, error: 'blueprintId wajib diisi.' }, { status: 400 })
  }

  const levelBp = getLevelBlueprint(blueprintId)
  const legacyBp = levelBp ? null : getBlueprint(blueprintId)
  const blueprint = levelBp || legacyBp

  if (!blueprint) {
    return NextResponse.json({ success: false, error: `Blueprint "${blueprintId}" tidak ditemukan.` }, { status: 400 })
  }

  const isLevel = !!levelBp
  const runResults: any[] = []

  for (let r = 0; r < Math.min(runs, 20); r++) {
    const assembly = isLevel ? selectLevelExamItems(levelBp!) : selectItemsForBlueprint(legacyBp!)

    // Check for audio files
    let audioOk = true
    let audioMissingCount = 0
    for (const item of assembly.items) {
      if (item.audioUrl) {
        const audioPath = path.resolve(process.cwd(), 'public', item.audioUrl.replace(/^\//, ''))
        if (!fs.existsSync(audioPath)) {
          audioOk = false
          audioMissingCount++
        }
      }
    }

    const hasAnswerLeak = assembly.items.some((i: any) =>
      'answer' in i || 'explanation' in i || 'transcript' in i || 'correctAnswer' in i || 'correctOption' in i || 'scoringLogic' in i
    )

    const idSet = new Set(assembly.items.map(i => i.questionId))
    const hasDuplicate = idSet.size !== assembly.items.length

    const setUsage = Object.entries(assembly.log.setUsage).sort((a, b) => b[1] - a[1])
    const maxFromOneSet = setUsage.length > 0 ? setUsage[0][1] : 0

    runResults.push({
      run: r + 1,
      totalItems: assembly.items.length,
      sections: assembly.sections.map(s => ({ skill: s.skill, count: s.items.length })),
      setUsage,
      maxFromOneSet,
      subskillDistribution: assembly.log.subskillDistribution,
      difficultyDistribution: assembly.log.difficultyDistribution,
      audioOk,
      audioMissing: audioMissingCount,
      hasAnswerLeak,
      hasDuplicate,
      warnings: assembly.log.warnings,
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      blueprintId,
      type: isLevel ? 'level' : 'legacy',
      runs: runResults.length,
      results: runResults,
    },
  })
}
