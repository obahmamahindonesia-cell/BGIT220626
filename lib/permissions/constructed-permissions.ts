/**
 * BIGT Constructed Response Permission Helpers
 *
 * All permissions return boolean; no role migration needed yet.
 * Currently only ADMIN can review/finalize/issue.
 * Future roles (REVIEWER, SENIOR_REVIEWER, CERTIFICATION_ADMIN)
 * can be added here without touching other files.
 */

import type { UserRole } from '@prisma/client'

/** Whether a user can review constructed responses (score + feedback) */
export function canReviewConstructedResponse(role: UserRole): boolean {
  return role === 'ADMIN'
}

/** Whether a user can finalize a constructed response score (set finalScoreJson) */
export function canFinalizeConstructedScore(role: UserRole): boolean {
  return role === 'ADMIN'
}

/** Whether a user can manually issue a certificate */
export function canIssueCertificate(role: UserRole): boolean {
  return role === 'ADMIN'
}

/** Whether a user can override a flagged/rejected status */
export function canOverrideStatus(role: UserRole): boolean {
  return role === 'ADMIN'
}

/** Whether a user can view internal notes (reviewer-only data) */
export function canViewInternalNotes(role: UserRole): boolean {
  return role === 'ADMIN'
}

/** Whether a user can delete/reject constructed responses */
export function canRejectResponse(role: UserRole): boolean {
  return role === 'ADMIN'
}
