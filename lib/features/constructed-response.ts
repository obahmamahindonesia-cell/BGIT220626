/**
 * Constructed Response Feature Flag
 *
 * Controls whether writing/speaking/integrated/mediation items
 * are available in the default exam flow.
 *
 * LIVE_LOCK=true → writing/speaking active in live A1/A2 exams.
 * futureSkills retained for mediation/integrated (not yet produced).
 */

export const CONSTRUCTED_RESPONSE = {
  /** Enable constructed response in development/testing flows */
  DEV_MODE: process.env.NODE_ENV !== 'production' || process.env.CONSTRUCTED_DEV === 'true',

  /**
   * LOCK: When LIVE_LOCK is true, constructed response IS active in live exams.
   * Set to true — writing/speaking content is production-ready.
   */
  LIVE_LOCK: true,

  /**
   * Enable trial mode for admin/internal exam with Writing + Speaking.
   * When false, trial API will reject requests.
   */
  CONSTRUCTED_TRIAL_MODE_ENABLED: true,

  /**
   * Skills not yet available in the live exam (no content produced).
   */
  futureSkills: ['mediation', 'integrated'] as const,

  /**
   * Skills active in the live default exam.
   */
  activeSkills: ['reading', 'listening', 'writing', 'speaking'] as const,
} as const

export function isConstructedActive(): boolean {
  return CONSTRUCTED_RESPONSE.DEV_MODE || CONSTRUCTED_RESPONSE.LIVE_LOCK
}

export function isSkillActiveInLive(skill: string): boolean {
  return CONSTRUCTED_RESPONSE.activeSkills.includes(skill as any)
}
