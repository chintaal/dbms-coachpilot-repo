'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { deleteCard } from '@/app/actions/cards'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import type { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Card = Database['public']['Tables']['cards'] extends { Row: infer R } ? R : any

export function CardList({ cards, deckId }: { cards: Card[]; deckId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const toast = useToast()
  const [optimisticCards, setOptimisticCards] = useOptimistic(
    cards,
    (state, cardId: string) => state.filter((c) => c.id !== cardId)
  )

  const handleDelete = async (cardId: string) => {
    startTransition(async () => {
      setOptimisticCards(cardId)
      const result = await deleteCard(cardId, deckId)
      if (result.success) {
        toast.success('Card deleted')
        router.refresh()
      } else {
        toast.error('Failed to delete card', result.error)
        router.refresh() // Refresh to restore state on error
      }
    })
  }

  if (optimisticCards.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No cards yet. Create your first card above!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {optimisticCards.map((card) => (
        <div
          key={card.id}
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Front:
                </p>
                {card.front_image_url && (
                  <img
                    src={card.front_image_url}
                    alt="Card front"
                    className="mb-2 max-w-full h-auto rounded-md max-h-48"
                  />
                )}
                {card.front_html ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-black dark:text-zinc-50"
                    dangerouslySetInnerHTML={{ __html: card.front_html }}
                  />
                ) : (
                  <p className="text-black dark:text-zinc-50">{card.front}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Back:
                </p>
                {card.back_image_url && (
                  <img
                    src={card.back_image_url}
                    alt="Card back"
                    className="mb-2 max-w-full h-auto rounded-md max-h-48"
                  />
                )}
                {card.back_html ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-black dark:text-zinc-50"
                    dangerouslySetInnerHTML={{ __html: card.back_html }}
                  />
                ) : (
                  <p className="text-black dark:text-zinc-50">{card.back}</p>
                )}
              </div>
              {card.tags && card.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(card.id)}
              disabled={isPending}
              className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
