import { systems } from './systems.js?v=20260915-pcw1';

const params = new URLSearchParams(location.search);
const es = params.get('lang') !== 'en';
const system = systems.find(item => item.id === params.get('system') && item.adapter === '1985');
document.documentElement.lang = es ? 'es' : 'en';
const start = document.querySelector('#start');
const status = document.querySelector('#status');
const cover = document.querySelector('#cover');
const canvas = document.querySelector('#screen');
const context = canvas.getContext('2d');
const offscreen = document.createElement('canvas');
offscreen.width = 720;
offscreen.height = 256;
const offcontext = offscreen.getContext('2d');
const pixels = offcontext.createImageData(720, 256);
start.textContent = es ? 'Jugar' : 'Play';
status.textContent = system?.idle[es ? 'es' : 'en'] || 'Amstrad PCW';
let machine, audio, gain, nextAudio = 0, lastFrame = 0, animation;
let running = false, paused = false, muted = false, failed = false;
const sources = new Set();
const pressed = new Map();
const releases = new Map();
// SDL scancodes consumed by the pinned core's PCW keyboard matrix.
const keys = { ArrowRight: 79, ArrowLeft: 80, ArrowDown: 81, ArrowUp: 82, Space: 44, Enter: 40 };
for (let i = 0; i < 26; i++) keys[`Key${String.fromCharCode(65 + i)}`] = 4 + i;
const send = (type, extra = {}) => parent.postMessage({ source: 'abbey-player', type, ...extra }, location.origin);
const report = () => send('state', { paused, muted });

function releaseKeys() {
  for (const timer of releases.values()) clearTimeout(timer);
  releases.clear();
  for (const key of pressed.keys()) machine._poc_key(key, 0);
  pressed.clear();
}
function flushAudio() {
  for (const source of sources) source.stop();
  sources.clear();
  machine?._poc_audio_reset();
  nextAudio = audio ? audio.currentTime + 0.04 : 0;
}
function pause(value) {
  if (!running) return;
  releaseKeys();
  paused = value;
  lastFrame = performance.now();
  flushAudio();
  if (!value) audio?.resume().catch(() => {});
  report();
}
function render() {
  const pointer = machine._poc_pixels() >>> 2;
  for (let i = 0, j = 0; i < 720 * 256; i++, j += 4) {
    const colour = machine.HEAPU32[pointer + i];
    pixels.data[j] = (colour >>> 16) & 255;
    pixels.data[j + 1] = (colour >>> 8) & 255;
    pixels.data[j + 2] = colour & 255;
    pixels.data[j + 3] = 255;
  }
  offcontext.putImageData(pixels, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(offscreen, 0, 0, 720, 512);
}
function scheduleAudio() {
  if (!audio || audio.state !== 'running') { machine._poc_audio_reset(); return; }
  const count = machine._poc_audio_avail();
  if (!count) return;
  const samples = new Int16Array(machine.HEAPU8.buffer, machine._poc_audio_buffer(), 44100 * 4);
  const position = machine._poc_audio_read_pos();
  const buffer = audio.createBuffer(1, count, 44100);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < count; i++) channel[i] = samples[(position + i) % samples.length] / 32768;
  machine._poc_audio_advance(count);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.onended = () => sources.delete(source);
  sources.add(source);
  nextAudio = Math.max(nextAudio, audio.currentTime + 0.02);
  source.start(nextAudio);
  nextAudio += count / 44100;
}
function tick(time) {
  if (!running) return;
  if (!paused) {
    // PAL 50 Hz; bound catch-up after a stalled browser frame.
    lastFrame = Math.max(lastFrame, time - 100);
    while (time - lastFrame >= 20) { machine._poc_step(); lastFrame += 20; }
    render();
    scheduleAudio();
  } else lastFrame = time;
  animation = requestAnimationFrame(tick);
}
function fail(error) {
  if (failed) return;
  failed = true;
  running = false;
  cancelAnimationFrame(animation);
  releaseKeys();
  flushAudio();
  audio?.close().catch(() => {});
  console.error('PCW player:', error);
  cover.hidden = false;
  start.disabled = false;
  start.textContent = es ? 'Reintentar' : 'Try again';
  status.textContent = es ? 'No se pudo iniciar el juego. Vuelve a intentarlo.' : 'The game could not start. Please try again.';
  send('error');
}
start.addEventListener('click', async () => {
  if (failed) { location.reload(); return; }
  start.disabled = true;
  send('loading');
  status.textContent = es ? 'Cargando la abadía…' : 'Loading the abbey…';
  try {
    if (!system) throw new Error('Unknown PCW system');
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (Audio) { audio = new Audio(); gain = audio.createGain(); gain.connect(audio.destination); await audio.resume(); }
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './1985/1985.js'; script.onload = resolve; script.onerror = reject;
      document.head.append(script);
    });
    machine = await window.create1985({ locateFile: file => new URL(`./1985/${file}`, location.href).href });
    const response = await fetch(system.media);
    if (!response.ok) throw new Error(`Disk HTTP ${response.status}`);
    machine._poc_init();
    machine._poc_set_dksound(1);
    machine.FS.writeFile('/abadia.dsk', new Uint8Array(await response.arrayBuffer()));
    if (machine.ccall('poc_load_disk', 'number', ['string'], ['/abadia.dsk']) !== 0) throw new Error('Invalid PCW disk');
    machine._poc_reset();
    running = true;
    cover.hidden = true;
    lastFrame = performance.now();
    flushAudio();
    canvas.focus();
    send('running', { paused, muted });
    if (document.hidden) pause(true);
    animation = requestAnimationFrame(tick);
  } catch (error) { fail(error); }
});
canvas.addEventListener('click', () => { pause(false); canvas.focus(); });
window.addEventListener('keydown', event => {
  if (!running) return;
  if (event.code === 'Tab' || event.code === 'Escape') {
    event.preventDefault(); pause(true); send('escape-focus'); return;
  }
  const key = keys[event.code];
  if (key === undefined) return;
  event.preventDefault();
  if (paused) return;
  clearTimeout(releases.get(key));
  if (!pressed.has(key)) pressed.set(key, performance.now());
  machine._poc_key(key, 1);
});
window.addEventListener('keyup', event => {
  const key = keys[event.code];
  if (!running || key === undefined) return;
  event.preventDefault();
  if (!pressed.has(key)) return;
  clearTimeout(releases.get(key));
  releases.set(key, setTimeout(() => {
    machine._poc_key(key, 0); pressed.delete(key); releases.delete(key);
  }, Math.max(0, 80 - (performance.now() - pressed.get(key)))));
});
window.addEventListener('blur', () => pause(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
window.addEventListener('pagehide', () => { running = false; cancelAnimationFrame(animation); releaseKeys(); flushAudio(); audio?.close().catch(() => {}); });
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent || event.data?.source !== 'abbey-host' || !running) return;
  switch (event.data.action) {
    case 'pause': pause(true); break;
    case 'resume': pause(false); canvas.focus(); break;
    case 'mute': muted = !muted; if (gain) gain.gain.value = muted ? 0 : 1; report(); break;
  }
});
window.addEventListener('error', event => fail(event.error));
window.addEventListener('unhandledrejection', event => fail(event.reason));
