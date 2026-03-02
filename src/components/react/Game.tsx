import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const handleTimeUp = useCallback(async () => {
    if (!sessionId || !activity) return

    try {
      await api.post<FinishData>(API_ROUTES.sessionFinish(sessionId), {
        timeUsed: activity.timeLimit,
        score,
      })
    } catch (error) {
      console.error('Error finishing game:', error)
    }

    finishGame()
  }, [sessionId, activity, score, finishGame])

  const handleFinishGame = useCallback(async () => {
    if (!sessionId || !activity) return

    try {
      await api.post<FinishData>(API_ROUTES.sessionFinish(sessionId), {
        timeUsed: activity.timeLimit - timeRemaining,
        score,
      })
    } catch (error) {
      console.error('Error finishing game:', error)
    }

    finishGame()
  }, [sessionId, activity, timeRemaining, score, finishGame])

  useEffect(() => {
    if (gameStatus === 'playing' && activity && currentQuestionIndex >= activity.questions.length) {
      handleFinishGame()
    }
  }, [gameStatus, activity, currentQuestionIndex, handleFinishGame])

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
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

  const currentQuestion = getCurrentQuestion()
  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">
              {activity.title}
            </h1>
            <p className="text-sm text-gray-500">{studentName}</p>
          </div>
          <Timer
            timeRemaining={timeRemaining}
            totalTime={activity.timeLimit}
            onTimeUp={handleTimeUp}
            onTick={setTimeRemaining}
          />
        </header>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestionIndex}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={activity.questions.length}
              question={currentQuestion.question}
              example={currentQuestion.example}
              hint={currentQuestion.hint}
              showHint={showHint}
              onShowHint={() => setShowHint(true)}
            />
          </AnimatePresence>

          <WordSearch
            words={[currentQuestion.answer]}
            onWordFound={handleWordFound}
            foundWords={foundWords}
          />

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Puntuación: <span className="font-bold text-primary-600">{score}</span> /{' '}
              {activity.questions.length}
            </p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            {activity.description && (
              <p className="mt-2 text-gray-600">{activity.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Profesor: {activity.teacherName}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>{activity.questions.length} preguntas</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{Math.floor(activity.timeLimit / 60)} minutos</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                placeholder="Escribe tu nombre"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[48px] bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              Comenzar
            </button>
          </form>
        </div>
      </motion.div>
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

  const getMessage = () => {
    if (percentage >= 90) return '¡Excelente trabajo!'
    if (percentage >= 70) return '¡Muy bien!'
    if (percentage >= 50) return '¡Buen intento!'
    return '¡Sigue practicando!'
  }

  const getEmoji = () => {
    if (percentage >= 90) return '🎉'
    if (percentage >= 70) return '👏'
    if (percentage >= 50) return '👍'
    return '💪'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {getEmoji()}
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{getMessage()}</h1>
          <p className="text-gray-600 mb-6">{studentName}</p>

          <div className="bg-primary-50 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-primary-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <p className="text-gray-600">respuestas correctas</p>
            <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className={`h-full rounded-full ${
                  percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-700">{percentage}%</p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Actividad: {activityTitle}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full min-h-[48px] bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition"
          >
            Jugar de nuevo
          </button>
        </div>
      </motion.div>
    </div>
  )
}
