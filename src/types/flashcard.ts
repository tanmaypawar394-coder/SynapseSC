/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FlashcardCategory =
  | 'Algorithm'
  | 'Architecture'
  | 'Concurrency'
  | 'Complexity'
  | 'Code Snippet'
  | 'System Design'
  | 'Theory & Proof'
  | 'Database Internals';

export type QuestionType =
  | 'definition'
  | 'code-analysis'
  | 'tradeoff'
  | 'complexity'
  | 'invariant';

export type CardRating = 'again' | 'hard' | 'good' | 'easy';

export interface CardFront {
  title: string;
  prompt: string;
  codeSnippet?: string;
  codeLanguage?: string;
  questionType: QuestionType;
}

export interface CardBack {
  summary: string;
  explanation: string;
  codeSolutionOrOutput?: string;
  complexity?: {
    time?: string;
    space?: string;
  };
  examKeyPoints: string[];
  furtherContext?: string;
}

export interface Flashcard {
  id: string;
  category: FlashcardCategory;
  subtopic: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Mastery';
  front: CardFront;
  back: CardBack;
  tags?: string[];
  // SRS (Spaced Repetition System) state
  box?: number; // 1 to 5 Leitner box
  intervalDays?: number;
  easeFactor?: number;
  repetitions?: number;
  lastReviewed?: number; // timestamp
  reviewHistory?: {
    timestamp: number;
    rating: CardRating;
  }[];
}

export interface FlashcardDeck {
  id: string;
  title: string;
  courseSubject: string;
  tags?: string[];
  createdAt: number;
  cards: Flashcard[];
}

export interface TransformRequestPayload {
  text?: string;
  media?: {
    mimeType: string;
    base64: string;
    fileName?: string;
  }[];
  courseSubject?: string;
  tags?: string[];
  targetCardCount?: number;
  difficulty?: 'Intermediate' | 'Advanced' | 'Mastery';
}

export interface TransformResponsePayload {
  success: boolean;
  deckTitle?: string;
  courseSubject?: string;
  tags?: string[];
  cards?: Flashcard[];
  isUnclear?: boolean;
  message?: string;
}
