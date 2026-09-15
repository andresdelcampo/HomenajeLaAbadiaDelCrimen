# 1985 0.4.10 (PCW WebAssembly core)

Upstream: https://github.com/salvogendut/1985/releases/tag/v0.4.10

The unmodified corresponding source is supplied in `source-v0.4.10.zip`.
License: GPL-2.0-only, see `LICENSE.txt`. Firmware retains its separate rights.
The site's `../pcw-player.js` is the independent browser frontend.

## Rebuild

Extract the source archive, activate Emscripten **4.0.14**, and run
`make -C web` from the extracted `1985-0.4.10` directory using GNU Make.
Copy `web/dist/1985.js` and `web/dist/1985.wasm` here.

The checked-in build uses the same source files, include paths and link flags
as `web/Makefile`, compiled together in one invocation of `emcc` on Windows
instead of separate object files. No source changes or runtime patches.
The compiler uses `-O2 -std=c11`, a modular `create1985` factory, growing memory
with 64 MiB initially, and the embedded `roms/pcw_boot.rom`. Exact exports and
runtime methods are in the supplied upstream Makefile.

SHA-256:

- `1985.js`: `e76f1a35dcafa12417e609f0918d6dce7974f7516fc24f7542fa7faaa5e3ead6`
- `1985.wasm`: `f118c9ce77fe6a0a0d0476be0d4cbaa29d8894bc46896b5a472ffbb048d5a27c`

No networking expansion or relay is enabled by this site's frontend.
