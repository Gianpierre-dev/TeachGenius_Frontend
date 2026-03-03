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

// Icon Components
function IconBrain({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5c-1.5-1.5-4-1.5-5 .5s0 4 0 4-2 1-2 3.5 2.5 3.5 3.5 3.5c0 1.5.5 3.5 3.5 3.5s3.5-2 3.5-3.5c1 0 3.5-1 3.5-3.5S17 9 17 9s1-2 0-4-3.5-2-5-.5z" />
      <path d="M12 4.5v15" />
      <path d="M7 9c1.5 0 2.5 1 2.5 2.5" />
      <path d="M17 9c-1.5 0-2.5 1-2.5 2.5" />
    </svg>
  )
}

function IconBook({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  )
}

function IconUsers({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconPuzzle({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>
  )
}

function IconPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
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

function IconCopy({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function IconEdit({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

function IconQuestion({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function IconUserGroup({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 19a6 6 0 0 0-12 0" />
      <circle cx="8" cy="9" r="4" />
      <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
    </svg>
  )
}

function IconDocument({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" x2="12" y1="18" y2="12" />
      <line x1="9" x2="15" y1="15" y2="15" />
    </svg>
  )
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
                <IconBrain className="w-6 h-6 text-white" />
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
            icon={<IconBook className="w-5 h-5" />}
            value={activities.length}
            label="Actividades"
            color="primary"
          />
          <StatCard
            icon={<IconUsers className="w-5 h-5" />}
            value={totalPlayers}
            label="Jugadores"
            color="accent"
          />
          <StatCard
            icon={<IconPuzzle className="w-5 h-5" />}
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
            <IconPlus className="w-5 h-5" />
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
  icon: React.ReactNode
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
        {icon}
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
            <IconQuestion />
            {activity._count.questions}
          </span>
          <span className="flex items-center gap-1">
            <IconUserGroup />
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
          <span className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
            copied ? 'text-primary-600' : 'text-stone-400 group-hover:text-primary-500'
          }`}>
            {copied ? (
              <>
                <IconCheck />
                Copiado
              </>
            ) : (
              <>
                <IconCopy />
                Copiar
              </>
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
          <IconEdit />
        </a>
        <button
          onClick={onDelete}
          className="p-2.5 text-coral-500 bg-coral-50 hover:bg-coral-100 rounded-xl transition-colors"
          title="Eliminar"
        >
          <IconTrash />
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
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600">
        <IconDocument />
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
        <IconPlus />
        Crear Actividad
      </a>
    </div>
  )
}
