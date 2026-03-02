import { motion } from 'framer-motion'

interface QuestionCardProps {
  questionNumber: number
  totalQuestions: number
  question: string
  example: string
  hint: string | null
  showHint: boolean
  onShowHint: () => void
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  example,
  hint,
  showHint,
  onShowHint,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < questionNumber ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
        {question}
      </h2>

      <div className="bg-primary-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">Ejemplo:</p>
        <p className="text-gray-800 italic">&ldquo;{example}&rdquo;</p>
      </div>

      {hint && (
        <div className="mt-4">
          {showHint ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
            >
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Pista:</span> {hint}
              </p>
            </motion.div>
          ) : (
            <button
              onClick={onShowHint}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Mostrar pista
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
