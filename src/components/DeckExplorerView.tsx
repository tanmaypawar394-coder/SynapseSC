/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Download,
  Terminal,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Flashcard, FlashcardCategory, FlashcardDeck } from '../types/flashcard';
import { CodeBlock } from './CodeBlock';

interface DeckExplorerViewProps {
  deck: FlashcardDeck;
  onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
  onOpenExportModal: () => void;
}

export const DeckExplorerView: React.FC<DeckExplorerViewProps> = ({
  deck,
  onUpdateDeck,
  onOpenExportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for add / edit
  const [formCategory, setFormCategory] = useState<FlashcardCategory>('Algorithm');
  const [formSubtopic, setFormSubtopic] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCodeLanguage, setFormCodeLanguage] = useState('cpp');
  const [formSummary, setFormSummary] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formExamPoints, setFormExamPoints] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Intermediate' | 'Advanced' | 'Mastery'>('Advanced');

  const categories: string[] = [
    'All',
    'Algorithm',
    'Architecture',
    'Concurrency',
    'Complexity',
    'Code Snippet',
    'System Design',
    'Theory & Proof',
    'Database Internals',
  ];

  const filteredCards = useMemo(() => {
    return deck.cards.filter((card) => {
      const matchesSearch =
        searchQuery === '' ||
        card.front.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.front.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.subtopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.explanation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || card.category === selectedCategory;

      const matchesDiff =
        selectedDifficulty === 'All' || card.difficulty === selectedDifficulty;

      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [deck.cards, searchQuery, selectedCategory, selectedDifficulty]);

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to delete this flashcard?')) {
      const updated = deck.cards.filter((c) => c.id !== id);
      onUpdateDeck({ ...deck, cards: updated });
    }
  };

  const handleStartEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFormCategory(card.category);
    setFormSubtopic(card.subtopic);
    setFormTitle(card.front.title);
    setFormPrompt(card.front.prompt);
    setFormCode(card.front.codeSnippet || '');
    setFormCodeLanguage(card.front.codeLanguage || 'cpp');
    setFormSummary(card.back.summary);
    setFormExplanation(card.back.explanation);
    setFormExamPoints((card.back.examKeyPoints || []).join('\n'));
    setFormDifficulty(card.difficulty);
    setIsAddingNew(false);
  };

  const handleStartAdd = () => {
    setEditingCard(null);
    setFormCategory('Algorithm');
    setFormSubtopic('');
    setFormTitle('');
    setFormPrompt('');
    setFormCode('');
    setFormCodeLanguage('cpp');
    setFormSummary('');
    setFormExplanation('');
    setFormExamPoints('');
    setFormDifficulty('Advanced');
    setIsAddingNew(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrompt.trim() || !formSummary.trim()) {
      alert('Title, Prompt, and Summary are required.');
      return;
    }

    const keyPointsArray = formExamPoints
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (isAddingNew) {
      const newCard: Flashcard = {
        id: `card-${Date.now()}`,
        category: formCategory,
        subtopic: formSubtopic.trim() || 'General',
        difficulty: formDifficulty,
        front: {
          title: formTitle.trim(),
          prompt: formPrompt.trim(),
          codeSnippet: formCode.trim() || undefined,
          codeLanguage: formCodeLanguage.trim() || 'cpp',
          questionType: 'definition',
        },
        back: {
          summary: formSummary.trim(),
          explanation: formExplanation.trim() || formSummary.trim(),
          examKeyPoints: keyPointsArray,
        },
        box: 1,
        repetitions: 0,
        intervalDays: 1,
      };
      onUpdateDeck({ ...deck, cards: [newCard, ...deck.cards] });
    } else if (editingCard) {
      const updatedCards = deck.cards.map((c) => {
        if (c.id === editingCard.id) {
          return {
            ...c,
            category: formCategory,
            subtopic: formSubtopic.trim() || c.subtopic,
            difficulty: formDifficulty,
            front: {
              ...c.front,
              title: formTitle.trim(),
              prompt: formPrompt.trim(),
              codeSnippet: formCode.trim() || undefined,
              codeLanguage: formCodeLanguage.trim() || 'cpp',
            },
            back: {
              ...c.back,
              summary: formSummary.trim(),
              explanation: formExplanation.trim(),
              examKeyPoints: keyPointsArray,
            },
          };
        }
        return c;
      });
      onUpdateDeck({ ...deck, cards: updatedCards });
    }

    setEditingCard(null);
    setIsAddingNew(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search cards by concept, code keywords, complexity or explanation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flashcard</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Deck</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
        <span>
          Showing {filteredCards.length} of {deck.cards.length} cards
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
          >
            <div>
              {/* Card Meta */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {card.category}
                </span>
                <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Box {card.box || 1}</span>
                </div>
              </div>

              {/* Subtopic & Title */}
              <div className="text-xs font-semibold text-slate-400 mb-1">
                {card.subtopic}
              </div>
              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {card.front.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                {card.front.prompt}
              </p>

              {/* Code preview tag if available */}
              {card.front.codeSnippet && (
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 mb-3">
                  <Terminal className="w-3 h-3" />
                  <span>Code snippet included ({card.front.codeLanguage || 'cpp'})</span>
                </div>
              )}

              {/* Summary snippet */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Answer Summary:
                </div>
                <p className="line-clamp-2">{card.back.summary}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-500">
                {card.difficulty}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(card)}
                  aria-label={`Edit card ${card.front.title}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  aria-label={`Delete card ${card.front.title}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(isAddingNew || editingCard) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {isAddingNew ? 'Add Custom Flashcard' : 'Edit Flashcard'}
            </h2>

            <form onSubmit={handleSaveCard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FlashcardCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Subtopic / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cache Coherence, Raft Invariant"
                    value={formSubtopic}
                    onChange={(e) => setFormSubtopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Card Title (Concept Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MESI Protocol: BusUpgr vs BusRdX"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Front Prompt / Question *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the technical question or architectural challenge..."
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Code Snippet (Optional - syntax will be strictly preserved)
                </label>
                <textarea
                  rows={3}
                  placeholder="// Paste C++, Go, Python, SQL, or algorithmic pseudocode..."
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Back Summary (Core Answer) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise graduate-level definition or solution..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Deep Architectural Explanation
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why, mechanical invariants, failure modes..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  High-Yield Exam Key Points (1 per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Crucial exam trap 1&#10;Crucial exam trap 2"
                  value={formExamPoints}
                  onChange={(e) => setFormExamPoints(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCard(null);
                    setIsAddingNew(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
