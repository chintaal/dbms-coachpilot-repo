'use client'

import { useState, useTransition } from 'react'
import { createNote } from '@/app/actions/notes'
import { useRouter } from 'next/navigation'

export function ImportForm() {
  const [rawText, setRawText] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawText.trim()) return

    startTransition(async () => {
      try {
        await createNote(rawText.trim())
        setRawText('')
        router.refresh()
      } catch (error) {
        console.error('Failed to create note:', error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="rawText"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Paste your notes here
        </label>
        <textarea
          id="rawText"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Paste your notes, text, or content here. You can create cards from this note later."
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !rawText.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Note'}
      </button>
    </form>
  )
}
