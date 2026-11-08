/* REMP'ART Motion — discussion avec Claude pour modifier le montage. */
(function () {
  'use strict';
  const RM = window.RM, h = RM.h, icon = RM.icon;
  const MODEL = 'claude-opus-5-5'; // modèle demandé par l'utilisateur

  const SUGGESTIONS = [
    'Ajoute un whoosh sur chaque texte qui entre en glissant',
    'Fais une version 9:16 pour les réseaux sociaux',
    'Rends l’intro plus percutante',
    'Ajoute un titre « 24/7 » à 4 s avec un impact',
  ];
  const ERRORS = {
    not_granted: 'Ce studio n’a pas l’autorisation d’utiliser Claude. Rechargez la page pour qu’elle vous soit redemandée.',
    sampling_disabled: 'Claude n’est pas disponible pour ce compte.',
    not_declared: 'La discussion n’est pas activée sur cette version du studio.',
    capability_disabled: 'La discussion n’est pas disponible dans cette vue.',
    capability_removed: 'Mettez à jour l’application Claude pour utiliser la discussion.',
    rate_limited: 'Trop de demandes ou limite d’utilisation atteinte. Réessayez dans un moment.',
    session_expired: 'Reconnectez-vous à Claude, puis réessayez.',
    prompt_too_large: 'Le projet est trop volumineux pour une seule demande. Supprimez des éléments inutilisés ou découpez la demande.',
    refused: 'Claude n’a pas répondu à cette demande. Reformulez-la.',
    empty_completion: 'Claude n’a rien renvoyé. Reformulez ou simplifiez la demande.',
    image_rejected: 'L’aperçu joint n’a pas été accepté. Décochez « Joindre l’aperçu » et réessayez.',
    images_unavailable: 'Cette vue ne peut pas envoyer d’image. Décochez « Joindre l’aperçu » et réessayez.',
    upstream_error: 'La connexion a été interrompue. Réessayez.',
  };

  let sample = null, sampleTried = false, imagesOk = false, ctl = null, busy = false, msgs = [];
  const el = h('div', { class: 'chat' });
  const list = h('div', { class: 'msgs', 'aria-live': 'polite' });
  const box = h('textarea', { id: 'chat-input', rows: 2, placeholder: 'Décrivez la modification : « fais apparaître le logo plus tôt », « ajoute un impact sur le titre »…', 'aria-label': 'Message pour Claude' });
  const attach = h('input', { type: 'checkbox', id: 'chat-attach', checked: true });
  const sendBtn = h('button', { class: 'btn primary', 'aria-label': 'Envoyer' }, icon('send'), h('span', null, 'Envoyer'));
  const sugg = h('div', { class: 'sugg' }, SUGGESTIONS.map((s) => h('button', { onclick: () => { box.value = s; box.focus(); } }, s)));
  el.append(list, h('div', { class: 'composer' }, sugg, box,
    h('div', { class: 'row' }, h('label', { for: 'chat-attach' }, attach, 'Joindre l’aperçu à la tête de lecture'), sendBtn)));
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  box.addEventListener('input', () => { box.style.height = 'auto'; box.style.height = Math.min(140, box.scrollHeight) + 'px'; });
  sendBtn.addEventListener('click', () => (busy ? ctl && ctl.abort() : send()));

  async function getSample() {
    if (sampleTried) return sample;
    sampleTried = true;
    if (window.claude && typeof window.claude.use === 'function') {
      try { sample = await window.claude.use('sample'); } catch (e) { sample = null; }
      if (sample) { try { const lim = await sample.limits(); imagesOk = !!lim.images; } catch (e) { imagesOk = false; } }
    }
    attach.disabled = !imagesOk; if (!imagesOk) attach.checked = false;
    return sample;
  }

  function intro() {
    return h('div', { class: 'msg assistant' },
      'Je peux modifier ce montage pour vous : ajouter ou retirer des éléments, changer les textes, les couleurs, les animations, le format, et caler les sons de la sonothèque sur les temps forts.\n\nDécrivez ce que vous voulez. Chaque modification peut être annulée.');
  }
  function render(stream) {
    list.innerHTML = '';
    list.append(intro());
    for (const m of msgs) list.append(bubble(m));
    if (stream) list.append(stream);
    sugg.hidden = msgs.length > 0;
    list.scrollTop = list.scrollHeight;
  }
  function bubble(m) {
    const b = h('div', { class: 'msg ' + m.role + (m.error ? ' err' : '') }, m.text);
    if (m.role === 'assistant' && (m.applied || m.model)) {
      b.append(h('div', { class: 'meta' },
        m.applied ? h('span', { class: 'applied' }, '✓ Appliqué au montage') : null,
        m.applied && m.undoable ? h('button', { onclick: () => { RM.undo(); m.undoable = false; m.applied = false; m.text += '\n(annulé)'; save(); render(); } }, 'Annuler') : null,
        m.model ? h('span', null, m.model) : null));
    }
    return b;
  }
  function save() { RM.saveChat(msgs.map(({ undoable, ...m }) => m)); }

  function catalogText() {
    const c = RM.app.sfx; if (!c) return '(sonothèque indisponible)';
    return c.sounds.map((s) => `${s.id} | ${s.name} | ${s.category} | durée ${s.duration} s | impact ${s.hit_point ?? 0} s | ${s.usage || s.description} | src: sfx/${s.files.mp3}`).join('\n');
  }
  function rules() {
    return `Tu es le monteur motion design intégré au studio REMP'ART Motion (studio de création digitale REMP'ART). Tu modifies le projet de l'utilisateur, décrit en JSON, selon ses demandes. Tu réponds en français.

FORMAT DE RÉPONSE
1. D'abord 1 à 4 phrases courtes, sans markdown : ce que tu as changé et pourquoi (ou une question si la demande est vraiment ambiguë).
2. Ensuite, seulement si tu modifies le projet : UN bloc \`\`\`json contenant le projet COMPLET modifié (jamais un extrait). Garde les "id" des pistes et des clips existants que tu conserves. Aucun autre bloc de code.

SCHÉMA DU PROJET
{ "id", "name", "format": "16:9"|"9:16"|"1:1"|"4:5", "width", "height", "fps",
  "bg": {"type":"solid"|"linear"|"radial","c1":"#hex","c2":"#hex","angle":degrés},
  "media": [médias importés, à conserver tels quels],
  "tracks": [ {"id","kind":"visual"|"audio","name","hidden","muted","clips":[clip]} ] }
tracks[0] est le calque du dessus. Les clips son ne vont que sur des pistes "audio", les autres que sur des pistes "visual".
Clip : {"id","type","name","start" (s),"duration" (s),"props":{…},"anim":{"in":{"type","dur","ease"},"out":{"type","dur","ease"},"loop":{"type","amp","speed"}},"keys":{…}}
- "text" props : text (\\n pour aller à la ligne), font, size (px), weight (300-900), color, align ("left"|"center"|"right"), lineHeight, letterSpacing, uppercase, bg ("#hex" ou "" : fond derrière le texte), bgPad, radius, shadow, x, y, scale, rotation, opacity
- "shape" props : shape ("rect"|"circle"|"ring"|"triangle"), w, h, fill ("#hex" ou ""), stroke, strokeWidth, radius, x, y, scale, rotation, opacity
- "image" et "video" props : src (garder l'existant ; images fournies : assets/img/rempart-logo-white.png, assets/img/rempart-logo.png), w (largeur px, hauteur proportionnelle), radius, x, y, scale, rotation, opacity ; vidéo : volume, in
- "audio" props : src, sfx (id du son), volume (1 = normal), fadeIn, fadeOut, in
x et y = centre de l'élément en pixels, (0,0) = coin haut gauche. scale 1 = 100 %, opacity de 0 à 1.
Animations "in"/"out" : ${RM.ANIMS.map((a) => a.id + (a.text ? ' (texte seulement)' : '')).join(', ')}.
Effets continus "loop" : ${RM.LOOPS.map((a) => a.id).join(', ')} (amp et speed autour de 1).
Courbes "ease" : ${Object.keys(RM.EASINGS).join(', ')}.
Images clés "keys" (facultatif) : {"x"|"y"|"scale"|"rotation"|"opacity": [{"t": secondes depuis le début du clip, "v": valeur, "e": courbe}]} ; une propriété animée par images clés ignore sa valeur dans props.
Polices disponibles : ${RM.FONTS.join(', ')}. Identité REMP'ART : noir #07080d, rouge #ff1a1a, bleu #1d3bff, blanc cassé #f4f2ee, polices Archivo (titres) et Manrope (textes).

SONOTHÈQUE (utilise "src" exactement comme indiqué et mets l'id dans "sfx")
"impact" = secondes entre le début du fichier et l'attaque. Pour que l'attaque tombe à l'instant T : start = T - impact. Pour une montée (riser), fais coïncider la fin (start + duration) avec le temps fort. duration ≤ durée du son.
${catalogText()}

RÈGLES
- Garde les éléments dans le cadre (width × height) et lisibles.
- Synchronise les sons et les animations : impact sur l'apparition d'un titre, whoosh sur un glissement, pop ou clic sur une petite apparition.
- Si le format change, mets width/height du nouveau format et repositionne les éléments.
- Ne supprime rien que l'utilisateur n'a pas demandé de supprimer.`;
  }

  function parseReply(text) {
    const re = /```(?:json)?\s*([\s\S]*?)```/gi;
    let m, last = null;
    while ((m = re.exec(text))) last = m;
    const msg = (last ? text.slice(0, last.index) + text.slice(last.index + last[0].length) : text).trim();
    let project = null, bad = false;
    if (last) { try { project = JSON.parse(last[1]); if (!project || !Array.isArray(project.tracks)) { project = null; bad = true; } } catch (e) { bad = true; } }
    return { msg, project, bad };
  }

  async function send() {
    const text = box.value.trim();
    if (!text || busy) return;
    const s = await getSample();
    if (!s) {
      msgs.push({ role: 'user', text, ts: Date.now() },
        { role: 'assistant', error: true, ts: Date.now(), text: 'La discussion avec Claude fonctionne quand le studio est ouvert dans Claude (claude.ai ou l’application). Ici, exportez le projet en .json et envoyez-le à Claude dans une session.' });
      box.value = ''; render(); return;
    }
    box.value = ''; box.style.height = '';
    msgs.push({ role: 'user', text, ts: Date.now() });
    busy = true; ctl = new AbortController();
    sendBtn.lastChild.textContent = 'Arrêter'; sendBtn.firstChild.replaceWith(icon('stop'));
    const live = h('div', { class: 'msg assistant' }, h('span', { class: 'thinking', 'aria-label': 'Claude réfléchit' }, h('i'), h('i'), h('i')));
    render(live);

    const p = RM.app.project, sel = RM.app.selected && RM.findClip(p, RM.app.selected);
    const history = msgs.slice(0, -1).filter((m) => !m.error).slice(-10).map((m) => ({ role: m.role, content: m.text }));
    const withImage = attach.checked && imagesOk;
    const last = `PROJET ACTUEL :\n\`\`\`json\n${JSON.stringify(p)}\n\`\`\`\nTête de lecture : ${RM.round(RM.app.time, 2)} s. Durée : ${RM.duration(p)} s.${sel ? ` Élément sélectionné : ${sel.clip.id} (${sel.clip.type}${sel.clip.type === 'text' ? ' « ' + sel.clip.props.text.slice(0, 40) + ' »' : ''}).` : ''}${withImage ? '\nL’image jointe montre l’aperçu à la tête de lecture.' : ''}\n\nDEMANDE : ${text}`;
    const turns = [{ role: 'user', content: rules() }, ...history, { role: 'user', content: last }];
    const opts = { model: MODEL, modelTier: 'complex', effort: 'medium', cache: false, signal: ctl.signal,
      onText: ({ text: t }) => {
        const i = t.indexOf('```');
        live.textContent = i >= 0 ? t.slice(0, i).trim() + '\n\nPréparation des modifications…' : t;
        list.scrollTop = list.scrollHeight;
      } };
    if (withImage) { try { const img = await RM.app.frame(1024); if (img) opts.images = [img]; } catch (e) { /* sans image */ } }

    let entry;
    try {
      const r = await s(turns, opts);
      const { msg, project, bad } = parseReply(r.text);
      entry = { role: 'assistant', text: msg || (project ? 'Modifications prêtes.' : r.text), ts: Date.now(), model: r.modelApplied || ('modèle ' + r.modelTierApplied) };
      if (project) {
        try { RM.applyProject(project, 'Montage modifié par Claude'); entry.applied = true; entry.undoable = true; }
        catch (e) { entry.text += '\n\nLes modifications proposées n’ont pas pu être appliquées (projet invalide). Reformulez la demande.'; }
      } else if (bad) entry.text += '\n\nLes modifications proposées étaient incomplètes. Redemandez, en plus court si possible.';
      if (r.truncated) entry.text += '\n\n(Réponse coupée : demandez moins de changements à la fois.)';
    } catch (e) {
      if (e && e.code === 'images_unavailable') { imagesOk = false; attach.checked = false; attach.disabled = true; }
      entry = e && e.code === 'cancelled'
        ? { role: 'assistant', text: (e.text ? parseReply(e.text).msg + '\n' : '') + 'Arrêté.', ts: Date.now(), error: true }
        : { role: 'assistant', text: (e && e.text && e.code !== 'refused' ? parseReply(e.text).msg + '\n\n' : '') + (ERRORS[e && e.code] || ERRORS.upstream_error), ts: Date.now(), error: true };
    }
    msgs.push(entry);
    busy = false; ctl = null;
    sendBtn.lastChild.textContent = 'Envoyer'; sendBtn.firstChild.replaceWith(icon('send'));
    save(); render();
  }

  RM.chat = {
    el,
    init() { render(); },
    load(chat) { msgs = (chat || []).map((m) => ({ ...m })); render(); },
    onShow() { getSample(); list.scrollTop = list.scrollHeight; },
  };
})();
