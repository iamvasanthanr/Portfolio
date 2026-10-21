/**
 * core/Transition.ts
 * A full-screen black overlay for cinematic chapter transitions:
 * fadeOut() -> swap the world -> fadeIn(). Promise-based so the caller can
 * sequence it cleanly.
 */
export class Transition {
  private el: HTMLElement;
  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'fade';
    document.body.appendChild(this.el);
  }
  private wait(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

  async fadeOut(ms = 700): Promise<void> {
    this.el.style.transition = `opacity ${ms}ms ease`;
    this.el.style.pointerEvents = 'auto';
    requestAnimationFrame(() => (this.el.style.opacity = '1'));
    await this.wait(ms);
  }
  async fadeIn(ms = 700): Promise<void> {
    this.el.style.transition = `opacity ${ms}ms ease`;
    requestAnimationFrame(() => (this.el.style.opacity = '0'));
    await this.wait(ms);
    this.el.style.pointerEvents = 'none';
  }
  /** show a brief chapter title centered on the black screen */
  async title(text: string, sub: string, ms = 1400): Promise<void> {
    this.el.innerHTML = `<div class="fade-title"><div class="ft-main">${text}</div><div class="ft-sub">${sub}</div></div>`;
    await this.wait(ms);
    this.el.innerHTML = '';
  }
}
