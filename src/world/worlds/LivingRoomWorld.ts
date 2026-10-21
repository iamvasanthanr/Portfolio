/**
 * world/worlds/LivingRoomWorld.ts  (Chapter 3 - Prime Video)
 * Cozy interior: wood floor, three walls, a rug, a couch with a little family,
 * warm lamp light, wall art, and the glowing TV as the prop.
 */
import {
  Scene, Group, Vector3, AmbientLight, PointLight, MeshStandardMaterial, SphereGeometry, Mesh, CapsuleGeometry,
} from 'three';
import { BaseWorld, type Interactable } from '../WorldScene';

export class LivingRoomWorld extends BaseWorld {
  readonly key = 'prime' as const;
  readonly spawn = new Vector3(0, 0, 6);
  readonly interactable: Interactable = { key: 'prime', position: new Vector3(0, 0, -6), radius: 3.6, label: 'the TV' };
  readonly collectibleSpots = [new Vector3(-5, 0, 2), new Vector3(5, 0, 1), new Vector3(0, 0, 4)];
  readonly bounds = { minX: -8.5, maxX: 8.5, minZ: -7.5, maxZ: 8.5 };

  build(scene: Scene) {
    this.setSky(scene, 0x241c14, 0x2a2018, 40, 120);
    this.addLight(scene, new AmbientLight(0xffe8c0, 0.8));
    // warm lamp
    const lamp = new PointLight(0xffd79a, 22, 28, 2); lamp.position.set(-5, 4, 3); lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024); this.addLight(scene, lamp);
    const tvGlow = new PointLight(0x8fd0ff, 10, 16, 2); tvGlow.position.set(0, 2, -4); this.addLight(scene, tvGlow);

    // wood floor
    this.add(this.ground(40, this.mat(0x6b4a2c, 0.8)));
    const rug = this.disc(3.2, this.mat(0x7a3b44, 1)); rug.position.y = 0.01; this.add(rug);

    // three walls
    const wallMat = this.mat(0x3a4a5c, 0.95);
    const back = this.box(18, 8, 0.4, wallMat); back.position.set(0, 4, -9); back.receiveShadow = true;
    const left = this.box(0.4, 8, 18, wallMat); left.position.set(-9, 4, 0);
    const right = this.box(0.4, 8, 18, wallMat); right.position.set(9, 4, 0);
    this.add(back, left, right);
    // wall art
    const art = this.box(2.2, 1.6, 0.1, this.mat(0x263150, 0.6, 0, 0x16233f, 0.3)); art.position.set(-4, 4.5, -8.75); this.add(art);
    // lamp pole + shade
    const pole = this.cyl(0.08, 0.08, 3.5, this.mat(0x2a2a30)); pole.position.set(-5, 1.75, 3);
    const shade = this.cyl(0.6, 0.9, 0.8, this.mat(0xffe6a0, 0.5, 0, 0xffcf70, 0.8)); shade.position.set(-5, 3.6, 3);
    this.add(pole, shade);

    // TV stand + TV (the prop)
    const stand = this.box(4, 0.5, 1, this.mat(0x241a14)); stand.position.set(0, 0.25, -6.5);
    const body = this.box(3.6, 2.1, 0.3, this.mat(0x14181f)); body.position.set(0, 2, -6.7);
    const screen = this.box(3.2, 1.75, 0.08, this.mat(0x0a1826, 0.4, 0, 0x2aa6c8, 1.6)); screen.position.set(0, 2, -6.52);
    this.add(stand, body, screen);
    this.animated.push((_dt, t) => { (screen.material as MeshStandardMaterial).emissiveIntensity = 1.3 + 0.3 * Math.sin(t * 5); });

    // couch
    const couch = this.box(4.4, 1, 1.6, this.mat(0x454c63)); couch.position.set(0, 0.5, 4);
    const cback = this.box(4.4, 1.1, 0.5, this.mat(0x515873)); cback.position.set(0, 1.1, 4.6);
    this.add(couch, cback);
    // little family watching
    const cols = [0x5566cc, 0xcc5588, 0x55bb88, 0xe0a94e];
    cols.forEach((col, i) => {
      const p = new Group();
      const b = new Mesh(new CapsuleGeometry(0.28, 0.5, 4, 10), this.mat(col)); b.position.y = 1.15; b.castShadow = true;
      const h = new Mesh(new SphereGeometry(0.26, 12, 10), this.mat(0xf0c9a0)); h.position.y = 1.75;
      const sc = i >= 2 ? 0.8 : 1; p.scale.setScalar(sc);
      p.add(b, h); p.position.set(-1.6 + i * 1.05, 0, 3.6); this.add(p);
    });
  }
}
