export interface ScoreInput {
  questionType: string
  correctAnswer: any
  userAnswer: any
  maxScore: number
}

export interface ScoreOutput {
  score: number
  isCorrect: boolean | null
  feedback: string
  status: 'AUTO_SCORED' | 'PENDING_REVIEW'
}

export function scoreQuestion(input: ScoreInput): ScoreOutput {
  const { questionType, correctAnswer, userAnswer, maxScore } = input

  if (questionType === 'MCQ') {
    const isCorrect = String(userAnswer) === String(correctAnswer)
    return {
      score: isCorrect ? maxScore : 0,
      isCorrect,
      feedback: isCorrect ? 'Jawaban benar.' : 'Jawaban salah.',
      status: 'AUTO_SCORED',
    }
  }

  if (questionType === 'SHORT_ANSWER') {
    const correct = String(correctAnswer || '').toLowerCase().trim()
    const user = String(userAnswer || '').toLowerCase().trim()
    const isCorrect = correct === user || user.includes(correct) || correct.includes(user)
    return {
      score: isCorrect ? maxScore : Math.round(maxScore * 0.2),
      isCorrect,
      feedback: isCorrect
        ? 'Jawaban sesuai dengan kunci.'
        : 'Jawaban tidak sesuai dengan kunci yang diharapkan.',
      status: 'AUTO_SCORED',
    }
  }

  if (['ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK'].includes(questionType)) {
    return {
      score: 0,
      isCorrect: null,
      feedback: 'Jawaban akan dinilai oleh pengajar.',
      status: 'PENDING_REVIEW',
    }
  }

  return {
    score: 0,
    isCorrect: null,
    feedback: 'Tipe soal belum didukung untuk penilaian otomatis.',
    status: 'PENDING_REVIEW',
  }
}

export function calculateCEFR(scorePercent: number): string {
  const thresholds = [
    { level: 'C2', minScore: 90 },
    { level: 'C1', minScore: 75 },
    { level: 'B2', minScore: 60 },
    { level: 'B1', minScore: 45 },
    { level: 'A2', minScore: 30 },
    { level: 'A1', minScore: 0 },
  ]
  for (const t of thresholds) {
    if (scorePercent >= t.minScore) return t.level
  }
  return 'A1'
}

export function needsHumanReview(questionType: string): boolean {
  return ['ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK'].includes(questionType)
}

export function calculateDimensionScores(
  items: { dimension: string; score: number | null; maxScore: number }[]
): Record<string, { average: number; count: number; total: number; maxPossible: number }> {
  const dims: Record<string, { scores: number[]; maxScores: number[] }> = {}

  for (const item of items) {
    if (!dims[item.dimension]) {
      dims[item.dimension] = { scores: [], maxScores: [] }
    }
    if (item.score !== null) {
      dims[item.dimension].scores.push(item.score)
    }
    dims[item.dimension].maxScores.push(item.maxScore)
  }

  const result: Record<string, any> = {}
  for (const [dim, data] of Object.entries(dims)) {
    const totalScore = data.scores.reduce((a, b) => a + b, 0)
    const totalMax = data.maxScores.reduce((a, b) => a + b, 0)
    result[dim] = {
      average: data.scores.length > 0 ? totalScore / data.scores.length : 0,
      count: data.scores.length,
      total: totalScore,
      maxPossible: totalMax,
      percent: totalMax > 0 ? (totalScore / totalMax) * 100 : 0,
    }
  }

  return result
}
