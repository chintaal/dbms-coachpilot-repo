'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import { validateDeckImport, ImportResult } from '@/lib/import/deck'
import { createDeck } from '@/app/actions/decks'
import { createCard } from '@/app/actions/cards'
import type { ExportedDeck } from '@/lib/export/deck'

export async function importDeckAction(file: File): Promise<ImportResult> {
  try {
    await requireUser()

    // Read file content
    const text = await file.text()
    const data = JSON.parse(text)

    // Validate the import data
    if (!validateDeckImport(data)) {
      return {
        success: false,
        error: 'Invalid deck format',
      }
    }

    const exportedDeck = data as ExportedDeck

    // Create the deck
    const deckResult = await createDeck(
      exportedDeck.deck.title,
      exportedDeck.deck.description || undefined
    )

    if (!deckResult.success || !deckResult.deck) {
      return {
        success: false,
        error: 'Failed to create deck',
      }
    }

    // Create all cards
    let cardsCreated = 0
    for (const cardData of exportedDeck.deck.cards) {
      const cardResult = await createCard(
        deckResult.deck.id,
        cardData.front,
        cardData.back,
        cardData.tags || undefined,
        undefined,
        cardData.front_html || undefined,
        cardData.back_html || undefined,
        cardData.front_image_url || undefined,
        cardData.back_image_url || undefined
      )
      if (cardResult.success) {
        cardsCreated++
      }
    }

    revalidatePath('/app')
    revalidatePath(`/app/decks/${deckResult.deck.id}`)

    return {
      success: true,
      deckId: deckResult.deck.id,
      cardsCreated,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import deck',
    }
  }
}
