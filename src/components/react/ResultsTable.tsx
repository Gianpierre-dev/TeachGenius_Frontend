import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

export default function ResultsTable({ activityId }: ResultsTableProps) {
  const [results, setResults] = useState<Result[]>([])
  const [activity, setActivity] = useState<ActivityInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
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
  }, [activityId, token])

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Actividad no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a
              href={ROUTES.dashboard}
              className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
            >
              ← Volver al dashboard
            </a>
            <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            <p className="text-gray-500">Código: {activity.code}</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
            <p className="text-gray-500">Aún no hay alumnos que hayan completado esta actividad</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <p className="text-sm text-gray-500 mb-1">Total de intentos</p>
                <p className="text-3xl font-bold text-gray-900">{results.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <p className="text-sm text-gray-500 mb-1">Promedio de aciertos</p>
                <p className="text-3xl font-bold text-primary-600">
                  {Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <p className="text-sm text-gray-500 mb-1">Mejor puntaje</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.max(...results.map((r) => r.percentage))}%
                </p>
              </motion.div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Alumno
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                        Puntaje
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                        Tiempo
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{result.studentName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{formatDate(result.startedAt)}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              result.percentage >= 70
                                ? 'bg-green-100 text-green-800'
                                : result.percentage >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.score}/{result.totalQuestions} ({result.percentage}%)
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-600">
                            {formatTime(result.timeUsed)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {result.finishedAt ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
      </div>
    </div>
  )
}
