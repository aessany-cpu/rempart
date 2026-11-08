/* REMP'ART Motion — moteur : modèle de projet, rendu canvas, animations, sons, export vidéo. */
(function () {
  'use strict';
  const RM = (window.RM = window.RM || {});

  // ---------- utilitaires ----------
  RM.uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  RM.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const clamp = RM.clamp;
  const lerp = (a, b, t) => a + (b - a) * t;
  RM.round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
  RM.clone = (o) => JSON.parse(JSON.stringify(o));
  RM.ROOT = '';
  RM.url = (p) => (!p || /^(https?:|blob:|data:|\/|local:)/.test(p) ? p : RM.ROOT + p);
  RM.fmtTime = (t, fps = 30) => {
    t = Math.max(0, t);
    const m = Math.floor(t / 60), s = Math.floor(t % 60), f = Math.floor((t % 1) * fps + 1e-6);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  // ---------- catalogues ----------
  RM.FORMATS = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080], '4:5': [1080, 1350] };
  RM.FONTS = ['Archivo', 'Manrope', 'Bebas Neue', 'Anton', 'Montserrat', 'Playfair Display', 'Space Mono', 'Caveat'];

  const back = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const elastic = (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1);
  const bounce = (x) => { const n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x; if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375; return n1 * (x -= 2.625 / d1) * x + 0.984375; };
  RM.EASINGS = {
    out: { label: 'Douce (sortie)', f: (t) => 1 - Math.pow(1 - t, 3) },
    smooth: { label: 'Douce (entrée-sortie)', f: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
    expo: { label: 'Rapide puis lente', f: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) },
    back: { label: 'Rebond léger', f: back },
    elastic: { label: 'Élastique', f: elastic },
    bounce: { label: 'Rebond', f: bounce },
    in: { label: 'Accélération', f: (t) => t * t * t },
    linear: { label: 'Linéaire', f: (t) => t },
  };
  const ease = (name, t) => (RM.EASINGS[name] || RM.EASINGS.out).f(clamp(t, 0, 1));
  RM.ease = ease;

  RM.ANIMS = [
    { id: 'none', label: 'Aucune' }, { id: 'fade', label: 'Fondu' }, { id: 'slide-up', label: 'Monte' },
    { id: 'slide-down', label: 'Descend' }, { id: 'slide-left', label: 'Vers la gauche' }, { id: 'slide-right', label: 'Vers la droite' },
    { id: 'zoom', label: 'Zoom' }, { id: 'pop', label: 'Pop' }, { id: 'blur', label: 'Flou' }, { id: 'spin', label: 'Tourne' },
    { id: 'wipe', label: 'Balayage' }, { id: 'typewriter', label: 'Machine à écrire', text: true },
    { id: 'words', label: 'Mot par mot', text: true }, { id: 'letters', label: 'Lettre par lettre', text: true },
  ];
  RM.LOOPS = [
    { id: 'none', label: 'Aucun' }, { id: 'pulse', label: 'Pulsation' }, { id: 'float', label: 'Flottement' },
    { id: 'shake', label: 'Tremblement' }, { id: 'wiggle', label: 'Balancement' }, { id: 'spin', label: 'Rotation' },
    { id: 'blink', label: 'Clignotement' },
  ];
  RM.KEYABLE = ['x', 'y', 'scale', 'rotation', 'opacity'];
  RM.VISUAL = ['text', 'shape', 'image', 'video'];

  // ---------- fabrique ----------
  const base = (p) => ({ x: p.width / 2, y: p.height / 2, scale: 1, rotation: 0, opacity: 1 });
  RM.defaults = {
    text: (p) => ({ ...base(p), text: 'Votre texte', font: 'Archivo', size: Math.round(p.width * 0.06), weight: 800, color: '#ffffff',
      align: 'center', lineHeight: 1.1, letterSpacing: 0, uppercase: false, bg: '', bgPad: 24, radius: 10, shadow: false }),
    shape: (p) => ({ ...base(p), shape: 'rect', w: 400, h: 240, fill: '#ff1a1a', stroke: '', strokeWidth: 8, radius: 0 }),
    image: (p) => ({ ...base(p), src: '', w: Math.round(Math.min(p.width, p.height) * 0.5), radius: 0 }),
    video: (p) => ({ ...base(p), src: '', w: Math.round(p.width * 0.6), radius: 0, volume: 1, in: 0 }),
    audio: () => ({ src: '', volume: 1, fadeIn: 0, fadeOut: 0, in: 0, sfx: '' }),
  };
  RM.makeClip = (project, type, start, extra = {}) => {
    const c = { id: RM.uid('c'), type, start: RM.round(start || 0), duration: extra.duration || (type === 'audio' ? 1 : 3),
      props: { ...RM.defaults[type](project), ...(extra.props || {}) } };
    if (type !== 'audio') c.anim = extra.anim || { in: { type: 'fade', dur: 0.5, ease: 'out' }, out: { type: 'fade', dur: 0.4, ease: 'out' }, loop: { type: 'none', amp: 1, speed: 1 } };
    if (extra.keys) c.keys = extra.keys;
    if (extra.name) c.name = extra.name;
    return c;
  };
  RM.newProject = (name = 'Nouveau projet', format = '16:9') => {
    const [w, h] = RM.FORMATS[format];
    return { id: RM.uid('p'), name, format, width: w, height: h, fps: 30, version: 1,
      bg: { type: 'radial', c1: '#171a26', c2: '#07080d', angle: 135 },
      tracks: [{ id: RM.uid('t'), kind: 'visual', name: 'Calque 1', clips: [] }, { id: RM.uid('t'), kind: 'audio', name: 'Sons', clips: [] }],
      media: [] };
  };

  // Projet de démonstration : titre REMP'ART sonorisé avec la sonothèque.
  RM.demoProject = () => {
    const p = RM.newProject("Démo REMP'ART", '16:9');
    p.bg = { type: 'radial', c1: '#0d1a6b', c2: '#07080d', angle: 135 };
    const [v1, a1] = p.tracks;
    v1.name = 'Titres';
    const v2 = { id: RM.uid('t'), kind: 'visual', name: 'Formes', clips: [] };
    const v3 = { id: RM.uid('t'), kind: 'visual', name: 'Logo', clips: [] };
    const a2 = { id: RM.uid('t'), kind: 'audio', name: 'Sons 2', clips: [] };
    p.tracks = [v3, v1, v2, a1, a2];
    v2.clips.push(RM.makeClip(p, 'shape', 0.35, { duration: 6.4, name: 'Cercle',
      props: { shape: 'ring', w: 620, h: 620, fill: '', stroke: '#1d3bff', strokeWidth: 10 },
      anim: { in: { type: 'wipe', dur: 1.1, ease: 'smooth' }, out: { type: 'zoom', dur: 0.5, ease: 'in' }, loop: { type: 'pulse', amp: 0.6, speed: 0.8 } } }));
    v2.clips.push(RM.makeClip(p, 'shape', 1.55, { duration: 5.1, name: 'Trait rouge',
      props: { shape: 'rect', w: 520, h: 10, y: 640, fill: '#ff1a1a', radius: 5 },
      anim: { in: { type: 'wipe', dur: 0.6, ease: 'expo' }, out: { type: 'fade', dur: 0.4, ease: 'out' }, loop: { type: 'none', amp: 1, speed: 1 } } }));
    v1.clips.push(RM.makeClip(p, 'text', 0.98, { duration: 5.6, name: 'Titre',
      props: { text: "REMP'ART", size: 210, weight: 900, y: 520, letterSpacing: 4 },
      anim: { in: { type: 'pop', dur: 0.7, ease: 'back' }, out: { type: 'blur', dur: 0.5, ease: 'out' }, loop: { type: 'none', amp: 1, speed: 1 } } }));
    v1.clips.push(RM.makeClip(p, 'text', 2.2, { duration: 4.4, name: 'Slogan',
      props: { text: 'Votre vision. Notre création.', font: 'Manrope', size: 58, weight: 600, y: 720, color: '#e9e6df' },
      anim: { in: { type: 'words', dur: 1.0, ease: 'out' }, out: { type: 'fade', dur: 0.4, ease: 'out' }, loop: { type: 'none', amp: 1, speed: 1 } } }));
    v3.clips.push(RM.makeClip(p, 'image', 3.2, { duration: 3.4, name: 'Logo',
      props: { src: 'assets/img/rempart-logo-white.png', w: 220, x: 1720, y: 120 },
      anim: { in: { type: 'slide-left', dur: 0.5, ease: 'out' }, out: { type: 'fade', dur: 0.4, ease: 'out' }, loop: { type: 'float', amp: 0.5, speed: 0.6 } } }));
    const sfx = (id, file, start, dur, track = a1, extra = {}) => track.clips.push({ id: RM.uid('c'), type: 'audio', name: id, start, duration: dur,
      props: { ...RM.defaults.audio(), src: 'sfx/library/' + file, sfx: id, ...extra } });
    sfx('bips-montee-numerique-01', 'transition/bips-montee-numerique-01.mp3', 0.5, 0.49);
    sfx('impact-boom-01', 'impact/impact-boom-01.mp3', 0.91, 2.68, a2);
    sfx('whoosh-souffle-01', 'whoosh/whoosh-souffle-01.mp3', 2.03, 0.46);
    sfx('pop-01', 'ui-clic/pop-01.mp3', 3.14, 0.22);
    sfx('riser-montee-01', 'riser/riser-montee-01.mp3', 4.36, 2.14, a2, { volume: 0.8, fadeIn: 0.5 });
    sfx('glitch-saccade-01', 'glitch/glitch-saccade-01.mp3', 6.48, 0.85);
    return p;
  };

  // ---------- validation (sert aussi pour les projets renvoyés par Claude) ----------
  const num = (v, d, a = -Infinity, b = Infinity) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d);
  RM.normalize = (input) => {
    const p = typeof input === 'string' ? JSON.parse(input) : RM.clone(input || {});
    if (!RM.FORMATS[p.format]) p.format = '16:9';
    const [w, h] = RM.FORMATS[p.format];
    p.width = w; p.height = h;
    p.id = typeof p.id === 'string' && p.id ? p.id : RM.uid('p');
    p.name = String(p.name || 'Projet sans nom').slice(0, 120);
    p.fps = [24, 25, 30, 60].includes(p.fps) ? p.fps : 30;
    p.bg = Object.assign({ type: 'solid', c1: '#07080d', c2: '#171a26', angle: 135 }, p.bg || {});
    p.media = Array.isArray(p.media) ? p.media.filter((m) => m && m.src) : [];
    const seen = new Set();
    const fresh = (id, pre) => { let v = typeof id === 'string' && id ? id : RM.uid(pre); while (seen.has(v)) v = RM.uid(pre); seen.add(v); return v; };
    p.tracks = (Array.isArray(p.tracks) ? p.tracks : []).filter(Boolean).map((t) => {
      const kind = t.kind === 'audio' ? 'audio' : 'visual';
      const clips = (Array.isArray(t.clips) ? t.clips : []).filter((c) => c && (kind === 'audio' ? c.type === 'audio' : RM.VISUAL.includes(c.type)));
      return { id: fresh(t.id, 't'), kind, name: String(t.name || (kind === 'audio' ? 'Sons' : 'Calque')).slice(0, 40), hidden: !!t.hidden, muted: !!t.muted,
        clips: clips.map((c) => {
          const props = { ...RM.defaults[c.type](p), ...(c.props || {}) };
          for (const k of ['x', 'y', 'scale', 'rotation', 'opacity', 'size', 'w', 'h', 'volume']) if (k in props) props[k] = num(+props[k], RM.defaults[c.type](p)[k]);
          if ('opacity' in props) props.opacity = clamp(props.opacity, 0, 1);
          const out = { id: fresh(c.id, 'c'), type: c.type, start: RM.round(num(c.start, 0, 0, 3600)), duration: RM.round(num(c.duration, 2, 0.05, 3600)), props };
          if (c.name) out.name = String(c.name).slice(0, 60);
          if (c.type !== 'audio') {
            const a = c.anim || {};
            out.anim = { in: { type: 'none', dur: 0.5, ease: 'out', ...(a.in || {}) }, out: { type: 'none', dur: 0.4, ease: 'out', ...(a.out || {}) },
              loop: { type: 'none', amp: 1, speed: 1, ...(a.loop || {}) } };
            if (c.keys && typeof c.keys === 'object') {
              const keys = {};
              for (const k of RM.KEYABLE) if (Array.isArray(c.keys[k]) && c.keys[k].length)
                keys[k] = c.keys[k].filter((kf) => kf && isFinite(kf.t) && isFinite(kf.v)).map((kf) => ({ t: RM.round(+kf.t), v: +kf.v, e: kf.e || 'smooth' })).sort((a, b) => a.t - b.t);
              if (Object.keys(keys).length) out.keys = keys;
            }
          }
          return out;
        }) };
    });
    if (!p.tracks.some((t) => t.kind === 'visual')) p.tracks.unshift({ id: RM.uid('t'), kind: 'visual', name: 'Calque 1', hidden: false, muted: false, clips: [] });
    if (!p.tracks.some((t) => t.kind === 'audio')) p.tracks.push({ id: RM.uid('t'), kind: 'audio', name: 'Sons', hidden: false, muted: false, clips: [] });
    return p;
  };

  RM.duration = (p) => {
    let d = 0;
    for (const t of p.tracks) for (const c of t.clips) d = Math.max(d, c.start + c.duration);
    return Math.max(1, RM.round(d, 2));
  };
  RM.findClip = (p, id) => {
    for (const t of p.tracks) { const c = t.clips.find((x) => x.id === id); if (c) return { clip: c, track: t }; }
    return null;
  };

  // ---------- valeurs animées ----------
  RM.prop = (clip, name, lt) => {
    const ks = clip.keys && clip.keys[name];
    if (!ks || !ks.length) return clip.props[name];
    if (lt <= ks[0].t) return ks[0].v;
    const last = ks[ks.length - 1];
    if (lt >= last.t) return last.v;
    for (let i = 0; i < ks.length - 1; i++) {
      const a = ks[i], b = ks[i + 1];
      if (lt >= a.t && lt <= b.t) return lerp(a.v, b.v, ease(b.e || 'smooth', (lt - a.t) / Math.max(1e-6, b.t - a.t)));
    }
    return clip.props[name];
  };

  function applyPreset(s, type, e, raw, a) {
    const dist = a.dist || 140;
    switch (type) {
      case 'fade': s.alpha *= e; break;
      case 'slide-up': s.dy += (1 - e) * dist; s.alpha *= clamp(raw * 2.5, 0, 1); break;
      case 'slide-down': s.dy -= (1 - e) * dist; s.alpha *= clamp(raw * 2.5, 0, 1); break;
      case 'slide-left': s.dx += (1 - e) * dist * 1.6; s.alpha *= clamp(raw * 2.5, 0, 1); break;
      case 'slide-right': s.dx -= (1 - e) * dist * 1.6; s.alpha *= clamp(raw * 2.5, 0, 1); break;
      case 'zoom': s.scale *= lerp(0.55, 1, e); s.alpha *= e; break;
      case 'pop': s.scale *= Math.max(0, e); s.alpha *= clamp(raw * 4, 0, 1); break;
      case 'blur': s.blur += (1 - e) * 28; s.alpha *= e; s.scale *= lerp(1.08, 1, e); break;
      case 'spin': s.rot += (1 - e) * -120; s.scale *= lerp(0.4, 1, e); s.alpha *= clamp(raw * 2, 0, 1); break;
      case 'wipe': s.wipe = Math.min(s.wipe, clamp(e, 0, 1)); break;
      case 'typewriter': case 'words': case 'letters': s.reveal = Math.min(s.reveal, clamp(e, 0, 1)); s.textMode = type; break;
      default: break;
    }
  }
  RM.animState = (clip, lt) => {
    const s = { dx: 0, dy: 0, scale: 1, rot: 0, alpha: 1, blur: 0, wipe: 1, reveal: 1, textMode: null };
    const a = clip.anim; if (!a) return s;
    const D = clip.duration;
    if (a.in && a.in.type !== 'none') {
      const d = Math.min(a.in.dur || 0.5, D * 0.9); const raw = clamp(lt / Math.max(0.01, d), 0, 1);
      applyPreset(s, a.in.type, ease(a.in.ease || 'out', raw), raw, a.in);
    }
    if (a.out && a.out.type !== 'none') {
      const d = Math.min(a.out.dur || 0.4, D * 0.9); const raw = clamp((D - lt) / Math.max(0.01, d), 0, 1);
      if (raw < 1) applyPreset(s, a.out.type, ease(a.out.ease || 'out', raw), raw, a.out);
    }
    const L = a.loop;
    if (L && L.type !== 'none') {
      const amp = L.amp ?? 1, w = 2 * Math.PI * (L.speed ?? 1);
      switch (L.type) {
        case 'pulse': s.scale *= 1 + 0.06 * amp * Math.sin(w * lt); break;
        case 'float': s.dy += 16 * amp * Math.sin(w * lt); break;
        case 'shake': s.dx += 7 * amp * Math.sin(lt * 47); s.dy += 5 * amp * Math.cos(lt * 39); break;
        case 'wiggle': s.rot += 5 * amp * Math.sin(w * lt * 1.5); break;
        case 'spin': s.rot += 90 * (L.speed ?? 1) * lt; break;
        case 'blink': s.alpha *= 0.55 + 0.45 * Math.cos(w * lt * 2); break;
      }
    }
    return s;
  };

  // ---------- médias ----------
  const imgs = new Map(), vids = new Map(), urls = new Map();
  RM.onMediaReady = () => {};
  RM.localStore = {
    _db: null,
    open() {
      if (this._db) return this._db;
      this._db = new Promise((res, rej) => {
        try { const r = indexedDB.open('rm-media', 1); r.onupgradeneeded = () => r.result.createObjectStore('files');
          r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); }
      });
      return this._db;
    },
    async put(id, blob) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(blob, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
    async get(id) { const db = await this.open(); return new Promise((res, rej) => { const r = db.transaction('files').objectStore('files').get(id); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  };
  RM.resolve = async (src) => {
    if (!src) return null;
    if (!src.startsWith('local:')) return RM.url(src);
    if (urls.has(src)) return urls.get(src);
    try { const blob = await RM.localStore.get(src.slice(6)); if (!blob) return null; const u = URL.createObjectURL(blob); urls.set(src, u); return u; }
    catch (e) { return null; }
  };
  RM.getImage = (src) => {
    if (!src) return null;
    let e = imgs.get(src);
    if (!e) {
      e = { img: new Image(), ok: false, err: false }; imgs.set(src, e);
      e.img.onload = () => { e.ok = true; RM.onMediaReady(); };
      e.img.onerror = () => { e.err = true; RM.onMediaReady(); };
      RM.resolve(src).then((u) => { if (u) e.img.src = u; else e.err = true; });
    }
    return e;
  };
  RM.getVideo = (clip) => {
    let e = vids.get(clip.id);
    if (!e || e.src !== clip.props.src) {
      const v = document.createElement('video');
      v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
      e = { v, src: clip.props.src, ok: false }; vids.set(clip.id, e);
      v.addEventListener('loadeddata', () => { e.ok = true; RM.onMediaReady(); });
      v.addEventListener('seeked', () => RM.onMediaReady());
      RM.resolve(clip.props.src).then((u) => { if (u) v.src = u; });
    }
    return e;
  };
  RM.allVideos = () => vids;

  // ---------- rendu ----------
  const layoutCache = new Map();
  function fontStr(c) { return `${c.weight || 400} ${c.size}px "${c.font}", ${c.font === 'Space Mono' ? 'monospace' : 'sans-serif'}`; }
  function layoutText(ctx, c) {
    const key = [c.text, c.font, c.size, c.weight, c.letterSpacing, c.lineHeight, c.uppercase].join('|');
    let L = layoutCache.get(key);
    if (L && L.fontsReady === RM.fontsVersion) return L;
    ctx.save();
    ctx.font = fontStr(c);
    if ('letterSpacing' in ctx) ctx.letterSpacing = (c.letterSpacing || 0) + 'px';
    const text = c.uppercase ? String(c.text).toUpperCase() : String(c.text);
    const lh = c.size * (c.lineHeight || 1.1);
    const lines = text.split('\n').map((line) => {
      const chars = []; const words = [];
      for (let i = 0; i < line.length; i++) chars.push({ ch: line[i], x: ctx.measureText(line.slice(0, i)).width });
      let i = 0;
      for (const part of line.split(/(\s+)/)) { if (part && !/^\s+$/.test(part)) words.push({ text: part, x: ctx.measureText(line.slice(0, i)).width }); i += part.length; }
      return { text: line, width: ctx.measureText(line).width, chars, words };
    });
    ctx.restore();
    const W = Math.max(1, ...lines.map((l) => l.width)), H = lines.length * lh;
    L = { lines, W, H, lh, fontsReady: RM.fontsVersion, nChars: lines.reduce((a, l) => a + l.chars.length, 0), nWords: lines.reduce((a, l) => a + l.words.length, 0) };
    if (layoutCache.size > 300) layoutCache.clear();
    layoutCache.set(key, L);
    return L;
  }
  RM.fontsVersion = 0;

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  function drawBg(ctx, p) {
    const { width: W, height: H } = p, b = p.bg || {};
    if (b.type === 'linear') {
      const a = ((b.angle || 0) * Math.PI) / 180, r = Math.hypot(W, H) / 2;
      const g = ctx.createLinearGradient(W / 2 - Math.cos(a) * r, H / 2 - Math.sin(a) * r, W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r);
      g.addColorStop(0, b.c1); g.addColorStop(1, b.c2); ctx.fillStyle = g;
    } else if (b.type === 'radial') {
      const g = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H / 2, Math.hypot(W, H) * 0.6);
      g.addColorStop(0, b.c1); g.addColorStop(1, b.c2); ctx.fillStyle = g;
    } else ctx.fillStyle = b.c1 || '#000';
    ctx.fillRect(0, 0, W, H);
  }

  function drawText(ctx, c, s) {
    const L = layoutText(ctx, c);
    const pad = c.bg ? c.bgPad || 0 : 0;
    const bw = L.W + pad * 2, bh = L.H + pad * 1.2;
    if (s.wipe < 1) { ctx.beginPath(); ctx.rect(-bw / 2 - 2, -bh / 2 - c.size, bw * s.wipe + 4, bh + c.size * 2); ctx.clip(); }
    if (c.bg) { ctx.fillStyle = c.bg; roundRect(ctx, -bw / 2, -bh / 2, bw, bh, c.radius); ctx.fill(); }
    ctx.font = fontStr(c);
    if ('letterSpacing' in ctx) ctx.letterSpacing = (c.letterSpacing || 0) + 'px';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = c.color;
    if (c.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = c.size * 0.35; ctx.shadowOffsetY = c.size * 0.08; }
    const mode = s.reveal < 1 ? s.textMode : null;
    const n = mode === 'words' ? L.nWords : L.nChars, k = mode === 'typewriter' ? 0 : 3;
    let idx = 0;
    const baseAlpha = ctx.globalAlpha;
    L.lines.forEach((line, li) => {
      const y = -L.H / 2 + L.lh * (li + 0.5);
      const x0 = c.align === 'left' ? -L.W / 2 : c.align === 'right' ? L.W / 2 - line.width : -line.width / 2;
      if (!mode) { ctx.fillText(line.text, x0, y); return; }
      const units = mode === 'words' ? line.words.map((w) => ({ t: w.text, x: w.x })) : line.chars.map((ch) => ({ t: ch.ch, x: ch.x }));
      for (const u of units) {
        let up;
        if (mode === 'typewriter') up = idx < s.reveal * n ? 1 : 0;
        else up = clamp((s.reveal * (n + k) - idx) / k, 0, 1);
        idx++;
        if (up <= 0) continue;
        ctx.globalAlpha = baseAlpha * up;
        ctx.fillText(u.t, x0 + u.x, y + (1 - ease('out', up)) * c.size * 0.45);
      }
    });
    ctx.globalAlpha = baseAlpha;
    return { w: bw, h: Math.max(bh, L.H) };
  }

  function drawShape(ctx, c, s) {
    const w = c.w, h = c.h;
    ctx.lineWidth = c.strokeWidth || 0;
    if (c.shape === 'ring') {
      ctx.strokeStyle = c.stroke || c.fill || '#fff'; ctx.lineWidth = c.strokeWidth || 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.wipe); ctx.stroke();
      return { w, h };
    }
    if (s.wipe < 1) { ctx.beginPath(); ctx.rect(-w / 2 - 1, -h / 2 - 1 - ctx.lineWidth, w * s.wipe + 2, h + 2 + ctx.lineWidth * 2); ctx.clip(); }
    ctx.beginPath();
    if (c.shape === 'circle') ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (c.shape === 'triangle') { ctx.moveTo(0, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); }
    else roundRect(ctx, -w / 2, -h / 2, w, h, c.radius);
    if (c.fill) { ctx.fillStyle = c.fill; ctx.fill(); }
    if (c.stroke && c.strokeWidth) { ctx.strokeStyle = c.stroke; ctx.stroke(); }
    return { w, h };
  }

  function drawMedia(ctx, c, s, el, nw, nh, ready) {
    const w = c.w, h = nw && nh ? (w * nh) / nw : w * 0.5625;
    if (s.wipe < 1) { ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w * s.wipe, h); ctx.clip(); }
    if (c.radius) { roundRect(ctx, -w / 2, -h / 2, w, h, c.radius); ctx.clip(); }
    if (ready) ctx.drawImage(el, -w / 2, -h / 2, w, h);
    else { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(-w / 2, -h / 2, w, h); }
    return { w, h };
  }

  RM.bounds = new Map();
  RM.render = (ctx, p, t, opts = {}) => {
    const k = opts.scale || 1;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 1; ctx.filter = 'none';
    drawBg(ctx, p);
    if (!opts.export) RM.bounds.clear();
    for (let ti = p.tracks.length - 1; ti >= 0; ti--) {
      const tr = p.tracks[ti];
      if (tr.kind !== 'visual' || tr.hidden) continue;
      for (const c of tr.clips) {
        if (t < c.start || t >= c.start + c.duration) continue;
        const lt = t - c.start, s = RM.animState(c, lt), P = c.props;
        const x = RM.prop(c, 'x', lt), y = RM.prop(c, 'y', lt), sc = RM.prop(c, 'scale', lt), rot = RM.prop(c, 'rotation', lt), op = RM.prop(c, 'opacity', lt);
        const alpha = clamp(op * s.alpha, 0, 1);
        if (alpha <= 0.001 || sc * s.scale <= 0.0001) continue;
        ctx.save();
        ctx.translate(x + s.dx, y + s.dy);
        ctx.rotate(((rot + s.rot) * Math.PI) / 180);
        ctx.scale(sc * s.scale, sc * s.scale);
        ctx.globalAlpha = alpha;
        if (s.blur > 0.3) ctx.filter = `blur(${(s.blur * sc * s.scale).toFixed(1)}px)`;
        let b;
        if (c.type === 'text') b = drawText(ctx, P, s);
        else if (c.type === 'shape') b = drawShape(ctx, P, s);
        else if (c.type === 'image') { const e = RM.getImage(P.src); b = drawMedia(ctx, P, s, e && e.img, e && e.img.naturalWidth, e && e.img.naturalHeight, e && e.ok); }
        else if (c.type === 'video') { const e = RM.getVideo(c); b = drawMedia(ctx, P, s, e.v, e.v.videoWidth, e.v.videoHeight, e.ok && e.v.readyState >= 2); }
        if (!opts.export && b) {
          // repère non animé pour la sélection (position de base, sans les effets d'entrée)
          ctx.restore(); ctx.save();
          ctx.translate(x, y); ctx.rotate((rot * Math.PI) / 180); ctx.scale(sc, sc);
          RM.bounds.set(c.id, { m: ctx.getTransform(), w: b.w, h: b.h });
        }
        ctx.restore();
      }
    }
    ctx.filter = 'none';
  };

  RM.hitTest = (px, py, p) => {
    // px, py en pixels du canvas ; renvoie l'id du clip visible le plus haut sous le point
    for (const tr of p.tracks) {
      if (tr.kind !== 'visual' || tr.hidden) continue;
      for (let i = tr.clips.length - 1; i >= 0; i--) {
        const b = RM.bounds.get(tr.clips[i].id); if (!b) continue;
        const q = b.m.inverse().transformPoint(new DOMPoint(px, py));
        if (Math.abs(q.x) <= b.w / 2 + 8 && Math.abs(q.y) <= b.h / 2 + 8) return tr.clips[i].id;
      }
    }
    return null;
  };

  // ---------- polices ----------
  RM.loadFonts = async (p) => {
    if (!document.fonts) return;
    const want = new Set();
    for (const t of p.tracks) for (const c of t.clips) if (c.type === 'text') want.add(`${c.props.weight || 400} 40px "${c.props.font}"`);
    await Promise.all([...want].map((f) => document.fonts.load(f).catch(() => null)));
    RM.fontsVersion++;
  };

  // ---------- audio ----------
  const A = (RM.audio = {
    ctx: null, out: null, monitor: null, buffers: new Map(), loading: new Map(), sources: [], peaks: new Map(),
    ensure() {
      if (!this.ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        this.ctx = new C();
        this.out = this.ctx.createGain(); this.monitor = this.ctx.createGain();
        this.out.connect(this.monitor); this.monitor.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    load(src) {
      if (!src) return Promise.resolve(null);
      if (this.buffers.has(src)) return Promise.resolve(this.buffers.get(src));
      if (this.loading.has(src)) return this.loading.get(src);
      const pr = (async () => {
        const u = await RM.resolve(src); if (!u) return null;
        const r = await fetch(u); if (!r.ok) throw new Error('fichier introuvable');
        const ab = await r.arrayBuffer();
        const ctx = this.ctx || new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 48000, 48000);
        const buf = await new Promise((res, rej) => { const q = ctx.decodeAudioData(ab, res, rej); if (q && q.then) q.then(res, rej); });
        this.buffers.set(src, buf); this.peaks.set(src, computePeaks(buf)); RM.onMediaReady();
        return buf;
      })().catch(() => { this.loading.delete(src); return null; });
      this.loading.set(src, pr);
      return pr;
    },
    schedule(p, from, dest) {
      this.stopAll();
      const ctx = this.ensure(), now = ctx.currentTime + 0.06;
      for (const tr of p.tracks) {
        if (tr.kind !== 'audio' || tr.muted) continue;
        for (const c of tr.clips) {
          const end = c.start + c.duration; if (end <= from) continue;
          const buf = this.buffers.get(c.props.src); if (!buf) { this.load(c.props.src); continue; }
          const off = Math.max(0, from - c.start), when = now + Math.max(0, c.start - from);
          const startIn = (c.props.in || 0) + off, len = Math.min(c.duration - off, buf.duration - startIn);
          if (len <= 0) continue;
          const s = ctx.createBufferSource(); s.buffer = buf;
          const g = ctx.createGain(); const vol = c.props.volume ?? 1;
          const t0 = when - off; // instant (horloge audio) du début du clip
          g.gain.setValueAtTime(vol, when);
          const fi = c.props.fadeIn || 0, fo = c.props.fadeOut || 0;
          if (fi > 0 && off < fi) { g.gain.setValueAtTime(vol * (off / fi), when); g.gain.linearRampToValueAtTime(vol, t0 + fi); }
          if (fo > 0) { const fs = Math.max(when, t0 + c.duration - fo); g.gain.setValueAtTime(vol, fs); g.gain.linearRampToValueAtTime(0.0001, t0 + c.duration); }
          s.connect(g); g.connect(dest || this.out);
          s.start(when, startIn, len);
          this.sources.push(s);
        }
      }
      return now - from; // horloge audio correspondant à t = 0
    },
    stopAll() { for (const s of this.sources) { try { s.stop(); } catch (e) { /* déjà arrêté */ } } this.sources = []; },
    preview(src, onEnd) {
      this.stopPreview();
      const ctx = this.ensure();
      return this.load(src).then((buf) => {
        if (!buf) return null;
        const s = ctx.createBufferSource(); s.buffer = buf; s.connect(this.monitor); s.start();
        s.onended = () => { if (this._pv === s) this._pv = null; onEnd && onEnd(); };
        this._pv = s; return buf.duration;
      });
    },
    stopPreview() { if (this._pv) { try { this._pv.stop(); } catch (e) { /* */ } this._pv = null; } },
  });
  function computePeaks(buf) {
    const ch = buf.getChannelData(0), per = Math.max(1, Math.floor(buf.sampleRate / 100)), out = new Float32Array(Math.ceil(ch.length / per));
    for (let i = 0; i < out.length; i++) { let m = 0; for (let j = i * per, e = Math.min(ch.length, j + per); j < e; j++) { const v = Math.abs(ch[j]); if (v > m) m = v; } out[i] = m; }
    return out;
  }
  RM.wireVideo = (e, clip) => {
    if (!A.ctx || e.wired) return;
    try { const s = A.ctx.createMediaElementSource(e.v); e.gain = A.ctx.createGain(); s.connect(e.gain); e.gain.connect(A.out); e.wired = true; } catch (err) { /* */ }
    if (e.gain) e.gain.gain.value = clip.props.volume ?? 1;
  };
  RM.syncVideos = (p, t, playing) => {
    const active = new Set();
    for (const tr of p.tracks) {
      if (tr.kind !== 'visual') continue;
      for (const c of tr.clips) {
        if (c.type !== 'video') continue;
        const e = RM.getVideo(c);
        const inside = !tr.hidden && t >= c.start && t < c.start + c.duration;
        if (!inside) { if (!e.v.paused) e.v.pause(); continue; }
        active.add(c.id);
        RM.wireVideo(e, c);
        if (e.gain) e.gain.gain.value = c.props.volume ?? 1;
        const want = (c.props.in || 0) + (t - c.start);
        if (playing) {
          if (Math.abs(e.v.currentTime - want) > 0.25) e.v.currentTime = want;
          if (e.v.paused) e.v.play().catch(() => {});
        } else {
          if (!e.v.paused) e.v.pause();
          if (Math.abs(e.v.currentTime - want) > 0.04) e.v.currentTime = want;
        }
      }
    }
    return active;
  };
  RM.pauseVideos = () => { for (const e of vids.values()) if (!e.v.paused) e.v.pause(); };

  RM.preload = async (p) => {
    const jobs = [RM.loadFonts(p)];
    for (const tr of p.tracks) for (const c of tr.clips) {
      if (c.type === 'audio') jobs.push(A.load(c.props.src));
      if (c.type === 'image') { const e = RM.getImage(c.props.src); if (e && !e.ok && !e.err) jobs.push(new Promise((r) => { e.img.addEventListener('load', r, { once: true }); e.img.addEventListener('error', r, { once: true }); setTimeout(r, 8000); })); }
      if (c.type === 'video') { const e = RM.getVideo(c); if (!e.ok) jobs.push(new Promise((r) => { e.v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 8000); })); }
    }
    await Promise.all(jobs);
  };

  // ---------- export vidéo (temps réel : MediaRecorder sur le canvas + le mixage audio) ----------
  RM.pickMime = () => {
    if (!window.MediaRecorder) return null;
    const list = [['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4'], ['video/mp4', 'mp4'], ['video/webm;codecs=vp9,opus', 'webm'], ['video/webm;codecs=vp8,opus', 'webm'], ['video/webm', 'webm']];
    for (const [m, ext] of list) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext };
    return null;
  };
  RM.exportVideo = async (p, { onProgress, signal } = {}) => {
    const fmt = RM.pickMime();
    if (!fmt) throw new Error("Ce navigateur ne sait pas enregistrer de vidéo. Essayez Chrome, Edge ou Safari récent.");
    const ctxA = A.ensure();
    await RM.preload(p);
    const cv = document.createElement('canvas'); cv.width = p.width; cv.height = p.height;
    const g = cv.getContext('2d');
    RM.render(g, p, 0, { export: true });
    const dest = ctxA.createMediaStreamDestination();
    A.out.connect(dest);
    const prevMon = A.monitor.gain.value; A.monitor.gain.value = 0;
    const stream = new MediaStream([...cv.captureStream(p.fps).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: fmt.mime, videoBitsPerSecond: p.width * p.height * 4.5, audioBitsPerSecond: 192000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
    const done = new Promise((res) => (rec.onstop = res));
    const dur = RM.duration(p);
    rec.start(250);
    const zero = A.schedule(p, 0, null);
    await new Promise((resolve) => {
      const tick = () => {
        const t = ctxA.currentTime - zero;
        if (signal && signal.aborted) return resolve();
        if (t >= dur + 0.15) return resolve();
        RM.syncVideos(p, Math.max(0, t), true);
        RM.render(g, p, clamp(t, 0, dur - 0.001), { export: true });
        onProgress && onProgress(clamp(t / dur, 0, 1));
        setTimeout(tick, 1000 / p.fps / 2);
      };
      tick();
    });
    rec.stop(); A.stopAll(); RM.pauseVideos();
    await done;
    try { A.out.disconnect(dest); } catch (e) { /* */ }
    A.monitor.gain.value = prevMon;
    if (signal && signal.aborted) return null;
    return { blob: new Blob(chunks, { type: fmt.mime.split(';')[0] }), ext: fmt.ext };
  };

  RM.snapshot = (p, t, width = 1280, type = 'image/png', q) => new Promise((res) => {
    const k = width / p.width, cv = document.createElement('canvas');
    cv.width = Math.round(p.width * k); cv.height = Math.round(p.height * k);
    RM.render(cv.getContext('2d'), p, t, { scale: k, export: true });
    cv.toBlob((b) => res(b), type, q);
  });
})();
