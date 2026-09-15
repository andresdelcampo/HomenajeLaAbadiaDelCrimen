// Playable machines are independent of the site's five visual editions.
// Each entry owns its adapter and media; future systems may use another engine.
const spectrumKeyboardRemap = {
  ArrowUp: 'KeyA',
  ArrowDown: 'KeyZ',
  ArrowLeft: 'KeyK',
  ArrowRight: 'KeyL'
};

export const systems = [{
  id: 'amstrad-cpc',
  name: {
    es: 'Amstrad CPC 6128 · abadía completa (128K)',
    en: 'Amstrad CPC 6128 · full abbey (128K)'
  },
  idle: {
    es: 'Amstrad CPC 6128 · 128K · Español',
    en: 'Amstrad CPC 6128 · 128K · Spanish game'
  },
  adapter: 'rvm-cpc',
  media: './media/abadia-cpc.dsk',
  cover: '../platforms/cpc/title-screen.png',
  command: '|cpm\n',
  warpFrames: 842,
  language: 'es'
}, {
  id: 'amstrad-cpc-64k',
  name: {
    es: 'Amstrad CPC 464/664 · abadía reducida (64K)',
    en: 'Amstrad CPC 464/664 · reduced abbey (64K)'
  },
  idle: {
    es: 'Amstrad CPC 464/664 · 64K · Español',
    en: 'Amstrad CPC 464/664 · 64K · Spanish game'
  },
  adapter: 'rvm-cpc',
  media: './media/abadia-cpc-64k.dsk',
  cover: '../platforms/cpc/title-screen.png',
  command: 'run"abadia64.bas"\n',
  warpFrames: 0,
  language: 'es'
}, {
  id: 'pc-cga',
  name: { es: 'PC CGA · original', en: 'PC CGA · original' },
  idle: { es: 'PC CGA · Original · Español', en: 'PC CGA · Original · Spanish game' },
  adapter: 'dosbox',
  player: 'pc-player.html',
  media: './media/abadia-pc.ima',
  cover: '../platforms/pc/title-screen.png',
  language: 'es'
}, {
  id: 'pc-cga-pirata',
  name: { es: 'PC CGA · pirata', en: 'PC CGA · pirate' },
  idle: { es: 'PC CGA · Pirata · Español', en: 'PC CGA · Pirate · Spanish game' },
  adapter: 'dosbox',
  player: 'pc-player.html',
  media: './media/abadia-pc-pirata.ima',
  cover: '../platforms/pc/title-screen.png',
  language: 'es'
}, {
  id: 'msx-tape',
  name: { es: 'MSX · cinta', en: 'MSX · tape' },
  idle: { es: 'MSX · Cinta · Español', en: 'MSX · Tape · Spanish game' },
  adapter: 'webmsx',
  player: 'msx-player.html',
  media: './media/abadia-msx.cas',
  mediaType: 'tape',
  cover: '../platforms/msx/title-screen.png',
  language: 'es'
}, {
  id: 'msx',
  name: { es: 'MSX · disco', en: 'MSX · disk' },
  idle: { es: 'MSX · Español', en: 'MSX · Spanish game' },
  adapter: 'webmsx',
  player: 'msx-player.html',
  media: './media/abadia-msx.dsk',
  cover: '../platforms/msx/title-screen.png',
  language: 'es'
}, {
  id: 'zx-spectrum-original-tape',
  name: {
    es: 'ZX Spectrum 128K · cinta original',
    en: 'ZX Spectrum 128K · original tape'
  },
  idle: {
    es: 'ZX Spectrum 128K · cinta original · Español',
    en: 'ZX Spectrum 128K · original tape · Spanish game'
  },
  adapter: 'zxm8-spectrum-tape',
  player: 'spectrum-tape-player.html',
  media: './media/abadia-spectrum-original.tzx',
  cover: '../platforms/spectrum/title-screen.png',
  keyMap: spectrumKeyboardRemap,
  // The original tape lacks the stop marker present in the MCM release before
  // its final extra block. Stop at that same boundary during accelerated load.
  tapeFastForwardStopBlock: 9,
  language: 'es'
}, {
  id: 'zx-spectrum-mcm-tape',
  name: {
    es: 'ZX Spectrum 128K · cinta MCM',
    en: 'ZX Spectrum 128K · MCM tape'
  },
  idle: {
    es: 'ZX Spectrum 128K · cinta MCM · Español',
    en: 'ZX Spectrum 128K · MCM tape · Spanish game'
  },
  adapter: 'zxm8-spectrum-tape',
  player: 'spectrum-tape-player.html',
  media: './media/abadia-spectrum-mcm.tzx',
  cover: '../platforms/spectrum/title-screen.png',
  keyMap: spectrumKeyboardRemap,
  language: 'es'
}, {
  id: 'zx-spectrum-plus3',
  name: {
    es: 'ZX Spectrum +3 · 128K',
    en: 'ZX Spectrum +3 · 128K'
  },
  idle: {
    es: 'ZX Spectrum +3 · 128K · Español',
    en: 'ZX Spectrum +3 · 128K · Spanish game'
  },
  adapter: 'rvm-spectrum-plus3',
  media: './media/abadia-spectrum-plus3.dsk',
  cover: '../platforms/spectrum/title-screen.png',
  command: '\n',
  // Avoid the unstable native cursor-key path for this Spectrum title.
  keyMap: spectrumKeyboardRemap,
  // Fast-forward the +3 disk load, then return to normal speed before play.
  warpFrames: 3600,
  language: 'es'
}, {
  id: 'amstrad-pcw',
  name: { es: 'Amstrad PCW 8256 · Habisoft 1.2', en: 'Amstrad PCW 8256 · Habisoft 1.2' },
  idle: { es: 'Amstrad PCW · Habisoft 1.2 · Español', en: 'Amstrad PCW · Habisoft 1.2 · Spanish game' },
  adapter: '1985',
  player: 'pcw-player.html',
  media: './media/abadia-pcw.dsk',
  cover: './1985/title-screen.png',
  language: 'es'
}];
