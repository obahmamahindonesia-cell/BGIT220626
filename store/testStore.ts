'use client'

import { create } from 'zustand'
import { AnswerResponse, QuestionOption } from '@/types'

export interface TestQuestion {
  id: string
  sessionItemId: string
  dimension: string
  skill: string
  type: string
  level: string
  difficulty: number
  points: number
  content: {
    prompt?: string
    instruction?: string
    options?: QuestionOption[]
    questionType?: string
    stimulus?: { type: string; title: string | null; content: string | null; transcript: string | null } | null
    correctAnswer?: string
    subskill?: string
    topic?: string
    tags?: string[]
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
  durationMinutes: number
  isFinished: boolean
  saveStatus: SaveStatus
  debounceTimers: Record<string, NodeJS.Timeout>

  setSession: (sessionId: string, questions: TestQuestion[], durationMinutes: number) => void
  setCurrentIndex: (index: number) => void
  setAnswer: (questionId: string, answer: AnswerResponse) => void
  toggleFlag: (questionId: string) => void
  setTimeRemaining: (time: number) => void
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
  timeRemaining: 0,
  durationMinutes: 0,
  isFinished: false,
  saveStatus: { state: 'idle', message: '' },
  debounceTimers: {},

  setSession: (sessionId, questions, durationMinutes) => {
    const totalSeconds = durationMinutes * 60
    set({
      sessionId,
      questions,
      currentIndex: 0,
      answers: {},
      flaggedQuestions: new Set<string>(),
      timeRemaining: totalSeconds,
      durationMinutes,
      isFinished: false,
      saveStatus: { state: 'idle', message: '' },
      debounceTimers: {},
    })
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setAnswer: (questionId, answer) => {
    const answers = { ...get().answers, [questionId]: answer }
    set({ answers, saveStatus: { state: 'saving', message: 'Menyimpan Jawaban' } })

    const existing = get().debounceTimers[questionId]
    if (existing) clearTimeout(existing)

    const timer = setTimeout(async () => {
      const state = useTestStore.getState()
      if (!state.sessionId) return
      try {
        const res = await fetch(`/api/test/session/${state.sessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionItemId: questionId,
            answer: answer.selectedOption || answer.text || '',
          }),
        })
        if (!res.ok) throw new Error('Gagal menyimpan')
        useTestStore.getState().setSaveStatus({ state: 'saved', message: 'Jawaban Tersimpan' })
        setTimeout(() => useTestStore.getState().setSaveStatus({ state: 'idle', message: '' }), 2000)
      } catch {
        useTestStore.getState().setSaveStatus({ state: 'error', message: 'Gagal Menyimpan' })
        setTimeout(() => useTestStore.getState().setSaveStatus({ state: 'idle', message: '' }), 3000)
      }
    }, 800)

    set({ debounceTimers: { ...get().debounceTimers, [questionId]: timer } })
  },

  toggleFlag: (questionId) => {
    const flagged = new Set(get().flaggedQuestions)
    if (flagged.has(questionId)) flagged.delete(questionId)
    else flagged.add(questionId)
    set({ flaggedQuestions: flagged })
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),

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

  reset: () => {
    const timers = get().debounceTimers
    for (const t of Object.values(timers)) clearTimeout(t)
    set({
      sessionId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      flaggedQuestions: new Set<string>(),
      timeRemaining: 0,
      durationMinutes: 0,
      isFinished: false,
      saveStatus: { state: 'idle', message: '' },
      debounceTimers: {},
    })
  },

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
