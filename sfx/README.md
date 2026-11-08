# Sonothèque motion design

Bibliothèque d'effets sonores (SFX) classés par catégorie, prêts à être posés sur les animations
(motion design, vidéos, sites animés). Elle grandit à chaque nouvel envoi de sons.

- **Écouter les sons** : ouvrir [`index.html`](index.html) (page d'écoute avec recherche et filtres).
  En local : `python3 -m http.server 8000` à la racine du dépôt puis <http://localhost:8000/sfx/>.
- **Liste complète** : [`CATALOG.md`](CATALOG.md) (généré automatiquement).
- **Données** : [`catalog.json`](catalog.json) — la référence que Claude lit pour choisir un son.

## Organisation

```
sfx/
  catalog.json          catalogue : catégories, sources, sons (id, tags, durée, point d'impact, usage)
  CATALOG.md            même chose en tableau lisible (généré, ne pas modifier à la main)
  index.html            page d'écoute
  library/<catégorie>/  les sons prêts à l'emploi, en .wav (montage) et .mp3 (web)
  sources/              les fichiers audio reçus, archivés tels quels (src-001, src-002…)
  tools/sfx.py          outil pour ajouter, chercher, modifier les sons
```

Tous les sons sont en 48 kHz stéréo, crête normalisée à −1 dBFS, avec un fondu très court au début et à la fin
pour éviter les clics. Chaque son a un **point d'impact** (`hit_point`, en secondes) : l'instant de l'attaque
principale à caler sur l'image clé de l'animation. Pour une montée (`riser`), c'est la fin du son.

### Catégories

| Clé | Pour quoi faire |
| --- | --- |
| `whoosh` | apparition / sortie / mouvement rapide d'un élément |
| `impact` | révélation d'un titre, d'un logo, temps fort |
| `riser` | montée de tension avant un temps fort |
| `transition` | changement de scène ou de plan |
| `glitch` | effet numérique, texte qui se brouille |
| `ui-clic` | clics, pops, bips, petites apparitions |
| `tension` | pulsations, tic-tac, suspense |
| `texte` | frappe clavier, écriture |
| `ambiance` | nappes et fonds continus |
| `musique` | extraits musicaux, boucles |
| `foley` | bruitages d'objets réels |

On peut ajouter une catégorie dans `catalog.json` > `categories`.

## Ajouter de nouveaux sons

Il suffit d'envoyer l'audio à Claude en disant que c'est pour la sonothèque. Claude :

1. archive le fichier : `python3 sfx/tools/sfx.py source <fichier> --title "..." --origin "..."`
2. repère chaque effet (spectrogramme + détection des attaques) et le découpe :
   `python3 sfx/tools/sfx.py add --source src-002 --start 1.20 --end 2.05 --category whoosh --id whoosh-rapide-02 --name "..." --tags a,b --description "..." --usage "..."`
3. vérifie et régénère la liste : `python3 sfx/tools/sfx.py build`
4. enregistre (commit) et envoie sur GitHub.

Autres commandes : `find <mot>` (chercher), `set <id> --name/--category/--tags/--verified true` (corriger),
`refresh` (recalculer durées et points d'impact).

## À savoir

- **Étiquettes à valider (⚠️)** : les noms et catégories sont proposés par analyse du signal, sans écoute.
  Après écoute, dites à Claude ce qu'il faut corriger (ex. « `whoosh-souffle-01` c'est plutôt un swoosh de papier »),
  ou passez un son en validé avec `set <id> --verified true`.
- **Sons « non propres »** (`clean: false`) : le son a été extrait d'un montage où une musique de fond joue en
  dessous ; elle reste audible. Envoyer les effets isolés (un fichier par son, ou des sons séparés par un silence)
  donne des sons propres.
- **Droits** : l'origine et la licence de chaque source sont notées dans `catalog.json` > `sources`.
  Vérifier qu'on a le droit d'utiliser un son avant un projet commercial. Si le dépôt est public, les sons le sont aussi.
