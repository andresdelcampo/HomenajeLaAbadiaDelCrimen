"""Export the original CPC parchment frame, glyph strokes, and opening texts."""

from __future__ import annotations

import ast
import json
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
CPP_SOURCE = ROOT / "Fuentes" / "core" / "abadia" / "PergaminoTextos.cpp"
CPP_GLYPHS = ROOT / "Fuentes" / "core" / "abadia" / "Pergamino.cpp"
OUTPUT = ROOT / "Homenaje" / "assets" / "game" / "parchment-data.js"


def read_memory(source: str) -> dict[int, int]:
    memory: dict[int, int] = {}
    pattern = re.compile(r"^([0-9A-F]{4}):\s+((?:[0-9A-F]{2}(?:[ -]+|$))+)", re.MULTILINE)
    for match in pattern.finditer(source):
        address = int(match.group(1), 16)
        for token in re.findall(r"[0-9A-F]{2}", match.group(2)):
            memory[address] = int(token, 16)
            address += 1
    return memory


def read_original_spanish(memory: dict[int, int]) -> str:
    values: list[int] = []
    address = 0x7300
    while address in memory:
        value = memory[address]
        values.append(value)
        address += 1
        if value == 0x1A:
            break
    if not values or values[-1] != 0x1A:
        raise RuntimeError("The original Spanish parchment terminator was not found")
    # The original CPC uses the unused w slot for the enye glyph.
    return bytes(values).decode("ascii").replace("w", "ñ")


def read_english_translation(source: str) -> str:
    start = source.index("const unsigned char * Pergamino::pergaminoInicio[8]")
    end = source.index("};", start)
    block = source[start:end]
    entries = re.findall(
        r"\(const unsigned char\*\)\s*((?:\"(?:\\.|[^\"\\])*\"\s*)+)",
        block,
        re.DOTALL,
    )
    if len(entries) < 2:
        raise RuntimeError("The English Vigasoco parchment text was not found")
    fragments = re.findall(r'\"(?:\\.|[^\"\\])*\"', entries[1])
    return "".join(ast.literal_eval(fragment) for fragment in fragments)


def read_asm_glyphs(source: str) -> dict[str, dict[str, object]]:
    pointers: dict[str, int] = {}
    for match in re.finditer(
        r"^[0-9A-F]{4}:\s+([0-9A-F]{4})\s+;\s*caracter 0x([0-9a-f]{2}):",
        source,
        re.MULTILINE,
    ):
        pointers[chr(int(match.group(2), 16))] = int(match.group(1), 16)

    glyphs: dict[str, dict[str, object]] = {}
    for character, address in pointers.items():
        if address == 0:
            continue
        match = re.search(
            rf"^{address:04X}:(.*?)(?=^[0-9A-F]{{4}}:|\Z)",
            source,
            re.MULTILINE | re.DOTALL,
        )
        if not match:
            raise RuntimeError(f"Stroke data for {character!r} at {address:04X} was not found")
        values = [int(token, 16) for token in re.findall(r"\b[0-9A-F]{2}\b", match.group(1))]
        terminator = next(i for i, value in enumerate(values) if value >> 4 == 0xF)
        glyphs[character] = {"points": values[:terminator], "advance": values[terminator] & 0x0F}
    return glyphs


def read_reconstructed_glyph(character: str, source: str) -> dict[str, object]:
    match = re.search(
        rf"const UINT8 Pergamino::char{ord(character):02X}\[\]\s*=\s*\{{(.*?)\}};",
        source,
        re.DOTALL,
    )
    if not match:
        raise RuntimeError(f"Reconstructed parchment glyph {character!r} was not found")
    values = [int(token, 16) for token in re.findall(r"0x([0-9a-fA-F]{2})", match.group(1))]
    terminator = next(i for i, value in enumerate(values) if value >> 4 == 0xF)
    return {"points": values[:terminator], "advance": values[terminator] & 0x0F}


def memory_span(memory: dict[int, int], start: int, length: int) -> list[int]:
    missing = [address for address in range(start, start + length) if address not in memory]
    if missing:
        raise RuntimeError(f"Missing parchment frame data at {missing[0]:04X}")
    return [memory[address] for address in range(start, start + length)]


def main() -> None:
    asm = ASM_SOURCE.read_text(encoding="cp1252")
    cpp_texts = CPP_SOURCE.read_text(encoding="utf-8")
    cpp_glyphs = CPP_GLYPHS.read_text(encoding="cp1252")
    memory = read_memory(asm)
    texts = {
        "es": read_original_spanish(memory),
        "en": read_english_translation(cpp_texts),
    }

    glyphs = read_asm_glyphs(asm)
    required = set("".join(texts.values())) - {" ", "\r", "\n", "\x1a"}
    for character in sorted(required):
        if character not in glyphs:
            glyphs[character] = read_reconstructed_glyph(character, cpp_glyphs)

    data = {
        "version": 2,
        "width": 320,
        "height": 200,
        "editions": {
            "cpc": {
                "label": {"es": "Amstrad CPC · 1987", "en": "Amstrad CPC · 1987"},
                "palette": ["#ff8080", "#800000", "#000000", "#ff0000"],
                "frame": {
                    "top": memory_span(memory, 0x788A, 384),
                    "right": memory_span(memory, 0x7A0A, 384),
                    "left": memory_span(memory, 0x7B8A, 384),
                    "bottom": memory_span(memory, 0x7D0A, 384),
                },
                "glyphs": {character: glyphs[character] for character in sorted(required)},
            },
            # The remaining editions deliberately inherit the original CPC
            # frame and stroke geometry. Only their display palette changes.
            "pc": {
                "label": {"es": "PC CGA · 1988", "en": "PC CGA · 1988"},
                "inherits": "cpc",
                "palette": ["#ffff55", "#000000", "#000000", "#ff5555"],
            },
            "vga": {
                "label": {"es": "Remake PC VGA · 256 colores", "en": "PC VGA remake · 256 colours"},
                "inherits": "cpc",
                "palette": ["#f7e39f", "#1f1b0b", "#000000", "#a70000"],
            },
            "spectrum": {
                "label": {"es": "ZX Spectrum · paleta adaptada", "en": "ZX Spectrum · adapted palette"},
                "inherits": "cpc",
                "palette": ["#ffff00", "#0000cd", "#0000cd", "#0000cd"],
            },
            "msx": {
                "label": {"es": "MSX · paleta adaptada", "en": "MSX · adapted palette"},
                "inherits": "cpc",
                "palette": ["#dcdc9c", "#000000", "#000000", "#000000"],
            },
        },
        "texts": texts,
    }
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        "/* Generated by tools/export-parchment-data.py from the documented game data. */\n"
        f"window.AbadiaParchmentData=Object.freeze({payload});\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes, {len(required)} glyphs)")


if __name__ == "__main__":
    main()
