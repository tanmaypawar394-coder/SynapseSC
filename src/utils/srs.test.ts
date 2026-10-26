/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextReview, calculateDeckMastery } from './srs';
import { Flashcard } from '../types/flashcard';

test('SRS: rating "again" resets box to 1 and drops ease factor', () => {
  const card: Partial<Flashcard> = {
    box: 4,
    easeFactor: 2.5,
    repetitions: 4,
    intervalDays: 12,
  };

  const result = calculateNextReview(card, 'again');
  assert.equal(result.box, 1);
  assert.equal(result.repetitions, 0);
  assert.equal(result.intervalDays, 0.5);
  assert.equal(result.easeFactor, 2.3);
});

test('SRS: rating "good" advances box and calculates progressive interval', () => {
  const card: Partial<Flashcard> = {
    box: 2,
    easeFactor: 2.5,
    repetitions: 2,
    intervalDays: 3,
  };

  const result = calculateNextReview(card, 'good');
  assert.equal(result.box, 3);
  assert.equal(result.repetitions, 3);
  assert.equal(result.intervalDays, Math.round(3 * 2.5)); // 8
});

test('SRS: rating "easy" bumps box by 2 and increases ease factor', () => {
  const card: Partial<Flashcard> = {
    box: 2,
    easeFactor: 2.5,
    repetitions: 2,
    intervalDays: 4,
  };

  const result = calculateNextReview(card, 'easy');
  assert.equal(result.box, 4);
  assert.equal(result.repetitions, 3);
  assert.equal(result.easeFactor, 2.65);
});

test('SRS: calculateDeckMastery returns correct percentage and counts', () => {
  const cards: Flashcard[] = [
    {
      id: 'c1',
      category: 'Algorithm',
      subtopic: 'Graph',
      difficulty: 'Advanced',
      front: { title: 'Q1', prompt: 'P1', questionType: 'definition' },
      back: { summary: 'S1', explanation: 'E1', examKeyPoints: [] },
      box: 5,
      lastReviewed: 1000,
    },
    {
      id: 'c2',
      category: 'Concurrency',
      subtopic: 'Mutex',
      difficulty: 'Advanced',
      front: { title: 'Q2', prompt: 'P2', questionType: 'definition' },
      back: { summary: 'S2', explanation: 'E2', examKeyPoints: [] },
      box: 4,
      lastReviewed: 1000,
    },
    {
      id: 'c3',
      category: 'Architecture',
      subtopic: 'Cache',
      difficulty: 'Advanced',
      front: { title: 'Q3', prompt: 'P3', questionType: 'definition' },
      back: { summary: 'S3', explanation: 'E3', examKeyPoints: [] },
      box: 1,
      lastReviewed: 1000,
    },
  ];

  const mastery = calculateDeckMastery(cards);
  assert.equal(mastery.masteredCount, 2);
  assert.equal(mastery.learningCount, 1);
  // (5*20 + 4*20 + 1*20) / (3 * 100) = (100 + 80 + 20) / 300 = 200/300 = 67%
  assert.equal(mastery.masteryPercentage, 67);
});
