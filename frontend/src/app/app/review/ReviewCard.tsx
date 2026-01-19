'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { applyReview } from '@/app/actions/reviews'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CardFlip } from '@/components/review/CardFlip'
import { ReviewProgress } from '@/components/review/ReviewProgress'
import { Celebration } from '@/components/review/Celebration'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

type CardWithState = {
  id: string
  deck_id: string
  front: string
  back: string
  front_html?: string | null
  back_html?: string | null
  front_image_url?: string | null
  back_image_url?: string | null
  tags: string[] | null
  card_state: {
    due_at: string
    interval_days: number
    ease_factor: number
    reps: number
    lapses: number
  } | null
}

export function ReviewCard({ initialCards }: { initialCards: CardWithState[] }) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [showCelebration, setShowCelebration] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const [optimisticCards, setOptimisticCards] = useOptimistic(
    initialCards,
    (state, cardId: string) => state.filter((c) => c.id !== cardId)
  )

  const currentCard = optimisticCards[currentIndex]

  const { ref } = useSwipeGesture({
    onSwipeLeft: () => handleRating(0), // Again
    onSwipeRight: () => handleRating(3), // Easy
    onSwipeUp: () => handleRating(2), // Good
    onSwipeDown: () => handleRating(1), // Hard
  })

  if (!currentCard) {
    return (
      <>
        <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          className="rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 p-12 text-center shadow-2xl"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
            All done! No more cards to review.
          </p>
          <Button onClick={() => router.refresh()}>
            Check for more cards
          </Button>
        </motion.div>
      </>
    )
  }

  const handleRating = async (rating: 0 | 1 | 2 | 3) => {
    startTransition(async () => {
      const wasLastCard = currentIndex === optimisticCards.length - 1
      setOptimisticCards(currentCard.id)
      const result = await applyReview(currentCard.id, rating)
      if (result.success) {
        setIsRevealed(false)
        // After removing the current card, the array shifts down
        // The next card is now at currentIndex, so we should NOT increment
        // Check if there are more cards remaining after removal
        if (wasLastCard || optimisticCards.length === 1) {
          // This was the last card (or only card remaining)
          setShowCelebration(true)
          setTimeout(() => {
            router.refresh()
          }, 2000)
        }
        // Otherwise, stay at currentIndex (next card is already there after removal)
      } else {
        toast.error('Failed to apply review', result.error)
        router.refresh()
      }
    })
  }

  const frontContent = (
    <div className="flex flex-col items-center justify-center h-full">
      {currentCard.front_image_url && (
        <img
          src={currentCard.front_image_url}
          alt="Card front"
          className="mb-4 max-w-full h-auto rounded-md max-h-48"
        />
      )}
      {currentCard.front_html ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-xl text-black dark:text-zinc-50 text-center"
          dangerouslySetInnerHTML={{ __html: currentCard.front_html }}
        />
      ) : (
        <p className="text-xl text-black dark:text-zinc-50 text-center">{currentCard.front}</p>
      )}
    </div>
  )

  const backContent = (
    <div className="flex flex-col items-center justify-center h-full">
      {currentCard.back_image_url && (
        <img
          src={currentCard.back_image_url}
          alt="Card back"
          className="mb-4 max-w-full h-auto rounded-md max-h-48"
        />
      )}
      {currentCard.back_html ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-xl text-black dark:text-zinc-50 text-center"
          dangerouslySetInnerHTML={{ __html: currentCard.back_html }}
        />
      ) : (
        <p className="text-xl text-black dark:text-zinc-50 text-center">{currentCard.back}</p>
      )}
    </div>
  )

  // Show next 2 cards in stack
  const nextCards = optimisticCards.slice(currentIndex + 1, currentIndex + 3)

  return (
    <>
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
      <motion.div
        key={currentCard.id}
        initial={{ opacity: 0, x: 20, rotateY: -15 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -20, rotateY: 15, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="space-y-6 perspective-2000"
      >
        <div className="flex items-center justify-between glass-subtle rounded-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Card {currentIndex + 1} of {optimisticCards.length}
          </div>
          <ReviewProgress current={currentIndex} total={optimisticCards.length} />
        </div>

        {/* 3D Card Stack */}
        <div className="relative perspective-2000" style={{ minHeight: '300px' }}>
          {/* Stack Background Cards */}
          {nextCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 0.3 - idx * 0.1,
                scale: 0.95 - idx * 0.05,
                y: (idx + 1) * 10,
                rotateY: (idx + 1) * 5,
                z: -(idx + 1) * 20,
              }}
              className="absolute inset-0 rounded-xl glass border border-gray-200/30 dark:border-gray-800/30"
              style={{
                transformStyle: 'preserve-3d',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Current Card */}
          <motion.div
            ref={ref}
            className="relative cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) {
                handleRating(3) // Easy
              } else if (info.offset.x < -50) {
                handleRating(0) // Again
              }
            }}
            whileDrag={(_, info) => ({
              scale: 1.05,
              rotateZ: info.offset.x / 10,
            })}
          >
            <CardFlip isFlipped={isRevealed} front={frontContent} back={backContent} />
          </motion.div>
        </div>

        {!isRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => setIsRevealed(true)}
              className="w-full glass-strong glow-blue"
              size="lg"
            >
              Reveal Answer
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4 glass-subtle rounded-lg p-2">
              How well did you know this?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleRating(0)}
                  disabled={isPending}
                  variant="danger"
                  isLoading={isPending}
                  className="w-full glow-red"
                >
                  Again
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleRating(1)}
                  disabled={isPending}
                  variant="secondary"
                  isLoading={isPending}
                  className="w-full"
                >
                  Hard
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleRating(2)}
                  disabled={isPending}
                  variant="primary"
                  isLoading={isPending}
                  className="w-full glow-blue"
                >
                  Good
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleRating(3)}
                  disabled={isPending}
                  variant="primary"
                  isLoading={isPending}
                  className="w-full glow-green"
                >
                  Easy
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Swipe to rate: ← Again, → Easy, ↑ Good, ↓ Hard
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
