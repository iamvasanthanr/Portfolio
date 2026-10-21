/**
 * world/WorldManager.ts
 * Owns the Three.js Scene and swaps one themed WorldScene in at a time.
 * The game asks it to load a world by sector key; it disposes the previous
 * one and builds the new one, giving each chapter its own place.
 */
import { Scene } from 'three';
import type { SectorKey } from '../data/projects';
import type { WorldScene } from './WorldScene';
import { ParkWorld } from './worlds/ParkWorld';
import { TimesSquareWorld } from './worlds/TimesSquareWorld';
import { LivingRoomWorld } from './worlds/LivingRoomWorld';
import { LabWorld } from './worlds/LabWorld';
import { ContactWorld } from './worlds/ContactWorld';

const FACTORIES: Record<SectorKey, () => WorldScene> = {
  kindle: () => new ParkWorld(),
  ads: () => new TimesSquareWorld(),
  prime: () => new LivingRoomWorld(),
  agents: () => new LabWorld(),
  contact: () => new ContactWorld(),
  // "about" has no dedicated world; it is read from the park signpost if needed.
  about: () => new ParkWorld(),
};

export class WorldManager {
  readonly scene = new Scene();
  current!: WorldScene;

  load(key: SectorKey): WorldScene {
    if (this.current) this.current.dispose(this.scene);
    this.current = FACTORIES[key]();
    this.current.build(this.scene);
    this.scene.add(this.current.object3d); // attach the world's meshes
    return this.current;
  }

  update(dt: number, t: number) { this.current?.update(dt, t); }
}
