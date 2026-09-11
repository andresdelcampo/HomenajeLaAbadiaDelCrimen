"""Build a WOFF2 outline font from the game's pixel dialogue charset.

Build dependency: ``python -m pip install fonttools brotli``.
"""

from __future__ import annotations

import ast
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "Font" / "Font.py"
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "fonts" / "abadia-dialogue.woff2"
PIXEL = 100
ADVANCE = 900

# Extra 8x10 glyphs documented by the multilingual VigasocoSDL dialogue renderer.
EXTRAS = {
    "Á": [0x18, 0x30, 0x00, 0x3C, 0x66, 0xC6, 0xFE, 0xC6, 0xE6, 0x66],
    "É": [0x18, 0x30, 0x00, 0xDC, 0xE6, 0x60, 0x7C, 0x60, 0xE6, 0xDC],
    "Í": [0x0C, 0x18, 0x00, 0x7E, 0x98, 0x30, 0x30, 0x30, 0x1A, 0xFC],
    "Ó": [0x18, 0x30, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0xC6, 0xEE, 0x7C],
    "Ú": [0x18, 0x30, 0x00, 0xE6, 0x66, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C],
    "Ü": [0x00, 0x6C, 0x00, 0xE6, 0x66, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C],
    "W": [0x00, 0x00, 0x00, 0x66, 0xE6, 0xC6, 0xD6, 0xD6, 0xFE, 0x66],
    "-": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0xFC, 0x00, 0x00],
    "'": [0x00, 0x00, 0x00, 0x30, 0x30, 0x10, 0x20, 0x00, 0x00, 0x00],
    "\"": [0x00, 0x00, 0x66, 0x66, 0x44, 0x00, 0x00, 0x00],
    "«": [0x00, 0x24, 0x48, 0x90, 0x48, 0x24, 0x00, 0x00],
    "»": [0x00, 0x90, 0x48, 0x24, 0x48, 0x90, 0x00, 0x00],
}


def read_font_bytes() -> list[int]:
    tree = ast.parse(SOURCE.read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == "font_bytes" for target in node.targets
        ):
            return [int(value) for value in ast.literal_eval(node.value)]
    raise RuntimeError(f"font_bytes was not found in {SOURCE}")


def source_rows(font_bytes: list[int], character: str) -> list[int]:
    offset = (ord(character) - 0x2D) * 8
    return font_bytes[offset : offset + 8]


def pixel_glyph(rows: list[int]):
    pen = TTGlyphPen(None)
    for row_index, row in enumerate(rows):
        y = (len(rows) - row_index - 1) * PIXEL
        for column in range(8):
            if not row & (0x80 >> column):
                continue
            x = column * PIXEL
            pen.moveTo((x, y))
            pen.lineTo((x + PIXEL, y))
            pen.lineTo((x + PIXEL, y + PIXEL))
            pen.lineTo((x, y + PIXEL))
            pen.closePath()
    return pen.glyph()


def main() -> None:
    font_bytes = read_font_bytes()
    rows_by_character = {
        chr(codepoint): source_rows(font_bytes, chr(codepoint))
        for codepoint in range(0x2D, 0x5C)
    }

    # The original game reuses these charset slots for Spanish dialogue marks.
    rows_by_character[","] = source_rows(font_bytes, "<")
    rows_by_character["."] = source_rows(font_bytes, "=")
    rows_by_character["¿"] = source_rows(font_bytes, "@")
    rows_by_character["Ñ"] = source_rows(font_bytes, "W")
    rows_by_character.update(EXTRAS)

    glyph_rows = {"space": []}
    cmap = {0x20: "space"}
    for character, rows in rows_by_character.items():
        name = f"uni{ord(character):04X}"
        glyph_rows[name] = rows
        cmap[ord(character)] = name
        if "A" <= character <= "Z":
            cmap[ord(character.lower())] = name
        if character in "ÁÉÍÓÚÜÑ":
            cmap[ord(character.lower())] = name

    cmap.update({0x2018: "uni0027", 0x2019: "uni0027", 0x201C: "uni0022", 0x201D: "uni0022"})

    glyph_order = [".notdef", *glyph_rows]
    glyphs = {".notdef": pixel_glyph([0x7E, 0x42, 0x5A, 0x5A, 0x42, 0x7E, 0x00, 0x00])}
    glyphs.update({name: pixel_glyph(rows) for name, rows in glyph_rows.items()})
    metrics = {name: (ADVANCE, 50) for name in glyph_order}

    builder = FontBuilder(1000, isTTF=True)
    builder.setupGlyphOrder(glyph_order)
    builder.setupCharacterMap(cmap)
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics(metrics)
    builder.setupHorizontalHeader(ascent=1000, descent=0)
    builder.setupNameTable({
        "familyName": "Abadia Dialogue", "styleName": "Regular",
        "uniqueFontIdentifier": "Abadia Dialogue 1.0", "fullName": "Abadia Dialogue",
        "psName": "AbadiaDialogue-Regular", "version": "Version 1.0",
    })
    builder.setupOS2(
        sTypoAscender=1000, sTypoDescender=0, sTypoLineGap=200,
        usWinAscent=1000, usWinDescent=0,
    )
    builder.setupPost()
    builder.setupMaxp()
    builder.font.flavor = "woff2"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    builder.font.save(OUTPUT)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
