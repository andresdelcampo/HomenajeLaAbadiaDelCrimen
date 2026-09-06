"""Check local media references and the five visual-edition controls."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    ROOT / "index.html",
    *(ROOT / "es" / name for name in ("index.html", "juego.html", "tecnica.html", "prensa.html", "legado.html")),
    *(ROOT / "en" / name for name in ("index.html", "game.html", "technology.html", "press.html", "legacy.html")),
]
PLATFORMS = ("cpc", "pc", "vga", "spectrum", "msx")
CHARACTERS = ("guillermo", "adso", "abad", "malaquias", "berengario", "severino", "jorge", "bernardo")
ITEMS = ("libro", "guantes", "gafas", "pergamino", "llave", "lampara")
ATTRIBUTES = re.compile(
    r'(?:src|href|data-lightbox|data-platform-src-(?:cpc|pc|vga|spectrum|msx))="([^"#]+)"'
)


def main() -> None:
    missing: list[tuple[str, str]] = []
    lightboxes = 0
    platform_controls: list[int] = []

    for page in PAGES:
        html = page.read_text(encoding="utf-8")
        platform_controls.append(html.count("data-platform-choice"))
        lightboxes += html.count("data-lightbox=")
        for reference in ATTRIBUTES.findall(html):
            if reference.startswith(("http:", "https:", "mailto:")):
                continue
            target = (page.parent / reference.split("?", 1)[0]).resolve()
            if not target.exists():
                missing.append((page.relative_to(ROOT).as_posix(), reference))

    for platform in PLATFORMS:
        required = [
            ROOT / "assets" / "platforms" / platform / "title-screen.png",
            ROOT / "assets" / "platforms" / platform / "title-logo.png",
            *(ROOT / "assets" / "platforms" / platform / "characters" / f"{name}.png" for name in CHARACTERS),
            *(ROOT / "assets" / "platforms" / platform / "items" / f"{name}.png" for name in ITEMS),
        ]
        for target in required:
            if not target.exists():
                missing.append(("platform-matrix", target.relative_to(ROOT).as_posix()))

    print(f"MISSING_LOCAL: {missing or 'None'}")
    print(f"LIGHTBOXES: {lightboxes}")
    print(f"PLATFORM_CONTROLS: {platform_controls}")
    if missing or platform_controls != [5] * len(PAGES):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
