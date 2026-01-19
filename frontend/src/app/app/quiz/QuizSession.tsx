'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Cards are fetched via API route
import { createQuizSession, submitQuizAnswer, endQuizSession } from '@/app/actions/quiz'
import type { Database } from '@/types/supabase'
import { pageTransition, springBounce } from '@/lib/animations/variants'
import { Button } from '@/components/ui/Button'

// Use conditional types to handle cases where tables don't exist yet
type Deck = Database['public']['Tables']['decks'] extends { Row: infer R } ? R : any
type Card = Database['public']['Tables']['cards'] extends { Row: infer R } ? R : any

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
    const sessionResult = await createQuizSession(selectedDeckId, 'front->back')
    if (sessionResult.success) {
      setSessionId(sessionResult.session.id)

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
    } else {
      console.error('Failed to start quiz:', sessionResult.error)
    }
    setLoading(false)
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (!sessionId || !cards[currentIndex]) return

    const cardId = cards[currentIndex].id
    const newAnswers = { ...answers, [cardId]: isCorrect }
    setAnswers(newAnswers)

    const answerResult = await submitQuizAnswer(sessionId, cardId, isCorrect)
    if (!answerResult.success) {
      console.error('Failed to submit answer:', answerResult.error)
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsRevealed(false)
    } else {
      // Quiz finished
      const correctCount = Object.values(newAnswers).filter((v) => v).length
      const endResult = await endQuizSession(sessionId, cards.length, correctCount)
      if (endResult.success) {
        setIsFinished(true)
      } else {
        console.error('Failed to end quiz:', endResult.error)
      }
    }
  }

  if (isFinished && sessionId) {
    const correct = Object.values(answers).filter((v) => v).length
    const total = cards.length
    const percentage = Math.round((correct / total) * 100)

    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Quiz Results</h1>
        <motion.div
          variants={springBounce}
          className="rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 p-12 text-center shadow-2xl"
        >
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="text-6xl font-bold text-black dark:text-zinc-50 mb-4"
          >
            {correct} / {total}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-3xl font-semibold mb-8 ${
              percentage >= 80
                ? 'text-green-500'
                : percentage >= 60
                ? 'text-yellow-500'
                : 'text-red-500'
            }`}
          >
            {percentage}%
          </motion.p>
          <Button
            onClick={() => {
              setSessionId(null)
              setSelectedDeckId('')
              setCards([])
              setCurrentIndex(0)
              setAnswers({})
              setIsFinished(false)
            }}
            className="glow-blue"
          >
            Start New Quiz
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  if (!sessionId) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Quiz</h1>
        <motion.div
          variants={springBounce}
          className="rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 p-8 shadow-2xl"
        >
          <div className="mb-6">
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
              className="block w-full rounded-lg glass border border-gray-200/50 dark:border-gray-800/50 px-4 py-3 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a deck...</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleStartQuiz}
            disabled={!selectedDeckId || loading}
            className="w-full glow-blue"
            size="lg"
          >
            {loading ? 'Starting...' : 'Start Quiz'}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  const currentCard = cards[currentIndex]

  if (!currentCard) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-strong rounded-xl p-8 text-center"
      >
        Loading cards...
      </motion.div>
    )
  }

  return (
    <motion.div
      key={currentCard.id}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Quiz</h1>
        <div className="glass-subtle rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          Question {currentIndex + 1} of {cards.length}
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 100, rotateY: 15 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -100, rotateY: -15 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 p-8 shadow-2xl"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="mb-8 min-h-[200px]">
          {currentCard.front_image_url && (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={currentCard.front_image_url}
              alt="Card front"
              className="mb-4 max-w-full h-auto rounded-lg max-h-64 mx-auto"
            />
          )}
          {currentCard.front_html ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-xl text-black dark:text-zinc-50 mb-4 text-center"
              dangerouslySetInnerHTML={{ __html: currentCard.front_html }}
            />
          ) : (
            <p className="text-xl text-black dark:text-zinc-50 mb-4 text-center">{currentCard.front}</p>
          )}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 border-t border-gray-200/50 dark:border-gray-800/50 pt-6"
              >
                {currentCard.back_image_url && (
                  <img
                    src={currentCard.back_image_url}
                    alt="Card back"
                    className="mb-4 max-w-full h-auto rounded-lg max-h-64 mx-auto"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isRevealed ? (
          <Button
            onClick={() => setIsRevealed(true)}
            className="w-full glow-blue"
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4 glass-subtle rounded-lg p-2">
              Did you get it right?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="danger"
                  className="w-full glow-red"
                  size="lg"
                >
                  Incorrect
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleAnswer(true)}
                  variant="primary"
                  className="w-full glow-green"
                  size="lg"
                >
                  Correct
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
