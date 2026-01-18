'use client'

import { useState, useTransition } from 'react'
import { createCard } from '@/app/actions/cards'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Deck = Database['public']['Tables']['decks'] extends { Row: infer R } ? R : any

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function VoiceCardForm({ decks }: { decks: Deck[] }) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isRecordingFront, setIsRecordingFront] = useState(false)
  const [isRecordingBack, setIsRecordingBack] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const initializeRecognition = () => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.')
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    return recognition
  }

  const startListening = (target: 'front' | 'back') => {
    const rec = initializeRecognition()
    if (!rec) return

    setRecognition(rec)
    setIsListening(true)

    if (target === 'front') {
      setIsRecordingFront(true)
      setFront('')
    } else {
      setIsRecordingBack(true)
      setBack('')
    }

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (target === 'front') {
        setFront(transcript)
        setIsRecordingFront(false)
      } else {
        setBack(transcript)
        setIsRecordingBack(false)
      }
      setIsListening(false)
    }

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setIsRecordingFront(false)
      setIsRecordingBack(false)
      alert('Speech recognition error. Please try again.')
    }

    rec.onend = () => {
      setIsListening(false)
      setIsRecordingFront(false)
      setIsRecordingBack(false)
    }

    rec.start()
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
      setIsRecordingFront(false)
      setIsRecordingBack(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeckId || !front || !back) return

    startTransition(async () => {
      const result = await createCard(selectedDeckId, front, back)
      if (result.success) {
        setFront('')
        setBack('')
        setSelectedDeckId('')
        router.refresh()
      } else {
        console.error('Failed to create card:', result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div>
        <label
          htmlFor="deck"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Deck
        </label>
        <select
          id="deck"
          value={selectedDeckId}
          onChange={(e) => setSelectedDeckId(e.target.value)}
          required
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
        >
          <option value="">Choose a deck...</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="front"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Front
        </label>
        <div className="flex gap-2">
          <textarea
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={3}
            required
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Question or term"
          />
          <button
            type="button"
            onClick={() => {
              if (isRecordingFront) {
                stopListening()
              } else {
                startListening('front')
              }
            }}
            disabled={isListening && !isRecordingFront}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              isRecordingFront
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {isRecordingFront ? '⏹ Stop' : '🎤 Record'}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="back"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Back
        </label>
        <div className="flex gap-2">
          <textarea
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={3}
            required
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Answer or definition"
          />
          <button
            type="button"
            onClick={() => {
              if (isRecordingBack) {
                stopListening()
              } else {
                startListening('back')
              }
            }}
            disabled={isListening && !isRecordingBack}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              isRecordingBack
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {isRecordingBack ? '⏹ Stop' : '🎤 Record'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedDeckId || !front || !back}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Card'}
      </button>
    </form>
  )
}
