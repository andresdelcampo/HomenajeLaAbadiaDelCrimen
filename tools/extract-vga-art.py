"""Extract authentic character and inventory sprites from GraficosVGA.

Offsets and dimensions come from the preserved VigasocoSDL source included
with this project. The script keeps the original palette and uses nearest-
neighbour enlargement so the source pixels remain visible.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = (
    ROOT
    / "Fuentes"
    / "VigasocoSDL-master"
    / "VigasocoSDL-master"
    / "VigasocoSDL"
    / "roms"
    / "abadia"
    / "GraficosVGA"
)
OUTPUT = ROOT / "Reportaje" / "assets"


CHARACTERS = {
    "guillermo": (54480, None),
    "adso": (58408, None),
    "abad": (67308, 61108),
    "malaquias": (67708, 61108),
    "berengario": (68108, 61108),
    "severino": (66908, 61108),
    "jorge": (68908, 61108),
    "bernardo": (68508, 61108),
}

ITEMS = {
    "libro": 11200,
    "guantes": 34496,
    "gafas": 34304,
    "pergamino": 34880,
    "llave": 34688,
    "lampara": 11008,
}


def palette(data: bytes) -> list[tuple[int, int, int, int]]:
    colours = []
    for index in range(256):
        red, green, blue, _ = data[index * 4 : index * 4 + 4]
        colours.append((red, green, blue, 0 if index == 255 else 255))
    return colours


def indexed_image(
    data: bytes,
    colours: list[tuple[int, int, int, int]],
    offset: int,
    width: int,
    height: int,
) -> Image.Image:
    indexes = data[offset : offset + width * height]
    if len(indexes) != width * height:
        raise ValueError(f"Graphic at {offset} is incomplete")
    image = Image.new("RGBA", (width, height))
    image.putdata([colours[value] for value in indexes])
    return image


def save_display_asset(
    source: Image.Image,
    path: Path,
    canvas: tuple[int, int],
    scale: int,
    bottom_margin: int = 16,
) -> None:
    enlarged = source.resize(
        (source.width * scale, source.height * scale), Image.Resampling.NEAREST
    )
    result = Image.new("RGBA", canvas, (0, 0, 0, 0))
    x = (canvas[0] - enlarged.width) // 2
    y = canvas[1] - enlarged.height - bottom_margin
    result.alpha_composite(enlarged, (x, y))
    path.parent.mkdir(parents=True, exist_ok=True)
    result.save(path, optimize=True)


def main() -> None:
    data = SOURCE.read_bytes()
    colours = palette(data)

    for name, (head_or_frame, body) in CHARACTERS.items():
        if body is None:
            sprite = indexed_image(data, colours, head_or_frame, 20, 34)
        else:
            head = indexed_image(data, colours, head_or_frame, 20, 10)
            habit = indexed_image(data, colours, body, 20, 24)
            sprite = Image.new("RGBA", (20, 34), (0, 0, 0, 0))
            sprite.alpha_composite(head, (0, 0))
            sprite.alpha_composite(habit, (0, 10))
        save_display_asset(
            sprite,
            OUTPUT / "characters" / f"{name}.png",
            canvas=(240, 300),
            scale=8,
            bottom_margin=14,
        )

    for name, offset in ITEMS.items():
        sprite = indexed_image(data, colours, offset, 16, 12)
        save_display_asset(
            sprite,
            OUTPUT / "items" / f"{name}.png",
            canvas=(240, 200),
            scale=10,
            bottom_margin=34,
        )


if __name__ == "__main__":
    main()
