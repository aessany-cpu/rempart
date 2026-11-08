#!/usr/bin/env python3
"""Affiche la liste `files` à passer à l'outil Artifact pour republier le studio.

Usage (depuis la racine du dépôt) : python3 studio/files_map.py
Inclut les scripts du studio, le catalogue et tous les MP3 de la sonothèque,
et les images REMP'ART utilisées dans la bibliothèque de médias.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
files = {name: f"studio/{name}" for name in ("app.css", "engine.js", "ui.js", "chat.js")}
files["sfx/catalog.json"] = "sfx/catalog.json"
for mp3 in sorted((root / "sfx" / "library").rglob("*.mp3")):
    rel = mp3.relative_to(root).as_posix()
    files[rel] = rel
images = ["assets/img/rempart-logo-white.png", "assets/img/rempart-logo.png"] + [
    f"assets/img/portfolio/{n}-sm.webp" for n in ("mercedes-amg", "parfum-arta", "octobre-rose", "alloco-spice", "yaki", "betsaleel")]
for rel in images:
    files[rel] = rel
print(json.dumps(files, ensure_ascii=False))
