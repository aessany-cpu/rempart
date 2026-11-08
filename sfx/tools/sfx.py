#!/usr/bin/env python3
"""Gestion de la bibliothèque d'effets sonores (SFX) pour le motion design.

Commandes :
  source  : archive un fichier audio reçu dans sources/ et l'inscrit au catalogue
  add     : découpe un extrait d'une source, le normalise, l'exporte (WAV + MP3)
            et l'ajoute au catalogue
  find    : cherche des sons (catégorie, tag, texte libre)
  build   : vérifie le catalogue et régénère CATALOG.md
  refresh : recalcule durées et points d'impact de tous les sons
  set     : modifie un son (nom, catégorie, tags, description, vérifié...)

Exemples :
  python3 sfx/tools/sfx.py source ~/son.m4a --origin "Pack whoosh envoyé le 12/11"
  python3 sfx/tools/sfx.py add --source src-002 --start 1.20 --end 2.05 \
      --category whoosh --id whoosh-rapide-02 --name "Whoosh rapide" \
      --tags rapide,air --description "..." --usage "..."
  python3 sfx/tools/sfx.py find impact
  python3 sfx/tools/sfx.py set impact-boom-01 --verified true

Dépendances : python3, ffmpeg. numpy (facultatif) pour détecter le point d'impact.
"""
import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "catalog.json"
CATALOG_MD = ROOT / "CATALOG.md"
SAMPLE_RATE = 48000
PEAK_DB = -1.0


def load():
    return json.loads(CATALOG.read_text(encoding="utf-8"))


def save(cat):
    cat["updated"] = dt.date.today().isoformat()
    cat["sounds"].sort(key=lambda s: (s["category"], s["id"]))
    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(cat)


def slug(text):
    text = text.lower()
    for a, b in (("àâä", "a"), ("éèêë", "e"), ("îï", "i"), ("ôö", "o"), ("ùûü", "u"), ("ç", "c")):
        text = re.sub(f"[{a}]", b, text)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:60]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"Erreur ffmpeg :\n{r.stderr[-2000:]}")
    return r


def probe_duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)])
    return round(float(r.stdout.strip()), 3)


def peak_db(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.search(r"max_volume: (-?[\d.]+) dB", r.stderr)
    return float(m.group(1)) if m else 0.0


def hit_point(wav_path):
    """Instant (s) de la plus forte attaque dans le fichier : utile pour caler le son sur une image."""
    try:
        import numpy as np
    except ImportError:
        return None
    with wave.open(str(wav_path)) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(float)
    x = x.reshape(-1, ch).mean(1) / 32768
    # enveloppe d'énergie par fenêtres de 5 ms ; on retient la première fenêtre qui atteint
    # 70 % de l'amplitude maximale : c'est l'attaque principale, à caler sur l'image
    h = max(1, int(sr * 0.005))
    env = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h, h)])
    if not len(env):
        return 0.0
    first = int(np.argmax(env >= 0.7 * env.max()))
    return round(first * h / sr, 3)


def sync_point(sound, wav):
    """Une montée se cale par sa fin ; les autres sons par leur attaque principale."""
    if sound["category"] == "riser":
        return sound["duration"]
    return hit_point(wav)


def find_source(cat, ref):
    for s in cat["sources"]:
        if ref in (s["id"], s["file"], Path(s["file"]).name):
            return s
    sys.exit(f"Source inconnue : {ref}. Ajoutez-la d'abord avec la commande « source ».")


def cmd_source(a):
    cat = load()
    src = Path(a.file).expanduser()
    if not src.exists():
        sys.exit(f"Fichier introuvable : {src}")
    num = max([int(s["id"].split("-")[1]) for s in cat["sources"]] + [0]) + 1
    sid = f"src-{num:03d}"
    dest = ROOT / "sources" / f"{sid}_{slug(a.title or src.stem)}{src.suffix.lower()}"
    shutil.copy2(src, dest)
    entry = {
        "id": sid,
        "file": str(dest.relative_to(ROOT)),
        "title": a.title or src.stem,
        "origin": a.origin,
        "license": a.license,
        "added": dt.date.today().isoformat(),
        "duration": probe_duration(dest),
    }
    cat["sources"].append(entry)
    save(cat)
    print(json.dumps(entry, ensure_ascii=False, indent=2))


def cmd_add(a):
    cat = load()
    if a.category not in cat["categories"]:
        sys.exit(f"Catégorie inconnue : {a.category}. Catégories : {', '.join(cat['categories'])}\n"
                 "(ajoutez-en une dans catalog.json > categories si besoin)")
    src = find_source(cat, a.source)
    sid = a.id or slug(f"{a.category}-{a.name}")
    if any(s["id"] == sid for s in cat["sounds"]) and not a.replace:
        sys.exit(f"L'identifiant {sid} existe déjà (utilisez --replace pour l'écraser).")
    folder = ROOT / "library" / a.category
    folder.mkdir(parents=True, exist_ok=True)
    wav, mp3 = folder / f"{sid}.wav", folder / f"{sid}.mp3"
    length = a.end - a.start
    fade_out = min(a.fade_out, length / 3)
    tmp = folder / f".{sid}.tmp.wav"
    run(["ffmpeg", "-hide_banner", "-y", "-ss", f"{a.start}", "-t", f"{length}", "-i", str(ROOT / src["file"]),
         "-af", f"afade=t=in:d={a.fade_in},afade=t=out:st={max(0, length - fade_out):.3f}:d={fade_out:.3f}",
         "-ar", str(SAMPLE_RATE), "-ac", "2", "-c:a", "pcm_s16le", str(tmp)])
    gain = PEAK_DB - peak_db(tmp)
    run(["ffmpeg", "-hide_banner", "-y", "-i", str(tmp), "-af", f"volume={gain:.2f}dB",
         "-c:a", "pcm_s16le", str(wav)])
    tmp.unlink()
    run(["ffmpeg", "-hide_banner", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)])
    entry = {
        "id": sid,
        "name": a.name,
        "category": a.category,
        "tags": [t.strip() for t in a.tags.split(",") if t.strip()],
        "description": a.description,
        "usage": a.usage,
        "files": {"wav": str(wav.relative_to(ROOT)), "mp3": str(mp3.relative_to(ROOT))},
        "duration": probe_duration(wav),
        "hit_point": None,
        "source": {"id": src["id"], "start": a.start, "end": a.end},
        "clean": not a.not_clean,
        "verified": False,
        "added": dt.date.today().isoformat(),
    }
    entry["hit_point"] = sync_point(entry, wav)
    cat["sounds"] = [s for s in cat["sounds"] if s["id"] != sid] + [entry]
    save(cat)
    print(f"Ajouté : {sid}  ({entry['duration']} s, impact à {entry['hit_point']} s)")


def cmd_find(a):
    cat = load()
    q = (a.query or "").lower()
    for s in cat["sounds"]:
        hay = " ".join([s["id"], s["name"], s["category"], s["description"], s["usage"], *s["tags"]]).lower()
        if q in hay:
            flag = "" if s["verified"] else "  (non vérifié)"
            print(f"{s['category']:<12} {s['id']:<28} {s['duration']:>6.2f}s  {s['files']['wav']}{flag}")


def cmd_set(a):
    cat = load()
    s = next((s for s in cat["sounds"] if s["id"] == a.id), None)
    if not s:
        sys.exit(f"Son inconnu : {a.id}")
    for field in ("name", "description", "usage"):
        if getattr(a, field) is not None:
            s[field] = getattr(a, field)
    if a.tags is not None:
        s["tags"] = [t.strip() for t in a.tags.split(",") if t.strip()]
    if a.verified is not None:
        s["verified"] = a.verified.lower() in ("1", "true", "oui", "yes")
    if a.category and a.category != s["category"]:
        if a.category not in cat["categories"]:
            sys.exit(f"Catégorie inconnue : {a.category}")
        folder = ROOT / "library" / a.category
        folder.mkdir(parents=True, exist_ok=True)
        for kind, rel in s["files"].items():
            new = folder / Path(rel).name
            (ROOT / rel).rename(new)
            s["files"][kind] = str(new.relative_to(ROOT))
        s["category"] = a.category
    save(cat)
    print(json.dumps(s, ensure_ascii=False, indent=2))


def cmd_refresh(_a):
    """Recalcule durée, point d'impact (et vérifie les fichiers) pour tous les sons."""
    cat = load()
    for s in cat["sounds"]:
        wav = ROOT / s["files"]["wav"]
        s["duration"] = probe_duration(wav)
        s["hit_point"] = sync_point(s, wav)
        print(f"{s['id']:<28} {s['duration']:>6.2f}s  impact à {s['hit_point']}")
    save(cat)


def write_markdown(cat):
    lines = [
        "# Catalogue des effets sonores",
        "",
        f"_Généré automatiquement par `tools/sfx.py` le {cat['updated']} — ne pas modifier à la main "
        "(modifier `catalog.json` puis lancer `python3 sfx/tools/sfx.py build`)._",
        "",
        f"**{len(cat['sounds'])} sons** · **{len(cat['sources'])} source(s)** · "
        "« impact à » = instant de l'attaque principale dans le fichier, pour caler le son sur une image.",
        "",
    ]
    for key, c in cat["categories"].items():
        sounds = [s for s in cat["sounds"] if s["category"] == key]
        if not sounds:
            continue
        lines += [f"## {c['label']} (`{key}`)", "", c["description"], "",
                  "| ID | Nom | Durée | Impact à | Tags | Usage | Fichier |",
                  "| --- | --- | ---: | ---: | --- | --- | --- |"]
        for s in sounds:
            name = s["name"] + ("" if s["verified"] else " ⚠️")
            hp = "—" if s["hit_point"] is None else f"{s['hit_point']:.2f} s"
            lines.append(f"| `{s['id']}` | {name} | {s['duration']:.2f} s | {hp} | {', '.join(s['tags'])} | "
                         f"{s['usage']} | [wav]({s['files']['wav']}) · [mp3]({s['files']['mp3']}) |")
        lines.append("")
    lines += ["⚠️ = étiquette proposée automatiquement, pas encore validée à l'écoute.", "",
              "## Sources", "", "| ID | Titre | Origine | Licence | Ajoutée | Durée |",
              "| --- | --- | --- | --- | --- | ---: |"]
    for s in cat["sources"]:
        lines.append(f"| `{s['id']}` | {s['title']} | {s['origin']} | {s['license']} | {s['added']} | "
                     f"{s['duration']:.2f} s |")
    CATALOG_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def cmd_build(_a):
    cat = load()
    problems = []
    ids = [s["id"] for s in cat["sounds"]]
    problems += [f"identifiant en double : {i}" for i in set(ids) if ids.count(i) > 1]
    for s in cat["sounds"]:
        if s["category"] not in cat["categories"]:
            problems.append(f"{s['id']} : catégorie inconnue {s['category']}")
        for rel in s["files"].values():
            if not (ROOT / rel).exists():
                problems.append(f"{s['id']} : fichier manquant {rel}")
    for s in cat["sources"]:
        if not (ROOT / s["file"]).exists():
            problems.append(f"source manquante : {s['file']}")
    save(cat)
    if problems:
        sys.exit("Problèmes :\n- " + "\n- ".join(problems))
    print(f"OK : {len(cat['sounds'])} sons, {len(cat['sources'])} source(s). CATALOG.md régénéré.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("source", help="archiver un fichier audio reçu")
    s.add_argument("file")
    s.add_argument("--title")
    s.add_argument("--origin", default="Envoyé par l'utilisateur")
    s.add_argument("--license", default="inconnue — à vérifier avant usage commercial")
    s.set_defaults(func=cmd_source)

    s = sub.add_parser("add", help="découper et ajouter un son")
    s.add_argument("--source", required=True, help="id de la source (ex. src-001)")
    s.add_argument("--start", type=float, required=True)
    s.add_argument("--end", type=float, required=True)
    s.add_argument("--category", required=True)
    s.add_argument("--name", required=True)
    s.add_argument("--id")
    s.add_argument("--tags", default="")
    s.add_argument("--description", default="")
    s.add_argument("--usage", default="")
    s.add_argument("--fade-in", type=float, default=0.005)
    s.add_argument("--fade-out", type=float, default=0.04)
    s.add_argument("--not-clean", action="store_true", help="de la musique ou un autre son reste dessous")
    s.add_argument("--replace", action="store_true")
    s.set_defaults(func=cmd_add)

    s = sub.add_parser("find", help="chercher un son")
    s.add_argument("query", nargs="?")
    s.set_defaults(func=cmd_find)

    s = sub.add_parser("set", help="modifier un son")
    s.add_argument("id")
    for f in ("name", "category", "tags", "description", "usage", "verified"):
        s.add_argument(f"--{f}")
    s.set_defaults(func=cmd_set)

    s = sub.add_parser("refresh", help="recalculer durées et points d'impact")
    s.set_defaults(func=cmd_refresh)

    s = sub.add_parser("build", help="vérifier et régénérer CATALOG.md")
    s.set_defaults(func=cmd_build)

    a = p.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
