# Graphics-system source assets

This package is reserved for the future Programming-page explanation of the
room renderer. It contains the complete architectural vocabulary for every
visual edition exposed by the site:

- `pc`, `cpc`, `vga`, `spectrum`, and `msx`;
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

Run `tools/export-graphics-system-assets.ps1` after regenerating the analysis
outputs to refresh this package.
