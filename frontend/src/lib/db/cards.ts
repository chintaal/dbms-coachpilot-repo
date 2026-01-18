import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Card = Database['public']['Tables']['cards'] extends { Row: infer R } ? R : any
type CardInsert = Database['public']['Tables']['cards'] extends { Insert: infer I } ? I : any

export async function listCards(deckId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data || []
}

export async function getCard(cardId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function createCard(
  deckId: string,
  front: string,
  back: string,
  tags?: string[],
  noteId?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id: user.id,
      deck_id: deckId,
      front,
      back,
      tags: tags || [],
      note_id: noteId || null,
    })
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function updateCard(
  cardId: string,
  updates: { front?: string; back?: string; tags?: string[] }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
    .eq('user_id', user.id)

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }
}
