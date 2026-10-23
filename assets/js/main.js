// REMP'ART — interactions, motion design et orchestration des scènes 3D.
import { createHero } from './hero-scene.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const WHATSAPP = '2250100511733';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Affiches utilisées dans la scène 3D du hero (ratio = largeur / hauteur)
const HERO_IMAGES = [
  ['parfum-arta', 0.68], ['mercedes-amg', 0.85], ['yaki', 0.85], ['betsaleel', 0.85], ['alloco-spice', 0.68],
  ['vih-sida', 0.85], ['octobre-rose', 0.85], ['travaux-publics', 0.68], ['accessoires-bureau', 0.68],
].map(([name, ratio]) => ({ src: `assets/img/portfolio/${name}-sm.webp`, ratio }));

$('[data-year]').textContent = new Date().getFullYear();
document.body.classList.add('is-loading');

// ---------------------------------------------------------------- Défilement doux
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
function scrollToTarget(target) {
  if (lenis) { lenis.start(); lenis.scrollTo(target, { offset: 0, duration: 1.6 }); }
  else document.querySelector(target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !document.querySelector(id)) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(id);
  });
});

// ---------------------------------------------------------------- Menu mobile
const toggle = $('.nav__toggle');
const menu = $('#menu');
function closeMenu() {
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
}
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});

// ---------------------------------------------------------------- Navigation & progression
const nav = $('[data-nav]');
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate(self) {
    const y = self.scroll();
    nav.classList.toggle('is-solid', y > 80);
    nav.classList.toggle('is-hidden', self.direction === 1 && y > 400 && !menu.classList.contains('is-open'));
    $('.progress').style.transform = `scaleX(${self.progress})`;
  },
});

// ---------------------------------------------------------------- Texte découpé
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map((w) => `<span class="split-line" aria-hidden="true"><span class="split-word">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`).join(' ');
  return $$('.split-word', el);
}
if (!reduced) {
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
}

// ---------------------------------------------------------------- HERO
const heroCanvas = $('.hero__canvas');
let hero = null;
try {
  hero = createHero(heroCanvas, HERO_IMAGES);
  hero.start();
} catch (err) {
  console.warn('WebGL indisponible, affichage de secours.', err);
  document.documentElement.classList.add('no-webgl');
}

const chapters = $$('.hero__chapters span');
function setChapter(i) { chapters.forEach((c, k) => c.classList.toggle('is-active', k === i)); }

if (!reduced) {
  const proxy = { p: 0 };
  const split = hero ? hero.SPLIT : 0.56;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: () => '+=' + window.innerHeight * 5,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate(self) {
        const p = self.progress;
        setChapter(p < split * 0.8 ? 0 : p < split + 0.03 ? 1 : 2);
      },
      onLeave: () => hero && hero.stop(),
      onEnterBack: () => hero && hero.start(),
    },
  });
  tl.to(proxy, { p: 1, duration: 1, onUpdate: () => hero && hero.setProgress(proxy.p) }, 0);
  tl.to('.hero__intro', { opacity: 0, y: -80, duration: 0.07 }, 0.03);
  tl.fromTo('.hero__caption--a', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.05 }, 0.12)
    .to('.hero__caption--a', { opacity: 0, y: -40, duration: 0.05 }, 0.25);
  tl.fromTo('.hero__caption--b', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.05 }, 0.33)
    .to('.hero__caption--b', { opacity: 0, y: -40, duration: 0.04 }, 0.47);
  tl.to('.hero__flash', { opacity: 1, duration: 0.035 }, split - 0.04)
    .to('.hero__flash', { opacity: 0, duration: 0.05 }, split + 0.005);
  $$('.hero__words li').forEach((li, i) => {
    const at = split + 0.04 + i * 0.055;
    tl.fromTo(li, { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 0.025, ease: 'power2.out' }, at)
      .to(li, { opacity: 0, scale: 1.9, duration: 0.03, ease: 'power2.in' }, at + 0.03);
  });
  tl.to('.hero__hud .hero__scroll', { opacity: 0, duration: 0.03 }, 0.9);
  tl.to('.hero__final', { autoAlpha: 1, duration: 0.02 }, 0.9)
    .from('.hero__final .line > span', { yPercent: 110, duration: 0.05, stagger: 0.012, ease: 'power3.out' }, 0.9)
    .from('.hero__final .eyebrow, .hero__final .hero__lead, .hero__final .actions', { opacity: 0, y: 30, duration: 0.05, stagger: 0.01 }, 0.92);
} else {
  gsap.set('.hero__intro', { opacity: 1 });
}

// ---------------------------------------------------------------- Préchargement
function runLoader() {
  const counter = { v: 0 };
  const out = $('[data-count]');
  const ready = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
    setTimeout(resolve, 3500);
  });
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const count = gsap.to(counter, { v: 92, duration: reduced ? 0.1 : 1.6, ease: 'power2.out', onUpdate: () => { out.textContent = Math.round(counter.v); } });
  Promise.all([ready, fonts, count]).then(() => {
    gsap.to(counter, { v: 100, duration: 0.25, onUpdate: () => { out.textContent = Math.round(counter.v); } });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to('.loader__inner', { y: -40, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to('.loader', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
      .set('.loader', { display: 'none' })
      .add(() => {
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      })
      .from('.hero__intro .line > span', { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.1 }, '-=0.7')
      .from('.hero__intro .eyebrow, .hero__intro .hero__lead', { opacity: 0, y: 30, duration: 1, ease: 'expo.out', stagger: 0.1 }, '-=1')
      .from('.nav, .hero__hud', { opacity: 0, y: -20, duration: 0.8, ease: 'power2.out' }, '-=0.9');
  });
}
runLoader();

// ---------------------------------------------------------------- Bandeau défilant
(() => {
  const track = $('.ticker__track');
  track.innerHTML += track.innerHTML;
  if (reduced) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    trigger: '.ticker',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate(self) {
      const v = Math.min(Math.abs(self.getVelocity()) / 400, 5);
      gsap.to(loop, { timeScale: (self.direction === -1 ? -1 : 1) * (1 + v), duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: self.direction === -1 ? -1 : 1, duration: 1.2, delay: 0.2 });
    },
  });
})();

// ---------------------------------------------------------------- Services : aperçu qui suit le curseur
(() => {
  const preview = $('.services__preview');
  const img = $('img', preview);
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
  const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: 'power3' });
  let lastX = 0;
  $$('.service').forEach((row) => {
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.addEventListener('mouseenter', () => {
      img.src = row.dataset.preview;
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
    });
    row.addEventListener('mouseleave', () => gsap.to(preview, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power2.in' }));
    const choose = () => { selectService(row.dataset.service); scrollToTarget('#commande'); };
    row.addEventListener('click', choose);
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
  });
  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX + 30);
    yTo(e.clientY - 150);
    rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
  }, { passive: true });
  if (!reduced) {
    gsap.from('.service', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.services__list', start: 'top 80%' } });
  }
})();

// ---------------------------------------------------------------- Approche : le tracé à la plume
(() => {
  const path = $('.approach__curve');
  if (!path || reduced) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.approach__track', start: 'top 80%', end: 'bottom 70%', scrub: 1 } });
  tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
  $$('.approach__anchors rect').forEach((r, i) => {
    tl.from(r, { scale: 0, transformOrigin: 'center', duration: 0.12, ease: 'back.out(3)' }, i * 0.45);
  });
  gsap.from('.step', { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: '.approach__steps', start: 'top 85%' } });
})();

// ---------------------------------------------------------------- Réalisations : galerie horizontale
const mm = gsap.matchMedia();
mm.add('(min-width: 861px)', () => {
  if (reduced) return;
  const row = $('.work__row');
  const amount = () => row.scrollWidth - window.innerWidth;
  const scroller = gsap.to(row, {
    x: () => -amount(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.work',
      start: 'top top',
      end: () => '+=' + amount(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set('.work__bar span', { scaleX: self.progress }),
    },
  });
  $$('.card .card__media img').forEach((img) => {
    gsap.fromTo(img, { xPercent: -4 }, {
      xPercent: 4, ease: 'none',
      scrollTrigger: { trigger: img.closest('.card'), containerAnimation: scroller, start: 'left right', end: 'right left', scrub: true },
    });
  });
  gsap.from('.card', {
    y: 140, rotate: 4, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '.work', start: 'top 60%' },
  });
});

// ---------------------------------------------------------------- Lightbox
(() => {
  const dialog = $('.lightbox');
  const cards = $$('.card[data-index]');
  const field = (k) => $(`[data-lb="${k}"]`, dialog);
  let current = 0;
  function show(i) {
    current = (i + cards.length) % cards.length;
    const d = cards[current].dataset;
    const img = $('.lightbox__media img', dialog);
    img.src = d.img;
    img.alt = $('img', cards[current]).alt;
    field('title').textContent = d.title;
    field('cat').textContent = d.cat;
    field('brief').textContent = d.brief;
    field('answer').textContent = d.answer;
    field('count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    field('order').dataset.service = d.service;
    if (!reduced) gsap.fromTo([img, $('.lightbox__info', dialog)], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 });
  }
  cards.forEach((card, i) => $('.card__btn', card).addEventListener('click', () => {
    show(i);
    dialog.showModal();
    if (lenis) lenis.stop();
  }));
  dialog.addEventListener('close', () => { if (lenis) lenis.start(); });
  $('[data-lb-close]', dialog).addEventListener('click', () => dialog.close());
  $('[data-lb-prev]', dialog).addEventListener('click', () => show(current - 1));
  $('[data-lb-next]', dialog).addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  let touchX = null;
  dialog.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  field('order').addEventListener('click', (e) => {
    e.preventDefault();
    selectService(field('order').dataset.service);
    dialog.close();
    scrollToTarget('#commande');
  });
})();

// ---------------------------------------------------------------- Le fondateur : avatar 3D
(() => {
  const section = $('#fondateur');
  const canvas = $('.founder__canvas');
  const label = $('[data-pose-label]');
  const buttons = $$('.founder__poses button');
  let avatar = null, loading = null, visible = false;

  function onPose(name, text) {
    buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.pose === name));
    if (label.textContent === text) return;
    gsap.timeline()
      .to(label, { yPercent: -100, opacity: 0, duration: 0.25, ease: 'power2.in' })
      .add(() => { label.textContent = text; })
      .fromTo(label, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
  }
  function load() {
    if (loading) return loading;
    loading = import('./avatar.js').then(({ createAvatar }) => {
      try {
        avatar = createAvatar(canvas, { onPose });
        if (visible) avatar.start();
      } catch (err) {
        console.warn('Avatar 3D indisponible.', err);
        $('.founder__canvas-wrap').classList.add('is-fallback');
      }
    });
    return loading;
  }
  new IntersectionObserver((entries) => {
    for (const e of entries) {
      visible = e.isIntersecting;
      if (visible) { load(); if (avatar) avatar.start(); } else if (avatar) avatar.stop();
    }
  }, { rootMargin: '300px 0px' }).observe($('.founder__canvas-wrap'));
  buttons.forEach((b) => b.addEventListener('click', () => { load().then(() => avatar && avatar.setPose(b.dataset.pose)); }));

  if (reduced) return;
  gsap.fromTo('.founder__bg', { xPercent: 5 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.founder__photo-frame img', { clipPath: 'inset(100% 0 0 0)', scale: 1.25, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.founder__photo', start: 'top 80%' } });
  gsap.from('.founder__photo-frame .h', { scale: 0, duration: 0.5, ease: 'back.out(3)', stagger: 0.08, delay: 0.4, scrollTrigger: { trigger: '.founder__photo', start: 'top 80%' } });
  gsap.from('.founder__canvas-wrap', { clipPath: 'inset(12% 12% 12% 12% round 28px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.founder__stage', start: 'top 80%' } });
  const sig = $$('.founder__sig path');
  sig.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
  gsap.timeline({ scrollTrigger: { trigger: '.founder__quote', start: 'top 80%' } })
    .to(sig, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.25 })
    .from('.founder__sig rect', { scale: 0, transformOrigin: 'center', duration: 0.4, ease: 'back.out(4)' });
})();

// ---------------------------------------------------------------- Formulaire → WhatsApp
function selectService(value) {
  const input = $$('input[name="service"]').find((i) => i.value === value);
  if (input) input.checked = true;
}
$('#orderForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = new FormData(this);
  const msg = $('.order__msg');
  let ok = true;
  for (const name of ['name', 'contact', 'details']) {
    const el = this.elements[name];
    const bad = !String(data.get(name) || '').trim();
    el.classList.toggle('is-invalid', bad);
    if (bad) ok = false;
  }
  const chips = $('.chips', this);
  chips.classList.toggle('is-invalid', !data.get('service'));
  if (!data.get('service')) ok = false;
  if (!ok) {
    msg.textContent = 'Merci de remplir les champs marqués d’un astérisque.';
    msg.style.color = 'var(--red)';
    if (!reduced) gsap.fromTo(this, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    return;
  }
  msg.textContent = 'WhatsApp s’ouvre avec votre message prêt à envoyer.';
  msg.style.color = '';
  const text = [
    "Bonjour REMP'ART, je souhaite demander une prestation.", '',
    'Nom : ' + data.get('name'),
    'Contact : ' + data.get('contact'),
    'Service : ' + data.get('service'),
    'Budget indicatif : ' + data.get('budget'),
    'Délai souhaité : ' + data.get('deadline'), '',
    'Description du projet :', data.get('details'),
  ].join('\n');
  window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
});

// ---------------------------------------------------------------- Curseur & boutons magnétiques
if (finePointer && !reduced) {
  const cursor = $('.cursor');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); cursor.style.opacity = 1; }, { passive: true });
  document.addEventListener('pointerleave', () => { cursor.style.opacity = 0; });
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    cursor.classList.toggle('is-view', !!t.closest('.card__btn'));
    cursor.classList.toggle('is-link', !t.closest('.card__btn') && !!t.closest('a, button, .service, input, select, textarea, label'));
  });

  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

// Les images chargées tardivement peuvent changer les hauteurs
window.addEventListener('load', () => ScrollTrigger.refresh());
