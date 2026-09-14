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
  command: 'run"abadia64.bas"\n',
  warpFrames: 0,
  language: 'es'
}];
