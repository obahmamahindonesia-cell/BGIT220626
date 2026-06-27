/**
 * Constructed Response Feature Flag
 *
 * Controls whether writing/speaking/integrated/mediation items
 * are available in the default exam flow.
 *
 * DEV_MODE=true → allow manual testing via API/test pages
 * LIVE_LOCK=false → writing/speaking NOT in default live exam
 *
 * When ready for production:
 *   set LIVE_LOCK=false (still locked — change to true only after mass production + review)
 *   DEV_MODE remains true for admin testing
 */

export const CONSTRUCTED_RESPONSE = {
  /** Enable constructed response in development/testing flows */
  DEV_MODE: process.env.NODE_ENV !== 'production' || process.env.CONSTRUCTED_DEV === 'true',

  /**
   * LOCK: When LIVE_LOCK is true, constructed response IS active in live exams.
   * Default: false — keep locked until writing/speaking content and review workflow are production-ready.
   */
  LIVE_LOCK: false,

  /**
   * Enable trial mode for admin/internal exam with Writing + Speaking.
   * When false, trial API will reject requests.
   */
  CONSTRUCTED_TRIAL_MODE_ENABLED: true,

  /**
   * Skills that are available for dev testing but NOT in live exam.
   */
  futureSkills: ['writing', 'speaking', 'mediation', 'integrated'] as const,

  /**
   * Skills active in the live default exam.
   */
  activeSkills: ['reading', 'listening'] as const,
} as const

export function isConstructedActive(): boolean {
  return CONSTRUCTED_RESPONSE.DEV_MODE || CONSTRUCTED_RESPONSE.LIVE_LOCK
}

export function isSkillActiveInLive(skill: string): boolean {
  return CONSTRUCTED_RESPONSE.activeSkills.includes(skill as any)
}
