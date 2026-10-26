/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CardRating, Flashcard } from '../types/flashcard';

export interface SrsCalculationResult {
  box: number;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed: number;
}

/**
 * Calculates updated spaced repetition parameters (inspired by Leitner box + SM-2 algorithm)
 */
export function calculateNextReview(
  card: Partial<Flashcard>,
  rating: CardRating,
  now: number = Date.now()
): SrsCalculationResult {
  const currentBox = card.box ?? 1;
  const currentEase = card.easeFactor ?? 2.5;
  const currentReps = card.repetitions ?? 0;

  let newBox = currentBox;
  let newEase = currentEase;
  let newReps = currentReps;
  let intervalDays = 1;

  switch (rating) {
    case 'again':
      newBox = 1;
      newReps = 0;
      intervalDays = 0.5; // Review again in half day
      newEase = Math.max(1.3, currentEase - 0.2);
      break;

    case 'hard':
      newBox = Math.max(1, currentBox);
      newReps = currentReps + 1;
      intervalDays = Math.max(1, Math.round((card.intervalDays ?? 1) * 1.2));
      newEase = Math.max(1.3, currentEase - 0.15);
      break;

    case 'good':
      newBox = Math.min(5, currentBox + 1);
      newReps = currentReps + 1;
      if (newReps === 1) {
        intervalDays = 1;
      } else if (newReps === 2) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round((card.intervalDays ?? 3) * currentEase);
      }
      break;

    case 'easy':
      newBox = Math.min(5, currentBox + 2);
      newReps = currentReps + 1;
      if (newReps === 1) {
        intervalDays = 3;
      } else if (newReps === 2) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round((card.intervalDays ?? 4) * currentEase * 1.3);
      }
      newEase = Math.min(3.0, currentEase + 0.15);
      break;
  }

  return {
    box: newBox,
    intervalDays,
    easeFactor: Number(newEase.toFixed(2)),
    repetitions: newReps,
    lastReviewed: now,
  };
}

/**
 * Calculates mastery level percentage (0 to 100) based on cards in deck
 */
export function calculateDeckMastery(cards: Flashcard[]): {
  masteryPercentage: number;
  boxCounts: Record<number, number>;
  masteredCount: number;
  learningCount: number;
  unseenCount: number;
} {
  if (!cards || cards.length === 0) {
    return {
      masteryPercentage: 0,
      boxCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      masteredCount: 0,
      learningCount: 0,
      unseenCount: 0,
    };
  }

  const boxCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let unseenCount = 0;
  let masteredCount = 0;
  let learningCount = 0;
  let totalScore = 0;

  for (const card of cards) {
    if (!card.lastReviewed) {
      unseenCount++;
      boxCounts[1] = (boxCounts[1] || 0) + 1;
      continue;
    }

    const box = card.box ?? 1;
    boxCounts[box] = (boxCounts[box] || 0) + 1;

    // Score from 1 to 5: box 1=20%, box 2=40%, box 3=60%, box 4=80%, box 5=100%
    totalScore += box * 20;

    if (box >= 4) {
      masteredCount++;
    } else {
      learningCount++;
    }
  }

  const masteryPercentage = Math.round(totalScore / (cards.length * 100) * 100);

  return {
    masteryPercentage,
    boxCounts,
    masteredCount,
    learningCount,
    unseenCount,
  };
}
