# ZX-M8XXX runtime

The Spectrum tape player vendors the core of [ZX-M8XXX](https://github.com/Bedazzle/ZX-M8XXX),
version 0.16.3, at commit `9eb5c306da2ad37855685a9b91fee71f6c04a26a` (GPL-3.0).
The core is used because it emulates the 128K machine and supports real-time TZX
turbo loaders. The surrounding debugger and application UI are not included.

`roms/128.rom` is the user-supplied 32 KiB ZX Spectrum 128K ROM used by the local
emulator. Its SHA-256 is `c1ff621d7910105d4ee45c31e9fd8fd0d79a545c78b66c69a562ee1ffbae8d72`.
The ROM remains separate from the game media and is used only by this local player.
