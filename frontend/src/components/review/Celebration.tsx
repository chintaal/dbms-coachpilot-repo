'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface CelebrationProps {
  show: boolean
  onComplete?: () => void
}

export function Celebration({ show, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        if (onComplete) onComplete()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: '50%', y: '50%', scale: 0, opacity: 1 }}
              animate={{
                x: `${particle.x}%`,
                y: `${particle.y}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: particle.id * 0.05,
              }}
              className="absolute"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
