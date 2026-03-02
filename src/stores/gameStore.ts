import { create } from 'zustand'

interface Question {
  id: string
  order: number
  answer: string
  example: string
  question: string
  hint: string | null
}

interface Activity {
  id: string
  code: string
  title: string
  description: string | null
  timeLimit: number
  teacherName: string
  questions: Question[]
}

interface GameState {
  activity: Activity | null
  sessionId: string | null
  studentName: string
  currentQuestionIndex: number
  score: number
  startTime: number | null
  timeRemaining: number
  foundWords: string[]
  gameStatus: 'idle' | 'playing' | 'finished'
  showHint: boolean

  setActivity: (activity: Activity) => void
  setSession: (sessionId: string, studentName: string) => void
  startGame: () => void
  nextQuestion: () => void
  addFoundWord: (word: string) => void
  incrementScore: () => void
  setTimeRemaining: (time: number) => void
  setShowHint: (show: boolean) => void
  finishGame: () => void
  resetGame: () => void
  getCurrentQuestion: () => Question | null
}

export const useGameStore = create<GameState>((set, get) => ({
  activity: null,
  sessionId: null,
  studentName: '',
  currentQuestionIndex: 0,
  score: 0,
  startTime: null,
  timeRemaining: 0,
  foundWords: [],
  gameStatus: 'idle',
  showHint: false,

  setActivity: (activity) =>
    set({
      activity,
      timeRemaining: activity.timeLimit,
    }),

  setSession: (sessionId, studentName) => set({ sessionId, studentName }),

  startGame: () =>
    set({
      gameStatus: 'playing',
      startTime: Date.now(),
      currentQuestionIndex: 0,
      score: 0,
      foundWords: [],
      showHint: false,
    }),

  nextQuestion: () => {
    const state = get()
    const nextIndex = state.currentQuestionIndex + 1
    if (state.activity && nextIndex >= state.activity.questions.length) {
      set({ gameStatus: 'finished' })
    } else {
      set({
        currentQuestionIndex: nextIndex,
        foundWords: [],
        showHint: false,
      })
    }
  },

  addFoundWord: (word) =>
    set((state) => ({
      foundWords: [...state.foundWords, word.toUpperCase()],
    })),

  incrementScore: () => set((state) => ({ score: state.score + 1 })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setShowHint: (show) => set({ showHint: show }),

  finishGame: () => set({ gameStatus: 'finished' }),

  resetGame: () =>
    set({
      activity: null,
      sessionId: null,
      studentName: '',
      currentQuestionIndex: 0,
      score: 0,
      startTime: null,
      timeRemaining: 0,
      foundWords: [],
      gameStatus: 'idle',
      showHint: false,
    }),

  getCurrentQuestion: () => {
    const state = get()
    if (!state.activity) return null
    return state.activity.questions[state.currentQuestionIndex] || null
  },
}))
