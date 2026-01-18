import { listDecks } from '@/lib/db/decks'
import { listNotes } from '@/lib/db/notes'
import { ImportForm } from './ImportForm'
import { NotesList } from './NotesList'

export default async function ImportPage() {
  let decks = []
  let notes = []
  try {
    decks = await listDecks()
    notes = await listNotes()
  } catch (error) {
    // If tables don't exist yet, return empty arrays
    console.error('Failed to load data:', error)
    decks = []
    notes = []
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Import Notes</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
          Create Note
        </h2>
        <ImportForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
          Your Notes
        </h2>
        <NotesList notes={notes} decks={decks} />
      </div>
    </div>
  )
}
