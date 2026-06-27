/**
 * BIGT Review Status Lifecycle
 *
 * Defines the valid statuses and transitions for constructed response review.
 *
 * Lifecycle:
 *   draft → submitted → under_review → reviewed  (happy path)
 *                     → under_review → needs_second_review → under_review → reviewed
 *                     → flagged → reviewed | rejected
 *                     → rejected (terminal — not scorable)
 *
 * Rules:
 * - `reviewed` only if all rubric dimensions scored
 * - `finalScoreJson` only set when status becomes `reviewed`
 * - `flagged` does NOT auto-fail — reviewer decision required
 * - `needs_second_review` must be resolved before finalization
 * - `rejected` requires reviewer reason in `internalNotes`
 */

export const REVIEW_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  REVIEWED: 'reviewed',
  NEEDS_SECOND_REVIEW: 'needs_second_review',
  FLAGGED: 'flagged',
  REJECTED: 'rejected',
} as const

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]

/** Statuses that mean review is not yet complete */
export const PENDING_REVIEW_STATUSES: ReviewStatus[] = [
  REVIEW_STATUS.DRAFT,
  REVIEW_STATUS.SUBMITTED,
  REVIEW_STATUS.UNDER_REVIEW,
  REVIEW_STATUS.NEEDS_SECOND_REVIEW,
  REVIEW_STATUS.FLAGGED,
]

/** Statuses that prevent finalization */
export const BLOCKED_FROM_FINALIZATION: ReviewStatus[] = [
  REVIEW_STATUS.NEEDS_SECOND_REVIEW,
  REVIEW_STATUS.FLAGGED,
  REVIEW_STATUS.REJECTED,
]

/** Statuses visible to participant as "in progress" */
export const IN_PROGRESS_LABELS: Record<string, string> = {
  [REVIEW_STATUS.SUBMITTED]: 'Jawaban kamu sudah terkirim. Menunggu penilaian reviewer.',
  [REVIEW_STATUS.UNDER_REVIEW]: 'Jawaban sedang dinilai.',
  [REVIEW_STATUS.NEEDS_SECOND_REVIEW]: 'Jawaban sedang diperiksa kembali.',
  [REVIEW_STATUS.FLAGGED]: 'Jawaban sedang diperiksa lebih lanjut.',
  [REVIEW_STATUS.REJECTED]: 'Jawaban tidak dapat dinilai.',
}

export function isValidReviewStatus(value: string): value is ReviewStatus {
  return Object.values(REVIEW_STATUS).includes(value as ReviewStatus)
}

export function isPendingReview(status: string): boolean {
  return PENDING_REVIEW_STATUSES.includes(status as ReviewStatus)
}

export function isBlockedFromFinalization(status: string): boolean {
  return BLOCKED_FROM_FINALIZATION.includes(status as ReviewStatus)
}

export function getParticipantStatusMessage(status: string): string {
  return IN_PROGRESS_LABELS[status] || 'Menunggu pemeriksaan.'
}

/**
 * Determines the effective review status based on stored data.
 * Derives `reviewed`/`under_review` from presence of score json
 * if the raw status is still `submitted`.
 */
export function getEffectiveReviewStatus(response: {
  responseStatus: string
  reviewerScoreJson?: unknown
  finalScoreJson?: unknown
}): string {
  if (response.finalScoreJson) return REVIEW_STATUS.REVIEWED
  if (response.reviewerScoreJson) return REVIEW_STATUS.UNDER_REVIEW
  return response.responseStatus || REVIEW_STATUS.SUBMITTED
}
