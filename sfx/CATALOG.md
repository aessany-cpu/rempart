# Catalogue des effets sonores

_Généré automatiquement par `tools/sfx.py` le 2026-11-08 — ne pas modifier à la main (modifier `catalog.json` puis lancer `python3 sfx/tools/sfx.py build`)._

**10 sons** · **1 source(s)** · « impact à » = instant de l'attaque principale dans le fichier, pour caler le son sur une image.

## Whooshs / Swooshs (`whoosh`)

Passages d'air rapides : apparition, sortie ou mouvement d'un élément à l'écran.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `whoosh-souffle-01` | Whoosh court brillant ⚠️ | 0.46 s | 0.17 s | court, air, aigu, passage | Entrée ou sortie rapide d'un élément, glissement de texte, changement de plan. | [wav](library/whoosh/whoosh-souffle-01.wav) · [mp3](library/whoosh/whoosh-souffle-01.mp3) |

## Impacts / Booms (`impact`)

Coups graves et percutants : révélation d'un titre, chute d'un logo, temps fort.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `impact-boom-01` | Boom grave avec traîne ⚠️ | 2.68 s | 0.07 s | grave, boom, cinematique, revelation, traine | Révélation d'un titre, d'un logo ou d'un chiffre clé ; caler l'impact sur l'image d'arrivée. | [wav](library/impact/impact-boom-01.wav) · [mp3](library/impact/impact-boom-01.mp3) |

## Montées (risers) (`riser`)

Sons qui montent en tension avant un temps fort ; on les termine sur l'image de l'impact.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `riser-montee-01` | Montée de tension (≈2 s) ⚠️ | 2.14 s | 2.14 s | montee, tension, build-up, souffle | Avant un temps fort : placer la fin du son sur l'image de l'impact ou de la transition. | [wav](library/riser/riser-montee-01.wav) · [mp3](library/riser/riser-montee-01.mp3) |

## Transitions (`transition`)

Sons courts qui marquent un changement de scène ou de plan.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `bips-montee-numerique-01` | Bips + balayage numérique montant ⚠️ | 0.49 s | 0.04 s | court, numerique, bip, balayage, intro | Juste avant l'apparition d'un logo ou d'un titre ; enchaîner avec impact-boom-01. | [wav](library/transition/bips-montee-numerique-01.wav) · [mp3](library/transition/bips-montee-numerique-01.mp3) |

## Glitchs / Saccades (`glitch`)

Bruits numériques hachés : distorsion, texte qui se brouille, effet écran.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `glitch-saccade-01` | Saccade numérique rapide ⚠️ | 0.85 s | 0.01 s | glitch, saccade, stutter, numerique, rafale | Texte qui se brouille, effet écran/glitch, défilement rapide, apparition lettre par lettre. | [wav](library/glitch/glitch-saccade-01.wav) · [mp3](library/glitch/glitch-saccade-01.mp3) |

## Clics / Interface (`ui-clic`)

Clics, pops, bips : apparition d'icônes, boutons, curseur, petits éléments.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `clic-double-01` | Double clic sec ⚠️ | 0.22 s | 0.13 s | clic, double, sec, interface, declencheur | Clic de souris, déclenchement d'un bouton, prise de photo stylisée, apparition d'une icône. | [wav](library/ui-clic/clic-double-01.wav) · [mp3](library/ui-clic/clic-double-01.mp3) |
| `pop-01` | Pop / clic léger ⚠️ | 0.22 s | 0.06 s | pop, clic, leger, apparition | Apparition d'une icône, d'une bulle, d'un point de liste. | [wav](library/ui-clic/pop-01.wav) · [mp3](library/ui-clic/pop-01.mp3) |
| `pop-02` | Pop / clic léger (variante) ⚠️ | 0.17 s | 0.04 s | pop, clic, leger, apparition, variante | À alterner avec pop-01 quand plusieurs éléments apparaissent à la suite. | [wav](library/ui-clic/pop-02.wav) · [mp3](library/ui-clic/pop-02.mp3) |

## Tension / Pulsations (`tension`)

Pulsations, tic-tac, battements : suspense, compte à rebours, attente.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `pulsation-suspense-01` | Pulsation de suspense ⚠️ | 2.67 s | 1.57 s | pulsation, tic-tac, suspense, attente, calme, boucle | Attente, compte à rebours, moment calme avant une révélation. | [wav](library/tension/pulsation-suspense-01.wav) · [mp3](library/tension/pulsation-suspense-01.mp3) |

## Musique / Boucles (`musique`)

Extraits musicaux et boucles utilisables en fond.

| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |
| --- | --- | ---: | ---: | --- | --- | --- |
| `melodie-fond-01` | Fond mélodique (≈3 s) ⚠️ | 3.24 s | 0.62 s | musique, melodie, fond, boucle | Fond musical court sous un plan de fin ; peut être bouclé. | [wav](library/musique/melodie-fond-01.wav) · [mp3](library/musique/melodie-fond-01.mp3) |

⚠️ = étiquette proposée automatiquement, pas encore validée à l'écoute.

## Sources

| ID | Titre | Origine | Licence | Ajoutée | Durée |
| --- | --- | --- | --- | --- | ---: |
| `src-001` | Compilation SFX motion design 01 | Envoyé par l'utilisateur le 2026-11-08 (vidéo « Comment SFX and I'll send it to you », 15,5 s) | inconnue — à vérifier avant usage commercial | 2026-11-08 | 15.54 s |
