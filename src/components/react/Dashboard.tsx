import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { API_ROUTES, ROUTES } from '../../lib/routes'

interface Activity {
  id: string
  code: string
  title: string
  description: string | null
  timeLimit: number
  isActive: boolean
  createdAt: string
  _count: {
    questions: number
    gameSessions: number
  }
}

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const { teacher, token, logout, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!_hasHydrated) return

    if (!token) {
      window.location.href = ROUTES.login
      return
    }

    const fetchActivities = async () => {
      try {
        const data = await api.get<Activity[]>(API_ROUTES.activities, token)
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [_hasHydrated, token])

  const handleLogout = () => {
    logout()
    window.location.href = ROUTES.home
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return

    try {
      await api.delete(API_ROUTES.activity(id), token!)
      setActivities(activities.filter((a) => a.id !== id))
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/jugar/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalPlayers = activities.reduce((acc, a) => acc + a._count.gameSessions, 0)
  const totalQuestions = activities.reduce((acc, a) => acc + a._count.questions, 0)
  const activeCount = activities.filter((a) => a.isActive).length

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-letters-pattern flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-animated flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-stone-500 font-medium">Cargando...</p>
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

        <div className="relative max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  TeachGenius
                </h1>
                <p className="text-sm text-white/70">
                  Hola, <span className="text-white font-medium">{teacher?.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 opacity-0 animate-slide-up"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <StatCard
            icon="📚"
            value={activities.length}
            label="Actividades"
            color="primary"
          />
          <StatCard
            icon="🎮"
            value={totalPlayers}
            label="Jugadores"
            color="accent"
          />
          <StatCard
            icon="❓"
            value={totalQuestions}
            label="Preguntas"
            color="violet"
          />
        </div>

        {/* Activities Header */}
        <div
          className="flex items-center justify-between mb-6 opacity-0 animate-slide-up"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          <div>
            <h2 className="text-xl font-bold text-stone-800">Mis Actividades</h2>
            <p className="text-sm text-stone-500">
              {activeCount} de {activities.length} activas
            </p>
          </div>
          <a
            href={ROUTES.nuevaActividad}
            className="group flex items-center gap-2 px-5 py-2.5 gradient-animated text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Nueva Actividad</span>
            <span className="sm:hidden">Nueva</span>
          </a>
        </div>

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                copied={copied === activity.code}
                onCopyCode={() => copyCode(activity.code)}
                onDelete={() => handleDelete(activity.id)}
              />
            ))}
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
  icon: string
  value: number
  label: string
  color: 'primary' | 'accent' | 'violet'
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-elevated hover:shadow-elevated-hover transition-shadow duration-300">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-stone-800">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  )
}

function ActivityCard({
  activity,
  index,
  copied,
  onCopyCode,
  onDelete,
}: {
  activity: Activity
  index: number
  copied: boolean
  onCopyCode: () => void
  onDelete: () => void
}) {
  const delay = 300 + index * 50

  return (
    <div
      className="group bg-white rounded-2xl shadow-elevated hover:shadow-elevated-hover transition-all duration-300 overflow-hidden opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-stone-800 text-lg leading-tight pr-2 line-clamp-2">
            {activity.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activity.isActive
                  ? 'bg-primary-500 shadow-sm shadow-primary-500/50'
                  : 'bg-stone-300'
              }`}
            />
            <span className={`text-xs font-medium ${activity.isActive ? 'text-primary-600' : 'text-stone-400'}`}>
              {activity.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-stone-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activity._count.questions}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {activity._count.gameSessions}
          </span>
        </div>
      </div>

      {/* Code Button */}
      <div className="px-5 pb-4">
        <button
          onClick={onCopyCode}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 ${
            copied
              ? 'bg-primary-100 border-2 border-primary-300'
              : 'bg-stone-50 border-2 border-transparent hover:border-primary-200 hover:bg-primary-50'
          }`}
        >
          <span className="font-mono font-bold text-lg tracking-wider text-primary-600">
            {activity.code}
          </span>
          <span className={`text-sm font-medium transition-colors ${
            copied ? 'text-primary-600' : 'text-stone-400 group-hover:text-primary-500'
          }`}>
            {copied ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copiado
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <a
          href={ROUTES.resultados(activity.id)}
          className="flex-1 py-2.5 text-center text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
        >
          Ver Resultados
        </a>
        <a
          href={ROUTES.editarActividad(activity.id)}
          className="p-2.5 text-stone-500 bg-stone-100 hover:bg-stone-200 hover:text-stone-700 rounded-xl transition-colors"
          title="Editar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </a>
        <button
          onClick={onDelete}
          className="p-2.5 text-coral-500 bg-coral-50 hover:bg-coral-100 rounded-xl transition-colors"
          title="Eliminar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="text-center py-16 px-6 bg-white rounded-3xl shadow-elevated opacity-0 animate-scale-in"
      style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        <span className="text-4xl">📝</span>
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">
        Crea tu primera actividad
      </h3>
      <p className="text-stone-500 mb-6 max-w-sm mx-auto">
        Diseña un pupiletras con figuras literarias para que tus alumnos aprendan jugando
      </p>
      <a
        href={ROUTES.nuevaActividad}
        className="inline-flex items-center gap-2 px-6 py-3 gradient-animated text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Crear Actividad
      </a>
    </div>
  )
}
