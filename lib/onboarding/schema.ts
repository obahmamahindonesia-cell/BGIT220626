import { z } from 'zod'

export const onboardingSchema = z.object({
  age: z.string().optional(),
  profession: z.string().min(1, 'Pilih profesi Anda'),
  targetLevel: z.string().optional(),
  testGoals: z.array(z.string()).min(1, 'Pilih minimal satu tujuan'),
  hasPreviousTest: z.boolean(),
  previousTestType: z.string().optional(),
  learningDuration: z.string().optional(),
  estimatedLevel: z.string().optional(),
  preferredDuration: z.number().min(30).max(120),
  practiceMode: z.boolean(),
  emailNotifications: z.boolean(),
  micTested: z.boolean(),
  speakerTested: z.boolean(),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

export const PROFESSIONS = [
  { id: 'student', labelKey: 'onboarding.professions.student' },
  { id: 'professional', labelKey: 'onboarding.professions.professional' },
  { id: 'teacher', labelKey: 'onboarding.professions.teacher' },
  { id: 'bipa_learner', labelKey: 'onboarding.professions.bipaLearner' },
  { id: 'general', labelKey: 'onboarding.professions.general' },
  { id: 'other', labelKey: 'onboarding.professions.other' },
] as const

export const AGE_RANGES = ['<18', '18-24', '25-34', '35-44', '45+'] as const

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const GOALS = [
  { id: 'certification', labelKey: 'onboarding.goalsItems.certification', icon: 'Award' },
  { id: 'university', labelKey: 'onboarding.goalsItems.university', icon: 'GraduationCap' },
  { id: 'career', labelKey: 'onboarding.goalsItems.career', icon: 'Briefcase' },
  { id: 'teaching', labelKey: 'onboarding.goalsItems.teaching', icon: 'BookOpen' },
  { id: 'self_improvement', labelKey: 'onboarding.goalsItems.selfImprovement', icon: 'Sparkles' },
  { id: 'bipa', labelKey: 'onboarding.goalsItems.bipa', icon: 'Globe' },
  { id: 'migration', labelKey: 'onboarding.goalsItems.migration', icon: 'Plane' },
] as const

export const LEARNING_DURATIONS = [
  { id: 'less_6', labelKey: 'onboarding.durationsItems.less6' },
  { id: '6_12', labelKey: 'onboarding.durationsItems.6to12' },
  { id: '1_2', labelKey: 'onboarding.durationsItems.1to2' },
  { id: '3_5', labelKey: 'onboarding.durationsItems.3to5' },
  { id: 'more_5', labelKey: 'onboarding.durationsItems.more5' },
  { id: 'native', labelKey: 'onboarding.durationsItems.native' },
] as const

export const PREVIOUS_TESTS = [
  { id: 'ukbi', labelKey: 'onboarding.previousTests.ukbi' },
  { id: 'other_bipa', labelKey: 'onboarding.previousTests.otherBipa' },
  { id: 'toefl_ielts', labelKey: 'onboarding.previousTests.toeflIelts' },
  { id: 'none', labelKey: 'onboarding.previousTests.none' },
] as const

export const DURATION_OPTIONS = [
  { value: 30, labelKey: 'onboarding.durations.30', subKey: 'onboarding.durationSubs.30' },
  { value: 60, labelKey: 'onboarding.durations.60', subKey: 'onboarding.durationSubs.60' },
  { value: 90, labelKey: 'onboarding.durations.90', subKey: 'onboarding.durationSubs.90' },
] as const

export const STEPS = [
  { id: 'welcome', icon: 'Sparkles' },
  { id: 'personal', icon: 'User' },
  { id: 'goals', icon: 'Target' },
  { id: 'experience', icon: 'BookOpen' },
  { id: 'preferences', icon: 'Settings' },
  { id: 'tech', icon: 'Mic' },
  { id: 'ready', icon: 'Zap' },
] as const

export const getDefaultOnboardingData = (): OnboardingData => ({
  age: '',
  profession: '',
  targetLevel: '',
  testGoals: [],
  hasPreviousTest: false,
  previousTestType: '',
  learningDuration: '',
  estimatedLevel: '',
  preferredDuration: 60,
  practiceMode: true,
  emailNotifications: true,
  micTested: false,
  speakerTested: false,
})
