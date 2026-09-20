# Graphics-system source assets

This package is reserved for the future Programming-page explanation of the
room renderer. It contains the complete architectural vocabulary for every
visual edition exposed by the site:

- `pc`, `cpc`, `vga`, `spectrum`, `msx`, `msx-disk`, and the prepared `pcw` set;
- `day` and `night` palette states for each edition;
- one labeled 256-tile atlas, one labeled 87-block atlas, and 87 individually
  cropped block PNGs in every platform/palette directory.

Every directory has the same interface:

```text
<platform>/<variant>/tile-atlas.png
<platform>/<variant>/block-atlas.png
<platform>/<variant>/blocks/block-02.png ... block-ae.png
```

The CPC and VGA sets apply their artwork to the DOS room/block programs, as
the later resource format does. The Spectrum and MSX sets are reconstructed
from each port's native block pointer table, bytecode, tile masks, and palette
state. The three empty definitions and the two otherwise unused definitions
remain in the atlases because they are real non-zero block-table entries.

The MSX disk uses the same native tile and block pixels as the tape edition,
but not the old blue-on-black approximation. Live execution and the native
colour-table entry points verify that the disk selects the tape's night colour
table by day (`A4h`, `F4h`, `61h`) and the tape's day table at night (`B1h`,
`E1h`, `61h`). Its 116-room stream differs from the tape stream by one byte in
room `72`, so the disk rooms are retained as a separate complete set.

Run `tools/export-graphics-system-assets.ps1` after regenerating the analysis
outputs to refresh this package.

The PCW set comes from Habisoft 1.2's native PCW RAM. Its 32 × 8 monochrome
tiles are displayed at 32 × 16 to correct pixel aspect. Day/night are identical.
Each PCW variant also includes individual `tiles/tile-00.png`–`tile-ff.png`,
`tile-mask-atlas.png`, and tile, block and room JSON manifests. Block images
use the game's dithered background and crop to occupied tile cells. Unused
definitions use explicitly labelled synthetic placements. The PCW set is now
consumed by the site's sixth platform selector alongside the native room and
map assets.
