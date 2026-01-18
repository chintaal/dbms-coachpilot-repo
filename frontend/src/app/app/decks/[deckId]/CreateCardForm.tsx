'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { createCard } from '@/app/actions/cards'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Card = Database['public']['Tables']['cards'] extends { Row: infer R } ? R : any

export function CreateCardForm({ deckId }: { deckId: string }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [tags, setTags] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    startTransition(async () => {
      const result = await createCard(deckId, front, back, tagsArray.length > 0 ? tagsArray : undefined)
      if (result.success) {
        setFront('')
        setBack('')
        setTags('')
        router.refresh()
      } else {
        console.error('Failed to create card:', result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div>
        <label
          htmlFor="front"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Front
        </label>
        <textarea
          id="front"
          required
          value={front}
          onChange={(e) => setFront(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Question or term"
        />
      </div>
      <div>
        <label
          htmlFor="back"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Back
        </label>
        <textarea
          id="back"
          required
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Answer or definition"
        />
      </div>
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Card'}
      </button>
    </form>
  )
}
