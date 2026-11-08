# REMP'ART Motion — studio de montage motion design

Interface de montage (à la manière des logiciels de montage vidéo) spécialisée pour le motion design :
textes et formes animés, images et vidéos, sons de la [sonothèque](../sfx/README.md), discussion avec Claude
pour modifier le montage, export vidéo. Fonctionne sur ordinateur et sur téléphone.

**Ouvrir le studio** : <https://claude.ai/artifact/1pXxxCvsT78u7LU9Ko8Wrf> (version complète : projets synchronisés,
discussion avec Claude). Version de secours sans Claude : `studio/index.html` (GitHub Pages ou
`python3 -m http.server` à la racine du dépôt puis <http://localhost:8000/studio/>), les projets y restent dans le navigateur.

## Ce qu'on peut faire

| Zone | Contenu |
| --- | --- |
| **Médias** | Importer images, vidéos, sons (glisser-déposer). Logos et affiches REMP'ART déjà disponibles. |
| **Sons** | La sonothèque : écoute, recherche, catégories. Le bouton + cale l'impact du son sur la tête de lecture. |
| **Texte / Formes** | Préréglages animés (titre pop, mot par mot, machine à écrire, étiquette, chiffre clé, anneau qui se dessine…). |
| **Aperçu** | Lecture avec le son. Toucher un élément pour le sélectionner, le déplacer, l'agrandir par ses coins (repères au centre). |
| **Réglages** | Texte, police, couleurs, taille ; position, échelle, rotation, opacité avec **images clés** (◆) ; animations d'entrée, de sortie et effet continu ; volume et fondus des sons ; format (16:9, 9:16, 1:1, 4:5) et fond du projet. |
| **Timeline** | Pistes de calques et de sons, déplacer et rogner les clips, couper, dupliquer, magnétisme (bords, tête de lecture, impacts des sons), zoom, forme d'onde des sons. |
| **Claude** | Décrire une modification en français : Claude (Opus 5.5) renvoie le projet modifié, appliqué aussitôt et annulable. L'aperçu à la tête de lecture peut être joint pour qu'il voie le résultat. |
| **Projets** | Projets enregistrés automatiquement, avec aperçu ; nouveau projet vide ou depuis la démo ; import/export `.json`. |
| **Exporter** | Vidéo MP4 (ou WebM selon le navigateur) avec le son, image PNG de l'instant affiché, projet `.json`. |

Raccourcis : Espace lecture/pause · S couper · Ctrl+D dupliquer · Suppr supprimer · Ctrl+Z / Ctrl+Maj+Z · ← → image par image (Maj : 1 s).

## Fichiers

```
studio/studio.html   page publiée comme artefact Claude (sans <html>/<head>, ajoutés à la publication)
studio/index.html    même page en document complet, pour GitHub Pages / usage local
studio/app.css       styles (identité REMP'ART : noir, rouge, bleu ; Archivo + Manrope)
studio/engine.js     modèle de projet, rendu canvas, animations, images clés, audio, export vidéo
studio/ui.js         interface : panneaux, aperçu, réglages, timeline, projets, export
studio/chat.js       discussion avec Claude
studio/files_map.py  liste des fichiers à republier avec l'artefact
```

## Format d'un projet

Un projet est un JSON : `format`, `width`, `height`, `fps`, `bg` (fond), `media` (médias importés) et `tracks`
(`tracks[0]` = calque du dessus). Chaque piste `visual` ou `audio` contient des `clips` :
`{id, type: text|shape|image|video|audio, start, duration, props, anim: {in, out, loop}, keys}`.
Le schéma détaillé est celui donné à Claude dans `chat.js` (fonction `rules`).

## Notes techniques

- L'export vidéo enregistre en temps réel (MediaRecorder sur le canvas et le mixage audio) : garder l'onglet ouvert et visible.
- Dans l'artefact, les projets sont dans la base de l'artefact (collection `projects`, champ `json` = projet en texte,
  `chat` = discussion). Les images et vidéos importées vont dans le stockage de l'artefact ; les sons importés restent
  dans le navigateur où ils ont été importés (pour les garder partout, les ajouter à la sonothèque).
- Les chemins `sfx/...` et `assets/...` sont relatifs à la racine du dépôt ; le studio détecte s'il tourne depuis
  `studio/` (dépôt) ou depuis la racine (artefact).
