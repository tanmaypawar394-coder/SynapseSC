/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Layers, Code } from 'lucide-react';
import { FlashcardDeck } from '../types/flashcard';
import { exportToAnkiTSV, exportToMarkdown, exportToJson } from '../utils/export';

interface ExportModalProps {
  deck: FlashcardDeck;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ deck, onClose }) => {
  const [format, setFormat] = useState<'anki' | 'markdown' | 'json'>('anki');
  const [copied, setCopied] = useState(false);

  const getExportContent = () => {
    switch (format) {
      case 'anki':
        return exportToAnkiTSV(deck);
      case 'markdown':
        return exportToMarkdown(deck);
      case 'json':
        return exportToJson(deck);
    }
  };

  const getFileExtension = () => {
    switch (format) {
      case 'anki':
        return 'txt';
      case 'markdown':
        return 'md';
      case 'json':
        return 'json';
    }
  };

  const getMimeType = () => {
    switch (format) {
      case 'anki':
        return 'text/tab-separated-values;charset=utf-8';
      case 'markdown':
        return 'text/markdown;charset=utf-8';
      case 'json':
        return 'application/json;charset=utf-8';
    }
  };

  const handleDownload = () => {
    const content = getExportContent();
    const blob = new Blob([content], { type: getMimeType() });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = deck.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `${safeTitle}.${getFileExtension()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = getExportContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close export modal"
          className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Export Flashcards</h2>
        <p className="text-xs text-slate-400 mb-6">
          Take your cards to Anki, Obsidian, Notion, or your personal study tools with zero syntax loss.
        </p>

        {/* Format selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setFormat('anki')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
              format === 'anki'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-bold">Anki (.tsv)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Spaced Repetition</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('markdown')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
              format === 'markdown'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-bold">Markdown (.md)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Obsidian / GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('json')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
              format === 'json'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-bold">JSON (.json)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Raw Schema Data</span>
          </button>
        </div>

        {/* Preview snippet */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Export Output Preview:</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {deck.cards.length} cards included
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-44 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {getExportContent()}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
