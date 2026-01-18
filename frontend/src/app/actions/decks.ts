'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/decks'

export async function createDeck(title: string, description?: string) {
  try {
    await requireUser()
    const deck = await db.createDeck(title, description)
    revalidatePath('/app')
    return { success: true, deck }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create deck' 
    }
  }
}

export async function updateDeck(deckId: string, updates: { title?: string; description?: string }) {
  try {
    await requireUser()
    const deck = await db.updateDeck(deckId, updates)
    revalidatePath('/app')
    revalidatePath(`/app/decks/${deckId}`)
    return { success: true, deck }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update deck' 
    }
  }
}

export async function deleteDeck(deckId: string) {
  try {
    await requireUser()
    await db.deleteDeck(deckId)
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete deck' 
    }
  }
}
