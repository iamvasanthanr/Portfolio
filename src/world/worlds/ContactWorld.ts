/**
 * world/worlds/ContactWorld.ts  (Epilogue - Contact)
 * A calm dusk clearing: soft gradient sky, gentle grass, a mailbox on a post,
 * a few fireflies. The quiet closing beat.
 */
import {
  Scene, Vector3, HemisphereLight, DirectionalLight, PointLight, MeshStandardMaterial,
} from 'three';
import { BaseWorld, type Interactable } from '../WorldScene';

export class ContactWorld extends BaseWorld {
  readonly key = 'contact' as const;
  readonly spawn = new Vector3(0, 0, 7);
  readonly interactable: Interactable = { key: 'contact', position: new Vector3(0, 0, -5), radius: 3, label: 'the mailbox' };
  readonly collectibleSpots = [new Vector3(-6, 0, 2), new Vector3(6, 0, 1)];
  readonly bounds = { minX: -16, maxX: 16, minZ: -14, maxZ: 14 };

  build(scene: Scene) {
    this.setSky(scene, 0x2a3a66, 0x4a3a5a, 45, 140);
    this.addLight(scene, new HemisphereLight(0xc8b0ff, 0x3a4a3a, 0.7));
    const sun = new DirectionalLight(0xffb98a, 0.8); sun.position.set(-10, 14, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); this.addLight(scene, sun);

    this.add(this.ground(160, this.mat(0x33543f, 1)));

    // mailbox (the prop)
    const post = this.cyl(0.1, 0.12, 1.6, this.mat(0x4a3018)); post.position.set(0, 0.8, -5);
    const boxM = this.box(0.9, 0.7, 1.2, this.mat(0x1f8f5a, 0.6, 0.1, 0x0a3a24, 0.3)); boxM.position.set(0, 1.7, -5);
    const flag = this.box(0.05, 0.4, 0.3, this.mat(0xff5a4a)); flag.position.set(0.48, 1.9, -5);
    this.add(post, boxM, flag);
    const glow = new PointLight(0x7affc0, 6, 12, 2); glow.position.set(0, 2.2, -4.2); this.addLight(scene, glow);

    // soft firefly points that bob
    for (let i = 0; i < 10; i++) {
      const f = this.sphere(0.07, this.mat(0xffe08a, 0.4, 0, 0xffd24a, 2), 8);
      const x = (Math.random() - 0.5) * 20, z = (Math.random() - 0.5) * 16, y0 = 1 + Math.random() * 2;
      f.position.set(x, y0, z); this.add(f);
      const ph = Math.random() * 6;
      this.animated.push((_dt, t) => { f.position.y = y0 + Math.sin(t * 1.5 + ph) * 0.4; });
    }
  }
}
void MeshStandardMaterial;
