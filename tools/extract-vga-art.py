"""Extract character and inventory sprites for each visual edition.

Offsets and dimensions come from the preserved VigasocoSDL source included
with this project. The script keeps each original palette and uses nearest-
neighbour enlargement so the source pixels remain visible. Both sets are
written to platform directories; CPC is also refreshed in the site's canonical
character and item paths because it is the default visual edition. The PC CGA
edition retains the original CPC pixel masks. Character inks follow the PC
screenshots; inventory inks are mapped per object from byte-for-byte matches in
the preserved PC memory dump, because the port did not use one universal item
palette.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = (
    ROOT
    / "Fuentes"
    / "VigasocoSDL-master"
    / "VigasocoSDL-master"
    / "VigasocoSDL"
    / "roms"
    / "abadia"
)
OUTPUT = ROOT / "Homenaje" / "assets"
PC_SCREENSHOT = OUTPUT / "ports" / "pc-3.png"
CPC_SCREENSHOT = OUTPUT / "ports" / "cpc-3.png"


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


PC_CGA_CHARACTER_COLOURS = {
    (0, 0, 0, 255): (0, 0, 0, 255),
    (255, 131, 0, 255): (255, 85, 85, 255),
    (255, 255, 131, 255): (255, 255, 85, 255),
}

PC_CGA_ITEM_BACKGROUND = (255, 255, 85, 255)
CPC_ITEM_BACKGROUND = (0, 146, 170, 255)

# PC memory offsets b112/b0e2 use black, red, green for book/lamp; offsets
# c7d2/c7a2/c832/c802 use black, green, red for gloves/glasses/scroll/key.
PC_CGA_ITEM_COLOURS = {
    "libro": {
        (0, 0, 0, 255): (0, 0, 0, 255),
        (255, 131, 0, 255): (255, 85, 85, 255),
        (255, 255, 131, 255): (85, 255, 85, 255),
    },
    "lampara": {
        (0, 0, 0, 255): (0, 0, 0, 255),
        (255, 131, 0, 255): (255, 85, 85, 255),
        (255, 255, 131, 255): (85, 255, 85, 255),
    },
    "guantes": {
        (0, 0, 0, 255): (0, 0, 0, 255),
        (255, 131, 0, 255): (85, 255, 85, 255),
        (255, 255, 131, 255): (255, 85, 85, 255),
    },
    "gafas": {
        (0, 0, 0, 255): (0, 0, 0, 255),
        (255, 131, 0, 255): (85, 255, 85, 255),
        (255, 255, 131, 255): (255, 85, 85, 255),
    },
    "pergamino": {
        (0, 0, 0, 255): (0, 0, 0, 255),
        (255, 131, 0, 255): (85, 255, 85, 255),
        (255, 255, 131, 255): (255, 85, 85, 255),
    },
    "llave": {
        (0, 0, 0, 255): (0, 0, 0, 255),
        (255, 131, 0, 255): (85, 255, 85, 255),
        (255, 255, 131, 255): (255, 85, 85, 255),
    },
}

PC_CGA_ITEM_ENCODING = {
    "libro": (0xB112, {255: 3, 93: 0, 95: 2, 96: 1}),
    "lampara": (0xB0E2, {255: 3, 93: 0, 95: 2, 96: 1}),
    "guantes": (0xC7D2, {255: 3, 93: 0, 95: 1, 96: 2}),
    "gafas": (0xC7A2, {255: 3, 93: 0, 95: 1, 96: 2}),
    "pergamino": (0xC832, {255: 3, 93: 0, 95: 1, 96: 2}),
    "llave": (0xC802, {255: 3, 93: 0, 95: 1, 96: 2}),
}

# Native 320x200 coordinates in the preserved PC screenshot. The crop is the
# complete left-hand inventory tray: three 16x12 yellow slots plus the original
# ornamental surround. Individual catalogue objects are placed in its centre
# slot, leaving the other two empty so the authentic HUD context stays legible.
PC_INVENTORY_TRAY = (96, 172, 160, 192)
PC_INVENTORY_SLOTS = ((100, 176), (120, 176), (140, 176))
CPC_INVENTORY_TRAY = (128, 220, 192, 240)
CPC_INVENTORY_SLOTS = ((132, 224), (152, 224), (172, 224))
VGA_MARKER_OFFSET = 0xB200


def pc_cga_sprite(
    source: Image.Image,
    colours: dict[tuple[int, int, int, int], tuple[int, int, int, int]],
    transparent_colour: tuple[int, int, int, int] | None = None,
) -> Image.Image:
    """Convert a CPC sprite mask with a verified PC CGA colour mapping."""
    result = source.copy().convert("RGBA")
    for y in range(result.height):
        for x in range(result.width):
            pixel = result.getpixel((x, y))
            mapped = transparent_colour if pixel[3] == 0 and transparent_colour else colours.get(pixel, pixel)
            result.putpixel((x, y), mapped)
    return result


def verify_pc_item_encodings(cpc_data: bytes) -> None:
    """Prove that each CPC mask maps exactly to the preserved packed PC icon."""
    pc_memory = (ROOT / "ABADIA_LOADED.BIN").read_bytes()
    for name, (memory_offset, indexes) in PC_CGA_ITEM_ENCODING.items():
        source_offset = ITEMS[name]
        pixels = cpc_data[source_offset : source_offset + 16 * 12]
        packed = bytes(
            sum(indexes[pixels[y * 16 + x + index]] << (6 - 2 * index) for index in range(4))
            for y in range(12)
            for x in range(0, 16, 4)
        )
        if pc_memory[memory_offset : memory_offset + len(packed)] != packed:
            raise ValueError(f"PC CGA item verification failed for {name}")


def palette(
    data: bytes,
    offset: int = 0,
    transparent_index: int | None = 255,
) -> list[tuple[int, int, int, int]]:
    colours = []
    for index in range(256):
        start = offset + index * 4
        red, green, blue, _ = data[start : start + 4]
        colours.append((red, green, blue, 0 if index == transparent_index else 255))
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


def inventory_display(
    sprite: Image.Image,
    screenshot_path: Path,
    screen_size: tuple[int, int],
    crop: tuple[int, int, int, int],
    slots: tuple[tuple[int, int], ...],
    background: tuple[int, int, int, int],
) -> Image.Image:
    """Present an exact item inside an unaltered three-slot HUD tray."""
    screenshot = Image.open(screenshot_path).convert("RGBA")
    native_screen = screenshot.resize(screen_size, Image.Resampling.NEAREST)
    return inventory_display_from_screen(sprite, native_screen, crop, slots, background)


def inventory_display_from_screen(
    sprite: Image.Image,
    native_screen: Image.Image,
    crop: tuple[int, int, int, int],
    slots: tuple[tuple[int, int], ...],
    background: tuple[int, int, int, int],
) -> Image.Image:
    """Place an exact item in a tray already available as native pixels."""
    left, top, right, bottom = crop
    tray = native_screen.crop((left, top, right, bottom))

    # The source screenshot has the spectacles in its third slot. Restore all
    # three fields before inserting the requested verified item in the middle.
    for slot_x, slot_y in slots:
        tray.paste(
            background,
            (slot_x - left, slot_y - top, slot_x - left + 16, slot_y - top + 12),
        )
    tray.alpha_composite(sprite, (slots[1][0] - left, slots[1][1] - top))
    return tray


def build_cpc_title_logo() -> None:
    """Make the manually maintained CPC title background transparent."""
    path = OUTPUT / "platforms" / "cpc" / "title-logo.png"
    source = Image.open(path).convert("RGBA")
    result = source.copy()
    result.putdata(
        [
            (red, green, blue, 0 if max(red, green, blue) <= 2 else alpha)
            for red, green, blue, alpha in source.getdata()
        ]
    )
    result.save(path, optimize=True)


def build_vga_title_assets(vga_data: bytes) -> None:
    """Extract the remake's own VGA presentation and untouched title lettering."""
    intro_colours = palette(vga_data, offset=0x1000, transparent_index=None)
    title = indexed_image(vga_data, intro_colours, 0x1ADF0, 320, 200)
    output = OUTPUT / "platforms" / "vga"
    output.mkdir(parents=True, exist_ok=True)
    title.resize((640, 400), Image.Resampling.NEAREST).save(
        output / "title-screen.png", optimize=True
    )

    # Include the complete terminal flourish of the final "n". The previous
    # right edge at x=281 cut through it in the generated transparent logo.
    logo = title.crop((92, 0, 320, 86))
    for y in range(logo.height):
        for x in range(logo.width):
            red, green, blue, _ = logo.getpixel((x, y))
            if red == green == blue == 0:
                logo.putpixel((x, y), (0, 0, 0, 0))

    # The monk overlaps the left edge, but is disconnected from the lettering.
    pending = [(0, y) for y in range(logo.height) if logo.getpixel((0, y))[3]]
    seen: set[tuple[int, int]] = set()
    while pending:
        x, y = pending.pop()
        if (x, y) in seen or not logo.getpixel((x, y))[3]:
            continue
        seen.add((x, y))
        logo.putpixel((x, y), (0, 0, 0, 0))
        for neighbour in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= neighbour[0] < logo.width and 0 <= neighbour[1] < logo.height:
                pending.append(neighbour)

    # The wider crop reaches the book beneath the title. Its pixels cannot be
    # flood-filled away because they touch "Crimen" in the source artwork.
    # Keep only colours already present in the clean pre-extension lettering.
    original_width = 281 - 92
    title_colours = {
        logo.getpixel((x, y))[:3]
        for y in range(logo.height)
        for x in range(original_width)
        if logo.getpixel((x, y))[3]
    }
    for y in range(logo.height):
        for x in range(original_width, logo.width):
            colour = logo.getpixel((x, y))[:3]
            is_book_contact = y >= 76 and colour not in {
                (55, 55, 75),
                (71, 71, 103),
                (79, 79, 115),
            }
            if colour not in title_colours or is_book_contact:
                logo.putpixel((x, y), (0, 0, 0, 0))
    for y in range(68, logo.height):
        for x in range(50):
            logo.putpixel((x, y), (0, 0, 0, 0))
    bounds = logo.getbbox()
    original_bounds = logo.crop((0, 0, original_width, logo.height)).getbbox()
    if bounds is None or original_bounds is None:
        raise ValueError("VGA title lettering was not found")
    # Constrain the vertical extent to the already-clean original title crop;
    # this removes the one-row book contact without shortening the new ending.
    logo = logo.crop((bounds[0], original_bounds[1], bounds[2], original_bounds[3]))
    logo.resize(
        (logo.width * 4, logo.height * 4),
        Image.Resampling.NEAREST,
    ).save(output / "title-logo.png", optimize=True)


def main() -> None:
    cpc_data = (SOURCE_ROOT / "GraficosCPC").read_bytes()
    vga_data = (SOURCE_ROOT / "GraficosVGA").read_bytes()
    verify_pc_item_encodings(cpc_data)
    vga_marker = indexed_image(
        vga_data,
        palette(vga_data, transparent_index=None),
        VGA_MARKER_OFFSET,
        256,
        32,
    )
    vga_screen = Image.new("RGBA", (320, 200), (0, 0, 0, 255))
    vga_screen.alpha_composite(vga_marker, (32, 160))

    for platform in ("cpc", "vga"):
        data = cpc_data if platform == "cpc" else vga_data
        colours = palette(data)
        platform_output = OUTPUT / "platforms" / platform

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
                platform_output / "characters" / f"{name}.png",
                canvas=(240, 300),
                scale=8,
                bottom_margin=14,
            )
            if platform == "cpc":
                save_display_asset(
                    sprite,
                    OUTPUT / "characters" / f"{name}.png",
                    canvas=(240, 300),
                    scale=8,
                    bottom_margin=14,
                )
                save_display_asset(
                    pc_cga_sprite(sprite, PC_CGA_CHARACTER_COLOURS),
                    OUTPUT / "platforms" / "pc" / "characters" / f"{name}.png",
                    canvas=(240, 300),
                    scale=8,
                    bottom_margin=14,
                )

        for name, offset in ITEMS.items():
            sprite = indexed_image(data, colours, offset, 16, 12)
            if platform == "cpc":
                cpc_item = pc_cga_sprite(
                    sprite,
                    {},
                    transparent_colour=CPC_ITEM_BACKGROUND,
                )
                cpc_display = inventory_display(
                    cpc_item,
                    CPC_SCREENSHOT,
                    (384, 288),
                    CPC_INVENTORY_TRAY,
                    CPC_INVENTORY_SLOTS,
                    CPC_ITEM_BACKGROUND,
                )
                save_display_asset(
                    cpc_display,
                    platform_output / "items" / f"{name}.png",
                    canvas=(320, 125),
                    scale=4,
                    bottom_margin=22,
                )
                save_display_asset(
                    cpc_display,
                    OUTPUT / "items" / f"{name}.png",
                    canvas=(320, 125),
                    scale=4,
                    bottom_margin=22,
                )
                pc_item = pc_cga_sprite(
                    sprite,
                    PC_CGA_ITEM_COLOURS[name],
                    transparent_colour=PC_CGA_ITEM_BACKGROUND,
                )
                save_display_asset(
                    inventory_display(
                        pc_item,
                        PC_SCREENSHOT,
                        (320, 200),
                        PC_INVENTORY_TRAY,
                        PC_INVENTORY_SLOTS,
                        PC_CGA_ITEM_BACKGROUND,
                    ),
                    OUTPUT / "platforms" / "pc" / "items" / f"{name}.png",
                    canvas=(320, 125),
                    scale=4,
                    bottom_margin=22,
                )
            else:
                save_display_asset(
                    inventory_display_from_screen(
                        sprite,
                        vga_screen,
                        PC_INVENTORY_TRAY,
                        PC_INVENTORY_SLOTS,
                        (0, 0, 0, 255),
                    ),
                    platform_output / "items" / f"{name}.png",
                    canvas=(320, 125),
                    scale=4,
                    bottom_margin=22,
                )

    build_cpc_title_logo()
    build_vga_title_assets(vga_data)


if __name__ == "__main__":
    main()
