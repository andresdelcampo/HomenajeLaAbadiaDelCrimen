"""Export selected clock labels in the original 8x8 dialogue font."""

from __future__ import annotations

import ast
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "Font" / "Font.py"
OUTPUT = ROOT / "Reportaje" / "assets" / "game" / "interface-labels"
FIRST_CODEPOINT = 0x2D
LABELS = {
    "NOCHE": "NOCHE", "PRIMA": "PRIMA", "TERCIA": "TERCIA", "SEXTA": "SEXTA",
    "NONA": "NONA", "VISPERAS": "VÍSPERAS", "COMPLETAS": "COMPLETAS",
    "NIGHT": "NIGHT", "PRIME": "PRIME", "TERCE": "TERCE", "SEXT": "SEXT",
    "NONE": "NONE", "VESPERS": "VESPERS", "COMPLINE": "COMPLINE",
}


def read_font_bytes() -> list[int]:
    tree = ast.parse(SOURCE.read_text(encoding="utf-8"))
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if any(isinstance(target, ast.Name) and target.id == "font_bytes" for target in node.targets):
            return [int(value) for value in ast.literal_eval(node.value)]
    raise RuntimeError(f"font_bytes was not found in {SOURCE}")


def glyph_rows(font_bytes: list[int], letter: str) -> list[int]:
    if letter == "Í":
        rows = glyph_rows(font_bytes, "I")
        rows[0] = 0x10
        return rows
    offset = (ord(letter) - FIRST_CODEPOINT) * 8
    rows = font_bytes[offset : offset + 8]
    if len(rows) != 8:
        raise RuntimeError(f"Missing glyph data for {letter}")
    return rows


def label_svg(font_bytes: list[int], label: str) -> str:
    pixels: list[tuple[int, int]] = []
    advance = 9
    for index, letter in enumerate(label):
        for y, row in enumerate(glyph_rows(font_bytes, letter)):
            for x in range(8):
                if row & (0x80 >> x):
                    pixels.append((index * advance + x, y))
    min_y = min(y for _, y in pixels)
    max_y = max(y for _, y in pixels)
    width = len(label) * advance - 1
    path = "".join(f"M{x} {y}h1v1H{x}z" for x, y in pixels)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {min_y} {width} {max_y - min_y + 1}" '
        'shape-rendering="crispEdges">'
        f'<path d="{path}" fill="#000"/>'
        '</svg>\n'
    )


def main() -> None:
    font_bytes = read_font_bytes()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for filename, label in sorted(LABELS.items()):
        (OUTPUT / f"{filename}.svg").write_text(
            label_svg(font_bytes, label), encoding="utf-8", newline="\n"
        )


if __name__ == "__main__":
    main()
