import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Deck = Database['public']['Tables']['decks'] extends { Row: infer R } ? R : any
type DeckInsert = Database['public']['Tables']['decks'] extends { Insert: infer I } ? I : any
type DeckUpdate = Database['public']['Tables']['decks'] extends { Update: infer U } ? U : any

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function listDecks() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Failed to fetch decks')
  }

  return data || []
}

export async function getDeck(deckId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Failed to fetch deck')
  }

  return data
}

export async function createDeck(title: string, description?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
    })
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Failed to create deck')
  }

  return data
}

export async function updateDeck(deckId: string, updates: { title?: string; description?: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('decks')
    .update(updates)
    .eq('id', deckId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Failed to update deck')
  }

  return data
}

export async function deleteDeck(deckId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Failed to delete deck')
  }
}
