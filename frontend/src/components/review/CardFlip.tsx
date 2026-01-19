'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardFlipProps {
  isFlipped: boolean
  front: ReactNode
  back: ReactNode
}

export function CardFlip({ isFlipped, front, back }: CardFlipProps) {
  return (
    <div className="perspective-1000 h-64 w-full">
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 backface-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 backface-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}
