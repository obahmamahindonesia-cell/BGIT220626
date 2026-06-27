export type BIGTExamMode = 'live' | 'trial_constructed' | 'dev_full'

export interface ExamModeConfig {
  includeConstructed: boolean
  skills: string[]
  affectsFinalScore: boolean
  public: boolean
  adminOnly: boolean
  label: string
}

export const BIGT_EXAM_MODE_CONFIG: Record<BIGTExamMode, ExamModeConfig> = {
  live: {
    includeConstructed: false,
    skills: ['reading', 'listening'],
    affectsFinalScore: true,
    public: true,
    adminOnly: false,
    label: 'Live Exam',
  },
  trial_constructed: {
    includeConstructed: true,
    skills: ['reading', 'listening', 'writing', 'speaking'],
    affectsFinalScore: false,
    public: false,
    adminOnly: true,
    label: 'Uji Coba Internal',
  },
  dev_full: {
    includeConstructed: true,
    skills: ['reading', 'listening', 'writing', 'speaking', 'integrated', 'mediation'],
    affectsFinalScore: false,
    public: false,
    adminOnly: true,
    label: 'Dev Full Test',
  },
}

export function resolveExamMode(product: string): BIGTExamMode {
  if (product === 'TRIAL_A1' || product === 'TRIAL_A2') return 'trial_constructed'
  if (product === 'DEV_FULL') return 'dev_full'
  return 'live'
}

export function isTrialSession(product: string | null | undefined): boolean {
  if (!product) return false
  return product === 'TRIAL_A1' || product === 'TRIAL_A2' || product === 'DEV_FULL'
}

export function getExamModeLabel(product: string | null | undefined): string {
  if (!product) return ''
  if (product === 'TRIAL_A1') return 'Trial A1 Full Skills'
  if (product === 'TRIAL_A2') return 'Trial A2 Full Skills'
  if (product === 'DEV_FULL') return 'Dev Full Test'
  return ''
}
