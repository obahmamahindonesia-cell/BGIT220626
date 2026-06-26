import { getLevelBlueprint, type LevelBlueprintId } from '@/lib/test-blueprint/bigtLevelBlueprint'

export interface ScoredItem {
  questionId: string
  cefr: string
  skill: string
  subskill: string
  difficulty: number
  isCorrect: boolean
  score: number
  maxScore: number
}

export interface LevelBreakdown {
  [cefr: string]: { correct: number; total: number; percent: number }
}

export interface SkillBreakdown {
  [skill: string]: { correct: number; total: number; percent: number }
}

export interface LevelExamResult {
  sessionId: string
  blueprintId: string
  targetLevel: string
  totalScore: number
  totalItems: number
  percentage: number
  resultLevel: string
  resultLabel: string
  readingScore: number
  readingTotal: number
  listeningScore: number
  listeningTotal: number
  levelBreakdown: LevelBreakdown
  skillBreakdown: SkillBreakdown
  recommendation: string
  canProceedTo: string | null
  skillFloorHit: boolean
}

export function resolveLevelExamResult(
  sessionId: string,
  blueprintId: string,
  scoredItems: ScoredItem[]
): LevelExamResult {
  const blueprint = getLevelBlueprint(blueprintId)
  const thresholds = blueprint?.scoring?.thresholds || [
    { minPercent: 75, level: 'A2+', label: 'A2+', recommendation: 'Peserta menunjukkan performa tinggi.' },
    { minPercent: 55, level: 'A2', label: 'A2', recommendation: 'Peserta memahami situasi sehari-hari.' },
    { minPercent: 35, level: 'A1', label: 'A1', recommendation: 'Peserta memahami informasi dasar.' },
    { minPercent: 0, level: 'PRE_A1', label: 'Pra-A1', recommendation: 'Mulai dari pengenalan dasar.' },
  ]
  const skillFloor = blueprint?.scoring?.skillFloor ?? 40

  const totalItems = scoredItems.length
  const totalScore = scoredItems.reduce((s, i) => s + i.score, 0)
  const maxPossible = scoredItems.reduce((s, i) => s + i.maxScore, 0)
  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0

  const readingItems = scoredItems.filter(i => i.skill === 'reading')
  const listeningItems = scoredItems.filter(i => i.skill === 'listening')
  const readingScore = readingItems.reduce((s, i) => s + i.score, 0)
  const readingTotal = readingItems.reduce((s, i) => s + i.maxScore, 0)
  const listeningScore = listeningItems.reduce((s, i) => s + i.score, 0)
  const listeningTotal = listeningItems.reduce((s, i) => s + i.maxScore, 0)

  const readingPct = readingTotal > 0 ? (readingScore / readingTotal) * 100 : 0
  const listeningPct = listeningTotal > 0 ? (listeningScore / listeningTotal) * 100 : 0

  const levelBreakdown: LevelBreakdown = {}
  const skillBreakdown: SkillBreakdown = {}

  for (const item of scoredItems) {
    if (!levelBreakdown[item.cefr]) {
      levelBreakdown[item.cefr] = { correct: 0, total: 0, percent: 0 }
    }
    levelBreakdown[item.cefr].total++
    if (item.isCorrect) levelBreakdown[item.cefr].correct++
  }
  for (const cefr of Object.keys(levelBreakdown)) {
    const b = levelBreakdown[cefr]
    b.percent = Math.round((b.correct / b.total) * 100)
  }

  if (!skillBreakdown['reading']) {
    skillBreakdown['reading'] = { correct: 0, total: 0, percent: 0 }
  }
  if (!skillBreakdown['listening']) {
    skillBreakdown['listening'] = { correct: 0, total: 0, percent: 0 }
  }
  for (const item of scoredItems) {
    skillBreakdown[item.skill].total++
    if (item.isCorrect) skillBreakdown[item.skill].correct++
  }
  for (const skill of Object.keys(skillBreakdown)) {
    const b = skillBreakdown[skill]
    b.percent = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0
  }

  let resultLevel = 'PRE_A1'
  let resultLabel = 'Pra-A1'
  let recommendation = thresholds[thresholds.length - 1].recommendation

  const skillFloorHit = readingPct < skillFloor || listeningPct < skillFloor

  for (const t of thresholds) {
    if (percentage >= t.minPercent) {
      resultLevel = t.level
      resultLabel = t.label
      recommendation = t.recommendation
      break
    }
  }

  if (skillFloorHit) {
    const lowestSkill = readingPct < listeningPct ? 'membaca' : 'mendengarkan'
    recommendation += ` Catatan: nilai ${lowestSkill} (${Math.round(Math.min(readingPct, listeningPct))}%) masih di bawah batas minimal. Disarankan penguatan di skill ${lowestSkill}.`

    if (resultLevel !== 'PRE_A1') {
      const floorThresholds = [...thresholds].reverse()
      for (const t of floorThresholds) {
        if (percentage <= t.minPercent + 10) {
          resultLevel = t.level
          resultLabel = t.label
          break
        }
      }
    }
  }

  let canProceedTo: string | null = null
  if (resultLevel === 'A2_STRONG' || resultLevel === 'A2_PLUS') {
    canProceedTo = 'B1 readiness check'
  } else if (resultLevel === 'A1_STRONG' || resultLevel === 'A1_ACHIEVED') {
    canProceedTo = 'A2 diagnostic'
  }

  return {
    sessionId,
    blueprintId,
    targetLevel: blueprint?.targetLevel || '',
    totalScore,
    totalItems,
    percentage,
    resultLevel,
    resultLabel,
    readingScore,
    readingTotal,
    listeningScore,
    listeningTotal,
    levelBreakdown,
    skillBreakdown,
    recommendation,
    canProceedTo,
    skillFloorHit,
  }
}

export function mapLevelToTestResultData(result: LevelExamResult) {
  return {
    overallLevel: result.resultLevel,
    overallScore: result.percentage,
    readingScore: result.readingTotal > 0 ? (result.readingScore / result.readingTotal) * 100 : null,
    listeningScore: result.listeningTotal > 0 ? (result.listeningScore / result.listeningTotal) * 100 : null,
    recommendations: {
      blueprintId: result.blueprintId,
      resultLevel: result.resultLevel,
      resultLabel: result.resultLabel,
      levelBreakdown: result.levelBreakdown,
      skillBreakdown: result.skillBreakdown,
      recommendation: result.recommendation,
      canProceedTo: result.canProceedTo,
      skillFloorHit: result.skillFloorHit,
    },
  }
}
