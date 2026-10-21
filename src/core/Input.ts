/**
 * core/Input.ts
 * Unified input: WASD / arrow keys, an on-screen joystick for touch,
 * pointer-drag to orbit the camera, and an "action" (E / tap) signal.
 * Exposes a normalized movement vector and camera-orbit deltas.
 */

import { Vector2 } from 'three';

export class Input {
  /** movement intent, each component in [-1, 1] */
  readonly move = new Vector2();
  /** camera orbit delta this frame (consumed by the camera rig) */
  readonly look = new Vector2();
  /** fired when the user presses E / taps the action button */
  onAction: () => void = () => {};
  /** fired on Escape */
  onEscape: () => void = () => {};

  private keys = new Set<string>();
  private joyActive = false;
  private joyVec = new Vector2();
  private dragging = false;
  private lastPointer = new Vector2();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.setupTouch();
    this.setupPointerLook();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'escape') { this.onEscape(); return; }
    if (k === 'e') { this.onAction(); return; }
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    this.keys.add(k);
  };

  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());

  /** Mobile joystick (bottom-left thumb pad). */
  private setupTouch() {
    const joy = document.getElementById('joy');
    const stick = joy?.querySelector<HTMLElement>('.joy-stick');
    const action = document.getElementById('touchAction');
    if (!joy || !stick) return;

    const R = 44;
    let cx = 0, cy = 0;
    const start = (x: number, y: number) => {
      this.joyActive = true;
      const r = joy.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      update(x, y);
    };
    const update = (x: number, y: number) => {
      if (!this.joyActive) return;
      let dx = x - cx, dy = y - cy;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joyVec.set(dx / R, dy / R);
    };
    const end = () => { this.joyActive = false; this.joyVec.set(0, 0); stick.style.transform = ''; };

    joy.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; start(t.clientX, t.clientY); }, { passive: false });
    joy.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.touches[0]; update(t.clientX, t.clientY); }, { passive: false });
    joy.addEventListener('touchend', end);
    joy.addEventListener('touchcancel', end);

    action?.addEventListener('click', () => this.onAction());
    action?.addEventListener('touchend', (e) => { e.preventDefault(); this.onAction(); });
  }

  /** Drag anywhere (that is not the joystick/HUD) to orbit the camera. */
  private setupPointerLook() {
    const onDown = (x: number, y: number, target: EventTarget | null) => {
      if (target && (target as HTMLElement).closest('#hud, #joy, #touchAction, #panel, #intro, #prompt')) return;
      this.dragging = true; this.lastPointer.set(x, y);
    };
    const onMove = (x: number, y: number) => {
      if (!this.dragging) return;
      this.look.x += (x - this.lastPointer.x);
      this.look.y += (y - this.lastPointer.y);
      this.lastPointer.set(x, y);
    };
    const onUp = () => { this.dragging = false; };

    window.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY, e.target));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchstart', (e) => { const t = e.touches[0]; onDown(t.clientX, t.clientY, e.target); });
    window.addEventListener('touchmove', (e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); });
    window.addEventListener('touchend', onUp);
  }

  /** Call once per frame to refresh the movement vector from keys + joystick. */
  update() {
    let x = 0, y = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    x += this.joyVec.x; y += this.joyVec.y;
    this.move.set(x, y);
    if (this.move.lengthSq() > 1) this.move.normalize();
  }

  /** Read and clear the accumulated camera-orbit delta. */
  consumeLook(): Vector2 {
    const out = this.look.clone();
    this.look.set(0, 0);
    return out;
  }
}
