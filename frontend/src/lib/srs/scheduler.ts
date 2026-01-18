/**
 * SM-2-like spaced repetition scheduler
 * 
 * This module contains the TypeScript implementation of the scheduler logic.
 * The actual review application is done in the database RPC function `apply_review()`
 * for atomicity, but this module can be used for testing and client-side previews.
 */

export type Rating = 0 | 1 | 2 | 3; // again, hard, good, easy

export interface CardState {
  interval_days: number;
  ease_factor: number;
  reps: number;
  lapses: number;
  due_at: Date;
}

export interface SchedulerResult {
  interval_days: number;
  ease_factor: number;
  reps: number;
  lapses: number;
  due_at: Date;
}

/**
 * Calculate new card state based on rating
 * 
 * @param currentState - Current card state
 * @param rating - User rating: 0=again, 1=hard, 2=good, 3=easy
 * @returns New card state
 */
export function calculateNextState(
  currentState: CardState,
  rating: Rating
): SchedulerResult {
  let newIntervalDays: number;
  let newEaseFactor: number;
  let newReps: number;
  let newLapses: number;
  const now = new Date();

  if (rating === 0) {
    // Again: reset or penalize
    newLapses = currentState.lapses + 1;
    newReps = 0; // Reset reps on again
    newIntervalDays = 0;
    newEaseFactor = Math.max(1.3, currentState.ease_factor - 0.2);
    // For MVP, use 1 hour instead of 10 minutes
    const dueAt = new Date(now.getTime() + 60 * 60 * 1000);
    return {
      interval_days: newIntervalDays,
      ease_factor: newEaseFactor,
      reps: newReps,
      lapses: newLapses,
      due_at: dueAt,
    };
  } else if (rating === 1) {
    // Hard: reduce interval and ease
    newLapses = currentState.lapses;
    newReps = currentState.reps + 1;
    newIntervalDays = Math.max(1, Math.round(currentState.interval_days * 1.2));
    newEaseFactor = Math.max(1.3, currentState.ease_factor - 0.15);
  } else if (rating === 2) {
    // Good: normal progression
    newLapses = currentState.lapses;
    newReps = currentState.reps + 1;
    if (currentState.reps === 0) {
      newIntervalDays = 1;
    } else {
      newIntervalDays = Math.max(1, Math.round(currentState.interval_days * currentState.ease_factor));
    }
    newEaseFactor = currentState.ease_factor; // Unchanged
  } else {
    // rating === 3: Easy: increase interval and ease
    newLapses = currentState.lapses;
    newReps = currentState.reps + 1;
    newIntervalDays = Math.max(1, Math.round(currentState.interval_days * (currentState.ease_factor + 0.15)));
    newEaseFactor = currentState.ease_factor + 0.15;
  }

  // Calculate due date
  const dueAt = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

  return {
    interval_days: newIntervalDays,
    ease_factor: newEaseFactor,
    reps: newReps,
    lapses: newLapses,
    due_at: dueAt,
  };
}

/**
 * Get default initial state for a new card
 */
export function getInitialState(): CardState {
  return {
    interval_days: 0,
    ease_factor: 2.5,
    reps: 0,
    lapses: 0,
    due_at: new Date(), // Due immediately
  };
}

/**
 * Self-test function to verify scheduler logic
 */
export function testScheduler(): boolean {
  const initialState: CardState = {
    interval_days: 0,
    ease_factor: 2.5,
    reps: 0,
    lapses: 0,
    due_at: new Date(),
  };

  // Test: Good rating on new card
  const result1 = calculateNextState(initialState, 2);
  if (result1.interval_days !== 1 || result1.reps !== 1) {
    console.error('Test 1 failed: Good rating on new card');
    return false;
  }

  // Test: Again rating resets reps
  const stateWithReps: CardState = {
    ...initialState,
    reps: 5,
    interval_days: 10,
  };
  const result2 = calculateNextState(stateWithReps, 0);
  if (result2.reps !== 0 || result2.lapses !== 1) {
    console.error('Test 2 failed: Again rating should reset reps');
    return false;
  }

  // Test: Easy rating increases ease factor
  const result3 = calculateNextState(initialState, 3);
  if (result3.ease_factor <= initialState.ease_factor) {
    console.error('Test 3 failed: Easy rating should increase ease factor');
    return false;
  }

  return true;
}
