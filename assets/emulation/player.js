import { systems } from './systems.js?v=20260914-12';

const params = new URLSearchParams(location.search);
const es = params.get('lang') !== 'en';
document.documentElement.lang = es ? 'es' : 'en';
const system = systems.find(item => item.id === params.get('system'));
const start = document.querySelector('#start');
const status = document.querySelector('#status');
const cover = document.querySelector('#cover');
const coverImage = document.querySelector('#cover-image');
const adapters = {
  'rvm-cpc': {
    runtime: './rvmplayer/rvmplayer.cpc6128.0.1.1.min.js',
    factory: 'rvmPlayer_cpc6128',
    screen: { es: 'Pantalla del Amstrad CPC', en: 'Amstrad CPC screen' }
  },
  'rvm-spectrum-plus3': {
    runtime: './rvmplayer/rvmplayer.plus3.0.1.1.min.js',
    factory: 'rvmPlayer_plus3',
    screen: { es: 'Pantalla del ZX Spectrum +3', en: 'ZX Spectrum +3 screen' }
  }
};
const adapter = system && adapters[system.adapter];
const requestedWarpFrames = Number(params.get('warpFrames'));
const warpFrames = system?.id === 'zx-spectrum-plus3' && Number.isInteger(requestedWarpFrames)
  ? Math.min(10000, Math.max(0, requestedWarpFrames)) : system?.warpFrames;
const copy = es ? {
  play: 'Jugar', loading: 'Cargando la abadía…', idle: system?.idle.es || 'Amstrad CPC · Juego en español',
  error: 'No se pudo iniciar. Comprueba la conexión y vuelve a intentarlo.', retry: 'Reintentar',
  unsupported: 'Necesitas un navegador de escritorio con WebGL 2 y audio web, mediante HTTPS o localhost.'
} : {
  play: 'Play', loading: 'Loading the abbey…', idle: system?.idle.en || 'Amstrad CPC · Game in Spanish',
  error: 'Could not start. Check your connection and try again.', retry: 'Try again',
  unsupported: 'Use a desktop browser with WebGL 2 and web audio, over HTTPS or localhost.'
};
start.textContent = copy.play;
status.textContent = copy.idle;
if (system?.cover) coverImage.src = system.cover;
if (system) document.title = `La Abadía del Crimen · ${system.name[es ? 'es' : 'en']}`;
let player;
let timer;
let coverTimer;
let failed = false;
let running = false;
let muted = false;
const heldKeys = new Map();
const keyReleaseTimers = new Map();
const pressedAt = new Map();
let keyupImmediately;
const send = (type, extra = {}) => parent.postMessage({ source: 'abbey-player', type, ...extra }, location.origin);

function fail(message = copy.error) {
  if (failed) return;
  failed = true;
  running = false;
  clearTimeout(timer);
  clearTimeout(coverTimer);
  player?.worker?.terminate();
  player?.audioContext?.close().catch(() => {});
  cover.hidden = false;
  start.disabled = false;
  start.textContent = copy.retry;
  status.textContent = message;
  send('error');
}

function releaseKeys() {
  for (const timer of keyReleaseTimers.values()) clearTimeout(timer);
  keyReleaseTimers.clear();
  if (player?.port) {
    for (const event of heldKeys.values()) keyupImmediately(event);
  }
  heldKeys.clear();
  pressedAt.clear();
}

function reportState() {
  send('state', { paused: player.isPaused, muted });
}

function pause(value) {
  if (!running) return;
  releaseKeys();
  if (player.isPaused === value) { reportState(); return; }
  player.togglePause(new Event('click'));
  reportState();
}

// Intercept Tab before the emulator's global keyboard handler to avoid trapping
// keyboard users. Game keys are released when focus leaves the frame.
window.addEventListener('keydown', event => {
  if (running && (event.code === 'Tab' || event.code === 'Escape')) {
    event.stopImmediatePropagation();
    releaseKeys();
    pause(true);
    send('escape-focus');
    event.preventDefault();
  } else if (running) {
    const code = system.keyMap?.[event.code] || event.code;
    heldKeys.set(code, { code });
    if (code !== event.code) {
      // Do not also pass RVM its native Spectrum cursor code: with this title
      // that path can halt execution, while the original A/Z/K/L keys are safe.
      event.stopImmediatePropagation();
      event.preventDefault();
      player.keydown({ code, preventDefault() {} });
    }
  }
}, true);
window.addEventListener('keyup', event => {
  if (!running) return;
  const code = system.keyMap?.[event.code];
  if (!code) return;
  event.stopImmediatePropagation();
  event.preventDefault();
  player.keyup({ code });
}, true);
window.addEventListener('blur', () => { releaseKeys(); pause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
window.addEventListener('error', () => fail());
window.addEventListener('unhandledrejection', () => fail());

start.addEventListener('click', async () => {
  if (failed) { location.reload(); return; }
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2');
  if (!system || !adapter || !window.isSecureContext || !gl || !window.AudioWorkletNode) {
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    fail(copy.unsupported);
    return;
  }
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  start.disabled = true;
  status.textContent = copy.loading;
  send('loading');
  timer = setTimeout(() => fail(), 60000);
  // Keep the branded cover long enough to acknowledge the click, then reveal
  // RVM's real startup frames while the accelerated disk boot finishes.
  coverTimer = setTimeout(() => { if (!failed) cover.hidden = true; }, 1000);
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = adapter.runtime;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    if (failed) return;
    player = window[adapter.factory](document.querySelector('#machine'), {
      disk: { type: 'dsk', url: new URL(system.media, location.href).href },
      command: system.command, warpFrames, videoMode: 'hd'
    });
    player.worker.addEventListener('error', () => fail());
    // The audio worklet advances the machine in batches. Keep very short taps
    // visible for at least 80 ms so a down/up pair cannot miss every CPC scan.
    const keydownImmediately = player.keydown.bind(player);
    keyupImmediately = player.keyup.bind(player);
    player.keydown = event => {
      clearTimeout(keyReleaseTimers.get(event.code));
      if (!pressedAt.has(event.code)) pressedAt.set(event.code, performance.now());
      keydownImmediately(event);
    };
    player.keyup = event => {
      const code = event.code;
      const delay = Math.max(0, 80 - (performance.now() - (pressedAt.get(code) || 0)));
      keyReleaseTimers.set(code, setTimeout(() => {
        keyupImmediately({ code });
        pressedAt.delete(code);
        heldKeys.delete(code);
        keyReleaseTimers.delete(code);
      }, delay));
    };
    // Our launch button owns startup. Suppress the vendor's one-shot click
    // listener, which would otherwise boot a second time on the first game click.
    player.container.addEventListener('click', event => {
      event.stopImmediatePropagation();
      if (running) {
        pause(false);
        player.audioContext.resume().catch(() => fail());
        player.canvas.focus();
      }
    }, true);
    player.canvas.setAttribute('aria-label', adapter.screen[es ? 'es' : 'en']);
    player.canvas.tabIndex = 0;
    player.canvas.addEventListener('webglcontextlost', () => fail());
    player.addEventListener('diskLoaded', () => {
      if (failed) return;
      // run() is the pinned controller's start entry point. No synthetic click:
      // the user's Play click in this frame authorizes its audio context.
      player.run();
      const poll = () => {
        if (failed) return;
        if (player.port && player.ready) {
          clearTimeout(timer);
          clearTimeout(coverTimer);
          running = true;
          cover.hidden = true;
          player.canvas.focus();
          send('running', { paused: false, muted });
          if (document.hidden) pause(true);
        } else setTimeout(poll, 100);
      };
      poll();
    }, { once: true });
  } catch (_) { fail(); }
});

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent || event.data?.source !== 'abbey-host') return;
  if (!running) return;
  switch (event.data.action) {
    case 'pause': pause(true); break;
    case 'resume':
      pause(false);
      player.audioContext.resume().catch(() => fail());
      player.canvas.focus();
      break;
    case 'mute':
      muted = !muted;
      player.sVolume.setValue(muted ? 0 : .8);
      reportState();
      break;
  }
});
