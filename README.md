# TeachGenius Frontend

Interfaz web de **TeachGenius**, una plataforma educativa gamificada donde profesores crean pupiletras interactivos y los alumnos los resuelven en tiempo real.

## Tech Stack

- **Astro 5** — Framework web con SSR (Node adapter)
- **React 19** — Componentes interactivos
- **Tailwind CSS 4** — Estilos utility-first
- **Zustand** — Estado global con persistencia en localStorage
- **Zod** — Validación de schemas
- **Framer Motion** — Animaciones fluidas
- **TypeScript** — Tipado estricto

## Funcionalidades

### Para Profesores
- Registro e inicio de sesión con JWT
- Dashboard con estadísticas (actividades, jugadores, preguntas)
- Crear/editar/eliminar actividades con hasta 50 preguntas
- Código único por actividad para compartir con alumnos
- Tabla de resultados con scores, tiempos y porcentajes

### Para Alumnos
- Ingresar con código de actividad (sin registro)
- Pupiletras interactivo en grid 15x15
- Selección en 8 direcciones (horizontal, vertical, diagonal)
- Temporizador con indicador de urgencia
- Pistas opcionales por pregunta
- Pantalla de resultados al finalizar

## Estructura

```
src/
├── pages/          # Rutas Astro (/, /login, /dashboard, /jugar/[code])
├── components/     # React (Game, WordSearch, Dashboard, LoginForm, etc.)
├── stores/         # Zustand (authStore, gameStore)
├── lib/            # Utilidades y generador de pupiletras
├── layouts/        # Layout principal
└── styles/         # CSS global y paleta de colores
```

## Instalación

```bash
pnpm install
cp .env.example .env   # Configurar API URL
pnpm run dev
```

## Variables de entorno

Ver [`.env.example`](.env.example) para las variables requeridas.

## Repositorio relacionado

- **Backend**: [TeachGenius_Backend](https://github.com/Gianpierre-dev/TeachGenius_Backend)
