'use server'

import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/stats'

export async function getUserStatsAction() {
  try {
    await requireUser()
    const stats = await db.getUserStats()
    return { success: true, stats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}

export async function getDailyReviewsAction(days: number = 365) {
  try {
    await requireUser()
    const reviews = await db.getDailyReviews(days)
    return { success: true, reviews }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily reviews',
    }
  }
}

export async function getRecentActivityAction(days: number = 30) {
  try {
    await requireUser()
    const activity = await db.getRecentActivity(days)
    return { success: true, activity }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity',
    }
  }
}
