/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  X,
  FileCode,
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { FlashcardDeck } from '../types/flashcard';
import { SAMPLE_PRESETS, SampleNotePreset } from '../utils/sampleDecks';

interface UploadedFileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

interface NoteInputViewProps {
  onDeckGenerated: (newDeck: FlashcardDeck) => void;
  onLoadPreset: (preset: SampleNotePreset) => void;
}

export const NoteInputView: React.FC<NoteInputViewProps> = ({
  onDeckGenerated,
  onLoadPreset,
}) => {
  const [rawText, setRawText] = useState('');
  const [courseSubject, setCourseSubject] = useState('CS 624 - Distributed Systems');
  const [targetCount, setTargetCount] = useState(6);
  const [difficulty, setDifficulty] = useState<'Intermediate' | 'Advanced' | 'Mastery'>('Advanced');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnclearWarning, setIsUnclearWarning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler (Images and PDFs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Check size (under 15MB for browser safety)
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newItem: UploadedFileItem = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
          size: file.size,
          base64: base64Data,
          previewUrl: file.type.startsWith('image/') ? base64Data : undefined,
        };
        setUploadedFiles((prev) => [...prev, newItem]);
        setErrorMessage(null);
        setIsUnclearWarning(false);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleLoadSampleNotes = (preset: SampleNotePreset) => {
    setRawText(preset.rawNotes);
    setCourseSubject(preset.course);
    setErrorMessage(null);
    setIsUnclearWarning(false);
  };

  const handleTransformNotes = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasText = rawText.trim().length > 15;
    const hasFiles = uploadedFiles.length > 0;

    if (!hasText && !hasFiles) {
      setErrorMessage(
        'Please enter substantive lecture notes, or upload a handwritten note image / PDF slide.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsUnclearWarning(false);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1800);

    try {
      const payload = {
        text: rawText.trim(),
        courseSubject,
        targetCardCount: targetCount,
        difficulty,
        media: uploadedFiles.map((f) => ({
          mimeType: f.mimeType,
          base64: f.base64,
          fileName: f.name,
        })),
      };

      const res = await fetch('/api/transform-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok || !data.success) {
        if (data.isUnclear) {
          setIsUnclearWarning(true);
          setErrorMessage(
            data.message ||
              'The uploaded notes or image appear unclear or unreadable. Please check the scan resolution or re-upload.'
          );
        } else {
          setErrorMessage(
            data.message ||
              'Unable to transform notes into flashcards. Please verify your lecture text or document and try again.'
          );
        }
        setIsLoading(false);
        return;
      }

      // Success!
      const newDeck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        title: data.deckTitle || `${courseSubject} Exam Flashcards`,
        courseSubject: data.courseSubject || courseSubject,
        createdAt: Date.now(),
        cards: data.cards || [],
      };

      onDeckGenerated(newDeck);
    } catch {
      clearInterval(stepInterval);
      setErrorMessage(
        'Unable to reach the transformation engine. Please check your network connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Description */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal AI Transformation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Transform Raw CS Notes into Exam Flashcards
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
          Tailored for master's-level computer science coursework. Robustly preserves
          complex code syntax, SQL queries, algorithm invariants, and big-O notation.
        </p>
      </div>

      {/* Preset Fast-Loader */}
      <div className="mb-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Graduate CS Sample Notes Presets:</span>
          </div>
          <span className="text-[11px] text-slate-500">Click to autofill notes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadSampleNotes(preset)}
              className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{preset.course.split('-')[0]}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Unclear Error Warning Banner */}
      {isUnclearWarning && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-300">
                Input Unclear or Unreadable
              </h4>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {errorMessage}
              </p>
              <div className="mt-2 text-[11px] text-amber-300 font-mono bg-black/20 p-2 rounded-lg">
                💡 Tip: Ensure code indentations, brackets, and mathematical equations are in focus. Or try pasting the text transcription directly below.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {errorMessage && !isUnclearWarning && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleTransformNotes} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Course and Target Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Course / Topic
            </label>
            <input
              type="text"
              value={courseSubject}
              onChange={(e) => setCourseSubject(e.target.value)}
              placeholder="e.g. CS 624 - Distributed Systems"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Target Card Count
            </label>
            <select
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={4}>4 High-Yield Cards</option>
              <option value={6}>6 Comprehensive Cards (Recommended)</option>
              <option value={8}>8 Deep Dive Cards</option>
              <option value={10}>10 Full Topic Cards</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Academic Depth
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Advanced">Advanced (Master's Core)</option>
              <option value="Mastery">Mastery (Ph.D. Qualifying Exam)</option>
              <option value="Intermediate">Intermediate (Foundational)</option>
            </select>
          </div>
        </div>

        {/* Text Area for Pasted Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paste Lecture Notes, Code Snippets, or Transcripts</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {rawText.length} characters
            </span>
          </div>

          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw class notes here. Unstructured text, code snippets (C++, Rust, Go, Python), LaTeX equations, SQL queries, or professor remarks are fully supported..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* File / Image / PDF Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Handwritten Notes, Whiteboard Photos, or PDF Slides</span>
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-6 text-center cursor-pointer transition"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-200">
              Click to select whiteboard photos, diagrams, or lecture PDFs
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports PNG, JPG, WEBP, and PDF files up to 15MB
            </p>
          </div>

          {/* Uploaded File Previews */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative group bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-xs overflow-hidden"
                >
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="overflow-hidden flex-1">
                    <p className="text-slate-200 font-medium truncate text-xs">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    aria-label={`Remove file ${file.name}`}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button & Progress Indicator */}
        <div className="pt-2">
          {isLoading ? (
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-3">
              <div className="inline-block animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
              <div className="text-sm font-bold text-white">
                {loadingStep === 1 && 'Parsing unstructured lecture notes & diagrams...'}
                {loadingStep === 2 && 'Preserving code syntax, SQL queries & algorithm invariants...'}
                {loadingStep === 3 && 'Synthesizing rigorous master-level flashcards...'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Ensuring no technical symbols (&lt;, &gt;, -&gt;, ::) are stripped
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 transition flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Master's CS Flashcard Deck</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
