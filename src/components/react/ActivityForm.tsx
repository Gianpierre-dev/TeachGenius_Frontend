import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { API_ROUTES, ROUTES } from '../../lib/routes'

interface Question {
  id?: string
  order: number
  answer: string
  example: string
  question: string
  hint: string
}

interface ActivityFormProps {
  activityId?: string
}

interface ActivityData {
  id: string
  code: string
  title: string
  description: string | null
  timeLimit: number
  isActive: boolean
  questions: Question[]
}

const EMPTY_QUESTION: Omit<Question, 'order'> = {
  answer: '',
  example: '',
  question: '',
  hint: '',
}

export default function ActivityForm({ activityId }: ActivityFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([
    { ...EMPTY_QUESTION, order: 1 },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) {
      window.location.href = ROUTES.login
      return
    }

    if (activityId) {
      setIsEditing(true)
      const fetchActivity = async () => {
        try {
          const data = await api.get<ActivityData>(
            API_ROUTES.activity(activityId),
            token
          )
          setTitle(data.title)
          setDescription(data.description || '')
          setTimeLimit(Math.floor(data.timeLimit / 60))
          setQuestions(
            data.questions.map((q) => ({
              id: q.id,
              order: q.order,
              answer: q.answer,
              example: q.example,
              question: q.question,
              hint: q.hint || '',
            }))
          )
        } catch (error) {
          console.error('Error fetching activity:', error)
          setError('Error al cargar la actividad')
        }
      }
      fetchActivity()
    }
  }, [activityId, token])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { ...EMPTY_QUESTION, order: questions.length + 1 },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(
      newQuestions.map((q, i) => ({ ...q, order: i + 1 }))
    )
  }

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const invalidQuestions = questions.filter(
      (q) => !q.answer.trim() || !q.example.trim() || !q.question.trim()
    )

    if (invalidQuestions.length > 0) {
      setError('Todas las preguntas deben tener respuesta, ejemplo y pregunta')
      setLoading(false)
      return
    }

    try {
      if (isEditing && activityId) {
        await api.put(
          API_ROUTES.activity(activityId),
          {
            title,
            description: description || null,
            timeLimit: timeLimit * 60,
          },
          token!
        )
      } else {
        await api.post(
          API_ROUTES.activities,
          {
            title,
            description: description || null,
            timeLimit: timeLimit * 60,
            questions: questions.map((q) => ({
              order: q.order,
              answer: q.answer,
              example: q.example,
              question: q.question,
              hint: q.hint || null,
            })),
          },
          token!
        )
      }

      window.location.href = ROUTES.dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
          </h1>
          <a
            href={ROUTES.dashboard}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Información básica
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la actividad
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="Ej: Figuras Literarias - Unidad 3"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
                  placeholder="Instrucciones o descripción de la actividad"
                />
              </div>

              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo límite (minutos)
                </label>
                <input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 10)}
                  min={1}
                  max={60}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Preguntas ({questions.length})
                </h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  + Agregar pregunta
                </button>
              </div>

              <AnimatePresence>
                {questions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Pregunta {index + 1}
                      </h3>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Respuesta (palabra a encontrar)
                        </label>
                        <input
                          type="text"
                          value={question.answer}
                          onChange={(e) =>
                            updateQuestion(index, 'answer', e.target.value.toUpperCase())
                          }
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition uppercase"
                          placeholder="Ej: METAFORA"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pregunta
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(index, 'question', e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                          placeholder="Ej: ¿Qué figura literaria compara sin usar 'como'?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ejemplo
                        </label>
                        <input
                          type="text"
                          value={question.example}
                          onChange={(e) =>
                            updateQuestion(index, 'example', e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                          placeholder="Ej: Tus ojos son dos luceros"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pista (opcional)
                        </label>
                        <input
                          type="text"
                          value={question.hint}
                          onChange={(e) =>
                            updateQuestion(index, 'hint', e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                          placeholder="Ej: Empieza con M"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
          </button>
        </form>
      </div>
    </div>
  )
}
