/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { exportToAnkiTSV, exportToMarkdown, exportToJson } from './export';
import { FlashcardDeck } from '../types/flashcard';

const mockDeck: FlashcardDeck = {
  id: 'deck-1',
  title: 'Advanced Operating Systems: Virtual Memory & Concurrency',
  courseSubject: 'Operating Systems',
  createdAt: 1700000000000,
  cards: [
    {
      id: 'card-1',
      category: 'Concurrency',
      subtopic: 'Compare-And-Swap',
      difficulty: 'Mastery',
      front: {
        title: 'ABA Problem in Lock-Free Stacks',
        prompt: 'Explain how the ABA problem arises in a lock-free Treiber stack when using CAS.',
        codeSnippet: 'bool compare_exchange_weak(T& expected, T desired);',
        codeLanguage: 'cpp',
        questionType: 'invariant',
      },
      back: {
        summary: 'A thread reads value A, gets preempted; value changes to B and back to A, causing CAS to succeed erroneously.',
        explanation: 'The memory address is unchanged but underlying state/pointers have been recycled.',
        codeSolutionOrOutput: '// Solution: Hazard Pointers or Tagged/Versioned Pointers\nstruct TaggedPointer { Node* ptr; uintptr_t tag; };',
        complexity: {
          time: 'O(1) amortized',
          space: 'O(1) per thread',
        },
        examKeyPoints: [
          'CAS only checks value equality, not structural history',
          'Resolved via version counter/tagged pointers or epoch-based reclamation',
        ],
      },
      box: 2,
    },
  ],
};

test('Export to Anki TSV produces valid tab-separated format with HTML code blocks', () => {
  const tsv = exportToAnkiTSV(mockDeck);
  assert.ok(tsv.includes('#separator:tab'));
  assert.ok(tsv.includes('#html:true'));
  assert.ok(tsv.includes('compare_exchange_weak'));
  assert.ok(tsv.includes('TaggedPointer'));
  assert.ok(tsv.includes('Operating_Systems Concurrency Mastery'));
});

test('Export to Markdown preserves code fences and complexity annotations', () => {
  const md = exportToMarkdown(mockDeck);
  assert.ok(md.includes('# Advanced Operating Systems: Virtual Memory & Concurrency'));
  assert.ok(md.includes('```cpp'));
  assert.ok(md.includes('bool compare_exchange_weak(T& expected, T desired);'));
  assert.ok(md.includes('Time: `O(1) amortized`'));
  assert.ok(md.includes('ABA Problem in Lock-Free Stacks'));
});

test('Export to JSON produces parseable string matching deck schema', () => {
  const json = exportToJson(mockDeck);
  const parsed = JSON.parse(json);
  assert.equal(parsed.title, mockDeck.title);
  assert.equal(parsed.cards.length, 1);
  assert.equal(parsed.cards[0].subtopic, 'Compare-And-Swap');
});
