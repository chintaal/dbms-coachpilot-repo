'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Flame, BookOpen, Target, Clock } from 'lucide-react'
import { staggerContainer, springBounce } from '@/lib/animations/variants'
import { useState, useRef, useEffect } from 'react'

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

  const AnimatedNumber = ({ value, delay = 0 }: { value: number | string; delay?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value

    useEffect(() => {
      if (typeof value === 'number') {
        const timer = setTimeout(() => {
          const duration = 2000
          const steps = 60
          const increment = numValue / steps
          let current = 0
          const interval = setInterval(() => {
            current += increment
            if (current >= numValue) {
              setDisplayValue(numValue)
              clearInterval(interval)
            } else {
              setDisplayValue(Math.floor(current))
            }
          }, duration / steps)
          return () => clearInterval(interval)
        }, delay)
        return () => clearTimeout(timer)
      }
    }, [value, numValue, delay])

    return <span>{typeof value === 'string' ? value : Math.floor(displayValue)}</span>
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          variants={springBounce}
          custom={index}
        >
          <Card hover variant="glass-strong" className="p-6 group relative overflow-hidden">
            <motion.div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${card.bgColor}`}
              initial={false}
            />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {card.title}
                </p>
                <motion.p
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {typeof card.value === 'number' ? (
                    <AnimatedNumber value={card.value} delay={index * 100} />
                  ) : (
                    card.value
                  )}
                </motion.p>
              </div>
              <motion.div
                className={`rounded-full p-3 ${card.bgColor} glass-subtle`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </motion.div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
