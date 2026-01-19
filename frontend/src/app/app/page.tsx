import { listDecks } from '@/lib/db/decks'
import { CreateDeckModal } from './CreateDeckModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookOpen } from 'lucide-react'
import { DeckList } from './DeckList'

export default async function DashboardPage() {
  let decks = []
  let dbError: Error | null = null
  try {
    decks = await listDecks()
  } catch (error) {
    // If tables don't exist yet, return empty array
    // This can happen if migration hasn't been applied
    dbError = error instanceof Error ? error : new Error('Database error')
    decks = []
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">My Decks</h1>
        <CreateDeckModal />
      </div>

      {dbError && (
        <div className="mb-6 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          {dbError.message.includes('table') ? (
            <>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                Database Setup Required
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                The database migration hasn't been applied yet. Please apply the migration from{' '}
                <code className="text-xs bg-yellow-100 dark:bg-yellow-900/40 px-1 py-0.5 rounded">
                  supabase/migrations/20260118214752_coachpilot_phase1.sql
                </code>{' '}
                to your Supabase project. See <code className="text-xs bg-yellow-100 dark:bg-yellow-900/40 px-1 py-0.5 rounded">SETUP.md</code> for instructions.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                Database Error
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Failed to load decks: {dbError.message}
              </p>
            </>
          )}
        </div>
      )}

      {decks.length === 0 && !dbError && (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
          title="No decks yet"
          description="Create your first deck to start organizing your flashcards."
          action={<CreateDeckModal />}
        />
      )}

      {decks.length > 0 && <DeckList decks={decks} />}
    </div>
  )
}
