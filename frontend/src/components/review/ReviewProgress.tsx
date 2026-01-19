'use client'

import { motion } from 'framer-motion'

interface ReviewProgressProps {
  current: number
  total: number
}

export function ReviewProgress({ current, total }: ReviewProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-blue-600 rounded-full"
        />
      </div>
    </div>
  )
}
