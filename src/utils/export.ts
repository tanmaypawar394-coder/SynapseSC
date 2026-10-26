/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flashcard, FlashcardDeck } from '../types/flashcard';

/**
 * Format code snippet for HTML display inside Anki cards
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Export cards in Anki-compatible TSV format
 * Tab-separated: Front \t Back \t Tags
 */
export function exportToAnkiTSV(deck: FlashcardDeck): string {
  const lines: string[] = [
    '#separator:tab',
    '#html:true',
    '#tags column:3',
  ];

  for (const card of deck.cards) {
    let frontHtml = `<strong>[${escapeHtml(card.subtopic)}] ${escapeHtml(card.front.title)}</strong><br/><br/>`;
    frontHtml += `${escapeHtml(card.front.prompt).replace(/\n/g, '<br/>')}`;

    if (card.front.codeSnippet) {
      frontHtml += `<br/><br/><pre style="background:#1e293b; color:#f8fafc; padding:8px; border-radius:4px; font-family:monospace; text-align:left;"><code>${escapeHtml(card.front.codeSnippet)}</code></pre>`;
    }

    let backHtml = `<strong>Summary:</strong> ${escapeHtml(card.back.summary)}<br/><br/>`;
    backHtml += `<strong>Explanation:</strong> ${escapeHtml(card.back.explanation).replace(/\n/g, '<br/>')}`;

    if (card.back.codeSolutionOrOutput) {
      backHtml += `<br/><br/><strong>Code / Expected Solution:</strong><pre style="background:#1e293b; color:#38bdf8; padding:8px; border-radius:4px; font-family:monospace; text-align:left;"><code>${escapeHtml(card.back.codeSolutionOrOutput)}</code></pre>`;
    }

    if (card.back.complexity?.time || card.back.complexity?.space) {
      backHtml += `<br/><br/><strong>Complexity:</strong> Time: ${escapeHtml(card.back.complexity.time || 'N/A')} | Space: ${escapeHtml(card.back.complexity.space || 'N/A')}`;
    }

    if (card.back.examKeyPoints && card.back.examKeyPoints.length > 0) {
      backHtml += `<br/><br/><strong>Exam Key Points:</strong><ul>`;
      for (const pt of card.back.examKeyPoints) {
        backHtml += `<li>${escapeHtml(pt)}</li>`;
      }
      backHtml += `</ul>`;
    }

    const cardTags = card.tags || [];
    const deckTags = deck.tags || [];
    const combinedTags = Array.from(
      new Set([
        ...deckTags,
        ...cardTags,
        deck.courseSubject,
        card.category,
        card.difficulty,
      ])
    ).map((t) => t.trim().replace(/\s+/g, '_'));

    const tags = combinedTags.join(' ');
    // Replace tabs or raw newlines in front/back to preserve valid TSV
    const cleanFront = frontHtml.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
    const cleanBack = backHtml.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');

    lines.push(`${cleanFront}\t${cleanBack}\t${tags}`);
  }

  return lines.join('\n');
}

/**
 * Export cards in Markdown format (ideal for Obsidian / Notion / GitHub notes)
 */
export function exportToMarkdown(deck: FlashcardDeck): string {
  const deckTagBadges = (deck.tags || []).map((t) => `\`#${t}\``).join(' ');
  const parts: string[] = [
    `# ${deck.title}`,
    `**Course / Topic:** ${deck.courseSubject} | **Cards:** ${deck.cards.length} | **Generated:** ${new Date(deck.createdAt).toLocaleDateString()}`,
    deckTagBadges ? `**Tags:** ${deckTagBadges}` : '',
    '',
    '---',
    '',
  ];

  deck.cards.forEach((card, index) => {
    const cardTagList = Array.from(new Set([...(deck.tags || []), ...(card.tags || [])]));
    const tagBadges = cardTagList.map((t) => `\`#${t}\``).join(' ');
    parts.push(`## Card ${index + 1}: ${card.front.title}`);
    parts.push(`*Category: ${card.category} | Subtopic: ${card.subtopic} | Difficulty: ${card.difficulty}*`);
    if (tagBadges) {
      parts.push(`*Tags:* ${tagBadges}`);
    }
    parts.push('');
    parts.push(`### Front`);
    parts.push(card.front.prompt);

    if (card.front.codeSnippet) {
      parts.push('');
      parts.push('```' + (card.front.codeLanguage || 'cpp'));
      parts.push(card.front.codeSnippet);
      parts.push('```');
    }

    parts.push('');
    parts.push(`### Back`);
    parts.push(`**Key Concept:** ${card.back.summary}`);
    parts.push('');
    parts.push(card.back.explanation);

    if (card.back.codeSolutionOrOutput) {
      parts.push('');
      parts.push('**Code Solution / Output:**');
      parts.push('```' + (card.front.codeLanguage || 'text'));
      parts.push(card.back.codeSolutionOrOutput);
      parts.push('```');
    }

    if (card.back.complexity?.time || card.back.complexity?.space) {
      parts.push('');
      parts.push(`**Complexity:** Time: \`${card.back.complexity.time || 'O(1)'}\` | Space: \`${card.back.complexity.space || 'O(1)'}\``);
    }

    if (card.back.examKeyPoints && card.back.examKeyPoints.length > 0) {
      parts.push('');
      parts.push('**Exam Key Takeaways:**');
      for (const pt of card.back.examKeyPoints) {
        parts.push(`- ${pt}`);
      }
    }

    parts.push('');
    parts.push('---');
    parts.push('');
  });

  return parts.join('\n');
}

/**
 * Export cards as JSON string
 */
export function exportToJson(deck: FlashcardDeck): string {
  return JSON.stringify(deck, null, 2);
}
