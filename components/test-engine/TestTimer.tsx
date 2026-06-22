'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface TestTimerProps {
  timeRemaining: number
}

export default function TestTimer({ timeRemaining }: TestTimerProps) {
  const [time, setTime] = useState(timeRemaining)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  const isWarning = time < 300

  return (
    <Badge
      variant="outline"
      className={`text-sm font-mono px-4 py-1.5 ${
        isWarning ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-[#0B1F3A]'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </Badge>
  )
}
