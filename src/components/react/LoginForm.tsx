import { useState } from 'react'
import { api } from '../../lib/api'
import { API_ROUTES, ROUTES } from '../../lib/routes'
import { useAuthStore } from '../../stores/authStore'

interface AuthResponse {
  token: string
  teacher: {
    id: string
    email: string
    name: string
  }
}

// Icons
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

function IconUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconMail({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconEye({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
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

function IconSparkles({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? API_ROUTES.login : API_ROUTES.register
      const body = isLogin
        ? { email, password }
        : { email, password, name }

      const data = await api.post<AuthResponse>(endpoint, body)
      setAuth(data.token, data.teacher)
      window.location.href = ROUTES.dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-animated" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctext%20x%3D%225%22%20y%3D%2225%22%20font-family%3D%22monospace%22%20font-size%3D%2218%22%20fill%3D%22white%22%20fill-opacity%3D%220.08%22%3EA%3C%2Ftext%3E%3Ctext%20x%3D%2235%22%20y%3D%2250%22%20font-family%3D%22monospace%22%20font-size%3D%2218%22%20fill%3D%22white%22%20fill-opacity%3D%220.08%22%3EB%3C%2Ftext%3E%3C%2Fsvg%3E')]" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <IconBrain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">TeachGenius</h1>
                <p className="text-white/70">Aprende jugando</p>
              </div>
            </div>
          </div>

          <div className="opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Transforma el<br />
              aprendizaje en<br />
              <span className="text-white/80">una aventura</span>
            </h2>
          </div>

          <div className="opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <p className="text-lg text-white/70 mb-8 max-w-md">
              Crea pupiletras educativos de figuras literarias y observa cómo tus alumnos aprenden mientras se divierten.
            </p>
          </div>

          <div className="opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-6">
              <Feature icon={<IconSparkles className="w-5 h-5" />} text="Fácil de crear" />
              <Feature icon={<IconSparkles className="w-5 h-5" />} text="Resultados en tiempo real" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-letters-pattern px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-animated flex items-center justify-center">
                <IconBrain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-800">TeachGenius</span>
            </div>
          </div>

          {/* Form Card */}
          <div
            className="bg-white rounded-3xl shadow-elevated p-8 opacity-0 animate-scale-in"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-stone-800">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h2>
              <p className="text-stone-500 mt-1">
                {isLogin ? 'Ingresa a tu cuenta de profesor' : 'Empieza a crear actividades'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                      <IconUser className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <IconMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
                    placeholder="profesor@colegio.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors bg-stone-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-coral-50 border border-coral-200 rounded-xl">
                  <p className="text-sm text-coral-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 gradient-animated text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <IconLoader className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  isLogin ? 'Iniciar sesión' : 'Crear cuenta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-stone-500">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-stone-400 mt-6">
            Plataforma educativa para profesores
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-white/80">
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
