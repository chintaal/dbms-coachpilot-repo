'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/quiz'

export async function createQuizSession(deckId: string, mode: string) {
  try {
    await requireUser()
    const session = await db.createQuizSession(deckId, mode)
    return { success: true, session }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create quiz session' 
    }
  }
}

export async function submitQuizAnswer(
  sessionId: string,
  cardId: string,
  isCorrect: boolean
) {
  try {
    await requireUser()
    const item = await db.submitQuizAnswer(sessionId, cardId, isCorrect)
    return { success: true, item }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit answer' 
    }
  }
}

export async function endQuizSession(sessionId: string, total: number, correct: number) {
  try {
    await requireUser()
    const session = await db.endQuizSession(sessionId, total, correct)
    revalidatePath('/app/quiz')
    return { success: true, session }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to end quiz session' 
    }
  }
}
