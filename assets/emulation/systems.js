// Playable machines are independent of the site's five visual editions.
// Each entry owns its adapter and media; future systems may use another engine.
export const systems = [{
  id: 'amstrad-cpc',
  name: 'Amstrad CPC 6128',
  adapter: 'rvm-cpc',
  media: './media/abadia-cpc.dsk',
  command: '|cpm\n',
  warpFrames: 842,
  language: 'es'
}];
