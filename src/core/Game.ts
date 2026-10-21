/**
 * core/Game.ts
 * Owns the renderer, post-processing (bloom), and the main loop. Drives a
 * guided story where each chapter is its OWN themed world: finishing a chapter
 * fades to black, swaps the world (park -> Times Square -> living room -> lab ->
 * contact), respawns the player, and fades back in.
 */

import {
  WebGLRenderer, PerspectiveCamera, Vector2, Clock,
  PCFSoftShadowMap, ACESFilmicToneMapping,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { WorldManager } from '../world/WorldManager';
import type { Interactable, WorldScene } from '../world/WorldScene';
import { Beacon } from '../world/Beacon';
import { Player } from '../entities/Player';
import { Collectibles } from '../entities/Collectibles';
import { Input } from './Input';
import { Panel } from '../ui/Panel';
import { Quest } from '../quest/Quest';
import { Transition } from './Transition';
import { PROJECTS, type SectorKey } from '../data/projects';

// per-world chapter titles shown on the black transition screen
const WORLD_TITLE: Record<SectorKey, [string, string]> = {
  kindle: ['Kindle', 'Content Protection'],
  ads: ['Amazon Advertising', 'Contextual Targeting'],
  prime: ['Prime Video', 'Subtitle Quality'],
  agents: ['Agentic AI', 'Automation'],
  contact: ['Get in touch', 'Let\u2019s build together'],
  about: ['Kindle', 'About me'],
};

export class Game {
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private camera: PerspectiveCamera;
  private wm: WorldManager;
  private player: Player;
  private collectibles: Collectibles;
  private input: Input;
  private panel: Panel;
  private quest: Quest;
  private beacon: Beacon;
  private fade: Transition;
  private clock = new Clock();

  private near: Interactable | null = null;
  private lastOpened: SectorKey | null = null;
  private currentWorldKey: SectorKey | null = null;
  private swapping = false;
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

    this.wm = new WorldManager();
    this.player = new Player(this.camera);
    this.beacon = new Beacon();
    this.collectibles = new Collectibles([]);
    this.fade = new Transition();

    // persistent actors live in the scene across world swaps
    this.wm.scene.add(this.player.group, this.beacon.group, this.collectibles.group);

    // post-processing
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.wm.scene, this.camera);
    this.composer.addPass(this.renderPass);
    const bloom = new UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.5, 0.7, 0.9);
    this.composer.addPass(bloom);
    this.composer.setSize(innerWidth, innerHeight);

    this.input = new Input();
    this.panel = new Panel();
    this.quest = new Quest();
    this.buildArrow();
    this.wireUi();

    // load the first world so there is something to render under the intro
    this.enterWorld('kindle', false);

    // dev-only tour hook: open the current world's prop panel programmatically
    if (location.search.includes('play')) {
      (window as unknown as { __advance: () => void }).__advance = () => {
        this.lastOpened = this.wm.current.interactable.key;
        this.panel.open(this.lastOpened);
      };
    }

    addEventListener('resize', this.onResize);
  }

  private buildArrow() {
    this.arrowEl = document.createElement('div');
    this.arrowEl.id = 'guide-arrow';
    this.arrowEl.innerHTML = '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 4 L40 36 L24 28 L8 36 Z" fill="currentColor"/></svg>';
    this.arrowEl.hidden = true;
    document.body.appendChild(this.arrowEl);
  }

  /** Build a world, place the player + collectibles, aim the beacon. */
  private enterWorld(key: SectorKey, fromSwap: boolean): WorldScene {
    const w = this.wm.load(key);
    this.currentWorldKey = key;
    // re-add persistent actors (scene.add is idempotent-ish; ensure present)
    this.wm.scene.add(this.player.group, this.beacon.group, this.collectibles.group);
    this.player.respawn(w.spawn);
    this.collectibles.reset(w.collectibleSpots);
    this.beacon.setColor(PROJECTS[w.interactable.key].accent);
    this.beacon.moveTo(w.interactable.position);
    this.renderPass.scene = this.wm.scene;
    void fromSwap;
    return w;
  }

  private wireUi() {
    const hud = document.getElementById('hud')!;
    const collect = document.getElementById('collect')!;
    const touch = document.getElementById('touch')!;
    const intro = document.getElementById('intro')!;
    const collectCount = document.getElementById('collectCount')!;
    const collectTotal = document.getElementById('collectTotal')!;

    const startGame = () => {
      intro.classList.add('hide');
      hud.hidden = false; collect.hidden = false;
      if (matchMedia('(hover: none)').matches) touch.hidden = false;
      collectTotal.textContent = String(this.collectibles.total);
      this.quest.begin();
    };
    document.getElementById('startBtn')?.addEventListener('click', startGame);
    if (location.search.includes('play')) setTimeout(startGame, 200);
    document.getElementById('helpBtn')?.addEventListener('click', () => intro.classList.remove('hide'));

    // day/night button now re-themes nothing per-world; keep as a no-op-ish exposure toggle
    const dayBtn = document.getElementById('dayBtn');
    if (dayBtn) dayBtn.addEventListener('click', () => {
      this.renderer.toneMappingExposure = this.renderer.toneMappingExposure > 0.8 ? 0.6 : 1.1;
    });

    this.collectibles.onCollect = (c, total) => {
      collectCount.textContent = String(c);
      collect.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
      void total;
    };

    this.input.onAction = () => {
      if (this.near && !this.panel.isOpen && !this.quest.isNarrating && !this.swapping) {
        this.lastOpened = this.near.key;
        this.panel.open(this.near.key);
      }
    };
    this.input.onEscape = () => this.panel.close();
    this.panel.onClose = () => { if (this.lastOpened) this.quest.completeSector(this.lastOpened); this.lastOpened = null; };

    // when a narration card is dismissed, swap worlds if the target changed
    this.quest.onResume = () => this.onQuestResume();
  }

  private async onQuestResume() {
    const key = this.quest.target;
    if (!key) { this.beacon.moveTo(null); this.arrowEl.hidden = true; return; }
    // same world as current? just make sure the beacon points at the prop.
    const targetWorld = key === 'about' ? 'kindle' : key;
    if (targetWorld === this.currentWorldKey) { this.syncBeacon(); return; }
    // different world: cinematic dissolve
    this.swapping = true;
    collectTotalRefresh(this.collectibles);
    await this.fade.fadeOut(650);
    const [main, sub] = WORLD_TITLE[key];
    this.fade.title(main, sub, 1200);
    this.enterWorld(targetWorld, true);
    await new Promise((r) => setTimeout(r, 1250));
    await this.fade.fadeIn(650);
    this.swapping = false;
    this.syncBeacon();
  }

  private syncBeacon() {
    const key = this.quest.target;
    if (!key) { this.beacon.moveTo(null); this.arrowEl.hidden = true; return; }
    const it = this.wm.current.interactable;
    this.beacon.setColor(PROJECTS[key].accent);
    this.beacon.moveTo(it.position);
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

    const canMove = !this.panel.isOpen && !this.quest.isNarrating && !this.swapping;
    if (canMove) { this.input.update(); this.player.update(dt, this.input, this.wm.current.bounds, this.wm.current.groundHeightAt?.bind(this.wm.current)); }
    this.wm.update(dt, t);
    this.collectibles.update(dt, this.player.worldPos, t);
    this.beacon.update(dt, this.camera.position.distanceTo(this.beacon.group.position));
    this.updateInteraction();
    this.updateArrow();

    this.composer.render();
  };

  private updateInteraction() {
    const it = this.wm.current?.interactable ?? null;
    const near = it && it.position.distanceTo(this.player.worldPos) < it.radius ? it : null;
    if (near !== this.near) {
      this.near = near;
      const action = document.getElementById('touchAction');
      if (near && !this.panel.isOpen) {
        this.promptText.textContent = near.key === 'contact' ? 'contact' : 'read';
        action?.classList.add('live');
      } else action?.classList.remove('live');
    }
    if (this.near && !this.panel.isOpen && !this.quest.isNarrating && !this.swapping) {
      const p = this.player.headScreenPosition(this.camera, innerWidth, innerHeight);
      this.promptEl.hidden = false;
      this.promptEl.style.transform = `translate(-50%,-50%) translate(${p.x}px, ${p.y - 40}px)`;
    } else {
      this.promptEl.hidden = true;
    }
  }

  private updateArrow() {
    const key = this.quest.target;
    const it = this.wm.current?.interactable ?? null;
    if (!key || !it || this.panel.isOpen || this.quest.isNarrating || this.swapping) { this.arrowEl.hidden = true; return; }
    const dist = it.position.distanceTo(this.player.worldPos);
    if (dist < it.radius + 1) { this.arrowEl.hidden = true; return; }

    const tp = it.position.clone(); tp.y = 2;
    const v = tp.clone().project(this.camera);
    const onScreen = v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    let sx = (v.x * 0.5 + 0.5) * innerWidth;
    let sy = (-v.y * 0.5 + 0.5) * innerHeight;
    if (!onScreen || v.z >= 1) {
      let dx = sx - cx, dy = sy - cy;
      if (v.z >= 1) { dx = -dx; dy = -dy; }
      const a = Math.atan2(dy, dx);
      sx = cx + Math.cos(a) * innerWidth * 0.4; sy = cy + Math.sin(a) * innerHeight * 0.4;
    }
    const ang = Math.atan2(sy - cy, sx - cx) + Math.PI / 2;
    this.arrowEl.hidden = false;
    this.arrowEl.style.transform = `translate(-50%,-50%) translate(${sx}px,${sy}px) rotate(${ang}rad)`;
    this.arrowEl.style.color = '#' + PROJECTS[key].accent.toString(16).padStart(6, '0');
  }
}

// keep the HUD star total in sync when a world changes the collectible count
function collectTotalRefresh(c: Collectibles) {
  const el = document.getElementById('collectTotal');
  if (el) el.textContent = String(c.total);
}
