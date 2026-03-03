import { useEffect } from 'react'

interface TimerProps {
  timeRemaining: number
  totalTime: number
  onTimeUp: () => void
  onTick: (time: number) => void
}

export default function Timer({ timeRemaining, totalTime, onTimeUp, onTick }: TimerProps) {
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp()
      return
    }

    const interval = setInterval(() => {
      onTick(timeRemaining - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, onTimeUp, onTick])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const percentage = (timeRemaining / totalTime) * 100
  const isUrgent = percentage <= 20

  return (
    <div
      className={`
        px-3 py-1.5 rounded-lg font-mono text-sm font-semibold
        ${isUrgent
          ? 'bg-red-100 text-red-700'
          : 'bg-slate-100 text-slate-700'}
      `}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
