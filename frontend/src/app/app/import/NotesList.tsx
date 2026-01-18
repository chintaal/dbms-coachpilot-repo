'use client'

import { useState } from 'react'
import { createCard } from '@/app/actions/cards'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Note = Database['public']['Tables']['notes'] extends { Row: infer R } ? R : any
type Deck = Database['public']['Tables']['decks'] extends { Row: infer R } ? R : any

export function NotesList({ notes, decks }: { notes: Note[]; decks: Deck[] }) {
  const [selectedNoteId, setSelectedNoteId] = useState<string>('')
  const [selectedDeckId, setSelectedDeckId] = useState<string>('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeckId || !front || !back) return

    setIsCreating(true)
    const result = await createCard(selectedDeckId, front, back, undefined, selectedNoteId || undefined)
    if (result.success) {
      setFront('')
      setBack('')
      setSelectedNoteId('')
      router.refresh()
    } else {
      console.error('Failed to create card:', result.error)
    }
    setIsCreating(false)
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No notes yet. Create your first note above!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
        >
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Note from {new Date(note.created_at).toLocaleDateString()}
            </p>
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {note.raw_text}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Create card from this note:
            </p>
            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
                >
                  <option value="">Select a deck...</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Front (question/term)"
                  required
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 mb-2"
                />
                <input
                  type="text"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Back (answer/definition)"
                  required
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
                />
              </div>
              <button
                type="submit"
                onClick={() => setSelectedNoteId(note.id)}
                disabled={isCreating || !selectedDeckId || !front || !back}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Card'}
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
