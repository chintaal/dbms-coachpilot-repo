'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/reviews'

export async function applyReview(cardId: string, rating: 0 | 1 | 2 | 3) {
  await requireUser()
  const result = await db.applyReview(cardId, rating)
  revalidatePath('/app/review')
  return { success: true, result }
}
