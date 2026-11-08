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
