'use client'

import { useRef, useState } from 'react'
import { useGesture } from '@use-gesture/react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeGestureOptions) {
  const [swiping, setSwiping] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useGesture(
    {
      onDragEnd: ({ direction, velocity, movement }) => {
        const [x, y] = direction
        const [mx, my] = movement
        const [vx, vy] = velocity

        // Check if swipe is significant enough
        if (Math.abs(mx) > threshold || Math.abs(my) > threshold) {
          if (Math.abs(x) > Math.abs(y)) {
            // Horizontal swipe
            if (x > 0 && onSwipeRight) {
              onSwipeRight()
            } else if (x < 0 && onSwipeLeft) {
              onSwipeLeft()
            }
          } else {
            // Vertical swipe
            if (y > 0 && onSwipeDown) {
              onSwipeDown()
            } else if (y < 0 && onSwipeUp) {
              onSwipeUp()
            }
          }
        }
        setSwiping(false)
      },
      onDrag: () => {
        setSwiping(true)
      },
    },
    {
      target: ref,
      drag: { axis: 'xy', threshold: 10 },
    }
  )

  return { ref, swiping }
}
