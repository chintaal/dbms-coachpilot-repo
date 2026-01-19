'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface CardFlipProps {
  isFlipped: boolean
  front: ReactNode
  back: ReactNode
}

export function CardFlip({ isFlipped, front, back }: CardFlipProps) {
  return (
    <div className="perspective-2000 h-64 w-full relative">
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isFlipped ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.8,
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 backface-hidden rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            WebkitBackfaceVisibility: 'hidden',
          }}
          animate={{
            opacity: isFlipped ? 0 : 1,
            boxShadow: isFlipped
              ? '0 0 0px rgba(59, 130, 246, 0)'
              : '0 0 40px rgba(59, 130, 246, 0.3), 0 0 80px rgba(59, 130, 246, 0.1)',
          }}
          transition={{ duration: 0.4 }}
        >
          {front}
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 backface-hidden rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            WebkitBackfaceVisibility: 'hidden',
          }}
          animate={{
            opacity: isFlipped ? 1 : 0,
            boxShadow: isFlipped
              ? '0 0 40px rgba(34, 197, 94, 0.3), 0 0 80px rgba(34, 197, 94, 0.1)'
              : '0 0 0px rgba(34, 197, 94, 0)',
          }}
          transition={{ duration: 0.4 }}
        >
          {back}
        </motion.div>

        {/* Glow Effect on Flip */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
