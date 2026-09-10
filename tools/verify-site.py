"""Check local media references and the five visual-edition controls."""

from pathlib import Path
import json
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
    trace_root = ROOT / "assets" / "programming" / "graphics" / "room-17-trace"
    trace_data_path = trace_root / "trace.json"
    trace_data = json.loads(trace_data_path.read_text(encoding="utf-8")) if trace_data_path.exists() else {}
    trace_placements = trace_data.get("placements", [])
    trace_metrics = {
        "tile_writes", "target_cells", "changed_cells", "new_cells",
        "updated_cells", "occupied_cells",
    }
    trace_frames = {
        light: sorted((trace_root / light).glob("step-*.png"))
        for light in ("day", "night")
    }
    trace_recipe_frames = {
        light: sorted((trace_root / light).glob("recipe-*.png"))
        for light in ("day", "night")
    }
    trace_layer_frames = sorted((trace_root / "layers").glob("*.png"))

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
    print(f"ROOM_TRACE_FRAMES: { {light: len(frames) for light, frames in trace_frames.items()} }")
    print(f"ROOM_TRACE_RECIPE_FRAMES: { {light: len(frames) for light, frames in trace_recipe_frames.items()} }")
    print(f"ROOM_TRACE_PLACEMENTS: {len(trace_placements)}")
    print(f"ROOM_TRACE_LAYER_FRAMES: {[frame.name for frame in trace_layer_frames]}")
    expected_parchment_pages = ["es/juego.html", "en/game.html"]
    expected_parchment_instances = {"es/juego.html": 2, "en/game.html": 2}
    if (
        missing
        or platform_controls != [5] * len(PAGES)
        or parchment_pages != expected_parchment_pages
        or parchment_instances != expected_parchment_instances
        or parchment_editions != list(PLATFORMS)
        or parchment_texts != ["opening", "ending"]
        or any(len(frames) != 33 for frames in trace_frames.values())
        or any(len(frames) != 32 for frames in trace_recipe_frames.values())
        or len(trace_placements) != 33
        or [frame.name for frame in trace_layer_frames] != ["front.png", "rear.png"]
        or any(not trace_metrics.issubset(placement) for placement in trace_placements[1:])
        or not (trace_root / "lamp-demo-cpc-room-68.png").exists()
        or not (trace_root / "trace-data.js").exists()
    ):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
