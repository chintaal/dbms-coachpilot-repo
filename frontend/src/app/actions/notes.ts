'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/notes'

export async function createNote(rawText: string, sourceType?: string) {
  await requireUser()
  const note = await db.createNote(rawText, sourceType)
  revalidatePath('/app/import')
  return { success: true, note }
}

export async function deleteNote(noteId: string) {
  await requireUser()
  await db.deleteNote(noteId)
  revalidatePath('/app/import')
  return { success: true }
}
