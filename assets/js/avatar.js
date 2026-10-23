// Avatar 3D de Jean Levi Aka : enchaîne des postures professionnelles en boucle.
import * as THREE from 'three';
import { createCharacter, applyPose, readPose, blendPose } from './character.js';
import { POSES, POSE_LOOP } from './poses.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createAvatar(canvas, { onPose } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 0.75, 0.1, 30);
  camera.position.set(0, 1.1, 4.6);
  camera.lookAt(0, 0.98, 0);

  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x1a1420, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(1.8, 3.5, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -1.5; key.shadow.camera.right = 1.5;
  key.shadow.camera.top = 2.5; key.shadow.camera.bottom = -0.5;
  key.shadow.radius = 6;
  scene.add(key);
  const rimRed = new THREE.DirectionalLight(0xff2a2a, 3.2);
  rimRed.position.set(-3, 2, -2);
  scene.add(rimRed);
  const rimBlue = new THREE.DirectionalLight(0x3355ff, 2.6);
  rimBlue.position.set(3, 1.5, -2.5);
  scene.add(rimBlue);

  // socle
  const stage = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.8, 0.08, 64),
    new THREE.MeshStandardMaterial({ color: 0x101119, roughness: 0.4, metalness: 0.3 }),
  );
  disc.position.y = -0.04;
  disc.receiveShadow = true;
  stage.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.775, 0.008, 8, 96), new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.005;
  stage.add(ring);
  const shadowPlane = new THREE.Mesh(new THREE.CircleGeometry(0.74, 48), new THREE.ShadowMaterial({ opacity: 0.45 }));
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.001;
  shadowPlane.receiveShadow = true;
  stage.add(shadowPlane);
  scene.add(stage);

  const rig = createCharacter();
  scene.add(rig.root);

  let index = 0;
  let from = { ...POSES[POSE_LOOP[0]] };
  let to = from;
  let t0 = 0, blendDur = 1.1, hold = 3.4;
  let auto = true;
  let current = POSE_LOOP[0];
  applyPose(rig, from);

  function goTo(name, time) {
    from = readPose(rig);
    // retire les micro-mouvements avant de mémoriser
    to = POSES[name];
    current = name;
    t0 = time;
    if (onPose) onPose(name, POSES[name].label);
  }

  let mouseX = 0, mouseY = 0, dragging = false, dragX = 0, turn = 0, turnTarget = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; dragX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (dragging) { turnTarget += (e.clientX - dragX) * 0.01; dragX = e.clientX; }
  });
  canvas.addEventListener('pointerleave', () => { mouseX = 0; mouseY = 0; });

  const clock = new THREE.Clock();
  let running = false, raf = 0, lastSwitch = 0, started = false;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const time = clock.getElapsedTime();
    if (!started) { started = true; lastSwitch = time; if (onPose) onPose(current, POSES[current].label); }
    if (auto && time - lastSwitch > hold + blendDur) {
      index = (index + 1) % POSE_LOOP.length;
      lastSwitch = time;
      goTo(POSE_LOOP[index], time);
    }
    const k = ease(Math.min(1, (time - t0) / blendDur));
    const pose = blendPose(from, to, k);
    // respiration, balancement et regard qui suit la souris (ajoutés à la pose)
    const breathe = Math.sin(time * 1.8) * 0.012;
    pose.chest = [pose.chest[0] - breathe, pose.chest[1], pose.chest[2]];
    pose.spine = [pose.spine[0], pose.spine[1] + Math.sin(time * 0.5) * 0.02, pose.spine[2] + Math.sin(time * 0.7) * 0.01];
    pose.head = [pose.head[0] + mouseY * 0.12, pose.head[1] + mouseX * 0.35, pose.head[2]];
    pose.hipsY += Math.sin(time * 1.8) * 0.003;
    applyPose(rig, pose);
    turn += (turnTarget - turn) * 0.08;
    if (!dragging) turnTarget *= 0.985;
    rig.root.rotation.y = Math.sin(time * 0.35) * 0.22 + turn;
    renderer.render(scene, camera);
  }

  return {
    start() { if (running) return; running = true; resize(); clock.start(); frame(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    setPose(name) {
      if (!POSES[name]) return;
      auto = false;
      goTo(name, clock.getElapsedTime());
      clearTimeout(this._resume);
      this._resume = setTimeout(() => {
        auto = true;
        index = Math.max(0, POSE_LOOP.indexOf(name));
        lastSwitch = clock.getElapsedTime();
      }, 6000);
    },
    resize,
  };
}
