import { useEffect } from 'react'
import { motion } from 'framer-motion'

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
  const getColor = () => {
    if (percentage > 50) return 'text-green-600'
    if (percentage > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBgColor = () => {
    if (percentage > 50) return 'bg-green-100'
    if (percentage > 20) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getBgColor()}`}
      animate={percentage <= 20 ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: percentage <= 20 ? Infinity : 0 }}
    >
      <svg
        className={`w-5 h-5 ${getColor()}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className={`font-mono text-xl font-bold ${getColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </motion.div>
  )
}
