/**
 * quest/Quest.ts
 * Drives the guided story: shows narration cards between chapters, tracks the
 * current objective + target sector, and advances when the player finishes a
 * chapter (closes the sector panel). Builds its own DOM overlay.
 */

import { STORY, type Chapter } from '../data/story';
import type { SectorKey } from '../data/projects';

export class Quest {
  private index = -1;
  private card!: HTMLElement;
  private cardText!: HTMLElement;
  private cardLabel!: HTMLElement;
  private cardNext!: HTMLElement;
  private objective!: HTMLElement;
  private objText!: HTMLElement;
  private line = 0;

  /** the sector the player should currently reach, or null in free-roam */
  target: SectorKey | null = null;
  /** fired when a narration card is fully dismissed and gameplay resumes */
  onResume: () => void = () => {};

  constructor() {
    this.buildDom();
  }

  private buildDom() {
    const card = document.createElement('div');
    card.id = 'story-card';
    card.innerHTML = `
      <div class="story-inner">
        <div class="story-label" id="storyLabel"></div>
        <p class="story-text" id="storyText"></p>
        <button class="story-next" id="storyNext">Continue</button>
        <div class="story-skip" id="storySkip">skip story</div>
      </div>`;
    document.body.appendChild(card);
    this.card = card;
    this.cardText = card.querySelector('#storyText')!;
    this.cardLabel = card.querySelector('#storyLabel')!;
    this.cardNext = card.querySelector('#storyNext')!;

    const obj = document.createElement('div');
    obj.id = 'objective';
    obj.innerHTML = '<span class="obj-ico">&#128681;</span><span id="objText"></span>';
    document.body.appendChild(obj);
    this.objective = obj;
    this.objText = obj.querySelector('#objText')!;

    this.cardNext.addEventListener('click', () => this.advanceLine());
    card.querySelector('#storySkip')!.addEventListener('click', () => this.skipAll());
  }

  /** begin the story (call after the intro is dismissed) */
  begin() { this.gotoChapter(0); }

  private get chapter(): Chapter { return STORY[this.index]; }

  private gotoChapter(i: number) {
    this.index = Math.min(i, STORY.length - 1);
    this.line = 0;
    this.objective.classList.remove('show');
    this.showCard();
  }

  private showCard() {
    const ch = this.chapter;
    this.cardLabel.textContent = ch.label;
    this.cardText.textContent = ch.narration[this.line];
    this.cardNext.textContent = this.line < ch.narration.length - 1 ? 'Continue' : 'Let\u2019s go';
    this.card.classList.add('show');
  }

  private advanceLine() {
    const ch = this.chapter;
    if (this.line < ch.narration.length - 1) {
      this.line++;
      // quick fade between lines
      this.cardText.style.opacity = '0';
      setTimeout(() => {
        this.cardText.textContent = ch.narration[this.line];
        this.cardText.style.opacity = '1';
        this.cardNext.textContent = this.line < ch.narration.length - 1 ? 'Continue' : 'Let\u2019s go';
      }, 180);
    } else {
      this.dismissCard();
    }
  }

  private dismissCard() {
    this.card.classList.remove('show');
    this.target = this.chapter.target;
    // show the objective (unless the story is over with no target)
    if (this.chapter.objective) {
      this.objText.textContent = this.chapter.objective;
      this.objective.classList.add('show');
    }
    this.onResume();
  }

  private skipAll() {
    // jump to the final free-roam beat
    this.card.classList.remove('show');
    this.index = STORY.length - 1;
    this.target = null;
    this.objText.textContent = STORY[this.index].objective;
    this.objective.classList.add('show');
    this.onResume();
  }

  /** is a narration card currently blocking gameplay? */
  get isNarrating(): boolean { return this.card.classList.contains('show'); }

  /**
   * Called when the player finishes the sector they were sent to.
   * Advances to the next chapter (which narrates, then sets a new target).
   * Returns true if the completed sector was the current objective.
   */
  completeSector(key: SectorKey): boolean {
    if (this.target !== key) return false; // they wandered into a different sector early
    // advance to the next chapter after a short beat so the panel can close
    setTimeout(() => this.gotoChapter(this.index + 1), 250);
    return true;
  }
}
