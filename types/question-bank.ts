export type Skill = 'reading' | 'listening' | 'writing' | 'speaking' | 'integrated'
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type QuestionType = 'multiple_choice' | 'true_false' | 'matching' | 'short_answer' | 'essay' | 'audio_response' | 'integrated_task'
export type SetStatus = 'draft' | 'review' | 'published' | 'retired'
export type ReadingSubskill = 'specific_information' | 'main_purpose' | 'vocabulary_in_context' | 'simple_inference' | 'matching_information'

export interface QuestionOption {
  key: string
  text: string
}

export interface BaseQuestion {
  questionId: string
  type: QuestionType
  subskill: ReadingSubskill
  difficulty: number
  prompt: string
  points: number
}

export interface McqQuestion extends BaseQuestion {
  type: 'multiple_choice'
  options: QuestionOption[]
  answer: string
  explanation: string
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false'
  options: QuestionOption[]
  answer: string
  explanation: string
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  options: QuestionOption[]
  answer: string
  explanation: string
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer'
  answer: string
  explanation: string
}

export type ReadingQuestion = McqQuestion | TrueFalseQuestion | MatchingQuestion | ShortAnswerQuestion

export interface ListeningItem {
  questionId: string
  type: 'multiple_choice'
  subskill: string
  difficulty: number
  prompt: string
  options: QuestionOption[]
  answer: string
  explanation: string
  points: number
  topic: string
  audioId: string
  audioFile: string
  transcript: string
  speaker: string
  speed: string
  durationSeconds: number
}

export interface Passage {
  passageId: string
  title: string
  text: string
  topic: string
  wordCount: number
  items: ReadingQuestion[]
}

export interface ReadingSet {
  setId: string
  cefr: Cefr
  skill: 'reading'
  title: string
  version: string
  status: SetStatus
  itemsCount: number
  passages: Passage[]
}

export interface ListeningSet {
  setId: string
  cefr: Cefr
  skill: 'listening'
  title: string
  version: string
  status: SetStatus
  itemsCount: number
  audioBasePath: string
  items: ListeningItem[]
}

export type QuestionSet = ReadingSet | ListeningSet

export type QuestionBankMeta = Pick<QuestionSet, 'setId' | 'cefr' | 'skill' | 'title' | 'status' | 'itemsCount'>

export interface SanitizedQuestion {
  questionId: string
  type: QuestionType
  subskill: string
  difficulty: number
  prompt: string
  options?: QuestionOption[]
  topic?: string
  audioUrl?: string
  passageTitle?: string
  passageText?: string
  points: number
}
