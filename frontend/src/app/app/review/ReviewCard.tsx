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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4">
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

  return (
    <>
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
      <motion.div
        key={currentCard.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Card {currentIndex + 1} of {optimisticCards.length}
          </div>
          <ReviewProgress current={currentIndex} total={optimisticCards.length} />
        </div>

        <div ref={ref} className="cursor-grab active:cursor-grabbing">
          <CardFlip isFlipped={isRevealed} front={frontContent} back={backContent} />
        </div>

        {!isRevealed ? (
          <Button
            onClick={() => setIsRevealed(true)}
            className="w-full"
            size="lg"
          >
            Reveal Answer
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
              How well did you know this?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleRating(0)}
                disabled={isPending}
                variant="danger"
                isLoading={isPending}
              >
                Again
              </Button>
              <Button
                onClick={() => handleRating(1)}
                disabled={isPending}
                variant="secondary"
                isLoading={isPending}
              >
                Hard
              </Button>
              <Button
                onClick={() => handleRating(2)}
                disabled={isPending}
                variant="primary"
                isLoading={isPending}
              >
                Good
              </Button>
              <Button
                onClick={() => handleRating(3)}
                disabled={isPending}
                variant="primary"
                isLoading={isPending}
              >
                Easy
              </Button>
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
