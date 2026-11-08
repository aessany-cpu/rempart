# REMP'ART — site de Jean Levi Aka

Site vitrine animé du studio de création digitale **REMP'ART**, fondé par **Jean Levi Aka**.
Version retravaillée de <https://comdig-28.github.io/rempart-site/>.

## Ce que contient le site

| Section | Contenu et animations |
| --- | --- |
| **Hero** | Scène 3D (Three.js) : Jean travaille à son bureau. En faisant défiler, la caméra s'approche de l'écran (un logiciel de création qui affiche ses affiches, avec un tracé à la plume animé), le traverse, puis s'envole dans « le monde de la création » : un tunnel d'affiches, de formes et d'un tracé rouge. Le slogan « Votre vision. Notre création. » apparaît à la fin. |
| **Services** | Les 6 services. Au survol, un aperçu d'affiche suit le curseur ; un clic présélectionne le service dans le formulaire. |
| **Approche** | Les 3 étapes, reliées par une courbe de Bézier qui se dessine au défilement (clin d'œil à la plume du logo). |
| **Réalisations** | Galerie horizontale épinglée (défilement natif sur mobile) avec parallaxe. Chaque affiche s'ouvre en grand avec « le défi » et « la réponse créative », navigation ← →, et un bouton « Commander un visuel similaire ». |
| **Le fondateur** | Avatar 3D de Jean Levi Aka (costume bleu marine, chemise blanche, cravate) qui enchaîne en boucle des postures professionnelles : bras croisés, mains sur les hanches, réflexion, une main sur la hanche, présentation. On peut choisir une posture ou le faire pivoter à la souris / au doigt. À côté : sa photo dans un cadre façon « calque sélectionné », sa biographie en 4 chapitres et sa signature LAJ qui se dessine. |
| **Commande** | Formulaire qui prépare le message WhatsApp (+225 01 00 51 17 33). |

Autres détails : préchargement animé, défilement doux (Lenis), titres qui apparaissent mot à mot, curseur personnalisé, boutons magnétiques, bandeau défilant qui accélère avec le scroll, prise en compte de `prefers-reduced-motion` et image de secours si WebGL n'est pas disponible.

## Biographie : à valider

La biographie a été **rédigée à partir des informations du site actuel** (services, approche, signature « LAJ » visible sur les affiches). Elle ne contient ni dates, ni chiffres, ni distinctions inventés, mais Jean Levi Aka doit la relire et la compléter : elle se trouve dans `index.html`, section `id="fondateur"`.

## Structure

```
index.html                 page unique
assets/css/main.css        styles
assets/js/main.js          animations (GSAP + ScrollTrigger), galerie, lightbox, formulaire
assets/js/hero-scene.js    scène 3D du hero
assets/js/character.js     personnage 3D (utilisé dans le hero et pour l'avatar)
assets/js/poses.js         postures de l'avatar (à modifier pour en ajouter)
assets/js/avatar.js        scène 3D de l'avatar du fondateur
assets/img/                affiches (WebP), photo, logo
assets/vendor/             Three.js, GSAP, Lenis (copiés localement, aucun CDN nécessaire)
dev/poses.html             planche de test des postures (non liée au site)
sfx/                       sonothèque d'effets sonores pour le motion design (voir sfx/README.md)
studio/                    studio de montage motion design REMP'ART Motion (voir studio/README.md)
```

Aucune compilation n'est nécessaire : ce sont des fichiers statiques.

## Voir le site en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Un serveur est nécessaire : les modules JavaScript ne se chargent pas en ouvrant `index.html` directement.)

## Mettre le site en ligne (GitHub Pages, gratuit)

Le dépôt doit être **public**. Dans le dépôt : **Settings → Pages → Build and deployment → Source : Deploy from a branch → Branch : `main`, dossier `/ (root)` → Save**.
Après une ou deux minutes, le site est en ligne à `https://<compte>.github.io/<nom-du-dépôt>/`.
Chaque modification envoyée sur `main` est publiée automatiquement.

## Ajouter une réalisation

1. Exporter l'affiche en WebP dans `assets/img/portfolio/` : une version `nom.webp` (≈1200 px) et une version `nom-sm.webp` (≈600 px).
2. Copier un bloc `<article class="card" …>` dans la section `realisations` de `index.html` et adapter le titre, la catégorie, `data-brief`, `data-answer`, les chemins d'image et `--ar` (largeur ÷ hauteur).
3. Pour l'ajouter aussi dans la scène 3D du hero, compléter la liste `HERO_IMAGES` dans `assets/js/main.js`.

## Crédits

Three.js (MIT), GSAP (licence standard GreenSock, gratuite), Lenis (MIT). Polices : Archivo et Manrope (Google Fonts).
