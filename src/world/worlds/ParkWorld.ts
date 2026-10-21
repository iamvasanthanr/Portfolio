/**
 * world/worlds/ParkWorld.ts  (Chapter 1 - Kindle)
 * Warm daylight park: grass ground, trees, a pond, a bench, and the giant book.
 */
import {
  Scene, Group, Vector3, HemisphereLight, DirectionalLight, AmbientLight,
  CanvasTexture, RepeatWrapping, MeshStandardMaterial, Mesh,
} from 'three';
import { BaseWorld, type Interactable } from '../WorldScene';

export class ParkWorld extends BaseWorld {
  readonly key = 'kindle' as const;
  readonly spawn = new Vector3(0, 0, 8);
  readonly interactable: Interactable = { key: 'kindle', position: new Vector3(0, 0, -6), radius: 3.5, label: 'the book' };
  readonly collectibleSpots = [new Vector3(-8, 0, 2), new Vector3(9, 0, -2), new Vector3(-5, 0, -10)];
  readonly bounds = { minX: -22, maxX: 22, minZ: -20, maxZ: 16 };

  build(scene: Scene) {
    this.setSky(scene, 0x9fd0ff, 0xcfe6f0, 45, 140);
    this.addLight(scene, new HemisphereLight(0xdcefff, 0x4a6b3a, 0.85));
    this.addLight(scene, new AmbientLight(0xffffff, 0.3));
    const sun = new DirectionalLight(0xfff2d0, 1.25);
    sun.position.set(14, 26, 12); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.far = 90;
    const s = 40; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s });
    sun.shadow.bias = -0.0004; this.addLight(scene, sun);

    // grass
    const tex = this.grass(); tex.wrapS = tex.wrapT = RepeatWrapping; tex.repeat.set(20, 20);
    const g = this.ground(160, new MeshStandardMaterial({ map: tex, roughness: 1 }));
    this.add(g);

    // path to the book
    this.add(this.disc(4, this.mat(0xb8a373, 1)));

    // trees
    for (const [x, z] of [[-10, -4], [11, -6], [9, 6], [-9, 7], [-14, -12], [13, 2]]) this.tree(x, z);
    // pond
    const pond = this.disc(3, this.mat(0x2a86c9, 0.2, 0.3)); pond.position.set(-9, 0.04, 4); this.add(pond);
    // bench
    const bench = this.box(2.4, 0.3, 0.8, this.mat(0x6b4a2c)); bench.position.set(5, 0.7, -1);
    const bl1 = this.box(0.2, 0.7, 0.8, this.mat(0x4a3220)); bl1.position.set(4, 0.35, -1);
    const bl2 = this.box(0.2, 0.7, 0.8, this.mat(0x4a3220)); bl2.position.set(6, 0.35, -1);
    this.add(bench, bl1, bl2);

    // the book on a pedestal
    const ped = this.box(2.4, 1, 1.8, this.mat(0x5c3d22)); ped.position.set(0, 0.5, -6);
    const book = this.box(2.2, 0.45, 1.6, this.mat(0xffb020, 0.6, 0.1, 0x3a2600, 0.3)); book.position.set(0, 1.25, -6); book.rotation.x = -0.22;
    const pages = this.box(2.0, 0.28, 1.4, this.mat(0xf4ecd8)); pages.position.set(0, 1.3, -6); pages.rotation.x = -0.22;
    this.add(ped, book, pages);
  }

  private tree(x: number, z: number) {
    const g = new Group();
    const trunk = this.cyl(0.28, 0.42, 2.4, this.mat(0x5c3d22), 8); trunk.position.y = 1.2;
    const c1 = this.sphere(1.8, this.mat(0x2f7d3f, 0.9), 12); c1.position.y = 3.4;
    const c2 = this.sphere(1.3, this.mat(0x3a914b, 0.9), 12); c2.position.set(0.8, 3.0, 0.4);
    g.add(trunk, c1, c2); g.position.set(x, 0, z); this.add(g);
  }

  private grass(): CanvasTexture {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
    g.fillStyle = '#2f6b3a'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) { const s = 40 + Math.random() * 55; g.fillStyle = `rgb(${s * 0.5},${s + 35},${s * 0.6})`; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 3); }
    return new CanvasTexture(c);
  }
}
void Mesh;
