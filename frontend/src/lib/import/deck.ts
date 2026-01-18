import { ExportedDeck } from '@/lib/export/deck'

export interface ImportResult {
  success: boolean
  deckId?: string
  cardsCreated?: number
  error?: string
}

export function validateDeckImport(data: unknown): data is ExportedDeck {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const deck = data as any

  if (!deck.version || !deck.exportedAt || !deck.deck) {
    return false
  }

  if (typeof deck.deck.title !== 'string') {
    return false
  }

  if (!Array.isArray(deck.deck.cards)) {
    return false
  }

  // Validate each card
  for (const card of deck.deck.cards) {
    if (typeof card.front !== 'string' || typeof card.back !== 'string') {
      return false
    }
  }

  return true
}

// Note: importDeck is now handled in the Server Action (deck-import.ts)
// This file only contains validation logic
