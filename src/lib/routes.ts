export const ROUTES = {
  home: '/',
  login: '/login',
  registro: '/registro',
  dashboard: '/dashboard',
  nuevaActividad: '/actividades/nueva',
  editarActividad: (id: string) => `/actividades/${id}/editar`,
  resultados: (id: string) => `/actividades/${id}/resultados`,
  jugar: (code: string) => `/jugar/${code}`,
} as const

export const API_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/teachers/me',
  activities: '/activities',
  activity: (id: string) => `/activities/${id}`,
  activityResults: (id: string) => `/activities/${id}/results`,
  activityQuestions: (id: string) => `/activities/${id}/questions`,
  question: (id: string) => `/questions/${id}`,
  game: (code: string) => `/game/${code}`,
  gameStart: (code: string) => `/game/${code}/start`,
  sessionAnswer: (sessionId: string) => `/game/sessions/${sessionId}/answer`,
  sessionFinish: (sessionId: string) => `/game/sessions/${sessionId}/finish`,
} as const
