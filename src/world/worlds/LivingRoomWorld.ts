/**
 * world/worlds/LivingRoomWorld.ts  (Prime Video)
 * The player starts outside on a path, climbs a short staircase up onto a
 * raised living-room platform, and reaches the glowing TV. A little family
 * watches from the couch. Warm interior lighting.
 */
import {
  Scene, Group, Vector3, AmbientLight, PointLight, MeshStandardMaterial, SphereGeometry, Mesh, CapsuleGeometry,
} from 'three';
import { BaseWorld, type Interactable } from '../WorldScene';

// platform geometry
const FLOOR_Y = 1.4;        // raised living-room height
const STAIR_Z0 = -2;        // stairs occupy z in [STAIR_Z0 .. STAIR_Z0+DEPTH]
const STAIR_DEPTH = 3;

export class LivingRoomWorld extends BaseWorld {
  readonly key = 'prime' as const;
  readonly spawn = new Vector3(0, 0, 12);
  readonly interactable: Interactable = { key: 'prime', position: new Vector3(0, FLOOR_Y, -9), radius: 3.6, label: 'the TV' };
  readonly collectibleSpots = [new Vector3(-4, 0, 7), new Vector3(4, 0, 5), new Vector3(0, 0, 9)];
  readonly bounds = { minX: -8, maxX: 8, minZ: -11, maxZ: 15 };

  /** flat ground outside, a ramp up the stairs, flat platform on top */
  groundHeightAt(_x: number, z: number): number {
    if (z <= STAIR_Z0 - STAIR_DEPTH) return FLOOR_Y;          // on the platform
    if (z >= STAIR_Z0) return 0;                              // outside on the ground
    const k = (STAIR_Z0 - z) / STAIR_DEPTH;                   // 0..1 up the stairs
    return FLOOR_Y * k;
  }

  build(scene: Scene) {
    this.setSky(scene, 0x241c14, 0x2a2018, 45, 130);
    this.addLight(scene, new AmbientLight(0xffe8c0, 0.85));
    const lamp = new PointLight(0xffd79a, 24, 30, 2); lamp.position.set(-5, FLOOR_Y + 4, -4); lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024); this.addLight(scene, lamp);
    this.addLight(scene, new PointLight(0x8fd0ff, 10, 16, 2).translateY(FLOOR_Y + 2));

    // outside grass/entry
    this.add(this.ground(120, this.mat(0x3a5a3a, 1)));
    const walk = this.box(3, 0.06, 14, this.mat(0x9a8a6a, 1)); walk.position.set(0, 0.03, 6); this.add(walk);

    // raised platform (the house floor)
    const plat = this.box(16, FLOOR_Y, 16, this.mat(0x6b4a2c, 0.8)); plat.position.set(0, FLOOR_Y / 2, -9); this.add(plat);
    const rug = this.disc(3, this.mat(0x7a3b44, 1)); rug.position.set(0, FLOOR_Y + 0.02, -8); this.add(rug);

    // staircase up the front of the platform
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const sy = (FLOOR_Y / steps) * (i + 0.5);
      const sz = STAIR_Z0 - (STAIR_DEPTH / steps) * (i + 0.5);
      const step = this.box(5, FLOOR_Y / steps, STAIR_DEPTH / steps + 0.02, this.mat(0x5a3f22, 0.9));
      step.position.set(0, sy, sz); this.add(step);
    }

    // walls behind the platform
    const wallMat = this.mat(0x3a4a5c, 0.95);
    const back = this.box(16, 8, 0.4, wallMat); back.position.set(0, FLOOR_Y + 4, -17); this.add(back);
    const left = this.box(0.4, 8, 16, wallMat); left.position.set(-8, FLOOR_Y + 4, -9);
    const right = this.box(0.4, 8, 16, wallMat); right.position.set(8, FLOOR_Y + 4, -9);
    this.add(left, right);
    const art = this.box(2.4, 1.7, 0.1, this.mat(0x263150, 0.6, 0, 0x16233f, 0.3)); art.position.set(-4, FLOOR_Y + 4.5, -16.75); this.add(art);
    // lamp pole + shade
    const pole = this.cyl(0.08, 0.08, 3.5, this.mat(0x2a2a30)); pole.position.set(-5, FLOOR_Y + 1.75, -4);
    const shade = this.cyl(0.6, 0.9, 0.8, this.mat(0xffe6a0, 0.5, 0, 0xffcf70, 0.8)); shade.position.set(-5, FLOOR_Y + 3.6, -4);
    this.add(pole, shade);

    // TV (the prop) on the platform
    const stand = this.box(4, 0.5, 1, this.mat(0x241a14)); stand.position.set(0, FLOOR_Y + 0.25, -9.5);
    const body = this.box(3.6, 2.1, 0.3, this.mat(0x14181f)); body.position.set(0, FLOOR_Y + 2, -9.7);
    const screen = this.box(3.2, 1.75, 0.08, this.mat(0x0a1826, 0.4, 0, 0x2aa6c8, 1.6)); screen.position.set(0, FLOOR_Y + 2, -9.52);
    this.add(stand, body, screen);
    this.animated.push((_dt, t) => { (screen.material as MeshStandardMaterial).emissiveIntensity = 1.3 + 0.3 * Math.sin(t * 5); });

    // couch + family on the platform
    const couch = this.box(4.4, 1, 1.6, this.mat(0x454c63)); couch.position.set(0, FLOOR_Y + 0.5, -4);
    const cback = this.box(4.4, 1.1, 0.5, this.mat(0x515873)); cback.position.set(0, FLOOR_Y + 1.1, -3.4);
    this.add(couch, cback);
    const cols = [0x5566cc, 0xcc5588, 0x55bb88, 0xe0a94e];
    cols.forEach((col, i) => {
      const p = new Group();
      const b = new Mesh(new CapsuleGeometry(0.28, 0.5, 4, 10), this.mat(col)); b.position.y = 1.15; b.castShadow = true;
      const h = new Mesh(new SphereGeometry(0.26, 12, 10), this.mat(0xf0c9a0)); h.position.y = 1.75;
      const sc = i >= 2 ? 0.8 : 1; p.scale.setScalar(sc);
      p.add(b, h); p.position.set(-1.6 + i * 1.05, FLOOR_Y, -4.4); this.add(p);
    });
  }
}
