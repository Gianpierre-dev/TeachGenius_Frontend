import { useState, useEffect, useCallback } from 'react'
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

const MAX_QUESTIONS = 50

const EMPTY_QUESTION: Omit<Question, 'order'> = {
  answer: '',
  example: '',
  question: '',
  hint: '',
}

// Icons
function IconArrowLeft({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function IconClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconLoader({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function IconCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconAlertCircle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}


export default function ActivityForm({ activityId }: ActivityFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([
    { ...EMPTY_QUESTION, order: 1 },
  ])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialData, setInitialData] = useState<string>('')
  const { token, _hasHydrated } = useAuthStore()

  // Track changes
  const getCurrentDataHash = useCallback(() => {
    return JSON.stringify({ title, description, timeLimit, questions })
  }, [title, description, timeLimit, questions])

  useEffect(() => {
    if (initialData) {
      setHasChanges(getCurrentDataHash() !== initialData)
    }
  }, [getCurrentDataHash, initialData])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  useEffect(() => {
    if (!_hasHydrated) return

    if (!token) {
      window.location.href = ROUTES.login
      return
    }

    if (activityId) {
      setIsEditing(true)
      setFetchingData(true)
      const fetchActivity = async () => {
        try {
          const data = await api.get<ActivityData>(
            API_ROUTES.activity(activityId),
            token
          )
          setTitle(data.title)
          setDescription(data.description || '')
          setTimeLimit(Math.floor(data.timeLimit / 60))
          const loadedQuestions = data.questions.map((q) => ({
            id: q.id,
            order: q.order,
            answer: q.answer,
            example: q.example,
            question: q.question,
            hint: q.hint || '',
          }))
          setQuestions(loadedQuestions)

          // Set initial data for change tracking
          setTimeout(() => {
            setInitialData(JSON.stringify({
              title: data.title,
              description: data.description || '',
              timeLimit: Math.floor(data.timeLimit / 60),
              questions: loadedQuestions,
            }))
          }, 100)
        } catch (error) {
          console.error('Error fetching activity:', error)
          setError('Error al cargar la actividad')
        } finally {
          setFetchingData(false)
        }
      }
      fetchActivity()
    } else {
      // Set initial data for new activity
      setInitialData(getCurrentDataHash())
    }
  }, [_hasHydrated, activityId, token])

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) {
      setError(`Máximo ${MAX_QUESTIONS} preguntas por actividad`)
      return
    }
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

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
        window.location.href = ROUTES.dashboard
      }
    } else {
      window.location.href = ROUTES.dashboard
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const invalidQuestions = questions.filter(
      (q) => !q.answer.trim() || !q.example.trim() || !q.question.trim()
    )

    if (invalidQuestions.length > 0) {
      setError('Todas las preguntas deben tener respuesta, ejemplo y enunciado')
      setLoading(false)
      return
    }

    try {
      const questionsPayload = questions.map((q) => ({
        id: q.id,
        order: q.order,
        answer: q.answer.toUpperCase(),
        example: q.example,
        question: q.question,
        hint: q.hint || null,
      }))

      if (isEditing && activityId) {
        await api.put(
          API_ROUTES.activity(activityId),
          {
            title,
            description: description || null,
            timeLimit: timeLimit * 60,
            questions: questionsPayload,
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
            questions: questionsPayload,
          },
          token!
        )
      }

      setHasChanges(false)
      window.location.href = ROUTES.dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-letters-pattern flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-animated flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-stone-500 font-medium">Cargando actividad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-letters-pattern">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-animated opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.1%22%2F%3E%3C%2Fsvg%3E')]" />

        <div className="relative max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium mb-4 transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </button>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
          </h1>
          {hasChanges && (
            <p className="text-white/60 text-sm mt-1">Tienes cambios sin guardar</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div
            className="bg-white rounded-2xl shadow-elevated p-6 opacity-0 animate-slide-up"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <h2 className="text-lg font-bold text-stone-800 mb-5">
              Información básica
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-stone-700 mb-2">
                  Título de la actividad
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
                  placeholder="Ej: Figuras Literarias - Unidad 3"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-stone-700 mb-2">
                  Descripción
                  <span className="text-stone-400 font-normal ml-1">(opcional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white resize-none"
                  placeholder="Instrucciones o descripción de la actividad"
                />
              </div>

              <div>
                <label htmlFor="timeLimit" className="block text-sm font-semibold text-stone-700 mb-2">
                  <span className="flex items-center gap-2">
                    <IconClock className="w-4 h-4 text-stone-400" />
                    Tiempo límite
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={60}
                    step={1}
                    required
                    className="w-24 px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white text-center font-semibold"
                  />
                  <span className="text-stone-500">minutos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-800">
                  Preguntas
                </h2>
                <p className="text-sm text-stone-500">
                  {questions.length} de {MAX_QUESTIONS} máximo
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= MAX_QUESTIONS}
                className="flex items-center gap-1.5 px-4 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm rounded-xl transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id || `new-${index}`}
                  question={question}
                  index={index}
                  total={questions.length}
                  onUpdate={(field, value) => updateQuestion(index, field, value)}
                  onRemove={() => removeQuestion(index)}
                  canRemove={questions.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-coral-50 border border-coral-200">
              <IconAlertCircle className="w-5 h-5 text-coral-500 shrink-0" />
              <p className="text-sm text-coral-700 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 gradient-animated text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <IconLoader className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <IconCheck className="w-5 h-5" />
                {isEditing ? 'Guardar cambios' : 'Crear actividad'}
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}

function QuestionCard({
  question,
  index,
  total,
  onUpdate,
  onRemove,
  canRemove,
}: {
  question: Question
  index: number
  total: number
  onUpdate: (field: keyof Question, value: string) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const delay = 250 + index * 30

  return (
    <div
      className="bg-white rounded-2xl shadow-elevated overflow-hidden opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-100">
        <span className="font-semibold text-stone-700">
          Pregunta {index + 1}
          <span className="text-stone-400 font-normal ml-1">de {total}</span>
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-coral-500 hover:bg-coral-50 rounded-lg transition-colors"
            title="Eliminar pregunta"
          >
            <IconTrash />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Enunciado de la pregunta
          </label>
          <input
            type="text"
            value={question.question}
            onChange={(e) => onUpdate('question', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
            placeholder="¿Qué figura literaria compara sin usar 'como'?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Ejemplo de uso
          </label>
          <input
            type="text"
            value={question.example}
            onChange={(e) => onUpdate('example', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
            placeholder="Tus ojos son dos luceros"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Respuesta
              <span className="text-stone-400 font-normal ml-1">(palabra a encontrar)</span>
            </label>
            <input
              type="text"
              value={question.answer}
              onChange={(e) => onUpdate('answer', e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white uppercase font-mono font-semibold tracking-wider"
              placeholder="METAFORA"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Pista
              <span className="text-stone-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={question.hint}
              onChange={(e) => onUpdate('hint', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
              placeholder="Empieza con M..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
