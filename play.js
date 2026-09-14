import { systems } from './assets/emulation/systems.js?v=20260914-8';

const es = document.documentElement.lang === 'es';
const select = document.querySelector('#play-system');
const screen = document.querySelector('.play-screen');
const status = document.querySelector('#play-status');
const pause = document.querySelector('[data-play="pause"]');
const mute = document.querySelector('[data-play="mute"]');
const restart = document.querySelector('[data-play="restart"]');
const fullscreen = document.querySelector('[data-play="fullscreen"]');
const confirmation = document.querySelector('.restart-confirm');
const confirmRestart = document.querySelector('[data-play="confirm"]');
const cancelRestart = document.querySelector('[data-play="cancel"]');
const copy = es ? {
  idle: 'Pulsa Jugar en la pantalla para empezar.', loading: 'Cargando el juego…',
  running: 'Juego en marcha. Haz clic en la pantalla para usar el teclado.',
  paused: 'En pausa. Pulsa Continuar para volver al juego.', pause: 'Pausar', resume: 'Continuar',
  mute: 'Silenciar', sound: 'Activar sonido', error: 'No se pudo iniciar el juego. Puedes reintentarlo en la pantalla.',
  fullscreenError: 'No se pudo abrir la pantalla completa en este navegador.',
  frame: 'Jugar a La Abadía del Crimen', full: 'Pantalla completa', exit: 'Salir de pantalla completa'
} : {
  idle: 'Press Play on the screen to begin.', loading: 'Loading the game…',
  running: 'Game running. Click the screen to use the keyboard.',
  paused: 'Paused. Press Resume to return to the game.', pause: 'Pause', resume: 'Resume',
  mute: 'Mute', sound: 'Enable sound', error: 'The game could not start. You can retry on the screen.',
  fullscreenError: 'Full screen could not open in this browser.',
  frame: 'Play La Abadía del Crimen', full: 'Full screen', exit: 'Exit full screen'
};
let frame;
let paused = false;
let active = false;
let pointerPauseAction;
for (const system of systems) {
  const option = document.createElement('option');
  option.value = system.id;
  option.textContent = system.name[es ? 'es' : 'en'];
  select.append(option);
}
const requested = new URLSearchParams(location.search).get('system');
if (systems.some(system => system.id === requested)) select.value = requested;

function send(action) {
  frame?.contentWindow.postMessage({ source: 'abbey-host', action }, location.origin);
}
function showRestartConfirmation(show) {
  confirmation.hidden = !show;
  restart.setAttribute('aria-expanded', String(show));
}
function mount() {
  active = false;
  paused = false;
  showRestartConfirmation(false);
  pause.disabled = mute.disabled = restart.disabled = true;
  pause.textContent = copy.pause;
  mute.textContent = copy.mute;
  mute.setAttribute('aria-pressed', 'false');
  status.textContent = copy.idle;
  const next = document.createElement('iframe');
  next.title = copy.frame;
  next.allow = 'autoplay; fullscreen; gamepad';
  const url = new URL('../assets/emulation/player.html', location.href);
  url.search = new URLSearchParams({ system: select.value, lang: es ? 'es' : 'en', v: '20260914-8' });
  next.src = url.href;
  frame = next;
  screen.replaceChildren(next); // Removing the old browsing context stops audio/workers.
}
mount();
select.addEventListener('change', () => {
  if (active) {
    send('pause');
    showRestartConfirmation(true);
    confirmRestart.focus();
  } else mount();
});
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame?.contentWindow || event.data?.source !== 'abbey-player') return;
  const data = event.data;
  if (data.type === 'loading') status.textContent = copy.loading;
  if (data.type === 'error') {
    status.textContent = copy.error;
    active = false;
    pause.disabled = mute.disabled = true;
    restart.disabled = false;
  }
  if (data.type === 'running' || data.type === 'state') {
    active = true;
    paused = data.paused;
    pause.disabled = mute.disabled = restart.disabled = false;
    pause.textContent = paused ? copy.resume : copy.pause;
    mute.textContent = data.muted ? copy.sound : copy.mute;
    mute.setAttribute('aria-pressed', String(data.muted));
    status.textContent = paused ? copy.paused : copy.running;
  }
  if (data.type === 'escape-focus') {
    if (document.fullscreenElement) document.exitFullscreen().then(() => pause.focus());
    else pause.focus();
  }
});
// Moving focus out of the frame pauses it before the pointer's click arrives.
// Preserve the action the button offered when the user first pressed it.
pause.addEventListener('pointerdown', () => { pointerPauseAction = paused ? 'resume' : 'pause'; });
pause.addEventListener('pointercancel', () => { pointerPauseAction = undefined; });
pause.addEventListener('click', () => {
  const action = pointerPauseAction || (paused ? 'resume' : 'pause');
  pointerPauseAction = undefined;
  if (action === 'resume') frame.focus();
  send(action);
});
mute.addEventListener('click', () => send('mute'));
restart.addEventListener('click', () => {
  send('pause');
  showRestartConfirmation(true);
  confirmRestart.focus();
});
confirmRestart.addEventListener('click', () => { mount(); frame.focus(); });
cancelRestart.addEventListener('click', () => {
  select.value = new URL(frame.src).searchParams.get('system');
  showRestartConfirmation(false);
  pause.focus();
});
fullscreen.disabled = !document.fullscreenEnabled;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await screen.requestFullscreen();
    frame.focus();
  } catch (_) { status.textContent = copy.fullscreenError; }
});
document.addEventListener('fullscreenchange', () => {
  fullscreen.textContent = document.fullscreenElement ? copy.exit : copy.full;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) send('pause'); });
