/**
 * world/worlds/TimesSquareWorld.ts  (Chapter 2 - Advertising)
 * Neon night city: dark wet asphalt, tall buildings studded with glowing
 * billboards and windows, cool night fog. The hero billboard is the prop.
 */
import {
  Scene, Vector3, AmbientLight, DirectionalLight, PointLight, MeshStandardMaterial, Color,
} from 'three';
import { BaseWorld, type Interactable } from '../WorldScene';

const NEON = [0xff3c7e, 0x38e8ff, 0xffe14a, 0xa78bfa, 0x4ade80, 0xff7a45];

export class TimesSquareWorld extends BaseWorld {
  readonly key = 'ads' as const;
  readonly spawn = new Vector3(0, 0, 10);
  readonly interactable: Interactable = { key: 'ads', position: new Vector3(0, 0, -8), radius: 4, label: 'the billboard' };
  readonly collectibleSpots = [new Vector3(-7, 0, 2), new Vector3(8, 0, 0), new Vector3(0, 0, 5)];
  readonly bounds = { minX: -14, maxX: 14, minZ: -14, maxZ: 16 };

  build(scene: Scene) {
    this.setSky(scene, 0x0a0a16, 0x141230, 30, 110);
    this.addLight(scene, new AmbientLight(0x6a6a9a, 1.2));
    const key = new DirectionalLight(0x9a9aff, 0.9); key.position.set(6, 20, 8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); this.addLight(scene, key);

    // wet asphalt (slightly reflective-looking via low roughness + dark)
    const road = this.ground(120, this.mat(0x14141c, 0.35, 0.1));
    this.add(road);
    // road markings
    for (let z = -12; z <= 14; z += 4) { const m = this.box(0.3, 0.02, 1.6, this.mat(0xbbbb55, 1)); m.position.set(0, 0.02, z); this.add(m); }

    // buildings lining both sides, each with neon billboards + lit windows
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const z = -12 + i * 7;
        const h = 14 + Math.random() * 10;
        const b = this.box(5, h, 5, this.mat(0x15151f, 0.9));
        b.position.set(side * 9, h / 2, z);
        this.add(b);
        // lit windows
        for (let wy = 2; wy < h - 1; wy += 2.2) {
          for (let wx = -1.4; wx <= 1.4; wx += 1.4) {
            if (Math.random() < 0.5) continue;
            const on = Math.random() < 0.7;
            const win = this.box(0.8, 1.1, 0.1, this.mat(0x0a0a14, 1, 0, on ? 0xffcc66 : 0, on ? 1.2 : 0));
            win.position.set(side * (9 - 2.55), wy, z + wx);
            win.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
            // rotate billboards to face the street: put on inner face
            win.position.x = side * 6.45; win.position.z = z + wx; win.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
            this.add(win);
          }
        }
        // a big neon billboard on the face
        const col = NEON[(i + (side > 0 ? 3 : 0)) % NEON.length];
        const bb = this.box(0.2, 3, 4, this.mat(0x050508, 1, 0, col, 1.6));
        bb.position.set(side * 6.4, h * 0.6, z); this.add(bb);
        const halo = new PointLight(col, 8, 16, 2); halo.position.set(side * 5.5, h * 0.6, z); this.addLight(scene, halo);
        // subtle flicker
        const base = 8; const ph = Math.random() * 6;
        this.animated.push((_dt, t) => { halo.intensity = base * (0.8 + 0.2 * Math.sin(t * 3 + ph)); });
      }
    }

    // the hero billboard (the prop) straight ahead
    const legA = this.box(0.3, 6, 0.3, this.mat(0x2a2a33)); legA.position.set(-1.6, 3, -8);
    const legB = this.box(0.3, 6, 0.3, this.mat(0x2a2a33)); legB.position.set(1.6, 3, -8);
    const panel = this.box(5, 3, 0.4, this.mat(0x0a0a12)); panel.position.set(0, 6.5, -8);
    const face = this.box(4.6, 2.6, 0.1, this.mat(0x120a1e, 1, 0, 0xa78bfa, 1.8)); face.position.set(0, 6.5, -7.78);
    this.add(legA, legB, panel, face);
    const glow = new PointLight(0xa78bfa, 14, 20, 2); glow.position.set(0, 6.5, -6); this.addLight(scene, glow);
    this.animated.push((_dt, t) => { (face.material as MeshStandardMaterial).emissiveIntensity = 1.5 + 0.4 * Math.sin(t * 2.2); });
  }
}
void Color;
