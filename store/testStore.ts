import { create } from 'zustand'
import { AnswerResponse, Dimension, QuestionType } from '@/types'

export interface TestQuestion {
  id: string
  dimension: string
  skill: string
  type: string
  level: string
  difficulty: number
  points: number
  content: {
    prompt?: string
    options?: string[]
    audioUrl?: string
    imageUrl?: string
    passage?: string
    correctAnswer?: string
  }
}

interface SaveStatus {
  state: 'idle' | 'saving' | 'saved' | 'error'
  message: string
}

interface TestState {
  sessionId: string | null
  questions: TestQuestion[]
  currentIndex: number
  answers: Record<string, AnswerResponse>
  flaggedQuestions: Set<string>
  timeRemaining: number
  totalTime: number
  isFinished: boolean
  isFullscreen: boolean
  saveStatus: SaveStatus
  autoSaveTimer: number | null

  setSession: (sessionId: string, questions: TestQuestion[]) => void
  setCurrentIndex: (index: number) => void
  setAnswer: (questionId: string, answer: AnswerResponse) => void
  toggleFlag: (questionId: string) => void
  setTimeRemaining: (time: number) => void
  setFullscreen: (value: boolean) => void
  setSaveStatus: (status: Partial<SaveStatus>) => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  finishTest: () => void
  reset: () => void

  getCurrentQuestion: () => TestQuestion | null
  getAnsweredCount: () => number
  getFlaggedCount: () => number
  isQuestionAnswered: (id: string) => boolean
  isQuestionFlagged: (id: string) => boolean
  getProgressPercent: () => number
}

export const useTestStore = create<TestState>((set, get) => ({
  sessionId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  flaggedQuestions: new Set<string>(),
  timeRemaining: 1800,
  totalTime: 1800,
  isFinished: false,
  isFullscreen: false,
  saveStatus: { state: 'idle', message: '' },
  autoSaveTimer: null,

  setSession: (sessionId, questions) =>
    set({
      sessionId,
      questions,
      currentIndex: 0,
      answers: {},
      flaggedQuestions: new Set<string>(),
      timeRemaining: questions.length * 90,
      totalTime: questions.length * 90,
      isFinished: false,
      saveStatus: { state: 'idle', message: '' },
    }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setAnswer: (questionId, answer) => {
    const answers = { ...get().answers, [questionId]: answer }
    set({ answers, saveStatus: { state: 'idle', message: '' } })
  },

  toggleFlag: (questionId) => {
    const flagged = new Set(get().flaggedQuestions)
    if (flagged.has(questionId)) flagged.delete(questionId)
    else flagged.add(questionId)
    set({ flaggedQuestions: flagged })
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setFullscreen: (value) => set({ isFullscreen: value }),

  setSaveStatus: (status) =>
    set((state) => ({ saveStatus: { ...state.saveStatus, ...status } })),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),

  previousQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  goToQuestion: (index) => set({ currentIndex: index }),

  finishTest: () => set({ isFinished: true }),

  reset: () =>
    set({
      sessionId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      flaggedQuestions: new Set<string>(),
      timeRemaining: 1800,
      totalTime: 1800,
      isFinished: false,
      isFullscreen: false,
      saveStatus: { state: 'idle', message: '' },
    }),

  getCurrentQuestion: () => {
    const state = get()
    return state.questions[state.currentIndex] || null
  },

  getAnsweredCount: () => {
    const state = get()
    return Object.keys(state.answers).length
  },

  getFlaggedCount: () => {
    const state = get()
    return state.flaggedQuestions.size
  },

  isQuestionAnswered: (id) => {
    return id in get().answers
  },

  isQuestionFlagged: (id) => {
    return get().flaggedQuestions.has(id)
  },

  getProgressPercent: () => {
    const state = get()
    if (state.questions.length === 0) return 0
    return (Object.keys(state.answers).length / state.questions.length) * 100
  },
}))
