#!/usr/bin/env python3
"""Build authentic ZX Spectrum and MSX presentation assets.

The Spectrum loading screen and 128 KiB state come from preserved captures and
the supplied RetroVirtualMachine snapshot. Character and object masks are
shared with the preserved CPC graphics and are reduced to each machine's
verified two-colour day palette. Inventory objects are shown inside exact HUD
fragments captured from each original port.
"""

from __future__ import annotations

import base64
from pathlib import Path
import re
import struct
import sys
import zlib

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "Homenaje"
OUTPUT = SITE / "assets" / "platforms"
ROMS = ROOT / "Roms"
SOURCE = (
    ROOT
    / "Fuentes"
    / "VigasocoSDL-master"
    / "VigasocoSDL-master"
    / "VigasocoSDL"
    / "roms"
    / "abadia"
    / "GraficosCPC"
)

SPECTRUM_STATE = ROMS / "abadia.rvmstate"
SPECTRUM_TAPE = ROMS / "La Abadia Del Crimen.tzx"
CAPTURES = SITE / "tools" / "source-captures"
SPECTRUM_LOADING_SCREEN = CAPTURES / "spectrum-title.scr"
# User-supplied references preserved locally for deterministic regeneration:
# https://gamemuseum.es/wp-content/uploads/2012/09/82dfdf771012cafd081bf32a2712.png
MSX_SCREENSHOT = CAPTURES / "msx-day.png"
# https://images.generation-msx.nl/software_title/1a4c1c20.png
MSX_TITLE_SCREENSHOT = CAPTURES / "msx-title.png"

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

GUILLERMO_CHURCH_FRAME = 57240

ITEMS = {
    "libro": 11200,
    "guantes": 34496,
    "gafas": 34304,
    "pergamino": 34880,
    "llave": 34688,
    "lampara": 11008,
}

SPECTRUM_PALETTE = (
    (0, 0, 0, 255),
    (0, 0, 205, 255),
    (205, 0, 0, 255),
    (205, 0, 205, 255),
    (0, 205, 0, 255),
    (0, 205, 205, 255),
    (205, 205, 0, 255),
    (205, 205, 205, 255),
    (0, 0, 0, 255),
    (0, 0, 255, 255),
    (255, 0, 0, 255),
    (255, 0, 255, 255),
    (0, 255, 0, 255),
    (0, 255, 255, 255),
    (255, 255, 0, 255),
    (255, 255, 255, 255),
)

SPECTRUM_BLUE = (0, 0, 205, 255)
SPECTRUM_YELLOW = (255, 255, 0, 255)
MSX_BLACK = (0, 0, 0, 255)
MSX_CREAM = (220, 220, 156, 255)


def tzx_blocks(data: bytes) -> list[tuple[int, bytes]]:
    if not data.startswith(b"ZXTape!\x1a"):
        raise ValueError("Not a TZX file")
    blocks = []
    cursor = 10
    while cursor < len(data):
        block_id = data[cursor]
        cursor += 1
        if block_id == 0x10:
            length = struct.unpack_from("<H", data, cursor + 2)[0]
            cursor += 4
        elif block_id == 0x11:
            length = int.from_bytes(data[cursor + 15:cursor + 18], "little")
            cursor += 18
        elif block_id == 0x20:
            blocks.append((block_id, b""))
            cursor += 2
            continue
        else:
            raise ValueError(f"Unsupported TZX block 0x{block_id:02x}")
        payload = data[cursor:cursor + length]
        if len(payload) != length:
            raise ValueError("Truncated TZX block")
        blocks.append((block_id, payload))
        cursor += length
    return blocks


def loading_screen_from_tape(path: Path) -> bytes:
    for block_id, payload in tzx_blocks(path.read_bytes()):
        if block_id == 0x11 and len(payload) == 6913 and payload[0] == 0:
            return payload[1:]
    raise ValueError("The Spectrum loading-screen block was not found")


def render_spectrum_screen(screen: bytes) -> Image.Image:
    if len(screen) != 6912:
        raise ValueError("A Spectrum screen must contain 6912 bytes")
    image = Image.new("RGBA", (256, 192))
    for y in range(192):
        bitmap_row = ((y & 0xC0) << 5) | ((y & 0x07) << 8) | ((y & 0x38) << 2)
        attribute_row = 6144 + (y // 8) * 32
        for cell_x in range(32):
            bits = screen[bitmap_row + cell_x]
            attribute = screen[attribute_row + cell_x]
            bright = 8 if attribute & 0x40 else 0
            ink = SPECTRUM_PALETTE[bright + (attribute & 0x07)]
            paper = SPECTRUM_PALETTE[bright + ((attribute >> 3) & 0x07)]
            if attribute & 0x80:
                ink, paper = paper, ink
            for bit in range(8):
                image.putpixel((cell_x * 8 + bit, y), ink if bits & (0x80 >> bit) else paper)
    return image


def rvm_frame(path: Path) -> Image.Image:
    text = zlib.decompress(path.read_bytes()).decode("ascii")
    match = re.search(r"data\s*:\s*'([^']+)'", text)
    if not match:
        raise ValueError("The RVM state has no rendered frame")
    rgba = base64.b64decode(match.group(1))
    if len(rgba) != 370 * 288 * 4:
        raise ValueError("Unexpected RVM framebuffer size")
    return Image.frombytes("RGBA", (370, 288), rgba)


def source_sprite(data: bytes, offset: int, width: int, height: int) -> Image.Image:
    indexes = data[offset:offset + width * height]
    if len(indexes) != width * height:
        raise ValueError(f"Incomplete sprite at {offset}")
    image = Image.new("L", (width, height))
    image.putdata(indexes)
    return image


def character_sprite(data: bytes, head_or_frame: int, body: int | None) -> Image.Image:
    if body is None:
        return source_sprite(data, head_or_frame, 20, 34)
    result = Image.new("L", (20, 34), 255)
    result.paste(source_sprite(data, head_or_frame, 20, 10), (0, 0))
    result.paste(source_sprite(data, body, 20, 24), (0, 10))
    return result


def colour_indexes(source: Image.Image, colours: dict[int, tuple[int, int, int, int]]) -> Image.Image:
    result = Image.new("RGBA", source.size)
    result.putdata([colours[value] for value in source.get_flattened_data()])
    return result


def save_display_asset(source: Image.Image, path: Path, canvas: tuple[int, int], scale: int, bottom: int) -> None:
    enlarged = source.resize((source.width * scale, source.height * scale), Image.Resampling.NEAREST)
    result = Image.new("RGBA", canvas, (0, 0, 0, 0))
    result.alpha_composite(enlarged, ((canvas[0] - enlarged.width) // 2, canvas[1] - enlarged.height - bottom))
    path.parent.mkdir(parents=True, exist_ok=True)
    result.save(path, optimize=True)


def inventory_tray(
    tray: Image.Image,
    sprite: Image.Image,
    slots: tuple[tuple[int, int], ...],
    empty: tuple[int, int, int, int],
    occupied: tuple[int, int, int, int],
) -> Image.Image:
    result = tray.copy().convert("RGBA")
    for x, y in slots:
        result.paste(empty, (x, y, x + 16, y + 12))
    middle_x, middle_y = slots[len(slots) // 2]
    result.paste(occupied, (middle_x, middle_y, middle_x + 16, middle_y + 12))
    result.alpha_composite(sprite, (middle_x, middle_y))
    return result


def title_logo(title: Image.Image, crop: tuple[int, int, int, int]) -> Image.Image:
    logo = title.crop(crop).convert("RGBA")
    for y in range(logo.height):
        for x in range(logo.width):
            red, green, blue, alpha = logo.getpixel((x, y))
            if not (red < 100 and green > 100):
                logo.putpixel((x, y), (0, 0, 0, 0))
    bounds = logo.getbbox()
    if bounds is None:
        raise ValueError("Title lettering was not found")
    return logo.crop(bounds)


def build_title_assets() -> None:
    # The game's custom turbo block is not a directly displayable SCR. The
    # preserved standalone loading screen is therefore used when present.
    screen = (
        SPECTRUM_LOADING_SCREEN.read_bytes()
        if SPECTRUM_LOADING_SCREEN.exists()
        else loading_screen_from_tape(SPECTRUM_TAPE)
    )
    title = render_spectrum_screen(screen)
    target = OUTPUT / "spectrum"
    target.mkdir(parents=True, exist_ok=True)
    title.resize((768, 576), Image.Resampling.NEAREST).save(target / "title-screen.png", optimize=True)
    spectrum_logo = title_logo(title, (84, 12, 222, 72))
    spectrum_logo.resize(
        (spectrum_logo.width * 4, spectrum_logo.height * 4),
        Image.Resampling.NEAREST,
    ).save(target / "title-logo.png", optimize=True)

    msx_capture = Image.open(MSX_TITLE_SCREENSHOT).convert("RGBA")
    msx_title = msx_capture.crop((32, 24, 288, 216))
    msx_target = OUTPUT / "msx"
    msx_target.mkdir(parents=True, exist_ok=True)
    msx_title.resize((768, 576), Image.Resampling.NEAREST).save(msx_target / "title-screen.png", optimize=True)
    # Start above and to the left of the lettering so the initial flourish and
    # the highest cyan pixels are not clipped. Keep a small transparent margin
    # after trimming; this prevents the logo from sitting against the top edge.
    msx_logo = title_logo(msx_title, (92, 12, 240, 90))
    msx_logo_padded = Image.new("RGBA", (msx_logo.width + 8, msx_logo.height + 8))
    msx_logo_padded.alpha_composite(msx_logo, (4, 4))
    msx_logo_padded.resize(
        (msx_logo_padded.width * 4, msx_logo_padded.height * 4),
        Image.Resampling.NEAREST,
    ).save(msx_target / "title-logo.png", optimize=True)


def build_sprites() -> None:
    data = SOURCE.read_bytes()
    spectrum_target = OUTPUT / "spectrum"
    msx_target = OUTPUT / "msx"

    spectrum_character_colours = {
        0: SPECTRUM_BLUE,
        16: SPECTRUM_YELLOW,
        17: SPECTRUM_YELLOW,
        255: (0, 0, 0, 0),
    }
    msx_character_colours = {
        0: MSX_BLACK,
        16: MSX_CREAM,
        17: MSX_CREAM,
        255: (0, 0, 0, 0),
    }

    for name, (head_or_frame, body) in CHARACTERS.items():
        source = character_sprite(data, head_or_frame, body)
        for target, colours in (
            (spectrum_target, spectrum_character_colours),
            (msx_target, msx_character_colours),
        ):
            save_display_asset(
                colour_indexes(source, colours),
                target / "characters" / f"{name}.png",
                (240, 300),
                8,
                14,
            )

    spectrum_frame = rvm_frame(SPECTRUM_STATE)
    spectrum_tray = spectrum_frame.crop((126, 220, 206, 240))
    spectrum_slots = ((8, 2), (32, 2), (64, 2))

    msx_capture = Image.open(MSX_SCREENSHOT).convert("RGBA")
    msx_screen = msx_capture.crop((32, 20, 544, 404)).resize((256, 192), Image.Resampling.NEAREST)
    msx_tray = msx_screen.crop((72, 172, 152, 192))
    msx_slots = ((8, 4), (32, 4), (64, 4))

    for name, offset in ITEMS.items():
        source = source_sprite(data, offset, 16, 12)
        spectrum_item = colour_indexes(
            source,
            {93: (0, 0, 0, 0), 95: SPECTRUM_YELLOW, 96: SPECTRUM_YELLOW, 255: (0, 0, 0, 0)},
        )
        msx_item = colour_indexes(
            source,
            {93: (0, 0, 0, 0), 95: MSX_BLACK, 96: MSX_BLACK, 255: (0, 0, 0, 0)},
        )
        save_display_asset(
            inventory_tray(spectrum_tray, spectrum_item, spectrum_slots, SPECTRUM_YELLOW, (0, 0, 0, 255)),
            spectrum_target / "items" / f"{name}.png",
            (400, 125),
            4,
            22,
        )
        save_display_asset(
            inventory_tray(msx_tray, msx_item, msx_slots, MSX_CREAM, MSX_CREAM),
            msx_target / "items" / f"{name}.png",
            (400, 125),
            4,
            22,
        )


def main() -> None:
    build_title_assets()
    build_sprites()
    build_position_guide_characters()


def build_position_guide_characters() -> None:
    data = SOURCE.read_bytes()
    church_source = source_sprite(data, GUILLERMO_CHURCH_FRAME, 16, 33)
    for target, colours in (
        (OUTPUT / "spectrum", {0: SPECTRUM_BLUE, 16: SPECTRUM_YELLOW, 17: SPECTRUM_YELLOW, 255: (0, 0, 0, 0)}),
        (OUTPUT / "msx", {0: MSX_BLACK, 16: MSX_CREAM, 17: MSX_CREAM, 255: (0, 0, 0, 0)}),
    ):
        save_display_asset(
            colour_indexes(church_source, colours),
            target / "characters" / "guillermo-church.png",
            (240, 300),
            8,
            14,
        )


if __name__ == "__main__":
    build_position_guide_characters() if "--position-guide-only" in sys.argv else main()
