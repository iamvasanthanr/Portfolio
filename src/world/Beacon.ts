/**
 * world/Beacon.ts
 * A glowing guidance marker placed at the current objective: a soft light
 * pillar, a pulsing ground ring, and a bobbing chevron. Moves to each new
 * target as the story advances, and hides in free-roam.
 */

import {
  Group, Mesh, MeshBasicMaterial, CylinderGeometry, RingGeometry, ConeGeometry,
  DoubleSide, Vector3, AdditiveBlending,
} from 'three';

export class Beacon {
  readonly group = new Group();
  private ring: Mesh;
  private chevron: Mesh;
  private pillar: Mesh;
  private visible = false;
  private t = 0;

  constructor(color = 0x58e39b) {
    const mat = (opacity: number) => new MeshBasicMaterial({ color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false, depthTest: true, side: DoubleSide });

    // vertical light beam (thin, raised, so the camera never ends up inside it)
    this.pillar = new Mesh(new CylinderGeometry(0.12, 0.12, 7, 12, 1, true), mat(0.22));
    this.pillar.position.y = 4.5;

    // ground ring
    this.ring = new Mesh(new RingGeometry(1.2, 1.5, 48), mat(0.8));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.06;

    // floating chevron (points down at the spot)
    this.chevron = new Mesh(new ConeGeometry(0.45, 0.9, 4), mat(0.95));
    this.chevron.rotation.x = Math.PI; // point down
    this.chevron.position.y = 2.6;

    this.group.add(this.pillar, this.ring, this.chevron);
    this.group.visible = false;
  }

  setColor(color: number) {
    for (const m of [this.ring, this.chevron, this.pillar]) (m.material as MeshBasicMaterial).color.setHex(color);
  }

  moveTo(pos: Vector3 | null) {
    if (!pos) { this.visible = false; this.group.visible = false; return; }
    this.group.position.set(pos.x, 0, pos.z);
    this.visible = true; this.group.visible = true;
  }

  /** @param camDist distance from the camera to this beacon (for near-fade) */
  update(dt: number, camDist = 999) {
    if (!this.visible) return;
    this.t += dt;
    this.ring.scale.setScalar(1 + Math.sin(this.t * 2.5) * 0.12);
    (this.ring.material as MeshBasicMaterial).opacity = 0.5 + Math.sin(this.t * 2.5) * 0.3;
    this.chevron.position.y = 2.6 + Math.sin(this.t * 2.5) * 0.25;
    this.chevron.rotation.z += dt * 1.2;
    // fade the tall beam out when the camera is close, so it never fills the view
    const near = Math.min(Math.max((camDist - 6) / 8, 0), 1); // 0 at <=6 units, 1 at >=14
    (this.pillar.material as MeshBasicMaterial).opacity = 0.22 * near;
    this.pillar.visible = near > 0.02;
  }
}
