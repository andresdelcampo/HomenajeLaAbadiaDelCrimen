import { systems } from './systems.js?v=20260915-pc1';

const params = new URLSearchParams(location.search);
const es = params.get('lang') !== 'en';
const system = systems.find(item => item.id === params.get('system') && item.adapter === 'dosbox');
const start = document.querySelector('#start');
const status = document.querySelector('#status');
const cover = document.querySelector('#cover');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d', { alpha: false });
const copy = es ? {
  play: 'Jugar', loading: 'Cargando la abadÃƒÂ­aÃ¢â‚¬Â¦', retry: 'Reintentar',
  error: 'No se pudo iniciar. Comprueba la conexiÃƒÂ³n y vuelve a intentarlo.',
  screen: 'Pantalla del PC CGA'
} : {
  play: 'Play', loading: 'Loading the abbeyÃ¢â‚¬Â¦', retry: 'Try again',
  error: 'Could not start. Check your connection and try again.', screen: 'PC CGA screen'
};
document.documentElement.lang = es ? 'es' : 'en';
start.textContent = copy.play;
status.textContent = system?.idle[es ? 'es' : 'en'] || copy.error;
canvas.setAttribute('aria-label', copy.screen);
if (system) document.title = `La AbadÃƒÂ­a del Crimen Ã‚Â· ${system.name[es ? 'es' : 'en']}`;
let ci, audio, gain, pixels, timer;
let running = false, failed = false, paused = false, muted = false;
let audioTime = 0;
const sources = new Set();
const held = new Set();
const pressedAt = new Map();
const releaseTimers = new Map();
const minimumKeyHold = 80;
const send = (type, extra = {}) => parent.postMessage({ source: 'abbey-player', type, ...extra }, location.origin);
const report = () => send('state', { paused, muted });
function clearAudio() {
  for (const source of sources) source.stop();
  sources.clear();
  audioTime = 0;
}
function releaseKeys() {
  for (const key of held) {
    clearTimeout(releaseTimers.get(key));
    releaseTimers.delete(key);
    pressedAt.delete(key);
    ci.sendKeyEvent(key, false);
  }
  held.clear();
}
function releaseKey(key) {
  releaseTimers.delete(key);
  pressedAt.delete(key);
  if (held.delete(key)) ci.sendKeyEvent(key, false);
}
function pause(value) {
  if (!running) return;
  releaseKeys();
  if (value !== paused) {
    paused = value;
    clearAudio();
    if (paused) ci.pause();
    else {
      ci.resume();
      if (muted) ci.mute();
      audio.resume().catch(fail);
    }
  }
  report();
}
function fail(error) {
  if (failed) return;
  failed = true;
  running = false;
  clearTimeout(timer);
  releaseKeys();
  clearAudio();
  ci?.exit().catch(() => {});
  audio?.close().catch(() => {});
  cover.hidden = false;
  start.disabled = false;
  start.textContent = copy.retry;
  status.textContent = copy.error;
  send('error');
}
function render(rgb, rgba) {
  if (failed) return;
  const width = ci.width(), height = ci.height();
  if (!pixels || pixels.width !== width || pixels.height !== height) {
    canvas.width = width;
    canvas.height = height;
    pixels = context.createImageData(width, height);
  }
  const frame = rgba || rgb;
  if (!frame) return;
  for (let src = 0, dst = 0; dst < pixels.data.length; dst += 4) {
    pixels.data[dst] = frame[src++];
    pixels.data[dst + 1] = frame[src++];
    pixels.data[dst + 2] = frame[src++];
    pixels.data[dst + 3] = 255;
    if (rgba) src++;
  }
  context.putImageData(pixels, 0, 0);
  if (!running) {
    running = true;
    clearTimeout(timer);
    cover.hidden = true;
    canvas.focus();
    send('running', { paused, muted });
    if (document.hidden) pause(true);
  }
}
function playAudio(samples) {
  if (failed || paused || muted || audio.state !== 'running' || !samples.length) return;
  const buffer = audio.createBuffer(1, samples.length, ci.soundFrequency());
  buffer.copyToChannel(samples, 0);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  // Keep consecutive chunks contiguous. Reserve headroom only when starting
  // or recovering from an underrun; moving every chunk forward inserts gaps.
  // Bound excessive backlog after an interruption without trimming normal jitter.
  if (audioTime > audio.currentTime + .5) clearAudio();
  if (audioTime <= audio.currentTime) audioTime = audio.currentTime + .1;
  sources.add(source);
  source.onended = () => sources.delete(source);
  source.start(audioTime);
  audioTime += buffer.duration;
}
start.addEventListener('click', async () => {
  if (failed) { location.reload(); return; }
  start.disabled = true;
  status.textContent = copy.loading;
  send('loading');
  timer = setTimeout(fail, 60000);
  try {
    if (!system || !window.WebAssembly || !window.AudioContext) throw new Error('Unsupported');
    audio = new AudioContext({ latencyHint: 'interactive' });
    gain = audio.createGain();
    gain.gain.value = .8;
    gain.connect(audio.destination);
    await audio.resume();
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './js-dos/emulators.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    const response = await fetch(system.media);
    if (!response.ok) throw new Error('Disk unavailable');
    const contents = new Uint8Array(await response.arrayBuffer());
    if (failed) return;
    window.emulators.pathPrefix = new URL('./js-dos/', location.href).href;
    const configResponse = await fetch('./pc-dosbox.conf?v=20260915-xt1');
    if (!configResponse.ok) throw new Error('DOSBox configuration unavailable');
    const conf = await configResponse.text();
    ci = await window.emulators.dosboxXWorker([
      { path: 'disk.ima', contents },
      { dosboxConf: conf, jsdosConf: { version: '8.4.2' } }
    ], { audioWorklet: true });
    if (failed) { await ci.exit(); return; }
    ci.events().onFrame(render);
    ci.events().onSoundPush(playAudio);
    ci.events().onExit(fail);
  } catch (error) {
    console.error('[pc-player] startup failed', error);
    fail(error);
  }
});
// js-dos exposes its native KBD_KEYS values (GLFW-style), not DOM key codes.
const keys = { ArrowUp: 265, ArrowDown: 264, ArrowRight: 262, ArrowLeft: 263,
  F1: 290, F2: 291, Space: 32, Enter: 257, KeyS: 83, KeyN: 78 };
window.addEventListener('keydown', event => {
  if (!running) return;
  if (event.code === 'Tab' || event.code === 'Escape') {
    event.preventDefault();
    pause(true);
    send('escape-focus');
    return;
  }
  const key = keys[event.code];
  if (key === undefined) return;
  event.preventDefault();
  clearTimeout(releaseTimers.get(key));
  releaseTimers.delete(key);
  if (!paused && !held.has(key)) {
    held.add(key);
    pressedAt.set(key, performance.now());
    ci.sendKeyEvent(key, true);
  }
});
window.addEventListener('keyup', event => {
  const key = keys[event.code];
  if (key === undefined || !ci) return;
  event.preventDefault();
  if (!held.has(key)) return;
  const elapsed = performance.now() - pressedAt.get(key);
  if (elapsed < minimumKeyHold) {
    clearTimeout(releaseTimers.get(key));
    releaseTimers.set(key, setTimeout(() => releaseKey(key), minimumKeyHold - elapsed));
  } else releaseKey(key);
});
canvas.addEventListener('click', () => { pause(false); canvas.focus(); });
window.addEventListener('blur', () => pause(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent || event.data?.source !== 'abbey-host' || !running) return;
  switch (event.data.action) {
    case 'pause': pause(true); break;
    case 'resume': pause(false); canvas.focus(); break;
    case 'mute':
      muted = !muted;
      clearAudio();
      if (muted) ci.mute(); else ci.unmute();
      report();
      break;
  }
});
window.addEventListener('error', event => { console.error('[pc-player] uncaught error', event.error || event.message); fail(event.error || new Error(event.message)); });
window.addEventListener('unhandledrejection', event => { console.error('[pc-player] unhandled rejection', event.reason); fail(event.reason instanceof Error ? event.reason : new Error(String(event.reason))); });
