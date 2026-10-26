/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, AppView } from './components/Header';
import { StudyDeckView } from './components/StudyDeckView';
import { QuizModeView } from './components/QuizModeView';
import { DeckExplorerView } from './components/DeckExplorerView';
import { NoteInputView } from './components/NoteInputView';
import { ExportModal } from './components/ExportModal';
import { PresetModal } from './components/PresetModal';
import { WelcomeModal } from './components/WelcomeModal';
import { SAMPLE_PRESETS, SampleNotePreset } from './utils/sampleDecks';
import { FlashcardDeck } from './types/flashcard';

const STORAGE_KEY = 'synapse_cs_current_deck';
const WELCOME_SEEN_KEY = 'synapse_has_seen_welcome';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('study');
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback cleanly
    }
    // Default to the rich Distributed Systems deck
    return SAMPLE_PRESETS[0].initialDeck;
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    try {
      return !localStorage.getItem(WELCOME_SEEN_KEY);
    } catch {
      return false;
    }
  });

  const handleDismissWelcome = () => {
    setIsWelcomeModalOpen(false);
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  // Sync currentDeck to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDeck));
    } catch {
      // Ignore
    }
  }, [currentDeck]);

  // Support ?autostart=1 or view param in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as AppView;
    if (viewParam && ['study', 'quiz', 'explorer', 'transform'].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, []);

  const handleDeckGenerated = (newDeck: FlashcardDeck) => {
    setCurrentDeck(newDeck);
    setActiveView('study');
  };

  const handleSelectPreset = (preset: SampleNotePreset) => {
    setCurrentDeck(preset.initialDeck);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent Navigation Header */}
      <Header
        currentDeck={currentDeck}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPresetSelector={() => setIsPresetModalOpen(true)}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeView === 'study' && (
          <StudyDeckView
            deck={currentDeck}
            onUpdateDeck={setCurrentDeck}
            onNavigateToTransform={() => setActiveView('transform')}
          />
        )}

        {activeView === 'quiz' && (
          <QuizModeView
            deck={currentDeck}
            onUpdateDeck={setCurrentDeck}
          />
        )}

        {activeView === 'explorer' && (
          <DeckExplorerView
            deck={currentDeck}
            onUpdateDeck={setCurrentDeck}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {activeView === 'transform' && (
          <NoteInputView
            onDeckGenerated={handleDeckGenerated}
            onLoadPreset={handleSelectPreset}
          />
        )}
      </main>

      {/* Welcome Modal for First-Time Users */}
      {isWelcomeModalOpen && (
        <WelcomeModal
          onClose={handleDismissWelcome}
          onStartStudy={() => {
            setActiveView('study');
          }}
          onStartTransform={() => {
            setActiveView('transform');
          }}
          onBrowsePresets={() => {
            setIsPresetModalOpen(true);
          }}
        />
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          deck={currentDeck}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Preset Coursework Selector Modal */}
      {isPresetModalOpen && (
        <PresetModal
          currentDeckId={currentDeck.id}
          onSelectPreset={handleSelectPreset}
          onClose={() => setIsPresetModalOpen(false)}
        />
      )}
    </div>
  );
}
