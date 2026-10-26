/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support large payload for images and PDFs (base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Route: Transform Raw CS Notes into Structured Flashcards
app.post('/api/transform-notes', async (req, res) => {
  try {
    const {
      text,
      media,
      courseSubject = 'Computer Science',
      targetCardCount = 6,
      difficulty = 'Advanced',
    } = req.body;

    const hasText = typeof text === 'string' && text.trim().length > 10;
    const hasMedia = Array.isArray(media) && media.length > 0;

    if (!hasText && !hasMedia) {
      return res.status(400).json({
        success: false,
        message: 'Please provide substantive lecture notes, or upload a note image / PDF slide.',
      });
    }

    if (!ai) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in the environment.',
      });
    }

    // Build contents array for multimodal Gemini request
    const parts: any[] = [];

    // Attach any images or PDFs provided
    if (hasMedia) {
      for (const item of media) {
        if (item.base64 && item.mimeType) {
          // Strip any data URL prefix if present
          const cleanBase64 = item.base64.replace(/^data:[^;]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: item.mimeType,
              data: cleanBase64,
            },
          });
        }
      }
    }

    // Add prompt instructions
    const promptText = `
You are an expert Professor of Computer Science evaluating graduate-level (Master's / Ph.D.) coursework.
Your objective is to transform raw, messy, or unstructured student lecture notes, code snippets, whiteboard diagrams, or PDF slides into a rigorous, high-yield flashcard deck for master's-level exam preparation.

Course Context / Topic: "${courseSubject}"
Target Card Count: ${targetCardCount} cards
Target Depth: ${difficulty} (Master's Degree standard: rigorous invariants, formal definitions, time/space complexity, architectural trade-offs, and micro-benchmarks).

Notes Content:
"""
${hasText ? text : '[Student provided lecture image / PDF document above]'}
"""

CRITICAL INSTRUCTIONS:
1. READABILITY & CLARITY CHECK FIRST:
   If the provided image, PDF, or text is illegible, corrupted, blank, or completely unrelated to academic computer science (e.g., blurry photo of a wall, random receipt, single nonsense word), DO NOT HALLUCINATE fake CS definitions. Instead, set "isUnclear" to true, and provide a clear, helpful explanation in "clarificationPrompt" explaining why the input could not be deciphered and what the student should re-upload.

2. TECHNICAL ACCURACY & ZERO SYNTAX MANGLING:
   - NEVER strip, sanitize, or mangle programming syntax: maintain exact brackets, braces, pointers, arrows (->, =>, ::, *, &, <T>, []).
   - Intentionally preserve exact code blocks (C++, Rust, Go, Python, Java, SQL, or algorithmic pseudocode).
   - If the notes cover an algorithm, capture the core loop/invariant or edge-case in a clean code snippet.
   - If SQL or database internals are discussed, preserve exact SQL queries and execution engine details.
   - For mathematical formulations (e.g. big-O bounds, probability, vector clocks, loss gradients), preserve standard mathematical notation.

3. CARD STRUCTURE:
   - Front: 
     * Title: Distinctive, concise concept name (e.g. "Raft Leader Completeness Invariant", "MESI BusUpgr vs BusRdX", "ARIES Compensation Log Records").
     * Prompt: Deep question, code challenge, or architectural scenario that forces active recall.
     * CodeSnippet (optional): Real code or scenario snippet if relevant.
     * QuestionType: 'definition' | 'code-analysis' | 'tradeoff' | 'complexity' | 'invariant'
   - Back:
     * Summary: 1-2 sentence high-level executive answer.
     * Explanation: Deep, authoritative graduate-level explanation explaining the "why", mechanical nuances, and failure modes.
     * CodeSolutionOrOutput (optional): Corrected code, output, or implementation detail.
     * Complexity (optional): Time & space complexity bounds.
     * ExamKeyPoints: 2-4 bullet points highlighting high-yield exam traps, edge cases, and typical pitfalls.
   - Category: Must be one of: 'Algorithm', 'Architecture', 'Concurrency', 'Complexity', 'Code Snippet', 'System Design', 'Theory & Proof', 'Database Internals'.
   - Subtopic: Short topic tag (e.g. "Cache Coherence", "Consensus", "MVCC", "Attention Mechanism").
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: 'You are a distinguished Computer Science professor and graduate examiner. You create rigorous, high-yield, technically precise flashcards from messy lecture notes with absolute fidelity to code and syntax.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isUnclear: {
              type: Type.BOOLEAN,
              description: 'Set to true only if the input material is completely unreadable, blank, or undecipherable.',
            },
            clarificationPrompt: {
              type: Type.STRING,
              description: 'Explanation for student if input is unclear or unreadable, with guidance on what to re-upload.',
            },
            deckTitle: {
              type: Type.STRING,
              description: 'High-level title for the generated deck (e.g., "Advanced Distributed Systems: Consensus & Fault Tolerance")',
            },
            courseSubject: {
              type: Type.STRING,
              description: 'Identified computer science subfield or course code',
            },
            cards: {
              type: Type.ARRAY,
              description: 'Generated flashcards for master level CS exam prep',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'One of: Algorithm, Architecture, Concurrency, Complexity, Code Snippet, System Design, Theory & Proof, Database Internals',
                  },
                  subtopic: { type: Type.STRING },
                  difficulty: {
                    type: Type.STRING,
                    description: 'Intermediate, Advanced, or Mastery',
                  },
                  front: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      codeSnippet: { type: Type.STRING },
                      codeLanguage: { type: Type.STRING },
                      questionType: {
                        type: Type.STRING,
                        description: 'definition, code-analysis, tradeoff, complexity, or invariant',
                      },
                    },
                    required: ['title', 'prompt', 'questionType'],
                  },
                  back: {
                    type: Type.OBJECT,
                    properties: {
                      summary: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      codeSolutionOrOutput: { type: Type.STRING },
                      complexity: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          space: { type: Type.STRING },
                        },
                      },
                      examKeyPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      furtherContext: { type: Type.STRING },
                    },
                    required: ['summary', 'explanation', 'examKeyPoints'],
                  },
                },
                required: ['id', 'category', 'subtopic', 'difficulty', 'front', 'back'],
              },
            },
          },
          required: ['isUnclear'],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    if (parsedData.isUnclear) {
      return res.status(200).json({
        success: false,
        isUnclear: true,
        message: parsedData.clarificationPrompt || 'The uploaded notes or image appear unclear or unreadable. Please provide a clearer text excerpt or higher-resolution image.',
      });
    }

    // Assign IDs if missing
    const cards = (parsedData.cards || []).map((card: any, idx: number) => ({
      ...card,
      id: card.id || `card-${Date.now()}-${idx}`,
      box: 1,
      repetitions: 0,
      easeFactor: 2.5,
      intervalDays: 1,
    }));

    return res.status(200).json({
      success: true,
      deckTitle: parsedData.deckTitle || `${courseSubject} Exam Flashcards`,
      courseSubject: parsedData.courseSubject || courseSubject,
      cards,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Unable to transform lecture notes at this time. Please check your notes text or uploaded scan and try again.',
    });
  }
});

// Start Express with Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SynapseCS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
