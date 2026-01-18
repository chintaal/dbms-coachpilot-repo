import { getReviewQueue } from '@/lib/db/reviews'
import { ReviewCard } from './ReviewCard'

export default async function ReviewPage() {
  const cards = await getReviewQueue(20)

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
        Review Queue
      </h1>

      {cards.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No cards due for review. Great job!
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Cards will appear here when they're due based on your spaced repetition schedule.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} due for review
          </p>
          <ReviewCard initialCards={cards} />
        </div>
      )}
    </div>
  )
}
