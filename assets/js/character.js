// Personnage 3D stylisé (style « figurine ») construit à partir de primitives,
// avec un squelette simple de groupes articulés que l'on peut poser.
import * as THREE from 'three';

const DEFAULT_LOOK = {
  skin: 0x6b4430,
  hair: 0x141012,
  jacket: 0x0f1b3d,
  shirt: 0xf4f4f2,
  tie: 0x0a1230,
  pants: 0x111a33,
  shoes: 0x0b0b0d,
  jacketOn: true,
};

function mat(color, roughness = 0.6, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function capsule(radius, length, material, segs = 12) {
  const g = new THREE.CapsuleGeometry(radius, length, 6, segs);
  g.translate(0, -length / 2, 0);
  const m = new THREE.Mesh(g, material);
  m.castShadow = true;
  return m;
}

// Membre effilé : cylindre plus large en haut, avec une rotule à chaque extrémité.
function taperedLimb(rTop, rBottom, length, material) {
  const group = new THREE.Group();
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, length, 14), material);
  cyl.position.y = -length / 2;
  const top = new THREE.Mesh(new THREE.SphereGeometry(rTop, 14, 10), material);
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(rBottom, 14, 10), material);
  bottom.position.y = -length;
  for (const m of [cyl, top, bottom]) { m.castShadow = true; group.add(m); }
  return group;
}

function joint(name, x = 0, y = 0, z = 0, order = 'XYZ') {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  g.rotation.order = order;
  return g;
}

export function createCharacter(options = {}) {
  const look = { ...DEFAULT_LOOK, ...options };
  const M = {
    skin: mat(look.skin, 0.55),
    hair: mat(look.hair, 0.95),
    jacket: mat(look.jacket, 0.72),
    shirt: mat(look.shirt, 0.6),
    tie: mat(look.tie, 0.35, 0.1),
    pants: mat(look.pants, 0.75),
    shoes: mat(look.shoes, 0.3, 0.2),
    eyeWhite: mat(0xf5f1ea, 0.3),
    eye: mat(0x120c0a, 0.2),
    lips: mat(0x4a2a22, 0.5),
  };
  const torsoMat = look.jacketOn ? M.jacket : M.shirt;
  const sleeveMat = look.jacketOn ? M.jacket : M.shirt;

  const root = new THREE.Group();
  root.name = 'character';

  // ---------- Bassin & jambes ----------
  const hips = joint('hips', 0, 0.98, 0);
  root.add(hips);
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), M.pants);
  pelvis.scale.set(1.05, 0.62, 0.72);
  pelvis.castShadow = true;
  hips.add(pelvis);
  if (look.jacketOn) {
    // pan de veste qui recouvre le haut du bassin
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.185, 0.16, 24, 1, true), M.jacket);
    skirt.scale.z = 0.72;
    skirt.position.y = 0.0;
    skirt.material = skirt.material.clone();
    skirt.material.side = THREE.DoubleSide;
    hips.add(skirt);
  }

  const legs = {};
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? 1 : -1;
    const hip = joint('hip' + side, 0.09 * s, -0.03, 0);
    const thigh = taperedLimb(0.078, 0.06, 0.44, M.pants);
    hip.add(thigh);
    const knee = joint('knee' + side, 0, -0.44, 0);
    hip.add(knee);
    const shin = taperedLimb(0.06, 0.048, 0.42, M.pants);
    knee.add(shin);
    const ankle = joint('ankle' + side, 0, -0.43, 0);
    knee.add(ankle);
    const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.14, 6, 12), M.shoes);
    shoe.rotation.x = Math.PI / 2;
    shoe.scale.set(1, 1, 0.75);
    shoe.position.set(0, -0.03, 0.05);
    shoe.castShadow = true;
    ankle.add(shoe);
    hips.add(hip);
    legs[side] = { hip, knee, ankle };
  }

  // ---------- Torse ----------
  const spine = joint('spine', 0, 0.04, 0);
  hips.add(spine);
  const torsoProfile = [
    [0.0, 0.0], [0.165, 0.0], [0.165, 0.06], [0.158, 0.16], [0.172, 0.3],
    [0.19, 0.42], [0.185, 0.5], [0.15, 0.56], [0.07, 0.6], [0.0, 0.6],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 28), torsoMat);
  torso.scale.z = 0.66;
  torso.castShadow = true;
  spine.add(torso);

  // Plastron : chemise en V, cravate, revers (seulement avec la veste)
  const front = new THREE.Group();
  front.position.set(0, 0, 0.0);
  spine.add(front);
  const zFront = (y) => {
    // profondeur approximative de la surface avant du torse à la hauteur y
    const pts = torsoProfile;
    for (let i = 1; i < pts.length; i++) {
      if (y <= pts[i].y) {
        const a = pts[i - 1], b = pts[i];
        const t = (y - a.y) / Math.max(1e-6, b.y - a.y);
        return (a.x + (b.x - a.x) * t) * 0.66;
      }
    }
    return 0;
  };
  if (look.jacketOn) {
    const vShape = new THREE.Shape();
    vShape.moveTo(-0.078, 0.13);
    vShape.lineTo(0.078, 0.13);
    vShape.lineTo(0.0, -0.13);
    vShape.closePath();
    const shirtV = new THREE.Mesh(new THREE.ShapeGeometry(vShape), M.shirt);
    shirtV.position.set(0, 0.43, zFront(0.43) + 0.006);
    shirtV.rotation.x = -0.2;
    front.add(shirtV);
    for (const s of [1, -1]) {
      const lapel = new THREE.Shape();
      lapel.moveTo(0.078 * s, 0.135);
      lapel.lineTo(0.0, -0.14);
      lapel.lineTo(0.05 * s, -0.06);
      lapel.lineTo(0.105 * s, 0.05);
      lapel.closePath();
      const l = new THREE.Mesh(new THREE.ShapeGeometry(lapel), mat(0x0a1330, 0.5));
      l.material.side = THREE.DoubleSide;
      l.position.set(0, 0.43, zFront(0.43) + 0.016);
      l.rotation.set(-0.2, 0.12 * s, 0);
      front.add(l);
    }
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), mat(0x05070f, 0.3));
    btn.position.set(0, 0.24, zFront(0.24) + 0.006);
    front.add(btn);
  }
  // cravate
  const tieShape = new THREE.Shape();
  tieShape.moveTo(-0.014, 0.0);
  tieShape.lineTo(0.014, 0.0);
  tieShape.lineTo(0.026, -0.2);
  tieShape.lineTo(0.0, -0.235);
  tieShape.lineTo(-0.026, -0.2);
  tieShape.closePath();
  const tie = new THREE.Mesh(new THREE.ShapeGeometry(tieShape), M.tie);
  tie.material.side = THREE.DoubleSide;
  tie.position.set(0, 0.545, zFront(0.5) + 0.012);
  tie.rotation.x = -0.06;
  front.add(tie);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), M.tie);
  knot.scale.set(1, 1.1, 0.6);
  knot.position.set(0, 0.555, zFront(0.55) + 0.01);
  front.add(knot);

  // ---------- Cou & tête ----------
  const chest = joint('chest', 0, 0.3, 0);
  spine.add(chest);
  const neck = joint('neck', 0, 0.27, 0);
  chest.add(neck);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.1, 14), M.skin);
  neckMesh.position.y = 0.04;
  neck.add(neckMesh);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.014, 8, 20), M.shirt);
  collar.rotation.x = Math.PI / 2 - 0.25;
  collar.position.set(0, 0.01, 0.004);
  neck.add(collar);

  const head = joint('head', 0, 0.1, 0.005);
  head.scale.setScalar(1.12);
  neck.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 24), M.skin);
  skull.scale.set(0.9, 1.1, 0.98);
  skull.position.y = 0.1;
  skull.castShadow = true;
  head.add(skull);
  // mâchoire légèrement plus étroite
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 16), M.skin);
  jaw.scale.set(0.95, 0.85, 0.95);
  jaw.position.set(0, 0.045, 0.018);
  head.add(jaw);
  // cheveux courts : calotte
  const hairGeo = new THREE.SphereGeometry(0.109, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const hairMesh = new THREE.Mesh(hairGeo, M.hair);
  hairMesh.scale.set(0.9, 1.08, 0.99);
  hairMesh.position.set(0, 0.105, -0.004);
  hairMesh.rotation.x = -0.2;
  head.add(hairMesh);
  // barbe courte
  const beardGeo = new THREE.SphereGeometry(0.083, 28, 14, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.55, Math.PI * 0.4);
  const beard = new THREE.Mesh(beardGeo, M.hair);
  beard.scale.set(0.96, 0.88, 0.98);
  beard.position.set(0, 0.048, 0.02);
  head.add(beard);
  // oreilles
  for (const s of [1, -1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), M.skin);
    ear.scale.set(0.5, 1, 0.8);
    ear.position.set(0.094 * s, 0.098, -0.005);
    head.add(ear);
  }
  // yeux
  const eyes = [];
  for (const s of [1, -1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.014, 14, 10), M.eyeWhite);
    white.scale.set(1.25, 0.75, 0.6);
    white.position.set(0.034 * s, 0.112, 0.088);
    head.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 10), M.eye);
    pupil.position.set(0.034 * s, 0.112, 0.096);
    head.add(pupil);
    eyes.push(white, pupil);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.007, 0.01), M.hair);
    brow.position.set(0.035 * s, 0.135, 0.092);
    brow.rotation.z = -0.1 * s;
    head.add(brow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 10), M.skin);
  nose.scale.set(1.25, 0.9, 1);
  nose.position.set(0, 0.083, 0.101);
  head.add(nose);
  const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.026, 4, 8), M.lips);
  mouth.rotation.z = Math.PI / 2;
  mouth.position.set(0, 0.052, 0.094);
  head.add(mouth);
  const moustache = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.034, 4, 8), M.hair);
  moustache.rotation.z = Math.PI / 2;
  moustache.position.set(0, 0.064, 0.097);
  head.add(moustache);

  // ---------- Bras ----------
  const arms = {};
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? 1 : -1;
    const shoulder = joint('shoulder' + side, 0.19 * s, 0.215, -0.005, 'ZXY');
    chest.add(shoulder);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), sleeveMat);
    cap.castShadow = true;
    shoulder.add(cap);
    const upper = taperedLimb(0.058, 0.048, 0.29, sleeveMat);
    shoulder.add(upper);
    const elbow = joint('elbow' + side, 0, -0.29, 0, 'YXZ');
    shoulder.add(elbow);
    const fore = taperedLimb(0.048, 0.042, 0.25, sleeveMat);
    elbow.add(fore);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.022, 16), M.shirt);
    cuff.position.y = -0.255;
    elbow.add(cuff);
    const wrist = joint('wrist' + side, 0, -0.265, 0, 'XYZ');
    elbow.add(wrist);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 10), M.skin);
    palm.scale.set(0.62, 1.05, 0.42);
    palm.position.y = -0.04;
    palm.castShadow = true;
    wrist.add(palm);
    const thumb = capsule(0.012, 0.03, M.skin, 8);
    thumb.position.set(0.02 * s, -0.022, 0.012);
    thumb.rotation.z = 0.6 * s;
    wrist.add(thumb);
    arms[side] = { shoulder, elbow, wrist };
  }

  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  const rig = {
    root, hips, spine, chest, neck, head,
    shoulderL: arms.L.shoulder, elbowL: arms.L.elbow, wristL: arms.L.wrist,
    shoulderR: arms.R.shoulder, elbowR: arms.R.elbow, wristR: arms.R.wrist,
    hipL: legs.L.hip, kneeL: legs.L.knee, ankleL: legs.L.ankle,
    hipR: legs.R.hip, kneeR: legs.R.knee, ankleR: legs.R.ankle,
  };
  return rig;
}

// Pose = { joint: [x, y, z] } en radians, plus éventuellement hipsY.
export const JOINTS = [
  'hips', 'spine', 'chest', 'neck', 'head',
  'shoulderL', 'elbowL', 'wristL', 'shoulderR', 'elbowR', 'wristR',
  'hipL', 'kneeL', 'ankleL', 'hipR', 'kneeR', 'ankleR',
];

export function readPose(rig) {
  const p = {};
  for (const j of JOINTS) p[j] = [rig[j].rotation.x, rig[j].rotation.y, rig[j].rotation.z];
  p.hipsY = rig.hips.position.y;
  p.hipsX = rig.hips.position.x;
  return p;
}

export function applyPose(rig, pose) {
  for (const j of JOINTS) {
    const r = pose[j] || [0, 0, 0];
    rig[j].rotation.set(r[0], r[1], r[2]);
  }
  rig.hips.position.y = pose.hipsY ?? 0.98;
  rig.hips.position.x = pose.hipsX ?? 0;
}

// Interpolation linéaire entre deux poses (t de 0 à 1).
export function blendPose(a, b, t) {
  const out = {};
  for (const j of JOINTS) {
    const ra = a[j] || [0, 0, 0], rb = b[j] || [0, 0, 0];
    out[j] = [0, 1, 2].map((i) => ra[i] + (rb[i] - ra[i]) * t);
  }
  out.hipsY = (a.hipsY ?? 0.98) + ((b.hipsY ?? 0.98) - (a.hipsY ?? 0.98)) * t;
  out.hipsX = (a.hipsX ?? 0) + ((b.hipsX ?? 0) - (a.hipsX ?? 0)) * t;
  return out;
}
