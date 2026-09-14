(() => {
  'use strict';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Respect prefers-reduced-motion for autoplaying video loops
  --------------------------------------------------------------------- */
  if (reducedMotion) {
    document.querySelectorAll('video[autoplay]').forEach((v) => {
      v.removeAttribute('autoplay');
      v.pause();
    });
  }

  /* ---------------------------------------------------------------------
     Mark active nav link based on current page
  --------------------------------------------------------------------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a, .mobile-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------------------------------------------------------------------
     Mobile nav
  --------------------------------------------------------------------- */
  const burger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    // links stay out of tab order while the panel is visually collapsed, regardless
    // of the CSS max-height animation's timing (no reliance on transition-end here)
    const setMobileNavOpen = (open) => {
      mobileNav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      mobileNavLinks.forEach((a) => a.tabIndex = open ? 0 : -1);
    };
    setMobileNavOpen(false);
    const closeMobileNav = () => setMobileNavOpen(false);
    burger.addEventListener('click', () => {
      setMobileNavOpen(!mobileNav.classList.contains('open'));
    });
    mobileNavLinks.forEach((a) =>
      a.addEventListener('click', closeMobileNav)
    );
    mobileNav.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeMobileNav(); burger.focus(); }
    });
  }

  /* ---------------------------------------------------------------------
     Portrait fallback: show initials if the headshot image is missing
  --------------------------------------------------------------------- */
  document.querySelectorAll('.portrait-frame img').forEach((img) => {
    img.addEventListener('error', () => {
      img.closest('.portrait-frame').classList.add('no-photo');
    });
  });

  /* ---------------------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.reveal, .demo-card, .catalog-item, .index-row, .exp-entry, .timeline__item, .pillar, .case-block, .contact-row'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------------------------
     Hover-interaction demo: also toggles on click / Enter / Space so
     keyboard and touch users (and screen readers) can operate it.
  --------------------------------------------------------------------- */
  const hoverTile = document.getElementById('hoverTile');
  const hoverReveal = document.getElementById('hoverReveal');
  if (hoverTile) {
    hoverTile.addEventListener('click', () => {
      const open = hoverTile.classList.toggle('is-open');
      hoverTile.setAttribute('aria-expanded', String(open));
      if (hoverReveal) hoverReveal.setAttribute('aria-hidden', String(!open));
    });
  }

  /* ---------------------------------------------------------------------
     Mini gallery (Development page, "skills in action")
  --------------------------------------------------------------------- */
  const track = document.getElementById('galleryTrack');
  if (track) {
    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById('galDots');
    const prevBtn = document.getElementById('galPrev');
    const nextBtn = document.getElementById('galNext');
    const pauseBtn = document.getElementById('galPause');
    const status = document.getElementById('galStatus');
    const stage = track.closest('.mini-gallery');
    let index = 0;
    let auto = null;
    let userPaused = false;

    slides.forEach((slide, i) => {
      const title = (slide.childNodes[0].textContent || '').trim();
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show slide ${i + 1}: ${title}`);
      if (i === 0) { dot.classList.add('active'); dot.setAttribute('aria-current', 'true'); }
      dot.addEventListener('click', () => { goTo(i); stopAuto(true); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(i, announce) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => {
        d.classList.toggle('active', di === index);
        if (di === index) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      slides.forEach((s, si) => {
        if (si === index) s.removeAttribute('aria-hidden');
        else s.setAttribute('aria-hidden', 'true');
      });
      if (announce !== false && status) {
        const title = (slides[index].childNodes[0].textContent || '').trim();
        status.textContent = `Slide ${index + 1} of ${slides.length}: ${title}`;
      }
    }

    function startAuto() {
      if (auto || userPaused || reducedMotion) return;
      auto = window.setInterval(() => goTo(index + 1, false), 3200);
      if (pauseBtn) {
        pauseBtn.textContent = '❚❚';
        pauseBtn.setAttribute('aria-label', 'Pause automatic slide rotation');
      }
    }
    function stopAuto(byUser) {
      if (byUser) userPaused = true;
      window.clearInterval(auto);
      auto = null;
      if (byUser && pauseBtn) {
        pauseBtn.textContent = '▶';
        pauseBtn.setAttribute('aria-label', 'Start automatic slide rotation');
      }
    }

    prevBtn.addEventListener('click', () => { goTo(index - 1); stopAuto(true); });
    nextBtn.addEventListener('click', () => { goTo(index + 1); stopAuto(true); });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (userPaused) { userPaused = false; startAuto(); }
        else { stopAuto(true); }
      });
    }

    // pause while the user is hovering or keyboard-focused inside the gallery
    stage.addEventListener('mouseenter', () => { if (!userPaused) stopAuto(false); });
    stage.addEventListener('mouseleave', startAuto);
    stage.addEventListener('focusin', () => { if (!userPaused) stopAuto(false); });
    stage.addEventListener('focusout', (e) => {
      if (!stage.contains(e.relatedTarget)) startAuto();
    });

    // with reduced motion there is no rotation to pause — drop the control
    if (reducedMotion && pauseBtn) pauseBtn.hidden = true;

    goTo(0, false);
    startAuto();
  }

  /* ---------------------------------------------------------------------
     Responsive demo: draggable resize handle
  --------------------------------------------------------------------- */
  const resizeDemo = document.getElementById('resizeDemo');
  const resizeHandle = document.getElementById('resizeHandle');
  const resizeBadge = document.getElementById('resizeBadge');

  if (resizeDemo && resizeHandle) {
    let dragging = false;

    const bounds = () => {
      const stageRect = resizeDemo.parentElement.getBoundingClientRect();
      return { min: 90, max: Math.max(91, stageRect.width - 12), left: stageRect.left };
    };

    function labelFor(w) {
      if (w < 150) return 'Mobile';
      if (w < 220) return 'Tablet';
      return 'Desktop';
    }

    // reflect the panel's current rendered width into the badge + slider ARIA,
    // without forcing an explicit width (so the CSS-percentage default stays
    // responsive until the user actually drags or arrows the handle)
    function syncState() {
      const { min, max } = bounds();
      const w = resizeDemo.getBoundingClientRect().width;
      resizeDemo.classList.toggle('is-narrow', w < 150);
      const label = labelFor(w);
      resizeBadge.textContent = label;
      const pct = Math.round(((Math.max(min, Math.min(max, w)) - min) / (max - min)) * 100);
      resizeHandle.setAttribute('aria-valuenow', String(pct));
      resizeHandle.setAttribute('aria-valuetext', `${label} layout`);
    }

    function setWidth(px) {
      const { min, max } = bounds();
      resizeDemo.style.width = `${Math.max(min, Math.min(max, px))}px`;
      syncState();
    }

    function nudge(deltaPx) {
      setWidth(resizeDemo.getBoundingClientRect().width + deltaPx);
    }

    // pointer drag
    resizeHandle.addEventListener('pointerdown', (e) => {
      dragging = true;
      resizeHandle.setPointerCapture(e.pointerId);
    });
    resizeHandle.addEventListener('pointermove', (e) => {
      if (dragging) setWidth(e.clientX - bounds().left + 12);
    });
    resizeHandle.addEventListener('pointerup', () => (dragging = false));
    resizeHandle.addEventListener('pointercancel', () => (dragging = false));

    // keyboard (role="slider")
    resizeHandle.addEventListener('keydown', (e) => {
      const { min, max } = bounds();
      const step = 12;
      switch (e.key) {
        case 'ArrowLeft': case 'ArrowDown': nudge(-step); break;
        case 'ArrowRight': case 'ArrowUp': nudge(step); break;
        case 'Home': setWidth(min); break;
        case 'End': setWidth(max); break;
        case 'PageDown': nudge(-step * 3); break;
        case 'PageUp': nudge(step * 3); break;
        default: return;
      }
      e.preventDefault();
    });

    syncState();
    window.addEventListener('resize', syncState);
  }

  /* ---------------------------------------------------------------------
     Zoom lens
  --------------------------------------------------------------------- */
  const zoomTile = document.getElementById('zoomTile');
  const zoomLens = document.getElementById('zoomLens');
  if (zoomTile && zoomLens) {
    const ZOOM = 2.4;
    const HALF = 50; // half the lens width/height (100px)

    const moveLens = (e) => {
      const rect = zoomTile.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      zoomLens.style.left = `${x - HALF}px`;
      zoomLens.style.top = `${y - HALF}px`;
      zoomLens.style.backgroundSize = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
      zoomLens.style.backgroundPosition = `${-x * ZOOM + HALF}px ${-y * ZOOM + HALF}px`;
    };

    zoomTile.addEventListener('pointermove', (e) => {
      moveLens(e);
      zoomLens.style.opacity = '1';
    });
    zoomTile.addEventListener('pointerdown', (e) => {
      moveLens(e);
      zoomLens.style.opacity = '1';
    });
    zoomTile.addEventListener('pointerleave', () => {
      zoomLens.style.opacity = '';
    });
  }

  /* ---------------------------------------------------------------------
     Live validation demo (Development page)
  --------------------------------------------------------------------- */
  const demoEmail = document.getElementById('demoEmail');
  const demoEmailMsg = document.getElementById('demoEmailMsg');
  if (demoEmail && demoEmailMsg) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    demoEmail.addEventListener('input', () => {
      const value = demoEmail.value.trim();
      demoEmail.classList.remove('is-valid', 'is-invalid');
      demoEmailMsg.classList.remove('is-valid', 'is-invalid');
      if (!value) {
        demoEmailMsg.textContent = 'Waiting for input…';
      } else if (emailPattern.test(value)) {
        demoEmail.classList.add('is-valid');
        demoEmailMsg.classList.add('is-valid');
        demoEmailMsg.textContent = '✓ Looks like a valid email';
      } else {
        demoEmail.classList.add('is-invalid');
        demoEmailMsg.classList.add('is-invalid');
        demoEmailMsg.textContent = '✗ Needs an @ and a domain';
      }
    });
  }

  /* ---------------------------------------------------------------------
     Follow/unfollow stateful UI demo (Development page)
  --------------------------------------------------------------------- */
  const followBtn = document.getElementById('followBtn');
  const followCount = document.getElementById('followCount');
  if (followBtn && followCount) {
    let count = 128;
    let following = false;
    followBtn.addEventListener('click', () => {
      following = !following;
      count += following ? 1 : -1;
      followBtn.setAttribute('aria-pressed', String(following));
      followBtn.textContent = following ? 'Following' : 'Follow';
      followCount.textContent = `${count} followers`;
    });
  }

  /* ---------------------------------------------------------------------
     "Let's talk" chat bubble (Contact page): pop in, type, resolve to text.
     Plays once on scroll into view, replayable on click/keypress.
  --------------------------------------------------------------------- */
  const chatBubble = document.getElementById('chatBubble');
  if (chatBubble) {
    let timers = [];
    const clearTimers = () => { timers.forEach((t) => window.clearTimeout(t)); timers = []; };

    function playBubble() {
      clearTimers();
      chatBubble.classList.remove('is-typed');
      chatBubble.classList.add('is-visible');
      timers.push(window.setTimeout(() => chatBubble.classList.add('is-typing'), 300));
      timers.push(window.setTimeout(() => {
        chatBubble.classList.remove('is-typing');
        chatBubble.classList.add('is-typed');
      }, 1850));
    }

    if (reducedMotion) {
      chatBubble.classList.add('is-visible', 'is-typed');
    } else if ('IntersectionObserver' in window) {
      const bubbleIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playBubble();
              bubbleIO.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      bubbleIO.observe(chatBubble);
    } else {
      playBubble();
    }

    chatBubble.addEventListener('click', playBubble);
    chatBubble.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playBubble(); }
    });
  }

  /* ---------------------------------------------------------------------
      Before/after swap tiles (Design page): tap or Enter/Space to flip,
      in addition to hover, so touch devices aren't left out.
    --------------------------------------------------------------------- */
    document.querySelectorAll('.swap-tile').forEach((tile) => {
      const flip = () => {
        const flipped = tile.classList.toggle('is-flipped');
        tile.setAttribute('aria-pressed', String(flipped));
      };
      tile.addEventListener('click', flip);
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });

    /* ---------------------------------------------------------------------
     Lightbox (Design page: social post gallery)
  --------------------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  let lightboxTrigger = null;

  function openLightbox(src, alt, triggerEl) {
    if (!lightbox) return;
    lightboxTrigger = triggerEl || document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxTrigger) lightboxTrigger.focus();
  }
  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeLightbox(); return; }
      // only the close button is focusable inside the lightbox — keep focus trapped on it
      if (e.key === 'Tab') { e.preventDefault(); lightboxClose.focus(); }
    });
  }

  document.querySelectorAll('.post-frame, .uxflow__imgbtn').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(btn.dataset.full, btn.dataset.alt, btn));
  });

  /* ---------------------------------------------------------------------
     UX flow stepper (UI/UX page): click-through wireframe/flow screens
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-uxflow]').forEach((flow) => {
    const radios = Array.from(flow.querySelectorAll('.uxflow__step input[type="radio"]'));
    const panels = Array.from(flow.querySelectorAll('.uxflow__panel'));
    const prevBtn = flow.querySelector('.uxflow__nav--prev');
    const nextBtn = flow.querySelector('.uxflow__nav--next');
    if (!radios.length) return;

    const currentIndex = () => {
      const i = radios.findIndex((r) => r.checked);
      return i === -1 ? 0 : i;
    };
    const showStep = (index) => {
      radios[index].checked = true;
      panels.forEach((p, i) => p.classList.toggle('is-active', i === index));
    };
    radios.forEach((radio, i) => radio.addEventListener('change', () => showStep(i)));
    prevBtn.addEventListener('click', () => showStep((currentIndex() - 1 + radios.length) % radios.length));
    nextBtn.addEventListener('click', () => showStep((currentIndex() + 1) % radios.length));
  });

  /* ---------------------------------------------------------------------
     This Site, Mapped (UI/UX page):
       - sitemap nodes select a page
       - the large viewer below compares that page's wireframe -> live build
         with a draggable horizontal reveal
  --------------------------------------------------------------------- */
  /* Which sitemap nodes + connector lines light up for each selected page.
     primary = solid hierarchy edges, secondary = dashed direct-from-Home edges. */
  const SITEMAP_ROUTES = {
    home:        { nodes: ['home'], primary: ['home-work', 'home-resume', 'home-contact'], secondary: [] },
    work:        { nodes: ['home', 'work'], primary: ['home-work'], secondary: [] },
    resume:      { nodes: ['home', 'resume'], primary: ['home-resume'], secondary: [] },
    contact:     { nodes: ['home', 'contact'], primary: ['home-contact'], secondary: [] },
    development: { nodes: ['home', 'work', 'development'], primary: ['home-work', 'work-development'], secondary: ['home-development'] },
    uiux:        { nodes: ['home', 'work', 'uiux'], primary: ['home-work', 'work-uiux'], secondary: ['home-uiux'] },
    design:      { nodes: ['home', 'work', 'design'], primary: ['home-work', 'work-design'], secondary: ['home-design'] },
  };

  document.querySelectorAll('[data-sitemap]').forEach((sitemap) => {
    const nodes = Array.from(sitemap.querySelectorAll('[data-sm]'));
    const compare = sitemap.querySelector('[data-compare]');
    if (!nodes.length || !compare) return;

    const map = sitemap.querySelector('[data-sitemap-map]');
    const edges = map ? Array.from(map.querySelectorAll('[data-edge]')) : [];
    const viewer = compare.querySelector('[data-compare-viewer]');
    const range = compare.querySelector('[data-compare-range]');
    const numEl = compare.querySelector('[data-compare-num]');
    const nameEl = compare.querySelector('[data-compare-name]');
    const descEl = compare.querySelector('[data-compare-desc]');
    const wireImg = compare.querySelector('[data-compare-wire]');
    const liveImg = compare.querySelector('[data-compare-live]');
    const openLink = compare.querySelector('[data-compare-open]');

    const highlightRoute = (node) => {
      const route = SITEMAP_ROUTES[node.dataset.node] || { nodes: [node.dataset.node], primary: [], secondary: [] };
      const lit = new Set([...route.primary, ...route.secondary]);
      if (map) map.classList.add('has-selection');
      edges.forEach((edge) => edge.classList.toggle('is-lit', lit.has(edge.dataset.edge)));
      nodes.forEach((n) => {
        n.classList.toggle('in-route', n !== node && route.nodes.includes(n.dataset.node));
      });
    };

    const applyReveal = () => {
      const pct = Number(range.value);
      compare.style.setProperty('--reveal', pct + '%');
      range.setAttribute(
        'aria-valuetext',
        pct <= 1 ? 'Wireframe' : pct >= 99 ? 'Live site' : pct + '% revealed to the live site'
      );
    };

    const fitViewer = () => {
      const ratios = [wireImg, liveImg]
        .map((img) => img.naturalWidth / img.naturalHeight)
        .filter((r) => r && isFinite(r));
      if (!ratios.length) return;
      const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      // low floor so very tall pages (e.g. Design) frame tight to their content
      // instead of gaining dead space down the sides.
      const ar = Math.min(1.9, Math.max(0.16, avg));
      viewer.style.setProperty('--ar', ar.toFixed(3));
    };

    let token = 0;
    const select = (node) => {
      const mine = ++token;
      nodes.forEach((n) => {
        const on = n === node;
        n.classList.toggle('is-selected', on);
        n.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      highlightRoute(node);

      numEl.textContent = node.dataset.num;
      nameEl.textContent = node.dataset.name;
      if (descEl) descEl.textContent = node.dataset.desc || '';
      openLink.href = node.dataset.href;

      viewer.classList.add('is-swapping');
      let pending = 2;
      const settle = () => {
        if (mine !== token || --pending > 0) return;
        fitViewer();
        viewer.classList.remove('is-swapping');
      };
      [
        [wireImg, node.dataset.wire, 'Wireframe of the ' + node.dataset.name + ' page'],
        [liveImg, node.dataset.live, 'Final live version of the ' + node.dataset.name + ' page'],
      ].forEach(([img, src, alt]) => {
        img.onload = img.onerror = () => {
          img.onload = img.onerror = null;
          settle();
        };
        img.alt = alt;
        img.src = src;
        if (img.complete) {
          img.onload = img.onerror = null;
          settle();
        }
      });
    };

    nodes.forEach((node) => node.addEventListener('click', () => select(node)));
    range.addEventListener('input', applyReveal);

    select(nodes[0]);
    applyReveal();
  });

  /* ---------------------------------------------------------------------
     Template picker (Design page): Size × Type × Color → template image
  --------------------------------------------------------------------- */
  const templatePicker = document.getElementById('templatePicker');
  if (templatePicker) {
    const basePath = templatePicker.dataset.basePath;
    const stage = document.getElementById('templatePickerStage');
    const img = document.getElementById('templatePickerImg');
    const caption = document.getElementById('templatePickerCaption');

    function currentSelection() {
      return {
        size: templatePicker.querySelector('input[name="tpl-size"]:checked'),
        type: templatePicker.querySelector('input[name="tpl-type"]:checked'),
        color: templatePicker.querySelector('input[name="tpl-color"]:checked'),
      };
    }

    function updateTemplatePicker() {
      const { size, type, color } = currentSelection();
      if (!size || !type || !color) return;

      const fileName = `${type.value}-${color.value}-${size.value}.png`;
      img.src = basePath + fileName;
      img.alt = `${type.dataset.label} post template, ${color.dataset.label.toLowerCase()} background, ${size.value.replace('x', ' by ')} pixels`;
      img.width = Number(size.value.split('x')[0]);
      img.height = Number(size.value.split('x')[1]);
      stage.dataset.size = size.value;
      caption.textContent = `${type.dataset.label} · ${color.dataset.label} · ${size.dataset.label}`;
    }

    templatePicker.addEventListener('change', (e) => {
      if (e.target.matches('input[type="radio"]')) updateTemplatePicker();
    });
    updateTemplatePicker();
  }
})();