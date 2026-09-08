(function () {
  "use strict";

  const data = window.AbadiaParchmentData;
  if (!data) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speedSteps = [1, 2, 4];
  const scriptUrl = document.currentScript?.src || document.baseURI;
  const vgaBackgroundUrl = new URL('assets/game/parchment-vga-textured.png', scriptUrl);

  document.querySelectorAll('[data-parchment]').forEach(root => {
    const language = root.dataset.parchmentLanguage || document.documentElement.lang || 'es';
    const textKey = root.dataset.parchmentText || 'opening';
    root.dataset.parchmentDataVersion = String(data.version);
    const baseEdition = data.editions.cpc;
    let editionKey = document.documentElement.dataset.platform || root.dataset.parchmentPlatform || 'cpc';
    let edition = data.editions[editionKey] || baseEdition;
    const localizedTexts = data.texts[textKey] || data.texts.opening;
    const text = localizedTexts[language] || localizedTexts.es;
    const canvas = root.querySelector('[data-parchment-canvas]');
    const playButton = root.querySelector('[data-parchment-action="play"]');
    const playIcon = root.querySelector('[data-parchment-play-icon]');
    const pageButton = root.querySelector('[data-parchment-action="page"]');
    const restartButton = root.querySelector('[data-parchment-action="restart"]');
    const speedButtons = Array.from(root.querySelectorAll('[data-parchment-speed]'));
    const status = root.querySelector('[data-parchment-status]');
    const transcript = root.querySelector('[data-parchment-transcript]');
    const soundButtons = Array.from(root.querySelectorAll('[data-parchment-sound]'));
    const soundTracks = Array.from(root.querySelectorAll('[data-parchment-audio]'));
    const soundStatus = root.querySelector('[data-parchment-sound-status]');
    const editionLabel = root.querySelector('[data-parchment-edition]');
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    context.imageSmoothingEnabled = false;

    let vgaBackgroundReady = false;
    const vgaBackground = new Image();
    vgaBackground.decoding = 'async';
    const vgaBackgroundCanvas = document.createElement('canvas');
    vgaBackgroundCanvas.width = data.width;
    vgaBackgroundCanvas.height = data.height;
    const vgaBackgroundContext = vgaBackgroundCanvas.getContext('2d', { alpha: false });
    const vgaOverlayCanvas = document.createElement('canvas');
    vgaOverlayCanvas.width = data.width;
    vgaOverlayCanvas.height = data.height;
    const vgaOverlayContext = vgaOverlayCanvas.getContext('2d');

    vgaBackground.addEventListener('load', () => {
      if (!vgaBackgroundContext || !vgaOverlayContext) return;
      vgaBackgroundContext.fillStyle = '#000';
      vgaBackgroundContext.fillRect(0, 0, data.width, data.height);
      vgaBackgroundContext.imageSmoothingEnabled = true;
      vgaBackgroundContext.imageSmoothingQuality = 'high';
      vgaBackgroundContext.drawImage(vgaBackground, 64, 0, 192, 192);
      vgaBackgroundReady = true;
      root.dataset.parchmentVgaBackground = 'ready';
      root.dataset.parchmentVgaSource = vgaBackgroundUrl.pathname;
      dirty = true;
    });
    vgaBackground.addEventListener('error', () => {
      root.dataset.parchmentVgaBackground = 'error';
      console.warn(`Unable to load the VGA parchment background: ${vgaBackgroundUrl.href}`);
    });
    vgaBackground.src = vgaBackgroundUrl.href;

    function unpackPalette(source) {
      return source.map(hex => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
      ]);
    }

    let palette = unpackPalette(edition.palette);
    const pixels = new Uint8Array(data.width * data.height);
    const basePixels = new Uint8Array(data.width * data.height);
    const image = context.createImageData(data.width, data.height);

    function editionPart(name) {
      return edition[name] || baseEdition[name];
    }

    function applyEdition(platform) {
      editionKey = data.editions[platform] ? platform : 'cpc';
      edition = data.editions[editionKey];
      palette = unpackPalette(edition.palette);
      root.dataset.parchmentPlatform = editionKey;
      if (editionLabel) editionLabel.textContent = edition.label[language] || edition.label.es;
      dirty = true;
    }

    const labels = language === 'es' ? {
      play: 'Reproducir', pause: 'Pausar', continue: 'Continuar',
      pageStatus: 'Página', of: 'de', complete: 'Manuscrito completo',
      noMusic: 'Sin música', cpcMusic: 'CPC · tema de apertura en bucle',
      pcMusic: 'PC CGA original · tema de apertura en bucle',
      vgaMusic: 'Remake VGA · tema de apertura en bucle',
      endingMusic: 'CPC · tema final en bucle',
      pcEndingMusic: 'PC CGA original · tema de apertura repetido al final',
      vgaEndingMusic: 'Remake VGA · tema final en bucle',
      audioError: 'No se ha podido reproducir la pista'
    } : {
      play: 'Play', pause: 'Pause', continue: 'Continue',
      pageStatus: 'Page', of: 'of', complete: 'Manuscript complete',
      noMusic: 'No music', cpcMusic: 'CPC · opening theme looping',
      pcMusic: 'Original PC CGA · opening theme looping',
      vgaMusic: 'VGA remake · opening theme looping',
      endingMusic: 'CPC · ending theme looping',
      pcEndingMusic: 'Original PC CGA · opening theme repeated at the ending',
      vgaEndingMusic: 'VGA remake · ending theme looping',
      audioError: 'The track could not be played'
    };

    function setPixel(x, y, color) {
      if (x >= 0 && x < data.width && y >= 0 && y < data.height) {
        pixels[y * data.width + x] = color;
      }
    }

    function fillRect(x, y, width, height, color) {
      for (let py = y; py < y + height; py++) {
        pixels.fill(color, py * data.width + x, py * data.width + x + width);
      }
    }

    function unpackMode1(value, pixel) {
      return (((value >> (3 - pixel)) & 1) << 1) | ((value >> (7 - pixel)) & 1);
    }

    function drawHorizontal(y, bytes) {
      let source = 0;
      for (let column = 0; column < 48; column++) {
        for (let row = 0; row < 8; row++) {
          const value = bytes[source++];
          for (let pixel = 0; pixel < 4; pixel++) {
            setPixel(64 + column * 4 + pixel, y + row, unpackMode1(value, pixel));
          }
        }
      }
    }

    function drawVertical(x, bytes) {
      let source = 0;
      for (let row = 0; row < 192; row++) {
        for (let byte = 0; byte < 2; byte++) {
          const value = bytes[source++];
          for (let pixel = 0; pixel < 4; pixel++) {
            setPixel(x + byte * 4 + pixel, row, unpackMode1(value, pixel));
          }
        }
      }
    }

    function buildFrame() {
      pixels.fill(0);
      fillRect(0, 0, 64, 200, 1);
      fillRect(256, 0, 64, 200, 1);
      fillRect(0, 192, 320, 8, 1);
      const frame = editionPart('frame');
      drawHorizontal(0, frame.top);
      drawVertical(248, frame.right);
      drawVertical(64, frame.left);
      drawHorizontal(184, frame.bottom);
      basePixels.set(pixels);
    }

    function render() {
      const useVgaBackground = editionKey === 'vga' && vgaBackgroundReady;
      if (useVgaBackground) image.data.fill(0);
      for (let source = 0, target = 0; source < pixels.length; source++, target += 4) {
        if (useVgaBackground && pixels[source] === basePixels[source]) continue;
        const color = palette[pixels[source]];
        image.data[target] = color[0];
        image.data[target + 1] = color[1];
        image.data[target + 2] = color[2];
        image.data[target + 3] = 255;
      }
      if (useVgaBackground) {
        vgaOverlayContext.clearRect(0, 0, data.width, data.height);
        vgaOverlayContext.putImageData(image, 0, 0);
        context.drawImage(vgaBackgroundCanvas, 0, 0);
        context.drawImage(vgaOverlayCanvas, 0, 0);
      } else {
        context.putImageData(image, 0, 0);
      }
      dirty = false;
    }

    function paginate(source) {
      const pages = [];
      let page = '';
      let lines = 0;
      for (const character of source) {
        if (character === '\x1a') break;
        if (character === '\n') {
          pages.push({ text: page, turnDelay: 1575 });
          page = '';
          lines = 0;
          continue;
        }
        page += character;
        if (character === '\r') {
          lines++;
          if (lines === 10) {
            pages.push({ text: page, turnDelay: 2000 });
            page = '';
            lines = 0;
          }
        }
      }
      if (page) pages.push({ text: page, turnDelay: 0 });
      return pages;
    }

    function readableTranscript(source) {
      return source
        .replace(/\x1a/g, '')
        .replace(/\n/g, '\r\r')
        .replace(/\r (?=\S)/g, '\r\r')
        .split(/\r{2,}/)
        .map(paragraph => paragraph.replace(/-\r/g, '').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    }

    const pages = paginate(text);
    let pageIndex = 0;
    let characterIndex = 0;
    let posX = 76;
    let posY = 16;
    let paused = true;
    let started = false;
    let finished = false;
    let speedIndex = 0;
    let elapsed = 0;
    let wait = 0;
    let action = null;
    let dirty = true;
    let previousTime = performance.now();

    function updateControls(continuation = false) {
      if (playButton) {
        const playLabel = paused ? (continuation ? labels.continue : labels.play) : labels.pause;
        playButton.setAttribute('aria-label', playLabel);
        playButton.title = playLabel;
      }
      if (playIcon) playIcon.textContent = paused ? '▶' : '⏸';
      speedButtons.forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.parchmentSpeed) === speedSteps[speedIndex]));
      });
      if (status) status.textContent = finished
        ? labels.complete
        : `${labels.pageStatus} ${pageIndex + 1} ${labels.of} ${pages.length}`;
    }

    function schedule(delay, callback) {
      wait = delay;
      action = callback;
    }

    function glyphFor(character) {
      const glyphs = editionPart('glyphs');
      return glyphs[character] || glyphs.z;
    }

    function drawGlyph(character, x, y) {
      const glyph = glyphFor(character);
      const color = ((character.codePointAt(0) & 0x60) === 0x40) ? 3 : 2;
      glyph.points.forEach(point => setPixel(x + (point & 0x0f), y + (point >> 4), color));
      return glyph.advance;
    }

    function queueCharacter() {
      const page = pages[pageIndex];
      if (characterIndex >= page.text.length) {
        if (pageIndex === pages.length - 1) {
          finished = true;
          paused = true;
          updateControls(true);
          return;
        }
        schedule(page.turnDelay, beginPageTurn);
        return;
      }

      const character = page.text[characterIndex];
      if (character === '\r') {
        characterIndex++;
        posX = 76;
        posY += 16;
        schedule(600, queueCharacter);
        return;
      }
      if (character === ' ') {
        characterIndex++;
        posX += 10;
        schedule(30, queueCharacter);
        return;
      }

      const glyph = glyphFor(character);
      const color = ((character.codePointAt(0) & 0x60) === 0x40) ? 3 : 2;
      let pointIndex = 0;
      const drawPoint = () => {
        if (pointIndex < glyph.points.length) {
          const point = glyph.points[pointIndex++];
          setPixel(posX + (point & 0x0f), posY + (point >> 4), color);
          dirty = true;
          schedule(8, drawPoint);
          return;
        }
        posX += glyph.advance;
        characterIndex++;
        queueCharacter();
      };
      schedule(8, drawPoint);
    }

    function copyBaseRect(x, y, width, height) {
      for (let py = Math.max(0, y); py < Math.min(data.height, y + height); py++) {
        for (let px = Math.max(0, x); px < Math.min(data.width, x + width); px++) {
          pixels[py * data.width + px] = basePixels[py * data.width + px];
        }
      }
    }

    function drawTriangle(x, y, side) {
      const size = side * 4;
      for (let row = 0; row < size; row++) {
        for (let column = 0; column <= row; column++) setPixel(x + column, y + row, 1);
        for (let clear = 1; clear <= 4; clear++) setPixel(x + row + clear, y + row, 0);
      }
      dirty = true;
    }

    function beginPageTurn() {
      let phase = 1;
      let step = 0;
      let x = 240;
      let y = 0;
      let side = 3;

      const turnStep = () => {
        if (phase === 1) {
          if (step >= 45) {
            copyBaseRect(x + 4, 0, 8, 8);
            copyBaseRect(248, (side - 3) * 4, 8, 8);
            phase = 2;
            step = 0;
            x = 64;
            y = 4;
            side = 47;
            turnStep();
            return;
          }
          drawTriangle(x, y, side);
          schedule(20, () => {
            copyBaseRect(x + 4, 0, 8, 8);
            copyBaseRect(248, (side - 3) * 4, 8, 8);
            x -= 4;
            side++;
            step++;
            turnStep();
          });
          return;
        }

        if (step >= 46) {
          pixels.set(basePixels);
          pageIndex++;
          characterIndex = 0;
          posX = 76;
          posY = 16;
          dirty = true;
          updateControls();
          queueCharacter();
          return;
        }
        drawTriangle(x, y, side);
        schedule(20, () => {
          y -= 4;
          copyBaseRect(64, y, 8, 4);
          copyBaseRect(64 + side * 4, 184, 4, 8);
          y += 8;
          side--;
          step++;
          turnStep();
        });
      };
      turnStep();
    }

    function drawPageInstantly() {
      pixels.set(basePixels);
      let x = 76;
      let y = 16;
      for (const character of pages[pageIndex].text) {
        if (character === '\r') {
          x = 76;
          y += 16;
        } else if (character === ' ') {
          x += 10;
        } else {
          x += drawGlyph(character, x, y);
        }
      }
      characterIndex = pages[pageIndex].text.length;
      posX = x;
      posY = y;
      dirty = true;
      paused = true;
      finished = pageIndex === pages.length - 1;
      action = finished ? null : beginPageTurn;
      wait = 0;
      updateControls(true);
    }

    function reset(play = false) {
      pixels.set(basePixels);
      pageIndex = 0;
      characterIndex = 0;
      posX = 76;
      posY = 16;
      elapsed = 0;
      wait = 0;
      action = null;
      paused = !play;
      finished = false;
      dirty = true;
      queueCharacter();
      updateControls();
    }

    function tick(now) {
      const delta = Math.min(100, now - previousTime);
      previousTime = now;
      if (!paused && action) {
        elapsed += delta * speedSteps[speedIndex];
        let operations = 0;
        while (action && elapsed >= wait && operations++ < 800) {
          elapsed -= wait;
          const callback = action;
          action = null;
          callback();
        }
      }
      if (dirty) render();
      requestAnimationFrame(tick);
    }

    playButton?.addEventListener('click', () => {
      if (finished) reset(true);
      else {
        paused = !paused;
        updateControls(paused);
      }
    });
    pageButton?.addEventListener('click', drawPageInstantly);
    restartButton?.addEventListener('click', () => {
      reset(true);
      restartActiveSound();
    });
    speedButtons.forEach(button => button.addEventListener('click', () => {
      const requestedSpeed = Number(button.dataset.parchmentSpeed);
      const requestedIndex = speedSteps.indexOf(requestedSpeed);
      if (requestedIndex !== -1) speedIndex = requestedIndex;
      updateControls(paused && characterIndex >= pages[pageIndex].text.length);
    }));

    let activeSound = null;
    function restartActiveSound() {
      if (!activeSound) return;
      const track = soundTracks.find(audio => audio.dataset.parchmentAudio === activeSound);
      if (track && !track.paused) track.currentTime = 0;
    }

    function stopSound(reset = true) {
      soundTracks.forEach(track => {
        track.pause();
        if (reset) track.currentTime = 0;
      });
      activeSound = null;
      soundButtons.forEach(button => {
        if (button.dataset.parchmentSound !== 'stop') button.setAttribute('aria-pressed', 'false');
        else button.disabled = true;
      });
      if (soundStatus) soundStatus.textContent = labels.noMusic;
    }

    window.addEventListener('reportaje:parchmentaudio', event => {
      if (event.detail?.source !== root && activeSound) stopSound();
    });

    soundButtons.forEach(button => button.addEventListener('click', async () => {
      const choice = button.dataset.parchmentSound;
      if (choice === 'stop' || choice === activeSound) {
        stopSound();
        return;
      }
      stopSound();
      const track = soundTracks.find(audio => audio.dataset.parchmentAudio === choice);
      if (!track) return;
      try {
        await track.play();
        window.dispatchEvent(new CustomEvent('reportaje:parchmentaudio', { detail: { source: root } }));
        activeSound = choice;
        soundButtons.forEach(item => {
          if (item.dataset.parchmentSound !== 'stop') item.setAttribute('aria-pressed', String(item === button));
          else item.disabled = false;
        });
        if (soundStatus) {
          const soundLabels = {
            cpc: labels.cpcMusic,
            pc: labels.pcMusic,
            vga: labels.vgaMusic,
            ending: labels.endingMusic,
            'ending-pc': labels.pcEndingMusic,
            'ending-vga': labels.vgaEndingMusic
          };
          soundStatus.textContent = soundLabels[choice] || labels.cpcMusic;
        }
      } catch (_) {
        stopSound();
        if (soundStatus) soundStatus.textContent = labels.audioError;
      }
    }));

    window.addEventListener('reportaje:platformchange', event => {
      applyEdition(event.detail?.platform || 'cpc');
    });

    if (transcript) {
      readableTranscript(text).forEach(paragraph => {
        const element = document.createElement('p');
        element.textContent = paragraph;
        transcript.appendChild(element);
      });
    }

    buildFrame();
    applyEdition(editionKey);
    reset(false);
    render();
    requestAnimationFrame(tick);

    if (reducedMotion) {
      drawPageInstantly();
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!started && entries.some(entry => entry.isIntersecting)) {
          started = true;
          paused = false;
          updateControls();
          observer.disconnect();
        }
      }, { threshold: .3 });
      observer.observe(canvas);
    } else {
      started = true;
      paused = false;
      updateControls();
    }
  });
})();
