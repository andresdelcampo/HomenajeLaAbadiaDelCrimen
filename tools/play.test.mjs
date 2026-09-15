import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { systems } from '../assets/emulation/systems.js';

const source = readFileSync(new URL('../play.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/, '');
function host({ search = '', storedFrames = null, lang = 'en' } = {}) {
  const listeners = new Map();
  class Element {
    constructor() { this.events = new Map(); this.children = []; this.attributes = {}; this.value = ''; }
    addEventListener(name, callback) { this.events.set(name, callback); }
    fire(name, event = { preventDefault() {} }) { return this.events.get(name)?.(event); }
    requestFullscreen() {
      document.fullscreenElement = this;
      listeners.get('document:fullscreenchange')?.();
      return Promise.resolve();
    }
    append(child) { this.children.push(child); if (!this.value) this.value = child.value; }
    replaceChildren(child) { this.children = [child]; }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() {}
  }
  const elements = new Map();
  const element = name => {
    if (!elements.has(name)) elements.set(name, new Element());
    return elements.get(name);
  };
  const messages = [];
  const document = {
    documentElement: { lang }, fullscreenEnabled: true, fullscreenElement: null,
    exitFullscreen() {
      this.fullscreenElement = null;
      listeners.get('document:fullscreenchange')?.();
      return Promise.resolve();
    },
    querySelector: element,
    addEventListener(name, callback) { listeners.set(`document:${name}`, callback); },
    createElement(tag) {
      const item = new Element();
      if (tag === 'iframe') item.contentWindow = { postMessage: msg => messages.push(msg) };
      return item;
    }
  };
  const location = { href: `https://example.test/tribute/en/play.html${search}`, origin: 'https://example.test', search };
  const localStorage = { getItem() { return storedFrames; }, setItem(_key, value) { storedFrames = value; } };
  runInNewContext(source, {
    document, location, localStorage, systems, URL, URLSearchParams,
    window: { addEventListener: (name, callback) => listeners.set(name, callback) }
  });
  const frame = () => element('.play-screen').children[0];
  const report = (type, extra = {}, origin = location.origin, sender = frame().contentWindow) => listeners.get('message')({
    origin, source: sender, data: { source: 'abbey-player', type, ...extra }
  });
  return { element, frame, report, messages };
}

test('nested deployment paths resolve to local media/player and controls start disabled', () => {
  const h = host();
  assert.equal(new URL(h.frame().src).pathname, '/tribute/assets/emulation/player.html');
  assert.equal(new URL(h.frame().src).searchParams.get('system'), 'amstrad-cpc');
  assert.equal(new URL(h.frame().src).searchParams.get('v'), '20260915-fullscreen3');
  assert.equal(h.element('[data-play="pause"]').disabled, true);
});

test('CPC startup warp stops on the title screen instead of entering the manuscript', () => {
  assert.equal(systems[0].warpFrames, 842);
});

test('hidden Spectrum tuning ignores old saved values and uses the fixed startup', () => {
  const h = host({ search: '?system=zx-spectrum-plus3', storedFrames: '1800' });
  const url = new URL(h.frame().src);
  assert.equal(url.searchParams.get('warpFrames'), '3600');
  assert.equal(h.element('.play-boot-tuning').hidden, true);
});

test('PC CGA selections route to the DOSBox player and preserve the supplied image hashes', () => {
  for (const [id, hash] of [
    ['pc-cga', '1189de5791581ab931068a6436e72a7d39486ba094c8e005a53dd49702692a3c'],
    ['pc-cga-pirata', 'b8040fb0999b2adf1a810d651fa6546fbec7ce97021b206d27e5a6780bcca625']
  ]) {
    const system = systems.find(item => item.id === id);
    const disk = readFileSync(new URL(`../assets/emulation/${system.media.slice(2)}`, import.meta.url));
    const h = host({ search: `?system=${id}` });
    assert.equal(new URL(h.frame().src).pathname, '/tribute/assets/emulation/pc-player.html');
    assert.equal(system.adapter, 'dosbox');
    assert.equal(disk.length, 737280);
    assert.equal(createHash('sha256').update(disk).digest('hex'), hash);
  }
});

test('only the current same-origin player can enable playback controls', () => {
  const h = host();
  h.report('running', {}, 'https://unrelated.test');
  h.report('running', {}, 'https://example.test', {});
  assert.equal(h.element('[data-play="pause"]').disabled, true);
  h.report('running', { paused: false, muted: false });
  assert.equal(h.element('[data-play="pause"]').disabled, false);
});

test('MSX uses its own player and preserves the supplied boot disk', () => {
  const h = host({ search: '?system=msx' });
  assert.equal(new URL(h.frame().src).pathname, '/tribute/assets/emulation/msx-player.html');
  const disk = readFileSync(new URL('../assets/emulation/media/abadia-msx.dsk', import.meta.url));
  assert.equal(disk.length, 368640);
  assert.equal(createHash('sha256').update(disk).digest('hex'), '7734ef8610a0616d9f35107c61969730942e4bea48d10d1e89436bb31c2f4e13');
});

test('the menu follows the chronological playable-edition order', () => {
  const h = host();
  assert.deepEqual(h.element('#play-system').children.map(option => option.value), [
    'amstrad-cpc', 'amstrad-cpc-64k', 'pc-cga', 'pc-cga-pirata', 'msx-tape', 'msx', 'zx-spectrum-original-tape', 'zx-spectrum-mcm-tape', 'zx-spectrum-plus3', 'amstrad-pcw'
  ]);
  assert.equal(h.element('#play-system').value, 'amstrad-cpc');
  const spanish = host({ lang: 'es' });
  assert.deepEqual(spanish.element('#play-system').children.map(option => option.value), [
    'amstrad-cpc', 'amstrad-cpc-64k', 'pc-cga', 'pc-cga-pirata', 'msx-tape', 'msx', 'zx-spectrum-original-tape', 'zx-spectrum-mcm-tape', 'zx-spectrum-plus3', 'amstrad-pcw'
  ]);
});

test('MSX tape uses the original CAS and the MSX player', () => {
  const h = host({ search: '?system=msx-tape' });
  assert.equal(new URL(h.frame().src).pathname, '/tribute/assets/emulation/msx-player.html');
  const tape = readFileSync(new URL('../assets/emulation/media/abadia-msx.cas', import.meta.url));
  assert.equal(systems.find(item => item.id === 'msx-tape').mediaType, 'tape');
  assert.equal(tape.length, 103840);
  assert.equal(createHash('sha256').update(tape).digest('hex'), '309e628a5b426423d90816a89969688b5c14e491f67da72c7b2234f6e05df4e9');
});

test('Spectrum tape releases use the preserved TZX images and tape player', () => {
  for (const [id, length, hash] of [
    ['zx-spectrum-original-tape', 99287, '0250518805e44747cd7e1396545c5eca39e4b5d1c349bf7937c55560477010c0'],
    ['zx-spectrum-mcm-tape', 99290, 'e9c8219fccb6ec14b90c46ca07501ba35d7885bfd224a5ed3b9556507ee539d2']
  ]) {
    const system = systems.find(item => item.id === id);
    const tape = readFileSync(new URL(`../assets/emulation/${system.media.slice(2)}`, import.meta.url));
    assert.equal(system.adapter, 'zxm8-spectrum-tape');
    assert.equal(system.player, 'spectrum-tape-player.html');
    assert.deepEqual(system.keyMap, {
      ArrowUp: 'KeyA', ArrowDown: 'KeyZ', ArrowLeft: 'KeyK', ArrowRight: 'KeyL'
    });
    assert.equal(system.tapeFastForwardStopBlock, id === 'zx-spectrum-original-tape' ? 9 : undefined);
    assert.equal(tape.length, length);
    assert.equal(createHash('sha256').update(tape).digest('hex'), hash);
  }
});

test('clicking Pause stays paused even when focus loss arrives before click', () => {
  const h = host();
  h.report('running', { paused: false, muted: false });
  const pause = h.element('[data-play="pause"]');
  pause.fire('pointerdown');
  h.report('state', { paused: true, muted: false });
  pause.fire('click');
  assert.equal(h.messages.at(-1).action, 'pause');
  pause.fire('click');
  assert.equal(h.messages.at(-1).action, 'resume');
});

test('clicking sound preserves the running state even when focus loss arrives before click', () => {
  const h = host();
  h.report('running', { paused: false, muted: false });
  const mute = h.element('[data-play="mute"]');
  let prevented = false;
  mute.fire('pointerdown', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  h.report('state', { paused: true, muted: false });
  mute.fire('click');
  assert.deepEqual(h.messages.slice(-2).map(message => message.action), ['mute', 'resume']);

  const pausedHost = host();
  pausedHost.report('running', { paused: true, muted: false });
  const pausedMute = pausedHost.element('[data-play="mute"]');
  pausedMute.fire('pointerdown');
  pausedMute.fire('click');
  assert.deepEqual(pausedHost.messages.slice(-1).map(message => message.action), ['mute']);
});

test('Full screen is available only while an active game is running', async () => {
  const h = host();
  const fullscreen = h.element('[data-play="fullscreen"]');
  assert.equal(fullscreen.disabled, true);

  h.report('running', { paused: false, muted: false });
  assert.equal(h.messages.at(-1).action, 'fullscreen');
  assert.equal(h.messages.at(-1).value, false);
  assert.equal(fullscreen.disabled, false);
  let prevented = false;
  fullscreen.fire('pointerdown', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  await fullscreen.fire('click');
  const fullscreenMessage = h.messages.filter(message => message.action === 'fullscreen').at(-1);
  assert.equal(fullscreenMessage.action, 'fullscreen');
  assert.equal(fullscreenMessage.value, true);

  const pausedHost = host();
  pausedHost.report('running', { paused: true, muted: false });
  const pausedFullscreen = pausedHost.element('[data-play="fullscreen"]');
  assert.equal(pausedFullscreen.disabled, true);
  pausedFullscreen.fire('pointerdown');
  await pausedFullscreen.fire('click');
  assert.equal(pausedHost.messages.at(-1).action, 'fullscreen');
  assert.equal(pausedHost.messages.at(-1).value, false);
});

test('cancel preserves the session; confirmed restart replaces it and rejects stale messages', () => {
  const h = host();
  h.report('running', { paused: false, muted: false });
  const original = h.frame();
  h.element('[data-play="restart"]').fire('click');
  h.element('[data-play="cancel"]').fire('click');
  assert.equal(h.frame(), original);
  h.element('[data-play="restart"]').fire('click');
  h.element('[data-play="confirm"]').fire('click');
  assert.notEqual(h.frame(), original);
  h.report('running', {}, 'https://example.test', original.contentWindow);
  assert.equal(h.element('[data-play="pause"]').disabled, true);
});

test('the configured 128K CPC disk is an extended image with a system boot sector', () => {
  const disk = readFileSync(new URL('../assets/emulation/media/abadia-cpc.dsk', import.meta.url));
  assert.equal(disk.subarray(0, 21).toString(), 'EXTENDED CPC DSK File');
  assert.equal(disk[0x11a], 0x41); // System format sector ID: boot using |CPM.
  assert.equal(disk[0x200], 0xf3); // DI: preserved boot loader, not a raw DOS disk.
});

test('the second playable system is the reduced 64K CPC 464/664 edition', () => {
  const system = systems[1];
  const disk = readFileSync(new URL(`../assets/emulation/${system.media.slice(2)}`, import.meta.url));
  assert.equal(system.id, 'amstrad-cpc-64k');
  assert.equal(system.adapter, 'rvm-cpc');
  assert.equal(system.command, 'run"abadia64.bas"\n');
  assert.equal(disk.length, 194816);
  assert.equal(disk.subarray(0, 18).toString(), 'MV - CPC Disk-File');
  assert.ok(disk.includes(Buffer.from('ABADIA64BAS')));
});

test('the playable systems include the preserved 128K Spectrum +3 disk edition', () => {
  const system = systems.find(item => item.id === 'zx-spectrum-plus3');
  const disk = readFileSync(new URL(`../assets/emulation/${system.media.slice(2)}`, import.meta.url));
  assert.equal(system.id, 'zx-spectrum-plus3');
  assert.equal(system.adapter, 'rvm-spectrum-plus3');
  assert.equal(system.command, '\n');
  assert.equal(system.warpFrames, 3600);
  assert.deepEqual(system.keyMap, {
    ArrowUp: 'KeyA', ArrowDown: 'KeyZ', ArrowLeft: 'KeyK', ArrowRight: 'KeyL'
  });
  assert.equal(disk.length, 191744);
  assert.equal(disk.subarray(0, 21).toString(), 'EXTENDED CPC DSK File');
});
