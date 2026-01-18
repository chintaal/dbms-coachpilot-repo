'use client'

import { useState } from 'react'
// Cards are fetched via API route
import { createQuizSession, submitQuizAnswer, endQuizSession } from '@/app/actions/quiz'
import type { Database } from '@/types/supabase'

type Deck = Database['public']['Tables']['decks']['Row']
type Card = Database['public']['Tables']['cards']['Row']

export function QuizSession({ decks }: { decks: Deck[] }) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [isRevealed, setIsRevealed] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStartQuiz = async () => {
    if (!selectedDeckId) return

    setLoading(true)
    try {
      const session = await createQuizSession(selectedDeckId, 'front->back')
      setSessionId(session.session.id)

      // Load cards - we need to fetch them
      // For now, we'll need an API route or server action
      // Let's create a server action to get cards
      const response = await fetch(`/app/quiz/cards?deckId=${selectedDeckId}`)
      if (response.ok) {
        const cardsData = await response.json()
        setCards(cardsData)
        setCurrentIndex(0)
        setIsRevealed(false)
        setIsFinished(false)
        setAnswers({})
      }
    } catch (error) {
      console.error('Failed to start quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (!sessionId || !cards[currentIndex]) return

    const cardId = cards[currentIndex].id
    const newAnswers = { ...answers, [cardId]: isCorrect }
    setAnswers(newAnswers)

    await submitQuizAnswer(sessionId, cardId, isCorrect)

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsRevealed(false)
    } else {
      // Quiz finished
      const correctCount = Object.values(newAnswers).filter((v) => v).length
      await endQuizSession(sessionId, cards.length, correctCount)
      setIsFinished(true)
    }
  }

  if (isFinished && sessionId) {
    const correct = Object.values(answers).filter((v) => v).length
    const total = cards.length
    const percentage = Math.round((correct / total) * 100)

    return (
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Quiz Results</h1>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <p className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            {correct} / {total}
          </p>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">{percentage}%</p>
          <button
            onClick={() => {
              setSessionId(null)
              setSelectedDeckId('')
              setCards([])
              setCurrentIndex(0)
              setAnswers({})
              setIsFinished(false)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start New Quiz
          </button>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Quiz</h1>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
          <div className="mb-4">
            <label
              htmlFor="deck"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select a deck
            </label>
            <select
              id="deck"
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
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
          <button
            onClick={handleStartQuiz}
            disabled={!selectedDeckId || loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  if (!currentCard) {
    return <div>Loading cards...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Quiz</h1>
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Question {currentIndex + 1} of {cards.length}
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
        <div className="mb-8 min-h-[200px]">
          <p className="text-xl text-black dark:text-zinc-50 mb-4">{currentCard.front}</p>
          {isRevealed && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
              <p className="text-xl text-black dark:text-zinc-50">{currentCard.back}</p>
            </div>
          )}
        </div>

        {!isRevealed ? (
          <button
            onClick={() => setIsRevealed(true)}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reveal Answer
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
              Did you get it right?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(false)}
                className="rounded-md bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"
              >
                Incorrect
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
              >
                Correct
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
