"""Check local media references and the five visual-edition controls."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    ROOT / "index.html",
    *(ROOT / "es" / name for name in ("index.html", "juego.html", "tecnica.html", "graficos.html", "prensa.html", "legado.html")),
    *(ROOT / "en" / name for name in ("index.html", "game.html", "technology.html", "graphics.html", "press.html", "legacy.html")),
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
    parchment_pages: list[str] = []
    parchment_instances: dict[str, int] = {}
    parchment_data = (ROOT / "assets" / "game" / "parchment-data.js").read_text(encoding="utf-8")
    parchment_editions = [platform for platform in PLATFORMS if f'"{platform}":{{' in parchment_data]
    parchment_texts = [text for text in ("opening", "ending") if f'"{text}":{{' in parchment_data]

    for page in PAGES:
        html = page.read_text(encoding="utf-8")
        platform_controls.append(html.count("data-platform-choice"))
        lightboxes += html.count("data-lightbox=")
        parchment_count = html.count("data-parchment ")
        if parchment_count:
            relative_page = page.relative_to(ROOT).as_posix()
            parchment_pages.append(relative_page)
            parchment_instances[relative_page] = parchment_count
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
        for light in ("day", "night"):
            for atlas in ("tile-atlas.png", "block-atlas.png"):
                target = ROOT / "assets" / "programming" / "graphics" / platform / light / atlas
                if not target.exists():
                    missing.append(("graphics-guide", target.relative_to(ROOT).as_posix()))

    print(f"MISSING_LOCAL: {missing or 'None'}")
    print(f"LIGHTBOXES: {lightboxes}")
    print(f"PLATFORM_CONTROLS: {platform_controls}")
    print(f"PARCHMENT_PAGES: {parchment_pages}")
    print(f"PARCHMENT_INSTANCES: {parchment_instances}")
    print(f"PARCHMENT_EDITIONS: {parchment_editions}")
    print(f"PARCHMENT_TEXTS: {parchment_texts}")
    expected_parchment_pages = ["es/juego.html", "en/game.html"]
    expected_parchment_instances = {"es/juego.html": 2, "en/game.html": 2}
    if (
        missing
        or platform_controls != [5] * len(PAGES)
        or parchment_pages != expected_parchment_pages
        or parchment_instances != expected_parchment_instances
        or parchment_editions != list(PLATFORMS)
        or parchment_texts != ["opening", "ending"]
    ):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
