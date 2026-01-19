'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Flame, BookOpen, Target, Clock } from 'lucide-react'

interface OverviewCardsProps {
  stats: {
    total_cards_reviewed: number
    current_streak: number
    longest_streak: number
    total_study_time_minutes: number
  }
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Current Streak',
      value: stats.current_streak,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Total Cards Reviewed',
      value: stats.total_cards_reviewed,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Longest Streak',
      value: stats.longest_streak,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Study Time',
      value: `${Math.round(stats.total_study_time_minutes / 60)}h`,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-full p-3 ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
