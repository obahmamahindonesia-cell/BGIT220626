import { CEFRLevel } from '@/types'

export function calculateCEFRLevel(percentage: number): CEFRLevel {
  if (percentage < 30) return 'A1'
  if (percentage < 45) return 'A2'
  if (percentage < 60) return 'B1'
  if (percentage < 75) return 'B2'
  if (percentage < 90) return 'C1'
  return 'C2'
}

export function calculateTOEFLEquivalent(percentage: number): number {
  return Math.round((percentage / 100) * 120)
}

export function calculateIELTSEquivalent(percentage: number): number {
  const band = (percentage / 100) * 9
  return Math.round(band * 2) / 2
}

export function calculateDimensionScore(
  answers: Array<{ rawScore: number | null; aiScore: number | null; question: { points: number } }>
): number {
  if (answers.length === 0) return 0
  
  const totalPoints = answers.reduce((sum, a) => sum + a.question.points, 0)
  const earnedPoints = answers.reduce((sum, a) => {
    const score = a.aiScore ?? a.rawScore ?? 0
    return sum + (score / 10) * a.question.points
  }, 0)
  
  return (earnedPoints / totalPoints) * 100
}
