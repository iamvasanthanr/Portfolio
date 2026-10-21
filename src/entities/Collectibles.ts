/**
 * entities/Collectibles.ts
 * Scatters glowing stars around the world. Walking near one collects it
 * (spin + pop + a HUD counter), giving the world a light "explore and
 * find them all" game loop. Pure reward, no gating.
 */

import {
  Group, Mesh, MeshStandardMaterial, OctahedronGeometry, PointLight, Vector3, MathUtils,
} from 'three';

interface Star { group: Group; mesh: Mesh; light: PointLight; collected: boolean; baseY: number; }

export class Collectibles {
  readonly group = new Group();
  private stars: Star[] = [];
  private collected = 0;
  onCollect: (count: number, total: number) => void = () => {};

  constructor(positions: Vector3[]) {
    const geo = new OctahedronGeometry(0.4);
    for (const p of positions) {
      const mat = new MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffc24a, emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.4 });
      const mesh = new Mesh(geo, mat); mesh.castShadow = true;
      const light = new PointLight(0xffc24a, 6, 6, 2);
      const g = new Group(); g.add(mesh, light);
      g.position.copy(p); g.position.y = 1.2;
      this.group.add(g);
      this.stars.push({ group: g, mesh, light, collected: false, baseY: 1.2 });
    }
  }

  get total(): number { return this.stars.length; }

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
    // pop + fade out
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
