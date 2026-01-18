'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/notes'

export async function createNote(rawText: string, sourceType?: string) {
  try {
    await requireUser()
    const note = await db.createNote(rawText, sourceType)
    revalidatePath('/app/import')
    return { success: true, note }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create note' 
    }
  }
}

export async function deleteNote(noteId: string) {
  try {
    await requireUser()
    await db.deleteNote(noteId)
    revalidatePath('/app/import')
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete note' 
    }
  }
}
