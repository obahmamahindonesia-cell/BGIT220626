export interface SelectionInput {
  product: string
  dimensions: string[]
  targetLevel: string
  questionCount: number
  excludeQuestionIds: string[]
}

export interface SelectionOutput {
  success: boolean
  questions: SelectedQuestion[]
  error?: string
  metadata: SelectionMetadata
}

export interface SelectedQuestion {
  id: string
  dimension: string
  subskill: string | null
  questionType: string
  level: string
  difficulty: number
  topic: string | null
  prompt: string | null
  instruction: string | null
  options: { label: string | null; text: string }[]
  correctAnswer: any
  explanation: string | null
  stimulus: { type: string; title: string | null; content: string | null; transcript: string | null } | null
  estimatedTime: number | null
  maxScore: number
  tags: string[]
}

export interface SelectionMetadata {
  totalAvailable: number
  totalRequested: number
  levelDistribution: Record<string, number>
  dimensionDistribution: Record<string, number>
  neighborLevelsUsed: boolean
}

const NEIGHBOR_MAP: Record<string, string[]> = {
  A1: ['A2'],
  A2: ['A1', 'B1'],
  B1: ['A2', 'B2'],
  B2: ['B1', 'C1'],
  C1: ['B2', 'C2'],
  C2: ['C1'],
}

const DIFFICULTY_RANGES: Record<string, [number, number]> = {
  A1: [1, 3],
  A2: [4, 6],
  B1: [7, 9],
  B2: [10, 12],
  C1: [13, 15],
  C2: [16, 18],
}

import { prisma } from '@/lib/prisma'

export async function selectQuestions(input: SelectionInput): Promise<SelectionOutput> {
  const {
    product,
    dimensions,
    targetLevel,
    questionCount,
    excludeQuestionIds,
  } = input

  if (!targetLevel || !Object.keys(DIFFICULTY_RANGES).includes(targetLevel.toUpperCase())) {
    return {
      success: false,
      questions: [],
      error: `Level target "${targetLevel}" tidak valid. Gunakan A1-C2.`,
      metadata: { totalAvailable: 0, totalRequested: questionCount, levelDistribution: {}, dimensionDistribution: {}, neighborLevelsUsed: false },
    }
  }

  if (!dimensions || dimensions.length === 0) {
    return {
      success: false,
      questions: [],
      error: 'Pilih minimal satu dimensi.',
      metadata: { totalAvailable: 0, totalRequested: questionCount, levelDistribution: {}, dimensionDistribution: {}, neighborLevelsUsed: false },
    }
  }

  const level = targetLevel.toUpperCase()
  const diffs = DIFFICULTY_RANGES[level]
  const targetBandMin = diffs[0]
  const targetBandMax = diffs[1]

  const diffRange = targetBandMax - targetBandMin + 1
  const targetCount = Math.round(questionCount * 0.6)
  const easyCount = Math.round(questionCount * 0.2)
  const hardCount = questionCount - targetCount - easyCount

  const baseWhere: any = {
    status: 'ACTIVE',
    dimension: { in: dimensions },
  }

  const targetWhere = {
    ...baseWhere,
    difficulty: { gte: targetBandMin, lte: targetBandMax },
  }

  const totalAvailable = await prisma.questionItem.count({ where: targetWhere })

  const neighborLevels = NEIGHBOR_MAP[level] || []
  let neighborLevelsUsed = false

  // Step 1: Try fetching from target level difficulty band
  const easyTargetWhere = { ...baseWhere, difficulty: { gte: targetBandMin, lte: targetBandMin + Math.floor(diffRange * 0.33) } }
  const hardTargetWhere = { ...baseWhere, difficulty: { gte: targetBandMax - Math.floor(diffRange * 0.33), lte: targetBandMax } }

  // Step 2: If not enough questions, expand to neighbor levels
  let easyWhere = easyTargetWhere
  let hardWhere = hardTargetWhere

  if (totalAvailable < questionCount) {
    const neighborDifficulties: number[] = []
    for (const nl of neighborLevels) {
      const [nMin, nMax] = DIFFICULTY_RANGES[nl]
      for (let d = nMin; d <= nMax; d++) neighborDifficulties.push(d)
    }

    if (neighborDifficulties.length > 0) {
      easyWhere = {
        ...baseWhere,
        difficulty: { in: neighborDifficulties.filter(d => d < targetBandMin).concat([targetBandMin, targetBandMin + 1]) },
      }
      hardWhere = {
        ...baseWhere,
        difficulty: { in: neighborDifficulties.filter(d => d > targetBandMax).concat([targetBandMax - 1, targetBandMax]) },
      }
      neighborLevelsUsed = true
    }
  }

  // Step 3: Fetch candidate pools
  const easyPool = await prisma.questionItem.findMany({
    where: { ...easyWhere, id: { notIn: excludeQuestionIds } },
    include: { options: { orderBy: { order: 'asc' } }, stimulus: true, statistics: true },
  })

  const targetPool = await prisma.questionItem.findMany({
    where: { ...targetWhere, id: { notIn: excludeQuestionIds } },
    include: { options: { orderBy: { order: 'asc' } }, stimulus: true, statistics: true },
  })

  const hardPool = await prisma.questionItem.findMany({
    where: { ...hardWhere, id: { notIn: excludeQuestionIds } },
    include: { options: { orderBy: { order: 'asc' } }, stimulus: true, statistics: true },
  })

  const totalAvailableAll = easyPool.length + targetPool.length + hardPool.length

  if (totalAvailableAll < questionCount) {
    return {
      success: false,
      questions: [],
      error: 'Bank soal belum cukup untuk konfigurasi ini. Tersedia: ' + totalAvailableAll + ', dibutuhkan: ' + questionCount + '.',
      metadata: { totalAvailable: totalAvailableAll, totalRequested: questionCount, levelDistribution: {}, dimensionDistribution: {}, neighborLevelsUsed },
    }
  }

  // Step 4: Apply constraints - avoid overexposed, vary topic, vary type
  const pickBalanced = (pool: any[], count: number): any[] => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const sorted = shuffled.sort((a, b) => (a.exposureCount || 0) - (b.exposureCount || 0))

    const picked: any[] = []
    const usedTopics = new Set<string>()
    const usedTypes = new Set<string>()

    for (const item of sorted) {
      if (picked.length >= count) break
      // Prefer items with different topics and types
      const topicKey = item.topic || 'untitled'
      if (usedTopics.size >= Math.min(count, 5) && usedTopics.has(topicKey)) continue
      if (usedTypes.size >= 3 && usedTypes.has(item.questionType)) continue

      picked.push(item)
      usedTopics.add(topicKey)
      usedTypes.add(item.questionType)
    }

    // If not enough, fill remaining
    if (picked.length < count) {
      for (const item of sorted) {
        if (picked.length >= count) break
        if (!picked.find(p => p.id === item.id)) picked.push(item)
      }
    }

    return picked
  }

  const easyQuestions = pickBalanced(easyPool, easyCount)
  const targetQuestions = pickBalanced(targetPool, targetCount)
  const hardQuestions = pickBalanced(hardPool, hardCount)

  // Combine and deduplicate
  const seenIds = new Set<string>()
  const combined = [...easyQuestions, ...targetQuestions, ...hardQuestions].filter(q => {
    if (seenIds.has(q.id)) return false
    seenIds.add(q.id)
    return true
  })

  // Trim to requested count
  const final = combined.slice(0, questionCount)

  // Shuffle
  const shuffled = final.sort(() => Math.random() - 0.5)

  // Build distribution metadata
  const levelDist: Record<string, number> = {}
  const dimDist: Record<string, number> = {}
  for (const q of shuffled) {
    levelDist[q.level] = (levelDist[q.level] || 0) + 1
    dimDist[q.dimension] = (dimDist[q.dimension] || 0) + 1
  }

  return {
    success: true,
    questions: shuffled.map(q => ({
      id: q.id,
      dimension: q.dimension,
      subskill: q.subskill,
      questionType: q.questionType,
      level: q.level,
      difficulty: q.difficulty,
      topic: q.topic,
      prompt: q.prompt,
      instruction: q.instruction,
      options: q.options.map((o: { label: string | null; text: string }) => ({ label: o.label, text: o.text })),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      stimulus: q.stimulus
        ? { type: q.stimulus.type, title: q.stimulus.title, content: q.stimulus.content, transcript: q.stimulus.transcript }
        : null,
      estimatedTime: q.estimatedTime,
      maxScore: 10,
      tags: q.tags,
    })),
    metadata: {
      totalAvailable: totalAvailableAll,
      totalRequested: questionCount,
      levelDistribution: levelDist,
      dimensionDistribution: dimDist,
      neighborLevelsUsed,
    },
  }
}
