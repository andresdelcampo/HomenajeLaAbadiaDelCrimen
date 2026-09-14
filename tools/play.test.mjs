import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { systems } from '../assets/emulation/systems.js';

const source = readFileSync(new URL('../play.js', import.meta.url), 'utf8').replace(/^import .*;\n/, '');
function host() {
  const listeners = new Map();
  class Element {
    constructor() { this.events = new Map(); this.children = []; this.attributes = {}; this.value = ''; }
    addEventListener(name, callback) { this.events.set(name, callback); }
    fire(name) { return this.events.get(name)?.(); }
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
    documentElement: { lang: 'en' }, fullscreenEnabled: true,
    querySelector: element, addEventListener() {},
    createElement(tag) {
      const item = new Element();
      if (tag === 'iframe') item.contentWindow = { postMessage: msg => messages.push(msg) };
      return item;
    }
  };
  const location = { href: 'https://example.test/tribute/en/play.html', origin: 'https://example.test', search: '' };
  runInNewContext(source, {
    document, location, systems, URL, URLSearchParams,
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
  assert.equal(new URL(h.frame().src).searchParams.get('v'), '20260914-8');
  assert.equal(h.element('[data-play="pause"]').disabled, true);
});

test('CPC startup warp stops on the title screen instead of entering the manuscript', () => {
  assert.equal(systems[0].warpFrames, 842);
});

test('only the current same-origin player can enable playback controls', () => {
  const h = host();
  h.report('running', {}, 'https://unrelated.test');
  h.report('running', {}, 'https://example.test', {});
  assert.equal(h.element('[data-play="pause"]').disabled, true);
  h.report('running', { paused: false, muted: false });
  assert.equal(h.element('[data-play="pause"]').disabled, false);
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
