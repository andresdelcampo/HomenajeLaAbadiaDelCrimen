from pathlib import Path

from PIL import Image


REPORTAJE = Path(__file__).resolve().parents[1]
ASSETS = REPORTAJE / "assets"


def crop_obsequium() -> None:
    source = Image.open(ASSETS / "ports" / "cpc-3.png").convert("RGB")
    # The untouched CPC status-panel region: title, obedience bar, and ornament.
    crop = source.crop((500, 410, 640, 480))
    crop.save(ASSETS / "game" / "obsequium-cpc.png", optimize=True)


def crop_magazine_map() -> None:
    source = Image.open(ASSETS / "magazines" / "rg-es41-map.jpg").convert("RGB")
    # Preserve the complete printed parchment spread while removing the article below it.
    crop = source.crop((0, 18, source.width, 1000))
    crop.save(ASSETS / "maps" / "interactive-retrogamer-map.jpg", quality=92, optimize=True)


if __name__ == "__main__":
    crop_obsequium()
    crop_magazine_map()
    print("Built Obsequium and magazine-map evidence crops.")
