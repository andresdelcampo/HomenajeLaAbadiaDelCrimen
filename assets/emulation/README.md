# Browser play / Jugar en el navegador

## Español

`es/jugar.html` ofrece las dos imágenes de PC CGA, las dos ediciones de CPC, MSX y las
ediciones de ZX Spectrum 128K en una página propia, enlazada desde El juego: la imagen original
y la imagen pirata de PC CGA, la abadía completa para CPC 6128, la abadía reducida de
64K para CPC 464/664, las ediciones MSX en cinta y disco, las cintas original y MCM de Spectrum y la reedición en disco para Spectrum +3. Los discos y cintas arrancan automáticamente; no hace falta
crear una instantánea. Se conserva el manuscrito original: mantén Espacio para saltarlo.
Se requiere un navegador de escritorio y teclado. Las ediciones CPC/Spectrum usan WebGL 2
y AudioWorklet; PC CGA usa WebAssembly, Canvas 2D y AudioContext.
El arranque del disco de Spectrum se acelera automáticamente durante 3600 fotogramas
emulados; el tiempo real de cálculo depende del equipo. El control de ajuste se
conserva en el código, oculto, para reutilizarlo al incorporar otros sistemas.
En RVMPlayer, la cubierta inicial se retira tras un segundo para mostrar la carga real;
PC CGA la retira con el primer fotograma real y mantiene durante unos dos segundos
la primera pantalla nativa que aparece después de elegir F1 o F2.
La partida se pausa al perder el foco; no hay guardado persistente.

## English

`en/play.html` offers both PC CGA disk images, both CPC editions, MSX and the 128K ZX Spectrum
editions on its own page, linked from The game: the original and pirate PC CGA images, the
full abbey for CPC 6128, the reduced 64K abbey for CPC 464/664, the MSX disk and tape editions, the original and MCM Spectrum tapes, and the Spectrum +3 disk
re-release. All ten disks and tapes boot automatically; no prepared snapshot is required. The original manuscript
remains available: hold Space to skip it.
A desktop browser and keyboard are required. The CPC/Spectrum editions require WebGL 2
and AudioWorklet; PC CGA uses WebAssembly, Canvas 2D and AudioContext.
The Spectrum disk boot is fast-forwarded automatically for 3600 emulated frames;
the real calculation time depends on the computer. Its tuning control remains in
the code, hidden, for reuse when other systems are added. For RVMPlayer, the initial
cover clears after one second to reveal the real loading output; PC CGA clears it on
the first real frame and holds the first native screen after choosing F1 or F2 for
about two seconds. Play pauses on focus loss; persistent saves are not implemented.

## Maintainer notes

- Serve the site using HTTPS, or `python -m http.server 8765 --bind 127.0.0.1`
  from the site root for local testing. `file://` and plain remote HTTP do not
  supply the secure context required by AudioWorklet and ES modules.
- All emulator code and game media are served locally. Nothing is fetched from
  a third party during play. Each selected runtime serves its required WASM and
  worker assets. Runtime and disk are fetched only after Play.
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
- PC CGA uses the browser bundle from the official `emulators` npm package 8.4.2,
  released 2026-08-28, under GPL-2.0. The vendored runtime is unmodified and was
  extracted from `https://registry.npmjs.org/emulators/-/emulators-8.4.2.tgz`, from
  the source repository `https://github.com/caiiiycuk/emulators`;
  npm integrity is `sha512-oH6c89mcBF3TUABu31cVT0YSMHmTMMTQWgANNQ/+jNcJ0jHV68Ql5x1gZ+Csb7BUS+iCkY1pCVYbp09QDa+fMA==`.
  This page uses `wdosbox.js` and `wdosbox.wasm` from that package, with the package
  licence at `js-dos/LICENSE.txt`. Runtime hashes are `emulators.js`
  `18b960a4faaa781bff90cbf97aa7978e61dca277ba7544653b7ea99d91fa6d94`,
  `wdosbox.js` `4fdff4523283ca15a42d977a3c26d39486ee1dcc5b769791609ecb6294526dbb`,
  and `wdosbox.wasm` `6615d2b06fc057d9454ae5b7b0593601bad7e64631707d4895a5639fc2f22aef`.
- PC CGA disks: `media/abadia-pc.ima` is the supplied original bootable disk
  image, 737,280 bytes, SHA-256
  `1189de5791581ab931068a6436e72a7d39486ba094c8e005a53dd49702692a3c`;
  `media/abadia-pc-pirata.ima` is the separately supplied pirate image, also 737,280
  bytes, SHA-256 `b8040fb0999b2adf1a810d651fa6546fbec7ce97021b206d27e5a6780bcca625`.
  Both are preserved byte-for-byte and booted with DOSBox's `boot disk.ima` path.
  The selector labels the two supplied images; the runtime does not assert that a raw
  IMA reproduces every physical-disk CRC/protection condition.
- PC CGA keyboard input uses the runtime's native `KBD_KEYS` values (F1/F2 `290/291`,
  arrows `265/264/262/263`, Enter `257`) from the pinned
  [js-dos DOSBox keyboard header](https://github.com/js-dos/dosbox/blob/528578d5a6f76afd4d5ef4e722b5670826f1183a/include/keyboard.h).
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
- Spectrum original tape: `media/abadia-spectrum-original.tzx`, the original
  128K cassette release catalogued separately from the MCM editions by World of
  Spectrum. TZX, 99,287 bytes; SHA-256:
  `0250518805e44747cd7e1396545c5eca39e4b5d1c349bf7937c55560477010c0`.
- Spectrum MCM tape: `media/abadia-spectrum-mcm.tzx`, the MCM Software S.A.
  cassette re-release. TZX, 99,290 bytes; SHA-256:
  `e9c8219fccb6ec14b90c46ca07501ba35d7885bfd224a5ed3b9556507ee539d`.
  These are separate playable entries because their final data blocks differ;
  the MCM tape also contains a distinct pause block. Both tapes use the local
  ZX-M8XXX 128K core and retain their original turbo loaders. The player
  fast-forwards only the cassette loading phase, returning to 50 Hz when the
  game begins; no prepared snapshot or game-data patch is used.
- Spectrum tape emulator: the vendored core of
  [ZX-M8XXX](https://github.com/Bedazzle/ZX-M8XXX), version 0.16.3 at commit
  `9eb5c306da2ad37855685a9b91fee71f6c04a26a`, GPL-3.0. Source and the ROM
  provenance are documented in [zxm8/README.md](zxm8/README.md). The supplied
  32 KiB `128.rom` is loaded as the two 16 KiB 128K ROM banks; its SHA-256 is
  `c1ff621d7910105d4ee45c31e9fd8fd0d79a545c78b66c69a562ee1ffbae8d72`.
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

## MSX / WebMSX

- MSX uses the unmodified WebMSX **6.0.8** embedded build by Paulo Augusto Peccin,
  from `release/stable/6.0/embedded/wmsx.js` at upstream commit
  `4f4009e86d3e0bb9be7dcd7f0a582b0cd411d660`:
  https://github.com/ppeccin/WebMSX/tree/4f4009e86d3e0bb9be7dcd7f0a582b0cd411d660 .
  Runtime SHA-256: `f24443faf9a55a018785eaf2cf291d74e19284e3785b291a2c0ef29af06b07bd`.
- The supplied `MSX - La Abadia del Crimen (Opera Soft, 1988).zip` contains
  `La Abadia del Crimen (Opera Soft, 1988).dsk`; it is copied byte-for-byte to
  `media/abadia-msx.dsk` (368,640 bytes). SHA-256:
  `7734ef8610a0616d9f35107c61969730942e4bea48d10d1e89436bb31c2f4e13`.
- Boot configuration: MSX1E (PAL, 64K), DISK extension, automatic disk boot,
  120 fast-boot frames. Runtime, embedded firmware/images and disk are local;
  the runtime loads only after Play. The original manuscript is retained.
- The wrapper uses the pinned runtime's `room.machine.userPause`,
  `room.controllersHub.releaseControllers`, `room.speaker.mute/unMute`, and
  `shutdown`. Short key taps last at least 80ms; focus loss releases held keys.
  Mute is reapplied after resume because WebMSX itself unmutes on resume.
- Upstream headers reference `license.txt`, but that file is absent from the
  pinned repository and https://webmsx.org/license.txt returns 404. No open
  license is asserted here. The runtime copyright notice is preserved, and
  embedded firmware and game media retain their separate rights.
- Desktop Retro Virtual Machine supports MSX, but RVMPlayer 0.1.1 supports
  CPC/Spectrum only: https://retrovirtualmachine.org/rvmplayer/ .
- The system selector sorts translated names alphabetically with numeric model
  ordering; CPC 6128 remains the default and explicit system links still work.

### MSX tape / Cinta MSX

- `media/abadia-msx.cas` is the unmodified `ABADIA.CAS` from
  https://computeremuzone.com/msx/abadia_msx.zip , retrieved 2026-09-15.
  Catalogue and edition comparison:
  https://computeremuzone.com/ficha/166/la-abadia-del-crimen?sec=msx .
  Size: 103,840 bytes. SHA-256:
  `309e628a5b426423d90816a89969688b5c14e491f67da72c7b2234f6e05df4e9`.
- The tape version is included for its original black/yellow gameplay palette,
  compared with the blue/yellow disk edition. No different map or gameplay is
  claimed. It uses MSX1E with NODISK, TAPE_URL and WebMSX's automatic BLOAD command.
- Fast loading uses WebMSX's built-in CAS BIOS driver (direct header/byte reads,
  rather than real-time cassette audio). FAST_BOOT accelerates the first 120
  machine frames; gameplay speed remains 100%. No recolouring, RAM patch or
  prepared save state is used. The entire CAS is retained, including later blocks.

## Amstrad PCW / 1985

- PCW 8256, Habisoft conversion **1.2**, obtained directly from
  https://www.habisoft.com/Portada/Abadia.zip on 2026-09-15.
  The author's current download page is https://www.habisoft.com/ .
- `Abadia_1_2_8256.dsk` is copied unmodified as `media/abadia-pcw.dsk`:
  195,328 bytes, SHA-256
  `1346e5cd92a19c465541ca8b67e8bc5208edd69dc547c70081e95673af828353`.
- Emulator: 1985 **0.4.10**, GPL-2.0-only. Local WebAssembly build, corresponding
  source, license, hashes and rebuild instructions are in [1985](1985/README.md).
  Its included PCW bootstrap firmware retains separate rights.
- All resources are local and the runtime loads only after Play. The disk
  self-boots; no CP/M system disk, typed command or saved state is needed.
  PAL 50 Hz, green monochrome display, DK'tronics AY sound board enabled.
  The 720x256 framebuffer is displayed with doubled scanlines (720x512).
- `1985/title-screen.png` is an actual frame from this disk after 250 emulator
  frames, with scanlines doubled. No reconstruction or recolouring.
- `pcw-player.js` uses the upstream `poc_*` API, a bounded 50 Hz loop and
  Web Audio scheduling. Pause stops emulation and flushes queued sound; input
  is released on blur. Short keyboard taps last at least 80 ms. Restart
  destroys the iframe; neither disk writes nor game progress are persisted.
- Regression: `node --test tools/pcw.test.cjs` boots the actual WASM and disk,
  skips the manuscript and compares cursor input with an identical no-input
  run. Also run `node --test tools/play.test.mjs` and the site verifier.
