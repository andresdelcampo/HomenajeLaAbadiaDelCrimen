# Browser play / Jugar en el navegador

## Español

`es/jugar.html` ofrece la versión CPC en una página propia, enlazada desde El juego.
El disco arranca automáticamente con `|cpm` y carga acelerada; no hace falta crear
una instantánea. Se conserva el manuscrito original: mantén Espacio para saltarlo.
Se requiere un navegador de escritorio, teclado, WebGL 2 y AudioWorklet.
La partida se pausa al perder el foco; no hay guardado persistente.

## English

`en/play.html` offers the CPC version on its own page, linked from The game.
The disk boots automatically with `|cpm` and accelerated loading; no prepared
snapshot is required. The original manuscript remains available: hold Space to skip it.
A desktop browser, keyboard, WebGL 2 and AudioWorklet are required.
Play pauses on focus loss; persistent saves are not implemented.

## Maintainer notes

- Serve the site using HTTPS, or `python -m http.server 8765 --bind 127.0.0.1`
  from the site root for local testing. `file://` and plain remote HTTP do not
  supply the secure context required by AudioWorklet and ES modules.
- All emulator code and game media are served locally. Nothing is fetched from
  a third party during play. The 397,953-byte runtime includes its WASM, ROMs,
  worker and worklet code. Runtime and disk are fetched only after Play.
- RVMPlayer **0.1.1**, Juan Carlos González Amestoy, BSD-3-Clause. Vendored,
  unmodified from https://cdn.rvmplayer.org/rvmplayer.cpc6128.0.1.1.min.js on
  2026-09-14. License and integration documentation:
  https://retrovirtualmachine.org/rvmplayer/ . Upstream does not support mobile,
  cartridges, tapes or snapshots in this release. This page uses a bootable DSK.
- Runtime SHA-256: `7fbbd9de86a9d58da28a5fee6b22c6d5c5697c7b9c7f1bd2d9e4cc1fdfbe1cf7`.
- Disk: byte-for-byte copy of the existing local
  `Fuentes/ibaca-la-abadia-del-crimen-master/la-abadia-del-crimen-master/src/main/resources/abadia.dsk`.
  Upstream archive: https://github.com/ibaca/la-abadia-del-crimen/tree/master/src/main/resources .
  Extended CPC DSK, 160,768 bytes; SHA-256:
  `282d7263c5e0129d5f88b33afe890eb6188b0c79bed9344c4b8562135d49f6f5`.
  The similarly named `Roms/abadia.dsk` is a different, raw disk format.
  Game media remains separately copyrighted; the emulator license does not
  license the game. See the site's RIGHTS.md.
- `systems.js` is the playable-system registry, independent of `app.js`'s visual
  editions. Add a machine entry with a stable ID, name, adapter, media and boot
  settings. Add its adapter to `player.js` if a different engine is required.
  Do not reuse CPC settings blindly for another system. Each adapter should
  implement loading, running, error and state messages plus pause/resume/mute.
- Parent/frame messages check both origin and source. There is no URL-supplied
  arbitrary media/script path. Restart replaces the entire iframe so the old
  worker, audio worklet, keyboard handlers and graphics context are discarded.
- The wrapper uses pinned controller internals (`run`, `diskLoaded`, `port`,
  `ready`, `togglePause`, `sVolume`) after inspection of this exact runtime.
  Revalidate them before an upstream upgrade. The vendor source stays intact.
  Keyboard taps are held at least 80 ms so audio-worklet batches cannot swallow
  a quick down/up pair; held keys are released immediately on blur/pause.
- With a restrictive CSP, allow the local scripts and WASM compilation, local
  frames, `blob:` workers/worklets, `data:` images and the upstream runtime's
  injected CSS. No cross-origin isolation headers are needed.

Checks: `python tools/verify-site.py`, `node --check play.js`,
`node --check assets/emulation/player.js`, `node --test tools/play.test.mjs`.
Browser verification must also check real disk boot, keyboard input, pause and
resume, mute, fullscreen, restart/cancel, both languages and responsive layout.
