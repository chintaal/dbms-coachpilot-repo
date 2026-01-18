'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/cards'

export async function createCard(
  deckId: string,
  front: string,
  back: string,
  tags?: string[],
  noteId?: string
) {
  await requireUser()
  const card = await db.createCard(deckId, front, back, tags, noteId)
  revalidatePath(`/app/decks/${deckId}`)
  return { success: true, card }
}

export async function updateCard(
  cardId: string,
  deckId: string,
  updates: { front?: string; back?: string; tags?: string[] }
) {
  await requireUser()
  const card = await db.updateCard(cardId, updates)
  revalidatePath(`/app/decks/${deckId}`)
  return { success: true, card }
}

export async function deleteCard(cardId: string, deckId: string) {
  await requireUser()
  await db.deleteCard(cardId)
  revalidatePath(`/app/decks/${deckId}`)
  return { success: true }
}
