# Consignes pour Claude

## Sonothèque motion design (`sfx/`)

Ce dépôt héberge la bibliothèque d'effets sonores de l'utilisateur, à utiliser dans tous ses projets de motion design.

- **Pour sonoriser une animation** : lire `sfx/catalog.json`, choisir les sons par `category`, `tags` et `usage`,
  et caler chaque son pour que son `hit_point` (en secondes depuis le début du fichier) tombe sur l'image clé.
  Utiliser `files.wav` pour un montage vidéo (ffmpeg, After Effects…) et `files.mp3` pour le web (HTML, GSAP, HyperFrames).
  Copier les fichiers nécessaires dans le projet cible plutôt que de les référencer par un chemin absolu.
- **Quand l'utilisateur envoie de nouveaux sons** : suivre « Ajouter de nouveaux sons » dans `sfx/README.md`
  (archiver avec `tools/sfx.py source`, découper avec `tools/sfx.py add`, puis `tools/sfx.py build`), commit et push.
  Les découpes se font en analysant le signal (spectrogramme, enveloppe d'énergie) ; laisser `verified: false`
  tant que l'utilisateur n'a pas validé le nom à l'écoute.
- **Quand l'utilisateur corrige une étiquette** : `tools/sfx.py set <id> ...` (jamais d'édition à la main de `CATALOG.md`).
- Si la sonothèque est déplacée dans un dépôt dédié, le dossier `sfx/` se copie tel quel : tous ses chemins sont relatifs.

## Studio de montage REMP'ART Motion (`studio/`)

Interface de montage motion design de l'utilisateur, publiée comme artefact : https://claude.ai/artifact/1pXxxCvsT78u7LU9Ko8Wrf
(voir `studio/README.md`).

- **Lire ou modifier un projet de l'utilisateur** : outil `ArtifactData` sur cette URL, collection `projects`.
  Chaque document : `name`, `format`, `updatedAt` (ms), `by`, `json` (le projet complet, en texte), `chat`, `thumb`.
  Pour modifier : lire le document, changer le projet, réécrire `json` + `updatedAt: Date.now()` + `by: "claude-code"`
  avec `if_version`. Le studio ouvert recharge alors le projet tout seul. Passer le projet par la même validation que
  le studio (`RM.normalize` dans `studio/engine.js`) : schéma dans `studio/chat.js` (fonction `rules`).
- **Après un ajout à la sonothèque** : republier l'artefact pour que les nouveaux sons y soient disponibles :
  outil `Artifact`, `file_path` = `studio/studio.html` (avec `url` de l'artefact depuis une autre session, après l'avoir lu),
  `files` = sortie de `python3 studio/files_map.py`. Ne pas repasser `capabilities` (elles sont conservées).
- **Après une modification de `studio/`** : tester `studio/index.html` dans Chromium (Playwright) sur ordinateur et
  téléphone, puis republier comme ci-dessus.
