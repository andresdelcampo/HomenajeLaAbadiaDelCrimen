# Browser play / Jugar en el navegador

## Español

`es/jugar.html` ofrece las dos ediciones de CPC y el port de ZX Spectrum 128K en una
página propia, enlazada desde El juego: la abadía completa para CPC 6128, la abadía
reducida de 64K para CPC 464/664 y la reedición en disco para Spectrum +3. Los discos arrancan automáticamente; no hace falta
crear una instantánea. Se conserva el manuscrito original: mantén Espacio para saltarlo.
Se requiere un navegador de escritorio, teclado, WebGL 2 y AudioWorklet.
El arranque del disco de Spectrum se acelera automáticamente durante 3600 fotogramas
emulados; el tiempo real de cálculo depende del equipo. El control de ajuste se
conserva en el código, oculto, para reutilizarlo al incorporar otros sistemas. La
cubierta inicial se retira tras un segundo para mostrar la carga real.
La partida se pausa al perder el foco; no hay guardado persistente.

## English

`en/play.html` offers both CPC editions and the 128K ZX Spectrum port on its own page,
linked from The game: the full abbey for CPC 6128, the reduced 64K abbey for CPC
464/664, and the Spectrum +3 disk re-release. All three
disks boot automatically; no prepared snapshot is required. The original manuscript
remains available: hold Space to skip it.
A desktop browser, keyboard, WebGL 2 and AudioWorklet are required.
The Spectrum disk boot is fast-forwarded automatically for 3600 emulated frames;
the real calculation time depends on the computer. Its tuning control remains in
the code, hidden, for reuse when other systems are added. The initial cover clears
after one second to reveal the real loading output. Play pauses
on focus loss; persistent saves are not implemented.

## Maintainer notes

- Serve the site using HTTPS, or `python -m http.server 8765 --bind 127.0.0.1`
  from the site root for local testing. `file://` and plain remote HTTP do not
  supply the secure context required by AudioWorklet and ES modules.
- All emulator code and game media are served locally. Nothing is fetched from
  a third party during play. Each selected runtime includes its WASM, ROMs,
  worker and worklet code. Runtime and disk are fetched only after Play.
- RVMPlayer **0.1.1**, Juan Carlos González Amestoy, BSD-3-Clause. The CPC and
  Spectrum +3 builds were vendored, unmodified, from
  https://cdn.rvmplayer.org/rvmplayer.cpc6128.0.1.1.min.js and
  https://cdn.rvmplayer.org/rvmplayer.plus3.0.1.1.min.js on
  2026-09-14. License and integration documentation:
  https://retrovirtualmachine.org/rvmplayer/ . Upstream does not support mobile,
  cartridges, tapes or snapshots in this release. This page uses a bootable DSK.
- The CPC build of RVMPlayer 0.1.1 emulates a CPC 6128 only. The 64K CPC 464/664 program therefore
  runs here in the 6128's compatible mode; the selectable edition and its reduced
  map are authentic, but the surrounding emulated machine is not a native 464 or 664.
- Runtime SHA-256: CPC `7fbbd9de86a9d58da28a5fee6b22c6d5c5697c7b9c7f1bd2d9e4cc1fdfbe1cf7`;
  Spectrum +3 `6307cde63c74b3648b8261c49cb020ee28a6496f98592eeec7f3f6c09bafc61b`.
- Disk: byte-for-byte copy of the existing local
  `Fuentes/ibaca-la-abadia-del-crimen-master/la-abadia-del-crimen-master/src/main/resources/abadia.dsk`.
  Upstream archive: https://github.com/ibaca/la-abadia-del-crimen/tree/master/src/main/resources .
  Extended CPC DSK, 160,768 bytes; SHA-256:
  `282d7263c5e0129d5f88b33afe890eb6188b0c79bed9344c4b8562135d49f6f5`.
  The similarly named `Roms/abadia.dsk` is a different, raw disk format.
- 64K disk: `media/abadia-cpc-64k.dsk`, supplied as the 64K edition by the archived
  Amstrad.es preservation page at
  `http://ftpmirror1.infania.net/sites/www.amstrad-esp.com/juegosamstrad/decargajuegos/laabadiadelcrimen.php`.
  The page distinguishes a cassette image, this 64K DSK and a 128K DSK; its DSK
  header identifies CNGSOFT's LZ2PACKER. Standard CPC DSK, 194,816 bytes; SHA-256:
  `5dc9a38b81649518761ab4bff2215deb8bd8c57e0724ebdde49c6e1ca781cd26`.
  It boots with `run"abadia64.bas"` and reaches the original manuscript, title and
  reduced-map game under the pinned player.
- Spectrum +3 disk: `media/abadia-spectrum-plus3.dsk`, the MCM Software S.A.
  re-release preserved by World of Spectrum at
  `https://worldofspectrum.org/archive/software/games/la-abadia-del-crimen-opera-soft-sa`.
  The archive identifies the game as a 128K release and the image as the MCM +3
  disk re-release. DSK, 191,744 bytes; SHA-256:
  `e01cfbfd73cfd5a287d67e02ac5417b9e073e75d0f276f889562d783e5bf7b9e`.
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
  The Spectrum startup advances 3,600 emulated frames before audio begins. The
  dormant tuning field can be enabled again without reintroducing live worker
  hand-offs.
  Spectrum cursor keys are intercepted before RVM's global handler and mapped to
  the game's native A/Z/K/L layout; the matching key-up is mapped as well.
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
