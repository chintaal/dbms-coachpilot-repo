import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type CardWithState = {
  id: string
  deck_id: string
  front: string
  back: string
  tags: string[] | null
  card_state: {
    due_at: string
    interval_days: number
    ease_factor: number
    reps: number
    lapses: number
  } | null
}

export async function getReviewQueue(limit: number = 20) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get cards that are due (due_at <= now) with their state
  const { data, error } = await supabase
    .from('card_state')
    .select(
      `
      card_id,
      due_at,
      interval_days,
      ease_factor,
      reps,
      lapses,
      cards (
        id,
        deck_id,
        front,
        back,
        tags
      )
    `
    )
    .eq('user_id', user.id)
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw error
  }

  // Transform the data to a flatter structure
  const cards: CardWithState[] = (data || []).map((item: any) => ({
    id: item.cards.id,
    deck_id: item.cards.deck_id,
    front: item.cards.front,
    back: item.cards.back,
    tags: item.cards.tags,
    card_state: {
      due_at: item.due_at,
      interval_days: item.interval_days,
      ease_factor: item.ease_factor,
      reps: item.reps,
      lapses: item.lapses,
    },
  }))

  return cards
}

export async function applyReview(cardId: string, rating: 0 | 1 | 2 | 3) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Call the RPC function for atomic review application
  const { data, error } = await supabase.rpc('apply_review', {
    p_card_id: cardId,
    p_rating: rating,
  })

  if (error) {
    throw error
  }

  return data
}
