import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Note = Database['public']['Tables']['notes'] extends { Row: infer R } ? R : any

export async function listNotes() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data || []
}

export async function getNote(noteId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function createNote(rawText: string, sourceType?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      raw_text: rawText,
      source_type: sourceType || null,
    })
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id)

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }
}
