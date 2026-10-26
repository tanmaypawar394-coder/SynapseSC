/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Brain,
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  Download,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';
import { FlashcardDeck } from '../types/flashcard';
import { calculateDeckMastery } from '../utils/srs';

export type AppView = 'study' | 'quiz' | 'explorer' | 'transform';

interface HeaderProps {
  currentDeck: FlashcardDeck;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenExportModal: () => void;
  onOpenPresetSelector: () => void;
  onOpenWelcome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDeck,
  activeView,
  onSelectView,
  onOpenExportModal,
  onOpenPresetSelector,
  onOpenWelcome,
}) => {
  const mastery = calculateDeckMastery(currentDeck.cards);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  SynapseCS
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Master's CS
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {currentDeck.title}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onSelectView('study')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeView === 'study'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Study Deck</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {currentDeck.cards.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('quiz')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeView === 'quiz'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Recall Test</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('explorer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeView === 'explorer'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Card Explorer</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('transform')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeView === 'transform'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transform Notes</span>
            </button>
          </nav>

          {/* Right Actions: Mastery & Exports */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Welcome & Guide */}
            <button
              type="button"
              onClick={onOpenWelcome}
              aria-label="Welcome Guide & Overview"
              className="text-xs flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Quick Sample Presets */}
            <button
              type="button"
              onClick={onOpenPresetSelector}
              aria-label="Load CS Course Preset"
              className="text-xs flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">CS Presets</span>
            </button>

            {/* Export Deck */}
            <button
              type="button"
              onClick={onOpenExportModal}
              aria-label="Export Flashcards (Anki / Markdown / JSON)"
              className="text-xs flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Mastery Pill */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mastery</div>
                <div className="text-xs font-bold text-emerald-400">
                  {mastery.masteryPercentage}%
                </div>
              </div>
              <div className="w-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${mastery.masteryPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => onSelectView('study')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeView === 'study' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Study ({currentDeck.cards.length})
          </button>
          <button
            type="button"
            onClick={() => onSelectView('quiz')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeView === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Quiz
          </button>
          <button
            type="button"
            onClick={() => onSelectView('explorer')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeView === 'explorer' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => onSelectView('transform')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeView === 'transform' ? 'bg-emerald-600 text-white' : 'text-emerald-400'
            }`}
          >
            + Transform
          </button>
        </div>
      </div>
    </header>
  );
};
