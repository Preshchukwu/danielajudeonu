/* ==========================================================================
   Daniel Ajudeonu — portfolio · interaction layer
   Progressive enhancement: the page is fully readable without this file.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGSAP && !reduce;
  const safe = (fn) => { try { return fn(); } catch (e) { console.warn(e); } };

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (motion) root.classList.add('anim');

  /* ------------------------------------------------------------------ *
   * Gallery data (29 originals from the previous site, resized)
   * ------------------------------------------------------------------ */
  const P = (n) => `assets/img/img${String(n).padStart(2, '0')}.jpg`;
  const GALLERY = [
    // ring
    { n: 19, c: 'Speaking at NEISA-Kigali 2026', ring: 1, w: 2048, h: 1365 },
    { n: 18, c: 'NEISA Youth Summit panel, Kigali 2026', ring: 1, w: 1600, h: 1066 },
    { n: 21, c: 'Delegate engagement, NEISA', ring: 1, w: 1280, h: 1024 },
    { n: 13, c: 'Conversation at the Pugwash Conference', ring: 1, w: 1600, h: 1067 },
    { n: 28, c: 'Speaking at the Project Management & Leadership Summit', ring: 1, w: 1600, h: 1074 },
    { n: 22, c: 'Stakeholder dialogue', ring: 1, w: 1600, h: 1066 },
    { n: 14, c: 'With Michiji Konuma', ring: 1, w: 1200, h: 1600 },
    { n: 20, c: 'Panel session at the Nuclear Energy Innovation Summit for Africa', ring: 1, w: 1600, h: 1066 },
    { n: 27, c: 'Visit to the Stockholm International Peace Research Institute', ring: 1, w: 1494, h: 1600 },
    { n: 16, c: 'With fellow Pugwash participants', ring: 1, w: 1600, h: 1067 },
    { n: 10, c: 'With fellow participants', ring: 1, w: 1600, h: 1200 },
    { n: 33, c: 'At the Pugwash Conference', ring: 1, w: 1600, h: 1067 },
    // archive
    { n: 24, c: 'Conference reception', w: 1200, h: 1600 },
    { n: 25, c: 'NEISA participants', w: 1024, h: 768 },
    { n: 26, c: 'NEISA engagement', w: 1200, h: 1600 },
    { n: 15, c: 'Engaging with fellow participants', w: 1600, h: 1067 },
    { n: 17, c: 'With colleagues at Pugwash', w: 1600, h: 1067 },
    { n: 29, c: 'Project Management & Leadership Summit', w: 1600, h: 1067 },
    { n: 30, c: 'Professional gathering', w: 1600, h: 1200 },
    { n: 31, c: 'International gathering in Stockholm', w: 1600, h: 1200 },
    { n: 32, c: 'Professional conversation', w: 1200, h: 1600 },
    { n: 12, c: 'Speaking at an event', w: 1125, h: 892 },
    { n: 11, c: 'With fellow participants', w: 1600, h: 1200 },
    { n: 9, c: 'Visit to the Museum of the Future', w: 1200, h: 1600 },
    { n: 8, c: 'Meeting with a colleague', w: 1200, h: 1600 },
    { n: 7, c: 'Beside a public artwork', w: 1280, h: 1600 },
    { n: 6, c: 'Portrait', w: 1200, h: 1600 },
    { n: 5, c: 'Portrait', w: 1200, h: 1600 },
    { n: 23, c: 'Outdoor portrait', w: 1200, h: 1600 },
  ].map((g) => ({ ...g, src: P(g.n) }));

  /* ------------------------------------------------------------------ *
   * Theme (with circular view-transition reveal)
   * ------------------------------------------------------------------ */
  const themeBtn = $('.theme-toggle');
  const metaTheme = $('meta[name="theme-color"]');
  const syncThemeUI = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#070D18' : '#F5F1E8');
    document.dispatchEvent(new CustomEvent('themechange'));
  };
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) { /* ignore */ }
    syncThemeUI();
  };
  syncThemeUI();
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduce) return setTheme(next);
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => setTheme(next));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 1000, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  });

  /* ------------------------------------------------------------------ *
   * Smooth scroll (Lenis) wired to ScrollTrigger
   * ------------------------------------------------------------------ */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined' && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const lockScroll = (on) => {
    root.classList.toggle('is-locked', on);
    if (lenis) (on ? lenis.stop() : lenis.start());
  };
  const goTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
    else if (typeof target === 'number') scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const t = id === 'top' || id === '' ? 0 : document.getElementById(id);
    if (t === null || t === undefined) return;
    e.preventDefault();
    closeMenu();
    goTo(t === 0 ? 0 : t, t === 0 ? {} : { offset: id === 'values' ? 0 : -20 });
    if (id && id !== 'top') history.replaceState(null, '', '#' + id);
  });

  /* ------------------------------------------------------------------ *
   * Text splitting
   * ------------------------------------------------------------------ */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const frag = document.createDocumentFragment();
    const walk = (node, parent) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { parent.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = tok;
            w.appendChild(i); parent.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          const c = n.cloneNode(false); parent.appendChild(c); walk(n, c);
        }
      });
    };
    walk(el, frag);
    el.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = label;
    el.append(sr, frag);
    el.dataset.splitDone = '1';
  }
  if (motion) $$('[data-split], [data-scrub], [data-hero-title]').forEach(splitWords);

  /* Magnetic buttons */
  if (fine && motion) {
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.5)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.5)' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * .32); my((e.clientY - (r.top + r.height / 2)) * .4);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  /* ------------------------------------------------------------------ *
   * Navigation: progress, pill state, scroll-spy + indicator, menu
   * ------------------------------------------------------------------ */
  const nav = $('#nav'), bar = $('.progress i');
  const links = $$('.nav__links a'), indicator = $('.nav__indicator');
  const moveIndicator = (a) => {
    if (!a) { indicator.style.opacity = 0; return; }
    indicator.style.opacity = 1;
    indicator.style.width = a.offsetWidth + 'px';
    indicator.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  let activeId = '';
  const setActive = (id) => {
    activeId = id;
    let found = null;
    links.forEach((a) => { const on = a.dataset.spy === id; a.classList.toggle('is-active', on); if (on) found = a; });
    moveIndicator(found);
  };
  const inkBands = $$('.is-ink');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
    nav.classList.toggle('is-scrolled', scrollY > 60);
    const onInk = inkBands.some((s) => { const r = s.getBoundingClientRect(); return r.top < 44 && r.bottom > 44; });
    nav.classList.toggle('on-ink', onInk);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  addEventListener('resize', () => setActive(activeId));
  const spyIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-section]').forEach((s) => spyIO.observe(s));
  new IntersectionObserver((en) => { if (en[0].isIntersecting) setActive(''); }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#top'));

  const menu = $('#menu'), menuBtn = $('.menu-btn');
  $$('.menu__list li a').forEach((a, i) => a.style.setProperty('--n', i));
  function openMenu() {
    menu.classList.add('is-open'); nav.classList.add('menu-open'); menu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.querySelector('.menu-btn__label').textContent = 'Close';
    lockScroll(true);
  }
  function closeMenu() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open'); nav.classList.remove('menu-open'); menu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.querySelector('.menu-btn__label').textContent = 'Menu';
    lockScroll(false);
  }
  menuBtn.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu()));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ------------------------------------------------------------------ *
   * Hero canvas — an atom that follows the cursor
   * ------------------------------------------------------------------ */
  (function heroCanvas() {
    const cv = $('.hero__canvas'); if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const hero = $('.hero');
    let W = 0, H = 0, dpr = 1, visible = true, raf = 0, t0 = performance.now();
    let mx = 0, my = 0, tx = 0, ty = 0, colLine = '#999', colAcc = '#B07D17';
    const dust = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .3, s: Math.random() * .00008 + .00002, p: Math.random() * 6 }));
    const readColors = () => {
      const cs = getComputedStyle(root);
      colLine = cs.getPropertyValue('--line-2').trim() || colLine;
      colAcc = cs.getPropertyValue('--accent').trim() || colAcc;
    };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now) => {
      raf = 0;
      const t = (now - t0) / 1000;
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      ctx.clearRect(0, 0, W, H);
      const wide = W > 900;
      const cx = wide ? W * .745 + mx * 22 : W * .5 + mx * 14;
      const cy = (wide ? H * .5 : H * .66) + my * 16;
      const R = Math.min(W, H) * (wide ? .56 : .52);
      // concentric engraved rings + ticks
      ctx.lineWidth = 1; ctx.strokeStyle = colLine; ctx.globalAlpha = .5;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, R * (.5 + i * .19), 0, Math.PI * 2); ctx.setLineDash(i === 2 ? [2, 8] : []); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.globalAlpha = .35;
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2 + t * .02, r1 = R * 1.08, r2 = r1 + (i % 10 === 0 ? 14 : 6);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke();
      }
      // orbits + electrons
      ctx.globalAlpha = .75;
      for (let k = 0; k < 3; k++) {
        const rot = (k * Math.PI) / 3 + t * .07 * (k % 2 ? -1 : 1) + mx * .12;
        const rx = R * .9, ry = R * (.3 + my * .03);
        ctx.strokeStyle = colLine; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); ctx.stroke();
        const a = t * (.5 + k * .17) + k * 2.1;
        const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
        const px = cx + ex * Math.cos(rot) - ey * Math.sin(rot), py = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
        ctx.globalAlpha = 1; ctx.fillStyle = colAcc;
        ctx.shadowColor = colAcc; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.globalAlpha = .75;
      }
      // dust
      ctx.fillStyle = colAcc; ctx.globalAlpha = .45;
      dust.forEach((d) => {
        const x = ((d.x + Math.sin(t * .1 + d.p) * .02 + mx * .004) % 1) * W, y = ((d.y - t * d.s * 60 + 1) % 1) * H;
        ctx.beginPath(); ctx.arc(x, y, d.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(draw); };
    resize(); readColors(); start();
    if (reduce) draw(performance.now());
    addEventListener('resize', () => { resize(); if (reduce) draw(performance.now()); });
    document.addEventListener('themechange', () => { readColors(); if (reduce) draw(performance.now()); });
    hero.addEventListener('mousemove', (e) => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
    cv.__fade = true;
    if (motion) gsap.set(cv, { opacity: 0 });
    cv.reveal = () => motion && gsap.to(cv, { opacity: 1, duration: 2, ease: 'power2.out' });
  })();

  /* ------------------------------------------------------------------ *
   * Loader → hero intro
   * ------------------------------------------------------------------ */
  let introRan = false;
  function heroIntro() {
    if (introRan) return; introRan = true;
    root.classList.remove('is-loading');
    lockScroll(false);
    if (!motion) return;
    const cv = $('.hero__canvas');
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.nav__pill', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 1.1 }, 0)
            .fromTo('.hero__eyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .9 }, .1)
      .to('[data-hero-title] .wi', { yPercent: 0, y: 0, duration: 1.3, stagger: .055, ease: 'expo.out' }, .15)
      .fromTo('.hero__text', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1 }, .7)
      .fromTo('.hero__cta > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, stagger: .09 }, .85)
      .fromTo('.hero__arch', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, .2)
      .fromTo('.arch--hero', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, .2)
      .fromTo('.arch--hero img', { scale: 1.45 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, .2)
      .fromTo('.hero__seal', { opacity: 0, scale: .4, rotate: -90 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.3, ease: 'back.out(1.6)' }, 1.1)
      .fromTo('.float-card', { opacity: 0, y: 40, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: .18, ease: 'back.out(1.4)' }, 1.3)
      .fromTo('.hero__caption', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.7);
    if (cv && cv.reveal) cv.reveal();
  }

  function runLoader() {
    const L = $('.loader');
    let seen = false;
    try { seen = sessionStorage.getItem('seen') === '1'; } catch (e) { /* ignore */ }
    if (!L) { heroIntro(); return; }
    if (!motion) { L.remove(); heroIntro(); return; }
    lockScroll(true);
    const fast = seen;
    const count = $('.loader__count');
    const tl = gsap.timeline({ onComplete: () => { L.remove(); heroIntro(); try { sessionStorage.setItem('seen', '1'); } catch (e) { /* ignore */ } } });
    gsap.set('.loader__name span', { yPercent: 120 });
    tl.to('.loader__atom ellipse', { strokeDashoffset: 0, duration: fast ? .6 : 1.5, stagger: .18, ease: 'power2.inOut' }, 0)
      .fromTo('.loader__core', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .7, ease: 'back.out(3)' }, .2)
      .to('.loader__atom', { rotate: 180, duration: fast ? 1 : 2.4, ease: 'power2.inOut', transformOrigin: '50% 50%' }, 0)
      .to('.loader__name span', { yPercent: 0, duration: .9, stagger: .12, ease: 'expo.out' }, .5)
      .to({ v: 0 }, { v: 100, duration: fast ? 1 : 2, ease: 'power2.inOut', onUpdate() { count.textContent = String(Math.round(this.targets()[0].v)).padStart(3, '0'); } }, 0)
      .to('.loader__inner', { opacity: 0, y: -30, duration: .5, ease: 'power2.in' }, fast ? 1.1 : 2.2)
      .to(L, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, fast ? 1.3 : 2.4)
      .add(heroIntro, fast ? 1.9 : 3.0);
    setTimeout(() => { if (L.isConnected) { L.remove(); heroIntro(); } }, 9000); // failsafe
  }
  runLoader();

  /* ------------------------------------------------------------------ *
   * Scroll choreography
   * ------------------------------------------------------------------ */
  if (motion) {
    /* headings */
    $$('[data-split]:not([data-hero-title])').forEach((el) => {
      gsap.to($$('.wi', el), { yPercent: 0, y: 0, duration: 1.2, stagger: .045, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    /* scrubbed paragraphs */
    $$('[data-scrub]').forEach((el) => {
      const words = $$('.wi', el);
      gsap.set(words, { opacity: .14 });
      gsap.to(words, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: .6 } });
    });
    /* generic reveals */
    $$('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-stagger]').forEach((g) => {
      gsap.fromTo(g.children, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
    });
    /* image curtain reveals */
    $$('[data-clip]').forEach((el) => {
      gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    /* parallax images */
    $$('[data-parallax]').forEach((img) => {
      const amt = parseFloat(img.dataset.parallax) || 8;
      gsap.fromTo(img, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    /* counters */
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const o = { v: 0 }; el.textContent = pre + '0' + suf;
      gsap.to(o, { v: end, duration: 2.4, ease: 'power3.out', onUpdate: () => { el.textContent = pre + Math.round(o.v).toLocaleString('en-US') + suf; }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    /* hero parallax on scroll + mouse */
    gsap.to('.hero__visual', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__title', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });
    if (fine) {
      const vis = $('.hero__visual');
      const qx = gsap.quickTo('.hero__arch', 'x', { duration: 1, ease: 'power3' }), qy = gsap.quickTo('.hero__arch', 'y', { duration: 1, ease: 'power3' });
      const fx = gsap.quickTo('.float-card--a', 'x', { duration: 1.2, ease: 'power3' }), fy = gsap.quickTo('.float-card--b', 'y', { duration: 1.2, ease: 'power3' });
      $('.hero').addEventListener('mousemove', (e) => {
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        qx(nx * -20); qy(ny * -14); fx(nx * 36); fy(ny * 30);
      }, { passive: true });
    }

    /* marquee */
    const mq = $('.marquee__track');
    if (mq) {
      const row = $('.marquee__row', mq);
      for (let i = 0; i < 2; i++) { const c = row.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c); }
      const tween = gsap.to(mq, { xPercent: -100 / 3, ease: 'none', duration: 46, repeat: -1 });
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity(), dir = self.direction;
          gsap.to(tween, { timeScale: dir * (1 + Math.min(Math.abs(v) / 260, 8)), duration: .25, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: dir, duration: 1.4 }) });
        },
      });
    }

    /* projects: stacked cards dim + scale as the next arrives */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const cards = $$('.project');
      cards.forEach((card, i) => {
        const next = cards[i + 1]; if (!next) return;
        gsap.to(card, { scale: .94, '--dim': .62, ease: 'none', scrollTrigger: { trigger: next, start: 'top 75%', end: 'top 14%', scrub: true } });
      });
    });
    /* project card entrance */
    $$('.project').forEach((card) => {
      gsap.from(card.querySelectorAll('.project__num, .project__metric, .project__body h3, .project dl > div'), {
        y: 34, opacity: 0, duration: 1, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 80%', once: true },
      });
    });

    /* advisory 3D tilt + spotlight */
    if (fine) {
      $$('[data-tilt]').forEach((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', px * 100 + '%'); card.style.setProperty('--my', py * 100 + '%');
          ry((px - .5) * 9); rx(-(py - .5) * 9);
        });
        card.addEventListener('mouseleave', () => { rx(0); ry(0); });
      });
    }

    /* experience timeline: progress line + node activation */
    const tlWrap = $('.timeline');
    if (tlWrap) {
      gsap.to('.timeline__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tlWrap, start: 'top 65%', end: 'bottom 65%', scrub: true } });
      $$('.tl').forEach((li) => ScrollTrigger.create({ trigger: li, start: 'top 65%', onEnter: () => li.classList.add('is-on'), onLeaveBack: () => li.classList.remove('is-on') }));
    }

    /* values: pinned horizontal track */
    mm.add('(min-width: 900px)', () => {
      const track = $('.values__track'), pin = $('.values__pin'), prog = $('.values__bar');
      if (!track || !pin) return;
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + 24);
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: pin, pin: true, start: 'top top', end: () => '+=' + dist(), scrub: .7, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (s) => prog.style.setProperty('--p', s.progress) },
      });
    });

    /* note: concentric rings expand */
    const rings = $$('.note__rings i');
    if (rings.length) {
      gsap.fromTo(rings, { scale: .25, opacity: .8 }, { scale: (i) => 1.3 + i * .55, opacity: 0, ease: 'none', stagger: .04, scrollTrigger: { trigger: '.note', start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    /* footer name letters */
    const fn = $('.footer__name');
    if (fn) {
      const txt = fn.textContent; fn.textContent = '';
      [...txt].forEach((ch) => { const s = document.createElement('span'); s.textContent = ch; fn.appendChild(s); });
      gsap.from($$('span', fn), { yPercent: 105, duration: 1.4, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: fn, start: 'top 95%', once: true } });
    }
  }

  /* ------------------------------------------------------------------ *
   * Mission pillars (accordion)
   * ------------------------------------------------------------------ */
  (function pillars() {
    const wrap = $('[data-pillars]'); if (!wrap) return;
    const items = $$('.pillar', wrap);
    const open = (p) => items.forEach((x) => x.classList.toggle('is-open', x === p));
    const desktop = () => matchMedia('(min-width: 900px)').matches;
    items.forEach((p) => {
      p.addEventListener('mouseenter', () => { if (desktop() && fine) open(p); });
      p.addEventListener('focus', () => open(p));
      p.addEventListener('click', () => open(p));
      p.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const n = items[(items.indexOf(p) + 1) % items.length]; n.focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const n = items[(items.indexOf(p) - 1 + items.length) % items.length]; n.focus(); }
      });
    });
  })();

  /* ------------------------------------------------------------------ *
   * Engagement filter
   * ------------------------------------------------------------------ */
  (function filter() {
    const chips = $$('.chip[data-filter]'), rows = $$('.role'), count = $('.filters__count');
    if (!chips.length) return;
    const update = (f) => {
      let shown = 0;
      const vis = [];
      rows.forEach((r) => { const on = f === 'all' || r.dataset.type === f; r.hidden = !on; if (on) { shown++; vis.push(r); } });
      count.textContent = `${shown} ${shown === 1 ? 'role' : 'roles'}`;
      if (motion) gsap.fromTo(vis, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .7, stagger: .05, ease: 'power3.out', overwrite: true });
      if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 60);
    };
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((x) => { const on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      update(c.dataset.filter);
    }));
    count.textContent = `${rows.length} roles`;
  })();

  /* ------------------------------------------------------------------ *
   * Education tabs
   * ------------------------------------------------------------------ */
  (function tabs() {
    const tabs = $$('.tab'); if (!tabs.length) return;
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      tabs.forEach((t, k) => { const on = k === i; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
      if (focus) tabs[i].focus();
      if (motion) gsap.fromTo(panels[i].children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .045, ease: 'power3.out' });
      if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 60);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
  })();

  /* ------------------------------------------------------------------ *
   * Gallery: draggable 3D ring + lightbox + archive
   * ------------------------------------------------------------------ */
  (function gallery() {
    const ringEl = $('.ring'), stage = $('.ring__stage'); if (!ringEl || !stage) return;
    const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('.lb__cap'), lbCount = $('.lb__count');
    const arch = $('.archive'), archGrid = $('.archive__grid');
    let lastFocus = null, lbIndex = 0;

    const ringData = GALLERY.filter((g) => g.ring);
    const items = ringData.map((g, i) => {
      const el = document.createElement('div');
      el.className = 'ring__item'; el.dataset.idx = String(GALLERY.indexOf(g));
      el.innerHTML = `<img src="${g.src}" width="${g.w}" height="${g.h}" alt="${g.c.replace(/"/g, '&quot;')}" loading="lazy" decoding="async"><span>${g.c}</span>`;
      stage.appendChild(el); return el;
    });
    const N = items.length, step = 360 / N;
    let rot = 0, vel = 0, dragging = false, lastX = 0, moved = 0, R = 600, auto = .05, inView = false, raf = 0;

    const layout = () => {
      const vw = innerWidth;
      const iw = vw < 560 ? 190 : vw < 900 ? 230 : 290, ih = Math.round(iw * 1.36);
      ringEl.style.setProperty('--iw', iw + 'px'); ringEl.style.setProperty('--ih', ih + 'px');
      stage.style.setProperty('--iw', iw + 'px'); stage.style.setProperty('--ih', ih + 'px');
      items.forEach((el) => { el.style.setProperty('--iw', iw + 'px'); el.style.setProperty('--ih', ih + 'px'); });
      R = Math.round(iw / 2 / Math.tan(Math.PI / N)) + 26;
      items.forEach((el, i) => { el.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; });
      apply();
    };
    const apply = () => {
      stage.style.transform = `translateZ(${-R}px) rotateX(-3deg) rotateY(${rot}deg)`;
      items.forEach((el, i) => {
        const a = (((i * step + rot) % 360) + 360) % 360, d = Math.min(a, 360 - a);
        el.style.opacity = String(clamp(1.15 - d / 120, .12, 1));
        el.style.filter = d > 40 ? `brightness(${clamp(1 - d / 260, .55, 1)})` : 'none';
      });
    };
    const tick = () => {
      raf = 0;
      if (!dragging) { rot += auto + vel; vel *= .94; if (Math.abs(vel) < .002) vel = 0; }
      apply();
      if (inView) raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver((en) => { inView = en[0].isIntersecting; if (inView && !raf && !reduce) raf = requestAnimationFrame(tick); }, { rootMargin: '200px' }).observe(ringEl);

    ringEl.addEventListener('pointerdown', (e) => { dragging = true; moved = 0; lastX = e.clientX; vel = 0; ringEl.setPointerCapture(e.pointerId); });
    ringEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      rot += dx * .2; vel = dx * .2;
      if (reduce) apply();
    });
    const end = (e) => {
      if (!dragging) return; dragging = false;
      if (moved < 6) { const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.ring__item'); if (el) openLB(+el.dataset.idx, el); }
    };
    ringEl.addEventListener('pointerup', end); ringEl.addEventListener('pointercancel', () => { dragging = false; });
    items.forEach((el) => el.setAttribute('tabindex', '0'));
    items.forEach((el) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(+el.dataset.idx, el); } }));
    $$('[data-ring]').forEach((b) => b.addEventListener('click', () => { vel += (b.dataset.ring === 'next' ? -1 : 1) * 3.2; if (reduce) { rot += (b.dataset.ring === 'next' ? -1 : 1) * step; apply(); } }));
    addEventListener('resize', layout); layout();

    /* Lightbox */
    function showLB(i) {
      lbIndex = (i + GALLERY.length) % GALLERY.length;
      const g = GALLERY[lbIndex];
      lbImg.src = g.src; lbImg.alt = g.c; lbCap.textContent = g.c; lbCount.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${GALLERY.length}`;
      if (motion) gsap.fromTo(lbImg, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
    }
    function openLB(i, from) {
      lastFocus = from || document.activeElement;
      lb.hidden = false; showLB(i);
      requestAnimationFrame(() => lb.classList.add('is-open'));
      lockScroll(true); $('.lb__close', lb).focus();
    }
    function closeLB() {
      lb.classList.remove('is-open');
      setTimeout(() => { lb.hidden = true; }, 350);
      if (arch.hidden) lockScroll(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    $('.lb__close', lb).addEventListener('click', closeLB);
    $('.lb__nav--prev', lb).addEventListener('click', () => showLB(lbIndex - 1));
    $('.lb__nav--next', lb).addEventListener('click', () => showLB(lbIndex + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    let sx = 0;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => { const dx = e.clientX - sx; if (Math.abs(dx) > 60) showLB(lbIndex + (dx < 0 ? 1 : -1)); });
    addEventListener('keydown', (e) => {
      if (!lb.hidden) {
        if (e.key === 'Escape') { e.stopPropagation(); closeLB(); }
        if (e.key === 'ArrowRight') showLB(lbIndex + 1);
        if (e.key === 'ArrowLeft') showLB(lbIndex - 1);
      } else if (!arch.hidden && e.key === 'Escape') closeArchive();
    });

    /* Archive */
    let built = false;
    function buildArchive() {
      if (built) return; built = true;
      GALLERY.forEach((g, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Open photo: ' + g.c);
        b.innerHTML = `<img src="${g.src}" width="${g.w}" height="${g.h}" alt="" loading="lazy" decoding="async">`;
        b.addEventListener('click', () => openLB(i, b)); archGrid.appendChild(b);
      });
    }
    function openArchive(from) {
      buildArchive(); lastFocus = from; arch.hidden = false; lockScroll(true);
      if (motion) gsap.fromTo(arch, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .9, ease: 'expo.inOut' });
      $('.archive__close', arch).focus();
    }
    function closeArchive() {
      const done = () => { arch.hidden = true; lockScroll(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
      if (motion) gsap.to(arch, { clipPath: 'inset(100% 0 0 0)', duration: .7, ease: 'expo.inOut', onComplete: done }); else done();
    }
    $('[data-archive-open]').addEventListener('click', (e) => openArchive(e.currentTarget));
    $('.archive__close', arch).addEventListener('click', closeArchive);
  })();

  /* Layout can shift after fonts/images — keep triggers honest */
  if (hasGSAP) {
    addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
