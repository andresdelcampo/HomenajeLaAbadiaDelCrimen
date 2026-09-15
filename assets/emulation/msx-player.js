import { systems } from './systems.js?v=20260915-msx2';

const params = new URLSearchParams(location.search);
const es = params.get('lang') !== 'en';
const system = systems.find(item => item.id === params.get('system') && item.adapter === 'webmsx');
document.documentElement.lang = es ? 'es' : 'en';
const start = document.querySelector('#start');
const status = document.querySelector('#status');
const cover = document.querySelector('#cover');
start.textContent = es ? 'Jugar' : 'Play';
status.textContent = system?.idle[es ? 'es' : 'en'] || 'MSX';
let running = false;
let paused = false;
let muted = false;
let failed = false;
let timer;
const releases = new Map();
const pressedAt = new Map();
let immediateKey;
const send = (type, extra = {}) => parent.postMessage({ source: 'abbey-player', type, ...extra }, location.origin);
const report = () => send('state', { paused, muted });
function pause(value) {
  if (!running) return;
  for (const timeout of releases.values()) clearTimeout(timeout);
  releases.clear();
  for (const key of pressedAt.keys()) immediateKey(key, false);
  pressedAt.clear();
  WMSX.room.controllersHub.releaseControllers();
  WMSX.room.machine.userPause(value);
  if (muted) WMSX.room.speaker.mute();
  paused = value;
  report();
}
function fail() {
  if (failed) return;
  failed = true;
  running = false;
  clearTimeout(timer);
  window.WMSX?.shutdown?.();
  cover.hidden = false;
  start.disabled = false;
  start.textContent = es ? 'Reintentar' : 'Try again';
  status.textContent = es ? 'No se pudo iniciar el juego. Vuelve a intentarlo.' : 'The game could not start. Please try again.';
  send('error');
}
start.addEventListener('click', async () => {
  if (failed) { location.reload(); return; }
  if (!system) { fail(); return; }
  start.disabled = true;
  status.textContent = es ? 'Cargando la abadía…' : 'Loading the abbey…';
  send('loading');
  timer = setTimeout(fail, 60000);
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './webmsx/wmsx.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    if (failed) return;
    // Loaded after window.load: the embedded runtime waits for our explicit start.
    Object.assign(WMSX, {
      AUTO_START: false, ALLOW_URL_PARAMETERS: false,
      MACHINE: 'MSX1E', PRESETS: system.mediaType === 'tape' ? 'NODISK' : 'DISK',
      DISKA_URL: system.mediaType === 'tape' ? '' : system.media,
      TAPE_URL: system.mediaType === 'tape' ? system.media : '',
      AUTO_POWER_ON_DELAY: 0, FAST_BOOT: 120, SPEED: 100,
      SCREEN_CONTROL_BAR: 0, SCREEN_FULLSCREEN_MODE: -2,
      SCREEN_FILTER_MODE: 0, SCREEN_CRT_SCANLINES: 0,
      MEDIA_CHANGE_DISABLED: true, JOYKEYS_MODE: -1, TOUCH_MODE: -1,
      SERVER_KEEPALIVE: 0
    });
    WMSX.start();
    const poll = () => {
      if (failed) return;
      if (WMSX.room?.machine.powerIsOn && !WMSX.room.isLoading) {
        clearTimeout(timer);
        running = true;
        const keyboard = WMSX.room.controllersHub.getKeyboard();
        immediateKey = keyboard.processMSXKey.bind(keyboard);
        // Keep short taps visible to the game's keyboard scan, as in the CPC player.
        keyboard.processMSXKey = (key, down) => {
          clearTimeout(releases.get(key));
          if (down) {
            if (!pressedAt.has(key)) pressedAt.set(key, performance.now());
            immediateKey(key, true);
          } else {
            releases.set(key, setTimeout(() => {
              immediateKey(key, false);
              pressedAt.delete(key);
              releases.delete(key);
            }, Math.max(0, 80 - (performance.now() - (pressedAt.get(key) || 0)))));
          }
        };
        cover.hidden = true;
        const canvas = document.querySelector('canvas');
        canvas.setAttribute('aria-label', es ? 'Pantalla del MSX' : 'MSX screen');
        canvas.tabIndex = 0;
        canvas.focus();
        send('running', { paused, muted });
        if (document.hidden) pause(true);
      } else setTimeout(poll, 100);
    };
    poll();
  } catch (_) { fail(); }
});
document.querySelector('#machine').addEventListener('click', () => pause(false));
window.addEventListener('keydown', event => {
  if (running && (event.code === 'Tab' || event.code === 'Escape')) {
    event.stopImmediatePropagation();
    event.preventDefault();
    pause(true);
    send('escape-focus');
  }
}, true);
window.addEventListener('blur', () => pause(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
window.addEventListener('pagehide', () => window.WMSX?.shutdown?.());
window.addEventListener('error', fail);
window.addEventListener('unhandledrejection', fail);
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent || event.data?.source !== 'abbey-host' || !running) return;
  switch (event.data.action) {
    case 'pause': pause(true); break;
    case 'resume': pause(false); document.querySelector('canvas').focus(); break;
    case 'fullscreen':
      // The host owns the browser fullscreen element. Mirror that state in
      // WebMSX so its own canvas scale is recalculated for the new viewport.
      WMSX.room.screen.setFullscreen(Boolean(event.data.value), true);
      break;
    case 'mute':
      muted = !muted;
      WMSX.room.speaker[muted ? 'mute' : 'unMute']();
      report();
      break;
  }
});
