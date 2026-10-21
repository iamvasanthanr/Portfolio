/**
 * core/Game.ts
 * Owns the renderer, post-processing (bloom), and the main loop. Wires the
 * world, player, collectibles, input, the guided story (Quest), the waypoint
 * beacon + on-screen arrow, the interaction prompt, HUD and panel.
 */

import {
  WebGLRenderer, PerspectiveCamera, Vector3, Vector2, Clock,
  PCFSoftShadowMap, ACESFilmicToneMapping,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { World, type Interactable } from '../world/World';
import { Beacon } from '../world/Beacon';
import { Player } from '../entities/Player';
import { Collectibles } from '../entities/Collectibles';
import { Input } from './Input';
import { Panel } from '../ui/Panel';
import { Quest } from '../quest/Quest';
import { PROJECTS, type SectorKey } from '../data/projects';

export class Game {
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private camera: PerspectiveCamera;
  private world: World;
  private player: Player;
  private collectibles: Collectibles;
  private input: Input;
  private panel: Panel;
  private quest: Quest;
  private beacon: Beacon;
  private clock = new Clock();

  private near: Interactable | null = null;
  private promptEl = document.getElementById('prompt') as HTMLElement;
  private promptText = document.getElementById('promptText') as HTMLElement;
  private arrowEl!: HTMLElement;

  constructor(container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.camera = new PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 300);
    this.camera.position.set(0, 7, 16);

    this.world = new World();
    this.player = new Player(this.camera);
    this.world.scene.add(this.player.group);

    this.beacon = new Beacon();
    this.world.scene.add(this.beacon.group);

    this.collectibles = new Collectibles([
      new Vector3(-14, 0, -6), new Vector3(10, 0, -4), new Vector3(-20, 0, 8),
      new Vector3(16, 0, 10), new Vector3(0, 0, -12), new Vector3(-6, 0, 14),
      new Vector3(22, 0, -10), new Vector3(-30, 0, 24),
    ]);
    this.world.scene.add(this.collectibles.group);

    // ----- post-processing: bloom for that glowing 2026 look -----
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.world.scene, this.camera));
    const bloom = new UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.6, 0.8, 0.85);
    this.composer.addPass(bloom);
    this.composer.setSize(innerWidth, innerHeight);

    this.input = new Input();
    this.panel = new Panel();
    this.quest = new Quest();
    this.buildArrow();
    this.wireUi();

    addEventListener('resize', this.onResize);
  }

  private buildArrow() {
    this.arrowEl = document.createElement('div');
    this.arrowEl.id = 'guide-arrow';
    this.arrowEl.innerHTML = '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 4 L40 36 L24 28 L8 36 Z" fill="currentColor"/></svg>';
    this.arrowEl.hidden = true;
    document.body.appendChild(this.arrowEl);
  }

  private wireUi() {
    const hud = document.getElementById('hud')!;
    const collect = document.getElementById('collect')!;
    const touch = document.getElementById('touch')!;
    const intro = document.getElementById('intro')!;
    const collectCount = document.getElementById('collectCount')!;
    const collectTotal = document.getElementById('collectTotal')!;
    collectTotal.textContent = String(this.collectibles.total);

    const startGame = () => {
      intro.classList.add('hide');
      hud.hidden = false; collect.hidden = false;
      if (matchMedia('(hover: none)').matches) touch.hidden = false;
      this.quest.begin(); // kick off the story
    };
    document.getElementById('startBtn')?.addEventListener('click', startGame);
    if (location.search.includes('play')) setTimeout(startGame, 200); // TEMP debug
    document.getElementById('helpBtn')?.addEventListener('click', () => intro.classList.remove('hide'));

    const dayBtn = document.getElementById('dayBtn')!;
    dayBtn.addEventListener('click', () => {
      const name = this.world.cycleSky();
      dayBtn.textContent = name === 'night' ? '\u{1F319}' : name === 'dusk' ? '\u{1F305}' : '\u2600\uFE0F';
    });

    this.collectibles.onCollect = (c, total) => {
      collectCount.textContent = String(c);
      collect.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
      if (c === total) this.toast('\u2b50 You found every star!', 'Nice exploring. There is more to read all around.');
    };

    this.input.onAction = () => {
      if (this.near && !this.panel.isOpen && !this.quest.isNarrating) {
        this.lastOpened = this.near.key;
        this.panel.open(this.near.key);
      }
    };
    this.input.onEscape = () => this.panel.close();

    // when a sector panel closes, tell the quest (advances the story if it was the objective)
    this.panel.onClose = () => { if (this.lastOpened) this.quest.completeSector(this.lastOpened); this.lastOpened = null; };

    // when a narration card is dismissed, move the beacon to the new target
    this.quest.onResume = () => this.syncBeacon();
  }

  private lastOpened: SectorKey | null = null;

  private syncBeacon() {
    const key = this.quest.target;
    if (!key) { this.beacon.moveTo(null); this.arrowEl.hidden = true; return; }
    const it = this.world.interactables.find((i) => i.key === key);
    if (!it) return;
    this.beacon.setColor(PROJECTS[key].accent);
    this.beacon.moveTo(it.position);
  }

  private toast(title: string, sub: string) {
    const t = document.createElement('div');
    t.id = 'toast';
    t.innerHTML = `<div class="t">${title}</div><div class="s">${sub}</div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4600);
  }

  private onResize = () => {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.composer.setSize(innerWidth, innerHeight);
  };

  start() { this.loop(); }

  private loop = () => {
    requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    const canMove = !this.panel.isOpen && !this.quest.isNarrating;
    if (canMove) { this.input.update(); this.player.update(dt, this.input, this.world.bounds); }
    this.collectibles.update(dt, this.player.worldPos, t);
    this.beacon.update(dt, this.camera.position.distanceTo(this.beacon.group.position));
    this.updateInteraction();
    this.updateArrow();

    this.composer.render();
  };

  private updateInteraction() {
    let best: Interactable | null = null; let bestD = Infinity;
    for (const it of this.world.interactables) {
      const d = it.position.distanceTo(this.player.worldPos);
      if (d < it.radius && d < bestD) { best = it; bestD = d; }
    }
    if (best !== this.near) {
      this.near = best;
      const action = document.getElementById('touchAction');
      if (best && !this.panel.isOpen) {
        this.promptEl.hidden = false;
        this.promptText.textContent = best.key === 'contact' ? 'contact' : best.key === 'about' ? 'read about me' : 'read';
        action?.classList.add('live');
      } else { this.promptEl.hidden = true; action?.classList.remove('live'); }
    }
    if (this.near && !this.panel.isOpen && !this.quest.isNarrating) {
      const p = this.player.headScreenPosition(this.camera, innerWidth, innerHeight);
      this.promptEl.style.transform = `translate(-50%,-50%) translate(${p.x}px, ${p.y - 40}px)`;
    } else {
      this.promptEl.hidden = true;
    }
  }

  /** The on-screen arrow points from the player toward the active objective. */
  private updateArrow() {
    const key = this.quest.target;
    if (!key || this.panel.isOpen || this.quest.isNarrating) { this.arrowEl.hidden = true; return; }
    const it = this.world.interactables.find((i) => i.key === key);
    if (!it) { this.arrowEl.hidden = true; return; }

    const dist = it.position.distanceTo(this.player.worldPos);
    if (dist < it.radius + 1) { this.arrowEl.hidden = true; return; } // arrived

    // project the target to screen; if off-screen or behind, pin arrow to edge
    const tp = it.position.clone(); tp.y = 2;
    const v = tp.clone().project(this.camera);
    const onScreen = v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    let sx = (v.x * 0.5 + 0.5) * innerWidth;
    let sy = (-v.y * 0.5 + 0.5) * innerHeight;
    if (!onScreen || v.z >= 1) {
      // direction from center, flip if behind camera
      let dx = sx - cx, dy = sy - cy;
      if (v.z >= 1) { dx = -dx; dy = -dy; }
      const ang = Math.atan2(dy, dx);
      const rx = innerWidth * 0.4, ry = innerHeight * 0.4;
      sx = cx + Math.cos(ang) * rx; sy = cy + Math.sin(ang) * ry;
    }
    const ang = Math.atan2(sy - cy, sx - cx) + Math.PI / 2; // svg points up by default
    this.arrowEl.hidden = false;
    this.arrowEl.style.transform = `translate(-50%,-50%) translate(${sx}px,${sy}px) rotate(${ang}rad)`;
    this.arrowEl.style.color = '#' + PROJECTS[key].accent.toString(16).padStart(6, '0');
  }
}
