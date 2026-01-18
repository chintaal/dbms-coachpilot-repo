import { listDecks } from '@/lib/db/decks'
import { listNotes } from '@/lib/db/notes'
import { ImportForm } from './ImportForm'
import { NotesList } from './NotesList'

export default async function ImportPage() {
  const decks = await listDecks()
  const notes = await listNotes()

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
