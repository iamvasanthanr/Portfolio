/**
 * entities/Collectibles.ts
 * Scatters glowing stars in the current world. Walking near one collects it
 * (spin + pop + HUD counter). reset(spots) rebuilds the set when the world
 * changes, so each chapter has its own stars to find.
 */

import {
  Group, Mesh, MeshStandardMaterial, OctahedronGeometry, PointLight, Vector3, MathUtils,
  BufferGeometry, Material,
} from 'three';

interface Star { group: Group; mesh: Mesh; light: PointLight; collected: boolean; baseY: number; }

export class Collectibles {
  readonly group = new Group();
  private stars: Star[] = [];
  private collected = 0;
  private geo = new OctahedronGeometry(0.4);
  onCollect: (count: number, total: number) => void = () => {};

  constructor(positions: Vector3[]) { this.reset(positions); }

  get total(): number { return this.stars.length; }

  /** rebuild the stars for a new world */
  reset(positions: Vector3[]) {
    // dispose old
    for (const s of this.stars) {
      this.group.remove(s.group);
      (s.mesh.material as Material).dispose();
    }
    this.stars = [];
    this.collected = 0;
    for (const p of positions) {
      const mat = new MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffc24a, emissiveIntensity: 1.4, roughness: 0.3, metalness: 0.4 });
      const mesh = new Mesh(this.geo, mat); mesh.castShadow = true;
      const light = new PointLight(0xffc24a, 6, 6, 2);
      const g = new Group(); g.add(mesh, light);
      g.position.copy(p); g.position.y = 1.2;
      this.group.add(g);
      this.stars.push({ group: g, mesh, light, collected: false, baseY: 1.2 });
    }
  }

  update(dt: number, playerPos: Vector3, t: number) {
    for (const s of this.stars) {
      if (s.collected) continue;
      s.mesh.rotation.y += dt * 2;
      s.group.position.y = s.baseY + Math.sin(t * 2 + s.baseY) * 0.2;
      if (s.group.position.distanceTo(playerPos) < 1.6) this.collect(s);
    }
  }

  private collect(s: Star) {
    s.collected = true;
    this.collected++;
    this.onCollect(this.collected, this.total);
    const start = performance.now();
    const anim = () => {
      const k = Math.min((performance.now() - start) / 320, 1);
      const scale = MathUtils.lerp(1, 1.8, k);
      s.group.scale.setScalar(scale * (1 - k) + 0.001);
      s.group.position.y = s.baseY + k * 1.5;
      s.light.intensity = 6 * (1 - k);
      if (k < 1) requestAnimationFrame(anim);
      else s.group.visible = false;
    };
    anim();
  }
}
void BufferGeometry;
