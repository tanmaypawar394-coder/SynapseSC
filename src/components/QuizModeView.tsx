/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Eye,
  Check,
} from 'lucide-react';
import { Flashcard, FlashcardDeck } from '../types/flashcard';
import { CodeBlock } from './CodeBlock';

interface QuizModeViewProps {
  deck: FlashcardDeck;
  onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
}

export const QuizModeView: React.FC<QuizModeViewProps> = ({ deck, onUpdateDeck }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});
  const [quizResults, setQuizResults] = useState<{ cardId: string; mastered: boolean }[]>([]);

  const card = deck.cards[currentIdx];

  const handleReveal = () => {
    setIsAnswerRevealed(true);
  };

  const togglePointCheck = (idx: number) => {
    setCheckedPoints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSelfGrade = (mastered: boolean) => {
    setQuizResults((prev) => [...prev, { cardId: card.id, mastered }]);

    // Advance to next card or finish
    if (currentIdx < deck.cards.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswerRevealed(false);
      setCheckedPoints({});
    } else {
      setIsAnswerRevealed(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setUserAnswer('');
    setIsAnswerRevealed(false);
    setCheckedPoints({});
    setQuizResults([]);
  };

  if (!card) {
    return (
      <div className="p-8 text-center text-slate-400">
        No cards available for quiz.
      </div>
    );
  }

  const isCompleted = quizResults.length === deck.cards.length;

  if (isCompleted) {
    const passedCount = quizResults.filter((r) => r.mastered).length;
    const scorePct = Math.round((passedCount / deck.cards.length) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
          <p className="text-slate-400 text-sm mt-1">
            Exam Readiness Score for "{deck.title}"
          </p>

          <div className="my-6 p-6 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
              {scorePct}%
            </div>
            <p className="text-xs text-slate-400 uppercase font-semibold mt-2">
              {passedCount} of {deck.cards.length} Core Concepts Retained
            </p>
          </div>

          <button
            type="button"
            onClick={handleRestartQuiz}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Exam Practice</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Active Recall Challenge • Question {currentIdx + 1} of {deck.cards.length}
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">{card.front.title}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            {card.subtopic}
          </span>
        </div>
      </div>

      {/* Challenge Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
        <p className="text-slate-200 text-base leading-relaxed font-medium">
          {card.front.prompt}
        </p>

        {card.front.codeSnippet && (
          <div className="mt-4">
            <CodeBlock
              code={card.front.codeSnippet}
              language={card.front.codeLanguage || 'cpp'}
              title="Code Context"
            />
          </div>
        )}

        {/* User response scratchpad */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Your Synthesis / Solution / Invariant:
          </label>
          <textarea
            rows={4}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswerRevealed}
            placeholder="Type your explanation, invariant condition, or complexity analysis before revealing the answer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        {/* Reveal button */}
        {!isAnswerRevealed && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleReveal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal Authoritative Model Answer</span>
            </button>
          </div>
        )}
      </div>

      {/* Answer & Self-Grading Section */}
      {isAnswerRevealed && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl mb-6">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authoritative Master's Formulation</span>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-4 mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Summary
            </div>
            <p className="text-white text-sm font-semibold leading-relaxed">
              {card.back.summary}
            </p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
            {card.back.explanation}
          </p>

          {card.back.codeSolutionOrOutput && (
            <div className="mb-4">
              <CodeBlock
                code={card.back.codeSolutionOrOutput}
                language={card.front.codeLanguage || 'text'}
                title="Model Solution / Output"
              />
            </div>
          )}

          {/* Exam Takeaway Checklist */}
          {card.back.examKeyPoints && card.back.examKeyPoints.length > 0 && (
            <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Did you hit these exam scoring points?</span>
              </div>
              <div className="space-y-2">
                {card.back.examKeyPoints.map((pt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePointCheck(i)}
                    className="w-full flex items-start space-x-2 text-left text-xs text-slate-300 hover:text-white"
                  >
                    <div
                      className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition ${
                        checkedPoints[i]
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {checkedPoints[i] && <Check className="w-3 h-3" />}
                    </div>
                    <span className={checkedPoints[i] ? 'text-emerald-300 line-through' : ''}>
                      {pt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Self Assessment Action */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              How did your active recall hold up?
            </span>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSelfGrade(false)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center justify-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Missed Key Nuance</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelfGrade(true)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Solid Recall</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
