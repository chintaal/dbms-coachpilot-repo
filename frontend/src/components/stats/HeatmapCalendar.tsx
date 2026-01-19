'use client'

import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { format, startOfYear, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

interface HeatmapCalendarProps {
  data: Array<{
    review_date: string
    cards_reviewed: number
  }>
}

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const today = new Date()
  const yearStart = startOfYear(today)
  const days = eachDayOfInterval({ start: yearStart, end: today })

  const getIntensity = (date: Date) => {
    const review = data.find((r) => isSameDay(parseISO(r.review_date), date))
    if (!review) return 0
    const cards = review.cards_reviewed
    if (cards === 0) return 0
    if (cards < 5) return 1
    if (cards < 10) return 2
    if (cards < 20) return 3
    return 4
  }

  const intensityColors = [
    'bg-gray-100 dark:bg-gray-800',
    'bg-blue-200 dark:bg-blue-900/30',
    'bg-blue-400 dark:bg-blue-700',
    'bg-blue-600 dark:bg-blue-600',
    'bg-blue-800 dark:bg-blue-500',
  ]

  // Group days by week
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card variant="glass-strong" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Activity Heatmap
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-4">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const intensity = getIntensity(day)
                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ scale: 0, rotateY: -90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{
                      delay: (weekIndex * 7 + dayIndex) * 0.01,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                    }}
                    whileHover={{ scale: 1.5, z: 50 }}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${intensityColors[intensity]}`}
                    title={`${format(day, 'MMM d')}: ${intensity > 0 ? getIntensity(day) * 5 : 0} cards`}
                    style={{ transformStyle: 'preserve-3d' }}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600 dark:text-gray-400 glass-subtle rounded-lg p-3">
          <span>Less</span>
          <div className="flex gap-1">
            {intensityColors.map((color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`w-3 h-3 rounded-sm ${color}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </Card>
    </motion.div>
  )
}
