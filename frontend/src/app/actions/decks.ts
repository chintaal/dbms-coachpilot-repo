'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/decks'

export async function createDeck(title: string, description?: string) {
  await requireUser()
  const deck = await db.createDeck(title, description)
  revalidatePath('/app')
  return { success: true, deck }
}

export async function updateDeck(deckId: string, updates: { title?: string; description?: string }) {
  await requireUser()
  const deck = await db.updateDeck(deckId, updates)
  revalidatePath('/app')
  revalidatePath(`/app/decks/${deckId}`)
  return { success: true, deck }
}

export async function deleteDeck(deckId: string) {
  await requireUser()
  await db.deleteDeck(deckId)
  revalidatePath('/app')
  return { success: true }
}
