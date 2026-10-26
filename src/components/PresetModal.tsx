/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Layers, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_PRESETS, SampleNotePreset } from '../utils/sampleDecks';
import { FlashcardDeck } from '../types/flashcard';

interface PresetModalProps {
  currentDeckId: string;
  onSelectPreset: (preset: SampleNotePreset) => void;
  onClose: () => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  currentDeckId,
  onSelectPreset,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preset selector modal"
          className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Curated Graduate CS Coursework</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Select Master's Level Coursework Deck
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Switch to one of our pre-built graduate decks complete with raw notes, code invariants, and model answers.
        </p>

        <div className="space-y-3">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = preset.initialDeck.id === currentDeckId;

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500'
                    : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                      {preset.course}
                    </span>
                    <span className="text-xs text-slate-400">
                      {preset.initialDeck.cards.length} cards
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {preset.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition">
                      <span>Load Deck</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
