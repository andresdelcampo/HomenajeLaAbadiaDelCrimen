import { Spectrum } from './zxm8/core/spectrum.js';
import { systems } from './systems.js';

const params = new URLSearchParams(location.search);
const es = params.get('lang') !== 'en';
const system = systems.find(item => item.id === params.get('system'));
const start = document.querySelector('#start');
const status = document.querySelector('#status');
const cover = document.querySelector('#cover');
const coverImage = document.querySelector('#cover-image');
const canvas = document.querySelector('#screen');
const copy = es ? {
  play: 'Jugar', loading: 'Cargando la cinta…', running: 'Juego en marcha. Haz clic en la pantalla para usar el teclado.',
  tape: 'Cargando desde cinta…', retry: 'Reintentar', error: 'No se pudo iniciar la cinta.',
  unsupported: 'Necesitas un navegador de escritorio con JavaScript y audio web.',
  screen: 'Pantalla del ZX Spectrum 128K'
} : {
  play: 'Play', loading: 'Loading the tape…', running: 'Game running. Click the screen to use the keyboard.',
  tape: 'Loading from tape…', retry: 'Try again', error: 'The tape could not start.',
  unsupported: 'Use a desktop browser with JavaScript and web audio.',
  screen: 'ZX Spectrum 128K screen'
};
document.documentElement.lang = es ? 'es' : 'en';
start.textContent = copy.play;
status.textContent = system?.idle?.[es ? 'es' : 'en'] || copy.tape;
if (system?.cover) coverImage.src = system.cover;

let machine;
let audio;
let running = false;
let paused = false;
let muted = false;
let hostFullscreen = false;
let menuStarted = false;
let tapeFastForward = false;
let failTimer;
const heldRemappedKeys = new Map();
const send = (type, extra = {}) => parent.postMessage({ source: 'abbey-player', type, ...extra }, location.origin);

function reportState() { send('state', { paused, muted }); }

function releaseRemappedKeys() {
  for (const key of heldRemappedKeys.values()) machine?.ula?.keyUp(key);
  heldRemappedKeys.clear();
}

function finishTapeLoad(stopTape = false) {
  if (!tapeFastForward) return;
  tapeFastForward = false;
  if (stopTape) machine.tapePlayer.stop();
  machine.speed = 100;
  status.textContent = copy.running;
}

function fail(message = copy.error) {
  if (!machine && !running) return;
  clearTimeout(failTimer);
  running = false;
  start.disabled = false;
  start.textContent = copy.retry;
  status.textContent = message;
  releaseRemappedKeys();
  machine?.destroy();
  machine = undefined;
  audio = undefined;
  send('error');
}

function startTapeFrom128Menu() {
  if (menuStarted || !machine?.romLoaded) return;
  menuStarted = true;
  // A Sinclair 128K boots to its menu.  The highlighted Loader item is
  // activated with Enter; this lets the ROM select the correct tape routine
  // and keeps turbo TZX timing under the emulator's tape player.
  machine.ula.keyDown('Enter');
  setTimeout(() => machine?.ula?.keyUp('Enter'), 120);
  status.textContent = copy.tape;
}

function pause(value) {
  if (!running || paused === value) return;
  if (value) releaseRemappedKeys();
  paused = value;
  if (paused) machine.stop();
  else { machine.start(); audio?.context?.resume().catch(() => {}); }
  reportState();
}

function updateHostFullscreen(value) {
  hostFullscreen = Boolean(value);
  document.documentElement.classList.toggle('host-fullscreen', hostFullscreen);
  if (!hostFullscreen || !canvas.width || !canvas.height) {
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');
    return;
  }
  const scale = Math.min(innerWidth / canvas.width, innerHeight / canvas.height);
  canvas.style.width = `${Math.floor(canvas.width * scale)}px`;
  canvas.style.height = `${Math.floor(canvas.height * scale)}px`;
}

window.addEventListener('keydown', event => {
  if (!running) return;
  if (event.code === 'Tab' || event.code === 'Escape') {
    event.preventDefault();
    event.stopImmediatePropagation();
    pause(true);
    send('escape-focus');
    return;
  }
  const mappedKey = system?.keyMap?.[event.code];
  if (mappedKey) {
    event.preventDefault();
    event.stopImmediatePropagation();
    heldRemappedKeys.set(event.code, mappedKey);
    machine?.ula?.keyDown(mappedKey);
  }
}, true);
window.addEventListener('keyup', event => {
  if (!running) return;
  const mappedKey = heldRemappedKeys.get(event.code) || system?.keyMap?.[event.code];
  if (!mappedKey) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  heldRemappedKeys.delete(event.code);
  machine?.ula?.keyUp(mappedKey);
}, true);
window.addEventListener('blur', () => pause(true));
window.addEventListener('resize', () => { if (hostFullscreen) updateHostFullscreen(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
window.addEventListener('error', () => fail());
window.addEventListener('unhandledrejection', () => fail());

start.addEventListener('click', async () => {
  if (running) return;
  if (!system || !window.isSecureContext) { status.textContent = copy.unsupported; return; }
  start.disabled = true;
  status.textContent = copy.loading;
  send('loading');
  clearTimeout(failTimer);
  failTimer = setTimeout(() => fail(), 120000);
  try {
    machine = new Spectrum(canvas, { machineType: '128k', tapeTrapsEnabled: true });
    machine.onError = error => fail(error?.message || copy.error);
    const romResponse = await fetch(new URL('./zxm8/roms/128.rom', location.href));
    if (!romResponse.ok) throw new Error(`ROM HTTP ${romResponse.status}`);
    const romData = await romResponse.arrayBuffer();
    // ZX-M8XXX exposes the two 16K 128K ROM banks separately.  The preserved
    // 128.rom is the conventional 32K concatenation, so load both halves.
    await machine.init(romData.slice(0, 0x4000));
    await machine.loadRom(romData.slice(0x4000, 0x8000), 1);
    const response = await fetch(new URL(system.media, location.href));
    if (!response.ok) throw new Error(`Tape HTTP ${response.status}`);
    machine.loadTZX(await response.arrayBuffer());
    if (Number.isInteger(system.tapeFastForwardStopBlock)) {
      // The original release has no explicit TZX stop marker at this point.
      // Stop when its equivalent next block is reached, after the main game
      // payload has loaded but before the manuscript can run at warp speed.
      const tapeBlockHandler = machine.tapePlayer.onBlockStart;
      machine.tapePlayer.onBlockStart = (blockIndex, block) => {
        tapeBlockHandler?.(blockIndex, block);
        if (tapeFastForward && blockIndex === system.tapeFastForwardStopBlock) {
          finishTapeLoad(true);
        }
      };
    }
    // Standard blocks use the ROM trap; turbo blocks are handed to the
    // cycle-accurate tape player by ZX-M8XXX's TZX loader.
    machine.setTapeFlashLoad(true);
    // The preserved turbo loaders are intentionally cycle accurate, but their
    // original cassette timings make a browser visitor wait several minutes.
    // Run the machine as fast as the host can sustain while the tape is active,
    // then return to the real 50 Hz rate as soon as the final block finishes.
    tapeFastForward = true;
    machine.tapePlayer.onTapeEnd = finishTapeLoad;
    audio = machine.initAudio();
    await audio.start();
    machine.addFrameListener(frame => {
      if (!menuStarted && machine.totalFrames > 60) startTapeFrom128Menu();
      if (tapeFastForward && !machine.tapePlayer.hasMoreBlocks() &&
          !machine.tapeLoader.hasMoreBlocks()) {
        finishTapeLoad();
      }
    });
    machine.speed = 0;
    machine.start();
    running = true;
    paused = false;
    cover.hidden = true;
    canvas.setAttribute('aria-label', copy.screen);
    canvas.focus();
    clearTimeout(failTimer);
    status.textContent = copy.running;
    send('running', { paused: false, muted });
  } catch (_) { fail(); }
});

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent || event.data?.source !== 'abbey-host') return;
  if (!running) return;
  switch (event.data.action) {
    case 'pause': pause(true); break;
    case 'resume': pause(false); canvas.focus(); break;
    case 'fullscreen':
      updateHostFullscreen(event.data.value);
      break;
    case 'mute':
      muted = !muted;
      audio?.setMuted(muted);
      reportState();
      break;
  }
});
