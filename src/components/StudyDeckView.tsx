/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CardRating, Flashcard, FlashcardDeck } from '../types/flashcard';
import { CodeBlock } from './CodeBlock';
import { calculateNextReview } from '../utils/srs';

interface StudyDeckViewProps {
  deck: FlashcardDeck;
  onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
  onNavigateToTransform: () => void;
}

export const StudyDeckView: React.FC<StudyDeckViewProps> = ({
  deck,
  onUpdateDeck,
  onNavigateToTransform,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionRatings, setSessionRatings] = useState<Record<string, CardRating>>({});

  const cards = deck.cards;
  const currentCard = cards[currentIndex] || cards[0];

  // Reset flip when switching cards
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Handle TTS
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentCard) return;

    const textToSpeak = isFlipped
      ? `${currentCard.back.summary}. ${currentCard.back.explanation}`
      : `${currentCard.front.title}. ${currentCard.front.prompt}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    },
    [isFlipped, currentIndex, cards.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed round!
      setSessionCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    onUpdateDeck({ ...deck, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  const handleRate = (rating: CardRating) => {
    if (!currentCard) return;

    const srsUpdate = calculateNextReview(currentCard, rating);
    const updatedCards = cards.map((c, i) => {
      if (i === currentIndex) {
        return {
          ...c,
          ...srsUpdate,
          reviewHistory: [
            ...(c.reviewHistory || []),
            { timestamp: Date.now(), rating },
          ],
        };
      }
      return c;
    });

    setSessionRatings((prev) => ({ ...prev, [currentCard.id]: rating }));
    onUpdateDeck({ ...deck, cards: updatedCards });

    // Auto advance
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setSessionRatings({});
  };

  const handleReviewMissed = () => {
    const missed = cards.filter(
      (c) => sessionRatings[c.id] === 'again' || sessionRatings[c.id] === 'hard'
    );
    if (missed.length > 0) {
      onUpdateDeck({ ...deck, cards: missed });
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
      setSessionRatings({});
    } else {
      handleRestart();
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Layers className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">No Flashcards In Deck</h3>
        <p className="text-slate-400 max-w-md mt-2 text-sm">
          Upload your CS notes or select one of the built-in Master's level presets to get started.
        </p>
        <button
          type="button"
          onClick={onNavigateToTransform}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
        >
          Transform Notes Now
        </button>
      </div>
    );
  }

  // Session Completed Summary Screen
  if (sessionCompleted) {
    const againCount = Object.values(sessionRatings).filter((r) => r === 'again').length;
    const goodEasyCount = Object.values(sessionRatings).filter(
      (r) => r === 'good' || r === 'easy'
    ).length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Deck Review Complete!</h2>
          <p className="text-slate-400 text-sm mt-1">
            You reviewed all {cards.length} cards in "{deck.title}".
          </p>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-400">{goodEasyCount}</div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Mastered / Retained</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <div className="text-2xl font-black text-rose-400">{againCount}</div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Needs Review</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {againCount > 0 && (
              <button
                type="button"
                onClick={handleReviewMissed}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Weak Cards ({againCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRestart}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Full Deck</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Controls & Status Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400">
            Card {currentIndex + 1} of {cards.length}
          </span>
          {/* Progress bar */}
          <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* TTS Read Aloud */}
          <button
            type="button"
            onClick={toggleSpeech}
            aria-label={isSpeaking ? 'Stop speaking card' : 'Read card aloud'}
            className={`p-2 rounded-lg border text-xs transition ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Shuffle */}
          <button
            type="button"
            onClick={handleShuffle}
            aria-label="Shuffle flashcards"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-slate-700 text-xs transition"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Leitner Box indicator */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 font-mono">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Box {currentCard.box || 1}/5</span>
          </div>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div className="perspective-1000 w-full min-h-[460px] sm:min-h-[500px]">
        <div
          role="region"
          aria-label="Flashcard content, click to flip"
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full min-h-[460px] sm:min-h-[500px] cursor-pointer transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-indigo-500/50 transition">
            {/* Front Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentCard.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {currentCard.subtopic}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {currentCard.front.questionType}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      currentCard.difficulty === 'Mastery'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : currentCard.difficulty === 'Advanced'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                </div>
              </div>

              {/* Title & Prompt */}
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {currentCard.front.title}
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                {currentCard.front.prompt}
              </p>

              {/* Code Snippet if present */}
              {currentCard.front.codeSnippet && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <CodeBlock
                    code={currentCard.front.codeSnippet}
                    language={currentCard.front.codeLanguage || 'cpp'}
                    title="Code Context / Invariant"
                  />
                </div>
              )}
            </div>

            {/* Front Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 text-indigo-400 font-medium">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Click card or Press Space to Flip</span>
              </span>
              <span className="hidden sm:inline text-slate-500">
                Front Face (Question)
              </span>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Back Header & Content */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Solution & Analysis
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {currentCard.subtopic}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentCard.front.title}
                </span>
              </div>

              {/* Summary */}
              <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3.5 mb-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Executive Answer
                </div>
                <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                  {currentCard.back.summary}
                </p>
              </div>

              {/* Detailed Explanation */}
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Architectural Nuances & Mechanics
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {currentCard.back.explanation}
                </p>
              </div>

              {/* Code Solution / Output if present */}
              {currentCard.back.codeSolutionOrOutput && (
                <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                  <CodeBlock
                    code={currentCard.back.codeSolutionOrOutput}
                    language={currentCard.front.codeLanguage || 'text'}
                    title="Code Output / Rigorous Implementation"
                  />
                </div>
              )}

              {/* Complexity Bounds */}
              {(currentCard.back.complexity?.time || currentCard.back.complexity?.space) && (
                <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 mb-4">
                  {currentCard.back.complexity.time && (
                    <div>
                      <span className="text-slate-500">Time: </span>
                      <span className="text-cyan-400 font-bold">{currentCard.back.complexity.time}</span>
                    </div>
                  )}
                  {currentCard.back.complexity.space && (
                    <div>
                      <span className="text-slate-500">Space: </span>
                      <span className="text-emerald-400 font-bold">{currentCard.back.complexity.space}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Exam Key Points */}
              {currentCard.back.examKeyPoints && currentCard.back.examKeyPoints.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>High-Yield Exam Takeaways</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc marker:text-amber-400">
                    {currentCard.back.examKeyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500 text-right">
              Rate your recall below to update your spaced repetition interval
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls & Rating Bar */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Flip button */}
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-2 shadow"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isFlipped ? 'Show Question (Front)' : 'Reveal Answer (Back)'}</span>
          <kbd className="hidden sm:inline bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
            Space
          </kbd>
        </button>

        {/* Rating Buttons: Active when flipped */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
          <div className="text-center text-xs text-slate-400 font-medium mb-2.5">
            {isFlipped ? 'Rate your recall depth:' : 'Flip card above to record your recall rating'}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!isFlipped}
              onClick={() => handleRate('again')}
              aria-label="Rate card Again (<12h)"
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                isFlipped
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold flex items-center space-x-1">
                <span>[1] Again</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">&lt; 12 hours</span>
            </button>

            <button
              type="button"
              disabled={!isFlipped}
              onClick={() => handleRate('hard')}
              aria-label="Rate card Hard (1 day)"
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                isFlipped
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold flex items-center space-x-1">
                <span>[2] Hard</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">~1 day</span>
            </button>

            <button
              type="button"
              disabled={!isFlipped}
              onClick={() => handleRate('good')}
              aria-label="Rate card Good (3-5 days)"
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                isFlipped
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold flex items-center space-x-1">
                <span>[3] Good</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">3-5 days</span>
            </button>

            <button
              type="button"
              disabled={!isFlipped}
              onClick={() => handleRate('easy')}
              aria-label="Rate card Easy (7+ days)"
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                isFlipped
                  ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold flex items-center space-x-1">
                <span>[4] Easy</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">7+ days</span>
            </button>
          </div>
        </div>

        {/* Previous / Next navigation */}
        <div className="flex items-center justify-between w-full max-w-md pt-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              currentIndex > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'opacity-30 cursor-not-allowed bg-slate-950 text-slate-600 border-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {currentIndex + 1} / {cards.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition shadow"
          >
            <span>{currentIndex === cards.length - 1 ? 'Finish Round' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
