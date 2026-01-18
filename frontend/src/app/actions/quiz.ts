'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/quiz'

export async function createQuizSession(deckId: string, mode: string) {
  await requireUser()
  const session = await db.createQuizSession(deckId, mode)
  return { success: true, session }
}

export async function submitQuizAnswer(
  sessionId: string,
  cardId: string,
  isCorrect: boolean
) {
  await requireUser()
  const item = await db.submitQuizAnswer(sessionId, cardId, isCorrect)
  return { success: true, item }
}

export async function endQuizSession(sessionId: string, total: number, correct: number) {
  await requireUser()
  const session = await db.endQuizSession(sessionId, total, correct)
  revalidatePath('/app/quiz')
  return { success: true, session }
}
