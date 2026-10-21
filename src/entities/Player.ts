/**
 * entities/Player.ts
 * A simple low-poly character plus a third-person follow camera.
 * Movement is camera-relative (push "up" = walk away from the camera),
 * which is what makes exploration feel like a real game.
 */

import {
  Group, Mesh, MeshStandardMaterial, CapsuleGeometry, SphereGeometry, BoxGeometry,
  CylinderGeometry, PerspectiveCamera, Vector3, Vector2, MathUtils, PointLight,
} from 'three';
import type { Input } from '../core/Input';

export class Player {
  readonly group = new Group();
  readonly position = new Vector3(0, 0, 6);

  private velocity = new Vector3();
  private readonly speed = 7;
  private readonly accel = 10;
  private facing = 0; // yaw the body faces

  // follow-camera orbit state
  private camYaw = 0;
  private camPitch = 0.5; // radians above the horizon
  private readonly camDist = 9;

  private walkPhase = 0;
  private legL!: Mesh;
  private legR!: Mesh;
  private armL!: Mesh;
  private armR!: Mesh;

  constructor(private camera: PerspectiveCamera) {
    this.build();
    this.group.position.copy(this.position);
  }

  private build() {
    const skin = new MeshStandardMaterial({ color: 0xf1c9a5, roughness: 0.65 });
    const jacket = new MeshStandardMaterial({ color: 0x1f8f63, roughness: 0.55, metalness: 0.15, emissive: 0x0a3a28, emissiveIntensity: 0.5 });
    const jacketDark = new MeshStandardMaterial({ color: 0x166b4a, roughness: 0.6 });
    const pants = new MeshStandardMaterial({ color: 0x2a3a52, roughness: 0.8 });
    const boots = new MeshStandardMaterial({ color: 0x1a222e, roughness: 0.9 });
    const hair = new MeshStandardMaterial({ color: 0x22160e, roughness: 0.95 });
    const scarf = new MeshStandardMaterial({ color: 0xffb020, roughness: 0.7, emissive: 0x3a2600, emissiveIntensity: 0.4 });

    // torso (tapered, jacket)
    const torso = new Mesh(new CapsuleGeometry(0.42, 0.75, 8, 16), jacket);
    torso.position.y = 1.55; torso.scale.set(1, 1, 0.8); torso.castShadow = true;

    // scarf
    const scarfM = new Mesh(new CylinderGeometry(0.4, 0.4, 0.22, 16), scarf);
    scarfM.position.y = 2.02; scarfM.castShadow = true;

    // backpack (explorer vibe)
    const pack = new Mesh(new BoxGeometry(0.6, 0.8, 0.35), jacketDark);
    pack.position.set(0, 1.55, -0.4); pack.castShadow = true;

    // head + hair
    const head = new Mesh(new SphereGeometry(0.4, 24, 18), skin);
    head.position.y = 2.5; head.scale.set(1, 1.08, 0.95); head.castShadow = true;
    const hairMesh = new Mesh(new SphereGeometry(0.43, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6), hair);
    hairMesh.position.y = 2.56;
    const nose = new Mesh(new SphereGeometry(0.06, 8, 8), skin); nose.position.set(0, 2.46, 0.38);

    const mkLimb = (mat: MeshStandardMaterial, r: number, len: number) => {
      const m = new Mesh(new CapsuleGeometry(r, len, 6, 12), mat);
      m.castShadow = true; return m;
    };
    this.armL = mkLimb(jacket, 0.14, 0.62); this.armL.position.set(-0.56, 1.62, 0);
    this.armR = mkLimb(jacket, 0.14, 0.62); this.armR.position.set(0.56, 1.62, 0);
    // hands
    const handL = new Mesh(new SphereGeometry(0.13, 10, 8), skin); handL.position.y = -0.45; this.armL.add(handL);
    const handR = new Mesh(new SphereGeometry(0.13, 10, 8), skin); handR.position.y = -0.45; this.armR.add(handR);

    this.legL = mkLimb(pants, 0.17, 0.6); this.legL.position.set(-0.2, 0.62, 0);
    this.legR = mkLimb(pants, 0.17, 0.6); this.legR.position.set(0.2, 0.62, 0);
    const bootL = new Mesh(new BoxGeometry(0.34, 0.2, 0.5), boots); bootL.position.set(0, -0.42, 0.1); this.legL.add(bootL);
    const bootR = new Mesh(new BoxGeometry(0.34, 0.2, 0.5), boots); bootR.position.set(0, -0.42, 0.1); this.legR.add(bootR);

    this.group.add(torso, scarfM, pack, head, hairMesh, nose, this.armL, this.armR, this.legL, this.legR);

    // soft fill light that travels with the player, so they stay readable
    // even in the dark worlds (night city, lab). Small range, won't flood the scene.
    const fill = new PointLight(0xfff0dd, 6, 9, 2);
    fill.position.set(0, 3.2, 0);
    this.group.add(fill);
  }

  /** world-space position (for proximity checks) */
  get worldPos(): Vector3 { return this.position; }

  /** place the player at a world's spawn point and reset motion */
  respawn(spawn: Vector3) {
    this.position.copy(spawn);
    this.velocity.set(0, 0, 0);
    this.group.position.copy(this.position);
    this.facing = Math.PI; // face away from camera (into the scene)
    this.group.rotation.y = this.facing;
  }

  update(dt: number, input: Input, bounds: { minX: number; maxX: number; minZ: number; maxZ: number }) {
    // ----- camera orbit from pointer drag -----
    const look = input.consumeLook();
    this.camYaw -= look.x * 0.005;
    this.camPitch = MathUtils.clamp(this.camPitch + look.y * 0.004, 0.15, 1.1);

    // ----- camera-relative movement -----
    const m = input.move; // m.x = strafe (right+), m.y = forward (up/forward = -1)
    const moving = m.lengthSq() > 0.001;
    // "forward" points from the camera toward the scene (away from the viewer)
    const forward = new Vector3(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
    const right = new Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    const wish = new Vector3()
      .addScaledVector(forward, -m.y) // up (m.y<0) -> +forward -> away from camera
      .addScaledVector(right, m.x);
    if (wish.lengthSq() > 0) wish.normalize();

    const target = wish.multiplyScalar(this.speed);
    this.velocity.x = MathUtils.damp(this.velocity.x, target.x, this.accel, dt);
    this.velocity.z = MathUtils.damp(this.velocity.z, target.z, this.accel, dt);

    this.position.addScaledVector(this.velocity, dt);
    this.position.x = MathUtils.clamp(this.position.x, bounds.minX, bounds.maxX);
    this.position.z = MathUtils.clamp(this.position.z, bounds.minZ, bounds.maxZ);
    this.group.position.copy(this.position);

    // face the direction of travel
    if (moving && this.velocity.lengthSq() > 0.5) {
      this.facing = Math.atan2(this.velocity.x, this.velocity.z);
    }
    this.group.rotation.y = MathUtils.damp(this.group.rotation.y, this.facing, 8, dt);

    // ----- walk cycle -----
    if (moving) {
      this.walkPhase += dt * 10;
      const s = Math.sin(this.walkPhase) * 0.5;
      this.legL.rotation.x = s; this.legR.rotation.x = -s;
      this.armL.rotation.x = -s; this.armR.rotation.x = s;
    } else {
      this.walkPhase = 0;
      for (const l of [this.legL, this.legR, this.armL, this.armR]) l.rotation.x = MathUtils.damp(l.rotation.x, 0, 8, dt);
    }

    this.updateCamera(dt);
  }

  private updateCamera(dt: number) {
    const offset = new Vector3(
      Math.sin(this.camYaw) * Math.cos(this.camPitch),
      Math.sin(this.camPitch),
      Math.cos(this.camYaw) * Math.cos(this.camPitch),
    ).multiplyScalar(this.camDist);

    const desired = this.position.clone().add(offset).add(new Vector3(0, 1.5, 0));
    this.camera.position.x = MathUtils.damp(this.camera.position.x, desired.x, 6, dt);
    this.camera.position.y = MathUtils.damp(this.camera.position.y, desired.y, 6, dt);
    this.camera.position.z = MathUtils.damp(this.camera.position.z, desired.z, 6, dt);
    this.camera.lookAt(this.position.x, this.position.y + 1.6, this.position.z);
  }

  /** screen-space position of the head, for placing the interaction prompt */
  headScreenPosition(camera: PerspectiveCamera, w: number, h: number): Vector2 {
    const v = this.position.clone().add(new Vector3(0, 3, 0)).project(camera);
    return new Vector2((v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h);
  }
}
