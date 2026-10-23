// Hero 3D : l'atelier de Jean Levi Aka. En scrollant, la caméra s'approche
// de l'écran, le traverse et s'envole dans « le monde de la création ».
import * as THREE from 'three';
import { createCharacter, applyPose } from './character.js';

const SCREEN_BG = '#0c0e1a';
const RED = 0xff1a1a;
const BLUE = 0x1d3bff;

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const range = (p, a, b) => clamp01((p - a) / (b - a));

// ---------- Textures générées ----------
function brickTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#16171f';
  g.fillRect(0, 0, 512, 512);
  const bw = 128, bh = 48;
  for (let row = 0; row < 512 / bh + 1; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let x = -bw; x < 512 + bw; x += bw) {
      const shade = 22 + Math.floor(Math.random() * 10);
      g.fillStyle = `rgb(${shade + 4},${shade},${shade + 8})`;
      g.fillRect(x + off + 3, row * bh + 3, bw - 6, bh - 6);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function keyboardTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#1b1c22';
  g.fillRect(0, 0, 512, 160);
  g.fillStyle = '#2b2d36';
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 15; k++) {
      const w = r === 4 && k === 6 ? 150 : 28;
      if (r === 4 && k > 6 && k < 11) continue;
      g.fillRect(12 + k * 33, 12 + r * 29, w, 24);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- Écran : interface d'un logiciel de création ----------
class ScreenUI {
  constructor(images) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.g = this.canvas.getContext('2d');
    this.images = images;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
  }

  draw(time) {
    const { g } = this;
    const W = 1280, H = 720;
    g.fillStyle = SCREEN_BG;
    g.fillRect(0, 0, W, H);
    // barre du haut
    g.fillStyle = '#151827';
    g.fillRect(0, 0, W, 40);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      g.fillStyle = c; g.beginPath(); g.arc(22 + i * 20, 20, 6, 0, Math.PI * 2); g.fill();
    });
    g.fillStyle = '#8f95b2';
    g.font = '600 15px Manrope, sans-serif';
    g.fillText("REMP'ART Studio — affiche-campagne.lajx", 90, 25);
    g.fillStyle = '#ff1a1a';
    g.fillRect(W - 120, 10, 100, 20);
    g.fillStyle = '#fff';
    g.font = '800 12px Manrope, sans-serif';
    g.fillText('EXPORTER', W - 102, 25);

    // barre d'outils
    g.fillStyle = '#121524';
    g.fillRect(0, 40, 64, H - 40);
    for (let i = 0; i < 9; i++) {
      g.strokeStyle = i === 2 ? '#ff1a1a' : '#5b6185';
      g.lineWidth = 2;
      g.strokeRect(20, 64 + i * 52, 24, 24);
      if (i === 2) { g.fillStyle = 'rgba(255,26,26,.15)'; g.fillRect(12, 56 + i * 52, 40, 40); }
    }

    // panneau calques
    g.fillStyle = '#121524';
    g.fillRect(W - 250, 40, 250, H - 40);
    g.fillStyle = '#8f95b2';
    g.font = '700 13px Manrope, sans-serif';
    g.fillText('CALQUES', W - 228, 74);
    const layers = ['Titre', 'Plume — tracé', 'Logo LAJ', 'Visuel principal', 'Dégradé', 'Fond'];
    layers.forEach((name, i) => {
      const y = 92 + i * 46;
      const active = i === Math.floor(time / 1.4) % layers.length;
      g.fillStyle = active ? '#1d2140' : '#161a2c';
      g.fillRect(W - 236, y, 222, 38);
      if (active) { g.fillStyle = '#ff1a1a'; g.fillRect(W - 236, y, 4, 38); }
      g.fillStyle = active ? '#ffffff' : '#a8adc6';
      g.font = '600 14px Manrope, sans-serif';
      g.fillText(name, W - 220, y + 24);
    });
    // nuancier
    ['#000000', '#ff1a1a', '#051684', '#ffffff', '#f2c14e'].forEach((c, i) => {
      g.fillStyle = c; g.fillRect(W - 228 + i * 42, H - 90, 32, 32);
    });

    // plan de travail
    g.fillStyle = '#1a1e33';
    g.fillRect(64, 40, W - 314, H - 40);
    const img = this.images[Math.floor(time / 3) % this.images.length];
    const ah = H - 120, aw = ah * 0.74;
    const ax = 64 + (W - 314 - aw) / 2, ay = 80;
    g.fillStyle = '#fff';
    g.fillRect(ax, ay, aw, ah);
    if (img && img.complete && img.naturalWidth) {
      const s = Math.max(aw / img.naturalWidth, ah / img.naturalHeight);
      const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
      g.save();
      g.beginPath(); g.rect(ax, ay, aw, ah); g.clip();
      g.drawImage(img, ax + (aw - iw) / 2, ay + (ah - ih) / 2, iw, ih);
      g.restore();
    }
    // tracé à la plume, qui se dessine en boucle
    const t = (time % 3) / 3;
    const pts = [
      [ax - 40, ay + ah * 0.78], [ax + aw * 0.3, ay + ah * 0.35],
      [ax + aw * 0.7, ay + ah * 1.05], [ax + aw + 40, ay + ah * 0.25],
    ];
    g.save();
    g.strokeStyle = '#ff1a1a';
    g.lineWidth = 4;
    g.setLineDash([2000]);
    g.lineDashOffset = 2000 * (1 - smooth(Math.min(1, t * 1.4)));
    g.beginPath();
    g.moveTo(...pts[0]);
    g.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]);
    g.stroke();
    g.restore();
    g.fillStyle = '#fff';
    g.strokeStyle = '#ff1a1a';
    g.lineWidth = 2;
    for (const [x, y] of [pts[0], pts[3]]) { g.fillRect(x - 6, y - 6, 12, 12); g.strokeRect(x - 6, y - 6, 12, 12); }
    g.strokeStyle = 'rgba(255,26,26,.6)';
    g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.moveTo(...pts[3]); g.lineTo(...pts[2]); g.stroke();
    for (const [x, y] of [pts[1], pts[2]]) { g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fillStyle = '#ff1a1a'; g.fill(); }
    // cadre de sélection
    g.strokeStyle = '#3d7bff';
    g.lineWidth = 1.5;
    g.strokeRect(ax - 2, ay - 2, aw + 4, ah + 4);
    // curseur
    const cx = ax + aw * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(time * 0.9)));
    const cy = ay + ah * (0.4 + 0.25 * Math.sin(time * 1.3));
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(cx, cy); g.lineTo(cx, cy + 26); g.lineTo(cx + 7, cy + 19); g.lineTo(cx + 18, cy + 19); g.closePath();
    g.fill();
    g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke();

    this.texture.needsUpdate = true;
  }
}

// ---------- Construction de l'atelier ----------
function buildStudio(scene, textures, screenUI, lowPower) {
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x15161d, roughness: 0.7 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa0ad, roughness: 0.3, metalness: 0.8 });
  const blackGloss = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.25, metalness: 0.4 });

  // sol & mur de briques
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x0d0e14, roughness: 0.85 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const bricks = brickTexture();
  bricks.repeat.set(6, 3);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 5),
    new THREE.MeshStandardMaterial({ map: bricks, roughness: 0.95 }),
  );
  wall.position.set(0, 2.5, -1.3);
  wall.receiveShadow = true;
  scene.add(wall);

  // affiches encadrées au mur
  const frames = [
    { x: -1.55, y: 1.85, h: 0.9, tex: textures[0] },
    { x: -0.62, y: 2.05, h: 0.7, tex: textures[2] },
    { x: 1.2, y: 1.9, h: 0.95, tex: textures[4] },
    { x: 2.15, y: 2.0, h: 0.72, tex: textures[1] },
  ];
  for (const f of frames) {
    if (!f.tex) continue;
    const w = f.h * f.tex.userData.ratio;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, f.h + 0.06, 0.03), blackGloss);
    frame.position.set(f.x, f.y, -1.27);
    scene.add(frame);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w, f.h), new THREE.MeshStandardMaterial({ map: f.tex, roughness: 0.5 }));
    art.position.set(f.x, f.y, -1.25);
    scene.add(art);
  }
  // néon discret « REMP'ART » remplacé par une barre rouge (rappel du logo)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: RED }));
  bar.position.set(0.25, 2.75, -1.27);
  scene.add(bar);

  // bureau
  const desk = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.8), new THREE.MeshStandardMaterial({ color: 0x1c1d24, roughness: 0.45 }));
  top.position.y = 0.74;
  top.castShadow = top.receiveShadow = true;
  desk.add(top);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: RED }));
  edge.position.set(0, 0.72, 0.4);
  desk.add(edge);
  for (const [x, z] of [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), metal);
    leg.position.set(x, 0.36, z);
    desk.add(leg);
  }
  desk.position.set(0, 0, -0.35);
  scene.add(desk);

  // écran
  const monitor = new THREE.Group();
  const SW = 0.84, SH = SW * 9 / 16;
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(SW + 0.04, SH + 0.04, 0.03), blackGloss);
  monitor.add(bezel);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: screenUI.texture, toneMapped: false }));
  screen.position.z = 0.0155;
  monitor.add(screen);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.03), metal);
  neck.position.set(0, -SH / 2 - 0.1, -0.03);
  monitor.add(neck);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.2), metal);
  base.position.set(0, -SH / 2 - 0.225, 0.0);
  monitor.add(base);
  const screenY = 0.765 + 0.231 + SH / 2;
  monitor.position.set(0, screenY, -0.5);
  scene.add(monitor);

  // clavier, souris, tasse, tablette
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.015, 0.14), new THREE.MeshStandardMaterial({ map: keyboardTexture(), roughness: 0.6 }));
  kb.position.set(-0.08, 0.773, -0.18);
  kb.castShadow = true;
  scene.add(kb);
  const mouse = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.04, 4, 10), blackGloss);
  mouse.rotation.x = Math.PI / 2;
  mouse.scale.y = 0.6;
  mouse.position.set(0.25, 0.78, -0.17);
  scene.add(mouse);
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.01, 0.2), blackGloss);
  tablet.position.set(0.55, 0.772, -0.2);
  tablet.rotation.y = -0.2;
  scene.add(tablet);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.16, 8), new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4 }));
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.5;
  pen.position.set(0.55, 0.786, -0.2);
  scene.add(pen);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 18), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4 }));
  mug.position.set(-0.62, 0.815, -0.25);
  scene.add(mug);

  // lampe d'architecte
  const lamp = new THREE.Group();
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 20), blackGloss);
  lamp.add(lampBase);
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 8), metal);
  arm1.position.set(0.05, 0.21, 0); arm1.rotation.z = -0.25;
  lamp.add(arm1);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8), metal);
  arm2.position.set(0.22, 0.48, 0); arm2.rotation.z = 1.1;
  lamp.add(arm2);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 20, 1, true), new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4, side: THREE.DoubleSide }));
  shade.position.set(0.37, 0.52, 0); shade.rotation.z = 0.5;
  lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff1d0 }));
  bulb.position.set(0.39, 0.48, 0);
  lamp.add(bulb);
  lamp.position.set(0.82, 0.765, -0.62);
  lamp.rotation.y = Math.PI - 0.15;
  scene.add(lamp);

  // plante
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.28, 18), new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.8 }));
  pot.position.set(1.35, 0.14, -0.6);
  scene.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f4d36, roughness: 0.7 });
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.6 + Math.random() * 0.4, 6), leafMat);
    const a = (i / 9) * Math.PI * 2;
    leaf.position.set(1.35 + Math.cos(a) * 0.05, 0.55, -0.6 + Math.sin(a) * 0.05);
    leaf.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4);
    scene.add(leaf);
  }

  // chaise
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.48), darkMat);
  seat.position.y = 0.47;
  chair.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.6, 0.06), darkMat);
  back.position.set(0, 0.85, 0.24);
  back.rotation.x = -0.1;
  chair.add(back);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 10), metal);
  post.position.y = 0.24;
  chair.add(post);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.025, 0.04), metal);
    spoke.position.set(Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15);
    spoke.rotation.y = -a;
    chair.add(spoke);
  }
  chair.position.set(-0.32, 0, 0.32);
  chair.rotation.y = 0.15;
  scene.add(chair);

  // le créateur, assis, de dos
  const person = createCharacter({ jacketOn: false, shirt: 0xf2f2f0, tie: 0x0b1435 });
  applyPose(person, {
    hipsY: 0.57,
    spine: [0.16, 0, 0], chest: [0.06, 0, 0], neck: [-0.1, 0, 0], head: [-0.05, -0.18, 0],
    shoulderL: [-0.55, 0, 0.15], elbowL: [-1.05, 0.25, 0], wristL: [0.2, 0, 0],
    shoulderR: [-0.6, 0, -0.12], elbowR: [-1.0, -0.2, 0], wristR: [0.2, 0, 0],
    hipL: [-1.5, 0, 0.08], kneeL: [1.45, 0, 0], ankleL: [0.1, 0, 0],
    hipR: [-1.5, 0, -0.08], kneeR: [1.5, 0, 0], ankleR: [0.1, 0, 0],
  });
  person.root.position.set(-0.32, 0, 0.3);
  person.root.rotation.y = Math.PI + 0.15;
  scene.add(person.root);

  // lumières
  scene.add(new THREE.HemisphereLight(0x8090c0, 0x0a0a10, 0.55));
  const screenLight = new THREE.PointLight(0xbcd0ff, 2.2, 3.2, 1.6);
  screenLight.position.set(0, screenY, -0.2);
  scene.add(screenLight);
  const lampLight = new THREE.SpotLight(0xffd9a8, 9, 3, 0.75, 0.6, 1.5);
  lampLight.position.set(0.45, 1.22, -0.6);
  lampLight.target.position.set(0.1, 0.76, -0.15);
  scene.add(lampLight, lampLight.target);
  const rim = new THREE.DirectionalLight(RED, 2.4);
  rim.position.set(-3, 2.5, -1);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(BLUE, 1.6);
  fill.position.set(3, 2, 2);
  scene.add(fill);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(1.5, 3.5, 3);
  if (!lowPower) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2; key.shadow.camera.right = 2;
    key.shadow.camera.top = 2; key.shadow.camera.bottom = -1;
    key.shadow.bias = -0.0005;
    floor.receiveShadow = true;
  }
  scene.add(key);

  return { person, screenY, screenZ: monitor.position.z + 0.0155, screenSize: [SW, SH] };
}

// ---------- Le monde de la création ----------
function buildWorld(scene, textures, lowPower) {
  scene.background = new THREE.Color(SCREEN_BG);
  scene.fog = new THREE.Fog(SCREEN_BG, 4, 17);
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const red = new THREE.PointLight(RED, 30, 12, 1.5);
  scene.add(red);
  const blue = new THREE.PointLight(BLUE, 30, 12, 1.5);
  scene.add(blue);

  const posters = [];
  const count = lowPower ? 14 : 22;
  for (let i = 0; i < count; i++) {
    const tex = textures[i % textures.length];
    const aspect = tex.userData.ratio;
    const h = 1.25 + (i % 3) * 0.15;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(h * aspect, h),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, fog: true }),
    );
    const a = i * 2.35;
    const r = 1.55 + (i % 2) * 0.45;
    m.position.set(Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.75, -2.2 - i * 1.25);
    m.rotation.set((Math.random() - 0.5) * 0.3, -Math.cos(a) * 0.45, (Math.random() - 0.5) * 0.25);
    m.userData.spin = (Math.random() - 0.5) * 0.25;
    scene.add(m);
    posters.push(m);
  }

  // le tracé de plume rouge qui serpente dans le tunnel
  const curvePts = [];
  for (let i = 0; i <= 40; i++) {
    const z = 1 - i * 0.8;
    curvePts.push(new THREE.Vector3(Math.sin(i * 0.55) * 1.1, Math.cos(i * 0.42) * 0.7 - 0.2, z));
  }
  const curve = new THREE.CatmullRomCurve3(curvePts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.012, 8), new THREE.MeshBasicMaterial({ color: RED }));
  scene.add(tube);
  const anchorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 2; i < 40; i += 3) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), anchorMat);
    a.position.copy(curvePts[i]);
    scene.add(a);
  }

  // formes : anneaux, briques, plumes
  const shapes = [];
  const shapeMats = [
    new THREE.MeshStandardMaterial({ color: RED, roughness: 0.3, metalness: 0.2 }),
    new THREE.MeshStandardMaterial({ color: 0x0a1aa8, roughness: 0.35, metalness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  ];
  const geos = [
    new THREE.TorusGeometry(0.22, 0.05, 12, 40),
    new THREE.BoxGeometry(0.36, 0.16, 0.16),
    new THREE.ConeGeometry(0.12, 0.34, 4),
    new THREE.OctahedronGeometry(0.18),
  ];
  for (let i = 0; i < (lowPower ? 18 : 34); i++) {
    const m = new THREE.Mesh(geos[i % geos.length], shapeMats[i % shapeMats.length]);
    const a = Math.random() * Math.PI * 2;
    const r = 0.9 + Math.random() * 2.6;
    m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.7, -1 - Math.random() * 30);
    m.userData.rot = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.8);
    scene.add(m);
    shapes.push(m);
  }

  // poussière d'étoiles
  const n = lowPower ? 500 : 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = 2 - Math.random() * 36;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.8 }));
  scene.add(points);

  return { posters, shapes, red, blue, depth: 2.2 + count * 1.25 };
}

// ---------- API ----------
// items : [{ src, ratio }] (ratio = largeur / hauteur)
export function createHero(canvas, items) {
  const lowPower = window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const loader = new THREE.TextureLoader();
  const htmlImages = [];
  const textures = items.map(({ src, ratio }) => {
    const t = loader.load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.userData.ratio = ratio;
    const im = new Image();
    im.src = src;
    htmlImages.push(im);
    return t;
  });
  const screenUI = new ScreenUI(htmlImages);

  const studioScene = new THREE.Scene();
  studioScene.background = new THREE.Color(0x07080d);
  studioScene.fog = new THREE.Fog(0x07080d, 5, 11);
  const studio = buildStudio(studioScene, textures, screenUI, lowPower);
  const worldScene = new THREE.Scene();
  const world = buildWorld(worldScene, textures, lowPower);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 60);
  const look = new THREE.Vector3();
  let progress = 0;
  let mouseX = 0, mouseY = 0;
  let running = false, raf = 0;
  const clock = new THREE.Clock();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // Trajectoire de la caméra dans l'atelier (0 → 1 = jusqu'à l'écran)
  function studioCamera(t, time) {
    const sy = studio.screenY, sz = studio.screenZ;
    const portrait = camera.aspect < 1;
    // distance où l'écran remplit exactement la vue
    const fovR = THREE.MathUtils.degToRad(camera.fov / 2);
    const fill = Math.max(studio.screenSize[1] / 2, studio.screenSize[0] / 2 / camera.aspect) / Math.tan(fovR);
    const keys = [
      { p: new THREE.Vector3(portrait ? 2.4 : 2.0, 1.75, portrait ? 3.9 : 2.9), l: new THREE.Vector3(portrait ? -0.1 : -0.85, 1.0, -0.4) },
      { p: new THREE.Vector3(0.75, 1.45, 1.1), l: new THREE.Vector3(-0.05, sy - 0.02, sz) },
      { p: new THREE.Vector3(0.05, sy + 0.02, sz + fill * 1.4), l: new THREE.Vector3(0, sy, sz) },
      { p: new THREE.Vector3(0, sy, sz + 0.02), l: new THREE.Vector3(0, sy, sz - 1) },
    ];
    const seg = t < 0.45 ? 0 : t < 0.8 ? 1 : 2;
    const bounds = [0, 0.45, 0.8, 1];
    const lt = smooth(range(t, bounds[seg], bounds[seg + 1]));
    const a = keys[seg], b = keys[seg + 1];
    camera.position.lerpVectors(a.p, b.p, lt);
    look.lerpVectors(a.l, b.l, lt);
    // petit flottement + parallaxe souris au début
    const sway = 1 - t;
    camera.position.x += (Math.sin(time * 0.4) * 0.03 + mouseX * 0.12) * sway;
    camera.position.y += (Math.cos(time * 0.5) * 0.02 - mouseY * 0.06) * sway;
    camera.lookAt(look);
  }

  function worldCamera(t, time) {
    const z = 1.2 - t * (world.depth - 3);
    camera.position.set(Math.sin(t * 3) * 0.35 + mouseX * 0.25, Math.cos(t * 2.4) * 0.2 - mouseY * 0.15, z);
    camera.lookAt(Math.sin(t * 3 + 0.4) * 0.2, 0, z - 3);
    camera.rotateZ(Math.sin(t * 4) * 0.06 + Math.sin(time * 0.3) * 0.02);
  }

  const SPLIT = 0.56;
  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const time = clock.getElapsedTime();
    if (progress < SPLIT) {
      // frappe au clavier
      const p = studio.person;
      p.wristL.rotation.x = 0.2 + Math.max(0, Math.sin(time * 14)) * 0.18;
      p.wristR.rotation.x = 0.2 + Math.max(0, Math.sin(time * 12 + 1.7)) * 0.18;
      p.elbowR.rotation.y = -0.2 + Math.sin(time * 1.3) * 0.06;
      p.head.rotation.y = -0.18 + Math.sin(time * 0.6) * 0.06;
      p.spine.rotation.x = 0.16 + Math.sin(time * 1.6) * 0.008;
      screenUI.draw(time);
      studioCamera(progress / SPLIT, time);
      renderer.render(studioScene, camera);
    } else {
      const t = (progress - SPLIT) / (1 - SPLIT);
      for (const m of world.shapes) {
        m.rotation.x += m.userData.rot.x * 0.01;
        m.rotation.y += m.userData.rot.y * 0.01;
      }
      for (const m of world.posters) m.rotation.z += m.userData.spin * 0.002;
      worldCamera(t, time);
      world.red.position.set(-1.5, 1, camera.position.z - 3);
      world.blue.position.set(1.5, -1, camera.position.z - 5);
      renderer.render(worldScene, camera);
    }
  }

  return {
    setProgress(p) { progress = clamp01(p); },
    start() {
      if (running) return;
      running = true;
      resize();
      frame();
    },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize,
    SPLIT,
  };
}
