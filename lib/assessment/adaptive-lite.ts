import { prisma } from '@/lib/prisma'
import { selectQuestions } from './question-selector'

interface AdaptiveStageResult {
  stage: number
  estimatedLevel: string
  confidence: number
  questions: any[]
  nextStageLevel: string | null
}

// 3-stage adaptive-lite for placement
// Stage 1: 5 B1 anchor questions
// Stage 2: 10 questions at adjusted level
// Stage 3: 10 confirmation questions

export async function runAdaptivePlacement(
  userId: string,
  _dimensions: string[],
  excludeIds: string[]
): Promise<{ stages: AdaptiveStageResult[]; finalLevel: string; sessionId: string; questions: any[] }> {
  const dimensions = _dimensions.length > 0 ? _dimensions : ['LISTENING', 'READING', 'SPEAKING', 'WRITING']

  // Stage 1: Anchor at B1
  const stage1Result = await selectQuestions({
    product: 'PLACEMENT',
    dimensions,
    targetLevel: 'B1',
    questionCount: 5,
    excludeQuestionIds: excludeIds,
  })

  if (!stage1Result.success) {
    throw new Error(stage1Result.error || 'Gagal mengambil soal stage 1.')
  }

  // Calculate accuracy for stage 1
  const stage1Accuracy = 0.6 // placeholder - real accuracy calculated after user answers

  const stage1Level = estimateLevelFromAccuracy(stage1Accuracy)
  const stage2Level = stage1Accuracy >= 0.7 ? 'B2' : stage1Accuracy >= 0.5 ? 'B1' : 'A2'

  // Stage 2: Adjust based on performance
  const stage2Result = await selectQuestions({
    product: 'PLACEMENT',
    dimensions,
    targetLevel: stage2Level,
    questionCount: 10,
    excludeQuestionIds: [...excludeIds, ...stage1Result.questions.map(q => q.id)],
  })

  if (!stage2Result.success) {
    throw new Error(stage2Result.error || 'Gagal mengambil soal stage 2.')
  }

  // Stage 3: Confirmation
  const stage2Accuracy = 0.6 // placeholder
  const stage3Level = estimateLevelFromAccuracy(stage2Accuracy)

  const stage3Result = await selectQuestions({
    product: 'PLACEMENT',
    dimensions,
    targetLevel: stage3Level,
    questionCount: 10,
    excludeQuestionIds: [...excludeIds, ...stage1Result.questions.map(q => q.id), ...stage2Result.questions.map(q => q.id)],
  })

  if (!stage3Result.success) {
    throw new Error(stage3Result.error || 'Gagal mengambil soal stage 3.')
  }

  const allQuestions = [...stage1Result.questions, ...stage2Result.questions, ...stage3Result.questions]

  // Final level estimation
  const finalAccuracy = 0.6 // placeholder - computed from real answers
  const finalLevel = estimateLevelFromAccuracy(finalAccuracy)

  return {
    stages: [
      { stage: 1, estimatedLevel: stage1Level, confidence: 0.5, questions: stage1Result.questions, nextStageLevel: stage2Level },
      { stage: 2, estimatedLevel: stage2Level, confidence: 0.7, questions: stage2Result.questions, nextStageLevel: stage3Level },
      { stage: 3, estimatedLevel: stage3Level, confidence: 0.85, questions: stage3Result.questions, nextStageLevel: null },
    ],
    finalLevel,
    sessionId: '',
    questions: allQuestions,
  }
}

function estimateLevelFromAccuracy(accuracy: number): string {
  if (accuracy >= 0.9) return 'C2'
  if (accuracy >= 0.8) return 'C1'
  if (accuracy >= 0.7) return 'B2'
  if (accuracy >= 0.6) return 'B1'
  if (accuracy >= 0.5) return 'A2'
  return 'A1'
}
