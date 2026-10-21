/**
 * data/story.ts
 * A guided, Uncharted-style career journey. Each chapter shows a narration
 * card, then points the player (beacon + arrow + objective text) to a target
 * sector. Arriving opens that sector's panel; closing it advances the story.
 */

import type { SectorKey } from './projects';

export interface Chapter {
  /** narration shown before this chapter's objective (story beat) */
  narration: string[];
  /** short objective line shown in the HUD while travelling */
  objective: string;
  /** the sector the player must reach (null for the final beat) */
  target: SectorKey | null;
  /** optional chapter label */
  label: string;
}

export const STORY: Chapter[] = [
  {
    label: 'Prologue',
    narration: [
      'Every big system starts the same way: one engineer, one hard problem.',
      'This is the story of five years of them, across Amazon.',
      'Take a walk with me. Follow the glowing marker.',
    ],
    objective: 'Head to the park',
    target: 'kindle',
  },
  {
    label: 'Chapter 1 - Kindle',
    narration: [
      'It began at Kindle, protecting the books people love.',
      'The locks that keep e-books safe were being written by hand, one at a time, and it was slow.',
      'So I taught an AI to invent, test and translate them on its own.',
      'Open the book under the tree to read how.',
    ],
    objective: 'Read the book in the park',
    target: 'kindle',
  },
  {
    label: 'Chapter 2 - Advertising',
    narration: [
      'Next, Amazon Advertising.',
      'Ads only work when they fit the page. They only fit in English.',
      'I taught the system to read any language and match the right ad.',
      'Follow the marker to the billboard on Ad Street.',
    ],
    objective: 'Reach the billboard on Ad Street',
    target: 'ads',
  },
  {
    label: 'Chapter 3 - Prime Video',
    narration: [
      'Then came Prime Video, and the moment that matters most:',
      'a family sits down, presses play, and the subtitles had better be right.',
      'I rebuilt the system that checks every subtitle before they ever see it.',
      'Head home. Switch on the TV in the living room.',
    ],
    objective: 'Go home and switch on the TV',
    target: 'prime',
  },
  {
    label: 'Chapter 4 - Agentic AI',
    narration: [
      'And now, the frontier: teaching AI agents to do the work itself.',
      'Little helpers that gather, decide and write, so engineers do not have to.',
      'Step into the lab and start the terminal.',
    ],
    objective: 'Enter the lab and start the terminal',
    target: 'agents',
  },
  {
    label: 'Epilogue',
    narration: [
      'That is the journey so far: Kindle, Advertising, Prime Video, and agentic AI.',
      'Five years, 100M+ customers, a lot of problems turned into systems.',
      'The next chapter is open. Want to build it together?',
      'Check the mailbox to reach me.',
    ],
    objective: 'Check the mailbox',
    target: 'contact',
  },
  {
    label: 'The End',
    narration: [
      'Thanks for walking through my work.',
      'Grab my resume, or say hi. The stars are yours to keep exploring.',
    ],
    objective: 'Free roam - explore anything you missed',
    target: null,
  },
];
