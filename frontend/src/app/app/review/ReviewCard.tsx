'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { applyReview } from '@/app/actions/reviews'
import { useRouter } from 'next/navigation'

type CardWithState = {
  id: string
  deck_id: string
  front: string
  back: string
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
  const router = useRouter()
  const [optimisticCards, setOptimisticCards] = useOptimistic(
    initialCards,
    (state, cardId: string) => state.filter((c) => c.id !== cardId)
  )

  const currentCard = optimisticCards[currentIndex]

  if (!currentCard) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          All done! No more cards to review.
        </p>
        <button
          onClick={() => router.refresh()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Check for more cards
        </button>
      </div>
    )
  }

  const handleRating = async (rating: 0 | 1 | 2 | 3) => {
    startTransition(async () => {
      setOptimisticCards(currentCard.id)
      try {
        await applyReview(currentCard.id, rating)
        setIsRevealed(false)
        if (currentIndex < optimisticCards.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else {
          router.refresh()
        }
      } catch (error) {
        console.error('Failed to apply review:', error)
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Card {currentIndex + 1} of {optimisticCards.length}
      </div>

      <div className="mb-8 min-h-[200px]">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Front:
          </p>
          <p className="text-xl text-black dark:text-zinc-50">{currentCard.front}</p>
        </div>

        {isRevealed && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Back:
            </p>
            <p className="text-xl text-black dark:text-zinc-50">{currentCard.back}</p>
          </div>
        )}
      </div>

      {!isRevealed ? (
        <button
          onClick={() => setIsRevealed(true)}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Reveal Answer
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
            How well did you know this?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleRating(0)}
              disabled={isPending}
              className="rounded-md bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Again
            </button>
            <button
              onClick={() => handleRating(1)}
              disabled={isPending}
              className="rounded-md bg-orange-600 px-4 py-3 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Hard
            </button>
            <button
              onClick={() => handleRating(2)}
              disabled={isPending}
              className="rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Good
            </button>
            <button
              onClick={() => handleRating(3)}
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Easy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
