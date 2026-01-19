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
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        if (onComplete) onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: -180 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1, rotateY: 0 }}
            exit={{ scale: 0, opacity: 0, rotateY: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-8xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🎉
          </motion.div>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: '50%', y: '50%', scale: 0, opacity: 1, rotate: 0, z: 0 }}
              animate={{
                x: `calc(50% + ${particle.x}px)`,
                y: `calc(50% + ${particle.y}px)`,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                rotate: particle.rotation + 360,
                z: Math.random() * 100,
              }}
              transition={{
                duration: 2,
                delay: particle.id * 0.03,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Sparkles className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
