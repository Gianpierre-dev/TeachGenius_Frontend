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
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < questionNumber ? 'bg-primary-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="font-medium text-slate-900 mb-3">{question}</p>

      <div className="bg-slate-50 rounded-lg p-3 mb-3">
        <p className="text-xs text-slate-500 mb-1">Ejemplo:</p>
        <p className="text-sm text-slate-700 italic">"{example}"</p>
      </div>

      {hint && !showHint && (
        <button
          onClick={onShowHint}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Ver pista
        </button>
      )}

      {hint && showHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-600 mb-1">Pista:</p>
          <p className="text-sm text-amber-800">{hint}</p>
        </div>
      )}
    </div>
  )
}
