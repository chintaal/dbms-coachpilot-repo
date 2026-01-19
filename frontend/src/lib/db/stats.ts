import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type UserStats = Database['public']['Tables']['user_stats'] extends { Row: infer R } ? R : any
type DailyReview = Database['public']['Tables']['daily_reviews'] extends { Row: infer R } ? R : any

export async function getUserStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message || 'Failed to fetch user stats')
  }

  return data || {
    user_id: user.id,
    total_cards_reviewed: 0,
    current_streak: 0,
    longest_streak: 0,
    last_review_date: null,
    total_study_time_minutes: 0,
  }
}

export async function getDailyReviews(days: number = 365) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('user_id', user.id)
    .gte('review_date', startDate.toISOString().split('T')[0])
    .order('review_date', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to fetch daily reviews')
  }

  return data || []
}

export async function getRecentActivity(days: number = 30) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('user_id', user.id)
    .gte('review_date', startDate.toISOString().split('T')[0])
    .order('review_date', { ascending: true })

  if (error) {
    throw new Error(error.message || 'Failed to fetch recent activity')
  }

  return data || []
}

// Note: getDeckStatistics removed - using getUserStats and getRecentActivity instead
