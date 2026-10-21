/**
 * world/World.ts
 * Builds the scene: fog, lighting with shadows, a textured ground plane,
 * a day/night sky, and five themed sectors (park, living room, ad street,
 * neon lab, contact) made from Three.js primitives. Each sector registers
 * one interactable "prop" with the interaction system.
 */

import {
  Scene, Fog, Color, HemisphereLight, DirectionalLight, AmbientLight,
  Mesh, MeshStandardMaterial, PlaneGeometry, CircleGeometry, BoxGeometry,
  CylinderGeometry, ConeGeometry, SphereGeometry, Group, Vector3, RepeatWrapping,
  CanvasTexture, DoubleSide, CapsuleGeometry,
} from 'three';
import { PROJECTS, type SectorKey } from '../data/projects';

export interface Interactable {
  key: SectorKey;
  position: Vector3;
  radius: number;
  group: Group;
  label: string;
}

export interface SkyMode { sky: Color; fog: Color; sun: number; ambient: number; }

const SKIES: Record<string, SkyMode> = {
  day: { sky: new Color(0x8fc7ff), fog: new Color(0x9fd0e6), sun: 1.1, ambient: 0.7 },
  dusk: { sky: new Color(0x3a2d55), fog: new Color(0x6a4a5a), sun: 0.5, ambient: 0.45 },
  night: { sky: new Color(0x0a1222), fog: new Color(0x0c1a2c), sun: 0.12, ambient: 0.3 },
};
const SKY_ORDER = ['day', 'dusk', 'night'] as const;

export class World {
  readonly scene = new Scene();
  readonly interactables: Interactable[] = [];
  readonly bounds = { minX: -46, maxX: 46, minZ: -40, maxZ: 40 };

  private sun!: DirectionalLight;
  private hemi!: HemisphereLight;
  private ambient!: AmbientLight;
  private skyIndex = 0;

  constructor() {
    this.scene.background = SKIES.day.sky.clone();
    this.scene.fog = new Fog(SKIES.day.fog.getHex(), 28, 95);
    this.buildLights();
    this.buildGround();
    this.buildPark();
    this.buildLivingRoom();
    this.buildStreet();
    this.buildLab();
    this.buildContact();
    this.applySky('day');
  }

  // ---------------------------------------------------------------- lights
  private buildLights() {
    this.hemi = new HemisphereLight(0xcfe8ff, 0x3a5a3a, 0.7);
    this.scene.add(this.hemi);

    this.ambient = new AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambient);

    this.sun = new DirectionalLight(0xfff2d6, 1.1);
    this.sun.position.set(24, 40, 18);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 140;
    const s = 70;
    this.sun.shadow.camera.left = -s; this.sun.shadow.camera.right = s;
    this.sun.shadow.camera.top = s; this.sun.shadow.camera.bottom = -s;
    this.sun.shadow.bias = -0.0004;
    this.scene.add(this.sun);
  }

  // ---------------------------------------------------------------- ground
  private buildGround() {
    // a soft procedural grass texture so the plane is not a flat color
    const tex = this.grassTexture();
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(24, 24);
    const ground = new Mesh(
      new PlaneGeometry(200, 200),
      new MeshStandardMaterial({ map: tex, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // tinted sector pads so each zone reads as its own place
    const pad = (x: number, z: number, r: number, color: number) => {
      const m = new Mesh(
        new CircleGeometry(r, 48),
        new MeshStandardMaterial({ color, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
      );
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); m.receiveShadow = true;
      this.scene.add(m);
    };
    // Only the "indoor" zones get a distinct floor pad. The park, street and
    // contact areas stay as open grass (no dark disc under the player).
    pad(26, -18, 9, 0x6b5a46);   // living room: warm wood floor
    pad(26, 20, 9, 0x14212e);    // lab: dark tech floor
  }

  private grassTexture(): CanvasTexture {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#2c5e38'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) {
      const shade = 40 + Math.random() * 50;
      g.fillStyle = `rgb(${shade * 0.5},${shade + 30},${shade * 0.6})`;
      g.fillRect(Math.random() * 128, Math.random() * 128, 2, 3);
    }
    return new CanvasTexture(c);
  }

  // --------------------------------------------------------- shared helpers
  private mat(color: number, rough = 0.8, metal = 0): MeshStandardMaterial {
    return new MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  }
  private box(w: number, h: number, d: number, color: number) {
    const m = new Mesh(new BoxGeometry(w, h, d), this.mat(color));
    m.castShadow = true; m.receiveShadow = true; return m;
  }
  private register(key: SectorKey, group: Group, pos: Vector3, radius: number) {
    group.position.copy(pos);
    this.scene.add(group);
    this.interactables.push({ key, group, position: pos.clone(), radius, label: PROJECTS[key].title });
  }

  // ------------------------------------------------------------- PARK (book)
  private buildPark() {
    const cx = -26, cz = -18;
    for (const [dx, dz] of [[-6, -4], [5, -5], [7, 3], [-7, 4]]) this.tree(cx + dx, cz + dz);
    // pond
    const pond = new Mesh(new CircleGeometry(3.2, 40), this.mat(0x2a86c9, 0.2, 0.2));
    pond.rotation.x = -Math.PI / 2; pond.position.set(cx - 5, 0.03, cz + 6);
    this.scene.add(pond);

    // the giant book on a pedestal
    const g = new Group();
    const pedestal = this.box(2.4, 1, 1.8, 0x5c3d22); pedestal.position.y = 0.5;
    const book = this.box(2.2, 0.5, 1.6, 0xffb020); book.position.y = 1.25; book.rotation.x = -0.25;
    const pages = this.box(2.0, 0.3, 1.4, 0xf4ecd8); pages.position.y = 1.3; pages.rotation.x = -0.25;
    g.add(pedestal, book, pages);
    this.register('kindle', g, new Vector3(cx, 0, cz), 3.5);

    // the about signpost nearby
    const about = new Group();
    const postA = this.box(0.2, 2, 0.2, 0x4a3018); postA.position.y = 1;
    const sign = this.box(1.8, 1, 0.15, 0x8a5a2c); sign.position.y = 2;
    about.add(postA, sign);
    this.register('about', about, new Vector3(cx + 9, 0, cz + 7), 3);
  }

  private tree(x: number, z: number) {
    const g = new Group();
    const trunk = new Mesh(new CylinderGeometry(0.28, 0.4, 2.4, 8), this.mat(0x5c3d22));
    trunk.position.y = 1.2; trunk.castShadow = true;
    const canopy = new Mesh(new SphereGeometry(1.8, 12, 10), this.mat(0x2f7d3f, 0.9));
    canopy.position.y = 3.4; canopy.castShadow = true;
    const canopy2 = new Mesh(new SphereGeometry(1.3, 12, 10), this.mat(0x3a914b, 0.9));
    canopy2.position.set(0.8, 3.0, 0.4); canopy2.castShadow = true;
    g.add(trunk, canopy, canopy2); g.position.set(x, 0, z);
    this.scene.add(g);
  }

  // ----------------------------------------------- LIVING ROOM (tv) + family
  private buildLivingRoom() {
    const cx = 26, cz = -18;
    // rug
    const rug = new Mesh(new CircleGeometry(5, 40), this.mat(0x5e353c, 1));
    rug.rotation.x = -Math.PI / 2; rug.position.set(cx, 0.03, cz); this.scene.add(rug);

    // the TV on a stand
    const g = new Group();
    const stand = this.box(3.2, 0.5, 1, 0x241a14); stand.position.y = 0.25;
    const body = this.box(3, 1.9, 0.4, 0x14181f); body.position.y = 1.7;
    const screen = new Mesh(new PlaneGeometry(2.7, 1.55), new MeshStandardMaterial({ color: 0x0a1826, emissive: 0x2aa6c8, emissiveIntensity: 1.6 }));
    screen.position.set(0, 1.7, 0.21);
    g.add(stand, body, screen);
    this.register('prime', g, new Vector3(cx, 0, cz - 4), 3.6);

    // couch + a little family (decor)
    const couch = this.box(4, 1, 1.6, 0x454c63); couch.position.set(cx, 0.5, cz + 4); this.scene.add(couch);
    const back = this.box(4, 1, 0.5, 0x515873); back.position.set(cx, 1.1, cz + 4.6); this.scene.add(back);
    const people = [0x5566cc, 0xcc5588, 0x55bb88, 0xe0a94e];
    people.forEach((col, i) => {
      const p = new Group();
      const b = new Mesh(new CapsuleGeometry(0.28, 0.5, 4, 8), this.mat(col)); b.position.y = 1.1; b.castShadow = true;
      const h = new Mesh(new SphereGeometry(0.26, 12, 10), this.mat(0xf0c9a0)); h.position.y = 1.7;
      const scale = i >= 2 ? 0.8 : 1; p.scale.setScalar(scale);
      p.add(b, h); p.position.set(cx - 1.4 + i * 0.95, 0, cz + 4); this.scene.add(p);
    });
  }

  // ----------------------------------------------------- AD STREET (ads)
  private buildStreet() {
    const cx = -26, cz = 20;
    // road strip
    const road = this.box(18, 0.05, 5, 0x20242b); road.position.set(cx, 0.04, cz + 3); this.scene.add(road);
    for (const [dx, dz, h] of [[-7, -5, 7], [6, -6, 9], [8, 4, 6]]) {
      const b = this.box(2.4, h, 2.4, 0x2d3550); b.position.set(cx + dx, h / 2, cz + dz); this.scene.add(b);
    }
    // billboard
    const g = new Group();
    const legA = this.box(0.25, 3, 0.25, 0x4a4f5a); legA.position.set(-1, 1.5, 0);
    const legB = this.box(0.25, 3, 0.25, 0x4a4f5a); legB.position.set(1, 1.5, 0);
    const board = this.box(4, 2.4, 0.3, 0x1b1430); board.position.y = 4.2;
    const face = new Mesh(new PlaneGeometry(3.7, 2.1), new MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x8b5cf6, emissiveIntensity: 1.4 }));
    face.position.set(0, 4.2, 0.17);
    g.add(legA, legB, board, face);
    this.register('ads', g, new Vector3(cx, 0, cz), 3.8);
  }

  // --------------------------------------------------------- NEON LAB (agents)
  private buildLab() {
    const cx = 26, cz = 20;
    // glowing grid pad
    const pad = new Mesh(new CircleGeometry(10, 48), new MeshStandardMaterial({ color: 0x0a1626, emissive: 0x0d3350, emissiveIntensity: 0.5, roughness: 0.5 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(cx, 0.03, cz); this.scene.add(pad);
    // server racks
    for (const [dx, dz] of [[-6, -4], [6, -3], [-5, 5]]) {
      const rack = this.box(1.4, 3, 1, 0x16233a); rack.position.set(cx + dx, 1.5, cz + dz);
      for (let i = 0; i < 4; i++) {
        const led = new Mesh(new BoxGeometry(1, 0.18, 0.05), new MeshStandardMaterial({ color: 0x38e8ff, emissive: 0x38e8ff, emissiveIntensity: Math.random() > 0.5 ? 1.5 : 0.1 }));
        led.position.set(0, 0.8 - i * 0.5, 0.52); rack.add(led);
      }
      this.scene.add(rack);
    }
    // terminal
    const g = new Group();
    const base = this.box(1.6, 1, 1, 0x13233a); base.position.y = 0.5;
    const col = this.box(0.4, 1.2, 0.4, 0x16314a); col.position.y = 1.4;
    const scr = new Mesh(new PlaneGeometry(1.8, 1.1), new MeshStandardMaterial({ color: 0x071018, emissive: 0x38e8ff, emissiveIntensity: 1.5 }));
    scr.position.set(0, 2.3, 0.05);
    g.add(base, col, scr);
    this.register('agents', g, new Vector3(cx, 0, cz), 3.6);
  }

  // ----------------------------------------------------- CONTACT (mailbox)
  private buildContact() {
    const g = new Group();
    const post = this.box(0.2, 1.4, 0.2, 0x4a3018); post.position.y = 0.7;
    const boxM = this.box(0.9, 0.7, 1.2, 0x1f6f42); boxM.position.y = 1.6;
    g.add(post, boxM);
    this.register('contact', g, new Vector3(0, 0, 2), 2.6);
  }

  // ------------------------------------------------------------- day / night
  cycleSky(): string {
    this.skyIndex = (this.skyIndex + 1) % SKY_ORDER.length;
    const name = SKY_ORDER[this.skyIndex];
    this.applySky(name);
    return name;
  }
  private applySky(name: string) {
    const s = SKIES[name];
    (this.scene.background as Color).copy(s.sky);
    (this.scene.fog as Fog).color.copy(s.fog);
    this.sun.intensity = s.sun;
    this.ambient.intensity = s.ambient;
    this.hemi.intensity = name === 'night' ? 0.25 : 0.7;
  }
}

// silence unused import in some bundler setups
void DoubleSide; void ConeGeometry;
