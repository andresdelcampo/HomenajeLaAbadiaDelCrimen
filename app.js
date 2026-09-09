(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  $$('img[src^="../assets/characters/"], img[src^="../assets/items/"]').forEach(image => {
    const canonicalSource = image.getAttribute('src');
    const cpcSource = canonicalSource
      .replace('../assets/characters/', '../assets/platforms/cpc/characters/')
      .replace('../assets/items/', '../assets/platforms/cpc/items/');
    const pcSource = cpcSource.replace('/platforms/cpc/', '/platforms/pc/');
    image.dataset.platformSrcCpc = cpcSource;
    image.dataset.platformSrcPc = pcSource;
    image.dataset.platformSrcVga = cpcSource.replace('/platforms/cpc/', '/platforms/vga/');
    image.dataset.platformSrcSpectrum = cpcSource.replace('/platforms/cpc/', '/platforms/spectrum/');
    image.dataset.platformSrcMsx = cpcSource.replace('/platforms/cpc/', '/platforms/msx/');
    image.src = cpcSource;

    const alt = image.getAttribute('alt');
    if (alt && alt.includes('CPC')) {
      image.dataset.platformAltCpc = alt;
      image.dataset.platformAltPc = alt
        .replace('Sprite original CPC de', 'Sprite con paleta PC CGA de')
        .replace('CPC sprite of', 'PC CGA icon of')
        .replace('Sprite CPC', 'Sprite PC CGA');
      image.dataset.platformAltVga = alt
        .replace('Sprite original CPC de', 'Sprite VGA de')
        .replace('CPC sprite of', 'VGA sprite of')
        .replace('Sprite CPC', 'Sprite VGA');
      image.dataset.platformAltSpectrum = alt
        .replace('Sprite original CPC de', 'Sprite Spectrum diurno de')
        .replace('CPC sprite of', 'ZX Spectrum daytime sprite of')
        .replace('Sprite CPC', 'Sprite Spectrum');
      image.dataset.platformAltMsx = alt
        .replace('Sprite original CPC de', 'Sprite MSX diurno de')
        .replace('CPC sprite of', 'MSX daytime sprite of')
        .replace('Sprite CPC', 'Sprite MSX');
    }
  });

  $$('.character-art figcaption').forEach(caption => {
    if (!caption.textContent.includes('CPC')) return;
    caption.dataset.platformTextCpc = caption.textContent;
    caption.dataset.platformTextPc = caption.textContent.replace('CPC · diseño original', 'PC CGA · conversión de paleta');
    caption.dataset.platformTextVga = caption.textContent.replace('CPC · diseño original', 'VGA · redibujado a 256 colores');
    caption.dataset.platformTextSpectrum = caption.textContent.replace('CPC · diseño original', 'ZX Spectrum · tinta diurna');
    caption.dataset.platformTextMsx = caption.textContent.replace('CPC · diseño original', 'MSX · tinta diurna');
  });

  $$('.sprite-credit').forEach(credit => {
    credit.dataset.platformTextCpc = credit.textContent;
    credit.dataset.platformTextPc = document.documentElement.lang === 'es'
      ? 'Patrones e tintas CGA verificados en el volcado PC, mostrados en una bandeja real de tres casillas del marcador.'
      : 'CGA patterns and inks verified against the PC memory dump, shown in a real three-slot tray from the status panel.';
    credit.dataset.platformTextVga = document.documentElement.lang === 'es'
      ? 'Gráficos del remake VGA a 256 colores, mostrados en su bandeja real de tres casillas.'
      : 'Graphics from the 256-colour VGA remake, shown in its real three-slot tray.';
    credit.dataset.platformTextSpectrum = document.documentElement.lang === 'es'
      ? 'Máscaras originales verificadas con la instantánea Spectrum de 128 KB, en tinta diurna amarilla y azul y dentro de su marcador real.'
      : 'Original masks verified against the 128K Spectrum snapshot, using its yellow-and-blue daytime ink and real status-panel frame.';
    credit.dataset.platformTextMsx = document.documentElement.lang === 'es'
      ? 'Máscaras originales verificadas en capturas MSX, en tinta diurna negra y crema y dentro de su marcador real.'
      : 'Original masks verified against MSX captures, using its black-and-cream daytime ink and real status-panel frame.';
  });

  const platformButtons = $$('[data-platform-choice]');
  const platformImages = $$('[data-platform-src-cpc]');
  const platformTexts = $$('[data-platform-text-cpc]');
  const supportedPlatforms = new Set(['cpc', 'pc', 'vga', 'spectrum', 'msx']);
  const platformSuffix = { cpc: 'Cpc', pc: 'Pc', vga: 'Vga', spectrum: 'Spectrum', msx: 'Msx' };
  let rememberedPlatform = 'cpc';
  try {
    const storedPlatform = localStorage.getItem('reportaje-platform');
    if (supportedPlatforms.has(storedPlatform)) rememberedPlatform = storedPlatform;
  } catch (_) { /* local files may deny storage */ }

  function setPlatform(platform, remember = true) {
    const selected = supportedPlatforms.has(platform) ? platform : 'cpc';
    document.documentElement.dataset.platform = selected;
    platformButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.platformChoice === selected));
    });
    platformImages.forEach(image => {
      const source = image.dataset[`platformSrc${platformSuffix[selected]}`];
      const alt = image.dataset[`platformAlt${platformSuffix[selected]}`];
      if (source) image.src = source;
      if (alt) image.alt = alt;
    });
    platformTexts.forEach(element => {
      const text = element.dataset[`platformText${platformSuffix[selected]}`];
      if (text) element.textContent = text;
    });
    window.dispatchEvent(new CustomEvent('reportaje:platformchange', {
      detail: { platform: selected }
    }));
    if (remember) {
      try { localStorage.setItem('reportaje-platform', selected); } catch (_) { /* navigation still works */ }
    }
  }

  platformButtons.forEach(button => button.addEventListener('click', () => {
    setPlatform(button.dataset.platformChoice);
  }));
  setPlatform(rememberedPlatform, false);

  const languageLinks = $$('[data-language]');
  let rememberedLanguage = null;
  try { rememberedLanguage = localStorage.getItem('reportaje-language'); } catch (_) { /* local files may deny storage */ }
  languageLinks.forEach(link => {
    if (link.dataset.language === rememberedLanguage && $('.language-gate')) link.setAttribute('data-last-language', '');
    link.addEventListener('click', () => {
      try { localStorage.setItem('reportaje-language', link.dataset.language); } catch (_) { /* navigation still works */ }
    });
  });

  $$('.chapter-intro').forEach(intro => {
    if ($('.game-initial', intro)) return;
    const textNode = Array.from(intro.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (!textNode) return;
    const match = textNode.textContent.match(/^(\s*)(\S)([\s\S]*)$/);
    if (!match) return;
    const glyph = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (!/^[A-Z]$/.test(glyph)) return;
    const initial = document.createElement('span');
    initial.className = 'game-initial';
    initial.textContent = match[2];
    textNode.replaceWith(document.createTextNode(match[1]), initial, document.createTextNode(match[3]));
  });

  const progress = $('.progress-rail span');
  if (progress) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${scrollable > 0 ? (scrollY / scrollable) * 100 : 0}%`;
    };
    addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', navLinks).forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .08 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  function activate(buttons, panels, button, key) {
    buttons.forEach(item => item.classList.toggle('is-active', item === button));
    buttons.forEach(item => item.setAttribute('aria-selected', String(item === button)));
    panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset[key] === button.dataset[key]));
  }

  const characterButtons = $$('.character-button');
  const characterPanels = $$('.character-panel');
  characterButtons.forEach(button => button.addEventListener('click', () => {
    activate(characterButtons, characterPanels, button, 'character');
    const dossier = $('.character-dossier');
    if (dossier) dossier.dataset.seal = button.textContent.trim().slice(0, 1);
  }));

  const systemButtons = $$('.system-tab');
  const systemPanels = $$('.system-panel');
  systemButtons.forEach(button => button.addEventListener('click', () => activate(systemButtons, systemPanels, button, 'system')));

  const hourButtons = $$('.hour-button');
  const gameClockLabels = new Set([
    'NOCHE', 'PRIMA', 'TERCIA', 'SEXTA', 'NONA', 'VISPERAS', 'COMPLETAS',
    'NIGHT', 'PRIME', 'TERCE', 'SEXT', 'NONE', 'VESPERS', 'COMPLINE'
  ]);
  hourButtons.forEach(button => {
    const visibleText = button.textContent.trim();
    const label = visibleText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (!gameClockLabels.has(label)) return;
    const image = document.createElement('img');
    image.className = 'game-clock-label';
    image.src = `../assets/game/interface-labels/${label}.svg?v=20260830-clockfont2`;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.addEventListener('error', () => {
      button.classList.remove('has-game-label');
      button.textContent = visibleText;
      button.removeAttribute('aria-label');
    }, { once: true });
    button.classList.add('has-game-label');
    button.setAttribute('aria-label', visibleText);
    button.replaceChildren(image);
  });
  const clockTitle = $('[data-clock-title]');
  const clockText = $('[data-clock-text]');
  const fitClockTitle = () => {
    if (clockTitle) clockTitle.classList.toggle('is-long', clockTitle.textContent.trim().length > 7);
  };
  fitClockTitle();
  hourButtons.forEach(button => button.addEventListener('click', () => {
    hourButtons.forEach(item => item.classList.toggle('is-active', item === button));
    if (clockTitle) {
      clockTitle.textContent = button.dataset.title;
      fitClockTitle();
    }
    if (clockText) clockText.textContent = button.dataset.text;
  }));

  const mapButtons = $$('.map-hotspot');
  const mapTitle = $('[data-map-title]');
  const mapText = $('[data-map-text]');
  mapButtons.forEach(button => button.addEventListener('click', () => {
    mapButtons.forEach(item => item.classList.toggle('is-active', item === button));
    if (mapTitle) mapTitle.textContent = button.dataset.title;
    if (mapText) mapText.textContent = button.dataset.text;
  }));

  const abbeyRoomLayouts = {
    ground: [[8,1,39],[10,1,62],[1,2,10],[2,2,9],[4,2,7],[5,2,8],[6,2,42],[7,2,40],[8,2,38],[9,2,41],[10,2,55],[11,2,56],[12,2,57],[2,3,2],[3,3,1],[4,3,0],[5,3,13],[6,3,14],[7,3,36],[8,3,35],[9,3,37],[10,3,43],[11,3,44],[12,3,45],[2,4,3],[4,4,31],[8,4,34],[10,4,46],[11,4,47],[12,4,48],[2,5,4],[3,5,29],[4,5,30],[6,5,61],[8,5,33],[10,5,49],[11,5,50],[12,5,51],[1,6,12],[2,6,11],[3,6,28],[4,6,5],[5,6,6],[6,6,60],[8,6,32],[10,6,52],[11,6,53],[12,6,54],[3,7,15],[4,7,16],[5,7,17],[6,7,18],[8,7,27],[10,7,26],[6,8,19],[7,8,20],[8,8,21],[9,8,24],[10,8,25],[8,9,22],[8,10,23]],
    scriptorium: [[1,1,69],[2,1,68],[4,1,72],[5,1,73],[2,2,67],[3,2,71],[4,2,74],[2,3,66],[4,3,75],[2,4,65],[3,4,64],[4,4,76],[1,5,63],[2,5,70],[4,5,77],[5,5,78]],
    library: [[1,1,103],[2,1,102],[4,1,101],[5,1,100],[2,2,106],[3,2,105],[4,2,104],[2,3,108],[4,3,107],[2,4,111],[3,4,110],[4,4,109],[1,5,115],[2,5,114],[4,5,113],[5,5,112]]
  };
  $$('[data-abbey-map]').forEach(atlas => {
    const isSpanish = document.documentElement.lang === 'es';
    $$('[data-room-grid]', atlas).forEach(grid => {
      (abbeyRoomLayouts[grid.dataset.roomGrid] || []).forEach(([column, row, room]) => {
        const roomHex = room.toString(16).padStart(2, '0').toUpperCase();
        const button = document.createElement('button');
        button.className = 'abbey-room';
        button.type = 'button';
        button.style.gridColumn = column;
        button.style.gridRow = row;
        button.dataset.roomId = roomHex.toLowerCase();
        button.dataset.mapColumn = column;
        button.dataset.mapRow = row;
        button.setAttribute('aria-label', `${isSpanish ? 'Ampliar estancia' : 'Enlarge room'} ${roomHex}`);
        const image = document.createElement('img');
        image.alt = '';
        image.loading = 'lazy';
        image.width = 512;
        image.height = 320;
        const number = document.createElement('span');
        number.textContent = roomHex;
        number.setAttribute('aria-hidden', 'true');
        button.append(image, number);
        grid.append(button);
      });
    });
    let currentAtlasPlatform = document.documentElement.dataset.platform;
    let currentAtlasLight = 'day';
    const updateAtlasEdition = () => {
      const platform = currentAtlasPlatform;
      const light = currentAtlasLight;
      const useVga = platform === 'vga';
      const useCpc = platform === 'cpc';
      const useSpectrum = platform === 'spectrum';
      const useMsx = platform === 'msx';
      const mapPlatform = useVga ? 'vga' : (useCpc ? 'cpc' : (useSpectrum ? 'spectrum' : (useMsx ? 'msx' : 'cga')));
      const assetSet = `${mapPlatform}-${light}`;
      const lightLabel = light === 'night'
        ? (isSpanish ? 'paleta nocturna' : 'night palette')
        : (isSpanish ? 'paleta diurna' : 'daytime palette');
      const platformLabel = useVga
        ? (isSpanish ? 'Remake VGA · 256 colores' : 'VGA remake · 256 colours')
        : (useCpc
          ? (isSpanish ? 'Amstrad CPC · 4 colores' : 'Amstrad CPC · 4 colours')
          : (useSpectrum
            ? (isSpanish ? 'ZX Spectrum · 2 colores' : 'ZX Spectrum · 2 colours')
            : (useMsx ? (isSpanish ? 'MSX · 2 colores' : 'MSX · 2 colours') : 'PC CGA')));
      const edition = `${platformLabel} · ${lightLabel}`;
      atlas.dataset.mapPlatform = mapPlatform;
      atlas.dataset.mapPalette = light;
      $$('.abbey-room', atlas).forEach(button => {
        const source = `../assets/maps/abbey-rooms/${assetSet}/room-${button.dataset.roomId}.png`;
        const roomHex = button.dataset.roomId.toUpperCase();
        const label = `${isSpanish ? 'Estancia' : 'Room'} ${roomHex}, ${edition}`;
        const image = $('img', button);
        if (image) image.src = source;
        button.dataset.lightbox = source;
        button.dataset.alt = label;
        button.dataset.caption = label;
      });
      const legend = $('[data-abbey-edition]', atlas);
      if (legend) legend.textContent = edition;
    };
    const lightButtons = $$('[data-abbey-light]', atlas);
    lightButtons.forEach(button => button.addEventListener('click', () => {
      currentAtlasLight = button.dataset.abbeyLight;
      lightButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateAtlasEdition();
    }));
    updateAtlasEdition();
    addEventListener('reportaje:platformchange', event => {
      currentAtlasPlatform = event.detail.platform;
      updateAtlasEdition();
    });
    const tabs = $$('[data-abbey-floor]', atlas);
    const panels = $$('[data-abbey-panel]', atlas);
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => {
        const active = panel.dataset.abbeyPanel === tab.dataset.abbeyFloor;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    }));
  });

  const spoilerButton = $('.spoiler-button');
  const days = $('.days-grid');
  if (spoilerButton && days) spoilerButton.addEventListener('click', () => {
    const show = days.classList.toggle('show-spoilers');
    spoilerButton.setAttribute('aria-pressed', String(show));
    spoilerButton.textContent = show ? spoilerButton.dataset.hide : spoilerButton.dataset.show;
  });

  let activeAudio = null;
  $$('.audio-button').forEach(button => button.addEventListener('click', () => {
    const audio = button.querySelector('audio');
    if (!audio) return;
    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      $$('.audio-button').forEach(item => item.classList.remove('is-playing'));
    }
    if (audio.paused) {
      audio.play();
      activeAudio = audio;
      button.classList.add('is-playing');
    } else {
      audio.pause();
      button.classList.remove('is-playing');
    }
    audio.onended = () => button.classList.remove('is-playing');
  }));

  const lightbox = $('.lightbox');
  const lightboxImage = lightbox ? $('img', lightbox) : null;
  const lightboxCaption = lightbox ? $('.lightbox-caption', lightbox) : null;
  const lightboxNavigation = lightbox ? $('.lightbox-navigation', lightbox) : null;
  const lightboxStage = lightbox ? $('.lightbox-stage', lightbox) : null;
  const lightboxPrevious = lightbox ? $('.lightbox-previous', lightbox) : null;
  const lightboxNext = lightbox ? $('.lightbox-next', lightbox) : null;
  const lightboxPageCount = lightbox ? $('.lightbox-page-count', lightbox) : null;
  const lightboxZoomOut = lightbox ? $('.lightbox-zoom-out', lightbox) : null;
  const lightboxZoomIn = lightbox ? $('.lightbox-zoom-in', lightbox) : null;
  const lightboxZoomFit = lightbox ? $('.lightbox-zoom-fit', lightbox) : null;
  const lightboxZoomLevel = lightbox ? $('.lightbox-zoom-level', lightbox) : null;
  const isSpanishViewer = document.documentElement.lang === 'es';
  const roomDirectionLabels = isSpanishViewer
    ? { up: 'Ir a la estancia superior', right: 'Ir a la estancia de la derecha', down: 'Ir a la estancia inferior', left: 'Ir a la estancia de la izquierda' }
    : { up: 'Go to the room above', right: 'Go to the room on the right', down: 'Go to the room below', left: 'Go to the room on the left' };
  const lightboxRoomNavigation = lightbox ? document.createElement('div') : null;
  if (lightboxRoomNavigation) {
    lightboxRoomNavigation.className = 'lightbox-room-navigation';
    lightboxRoomNavigation.hidden = true;
    lightboxRoomNavigation.setAttribute('role', 'group');
    lightboxRoomNavigation.setAttribute('aria-label', isSpanishViewer ? 'Estancias contiguas' : 'Adjacent rooms');
    Object.entries({ up: [0, -1, '↑'], right: [1, 0, '→'], down: [0, 1, '↓'], left: [-1, 0, '←'] }).forEach(([direction, [columnDelta, rowDelta, symbol]]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `lightbox-room-${direction}`;
      button.dataset.roomColumnDelta = columnDelta;
      button.dataset.roomRowDelta = rowDelta;
      button.setAttribute('aria-label', roomDirectionLabels[direction]);
      button.textContent = symbol;
      lightboxRoomNavigation.append(button);
    });
    lightbox.append(lightboxRoomNavigation);
  }
  let lightboxPages = [];
  let lightboxPage = 0;
  let lightboxAlt = '';
  let lightboxBaseCaption = '';
  let lightboxTrigger = null;
  let lightboxZoom = 1;
  let lightboxFitWidth = 0;
  let lightboxFitHeight = 0;
  let lightboxOpenNative = false;
  let lightboxSwipeStart = null;
  const lightboxMinZoom = 1;
  const lightboxMaxZoom = 6;
  const lightboxZoomStep = .25;
  const setLightboxZoom = (zoom, focusPoint = null) => {
    if (!lightbox || !lightboxImage || !lightboxFitWidth || !lightboxFitHeight) return;
    const nextZoom = Math.min(lightboxMaxZoom, Math.max(lightboxMinZoom, Math.round(zoom * 100) / 100));
    const imageRect = lightboxImage.getBoundingClientRect();
    const focusX = focusPoint && imageRect.width ? (focusPoint.x - imageRect.left) / imageRect.width : .5;
    const focusY = focusPoint && imageRect.height ? (focusPoint.y - imageRect.top) / imageRect.height : .5;
    lightboxZoom = nextZoom;
    lightboxImage.style.width = `${Math.round(lightboxFitWidth * lightboxZoom)}px`;
    lightboxImage.style.height = `${Math.round(lightboxFitHeight * lightboxZoom)}px`;
    lightbox.classList.toggle('is-zoomed', lightboxZoom > 1);
    if (lightboxZoomLevel) lightboxZoomLevel.value = `${Math.round(lightboxZoom * 100)}%`;
    if (lightboxZoomOut) lightboxZoomOut.disabled = lightboxZoom <= lightboxMinZoom;
    if (lightboxZoomIn) lightboxZoomIn.disabled = lightboxZoom >= lightboxMaxZoom;
    if (focusPoint) requestAnimationFrame(() => {
      const nextRect = lightboxImage.getBoundingClientRect();
      lightbox.scrollBy(nextRect.left + nextRect.width * focusX - focusPoint.x, nextRect.top + nextRect.height * focusY - focusPoint.y);
    });
  };
  const prepareLightboxImage = () => {
    if (!lightbox?.classList.contains('is-open') || !lightboxImage?.naturalWidth) return;
    const availableWidth = Math.min(1100, Math.max(1, lightbox.clientWidth - 64));
    const availableHeight = Math.max(1, lightbox.clientHeight - 148);
    const fitScale = Math.min(1, availableWidth / lightboxImage.naturalWidth, availableHeight / lightboxImage.naturalHeight);
    lightboxFitWidth = lightboxImage.naturalWidth * fitScale;
    lightboxFitHeight = lightboxImage.naturalHeight * fitScale;
    const nativeZoom = lightboxImage.naturalWidth / lightboxFitWidth;
    setLightboxZoom(lightboxOpenNative ? nativeZoom : 1);
    lightbox.scrollTo(0, 0);
  };
  const showLightboxPage = page => {
    if (!lightbox || !lightboxImage || !lightboxPages.length) return;
    lightboxPage = Math.max(0, Math.min(page, lightboxPages.length - 1));
    lightboxFitWidth = 0;
    lightboxFitHeight = 0;
    lightboxImage.removeAttribute('style');
    lightboxImage.src = lightboxPages[lightboxPage];
    lightboxImage.alt = lightboxPages.length > 1 ? `${lightboxAlt} ${lightboxPage + 1}/${lightboxPages.length}` : lightboxAlt;
    if (lightboxCaption) lightboxCaption.textContent = lightboxBaseCaption;
    if (lightboxNavigation) lightboxNavigation.hidden = lightboxPages.length < 2;
    if (lightboxPageCount) lightboxPageCount.textContent = `${lightboxPage + 1} / ${lightboxPages.length}`;
    if (lightboxPrevious) lightboxPrevious.disabled = lightboxPage === 0;
    if (lightboxNext) lightboxNext.disabled = lightboxPage === lightboxPages.length - 1;
    lightbox.scrollTo(0, 0);
    if (lightboxImage.complete) requestAnimationFrame(prepareLightboxImage);
  };
  lightboxImage?.addEventListener('load', prepareLightboxImage);
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.classList.remove('is-hires');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxNavigation) lightboxNavigation.hidden = true;
    if (lightboxRoomNavigation) lightboxRoomNavigation.hidden = true;
    const returnFocus = lightboxTrigger;
    lightboxTrigger = null;
    returnFocus?.focus();
  };
  const adjacentRoom = (columnDelta, rowDelta) => {
    if (!lightboxTrigger?.classList.contains('abbey-room')) return null;
    const grid = lightboxTrigger.closest('[data-room-grid]');
    const targetColumn = Number(lightboxTrigger.dataset.mapColumn) + columnDelta;
    const targetRow = Number(lightboxTrigger.dataset.mapRow) + rowDelta;
    return grid ? $$('.abbey-room', grid).find(button => (
      Number(button.dataset.mapColumn) === targetColumn && Number(button.dataset.mapRow) === targetRow
    )) : null;
  };
  const updateRoomNavigation = () => {
    if (!lightboxRoomNavigation) return;
    const isRoom = lightboxTrigger?.classList.contains('abbey-room');
    lightboxRoomNavigation.hidden = !isRoom;
    if (!isRoom) return;
    $$('button', lightboxRoomNavigation).forEach(button => {
      button.disabled = !adjacentRoom(Number(button.dataset.roomColumnDelta), Number(button.dataset.roomRowDelta));
    });
  };
  const navigateToAdjacentRoom = (columnDelta, rowDelta) => {
    const nextRoom = adjacentRoom(columnDelta, rowDelta);
    if (!nextRoom) return false;
    openLightbox(nextRoom);
    return true;
  };
  const openLightbox = button => {
    if (!lightbox || !lightboxImage) return;
    lightboxPages = (button.dataset.lightboxPages || button.dataset.lightbox).split('|').filter(Boolean);
    lightboxPage = Number(button.dataset.lightboxPage) || 0;
    lightboxAlt = button.dataset.alt || '';
    lightboxBaseCaption = button.dataset.caption || '';
    lightboxTrigger = button;
    lightboxOpenNative = button.hasAttribute('data-lightbox-hires');
    lightbox.classList.toggle('is-hires', lightboxOpenNative);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showLightboxPage(lightboxPage);
    updateRoomNavigation();
    lightbox.scrollTo(0, 0);
    const focusX = Number(button.dataset.lightboxFocusX);
    const focusY = Number(button.dataset.lightboxFocusY);
    if (Number.isFinite(focusX) && Number.isFinite(focusY)) {
      const focusImage = () => requestAnimationFrame(() => {
        lightbox.scrollLeft = Math.max(0, lightboxImage.offsetLeft + lightboxImage.offsetWidth * focusX - lightbox.clientWidth / 2);
        lightbox.scrollTop = Math.max(0, lightboxImage.offsetTop + lightboxImage.offsetHeight * focusY - lightbox.clientHeight / 2);
      });
      if (lightboxImage.complete) focusImage();
      else lightboxImage.addEventListener('load', focusImage, { once: true });
    }
    $('.lightbox-close', lightbox)?.focus();
  };
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    openLightbox(button);
  }));
  lightboxPrevious?.addEventListener('click', () => showLightboxPage(lightboxPage - 1));
  lightboxNext?.addEventListener('click', () => showLightboxPage(lightboxPage + 1));
  lightboxZoomOut?.addEventListener('click', () => setLightboxZoom(lightboxZoom - lightboxZoomStep));
  lightboxZoomIn?.addEventListener('click', () => setLightboxZoom(lightboxZoom + lightboxZoomStep));
  lightboxZoomFit?.addEventListener('click', () => setLightboxZoom(1));
  (lightboxRoomNavigation ? $$('button', lightboxRoomNavigation) : []).forEach(button => button.addEventListener('click', () => {
    const moved = navigateToAdjacentRoom(Number(button.dataset.roomColumnDelta), Number(button.dataset.roomRowDelta));
    if (moved) button.focus();
  }));
  lightboxImage?.addEventListener('dblclick', event => {
    setLightboxZoom(lightboxZoom > 1 ? 1 : 2, { x: event.clientX, y: event.clientY });
  });
  lightbox?.addEventListener('wheel', event => {
    if (!lightbox.classList.contains('is-open')) return;
    event.preventDefault();
    setLightboxZoom(lightboxZoom + (event.deltaY < 0 ? lightboxZoomStep : -lightboxZoomStep), { x: event.clientX, y: event.clientY });
  }, { passive: false });
  lightboxImage?.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || lightboxZoom > 1) {
      lightboxSwipeStart = null;
      return;
    }
    const touch = event.touches[0];
    lightboxSwipeStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  lightboxImage?.addEventListener('touchend', event => {
    if (!lightboxSwipeStart || lightboxZoom > 1 || event.changedTouches.length !== 1) {
      lightboxSwipeStart = null;
      return;
    }
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - lightboxSwipeStart.x;
    const deltaY = touch.clientY - lightboxSwipeStart.y;
    const horizontal = Math.abs(deltaX) >= Math.abs(deltaY) * 1.2;
    const vertical = Math.abs(deltaY) >= Math.abs(deltaX) * 1.2;
    const threshold = 48;
    lightboxSwipeStart = null;
    if (lightboxTrigger?.classList.contains('abbey-room')) {
      if (horizontal && Math.abs(deltaX) >= threshold) navigateToAdjacentRoom(deltaX < 0 ? 1 : -1, 0);
      else if (vertical && Math.abs(deltaY) >= threshold) navigateToAdjacentRoom(0, deltaY < 0 ? 1 : -1);
    } else if (lightboxPages.length > 1 && horizontal && Math.abs(deltaX) >= threshold) {
      showLightboxPage(lightboxPage + (deltaX < 0 ? 1 : -1));
    }
  }, { passive: true });
  lightboxImage?.addEventListener('touchcancel', () => { lightboxSwipeStart = null; }, { passive: true });
  $('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox || event.target === lightboxStage) closeLightbox(); });
  addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setLightboxZoom(lightboxZoom + lightboxZoomStep); }
    if (event.key === '-') { event.preventDefault(); setLightboxZoom(lightboxZoom - lightboxZoomStep); }
    if (event.key === '0') { event.preventDefault(); setLightboxZoom(1); }
    const roomDirections = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    if (lightboxTrigger?.classList.contains('abbey-room') && roomDirections[event.key]) {
      event.preventDefault();
      const [columnDelta, rowDelta] = roomDirections[event.key];
      navigateToAdjacentRoom(columnDelta, rowDelta);
      return;
    }
    if (lightboxPages.length > 1 && event.key === 'ArrowLeft') showLightboxPage(lightboxPage - 1);
    if (lightboxPages.length > 1 && event.key === 'ArrowRight') showLightboxPage(lightboxPage + 1);
  });
})();
