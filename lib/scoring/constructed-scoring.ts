import { getRubric, calculateConstructedScore, validateReviewerScore } from '@/lib/rubrics/bigt-constructed-rubrics'
import { REVIEW_STATUS, isBlockedFromFinalization } from '@/lib/scoring/review-status'
import { getPlagiarismResult } from '@/lib/plagiarism'

export interface ConstructedScoreInput {
  rubricRef: string
  dimensionScores: Record<string, number>
  responseText?: string | null
  responseAudioUrl?: string | null
  wordCount?: number | null
  audioDurationSec?: number | null
}

export interface ConstructedScoreOutput {
  rubricRef: string
  totalScore: number
  maxScore: number
  percentage: number
  band: 'below' | 'borderline' | 'pass' | 'strong'
  dimensions: Array<{
    id: string
    name: string
    nameId: string
    score: number
    maxScore: number
    comment?: string
  }>
  validationErrors: string[]
}

export function computeConstructedScore(input: ConstructedScoreInput): ConstructedScoreOutput {
  const { rubricRef, dimensionScores } = input

  const rubric = getRubric(rubricRef)
  if (!rubric) {
    return {
      rubricRef,
      totalScore: 0,
      maxScore: 0,
      percentage: 0,
      band: 'below',
      dimensions: [],
      validationErrors: [`Rubrik "${rubricRef}" tidak ditemukan.`],
    }
  }

  const validation = validateReviewerScore(rubricRef, dimensionScores)
  if (!validation.valid) {
    return {
      rubricRef,
      totalScore: 0,
      maxScore: rubric.maxScore,
      percentage: 0,
      band: 'below',
      dimensions: [],
      validationErrors: validation.errors,
    }
  }

  const scored = calculateConstructedScore(rubricRef, dimensionScores)

  const dimensions = rubric.dimensions.map(dim => ({
    id: dim.id,
    name: dim.name,
    nameId: dim.nameId,
    score: dimensionScores[dim.id] ?? 0,
    maxScore: 5,
    comment: dim.levels[dimensionScores[dim.id]]?.label || '',
  }))

  return {
    rubricRef,
    totalScore: scored.totalScore,
    maxScore: scored.maxScore,
    percentage: scored.percentage,
    band: scored.band as 'below' | 'borderline' | 'pass' | 'strong',
    dimensions,
    validationErrors: [],
  }
}

export function buildFinalScoreJson(
  reviewerScore: ConstructedScoreOutput,
  overrideBand?: string
): Record<string, any> {
  return {
    computedAt: new Date().toISOString(),
    totalScore: reviewerScore.totalScore,
    maxScore: reviewerScore.maxScore,
    percentage: reviewerScore.percentage,
    band: overrideBand || reviewerScore.band,
    dimensions: reviewerScore.dimensions,
  }
}

export function getConstructedResponseStatus(response: {
  responseStatus: string
  reviewerScoreJson?: any
  finalScoreJson?: any
}): string {
  if (response.finalScoreJson) return REVIEW_STATUS.REVIEWED
  if (response.reviewerScoreJson) return REVIEW_STATUS.UNDER_REVIEW
  return response.responseStatus || REVIEW_STATUS.SUBMITTED
}

/**
 * Check if a constructed response can be finalized (set finalScoreJson).
 * Returns true only if all conditions pass.
 */
export function canFinalizeConstructedResponse(response: {
  responseStatus: string
  reviewerScoreJson?: unknown
  responseText?: string | null
  hasAudio?: boolean
  wordCount?: number | null
}): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = []

  if (isBlockedFromFinalization(response.responseStatus)) {
    blockers.push(`Status "${response.responseStatus}" menghalangi finalisasi.`)
  }

  if (!response.reviewerScoreJson) {
    blockers.push('Skor reviewer belum diisi.')
  }

  const text = response.responseText
  if (text !== undefined && text !== null && text.trim().length < 3) {
    blockers.push('Response terlalu pendek.')
  }

  if (response.hasAudio === false && response.responseStatus !== 'draft') {
    blockers.push('Tidak ada audio untuk response berbicara.')
  }

  return { allowed: blockers.length === 0, blockers }
}

/**
 * Check if a constructed response can be included in a certificate.
 * Requires finalScoreJson, reviewed status, no unresolved issues.
 */
export function canIncludeConstructedInCertificate(response: {
  responseStatus: string
  finalScoreJson?: unknown
  feedback?: string | null
}): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = []

  if (response.responseStatus !== REVIEW_STATUS.REVIEWED) {
    blockers.push('Response belum direview dan difinalisasi.')
  }

  if (!response.finalScoreJson) {
    blockers.push('finalScoreJson belum tersedia.')
  }

  return { allowed: blockers.length === 0, blockers }
}

/**
 * Get all review blockers for display in admin UI.
 */
export async function getConstructedReviewBlockers(response: {
  id: string
  responseStatus: string
  reviewerScoreJson?: unknown
  finalScoreJson?: unknown
  responseText?: string | null
  wordCount?: number | null
  feedback?: string | null
  hasAudio?: boolean
  dimension?: string | null
  rubricRef?: string | null
}): Promise<string[]> {
  const blockers: string[] = []

  if (isBlockedFromFinalization(response.responseStatus)) {
    if (response.responseStatus === REVIEW_STATUS.FLAGGED) {
      blockers.push('Perlu pemeriksaan — status ditandai.')
    } else if (response.responseStatus === REVIEW_STATUS.NEEDS_SECOND_REVIEW) {
      blockers.push('Butuh review kedua.')
    } else if (response.responseStatus === REVIEW_STATUS.REJECTED) {
      blockers.push('Tidak dapat dinilai — status ditolak.')
    }
  }

  if (response.responseStatus === REVIEW_STATUS.SUBMITTED && !response.reviewerScoreJson) {
    blockers.push('Skor reviewer belum diisi.')
  }

  if (response.responseStatus === REVIEW_STATUS.REVIEWED && !response.finalScoreJson) {
    blockers.push('finalScoreJson belum dibuat.')
  }

  const text = response.responseText
  if (text && text.trim().length < 3) {
    blockers.push('Response terlalu pendek.')
  }

  if (response.dimension === 'SPEAKING' && !response.hasAudio) {
    blockers.push('Audio tidak tersedia untuk response berbicara.')
  }

  try {
    const plagiarism = await getPlagiarismResult(response.id)
    if (plagiarism?.overallRisk === 'high') {
      blockers.push('Plagiarism/AI risk tinggi — periksa sebelum finalisasi.')
    }
  } catch {
    // Plagiarism check is best-effort
  }

  return blockers
}

/**
 * Normalizes a raw dimension score (0–5) to the rubric scale.
 * Clamps to 0–5 and returns an integer.
 */
export function normalizeRubricScore(raw: number): number {
  return Math.max(0, Math.min(5, Math.round(raw)))
}

/**
 * Sanitizes a question snapshot by removing admin-only fields.
 * Used to prevent leaking adminOnly, answer, explanation, scoringLogic etc. to participants.
 */
export function sanitizeSnapshot(snapshot: any): any {
  if (!snapshot) return null
  const copy = { ...snapshot }
  delete copy.answer
  delete copy.explanation
  delete copy.adminOnly
  delete copy.adminOnlyFields
  delete copy.sampleResponse
  delete copy.scoringNotes
  delete copy.scoringLogic
  delete copy.transcript
  delete copy.correctAnswer
  delete copy.correctOption
  return copy
}
