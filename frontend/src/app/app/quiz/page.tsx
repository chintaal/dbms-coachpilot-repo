import { listDecks } from '@/lib/db/decks'
import { QuizSession } from './QuizSession'

export default async function QuizPage() {
  let decks = []
  try {
    decks = await listDecks()
  } catch (error) {
    // If tables don't exist yet, return empty array
    console.error('Failed to load decks:', error)
    decks = []
  }

  return <QuizSession decks={decks} />
}
