#!/usr/bin/env python3
"""Extract RAM banks and the rendered frame from a RetroVirtualMachine state."""

from __future__ import annotations

import argparse
import base64
import binascii
from pathlib import Path
import re
import struct
import zlib


FRAME_WIDTH = 370
FRAME_HEIGHT = 288
BANK_SIZE = 16 * 1024


def decode_state(path: Path) -> str:
    return zlib.decompress(path.read_bytes()).decode("ascii")


def extract_frame(text: str) -> bytes:
    match = re.search(r"data\s*:\s*'([^']+)'", text)
    if not match:
        raise ValueError("The RVM state has no rendered-frame data block")
    rgba = base64.b64decode(match.group(1))
    expected = FRAME_WIDTH * FRAME_HEIGHT * 4
    if len(rgba) != expected:
        raise ValueError(f"Unexpected frame size: {len(rgba)} bytes, expected {expected}")
    return rgba


def extract_ram_banks(text: str) -> list[bytes]:
    banks = []
    for value in re.findall(r"<([^>]+)>", text):
        bank = zlib.decompress(base64.b64decode(value))
        if len(bank) == BANK_SIZE:
            banks.append(bank)
    if len(banks) != 8:
        raise ValueError(f"Expected eight 16 KiB RAM banks, found {len(banks)}")
    return banks


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    body = kind + payload
    return struct.pack(">I", len(payload)) + body + struct.pack(">I", binascii.crc32(body))


def write_rgba_png(path: Path, width: int, height: int, rgba: bytes) -> None:
    stride = width * 4
    scanlines = b"".join(
        b"\x00" + rgba[y * stride:(y + 1) * stride]
        for y in range(height)
    )
    png = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + png_chunk(b"IDAT", zlib.compress(scanlines, 9))
        + png_chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def render_1bpp(data: bytes, width: int = 256) -> bytes:
    if width % 8:
        raise ValueError("1bpp render width must be divisible by eight")
    pixels = bytearray()
    for value in data:
        for bit in range(7, -1, -1):
            pixels.extend((255, 255, 0, 255) if value & (1 << bit) else (0, 0, 205, 255))
    expected_height = len(data) * 8 // width
    if len(pixels) != width * expected_height * 4:
        raise ValueError("1bpp atlas size mismatch")
    return bytes(pixels)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("state", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    text = decode_state(args.state)
    banks = extract_ram_banks(text)
    frame = extract_frame(text)

    args.output.mkdir(parents=True, exist_ok=True)
    for index, bank in enumerate(banks):
        (args.output / f"ram-bank-{index}.bin").write_bytes(bank)
        write_rgba_png(
            args.output / f"ram-bank-{index}-1bpp.png",
            256,
            len(bank) * 8 // 256,
            render_1bpp(bank),
        )

    write_rgba_png(args.output / "frame.png", FRAME_WIDTH, FRAME_HEIGHT, frame)

    machine = re.search(r"class\s*:\s*'([^']+)'", text)
    latch = re.search(r"memory7f\s*:\s*(\d+)", text)
    print(f"machine={machine.group(1) if machine else 'unknown'}")
    print(f"memory7f={latch.group(1) if latch else 'unknown'}")
    print(f"banks={len(banks)} x {BANK_SIZE} bytes")
    print(f"frame={FRAME_WIDTH}x{FRAME_HEIGHT} RGBA")


if __name__ == "__main__":
    main()
