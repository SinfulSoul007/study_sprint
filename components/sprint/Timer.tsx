'use client'

import { useEffect, Dispatch, SetStateAction } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  timeLeft: number
  setTimeLeft: Dispatch<SetStateAction<number>>
  isRunning: boolean
  onTimeUp: () => void
}

export default function Timer({ timeLeft, setTimeLeft, isRunning, onTimeUp }: TimerProps) {
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, setTimeLeft, onTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const totalTime = 25 * 60 // 25 minutes
    const progress = ((totalTime - timeLeft) / totalTime) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const getTimerColor = () => {
    const percentage = (timeLeft / (25 * 60)) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="relative w-16 h-16">
        {/* Background circle */}
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Progress circle */}
          <path
            className={getTimerColor()}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${100 - getProgressPercentage()}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        
        {/* Timer icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock size={20} className={getTimerColor()} />
        </div>
      </div>
      
      <div className="text-right">
        <div className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-gray-500">
          {isRunning ? 'Running' : 'Paused'}
        </div>
      </div>
    </div>
  )
} 