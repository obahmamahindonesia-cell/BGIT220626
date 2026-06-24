export type Dimension = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' | 'MEDIATION' | 'INTEGRATED'

export type QuestionType = 'MCQ' | 'SHORT_ANSWER' | 'ESSAY' | 'AUDIO_RESPONSE' | 'INTEGRATED_TASK'

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type UserRole = 'TEST_TAKER' | 'ADMIN'

export type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'SCORED' | 'FAILED'

export interface QuestionOption {
  label: string
  text: string
}

export interface QuestionContent {
  prompt: string
  instruction?: string
  options?: QuestionOption[]
  questionType?: string
  stimulus?: { type: string; title: string | null; content: string | null; transcript: string | null } | null
  audioUrl?: string
  attachments?: string[]
  correctAnswer?: string | number
  subskill?: string
  topic?: string
  tags?: string[]
  estimatedTime?: number
}

export interface QuestionRubric {
  taskCompletion?: number
  coherence?: number
  lexicalRange?: number
  grammarAccuracy?: number
  pronunciation?: number
  fluency?: number
}

export interface AnswerResponse {
  text?: string
  selectedOption?: string | number
  audioUrl?: string
}

export interface AIScoreResult {
  score: number
  level: CEFRLevel
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface TestResultData {
  overallLevel: CEFRLevel
  overallScore: number
  listeningScore: number
  readingScore: number
  speakingScore: number
  writingScore: number
  mediationScore: number
  integratedScore: number
  toefEquivalent?: number
  ieltsEquivalent?: number
  recommendations: DimensionRecommendation[]
}

export interface DimensionRecommendation {
  dimension: Dimension
  score: number
  level: CEFRLevel
  feedback: string
  canDoStatements: string[]
  recommendations: string[]
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  LISTENING: 'Menyimak',
  READING: 'Membaca',
  SPEAKING: 'Berbicara',
  WRITING: 'Menulis',
  MEDIATION: 'Mediasi',
  INTEGRATED: 'Terintegrasi',
}

export const CEFR_LABELS: Record<CEFRLevel, string> = {
  A1: 'Pemula',
  A2: 'Dasar',
  B1: 'Menengah',
  B2: 'Menengah Atas',
  C1: 'Mahir',
  C2: 'Sangat Mahir',
}
