const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const create = require('../assets/emulation/1985/1985.js');

test('PCW 1.2 boots, exits the manuscript, and responds to cursor keys', async () => {
  const disk = fs.readFileSync(path.join(__dirname, '../assets/emulation/media/abadia-pcw.dsk'));
  assert.equal(createHash('sha256').update(disk).digest('hex'), '1346e5cd92a19c465541ca8b67e8bc5208edd69dc547c70081e95673af828353');
  async function boot() {
    const m = await create();
    m._poc_init(); m._poc_set_dksound(1);
    m.FS.writeFile('/abadia.dsk', disk);
    assert.equal(m.ccall('poc_load_disk', 'number', ['string'], ['/abadia.dsk']), 0);
    m._poc_reset();
    return m;
  }
  function step(m, n) { for (let i = 0; i < n; i++) { m._poc_step(); m._poc_audio_reset(); } }
  function screen(m) { return Buffer.from(m.HEAPU8.slice(m._poc_pixels(), m._poc_pixels() + 720 * 256 * 4)); }
  const reference = await boot();
  const controlled = await boot();
  for (const m of [reference, controlled]) {
    step(m, 1000);
    const manuscript = screen(m);
    assert.ok(new Set(manuscript).size > 2, 'boot renders visible pixels');
    m._poc_key(44, 1); step(m, 1500); m._poc_key(44, 0); step(m, 1000);
    assert.notDeepEqual(screen(m), manuscript, 'Space exits the manuscript');
  }
  assert.deepEqual(screen(reference), screen(controlled), 'identical boots reach identical gameplay');
  controlled._poc_key(80, 1); step(controlled, 20); controlled._poc_key(80, 0);
  step(reference, 20);
  assert.notDeepEqual(screen(reference), screen(controlled), 'left cursor changes gameplay relative to a no-input run');
});
