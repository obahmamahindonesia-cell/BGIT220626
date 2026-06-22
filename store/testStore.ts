import { create } from 'zustand'
import { AnswerResponse, Dimension, QuestionType } from '@/types'

interface TestQuestion {
  id: string
  dimension: Dimension
  type: QuestionType
  level: string
  content: any
  rubric: any
  points: number
}

interface TestState {
  sessionId: string | null
  questions: TestQuestion[]
  currentIndex: number
  answers: Record<string, AnswerResponse>
  timeRemaining: number
  isFinished: boolean
  
  setSession: (sessionId: string, questions: TestQuestion[]) => void
  setCurrentIndex: (index: number) => void
  setAnswer: (questionId: string, answer: AnswerResponse) => void
  setTimeRemaining: (time: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  finishTest: () => void
  reset: () => void
}

export const useTestStore = create<TestState>((set) => ({
  sessionId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeRemaining: 1800,
  isFinished: false,

  setSession: (sessionId, questions) => set({ 
    sessionId, 
    questions, 
    currentIndex: 0,
    answers: {},
    timeRemaining: 1800,
    isFinished: false 
  }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  nextQuestion: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1)
  })),

  previousQuestion: () => set((state) => ({
    currentIndex: Math.max(state.currentIndex - 1, 0)
  })),

  finishTest: () => set({ isFinished: true }),

  reset: () => set({
    sessionId: null,
    questions: [],
    currentIndex: 0,
    answers: {},
    timeRemaining: 1800,
    isFinished: false
  }),
}))
