// Playable machines are independent of the site's five visual editions.
// Each entry owns its adapter and media; future systems may use another engine.
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
  // Avoid RVM's unstable native cursor-key path for this Spectrum title.
  keyMap: {
    ArrowUp: 'KeyA',
    ArrowDown: 'KeyZ',
    ArrowLeft: 'KeyK',
    ArrowRight: 'KeyL'
  },
  // Fast-forward the +3 disk load, then return to normal speed before play.
  warpFrames: 3600,
  language: 'es'
}];
