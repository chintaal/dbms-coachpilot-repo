import { listDecks } from '@/lib/db/decks'
import { VoiceCardForm } from './VoiceCardForm'

export default async function VoicePage() {
  let decks = []
  try {
    decks = await listDecks()
  } catch (error) {
    // If tables don't exist yet, return empty array
    console.error('Failed to load decks:', error)
    decks = []
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
        Voice Card Creation
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Use your microphone to quickly create cards with voice-to-text.
      </p>
      <VoiceCardForm decks={decks} />
    </div>
  )
}
