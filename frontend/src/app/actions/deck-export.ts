'use server'

import { exportDeck, exportDeckToJSON } from '@/lib/export/deck'

export async function exportDeckAction(deckId: string) {
  try {
    const deckData = await exportDeck(deckId)
    const json = exportDeckToJSON(deckData)
    return { success: true, json, filename: `${deckData.deck.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json` }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export deck',
    }
  }
}
