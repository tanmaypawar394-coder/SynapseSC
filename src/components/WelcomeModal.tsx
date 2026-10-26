/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Layers,
  Brain,
  Download,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  X,
  Code2,
  ShieldCheck,
} from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
  onStartStudy: () => void;
  onStartTransform: () => void;
  onBrowsePresets: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onClose,
  onStartStudy,
  onStartTransform,
  onBrowsePresets,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-100">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close welcome guide"
          className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Welcome to SynapseCS
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Master's CS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Exam-grade flashcards from raw graduate-level lecture notes & diagrams
            </p>
          </div>
        </div>

        {/* Overview Box */}
        <div className="my-5 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p className="font-medium text-white mb-1">
            Accelerate your exam preparation for advanced computer science coursework.
          </p>
          SynapseCS transforms messy professor lectures, whiteboard photos, algorithmic pseudocode, and slide PDFs into structured, technically rigorous flashcards with spaced repetition and recall testing.
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Multimodal Note Ingestion</div>
              <div className="text-slate-400 text-[11px] mt-0.5 leading-normal">
                Paste raw lecture transcripts or upload whiteboard photos and PDF slides.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Exact Syntax Preservation</div>
              <div className="text-slate-400 text-[11px] mt-0.5 leading-normal">
                Zero code stripping: pointers (*, &), brackets, SQL, and big-O remain intact.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Spaced Repetition & 3D Flip</div>
              <div className="text-slate-400 text-[11px] mt-0.5 leading-normal">
                SM-2 Leitner intervals, keyboard controls (Space to flip, 1-4 to rate), and TTS.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Export & Recall Quizzing</div>
              <div className="text-slate-400 text-[11px] mt-0.5 leading-normal">
                Active recall test mode, plus 1-click export to Anki (.tsv), Obsidian, or JSON.
              </div>
            </div>
          </div>
        </div>

        {/* Where to Start Guidance */}
        <div className="border-t border-slate-800 pt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Where to Start:
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartStudy();
              }}
              className="w-full p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-lg shadow-indigo-600/25"
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4" />
                <span>1. Explore the Pre-loaded Distributed Systems Deck</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartTransform();
              }}
              className="w-full p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center justify-between border border-slate-700"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>2. Transform Your Own Lecture Notes or Diagrams</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onBrowsePresets();
              }}
              className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium text-xs transition flex items-center justify-between border border-slate-800"
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>3. Browse Presets (MESI Coherence, ARIES WAL, FlashAttention)</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
