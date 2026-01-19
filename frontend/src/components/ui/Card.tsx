'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import { cardHover, card3DHover } from '@/lib/animations/variants'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'glass' | 'glass-strong' | '3d'
}

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  variant = 'default',
}: CardProps) {
  const Component = onClick ? motion.button : motion.div
  const ref = useRef<HTMLDivElement | HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !hover) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    const rotateXValue = (distanceY / (rect.height / 2)) * 10
    const rotateYValue = (distanceX / (rect.width / 2)) * 10
    rotateX.set(rotateXValue)
    rotateY.set(rotateYValue)
    x.set(distanceX * 0.1)
    y.set(distanceY * 0.1)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    x.set(0)
    y.set(0)
  }

  const baseClasses = `
    rounded-lg border
    transition-all duration-300
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  const variantClasses = {
    default: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md',
    glass: 'glass border-gray-200/50 dark:border-gray-800/50',
    'glass-strong': 'glass-strong border-gray-200/50 dark:border-gray-800/50',
    '3d': 'glass-strong border-gray-200/50 dark:border-gray-800/50 shadow-3d',
  }

  const style = variant === '3d' && hover
    ? {
        transformStyle: 'preserve-3d' as const,
        rotateX,
        rotateY,
        x,
        y,
      }
    : hover
    ? { x, y }
    : {}

  return (
    <Component
      ref={ref}
      variants={variant === '3d' ? card3DHover : cardHover}
      initial="rest"
      whileHover={hover ? 'hover' : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={style}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </Component>
  )
}
