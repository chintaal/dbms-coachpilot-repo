import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type QuizSession = Database['public']['Tables']['quiz_sessions'] extends { Row: infer R } ? R : any
type QuizItem = Database['public']['Tables']['quiz_items'] extends { Row: infer R } ? R : any

export async function createQuizSession(deckId: string, mode: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      deck_id: deckId,
      mode,
      total: 0,
      correct: 0,
    })
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function getQuizSession(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function submitQuizAnswer(
  sessionId: string,
  cardId: string,
  isCorrect: boolean
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('quiz_items')
    .insert({
      session_id: sessionId,
      card_id: cardId,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function endQuizSession(sessionId: string, total: number, correct: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      ended_at: new Date().toISOString(),
      total,
      correct,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data
}

export async function getQuizItems(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify session belongs to user
  const session = await getQuizSession(sessionId)

  const { data, error } = await supabase
    .from('quiz_items')
    .select('*')
    .eq('session_id', sessionId)
    .order('answered_at', { ascending: true })

  if (error) {
    // Convert Supabase error to plain Error for serialization
    throw new Error(error.message || 'Database operation failed')
  }

  return data || []
}
