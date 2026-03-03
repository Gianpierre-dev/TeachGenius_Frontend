import { useEffect, useCallback, useMemo, useState, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { api } from '../../lib/api'
import { API_ROUTES } from '../../lib/routes'
import Timer from './Timer'
import QuestionCard from './QuestionCard'
import WordSearch from './WordSearch'

interface GameProps {
  activityCode: string
}

interface ActivityData {
  id: string
  code: string
  title: string
  description: string | null
  timeLimit: number
  teacherName: string
  questions: {
    id: string
    order: number
    answer: string
    example: string
    question: string
    hint: string | null
  }[]
}

interface SessionData {
  sessionId: string
  startedAt: string
}

interface FinishData {
  id: string
  studentName: string
  score: number
  totalQuestions: number
  percentage: number
  timeUsed: number
  finishedAt: string
}

export default function Game({ activityCode }: GameProps) {
  const {
    activity,
    sessionId,
    studentName,
    currentQuestionIndex,
    score,
    timeRemaining,
    foundWords,
    gameStatus,
    showHint,
    setActivity,
    setSession,
    startGame,
    nextQuestion,
    addFoundWord,
    incrementScore,
    setTimeRemaining,
    setShowHint,
    finishGame,
    resetGame,
    getCurrentQuestion,
  } = useGameStore()

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await api.get<ActivityData>(API_ROUTES.game(activityCode))
        setActivity(data)
      } catch (error) {
        console.error('Error fetching activity:', error)
      }
    }
    fetchActivity()

    return () => {
      resetGame()
    }
  }, [activityCode, setActivity, resetGame])

  const handleStartGame = async (name: string) => {
    if (!name.trim()) return

    try {
      const data = await api.post<SessionData>(API_ROUTES.gameStart(activityCode), {
        studentName: name.trim(),
      })
      setSession(data.sessionId, name.trim())
      startGame()
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  const handleWordFound = useCallback(
    async (word: string) => {
      const question = getCurrentQuestion()
      if (!question || !sessionId) return

      if (word.toUpperCase() === question.answer.toUpperCase()) {
        addFoundWord(word)
        incrementScore()

        try {
          await api.post(API_ROUTES.sessionAnswer(sessionId), {
            questionOrder: question.order,
            correct: true,
            timeToAnswer: activity ? activity.timeLimit - timeRemaining : 0,
          })
        } catch (error) {
          console.error('Error submitting answer:', error)
        }

        setTimeout(() => {
          nextQuestion()
        }, 1500)
      }
    },
    [getCurrentQuestion, sessionId, addFoundWord, incrementScore, nextQuestion, activity, timeRemaining]
  )

  const isFinishingRef = useRef(false)

  const handleTimeUp = useCallback(async () => {
    if (!sessionId || !activity || isFinishingRef.current) return
    isFinishingRef.current = true

    finishGame()

    try {
      await api.post<FinishData>(API_ROUTES.sessionFinish(sessionId), {
        timeUsed: activity.timeLimit,
        score,
      })
    } catch (error) {
      console.error('Error finishing game:', error)
    }
  }, [sessionId, activity, score, finishGame])

  const handleFinishGame = useCallback(async () => {
    if (!sessionId || !activity || isFinishingRef.current) return
    isFinishingRef.current = true

    // Cambiar estado primero para evitar múltiples llamadas
    finishGame()

    try {
      await api.post<FinishData>(API_ROUTES.sessionFinish(sessionId), {
        timeUsed: activity.timeLimit - timeRemaining,
        score,
      })
    } catch (error) {
      console.error('Error finishing game:', error)
    }
  }, [sessionId, activity, timeRemaining, score, finishGame])

  const currentQuestion = getCurrentQuestion()
  const currentWords = useMemo(
    () => (currentQuestion ? [currentQuestion.answer] : []),
    [currentQuestion?.answer]
  )

  useEffect(() => {
    if (gameStatus === 'playing' && activity && currentQuestionIndex >= activity.questions.length) {
      handleFinishGame()
    }
  }, [gameStatus, activity, currentQuestionIndex, handleFinishGame])

  if (!activity) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (gameStatus === 'idle') {
    return <StartScreen activity={activity} onStart={handleStartGame} />
  }

  if (gameStatus === 'finished') {
    return (
      <FinishScreen
        studentName={studentName}
        score={score}
        totalQuestions={activity.questions.length}
        activityTitle={activity.title}
      />
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="font-semibold text-slate-900">{activity.title}</h1>
            <p className="text-sm text-slate-500">{studentName} • {score}/{activity.questions.length}</p>
          </div>
          <Timer
            timeRemaining={timeRemaining}
            totalTime={activity.timeLimit}
            onTimeUp={handleTimeUp}
            onTick={setTimeRemaining}
          />
        </header>

        <div className="space-y-4">
          <QuestionCard
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={activity.questions.length}
            question={currentQuestion.question}
            example={currentQuestion.example}
            hint={currentQuestion.hint}
            showHint={showHint}
            onShowHint={() => setShowHint(true)}
          />

          <WordSearch
            words={currentWords}
            onWordFound={handleWordFound}
            foundWords={foundWords}
          />
        </div>
      </div>
    </div>
  )
}

function StartScreen({
  activity,
  onStart,
}: {
  activity: ActivityData
  onStart: (name: string) => void
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    onStart(name)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-slate-900">{activity.title}</h1>
            {activity.description && (
              <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
            )}
          </div>

          <div className="flex gap-4 mb-6 text-center">
            <div className="flex-1 py-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-semibold text-slate-900">{activity.questions.length}</p>
              <p className="text-xs text-slate-500">preguntas</p>
            </div>
            <div className="flex-1 py-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-semibold text-slate-900">{Math.floor(activity.timeLimit / 60)}</p>
              <p className="text-xs text-slate-500">minutos</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tu nombre
            </label>
            <input
              name="name"
              type="text"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none mb-4"
              placeholder="Escribe tu nombre"
            />
            <button
              type="submit"
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Comenzar
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            Prof. {activity.teacherName}
          </p>
        </div>
      </div>
    </div>
  )
}

function FinishScreen({
  studentName,
  score,
  totalQuestions,
  activityTitle,
}: {
  studentName: string
  score: number
  totalQuestions: number
  activityTitle: string
}) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowBar(true), 100)
  }, [])

  const getMessage = () => {
    if (percentage >= 90) return 'Excelente'
    if (percentage >= 70) return 'Muy bien'
    if (percentage >= 50) return 'Buen trabajo'
    return 'Sigue practicando'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500 mb-1">{studentName}</p>
          <h1 className="text-xl font-semibold text-slate-900 mb-6">{getMessage()}</h1>

          <div className="mb-6">
            <p className="text-5xl font-bold text-slate-900 mb-2">{percentage}%</p>
            <p className="text-sm text-slate-500">{score} de {totalQuestions} correctas</p>
          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: showBar ? `${percentage}%` : '0%' }}
            />
          </div>

          <p className="text-xs text-slate-400 mb-4">{activityTitle}</p>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    </div>
  )
}
