/**
 * ui/Panel.ts
 * The content panel that opens when the player interacts with a prop.
 * Renders the project's story blocks, metrics, tech chips, and boots the
 * matching signature animation (book / tv / ads / agents).
 */

import { PROJECTS, type SectorKey, type Project } from '../data/projects';
import { mountAnimation, type AnimationHandle } from './animations';

export class Panel {
  private root = document.getElementById('panel') as HTMLElement;
  private body = document.getElementById('panelBody') as HTMLElement;
  private closeBtn = document.getElementById('panelClose') as HTMLElement;
  private active: AnimationHandle | null = null;
  onClose: () => void = () => {};

  constructor() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => { if (e.target === this.root) this.close(); });
  }

  get isOpen(): boolean { return !this.root.hidden; }

  open(key: SectorKey) {
    const p = PROJECTS[key];
    this.body.innerHTML = this.render(p);
    this.root.hidden = false;
    requestAnimationFrame(() => this.root.classList.add('open'));
    this.closeBtn.focus();
    // boot the animation after layout settles
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.active = mountAnimation(p.animation, this.body);
    }));
  }

  close() {
    if (!this.isOpen) return;
    this.active?.stop();
    this.active = null;
    this.root.classList.remove('open');
    setTimeout(() => { this.root.hidden = true; this.body.innerHTML = ''; }, 250);
    this.onClose();
  }

  private render(p: Project): string {
    const pc = `--pc:#${p.accent.toString(16).padStart(6, '0')}`;
    const metrics = p.metrics.length
      ? `<div class="metrics">${p.metrics.map(([n, l]) => `<div><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>`
      : '';
    const story = p.story
      ? `<div class="story">
          ${block('\u{1F4E6}', 'What it is', p.story.is)}
          ${block('\u{1F3AF}', 'What I owned', p.story.own)}
          ${block('\u{1F527}', 'What I optimized', p.story.opt)}
          ${block('\u{1F4C8}', 'Impact', p.story.impact)}
        </div>`
      : '';
    const tech = p.tech?.length
      ? `<div class="techrow">${p.tech.map((t) => `<span class="tt">${t}</span>`).join('')}</div>`
      : '';
    return `<div style="${pc}">
      <span class="chip">${p.chip}</span>
      <h2 id="panelTitle">${p.title}</h2>
      <p class="lead">${p.lead}</p>
      ${story}
      ${p.rawBody ?? ''}
      <div class="anim-mount"></div>
      ${tech}
      ${metrics}
    </div>`;
  }
}

function block(icon: string, label: string, text?: string): string {
  if (!text) return '';
  return `<div class="sblock"><div class="h"><span class="ic">${icon}</span>${label}</div><p>${text}</p></div>`;
}
