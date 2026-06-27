/**
 * BIGT Certification Policy
 *
 * Defines live vs future certification policy for skill weighting,
 * certificate eligibility, and review requirements.
 *
 * CURRENT: Only Reading + Listening are live. Writing/Speaking disabled.
 * FUTURE: Full 4-skill certificate with equal weighting.
 *         NOT YET ACTIVE — do NOT enable in production.
 */

export interface SkillWeighting {
  reading: number
  listening: number
  writing: number
  speaking: number
  mediation?: number
  integrated?: number
}

export interface CertificationPolicy {
  /** Skills included in the live, public exam */
  liveSkills: string[]
  /** Whether constructed responses (writing/speaking) are enabled in live */
  constructedSkillsEnabledInLive: boolean
  /** Whether trial sessions can produce certificates */
  trialCanIssueCertificate: boolean
  /** Whether constructed responses require manual review before counting */
  requireManualReviewForConstructed: boolean
  /** Whether plagiarism/AI detection auto-fails (false = reviewer assistance only) */
  antiCheatingAutoFail: boolean
  /** Minimum overall score (percentage) to qualify for a certificate */
  minCertificatePercentage: number
  /** Skill weighting for overall score calculation */
  weighting: SkillWeighting
}

export const BIGT_CURRENT_CERTIFICATION_POLICY: CertificationPolicy = {
  liveSkills: ['reading', 'listening'],
  constructedSkillsEnabledInLive: false,
  trialCanIssueCertificate: false,
  requireManualReviewForConstructed: true,
  antiCheatingAutoFail: false,
  minCertificatePercentage: 0,
  weighting: {
    reading: 0.5,
    listening: 0.5,
    writing: 0,
    speaking: 0,
  },
}

export const BIGT_FUTURE_FULL_SKILLS_POLICY: CertificationPolicy = {
  liveSkills: ['reading', 'listening', 'writing', 'speaking'],
  constructedSkillsEnabledInLive: true,
  trialCanIssueCertificate: false,
  requireManualReviewForConstructed: true,
  antiCheatingAutoFail: false,
  minCertificatePercentage: 30,
  weighting: {
    reading: 0.25,
    listening: 0.25,
    writing: 0.25,
    speaking: 0.25,
  },
}

/** Whether full-skills certification is active (always false until ready) */
export const BIGT_FULL_SKILLS_CERTIFICATE_ACTIVE = false

/** Helper: check if session can produce a certificate */
export function canSessionIssueCertificate(product: string | null | undefined): boolean {
  if (!product) return true
  if (BIGT_CURRENT_CERTIFICATION_POLICY.trialCanIssueCertificate) return true
  return !['TRIAL_A1', 'TRIAL_A2', 'DEV_FULL'].includes(product)
}

/** Helper: check if constructed score is counted in live result */
export function isConstructedIncludedInLiveResult(): boolean {
  return BIGT_CURRENT_CERTIFICATION_POLICY.constructedSkillsEnabledInLive
}

/** Helper: get the effective weighting for overall score calculation */
export function getEffectiveWeighting(): SkillWeighting {
  if (BIGT_FULL_SKILLS_CERTIFICATE_ACTIVE) {
    return BIGT_FUTURE_FULL_SKILLS_POLICY.weighting
  }
  return BIGT_CURRENT_CERTIFICATION_POLICY.weighting
}
