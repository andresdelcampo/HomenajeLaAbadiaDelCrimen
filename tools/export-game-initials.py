"""Export the game's parchment-writing capitals as crisp SVG glyphs."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ASM_SOURCE = (
    ROOT
    / "Fuentes"
    / "vigasocosdl-la-abadia-del-crimen-master"
    / "vigasocosdl-la-abadia-del-crimen-master"
    / "abadia.asm"
)
CPP_SOURCE = ROOT / "Fuentes" / "core" / "abadia" / "Pergamino.cpp"
OUTPUT = ROOT / "Reportaje" / "assets" / "game" / "initials"


def read_asm_glyphs() -> dict[str, list[int]]:
    source = ASM_SOURCE.read_text(encoding="cp1252")
    pointers: dict[str, int] = {}
    for match in re.finditer(
        r"^[0-9A-F]{4}:\s+([0-9A-F]{4})\s+;\s*caracter 0x[0-9a-f]{2}: '([A-Z])'",
        source,
        re.MULTILINE,
    ):
        pointers[match.group(2)] = int(match.group(1), 16)

    glyphs: dict[str, list[int]] = {}
    for letter, address in pointers.items():
        if address == 0:
            continue
        match = re.search(
            rf"^{address:04X}:(.*?)(?=^[0-9A-F]{{4}}:|\Z)",
            source,
            re.MULTILINE | re.DOTALL,
        )
        if not match:
            raise RuntimeError(f"Stroke data for {letter} at {address:04X} was not found")
        values = [int(token, 16) for token in re.findall(r"\b[0-9A-F]{2}\b", match.group(1))]
        glyphs[letter] = values[: next(i for i, value in enumerate(values) if value >> 4 == 0xF)]
    return glyphs


def read_reconstructed_glyph(letter: str, source: str) -> list[int]:
    match = re.search(
        rf"const UINT8 Pergamino::char{ord(letter):02X}\[\]\s*=\s*\{{(.*?)\}};",
        source,
        re.DOTALL,
    )
    if not match:
        raise RuntimeError(f"Reconstructed parchment glyph {letter} was not found")
    values = [int(token, 16) for token in re.findall(r"0x([0-9a-fA-F]{2})", match.group(1))]
    return values[: next(i for i, value in enumerate(values) if value >> 4 == 0xF)]


def read_parchment_glyphs() -> dict[str, list[int]]:
    glyphs = read_asm_glyphs()
    reconstructed = CPP_SOURCE.read_text(encoding="cp1252")
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        if letter not in glyphs:
            glyphs[letter] = read_reconstructed_glyph(letter, reconstructed)
    return glyphs


def glyph_svg(strokes: list[int], color: str) -> str:
    points = [(value & 0x0F, value >> 4) for value in strokes]
    min_x = min(x for x, _ in points)
    min_y = min(y for _, y in points)
    max_x = max(x for x, _ in points)
    max_y = max(y for _, y in points)
    pixels = [f"M{x} {y}h1v1H{x}z" for x, y in points]
    path = "".join(pixels)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x} {min_y} {max_x - min_x + 1} {max_y - min_y + 1}" '
        'shape-rendering="crispEdges">'
        f'<path d="{path}" fill="{color}"/>'
        '</svg>\n'
    )


def main() -> None:
    glyphs = read_parchment_glyphs()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        (OUTPUT / f"{letter}.svg").write_text(
            glyph_svg(glyphs[letter], "#db4b34"), encoding="utf-8", newline="\n"
        )
        if letter == "A":
            (OUTPUT / "A-gold.svg").write_text(
                glyph_svg(glyphs[letter], "#d49a2e"), encoding="utf-8", newline="\n"
            )


if __name__ == "__main__":
    main()
