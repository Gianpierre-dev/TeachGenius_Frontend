import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { API_ROUTES, ROUTES } from '../../lib/routes'

interface Result {
  id: string
  studentName: string
  startedAt: string
  finishedAt: string | null
  timeUsed: number | null
  score: number
  totalQuestions: number
  percentage: number
  answers: {
    id: string
    questionOrder: number
    correct: boolean
    timeToAnswer: number | null
  }[]
}

interface ActivityInfo {
  id: string
  code: string
  title: string
  questions: { order: number; answer: string }[]
}

interface ResultsTableProps {
  activityId: string
}

// Icons
function IconArrowLeft({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconUsers({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconTarget({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function IconTrophy({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function IconChart({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconClock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function ResultsTable({ activityId }: ResultsTableProps) {
  const [results, setResults] = useState<Result[]>([])
  const [activity, setActivity] = useState<ActivityInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { token, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!_hasHydrated) return

    if (!token) {
      window.location.href = ROUTES.login
      return
    }

    const fetchData = async () => {
      try {
        const [activityData, resultsData] = await Promise.all([
          api.get<ActivityInfo>(API_ROUTES.activity(activityId), token),
          api.get<Result[]>(API_ROUTES.activityResults(activityId), token),
        ])
        setActivity(activityData)
        setResults(resultsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [_hasHydrated, activityId, token])

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-letters-pattern flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-animated flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-stone-500 font-medium">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-letters-pattern flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-elevated p-8 text-center max-w-sm">
          <p className="text-stone-500">Actividad no encontrada</p>
          <a
            href={ROUTES.dashboard}
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <IconArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </a>
        </div>
      </div>
    )
  }

  const avgPercentage = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
    : 0
  const bestScore = results.length > 0
    ? Math.max(...results.map((r) => r.percentage))
    : 0

  return (
    <div className="min-h-screen bg-letters-pattern">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-animated opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.1%22%2F%3E%3C%2Fsvg%3E')]" />

        <div className="relative max-w-5xl mx-auto px-4 py-6">
          <a
            href={ROUTES.dashboard}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium mb-4 transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </a>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {activity.title}
              </h1>
              <p className="text-white/70 font-mono">
                Código: {activity.code}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {results.length === 0 ? (
          <EmptyResults />
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-3 sm:gap-4 opacity-0 animate-slide-up"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <StatCard
                icon={<IconUsers />}
                value={results.length}
                label="Intentos"
                color="primary"
              />
              <StatCard
                icon={<IconTarget />}
                value={`${avgPercentage}%`}
                label="Promedio"
                color="accent"
              />
              <StatCard
                icon={<IconTrophy />}
                value={`${bestScore}%`}
                label="Mejor"
                color="violet"
              />
            </div>

            {/* Table */}
            <div
              className="bg-white rounded-2xl shadow-elevated overflow-hidden opacity-0 animate-slide-up"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="px-5 py-4 text-left text-sm font-semibold text-stone-600">
                        Alumno
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold text-stone-600">
                        Fecha
                      </th>
                      <th className="px-5 py-4 text-center text-sm font-semibold text-stone-600">
                        Puntaje
                      </th>
                      <th className="px-5 py-4 text-center text-sm font-semibold text-stone-600">
                        Tiempo
                      </th>
                      <th className="px-5 py-4 text-center text-sm font-semibold text-stone-600">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {results.map((result, index) => (
                      <tr
                        key={result.id}
                        className="hover:bg-stone-50/50 transition-colors opacity-0 animate-slide-up"
                        style={{ animationDelay: `${300 + index * 50}ms`, animationFillMode: 'forwards' }}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-800">{result.studentName}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-stone-500">{formatDate(result.startedAt)}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                              result.percentage >= 70
                                ? 'bg-primary-50 text-primary-700'
                                : result.percentage >= 50
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-coral-50 text-coral-600'
                            }`}
                          >
                            {result.score}/{result.totalQuestions}
                            <span className="text-xs font-medium opacity-70">
                              ({result.percentage}%)
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 text-sm text-stone-500">
                            <IconClock className="w-3.5 h-3.5" />
                            {formatTime(result.timeUsed)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {result.finishedAt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                              <IconCheck className="w-3 h-3" />
                              Completado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              En progreso
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  color: 'primary' | 'accent' | 'violet'
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  const textColors = {
    primary: 'text-primary-600',
    accent: 'text-accent-600',
    violet: 'text-violet-600',
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-elevated hover:shadow-elevated-hover transition-shadow duration-300">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${textColors[color]}`}>{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  )
}

function EmptyResults() {
  return (
    <div
      className="text-center py-16 px-6 bg-white rounded-3xl shadow-elevated opacity-0 animate-scale-in"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-400">
        <IconChart />
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">
        Sin resultados aún
      </h3>
      <p className="text-stone-500 mb-6 max-w-sm mx-auto">
        Comparte el código de la actividad con tus alumnos para que empiecen a jugar
      </p>
      <a
        href={ROUTES.dashboard}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-primary-600 bg-primary-50 hover:bg-primary-100 font-semibold rounded-xl transition-colors"
      >
        <IconArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </a>
    </div>
  )
}
