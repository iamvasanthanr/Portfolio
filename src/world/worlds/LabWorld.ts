/**
 * world/worlds/LabWorld.ts  (Chapter 4 - Agentic AI)
 * High-security lab: dark metal floor with a glowing cyan grid, server racks
 * with blinking LEDs, cold rim lighting, scanning light, and the agent terminal.
 */
import {
  Scene, Vector3, AmbientLight, PointLight, SpotLight, GridHelper, MeshStandardMaterial, Color,
} from 'three';
import { BaseWorld, type Interactable } from '../WorldScene';

export class LabWorld extends BaseWorld {
  readonly key = 'agents' as const;
  readonly spawn = new Vector3(0, 0, 18);
  readonly interactable: Interactable = { key: 'agents', position: new Vector3(0, 0, -12), radius: 3.6, label: 'the terminal' };
  readonly collectibleSpots = [new Vector3(-7, 0, 2), new Vector3(7, 0, 0), new Vector3(0, 0, 4)];
  readonly bounds = { minX: -14, maxX: 14, minZ: -16, maxZ: 22 };

  build(scene: Scene) {
    this.setSky(scene, 0x080c14, 0x0a1420, 30, 100);
    this.addLight(scene, new AmbientLight(0x2a5a7a, 0.9));
    // cold rim
    const rim = new PointLight(0x38e8ff, 10, 40, 2); rim.position.set(-10, 10, 8); this.addLight(scene, rim);
    const rim2 = new PointLight(0x8b5cf6, 8, 40, 2); rim2.position.set(10, 8, -6); this.addLight(scene, rim2);
    // a scanning spotlight that sweeps
    const scan = new SpotLight(0x9fe8ff, 60, 40, Math.PI / 8, 0.4, 1.5);
    scan.position.set(0, 14, 0); scan.castShadow = true; scan.shadow.mapSize.set(1024, 1024);
    this.addLight(scene, scan); scene.add(scan.target);
    this.animated.push((_dt, t) => { scan.target.position.set(Math.sin(t * 0.6) * 8, 0, Math.cos(t * 0.6) * 8); scan.target.updateMatrixWorld(); });

    // dark metal floor
    this.add(this.ground(80, this.mat(0x0c141c, 0.5, 0.4)));
    // glowing grid
    const grid = new GridHelper(48, 48, 0x38e8ff, 0x1a4a5c);
    const gm = grid.material as import("three").LineBasicMaterial; gm.transparent = true; gm.opacity = 0.35;
    grid.position.y = 0.02; this.root.add(grid);

    // server racks around the room
    for (const [x, z] of [[-8, -4], [8, -3], [-8, 4], [8, 4], [-4, -8], [4, -8]]) {
      const rack = this.box(1.6, 3.2, 1, this.mat(0x16233a, 0.6, 0.3)); rack.position.set(x, 1.6, z); this.add(rack);
      for (let i = 0; i < 5; i++) {
        const on = Math.random() > 0.4;
        const led = this.box(1.1, 0.16, 0.06, this.mat(0x0a1a2a, 1, 0, 0x38e8ff, on ? 1.6 : 0.1));
        led.position.set(x, 0.8 + i * 0.5, z + 0.53); this.add(led);
        if (on) { const ph = Math.random() * 6; this.animated.push((_dt, t) => { (led.material as MeshStandardMaterial).emissiveIntensity = 1 + 0.6 * Math.sin(t * 4 + ph); }); }
      }
    }

    // the terminal (the prop) on a lit pad
    const pad = this.disc(3, this.mat(0x0a1626, 0.4, 0.3, 0x0d3350, 0.6)); pad.position.set(0, 0.03, -12); this.add(pad);
    const base = this.box(1.6, 1, 1, this.mat(0x13233a, 0.6, 0.3)); base.position.set(0, 0.5, -12);
    const col = this.box(0.4, 1.2, 0.4, this.mat(0x16314a)); col.position.set(0, 1.4, -12);
    const scr = this.box(1.9, 1.15, 0.08, this.mat(0x071018, 0.4, 0, 0x38e8ff, 1.6)); scr.position.set(0, 2.2, -11.95);
    this.add(base, col, scr);
    const glow = new PointLight(0x38e8ff, 10, 14, 2); glow.position.set(0, 2.2, -11); this.addLight(scene, glow);
    this.animated.push((_dt, t) => { (scr.material as MeshStandardMaterial).emissiveIntensity = 1.4 + 0.5 * Math.sin(t * 6); });
  }
}
void Color;
