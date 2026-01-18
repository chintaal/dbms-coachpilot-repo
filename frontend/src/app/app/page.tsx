import { listDecks } from '@/lib/db/decks'
import Link from 'next/link'
import { CreateDeckModal } from './CreateDeckModal'

export default async function DashboardPage() {
  const decks = await listDecks()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">My Decks</h1>
        <CreateDeckModal />
      </div>

      {decks.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You don't have any decks yet.
          </p>
          <CreateDeckModal />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/app/decks/${deck.id}`}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                {deck.title}
              </h2>
              {deck.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {deck.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Created {new Date(deck.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
