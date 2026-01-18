import { getDeck } from '@/lib/db/decks'
import { listCards } from '@/lib/db/cards'
import { listTemplates } from '@/lib/db/templates'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CreateCardForm } from './CreateCardForm'
import { CardList } from './CardList'
import { DeckActions } from './DeckActions'

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params

  try {
    const deck = await getDeck(deckId)
    let cards = []
    let templates = []
    try {
      cards = await listCards(deckId)
    } catch (error) {
      // If tables don't exist yet, return empty array
      console.error('Failed to load cards:', error)
      cards = []
    }
    try {
      templates = await listTemplates()
    } catch (error) {
      // If tables don't exist yet, return empty array
      console.error('Failed to load templates:', error)
      templates = []
    }

    return (
      <div>
        <div className="mb-6">
          <Link
            href="/app"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Decks
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-2">
            {deck.title}
          </h1>
          {deck.description && (
            <p className="text-gray-600 dark:text-gray-400">{deck.description}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>

        <DeckActions deckId={deckId} />

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
            Add New Card
          </h2>
          <CreateCardForm deckId={deckId} templates={templates} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
            Cards
          </h2>
          <CardList cards={cards} deckId={deckId} />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
