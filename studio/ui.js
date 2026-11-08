/* REMP'ART Motion — interface de montage. */
(function () {
  'use strict';
  const RM = window.RM;
  const clamp = RM.clamp;

  // ---------- icônes ----------
  const P = {
    media: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    sound: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    text: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
    shapes: '<rect x="3" y="3" width="10" height="10" rx="1"/><circle cx="16" cy="16" r="5"/>',
    folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    claude: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    play: '<path d="M7 4l13 8-13 8z"/>', pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
    start: '<path d="M6 5v14M18 5L9 12l9 7z"/>', end: '<path d="M18 5v14M6 5l9 7-9 7z"/>',
    undo: '<path d="M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3"/>', redo: '<path d="M15 14l5-5-5-5M20 9H9a5 5 0 000 10h3"/>',
    split: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    zin: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>', zout: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>',
    magnet: '<path d="M6 3v8a6 6 0 0012 0V3h-4v8a2 2 0 01-4 0V3z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6 0 10 7 10 7a17 17 0 01-3 3.7M6.6 6.6C3.9 8.3 2 12 2 12s4 7 10 7a9.8 9.8 0 005.4-1.6"/>',
    vol: '<path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/>', mute: '<path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/>',
    export: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>', diamond: '<path d="M12 3l9 9-9 9-9-9z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
    video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-4v12l-6-4"/>', send: '<path d="M4 12l16-8-6 16-2-7z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>', download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    film: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 9h5M17 9h5M2 15h5M17 15h5"/>',
    json: '<path d="M8 3H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h1M16 3h1a2 2 0 012 2v4a2 2 0 002 2 2 2 0 00-2 2v4a2 2 0 01-2 2h-1"/>',
  };
  const icon = (n, cls = '') => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'i ' + cls); s.setAttribute('aria-hidden', 'true'); s.innerHTML = P[n] || ''; return s; };
  RM.icon = icon;

  // ---------- DOM ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
    return el;
  }
  RM.h = h;
  const $ = (s, r = document) => r.querySelector(s);
  const mq = window.matchMedia('(max-width: 900px)');
  const isMobile = () => mq.matches;
  const fmtS = (v) => (Math.round(v * 100) / 100).toLocaleString('fr-FR') + ' s';

  // ---------- état ----------
  const CLIENT = RM.uid('v');
  const S = (RM.state = {
    project: RM.demoProject(), t: 0, playing: false, sel: null, pps: 90, snap: true,
    leftTab: 'media', sideTab: 'props', sheet: null, undo: [], redo: [], mk: null, mt: 0,
    dirty: false, unsaved: true, saving: false, projects: [], chat: [], sfx: null, sfxQ: '', sfxCat: '',
    assets: null, downloads: null, previewing: null,
  });

  // ---------- stockage (base de l'artefact si disponible, sinon ce navigateur) ----------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* */ } },
  };
  const store = (RM.store = {
    db: null, mode: 'local',
    async init() {
      if (window.claude && typeof window.claude.use === 'function') {
        try { this.db = await window.claude.use('db'); } catch (e) { this.db = null; }
        try { S.assets = await window.claude.use('assets'); } catch (e) { S.assets = null; }
        try { S.downloads = await window.claude.use('downloads'); } catch (e) { S.downloads = null; }
      }
      this.mode = this.db ? 'cloud' : 'local';
      return this.mode;
    },
    meta(id, d) { return { id, name: d.name || 'Sans nom', format: d.format || '16:9', updatedAt: d.updatedAt || 0, thumb: d.thumb || '' }; },
    async list() {
      if (this.db) {
        const snap = await this.db.collection('projects').get();
        return snap.docs.map((d) => this.meta(d.id, d.data() || {})).sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return LS.get('rm-index', []).sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async load(id) {
      let d;
      if (this.db) { const s = await this.db.doc('projects/' + id).get(); d = s.exists ? s.data() : null; }
      else d = LS.get('rm-p-' + id, null);
      if (!d || !d.json) return null;
      const project = RM.normalize(d.json); project.id = id;
      return { project, chat: Array.isArray(d.chat) ? d.chat : [], updatedAt: d.updatedAt || 0 };
    },
    async save(p, chat, thumb) {
      const doc = { name: p.name, format: p.format, updatedAt: Date.now(), by: CLIENT, json: JSON.stringify(p), chat: (chat || []).slice(-40), thumb: thumb || '' };
      if (this.db) await this.db.doc('projects/' + p.id).set(doc);
      else {
        if (!LS.set('rm-p-' + p.id, doc)) { doc.thumb = ''; if (!LS.set('rm-p-' + p.id, doc)) throw new Error('Mémoire du navigateur pleine'); }
        const idx = LS.get('rm-index', []).filter((m) => m.id !== p.id); idx.push(this.meta(p.id, doc)); LS.set('rm-index', idx);
      }
      return doc.updatedAt;
    },
    async remove(id) {
      if (this.db) await this.db.doc('projects/' + id).delete();
      else { LS.del('rm-p-' + id); LS.set('rm-index', LS.get('rm-index', []).filter((m) => m.id !== id)); }
    },
    watch(id, cb) {
      if (!this.db) return () => {};
      try { return this.db.doc('projects/' + id).onSnapshot((s) => { if (s.exists && !(s.metadata && s.metadata.hasPendingWrites)) cb(s.data()); }, () => {}); }
      catch (e) { return () => {}; }
    },
  });

  // ---------- modifications + annuler ----------
  function edit(fn, key, opts = {}) {
    const now = Date.now();
    if (!(key && S.mk === key && now - S.mt < 900)) {
      S.undo.push(JSON.stringify(S.project)); if (S.undo.length > 150) S.undo.shift(); S.redo.length = 0;
    }
    S.mk = key; S.mt = now;
    fn(S.project);
    changed(opts);
  }
  RM.edit = edit;
  function changed(opts = {}) {
    S.dirty = true; S.unsaved = false;
    scheduleSave();
    if (S.playing) S.zero = RM.audio.schedule(S.project, S.t);
    requestDraw();
    if (!opts.light) renderTimeline();
    if (opts.full) { renderInspector(); renderPanel(); }
    renderTop();
  }
  function undo() { if (!S.undo.length) return; S.redo.push(JSON.stringify(S.project)); S.project = JSON.parse(S.undo.pop()); S.mk = null; afterSwap(); }
  function redo() { if (!S.redo.length) return; S.undo.push(JSON.stringify(S.project)); S.project = JSON.parse(S.redo.pop()); S.mk = null; afterSwap(); }
  function afterSwap() {
    if (S.sel && !RM.findClip(S.project, S.sel)) S.sel = null;
    RM.loadFonts(S.project).then(requestDraw);
    changed({ full: true });
  }
  // Appelé par la discussion avec Claude
  RM.applyProject = (np, label) => {
    const next = RM.normalize(np); next.id = S.project.id;
    S.undo.push(JSON.stringify(S.project)); S.redo.length = 0; S.mk = null;
    S.project = next;
    if (S.sel && !RM.findClip(next, S.sel)) S.sel = null;
    RM.preload(next).then(requestDraw);
    changed({ full: true });
    toast(label || 'Modifications appliquées', 'Annuler', undo);
  };
  RM.undo = undo;

  // ---------- enregistrement ----------
  let saveTimer = null, unwatch = () => {};
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 1200); }
  async function saveNow() {
    if (!S.dirty || S.unsaved) return;
    S.saving = true; renderTop();
    try {
      const p = S.project;
      let thumb = '';
      try { const b = await RM.snapshot(p, Math.min(RM.duration(p) * 0.4, 3), 320, 'image/jpeg', 0.7); thumb = b ? await blobToDataURL(b) : ''; } catch (e) { /* aperçu facultatif */ }
      S.dirty = false;
      S.lastSaved = await store.save(p, S.chat, thumb);
      const m = { id: p.id, name: p.name, format: p.format, updatedAt: S.lastSaved, thumb };
      S.projects = [m, ...S.projects.filter((x) => x.id !== p.id)];
      if (S.leftTab === 'projects' || S.sheet === 'projects') renderPanel();
    } catch (e) {
      S.dirty = true; toast("L'enregistrement a échoué : " + (e.message || e.code || 'erreur inconnue'));
    }
    S.saving = false; renderTop();
  }
  RM.saveChat = (chat) => { S.chat = chat; S.dirty = true; S.unsaved = false; scheduleSave(); };
  const blobToDataURL = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });

  async function openProject(id) {
    pause();
    const d = await store.load(id).catch(() => null);
    if (!d) { toast('Projet introuvable.'); return; }
    S.project = d.project; S.chat = d.chat; S.lastSaved = d.updatedAt; S.sel = null; S.t = 0; S.undo = []; S.redo = []; S.dirty = false; S.unsaved = false;
    watchCurrent();
    await RM.preload(S.project);
    RM.chat && RM.chat.load(S.chat);
    renderAll();
  }
  function watchCurrent() {
    unwatch();
    unwatch = store.watch(S.project.id, (d) => {
      if (d.by === CLIENT || !d.updatedAt || d.updatedAt <= (S.lastSaved || 0) + 50) return;
      const apply = () => { S.project = RM.normalize(d.json); S.lastSaved = d.updatedAt; S.chat = d.chat || S.chat; RM.chat && RM.chat.load(S.chat); S.dirty = false; afterSwapNoSave(); };
      if (!S.dirty) { apply(); toast('Projet mis à jour depuis une autre session.'); }
      else toast('Une version plus récente existe.', 'Charger', apply);
    });
  }
  function afterSwapNoSave() { if (S.sel && !RM.findClip(S.project, S.sel)) S.sel = null; RM.preload(S.project).then(requestDraw); renderAll(); S.dirty = false; renderTop(); }
  function newProject(kind, format) {
    pause();
    S.project = kind === 'demo' ? RM.demoProject() : RM.newProject('Nouveau projet', format || '16:9');
    if (kind === 'demo') S.project.name = "Démo REMP'ART " + new Date().toLocaleDateString('fr-FR');
    S.chat = []; S.sel = null; S.t = 0; S.undo = []; S.redo = []; S.dirty = true; S.unsaved = false;
    RM.chat && RM.chat.load([]);
    watchCurrent(); RM.preload(S.project).then(requestDraw); renderAll(); saveNow();
  }

  // ---------- placement des clips ----------
  function free(tr, start, dur, ignore) { return tr.clips.every((c) => c.id === ignore || c.start >= start + dur - 1e-6 || c.start + c.duration <= start + 1e-6); }
  function placeClip(clip, prefer) {
    const p = S.project, kind = clip.type === 'audio' ? 'audio' : 'visual';
    let tr = prefer && p.tracks.find((t) => t.id === prefer && t.kind === kind && free(t, clip.start, clip.duration));
    if (!tr) tr = p.tracks.find((t) => t.kind === kind && !t.hidden && !t.muted && free(t, clip.start, clip.duration));
    if (!tr) {
      const n = p.tracks.filter((t) => t.kind === kind).length + 1;
      tr = { id: RM.uid('t'), kind, name: kind === 'audio' ? 'Sons ' + n : 'Calque ' + n, hidden: false, muted: false, clips: [] };
      if (kind === 'visual') p.tracks.unshift(tr); else p.tracks.push(tr);
    }
    tr.clips.push(clip);
    return tr;
  }
  function addClip(clip, msg) {
    edit(() => placeClip(clip), null);
    select(clip.id);
    RM.preload(S.project).then(requestDraw);
    if (isMobile()) { S.sheet = null; renderSheets(); }
    toast(msg || 'Ajouté à la timeline');
  }

  const TEXT_PRESETS = [
    { name: 'Titre', hint: 'Grand, gras, apparition pop', props: { text: 'Titre', size: 160, weight: 900 }, anim: { in: { type: 'pop', dur: 0.6, ease: 'back' }, out: { type: 'fade', dur: 0.4, ease: 'out' } } },
    { name: 'Sous-titre', hint: 'Mot par mot', props: { text: 'Votre sous-titre ici', font: 'Manrope', size: 64, weight: 600 }, anim: { in: { type: 'words', dur: 0.9, ease: 'out' }, out: { type: 'fade', dur: 0.4, ease: 'out' } } },
    { name: 'Étiquette', hint: 'Texte sur fond rouge', props: { text: 'NOUVEAU', size: 46, weight: 800, bg: '#ff1a1a', bgPad: 26, radius: 8, letterSpacing: 4 }, anim: { in: { type: 'wipe', dur: 0.5, ease: 'expo' }, out: { type: 'fade', dur: 0.3, ease: 'out' } } },
    { name: 'Chiffre clé', hint: 'Énorme, zoom', props: { text: '24/7', size: 260, weight: 900, color: '#ff1a1a' }, anim: { in: { type: 'zoom', dur: 0.6, ease: 'back' }, out: { type: 'blur', dur: 0.4, ease: 'out' } } },
    { name: 'Machine à écrire', hint: 'Lettre après lettre', props: { text: 'Votre vision.\nNotre création.', font: 'Space Mono', size: 64, weight: 700, align: 'left' }, anim: { in: { type: 'typewriter', dur: 1.4, ease: 'linear' }, out: { type: 'fade', dur: 0.3, ease: 'out' } } },
    { name: 'Paragraphe', hint: 'Texte courant', props: { text: 'Une phrase qui explique\nvotre message en deux lignes.', font: 'Manrope', size: 44, weight: 500, lineHeight: 1.35 }, anim: { in: { type: 'slide-up', dur: 0.6, ease: 'out' }, out: { type: 'fade', dur: 0.4, ease: 'out' } } },
  ];
  const SHAPE_PRESETS = [
    { name: 'Rectangle', props: { shape: 'rect', w: 520, h: 300, fill: '#1d3bff', radius: 18 }, anim: 'zoom' },
    { name: 'Cercle', props: { shape: 'circle', w: 320, h: 320, fill: '#ff1a1a' }, anim: 'pop' },
    { name: 'Anneau qui se dessine', props: { shape: 'ring', w: 420, h: 420, fill: '', stroke: '#ffffff', strokeWidth: 10 }, anim: 'wipe' },
    { name: 'Trait', props: { shape: 'rect', w: 600, h: 10, fill: '#ff1a1a', radius: 5 }, anim: 'wipe' },
    { name: 'Triangle', props: { shape: 'triangle', w: 260, h: 230, fill: '#f4f2ee' }, anim: 'spin' },
    { name: 'Bandeau', props: { shape: 'rect', w: 1920, h: 160, fill: '#07080d', y: 940 }, anim: 'slide-up' },
  ];
  function addText(pr) {
    const p = S.project, scale = Math.min(p.width, p.height) / 1080;
    const props = { ...pr.props, size: Math.round(pr.props.size * scale) };
    addClip(RM.makeClip(p, 'text', S.t, { duration: 3, name: pr.name, props, anim: { ...pr.anim, loop: { type: 'none', amp: 1, speed: 1 } } }), pr.name + ' ajouté');
  }
  function addShape(pr) {
    const p = S.project, props = { ...pr.props };
    if (pr.name === 'Bandeau') { props.w = p.width; props.y = p.height - 140; }
    addClip(RM.makeClip(p, 'shape', S.t, { duration: 3, name: pr.name, props,
      anim: { in: { type: pr.anim, dur: pr.anim === 'wipe' ? 0.8 : 0.5, ease: pr.anim === 'pop' ? 'back' : 'out' }, out: { type: 'fade', dur: 0.4, ease: 'out' }, loop: { type: 'none', amp: 1, speed: 1 } } }), pr.name + ' ajouté');
  }
  function sfxSrc(s) { return 'sfx/' + s.files.mp3; }
  function addSfx(s) {
    const start = Math.max(0, RM.round(S.t - (s.hit_point ?? 0)));
    const clip = { id: RM.uid('c'), type: 'audio', name: s.id, start, duration: s.duration, props: { ...RM.defaults.audio(), src: sfxSrc(s), sfx: s.id } };
    addClip(clip, `« ${s.name} » calé sur ${RM.fmtTime(S.t, S.project.fps)}`);
    RM.audio.load(clip.props.src);
  }
  async function addMedia(m) {
    const p = S.project;
    if (m.type === 'image') return addClip(RM.makeClip(p, 'image', S.t, { duration: 3, name: m.name, props: { src: m.src } }));
    if (m.type === 'video') return addClip(RM.makeClip(p, 'video', S.t, { duration: m.duration || 5, name: m.name, props: { src: m.src }, anim: { in: { type: 'fade', dur: 0.3, ease: 'out' }, out: { type: 'fade', dur: 0.3, ease: 'out' }, loop: { type: 'none', amp: 1, speed: 1 } } }));
    const buf = await RM.audio.load(m.src);
    addClip({ id: RM.uid('c'), type: 'audio', name: m.name, start: RM.round(S.t), duration: RM.round(buf ? buf.duration : m.duration || 3), props: { ...RM.defaults.audio(), src: m.src } });
  }

  const BUILTIN = [
    { name: "Logo REMP'ART blanc", src: 'assets/img/rempart-logo-white.png' }, { name: "Logo REMP'ART", src: 'assets/img/rempart-logo.png' },
    { name: 'Mercedes AMG', src: 'assets/img/portfolio/mercedes-amg-sm.webp' }, { name: 'Parfum Arta', src: 'assets/img/portfolio/parfum-arta-sm.webp' },
    { name: 'Octobre rose', src: 'assets/img/portfolio/octobre-rose-sm.webp' }, { name: 'Alloco Spice', src: 'assets/img/portfolio/alloco-spice-sm.webp' },
    { name: 'Yaki', src: 'assets/img/portfolio/yaki-sm.webp' }, { name: 'Betsaleel', src: 'assets/img/portfolio/betsaleel-sm.webp' },
  ].map((m) => ({ ...m, type: 'image', builtin: true }));

  async function importFiles(files) {
    for (const f of files) {
      const type = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : null;
      if (!type) { toast(`« ${f.name} » n'est ni une image, ni une vidéo, ni un son.`); continue; }
      let src, local = false;
      try {
        if (S.assets && type !== 'audio' && f.size <= 20 * 1024 * 1024) { const r = await S.assets.upload(f); src = r.url || '/_blob/' + r.id; }
      } catch (e) { src = null; }
      if (!src) {
        const id = RM.uid('m');
        try { await RM.localStore.put(id, f); src = 'local:' + id; local = true; }
        catch (e) { toast(`Impossible d'importer « ${f.name} » dans ce navigateur.`); continue; }
      }
      let duration;
      if (type === 'audio') { const b = await RM.audio.load(src); duration = b ? RM.round(b.duration) : undefined; }
      if (type === 'video') duration = await new Promise(async (res) => { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => res(RM.round(v.duration)); v.onerror = () => res(undefined); v.src = await RM.resolve(src); setTimeout(() => res(undefined), 8000); });
      const m = { id: RM.uid('m'), name: f.name.replace(/\.[^.]+$/, ''), type, src, local, duration };
      edit((p) => p.media.push(m), null, { full: false });
      renderPanel();
      toast(`« ${m.name} » importé${local ? ' (gardé dans ce navigateur)' : ''}`);
    }
  }

  // ---------- sélection, temps, lecture ----------
  function select(id) {
    S.sel = id;
    if (id && !isMobile()) S.sideTab = 'props';
    renderTimeline(); renderSideTabs(); renderInspector(); requestDraw();
  }
  function setTime(t, fromPlay) {
    const dur = RM.duration(S.project);
    S.t = clamp(t, 0, Math.max(dur, 0));
    if (S.playing && !fromPlay) S.zero = RM.audio.schedule(S.project, S.t);
    if (!S.playing) RM.syncVideos(S.project, S.t, false);
    requestDraw(); updatePlayhead();
    if (!S.playing) refreshInspectorValues();
  }
  async function play() {
    if (S.playing) return;
    const ctx = RM.audio.ensure();
    const dur = RM.duration(S.project);
    if (S.t >= dur - 0.02) S.t = 0;
    const loads = [];
    for (const tr of S.project.tracks) for (const c of tr.clips) if (c.type === 'audio') loads.push(RM.audio.load(c.props.src));
    await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2500))]);
    S.playing = true; S.zero = RM.audio.schedule(S.project, S.t);
    renderTransport();
    const loop = () => {
      if (!S.playing) return;
      const t = ctx.currentTime - S.zero, d = RM.duration(S.project);
      if (t >= d) { pause(); setTime(d); return; }
      S.t = Math.max(0, t);
      RM.syncVideos(S.project, S.t, true);
      draw(); updatePlayhead(true);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  function pause() {
    if (!S.playing) return;
    S.playing = false; RM.audio.stopAll(); RM.pauseVideos(); renderTransport(); refreshInspectorValues();
  }
  const toggle = () => (S.playing ? pause() : play());

  // ---------- scène (canvas) ----------
  let cv, ctx2d, drawQueued = false;
  function requestDraw() { if (drawQueued) return; drawQueued = true; requestAnimationFrame(() => { drawQueued = false; draw(); }); }
  RM.onMediaReady = requestDraw;
  RM.requestDraw = requestDraw;
  function fitCanvas() {
    const vp = $('.viewport'); if (!vp || !cv) return;
    const p = S.project, cs = getComputedStyle(vp);
    const aw = vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = vp.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (aw <= 0 || ah <= 0) return;
    const k = Math.min(aw / p.width, ah / p.height);
    const w = Math.floor(p.width * k), hh = Math.floor(p.height * k);
    cv.style.width = w + 'px'; cv.style.height = hh + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.min(p.width, Math.round(w * dpr)), bh = Math.round((bw * p.height) / p.width);
    if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
    draw();
  }
  function draw() {
    if (!cv) return;
    const p = S.project, k = cv.width / p.width;
    RM.render(ctx2d, p, S.t, { scale: k });
    const b = S.sel && RM.bounds.get(S.sel);
    if (b) {
      ctx2d.save(); ctx2d.setTransform(b.m);
      const u = 1 / Math.hypot(b.m.a, b.m.b);
      ctx2d.lineWidth = 1.5 * u; ctx2d.strokeStyle = '#4d63ff'; ctx2d.setLineDash([6 * u, 4 * u]);
      ctx2d.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx2d.setLineDash([]);
      ctx2d.fillStyle = '#fff';
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const s = 10 * u; ctx2d.fillRect((sx * b.w) / 2 - s / 2, (sy * b.h) / 2 - s / 2, s, s); ctx2d.strokeRect((sx * b.w) / 2 - s / 2, (sy * b.h) / 2 - s / 2, s, s); }
      ctx2d.restore();
    }
  }
  function canvasPoint(e) { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) * cv.width) / r.width, ((e.clientY - r.top) * cv.height) / r.height]; }
  function setProp(clip, name, v) {
    const ks = clip.keys && clip.keys[name];
    if (ks && ks.length) {
      const lt = RM.round(clamp(S.t - clip.start, 0, clip.duration));
      const fr = 1 / S.project.fps, k = ks.find((x) => Math.abs(x.t - lt) < fr / 2);
      if (k) k.v = v; else { ks.push({ t: lt, v, e: 'smooth' }); ks.sort((a, b) => a.t - b.t); }
    } else clip.props[name] = v;
  }
  RM.setProp = setProp;
  function bindCanvas() {
    let drag = null;
    cv.addEventListener('pointerdown', (e) => {
      const [x, y] = canvasPoint(e);
      const p = S.project, k = cv.width / p.width;
      const sb = S.sel && RM.bounds.get(S.sel);
      if (sb) {
        const q = sb.m.inverse().transformPoint(new DOMPoint(x, y)), u = 14 / Math.hypot(sb.m.a, sb.m.b);
        const corner = [[-1, -1], [1, -1], [1, 1], [-1, 1]].some(([sx, sy]) => Math.abs(q.x - (sx * sb.w) / 2) < u && Math.abs(q.y - (sy * sb.h) / 2) < u);
        if (corner) {
          const f = RM.findClip(p, S.sel), lt = S.t - f.clip.start;
          drag = { mode: 'scale', id: S.sel, cx: sb.m.e, cy: sb.m.f, d0: Math.hypot(x - sb.m.e, y - sb.m.f), s0: RM.prop(f.clip, 'scale', lt) };
          cv.setPointerCapture(e.pointerId); e.preventDefault(); return;
        }
      }
      const id = RM.hitTest(x, y, p);
      if (!id) { if (S.sel) select(null); return; }
      if (id !== S.sel) select(id);
      const f = RM.findClip(p, id), lt = S.t - f.clip.start;
      drag = { mode: 'move', id, x0: x, y0: y, px: RM.prop(f.clip, 'x', lt), py: RM.prop(f.clip, 'y', lt), k, moved: false };
      cv.setPointerCapture(e.pointerId); e.preventDefault();
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const [x, y] = canvasPoint(e);
      const f = RM.findClip(S.project, drag.id); if (!f) return;
      if (drag.mode === 'move') {
        if (!drag.moved && Math.hypot(x - drag.x0, y - drag.y0) < 3) return;
        drag.moved = true;
        let nx = drag.px + (x - drag.x0) / drag.k, ny = drag.py + (y - drag.y0) / drag.k;
        const p = S.project, th = 12 / drag.k;
        if (Math.abs(nx - p.width / 2) < th) nx = p.width / 2;
        if (Math.abs(ny - p.height / 2) < th) ny = p.height / 2;
        edit(() => { setProp(f.clip, 'x', Math.round(nx)); setProp(f.clip, 'y', Math.round(ny)); }, 'move:' + drag.id, { light: true });
      } else {
        const s = Math.max(0.05, (drag.s0 * Math.hypot(x - drag.cx, y - drag.cy)) / Math.max(1, drag.d0));
        edit(() => setProp(f.clip, 'scale', RM.round(s, 3)), 'scale:' + drag.id, { light: true });
      }
    });
    const end = () => { if (drag) { if (drag.moved || drag.mode === 'scale') { renderInspector(); renderTimeline(); } drag = null; } };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  }

  // ---------- coquille ----------
  const RAIL = [
    { id: 'media', label: 'Médias', icon: 'media', where: 'left' }, { id: 'sounds', label: 'Sons', icon: 'sound', where: 'left' },
    { id: 'text', label: 'Texte', icon: 'text', where: 'left' }, { id: 'shapes', label: 'Formes', icon: 'shapes', where: 'left' },
    { id: 'props', label: 'Réglages', icon: 'sliders', where: 'side' }, { id: 'claude', label: 'Claude', icon: 'claude', where: 'side' },
    { id: 'projects', label: 'Projets', icon: 'folder', where: 'left' },
  ];
  function shell() {
    const root = $('#app');
    root.innerHTML = '';
    root.className = 'app';
    root.append(
      h('header', { class: 'top' }),
      h('nav', { class: 'rail surface', 'aria-label': 'Outils' }),
      h('section', { class: 'panel surface', 'aria-label': 'Bibliothèque' }),
      h('section', { class: 'stage surface', 'aria-label': 'Aperçu' },
        h('div', { class: 'viewport' }, (cv = h('canvas', { id: 'stage-canvas', width: 960, height: 540, 'aria-label': 'Aperçu de la vidéo' }))),
        h('div', { class: 'transport' })),
      h('aside', { class: 'side surface', 'aria-label': 'Réglages et discussion' }),
      h('section', { class: 'tl surface', 'aria-label': 'Timeline' }),
    );
    ctx2d = cv.getContext('2d');
    bindCanvas();
    new ResizeObserver(() => fitCanvas()).observe($('.viewport'));
    mq.addEventListener('change', () => { S.sheet = null; renderAll(); });
  }
  function renderAll() { renderTop(); renderRail(); renderPanel(); renderSideTabs(); renderInspector(); renderTransport(); renderTimeline(); renderSheets(); fitCanvas(); }

  function renderTop() {
    const top = $('.top'); if (!top) return;
    const st = S.saving ? ['saving', 'Enregistrement…'] : store.mode === 'local' ? ['local', S.dirty ? 'Modifications non enregistrées' : 'Enregistré dans ce navigateur']
      : S.unsaved ? ['local', 'Exemple, pas encore enregistré'] : S.dirty ? ['saving', 'Modifications en attente'] : ['', 'Enregistré'];
    const focused = document.activeElement && document.activeElement.classList.contains('pname');
    if (focused) { const s = $('.status', top); if (s) { s.className = 'status ' + st[0]; s.lastChild.textContent = st[1]; } return; }
    top.innerHTML = '';
    top.append(
      h('div', { class: 'brand' }, h('span', { class: 'mark' }, 'R'), h('b', null, 'REMP’ART Motion'), h('small', null, 'Créer · Monter · Animer')),
      h('span', { class: 'vsep' }),
      h('input', { class: 'pname', id: 'project-name', value: S.project.name, 'aria-label': 'Nom du projet', maxlength: 120,
        onchange: (e) => edit((p) => { p.name = e.target.value.trim() || 'Projet sans nom'; }, null),
        onkeydown: (e) => { if (e.key === 'Enter') e.target.blur(); } }),
      h('button', { class: 'ib desk-only', title: 'Annuler (Ctrl+Z)', 'aria-label': 'Annuler', disabled: !S.undo.length, onclick: undo }, icon('undo')),
      h('button', { class: 'ib desk-only', title: 'Rétablir (Ctrl+Maj+Z)', 'aria-label': 'Rétablir', disabled: !S.redo.length, onclick: redo }, icon('redo')),
      h('span', { class: 'grow' }),
      h('span', { class: 'status ' + st[0], title: st[1] }, h('i'), h('span', null, st[1])),
      h('button', { class: 'btn primary', onclick: openExport }, icon('export'), h('span', null, 'Exporter')),
    );
  }
  function railActive(id) { return isMobile() ? S.sheet === id : RAIL.find((r) => r.id === id).where === 'left' ? S.leftTab === id : S.sideTab === id; }
  function renderRail() {
    const rail = $('.rail'); rail.innerHTML = '';
    for (const r of RAIL) {
      rail.append(h('button', { 'aria-pressed': String(railActive(r.id)), onclick: () => {
        if (isMobile()) { S.sheet = S.sheet === r.id ? null : r.id; if (S.sheet && r.where === 'side') S.sideTab = r.id; }
        else if (r.where === 'left') S.leftTab = r.id; else S.sideTab = r.id;
        renderRail(); renderPanel(); renderSideTabs(); renderInspector(); renderSheets();
      } }, icon(r.icon), r.label));
    }
  }
  function renderSheets() {
    const panel = $('.panel'), side = $('.side');
    if (isMobile()) {
      const r = RAIL.find((x) => x.id === S.sheet);
      panel.hidden = !(r && r.where === 'left'); side.hidden = !(r && r.where === 'side');
      if (r && r.where === 'side') S.sideTab = r.id;
    } else { panel.hidden = false; side.hidden = false; }
    renderRail();
  }
  const closeSheet = () => { S.sheet = null; renderSheets(); };
  function head(title, ...extra) {
    return h('div', { class: 'phead' }, h('h2', null, title), ...extra,
      h('button', { class: 'ib sheet-close', 'aria-label': 'Fermer', onclick: closeSheet }, icon('close')));
  }

  // ---------- panneau de gauche ----------
  function renderPanel() {
    const el = $('.panel'); if (!el) return;
    const tab = isMobile() ? (RAIL.find((r) => r.id === S.sheet && r.where === 'left') || {}).id || 'media' : S.leftTab;
    el.innerHTML = '';
    ({ media: panelMedia, sounds: panelSounds, text: panelText, shapes: panelShapes, projects: panelProjects }[tab] || panelMedia)(el);
  }
  function panelMedia(el) {
    const input = h('input', { type: 'file', id: 'media-input', accept: 'image/*,video/*,audio/*', multiple: true, class: 'sr', onchange: (e) => { importFiles([...e.target.files]); e.target.value = ''; } });
    const drop = h('div', { class: 'drop' }, h('button', { class: 'btn primary', onclick: () => input.click() }, icon('plus'), 'Importer des médias'),
      h('p', { class: 'hint', style: { marginTop: '8px' } }, 'Images, vidéos ou sons. Vous pouvez aussi les glisser ici.'));
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); importFiles([...e.dataTransfer.files]); });
    const card = (m) => {
      const b = h('button', { class: 'mcard' + (m.type === 'audio' ? ' audio' : ''), title: 'Ajouter « ' + m.name + ' » à la tête de lecture', onclick: () => addMedia(m) });
      if (m.type === 'image') { const im = h('img', { alt: '', class: /logo/i.test(m.name) ? 'contain' : null }); RM.resolve(m.src).then((u) => u && (im.src = u)); b.append(im); }
      else if (m.type === 'video') { const v = h('video', { muted: true, playsinline: true, preload: 'metadata' }); RM.resolve(m.src).then((u) => u && (v.src = u + '#t=0.5')); b.append(v); }
      else b.append(icon('sound'));
      b.append(h('span', null, m.name + (m.duration ? ' · ' + fmtS(m.duration) : '')));
      if (m.local) b.append(h('em', { title: 'Fichier gardé dans ce navigateur seulement' }, 'Local'));
      return b;
    };
    const mine = S.project.media || [];
    el.append(head('Médias'), h('div', { class: 'pbody' }, input, drop,
      mine.length ? [h('p', { class: 'label' }, 'Ce projet'), h('div', { class: 'mgrid' }, mine.map(card))] : null,
      h('p', { class: 'label' }, 'REMP’ART'), h('div', { class: 'mgrid' }, BUILTIN.map(card)),
      h('p', { class: 'hint' }, 'Touchez un média pour l’ajouter à la tête de lecture.')));
  }
  function panelSounds(el) {
    const cat = S.sfx;
    const body = h('div', { class: 'pbody' });
    el.append(head('Sonothèque'), body);
    if (!cat) { body.append(h('p', { class: 'hint' }, 'Sonothèque introuvable : le fichier sfx/catalog.json ne s’est pas chargé.')); return; }
    const list = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } });
    const draw = () => {
      list.innerHTML = '';
      const q = S.sfxQ.toLowerCase();
      const items = cat.sounds.filter((s) => (!S.sfxCat || s.category === S.sfxCat) && [s.id, s.name, s.description, s.usage, ...(s.tags || [])].join(' ').toLowerCase().includes(q));
      if (!items.length) list.append(h('p', { class: 'hint' }, 'Aucun son ne correspond.'));
      for (const s of items) {
        const playing = S.previewing === s.id;
        list.append(h('div', { class: 'snd' },
          h('button', { class: 'play', 'aria-label': (playing ? 'Arrêter ' : 'Écouter ') + s.name, onclick: () => {
            if (playing) { RM.audio.stopPreview(); S.previewing = null; draw(); return; }
            S.previewing = s.id; draw();
            RM.audio.preview(sfxSrc(s), () => { if (S.previewing === s.id) { S.previewing = null; draw(); } });
          } }, icon(playing ? 'stop' : 'play')),
          h('div', { style: { minWidth: 0 } }, h('b', null, s.name),
            h('small', null, `${cat.categories[s.category]?.label || s.category} · ${fmtS(s.duration)}${s.hit_point != null ? ' · impact ' + fmtS(s.hit_point) : ''}`),
            s.verified ? null : h('small', { class: 'warn' }, ' · à valider')),
          h('button', { class: 'ib', title: 'Ajouter, impact calé sur la tête de lecture', 'aria-label': 'Ajouter ' + s.name, onclick: () => addSfx(s) }, icon('plus'))));
      }
    };
    const used = Object.keys(cat.categories).filter((k) => cat.sounds.some((s) => s.category === k));
    body.append(
      h('div', { class: 'search' }, icon('zin'), h('input', { id: 'sfx-search', placeholder: 'Chercher : impact, whoosh, clic…', value: S.sfxQ, 'aria-label': 'Chercher un son', oninput: (e) => { S.sfxQ = e.target.value; draw(); } })),
      h('div', { class: 'chips' }, ['', ...used].map((k) => h('button', { class: 'chip', 'aria-pressed': String(S.sfxCat === k), onclick: () => { S.sfxCat = k; renderPanel(); } }, k ? cat.categories[k].label : 'Tout'))),
      h('p', { class: 'hint' }, `${cat.sounds.length} sons. Le bouton + place le son pour que son impact tombe sur la tête de lecture (${RM.fmtTime(S.t, S.project.fps)}).`),
      list);
    draw();
  }
  function panelText(el) {
    el.append(head('Texte'), h('div', { class: 'pbody' },
      h('div', { class: 'presets' }, TEXT_PRESETS.map((pr) => h('button', { class: 'preset', onclick: () => addText(pr) },
        h('b', { style: { fontFamily: `"${pr.props.font || 'Archivo'}", sans-serif`, fontWeight: pr.props.weight, fontSize: '17px', lineHeight: 1.1, color: pr.props.color && pr.props.color !== '#ffffff' ? pr.props.color : undefined } }, pr.name),
        h('small', null, pr.hint)))),
      h('p', { class: 'hint' }, 'Le texte est ajouté à la tête de lecture. Modifiez-le ensuite dans Réglages, ou demandez à Claude.')));
  }
  function shapeIcon(pr) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 34 24'); s.setAttribute('class', 'shape');
    const c = pr.props.fill || pr.props.stroke;
    s.innerHTML = pr.props.shape === 'circle' ? `<circle cx="17" cy="12" r="10" fill="${c}"/>` : pr.props.shape === 'ring' ? `<circle cx="17" cy="12" r="9" fill="none" stroke="${c}" stroke-width="3"/>`
      : pr.props.shape === 'triangle' ? `<path d="M17 2l12 20H5z" fill="${c}"/>` : pr.name === 'Trait' ? `<rect x="2" y="10" width="30" height="4" rx="2" fill="${c}"/>`
      : pr.name === 'Bandeau' ? `<rect x="0" y="15" width="34" height="9" fill="#2a2f45"/>` : `<rect x="3" y="3" width="28" height="18" rx="3" fill="${c}"/>`;
    return s;
  }
  function panelShapes(el) {
    el.append(head('Formes'), h('div', { class: 'pbody' },
      h('div', { class: 'presets' }, SHAPE_PRESETS.map((pr) => h('button', { class: 'preset', onclick: () => addShape(pr) }, shapeIcon(pr), h('b', null, pr.name)))),
      h('p', { class: 'label' }, 'Fond du projet'),
      h('p', { class: 'hint' }, 'Sans élément sélectionné, Réglages permet de changer le fond (uni, dégradé, radial) et le format.')));
  }
  function panelProjects(el) {
    const body = h('div', { class: 'pbody' });
    el.append(head('Projets'), body);
    const fileIn = h('input', { type: 'file', id: 'json-input', accept: '.json,application/json', class: 'sr', onchange: async (e) => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      try { const np = RM.normalize(await f.text()); np.id = RM.uid('p'); pause(); S.project = np; S.chat = []; S.undo = []; S.redo = []; S.sel = null; S.dirty = true; S.unsaved = false; watchCurrent(); await RM.preload(np); renderAll(); saveNow(); toast('Projet importé'); }
      catch (err) { toast('Ce fichier n’est pas un projet REMP’ART Motion valide.'); }
    } });
    body.append(
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => newProject('blank', '16:9') }, icon('plus'), 'Vide 16:9'),
        h('button', { class: 'btn', onclick: () => newProject('blank', '9:16') }, icon('plus'), 'Vide 9:16'),
        h('button', { class: 'btn', onclick: () => newProject('demo') }, icon('plus'), 'Depuis la démo')),
      h('div', { class: 'row' }, fileIn, h('button', { class: 'btn ghost', onclick: () => fileIn.click() }, icon('json'), 'Importer un projet (.json)')),
      h('p', { class: 'hint' }, store.mode === 'cloud' ? 'Les projets sont enregistrés avec ce studio : vous les retrouvez sur ordinateur et téléphone, et Claude peut les lire depuis une session de code.' : 'Les projets sont enregistrés dans ce navigateur. Ouvrez le studio depuis Claude pour les retrouver partout.'));
    const list = S.projects.length ? S.projects : [];
    if (S.unsaved) body.append(h('div', { class: 'proj cur' }, h('div', { class: 'ph' }), h('div', null, h('b', null, S.project.name), h('small', null, 'Exemple, enregistré dès la première modification')), h('span')));
    for (const m of list) {
      let confirmDel = false;
      const del = h('button', { class: 'ib', 'aria-label': 'Supprimer ' + m.name, title: 'Supprimer', onclick: async (e) => {
        e.stopPropagation();
        if (!confirmDel) { confirmDel = true; del.style.color = 'var(--red)'; del.title = 'Toucher encore pour supprimer'; toast('Touchez encore la corbeille pour supprimer « ' + m.name + ' ».'); return; }
        await store.remove(m.id).catch(() => toast('Suppression impossible.'));
        S.projects = S.projects.filter((x) => x.id !== m.id);
        if (m.id === S.project.id) { S.unsaved = true; S.dirty = false; }
        renderPanel();
      } }, icon('trash'));
      body.append(h('div', { class: 'proj' + (m.id === S.project.id ? ' cur' : ''), role: 'button', tabindex: '0', onclick: () => m.id !== S.project.id && openProject(m.id), onkeydown: (e) => e.key === 'Enter' && openProject(m.id) },
        m.thumb ? h('img', { src: m.thumb, alt: '' }) : h('div', { class: 'ph' }),
        h('div', { style: { minWidth: 0 } }, h('b', null, m.name), h('small', null, `${m.format} · ${m.updatedAt ? new Date(m.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : ''}`)),
        del));
    }
    if (!list.length && !S.unsaved) body.append(h('p', { class: 'hint' }, 'Aucun projet enregistré pour l’instant.'));
  }

  // ---------- panneau de droite : réglages / Claude ----------
  function renderSideTabs() {
    const side = $('.side'); if (!side) return;
    side.innerHTML = '';
    if (!isMobile()) side.append(h('div', { class: 'tabs', role: 'tablist' },
      [['props', 'Réglages'], ['claude', 'Claude']].map(([id, label]) => h('button', { role: 'tab', 'aria-selected': String(S.sideTab === id), onclick: () => { S.sideTab = id; renderSideTabs(); renderInspector(); renderRail(); } }, label))));
    if (S.sideTab === 'claude') {
      if (isMobile()) side.append(head('Claude'));
      side.append(RM.chat ? RM.chat.el : h('p', { class: 'hint' }, 'Chargement…'));
      RM.chat && RM.chat.onShow && RM.chat.onShow();
    } else side.append(h('div', { class: 'insp', style: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } }));
  }
  function refreshInspectorValues() {
    if (S.sideTab !== 'props' || !S.sel) return;
    const f = RM.findClip(S.project, S.sel);
    const ae = document.activeElement;
    if (f && f.clip.keys && !(ae && $('.insp') && $('.insp').contains(ae))) renderInspector();
  }

  // champs
  function numBox(value, onSet, { step = 1, unit = '', min, max, id } = {}) {
    const inp = h('input', { type: 'number', step, value: RM.round(value, 2), id, min, max, inputmode: 'decimal',
      onchange: (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) onSet(min != null || max != null ? clamp(v, min ?? -Infinity, max ?? Infinity) : v); } });
    return h('div', { class: 'num' }, inp, unit ? h('span', null, unit) : null);
  }
  function field(label, ...ctl) { return h('div', { class: 'field' }, h('label', null, label), ...ctl); }
  function colorBox(value, onSet, id) {
    const col = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff', id, 'aria-label': 'Couleur', oninput: (e) => { txt.value = e.target.value; onSet(e.target.value); } });
    const txt = h('input', { type: 'text', value: value || '', 'aria-label': 'Code couleur', onchange: (e) => { const v = e.target.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) { col.value = v; onSet(v); } } });
    return h('div', { class: 'color' }, col, txt);
  }
  function seg(options, value, onSet) {
    return h('div', { class: 'seg' }, options.map(([v, label]) => h('button', { 'aria-pressed': String(v === value), onclick: (e) => { onSet(v); [...e.currentTarget.parentNode.children].forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }, label)));
  }
  function selectBox(options, value, onSet, id) {
    return h('select', { class: 'inp', id, onchange: (e) => onSet(e.target.value) }, options.map(([v, l]) => h('option', { value: v, selected: v === value }, l)));
  }
  function toggleBox(label, value, onSet, id) {
    return h('label', { class: 'tog', for: id }, label, h('input', { type: 'checkbox', id, checked: value, onchange: (e) => onSet(e.target.checked) }));
  }
  function group(title, ...kids) { return h('div', { class: 'group' }, title ? h('h3', null, title) : null, ...kids); }

  // propriété animable (avec images clés)
  const KEYDEF = {
    x: { label: 'Position X', unit: 'px', step: 1, min: (p) => -p.width * 0.5, max: (p) => p.width * 1.5 },
    y: { label: 'Position Y', unit: 'px', step: 1, min: (p) => -p.height * 0.5, max: (p) => p.height * 1.5 },
    scale: { label: 'Échelle', unit: '%', step: 1, mul: 100, min: () => 5, max: () => 400 },
    rotation: { label: 'Rotation', unit: '°', step: 1, min: () => -360, max: () => 360 },
    opacity: { label: 'Opacité', unit: '%', step: 1, mul: 100, min: () => 0, max: () => 100 },
  };
  function keyField(clip, name) {
    const d = KEYDEF[name], p = S.project, mul = d.mul || 1;
    const lt = clamp(S.t - clip.start, 0, clip.duration);
    const val = RM.prop(clip, name, lt) * mul;
    const ks = clip.keys && clip.keys[name];
    const fr = 1 / p.fps, atKey = ks && ks.some((k) => Math.abs(k.t - lt) < fr / 2);
    const set = (v, live) => {
      edit(() => setProp(clip, name, v / mul), 'p:' + clip.id + name, { light: live });
      range.value = v; box.querySelector('input').value = RM.round(v, 2);
      if (!live) renderTimeline();
    };
    const range = h('input', { type: 'range', min: d.min(p), max: d.max(p), step: d.step, value: val, 'aria-label': d.label, oninput: (e) => set(parseFloat(e.target.value), true), onchange: () => renderTimeline() });
    const box = numBox(val, (v) => set(v), { step: d.step, unit: d.unit, id: 'k-' + name });
    const inClip = S.t >= clip.start && S.t <= clip.start + clip.duration;
    const kf = h('button', { class: 'kf' + (ks && ks.length ? ' has' : '') + (atKey ? ' at' : ''), disabled: !inClip,
      title: !inClip ? 'Placez la tête de lecture sur ce clip pour ajouter une image clé' : atKey ? 'Supprimer l’image clé à cet instant' : 'Ajouter une image clé à cet instant',
      'aria-label': 'Image clé ' + d.label, onclick: () => {
        edit(() => {
          clip.keys = clip.keys || {};
          const arr = clip.keys[name] || [];
          const cur = RM.prop(clip, name, lt);
          if (atKey) {
            clip.keys[name] = arr.filter((k) => Math.abs(k.t - lt) >= fr / 2);
            if (!clip.keys[name].length) { delete clip.keys[name]; clip.props[name] = cur; }
          } else { arr.push({ t: RM.round(lt), v: cur, e: 'smooth' }); arr.sort((a, b) => a.t - b.t); clip.keys[name] = arr; }
          if (!Object.keys(clip.keys).length) delete clip.keys;
        }, null);
        renderInspector();
      } }, icon('diamond'));
    return h('div', { class: 'field' }, h('label', { for: 'k-' + name }, d.label), range, h('div', { class: 'row', style: { gap: '2px', flexWrap: 'nowrap' } }, box, kf));
  }

  function animGroup(clip, which) {
    const a = clip.anim[which];
    const list = which === 'loop' ? RM.LOOPS : RM.ANIMS.filter((x) => !x.text || clip.type === 'text');
    const title = { in: 'Entrée', out: 'Sortie', loop: 'Effet continu' }[which];
    const grid = h('div', { class: 'agrid' }, list.map((x) => h('button', { 'aria-pressed': String(a.type === x.id), onclick: () => {
      edit(() => { a.type = x.id; }, null, { light: true });
      [...grid.children].forEach((b, i) => b.setAttribute('aria-pressed', String(list[i].id === x.id)));
      const lt = which === 'out' ? Math.max(clip.start, clip.start + clip.duration - (a.dur || 0.4) - 0.2) : clip.start;
      if (!S.playing && which !== 'loop') setTime(lt);
    } }, x.label)));
    const kids = [grid];
    if (which === 'loop') {
      kids.push(field('Intensité', h('input', { type: 'range', min: 0.1, max: 3, step: 0.1, value: a.amp ?? 1, 'aria-label': 'Intensité', oninput: (e) => edit(() => { a.amp = +e.target.value; }, 'la' + clip.id, { light: true }) }), h('span')));
      kids.push(field('Vitesse', h('input', { type: 'range', min: 0.1, max: 4, step: 0.1, value: a.speed ?? 1, 'aria-label': 'Vitesse', oninput: (e) => edit(() => { a.speed = +e.target.value; }, 'ls' + clip.id, { light: true }) }), h('span')));
    } else {
      kids.push(field('Durée', numBox(a.dur ?? 0.5, (v) => edit(() => { a.dur = clamp(v, 0.05, clip.duration); }, null, { light: true }), { step: 0.05, unit: 's', min: 0.05 }), h('span')));
      kids.push(field('Courbe', selectBox(Object.entries(RM.EASINGS).map(([k, v]) => [k, v.label]), a.ease || 'out', (v) => edit(() => { a.ease = v; }, null, { light: true }))));
    }
    return group(title, ...kids);
  }

  function renderInspector() {
    const box = $('.insp'); if (!box) return;
    box.innerHTML = '';
    const f = S.sel && RM.findClip(S.project, S.sel);
    const body = h('div', { class: 'pbody', style: { paddingTop: '10px' } });
    if (isMobile()) box.append(head(f ? 'Réglages du clip' : 'Réglages du projet'));
    box.append(body);
    if (!f) return projectSettings(body);
    const { clip, track } = f;
    const P = clip.props;
    const light = (fn, key) => edit(fn, key ? key + clip.id : null, { light: true });
    const typeLabel = { text: 'Texte', shape: 'Forme', image: 'Image', video: 'Vidéo', audio: 'Son' }[clip.type];
    body.append(h('div', { class: 'row', style: { justifyContent: 'space-between' } },
      h('div', null, h('b', null, clip.name || typeLabel), h('div', { class: 'hint' }, typeLabel + ' · ' + track.name)),
      h('div', { class: 'row', style: { gap: '2px' } },
        h('button', { class: 'ib', title: 'Dupliquer (Ctrl+D)', 'aria-label': 'Dupliquer', onclick: duplicate }, icon('copy')),
        h('button', { class: 'ib', title: 'Supprimer (Suppr)', 'aria-label': 'Supprimer', onclick: removeSel }, icon('trash')))));

    if (clip.type === 'text') body.append(group('Texte',
      h('textarea', { class: 'txt', id: 'text-content', 'aria-label': 'Contenu du texte', value: P.text, oninput: (e) => light(() => { P.text = e.target.value; }, 'tx') , onchange: () => renderTimeline() }),
      field('Police', selectBox(RM.FONTS.map((x) => [x, x]), P.font, (v) => { light(() => { P.font = v; }); RM.loadFonts(S.project).then(requestDraw); })),
      field('Taille', numBox(P.size, (v) => light(() => { P.size = clamp(v, 6, 1200); }), { unit: 'px', min: 6, max: 1200 }), h('span')),
      field('Graisse', selectBox([[300, 'Fine'], [400, 'Normale'], [500, 'Moyenne'], [600, 'Demi-gras'], [700, 'Gras'], [800, 'Très gras'], [900, 'Noir']].map(([v, l]) => [String(v), l]), String(P.weight), (v) => { light(() => { P.weight = +v; }); RM.loadFonts(S.project).then(requestDraw); })),
      field('Couleur', colorBox(P.color, (v) => light(() => { P.color = v; }, 'col'), 'text-color')),
      field('Alignement', seg([['left', 'Gauche'], ['center', 'Centre'], ['right', 'Droite']], P.align, (v) => light(() => { P.align = v; }))),
      field('Interlettre', numBox(P.letterSpacing, (v) => light(() => { P.letterSpacing = v; }), { unit: 'px', step: 0.5 }), h('span')),
      field('Interligne', numBox(P.lineHeight, (v) => light(() => { P.lineHeight = clamp(v, 0.6, 3); }), { step: 0.05 }), h('span')),
      toggleBox('Majuscules', P.uppercase, (v) => light(() => { P.uppercase = v; }), 'text-upper'),
      toggleBox('Ombre portée', P.shadow, (v) => light(() => { P.shadow = v; }), 'text-shadow'),
      toggleBox('Fond derrière le texte', !!P.bg, (v) => { light(() => { P.bg = v ? '#ff1a1a' : ''; }); renderInspector(); }, 'text-bg'),
      P.bg ? field('Couleur du fond', colorBox(P.bg, (v) => light(() => { P.bg = v; }, 'bgc'))) : null,
      P.bg ? field('Marge du fond', numBox(P.bgPad, (v) => light(() => { P.bgPad = clamp(v, 0, 300); }), { unit: 'px' }), h('span')) : null));
    if (clip.type === 'shape') body.append(group('Forme',
      field('Type', seg([['rect', 'Rectangle'], ['circle', 'Cercle'], ['ring', 'Anneau'], ['triangle', 'Triangle']], P.shape, (v) => { light(() => { P.shape = v; if (v === 'ring' && !P.stroke) P.stroke = P.fill || '#ffffff'; }); renderInspector(); })),
      field('Largeur', numBox(P.w, (v) => light(() => { P.w = clamp(v, 1, 8000); }), { unit: 'px', min: 1 }), h('span')),
      field('Hauteur', numBox(P.h, (v) => light(() => { P.h = clamp(v, 1, 8000); }), { unit: 'px', min: 1 }), h('span')),
      P.shape !== 'ring' ? toggleBox('Remplissage', !!P.fill, (v) => { light(() => { P.fill = v ? '#ff1a1a' : ''; }); renderInspector(); }, 'shape-fill') : null,
      P.fill && P.shape !== 'ring' ? field('Couleur', colorBox(P.fill, (v) => light(() => { P.fill = v; }, 'fill'))) : null,
      P.shape === 'ring' ? null : toggleBox('Contour', !!P.stroke, (v) => { light(() => { P.stroke = v ? '#ffffff' : ''; }); renderInspector(); }, 'shape-stroke'),
      P.stroke || P.shape === 'ring' ? field('Contour', colorBox(P.stroke || '#ffffff', (v) => light(() => { P.stroke = v; }, 'stroke'))) : null,
      P.stroke || P.shape === 'ring' ? field('Épaisseur', numBox(P.strokeWidth, (v) => light(() => { P.strokeWidth = clamp(v, 0, 200); }), { unit: 'px' }), h('span')) : null,
      P.shape === 'rect' ? field('Arrondi', numBox(P.radius, (v) => light(() => { P.radius = clamp(v, 0, 2000); }), { unit: 'px' }), h('span')) : null));
    if (clip.type === 'image' || clip.type === 'video') body.append(group(clip.type === 'image' ? 'Image' : 'Vidéo',
      field('Largeur', numBox(P.w, (v) => light(() => { P.w = clamp(v, 10, 8000); }), { unit: 'px', min: 10 }), h('span')),
      field('Arrondi', numBox(P.radius, (v) => light(() => { P.radius = clamp(v, 0, 2000); }), { unit: 'px' }), h('span')),
      clip.type === 'video' ? field('Volume', h('input', { type: 'range', min: 0, max: 1.5, step: 0.01, value: P.volume, 'aria-label': 'Volume', oninput: (e) => light(() => { P.volume = +e.target.value; }, 'vol') }), h('span')) : null));

    if (clip.type === 'audio') {
      const s = P.sfx && S.sfx && S.sfx.sounds.find((x) => x.id === P.sfx);
      body.append(group('Son',
        s ? h('div', { class: 'callout' }, h('b', null, s.name), h('div', null, s.usage || s.description), s.verified ? null : h('div', { style: { color: 'var(--warn)' } }, 'Étiquette pas encore validée à l’écoute.')) : null,
        field('Volume', h('input', { type: 'range', min: 0, max: 2, step: 0.01, value: P.volume, 'aria-label': 'Volume', oninput: (e) => { light(() => { P.volume = +e.target.value; }, 'vol'); e.target.nextSibling.textContent = Math.round(e.target.value * 100) + ' %'; } }), h('span', { class: 'hint' }, Math.round(P.volume * 100) + ' %')),
        field('Fondu début', numBox(P.fadeIn, (v) => light(() => { P.fadeIn = clamp(v, 0, clip.duration); }), { step: 0.05, unit: 's', min: 0 }), h('span')),
        field('Fondu fin', numBox(P.fadeOut, (v) => light(() => { P.fadeOut = clamp(v, 0, clip.duration); }), { step: 0.05, unit: 's', min: 0 }), h('span')),
        s && s.hit_point != null ? h('button', { class: 'btn', onclick: () => { edit(() => { clip.start = Math.max(0, RM.round(S.t - s.hit_point)); }, null); renderInspector(); toast('Impact calé sur ' + RM.fmtTime(S.t, S.project.fps)); } }, icon('magnet'), 'Caler l’impact sur la tête de lecture') : null));
    } else {
      body.append(group('Position', ...RM.KEYABLE.map((n) => keyField(clip, n)),
        h('p', { class: 'hint' }, 'Le losange ajoute une image clé à l’instant de la tête de lecture : la valeur s’anime entre deux images clés. Vous pouvez aussi déplacer l’élément ou l’agrandir par ses coins dans l’aperçu.')));
      body.append(animGroup(clip, 'in'), animGroup(clip, 'out'), animGroup(clip, 'loop'));
    }
    body.append(group('Timing',
      field('Début', numBox(clip.start, (v) => edit(() => { clip.start = Math.max(0, RM.round(v)); }, null), { step: 0.05, unit: 's', min: 0 }), h('span')),
      field('Durée', numBox(clip.duration, (v) => edit(() => { clip.duration = Math.max(0.05, RM.round(v)); }, null), { step: 0.05, unit: 's', min: 0.05 }), h('span'))));
  }

  function projectSettings(body) {
    const p = S.project;
    body.append(
      h('p', { class: 'hint' }, 'Aucun élément sélectionné. Touchez un élément dans l’aperçu ou dans la timeline pour le régler.'),
      group('Projet',
        field('Format', seg(Object.keys(RM.FORMATS).map((k) => [k, k]), p.format, setFormat)),
        field('Images/s', selectBox([['24', '24'], ['25', '25'], ['30', '30'], ['60', '60']], String(p.fps), (v) => edit(() => { p.fps = +v; }, null))),
        h('div', { class: 'callout' }, `${p.width} × ${p.height} px · durée ${fmtS(RM.duration(p))} · ${p.tracks.reduce((a, t) => a + t.clips.length, 0)} éléments`)),
      group('Fond',
        field('Type', seg([['solid', 'Uni'], ['linear', 'Dégradé'], ['radial', 'Radial']], p.bg.type, (v) => { edit(() => { p.bg.type = v; }, null, { light: true }); renderInspector(); })),
        field(p.bg.type === 'solid' ? 'Couleur' : 'Couleur 1', colorBox(p.bg.c1, (v) => edit(() => { p.bg.c1 = v; }, 'bg1', { light: true }), 'bg-c1')),
        p.bg.type !== 'solid' ? field('Couleur 2', colorBox(p.bg.c2, (v) => edit(() => { p.bg.c2 = v; }, 'bg2', { light: true }), 'bg-c2')) : null,
        p.bg.type === 'linear' ? field('Angle', h('input', { type: 'range', min: 0, max: 360, value: p.bg.angle, 'aria-label': 'Angle', oninput: (e) => edit(() => { p.bg.angle = +e.target.value; }, 'bga', { light: true }) }), h('span')) : null),
      group('Raccourcis clavier', h('div', { class: 'hint' }, 'Espace : lecture/pause · S : couper · Ctrl+D : dupliquer · Suppr : supprimer · Ctrl+Z / Ctrl+Maj+Z : annuler/rétablir · ← → : image par image (Maj : 1 s)')),
    );
  }
  function setFormat(fmt) {
    const p = S.project; if (fmt === p.format) return;
    const [w, hh] = RM.FORMATS[fmt], kx = w / p.width, ky = hh / p.height, ks = Math.min(w, hh) / Math.min(p.width, p.height);
    edit(() => {
      for (const t of p.tracks) for (const c of t.clips) {
        if (c.type === 'audio') continue;
        c.props.x = Math.round(c.props.x * kx); c.props.y = Math.round(c.props.y * ky);
        if (c.type === 'text') c.props.size = Math.round(c.props.size * ks);
        if ('w' in c.props && !(c.type === 'shape' && c.props.w === p.width)) c.props.w = Math.round(c.props.w * ks); else if ('w' in c.props) c.props.w = w;
        if (c.type === 'shape') c.props.h = Math.round(c.props.h * ks);
        if (c.keys) { for (const k of c.keys.x || []) k.v *= kx; for (const k of c.keys.y || []) k.v *= ky; }
      }
      p.format = fmt; p.width = w; p.height = hh;
    }, null, { full: true });
    fitCanvas();
  }

  // ---------- transport ----------
  function renderTransport() {
    const tr = $('.transport'); if (!tr) return;
    tr.innerHTML = '';
    tr.append(
      h('span', { class: 'tc', id: 'tc' }, h('b', null, RM.fmtTime(S.t, S.project.fps)), ' / ' + RM.fmtTime(RM.duration(S.project), S.project.fps)),
      h('span', { class: 'grow' }),
      h('button', { class: 'ib', 'aria-label': 'Aller au début', onclick: () => setTime(0) }, icon('start')),
      h('button', { class: 'playbtn', 'aria-label': S.playing ? 'Pause' : 'Lecture', onclick: toggle }, icon(S.playing ? 'pause' : 'play')),
      h('button', { class: 'ib', 'aria-label': 'Aller à la fin', onclick: () => setTime(RM.duration(S.project)) }, icon('end')),
      h('span', { class: 'grow' }),
      selectBox(Object.keys(RM.FORMATS).map((k) => [k, k]), S.project.format, setFormat, 'format-select'),
      h('button', { class: 'ib desk-only', 'aria-label': 'Plein écran', title: 'Plein écran', onclick: () => { const v = $('.viewport'); (v.requestFullscreen ? v.requestFullscreen() : Promise.reject()).catch(() => toast('Le plein écran n’est pas disponible ici.')); } }, icon('expand')));
    const s = $('#format-select'); s.className = 'sel'; s.setAttribute('aria-label', 'Format');
  }

  // ---------- timeline ----------
  let tlEls = {};
  const headW = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--headw')) || 132;
  function renderTimeline() {
    const tl = $('.tl'); if (!tl) return;
    const p = S.project, dur = RM.duration(p), pps = S.pps;
    const sc = tl.querySelector('.tl-scroll'), keepX = sc ? sc.scrollLeft : 0, keepY = sc ? sc.scrollTop : 0;
    tl.innerHTML = '';
    const f = S.sel && RM.findClip(p, S.sel);
    tl.append(h('div', { class: 'tl-tools' },
      h('button', { class: 'ib', title: 'Annuler', 'aria-label': 'Annuler', disabled: !S.undo.length, onclick: undo }, icon('undo')),
      h('button', { class: 'ib', title: 'Rétablir', 'aria-label': 'Rétablir', disabled: !S.redo.length, onclick: redo }, icon('redo')),
      h('button', { class: 'ib', title: 'Couper à la tête de lecture (S)', 'aria-label': 'Couper', disabled: !f || S.t <= f.clip.start || S.t >= f.clip.start + f.clip.duration, onclick: splitSel }, icon('split')),
      h('button', { class: 'ib', title: 'Dupliquer (Ctrl+D)', 'aria-label': 'Dupliquer', disabled: !f, onclick: duplicate }, icon('copy')),
      h('button', { class: 'ib', title: 'Supprimer (Suppr)', 'aria-label': 'Supprimer', disabled: !f, onclick: removeSel }, icon('trash')),
      h('span', { class: 'vsep', style: { margin: '0 4px' } }),
      h('button', { class: 'ib' + (S.snap ? ' on' : ''), title: 'Magnétisme', 'aria-label': 'Magnétisme', 'aria-pressed': String(S.snap), onclick: () => { S.snap = !S.snap; renderTimeline(); } }, icon('magnet')),
      h('button', { class: 'ib', title: 'Dézoomer', 'aria-label': 'Dézoomer', onclick: () => zoom(1 / 1.4) }, icon('zout')),
      h('button', { class: 'ib', title: 'Zoomer', 'aria-label': 'Zoomer', onclick: () => zoom(1.4) }, icon('zin')),
      h('span', { class: 'tc' }, RM.fmtTime(S.t, p.fps)),
      h('span', { class: 'grow' })));
    const scroll = h('div', { class: 'tl-scroll' });
    const hw = headW();
    const width = Math.max(dur + 6, (tl.clientWidth || 800) / pps) * pps;
    const inner = h('div', { class: 'tl-inner', style: { width: hw + width + 'px' } });
    // règle
    const steps = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60]; const step = steps.find((s) => s * pps >= 64) || 60;
    const ticks = h('div', { class: 'ticks', style: { width: width + 'px', '--minor': (step * pps) / 4 + 'px' } });
    ticks.style.setProperty('--minor', (step * pps) / 4 + 'px');
    for (let t = 0; t <= width / pps; t += step) ticks.append(h('span', { style: { left: t * pps + 'px' } }, t >= 60 ? `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}` : (Math.round(t * 100) / 100).toLocaleString('fr-FR') + ' s'));
    scrubber(ticks);
    inner.append(h('div', { class: 'tl-ruler' }, h('div', { class: 'corner' }), ticks));
    for (const tr of p.tracks) inner.append(trackRow(tr, width));
    inner.append(h('div', { class: 'addtrk' },
      h('button', { class: 'btn ghost', onclick: () => edit((pp) => pp.tracks.unshift({ id: RM.uid('t'), kind: 'visual', name: 'Calque ' + (pp.tracks.filter((t) => t.kind === 'visual').length + 1), hidden: false, muted: false, clips: [] }), null) }, icon('plus'), 'Calque'),
      h('button', { class: 'btn ghost', onclick: () => edit((pp) => pp.tracks.push({ id: RM.uid('t'), kind: 'audio', name: 'Sons ' + (pp.tracks.filter((t) => t.kind === 'audio').length + 1), hidden: false, muted: false, clips: [] }), null) }, icon('plus'), 'Piste son')));
    const ph = h('div', { class: 'playhead' });
    inner.append(ph);
    scroll.append(inner);
    tl.append(scroll);
    scroll.scrollLeft = keepX; scroll.scrollTop = keepY;
    scroll.addEventListener('wheel', (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); } }, { passive: false });
    inner.addEventListener('pointerdown', (e) => { if (e.target.classList.contains('lane')) { if (S.sel) select(null); } });
    tlEls = { scroll, inner, ph, hw };
    updatePlayhead();
  }
  function zoom(f) {
    const sc = tlEls.scroll, hw = tlEls.hw;
    const center = sc ? (sc.scrollLeft + sc.clientWidth / 2 - hw) / S.pps : S.t;
    S.pps = clamp(S.pps * f, 15, 600);
    renderTimeline();
    if (tlEls.scroll) tlEls.scroll.scrollLeft = center * S.pps + hw - tlEls.scroll.clientWidth / 2;
  }
  function updatePlayhead(follow) {
    if (tlEls.ph) {
      const x = tlEls.hw + S.t * S.pps;
      tlEls.ph.style.left = x - 1 + 'px';
      if (follow && tlEls.scroll) { const sc = tlEls.scroll; if (x > sc.scrollLeft + sc.clientWidth - 40 || x < sc.scrollLeft + tlEls.hw) sc.scrollLeft = x - tlEls.hw - 40; }
    }
    const tc = $('#tc'); if (tc) tc.firstChild.textContent = RM.fmtTime(S.t, S.project.fps);
    const tt = $('.tl-tools .tc'); if (tt) tt.textContent = RM.fmtTime(S.t, S.project.fps);
  }
  function scrubber(el) {
    let on = false;
    const at = (e) => { const r = el.getBoundingClientRect(); return (e.clientX - r.left) / S.pps; };
    el.addEventListener('pointerdown', (e) => { on = true; el.setPointerCapture(e.pointerId); setTime(snapTime(at(e), null, true)); });
    el.addEventListener('pointermove', (e) => { if (on) setTime(snapTime(at(e), null, true)); });
    el.addEventListener('pointerup', () => { on = false; renderTimeline(); });
  }
  function snapPoints(exclude) {
    const pts = [0, S.t];
    for (const tr of S.project.tracks) for (const c of tr.clips) {
      if (c.id === exclude) continue;
      pts.push(c.start, c.start + c.duration);
      const s = c.props.sfx && S.sfx && S.sfx.sounds.find((x) => x.id === c.props.sfx);
      if (s && s.hit_point != null) pts.push(c.start + s.hit_point);
    }
    return pts;
  }
  function snapTime(t, exclude, noPlayhead) {
    if (!S.snap) return Math.max(0, t);
    const th = 8 / S.pps; let best = t, bd = th;
    for (const pnt of snapPoints(exclude)) { if (noPlayhead && pnt === S.t) continue; const d = Math.abs(pnt - t); if (d < bd) { bd = d; best = pnt; } }
    return Math.max(0, best);
  }
  function trackRow(tr, width) {
    const kind = tr.kind;
    const hasClips = tr.clips.length > 0;
    let confirm = false;
    const del = h('button', { class: 'ib del', title: 'Supprimer la piste', 'aria-label': 'Supprimer la piste ' + tr.name, onclick: () => {
      if (hasClips && !confirm) { confirm = true; del.classList.add('confirm'); del.title = 'Cliquer encore : la piste et ses éléments seront supprimés'; return; }
      edit((p) => { p.tracks = p.tracks.filter((t) => t.id !== tr.id); }, null, { full: true });
    } }, icon('trash'));
    const head = h('div', { class: 'trk-head' },
      icon(kind === 'audio' ? 'sound' : 'media', 'ico'),
      h('b', { title: tr.name }, tr.name),
      kind === 'audio'
        ? h('button', { class: 'ib', 'aria-label': tr.muted ? 'Réactiver le son' : 'Couper le son', title: tr.muted ? 'Réactiver' : 'Couper le son', onclick: () => edit(() => { tr.muted = !tr.muted; }, null) }, icon(tr.muted ? 'mute' : 'vol'))
        : h('button', { class: 'ib', 'aria-label': tr.hidden ? 'Afficher le calque' : 'Masquer le calque', title: tr.hidden ? 'Afficher' : 'Masquer', onclick: () => edit(() => { tr.hidden = !tr.hidden; }, null) }, icon(tr.hidden ? 'eyeoff' : 'eye')),
      del);
    const lane = h('div', { class: 'lane', style: { width: width + 'px' } });
    for (const c of tr.clips) lane.append(clipEl(c, tr));
    return h('div', { class: 'trk ' + kind + (tr.hidden || tr.muted ? ' hid' : ''), 'data-track': tr.id }, head, lane);
  }
  function clipLabel(c) {
    if (c.type === 'text') return c.props.text.split('\n')[0] || 'Texte';
    if (c.type === 'audio') { const s = c.props.sfx && S.sfx && S.sfx.sounds.find((x) => x.id === c.props.sfx); return s ? s.name : c.name || 'Son'; }
    return c.name || { shape: 'Forme', image: 'Image', video: 'Vidéo' }[c.type];
  }
  function clipEl(c, tr) {
    const pps = S.pps;
    const el = h('div', { class: 'clip ' + c.type + (c.id === S.sel ? ' sel' : ''), style: { left: c.start * pps + 'px', width: Math.max(6, c.duration * pps) + 'px' }, title: clipLabel(c) });
    if (c.type === 'audio') {
      const peaks = RM.audio.peaks.get(c.props.src);
      if (!peaks) RM.audio.load(c.props.src).then(() => { if (RM.audio.peaks.get(c.props.src)) renderTimeline(); });
      else {
        const w = Math.min(4000, Math.max(6, Math.round(c.duration * pps))), cvs = h('canvas', { width: w, height: 40 });
        const g = cvs.getContext('2d'); g.fillStyle = '#d6ffe5';
        const startI = Math.floor((c.props.in || 0) * 100);
        for (let x = 0; x < w; x++) { const i = startI + Math.floor((x / w) * c.duration * 100); const v = peaks[i] || 0; const hh = Math.max(1, v * 38 * (c.props.volume ?? 1)); g.fillRect(x, 20 - hh / 2, 1, hh); }
        el.append(cvs);
      }
      const s = c.props.sfx && S.sfx && S.sfx.sounds.find((x) => x.id === c.props.sfx);
      if (s && s.hit_point != null && s.hit_point > 0.02) el.append(h('div', { class: 'hit', style: { left: (s.hit_point - (c.props.in || 0)) * pps + 'px' }, title: 'Impact' }));
    }
    el.append(h('div', { class: 'lbl' }, icon({ text: 'text', shape: 'shapes', image: 'image', video: 'video', audio: 'sound' }[c.type]), clipLabel(c)));
    if (c.id === S.sel && c.keys) {
      const ts = new Set(); for (const arr of Object.values(c.keys)) for (const k of arr) ts.add(k.t);
      for (const t of ts) el.append(h('div', { class: 'kd', style: { left: t * pps + 'px' }, title: 'Image clé à ' + fmtS(t), onpointerdown: (e) => { e.stopPropagation(); setTime(c.start + t); renderInspector(); } }));
    }
    const hl = h('div', { class: 'hdl l' }), hr = h('div', { class: 'hdl r' });
    el.append(hl, hr);
    dragClip(el, c, 'move'); dragClip(hl, c, 'l'); dragClip(hr, c, 'r');
    return el;
  }
  function dragClip(handle, c, mode) {
    handle.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      e.stopPropagation();
      const clipEl = mode === 'move' ? handle : handle.parentNode;
      const touch = e.pointerType === 'touch';
      if (S.sel !== c.id) { select(c.id); if (touch || mode !== 'move') return; }
      const x0 = e.clientX, start0 = c.start, dur0 = c.duration, in0 = c.props.in || 0, keys0 = c.keys ? RM.clone(c.keys) : null;
      const buf = c.type === 'audio' ? RM.audio.buffers.get(c.props.src) : null;
      const vid = c.type === 'video' ? RM.getVideo(c).v : null;
      const maxLen = buf ? buf.duration : vid && vid.duration ? vid.duration : Infinity;
      let moved = false, snapEl = null;
      const target = handle;
      target.setPointerCapture(e.pointerId);
      const showSnap = (t) => { if (!snapEl) { snapEl = h('div', { class: 'snapline' }); tlEls.inner.append(snapEl); } snapEl.style.left = tlEls.hw + t * S.pps + 'px'; };
      const move = (ev) => {
        const dt = (ev.clientX - x0) / S.pps;
        if (!moved && Math.abs(ev.clientX - x0) < 3 && mode === 'move' && Math.abs(ev.clientY - e.clientY) < 6) return;
        moved = true;
        const f = RM.findClip(S.project, c.id); if (!f) return;
        const clip = f.clip;
        edit(() => {
          if (mode === 'move') {
            let ns = Math.max(0, start0 + dt);
            const s1 = snapTime(ns, c.id), s2 = snapTime(ns + dur0, c.id) - dur0;
            const sfx = clip.props.sfx && S.sfx && S.sfx.sounds.find((x) => x.id === clip.props.sfx);
            const hp = sfx && sfx.hit_point != null ? snapTime(ns + sfx.hit_point, c.id) - sfx.hit_point : null;
            let snapped = null;
            if (S.snap) {
              const cands = [[s1, s1], [s2, s2 + dur0]]; if (hp != null) cands.unshift([hp, hp + sfx.hit_point]);
              for (const [v, line] of cands) if (Math.abs(v - ns) > 1e-6 && Math.abs(v - ns) < 8 / S.pps) { ns = v; snapped = line; break; }
            }
            clip.start = RM.round(Math.max(0, ns));
            if (snapped != null) showSnap(snapped); else if (snapEl) { snapEl.remove(); snapEl = null; }
            // changement de piste
            const row = document.elementsFromPoint(ev.clientX, ev.clientY).find((n) => n.classList && n.classList.contains('trk'));
            if (row && row.dataset.track !== f.track.id) {
              const nt = S.project.tracks.find((t) => t.id === row.dataset.track);
              if (nt && nt.kind === f.track.kind) { f.track.clips = f.track.clips.filter((x) => x.id !== c.id); nt.clips.push(clip); row.querySelector('.lane').append(clipEl); }
            }
          } else if (mode === 'l') {
            const minStart = clip.type === 'audio' || clip.type === 'video' ? start0 - in0 : 0;
            const ns = clamp(snapTime(start0 + dt, c.id), Math.max(0, minStart), start0 + dur0 - 0.05);
            const d = ns - start0;
            clip.start = RM.round(ns); clip.duration = RM.round(dur0 - d);
            if (clip.type === 'audio' || clip.type === 'video') clip.props.in = RM.round(in0 + d);
            if (keys0) { clip.keys = {}; for (const [k, arr] of Object.entries(keys0)) clip.keys[k] = arr.map((kf) => ({ ...kf, t: RM.round(kf.t - d) })); }
          } else {
            const ne = snapTime(start0 + dur0 + dt, c.id);
            clip.duration = RM.round(clamp(ne - start0, 0.05, maxLen - in0));
          }
        }, 'drag:' + c.id + mode, { light: true });
        clipEl.style.left = clip.start * S.pps + 'px'; clipEl.style.width = Math.max(6, clip.duration * S.pps) + 'px';
      };
      const up = () => {
        target.removeEventListener('pointermove', move); target.removeEventListener('pointerup', up); target.removeEventListener('pointercancel', up);
        if (snapEl) snapEl.remove();
        if (moved) { renderTimeline(); renderInspector(); renderTransport(); }
      };
      target.addEventListener('pointermove', move); target.addEventListener('pointerup', up); target.addEventListener('pointercancel', up);
    });
  }

  // ---------- actions ----------
  function removeSel() {
    if (!S.sel) return;
    const id = S.sel; S.sel = null;
    edit((p) => { for (const t of p.tracks) t.clips = t.clips.filter((c) => c.id !== id); }, null, { full: true });
  }
  function duplicate() {
    const f = S.sel && RM.findClip(S.project, S.sel); if (!f) return;
    const c = RM.clone(f.clip); c.id = RM.uid('c'); c.start = RM.round(f.clip.start + f.clip.duration);
    edit(() => placeClip(c, f.track.id), null);
    select(c.id);
  }
  function splitSel() {
    const f = S.sel && RM.findClip(S.project, S.sel); if (!f) return;
    const c = f.clip, at = RM.round(S.t - c.start);
    if (at <= 0.02 || at >= c.duration - 0.02) { toast('Placez la tête de lecture à l’intérieur du clip pour le couper.'); return; }
    const b = RM.clone(c); b.id = RM.uid('c'); b.start = RM.round(S.t); b.duration = RM.round(c.duration - at);
    if (c.type === 'audio' || c.type === 'video') b.props.in = RM.round((c.props.in || 0) + at);
    if (c.keys) {
      for (const k of RM.KEYABLE) if (b.keys[k]) { const v = RM.prop(c, k, at); b.keys[k] = [{ t: 0, v, e: 'smooth' }, ...b.keys[k].filter((x) => x.t > at).map((x) => ({ ...x, t: RM.round(x.t - at) }))]; }
    }
    edit(() => {
      if (c.keys) for (const k of RM.KEYABLE) if (c.keys[k]) { const v = RM.prop(c, k, at); c.keys[k] = [...c.keys[k].filter((x) => x.t < at), { t: at, v, e: 'smooth' }]; }
      c.duration = at;
      if (c.anim) { b.anim.in = { ...b.anim.in, type: 'none' }; c.anim.out = { ...c.anim.out, type: 'none' }; }
      f.track.clips.push(b);
    }, null);
    select(b.id);
  }

  // ---------- export ----------
  async function saveFile(name, data) {
    if (S.downloads) {
      try { await S.downloads.save({ filename: name, data }); toast('Fichier prêt : ' + name); return true; }
      catch (e) { if (e && e.code === 'declined') return false; if (!['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(e && e.code)) { toast('Enregistrement impossible (' + (e.code || 'erreur') + ').'); return false; } }
    }
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
    const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  }
  RM.saveFile = saveFile;
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'projet';
  function openExport() {
    pause();
    const fmt = RM.pickMime();
    const bg = h('div', { class: 'modal-bg', onclick: (e) => { if (e.target === bg && !busy) bg.remove(); } });
    let busy = false, ctl = null;
    const status = h('div', { hidden: true }, h('div', { class: 'bar' }, h('i')), h('p', { class: 'hint', style: { marginTop: '8px' } }, ''));
    const setProg = (v, msg) => { status.hidden = false; status.querySelector('i').style.width = Math.round(v * 100) + '%'; status.querySelector('p').textContent = msg; };
    const name = slug(S.project.name);
    const opts = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      h('button', { class: 'opt', disabled: !fmt, onclick: async () => {
        if (busy) return; busy = true; opts.hidden = true; ctl = new AbortController();
        cancel.textContent = 'Arrêter l’export';
        try {
          setProg(0, 'Préparation des médias…');
          const r = await RM.exportVideo(S.project, { signal: ctl.signal, onProgress: (v) => setProg(v, `Enregistrement en temps réel : ${Math.round(v * 100)} % — gardez cet onglet ouvert et visible.`) });
          if (!r) { setProg(0, 'Export arrêté.'); }
          else { setProg(1, `Vidéo prête (${(r.blob.size / 1048576).toFixed(1)} Mo).`); await saveFile(`${name}.${r.ext}`, r.blob); }
        } catch (e) { setProg(0, e.message || 'L’export a échoué.'); }
        busy = false; cancel.textContent = 'Fermer'; opts.hidden = false;
      } }, h('span', { class: 'ib', style: { background: 'var(--red)', color: '#fff' } }, icon('film')),
        h('span', null, h('b', null, fmt ? `Vidéo ${fmt.ext.toUpperCase()} avec le son` : 'Vidéo indisponible'),
          h('small', null, fmt ? `${S.project.width} × ${S.project.height}, ${S.project.fps} images/s, ${fmtS(RM.duration(S.project))}. L’export se fait en temps réel.` : 'Ce navigateur ne sait pas enregistrer de vidéo. Essayez Chrome, Edge ou Safari récent.'))),
      h('button', { class: 'opt', onclick: async () => { const b = await RM.snapshot(S.project, S.t, S.project.width); await saveFile(`${name}-${RM.fmtTime(S.t, S.project.fps).replace(/:/g, '-')}.png`, b); } },
        h('span', { class: 'ib', style: { background: 'var(--raise-2)' } }, icon('image')),
        h('span', null, h('b', null, 'Image PNG de l’instant affiché'), h('small', null, `Image à ${RM.fmtTime(S.t, S.project.fps)}, pleine définition.`))),
      h('button', { class: 'opt', onclick: () => saveFile(`${name}.json`, new Blob([JSON.stringify(S.project, null, 2)], { type: 'application/json' })) },
        h('span', { class: 'ib', style: { background: 'var(--raise-2)' } }, icon('json')),
        h('span', null, h('b', null, 'Projet (.json)'), h('small', null, 'Pour le sauvegarder, le réimporter ou le transmettre à Claude dans une session de code.'))));
    const cancel = h('button', { class: 'btn ghost', onclick: () => { if (busy && ctl) ctl.abort(); else bg.remove(); } }, 'Fermer');
    bg.append(h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Exporter' }, h('h2', null, 'Exporter'), opts, status, h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, cancel)));
    document.body.append(bg);
  }

  // ---------- notifications ----------
  let toastTimer;
  function toast(msg, action, fn) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = h('div', { class: 'toast', role: 'status' }, msg, action ? h('button', { onclick: () => { t.remove(); fn(); } }, action) : null);
    document.body.append(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), action ? 6000 : 2600);
  }
  RM.toast = toast;

  // ---------- clavier ----------
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable) return;
    const mod = e.ctrlKey || e.metaKey;
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    else if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { if (S.sel) { e.preventDefault(); removeSel(); } }
    else if (e.key.toLowerCase() === 's' && !mod) { e.preventDefault(); splitSel(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const st = e.shiftKey ? 1 : 1 / S.project.fps; setTime(S.t + (e.key === 'ArrowLeft' ? -st : st)); renderTimeline(); }
    else if (e.key === 'Home') setTime(0);
    else if (e.key === 'Escape') select(null);
  });

  // ---------- démarrage ----------
  async function detectRoot() {
    for (const root of ['', '../']) {
      try { const r = await fetch(root + 'sfx/catalog.json', { cache: 'no-cache' }); if (r.ok) { RM.ROOT = root; return await r.json(); } } catch (e) { /* suivant */ }
    }
    return null;
  }
  RM.app = {
    get project() { return S.project; }, get time() { return S.t; }, get selected() { return S.sel; }, get sfx() { return S.sfx; },
    get chat() { return S.chat; }, frame: (w = 1024) => RM.snapshot(S.project, S.t, w, 'image/jpeg', 0.85),
  };
  async function boot() {
    S.sfx = await detectRoot();
    shell();
    renderAll();
    RM.preload(S.project).then(() => { requestDraw(); renderTimeline(); });
    RM.chat && RM.chat.init();
    renderSideTabs(); renderInspector();
    const mode = await store.init();
    try { S.projects = await store.list(); } catch (e) { S.projects = []; }
    if (S.projects.length && S.unsaved) await openProject(S.projects[0].id);
    renderAll();
    if (mode === 'cloud') toast('Projets synchronisés');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
