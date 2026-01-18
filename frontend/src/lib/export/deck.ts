import { getDeck } from '@/lib/db/decks'
import { listCards } from '@/lib/db/cards'

export interface ExportedDeck {
  version: string
  exportedAt: string
  deck: {
    title: string
    description: string | null
    cards: Array<{
      front: string
      back: string
      front_html: string | null
      back_html: string | null
      front_image_url: string | null
      back_image_url: string | null
      tags: string[] | null
    }>
  }
}

export async function exportDeck(deckId: string): Promise<ExportedDeck> {
  const deck = await getDeck(deckId)
  const cards = await listCards(deckId)

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    deck: {
      title: deck.title,
      description: deck.description,
      cards: cards.map((card) => ({
        front: card.front,
        back: card.back,
        front_html: card.front_html || null,
        back_html: card.back_html || null,
        front_image_url: card.front_image_url || null,
        back_image_url: card.back_image_url || null,
        tags: card.tags || null,
      })),
    },
  }
}

export function exportDeckToJSON(deck: ExportedDeck): string {
  return JSON.stringify(deck, null, 2)
}
