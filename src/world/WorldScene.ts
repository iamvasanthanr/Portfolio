/**
 * world/WorldScene.ts
 * Contract + base class for a self-contained themed world (one per chapter).
 * Each world owns its ground, lights, fog, sky color, decor and the single
 * interactable prop. The WorldManager builds one at a time and disposes it on
 * transition, so each chapter feels like a different place.
 */

import {
  Scene, Group, Color, Fog, Vector3, Mesh, MeshStandardMaterial, MeshBasicMaterial,
  BoxGeometry, CylinderGeometry, SphereGeometry, PlaneGeometry, CircleGeometry,
  Light, Material, BufferGeometry,
} from 'three';
import type { SectorKey } from '../data/projects';

export interface Interactable {
  key: SectorKey;
  position: Vector3;
  radius: number;
  label: string;
}

export interface WorldScene {
  readonly key: SectorKey;
  /** the group holding all of this world's meshes */
  readonly object3d: import('three').Group;
  /** where the player should spawn (world units) */
  readonly spawn: Vector3;
  /** the single prop the player walks up to */
  readonly interactable: Interactable;
  /** positions to scatter collectibles in this world */
  readonly collectibleSpots: Vector3[];
  /** walkable bounds */
  readonly bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** ground height at a world position (for ramps/stairs); default 0 */
  groundHeightAt?(x: number, z: number): number;
  /** add everything to the scene + set fog/background/lights */
  build(scene: Scene): void;
  /** per-frame ambient animation (neon flicker, water, etc.) */
  update(dt: number, t: number): void;
  /** remove from scene and free GPU memory */
  dispose(scene: Scene): void;
}

export abstract class BaseWorld implements WorldScene {
  abstract readonly key: SectorKey;
  abstract readonly spawn: Vector3;
  abstract readonly interactable: Interactable;
  readonly collectibleSpots: Vector3[] = [];
  readonly bounds = { minX: -40, maxX: 40, minZ: -40, maxZ: 40 };

  protected root = new Group();
  protected lights: Light[] = [];
  protected animated: ((dt: number, t: number) => void)[] = [];

  /** the group holding all of this world's meshes (manager attaches it) */
  get object3d(): Group { return this.root; }

  abstract build(scene: Scene): void;
  update(dt: number, t: number): void { for (const f of this.animated) f(dt, t); }

  dispose(scene: Scene): void {
    scene.remove(this.root);
    for (const l of this.lights) scene.remove(l);
    this.root.traverse((o) => {
      const m = o as Mesh;
      if (m.geometry) (m.geometry as BufferGeometry).dispose();
      if (m.material) {
        const mat = m.material as Material | Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat.dispose();
      }
    });
    this.root.clear();
    this.lights = [];
    this.animated = [];
  }

  // -------- shared helpers --------
  protected setSky(scene: Scene, sky: number, fog: number, near: number, far: number) {
    (scene.background as Color) = new Color(sky);
    scene.fog = new Fog(fog, near, far);
  }
  protected addLight(scene: Scene, l: Light) { this.lights.push(l); scene.add(l); }

  protected mat(color: number, rough = 0.85, metal = 0, emissive = 0, emissiveI = 0): MeshStandardMaterial {
    return new MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity: emissiveI });
  }
  protected basic(color: number, opacity = 1): MeshBasicMaterial {
    return new MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
  }
  protected box(w: number, h: number, d: number, mat: MeshStandardMaterial): Mesh {
    const m = new Mesh(new BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
  protected cyl(rt: number, rb: number, h: number, mat: MeshStandardMaterial, seg = 16): Mesh {
    const m = new Mesh(new CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = true; return m;
  }
  protected sphere(r: number, mat: MeshStandardMaterial, seg = 16): Mesh {
    const m = new Mesh(new SphereGeometry(r, seg, seg), mat); m.castShadow = true; return m;
  }
  protected ground(size: number, mat: MeshStandardMaterial): Mesh {
    const m = new Mesh(new PlaneGeometry(size, size), mat); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
  }
  protected disc(r: number, mat: MeshStandardMaterial): Mesh {
    const m = new Mesh(new CircleGeometry(r, 48), mat); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
  }
  protected add(...objs: import('three').Object3D[]) { this.root.add(...objs); }
}
