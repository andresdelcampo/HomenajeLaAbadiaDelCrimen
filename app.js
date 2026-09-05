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
  const lightboxPrevious = lightbox ? $('.lightbox-previous', lightbox) : null;
  const lightboxNext = lightbox ? $('.lightbox-next', lightbox) : null;
  const lightboxPageCount = lightbox ? $('.lightbox-page-count', lightbox) : null;
  let lightboxPages = [];
  let lightboxPage = 0;
  let lightboxAlt = '';
  let lightboxBaseCaption = '';
  let lightboxTrigger = null;
  const showLightboxPage = page => {
    if (!lightbox || !lightboxImage || !lightboxPages.length) return;
    lightboxPage = Math.max(0, Math.min(page, lightboxPages.length - 1));
    lightboxImage.src = lightboxPages[lightboxPage];
    lightboxImage.alt = lightboxPages.length > 1 ? `${lightboxAlt} ${lightboxPage + 1}/${lightboxPages.length}` : lightboxAlt;
    if (lightboxCaption) lightboxCaption.textContent = lightboxBaseCaption;
    if (lightboxNavigation) lightboxNavigation.hidden = lightboxPages.length < 2;
    if (lightboxPageCount) lightboxPageCount.textContent = `${lightboxPage + 1} / ${lightboxPages.length}`;
    if (lightboxPrevious) lightboxPrevious.disabled = lightboxPage === 0;
    if (lightboxNext) lightboxNext.disabled = lightboxPage === lightboxPages.length - 1;
    lightbox.scrollTo(0, 0);
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.classList.remove('is-hires');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxNavigation) lightboxNavigation.hidden = true;
    const returnFocus = lightboxTrigger;
    lightboxTrigger = null;
    returnFocus?.focus();
  };
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    if (!lightbox || !lightboxImage) return;
    lightboxPages = (button.dataset.lightboxPages || button.dataset.lightbox).split('|').filter(Boolean);
    lightboxPage = Number(button.dataset.lightboxPage) || 0;
    lightboxAlt = button.dataset.alt || '';
    lightboxBaseCaption = button.dataset.caption || '';
    lightboxTrigger = button;
    showLightboxPage(lightboxPage);
    lightbox.classList.toggle('is-hires', button.hasAttribute('data-lightbox-hires'));
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
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
  }));
  lightboxPrevious?.addEventListener('click', () => showLightboxPage(lightboxPage - 1));
  lightboxNext?.addEventListener('click', () => showLightboxPage(lightboxPage + 1));
  $('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
    if (!lightbox?.classList.contains('is-open') || lightboxPages.length < 2) return;
    if (event.key === 'ArrowLeft') showLightboxPage(lightboxPage - 1);
    if (event.key === 'ArrowRight') showLightboxPage(lightboxPage + 1);
  });
})();
