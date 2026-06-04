/* ═══════════════════════════════════════════════════
   AESHVARYA AWASTHI — PORTFOLIO v2
   Three.js · GSAP ScrollTrigger · Anime.js · Lenis
═══════════════════════════════════════════════════ */

/* Disable browser scroll restoration — prevents video seeking to wrong
   frame when page is refreshed mid-scroll */
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────────
     1. GSAP PLUGIN REGISTRATION
  ───────────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─────────────────────────────────────────────────
     2. LENIS SMOOTH SCROLL (synced with GSAP ticker)
  ───────────────────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.35,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* Force Lenis internal scroll state to 0 — in case browser restored
     scroll position before Lenis initialised */
  lenis.scrollTo(0, { immediate: true });

  /* ─────────────────────────────────────────────────
     3. CINEMATIC VIDEO — pause on load, scroll scrubs it
  ───────────────────────────────────────────────── */
  const cinVideo = document.getElementById('cin-video');
  if (cinVideo) {
    cinVideo.pause();
    cinVideo.currentTime = 0;
  }

  /* ─────────────────────────────────────────────────
     4. MOUSE BLOB
  ───────────────────────────────────────────────── */
  const blob = document.querySelector('.mouse-blob');
  let bx = innerWidth / 2, by = innerHeight / 2;
  let bxT = bx, byT = by;

  document.addEventListener('mousemove', e => { bxT = e.clientX; byT = e.clientY; });

  ;(function blobLoop() {
    bx += (bxT - bx) * 0.055;
    by += (byT - by) * 0.055;
    blob.style.left = bx + 'px';
    blob.style.top  = by + 'px';
    requestAnimationFrame(blobLoop);
  })();

  /* ─────────────────────────────────────────────────
     5. CUSTOM CURSOR
  ───────────────────────────────────────────────── */
  const dot      = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  let cx = 0, cy = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    gsap.set(dot, { x: cx - 2.5, y: cy - 2.5 });
  });

  ;(function cursorFollow() {
    fx += (cx - fx) * 0.11;
    fy += (cy - fy) * 0.11;
    gsap.set(follower, { x: fx - 22, y: fy - 22 });
    requestAnimationFrame(cursorFollow);
  })();

  document.querySelectorAll('a, button, .nav-link, .nav-cta').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));
  });
  document.querySelectorAll('.pc-card').forEach(r => {
    r.addEventListener('mouseenter', () => document.body.classList.add('cur-card'));
    r.addEventListener('mouseleave', () => document.body.classList.remove('cur-card'));
  });

  /* ─────────────────────────────────────────────────
     6. ANIME.JS — TEXT SCRAMBLE
  ───────────────────────────────────────────────── */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%*';

  function scramble(el, duration) {
    const final = el.textContent.trim();
    let startTs = null;

    function tick(ts) {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);

      el.textContent = final.split('').map((ch, i) => {
        if (ch === ' ' || ch === '.') return ch;
        const settled = (i / final.length) * 0.65;
        if (progress > settled + 0.35) return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');

      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = final;
    }

    requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────────────────
     7. ANIME.JS — CYCLING ROLE TEXT
  ───────────────────────────────────────────────── */
  const roles = ['AI Engineer', 'Creator', 'YouTuber', 'Builder', '31K+ Creator'];
  let roleIdx = 0;

  function startRoleCycle() {
    const el = document.getElementById('heroRole');
    setInterval(() => {
      anime({
        targets: el,
        opacity: [1, 0],
        translateY: [0, -14],
        duration: 320,
        easing: 'easeInQuad',
        complete: () => {
          roleIdx = (roleIdx + 1) % roles.length;
          el.textContent = roles[roleIdx];
          anime({
            targets: el,
            opacity: [0, 1],
            translateY: [14, 0],
            duration: 420,
            easing: 'easeOutBack',
          });
        },
      });
    }, 2600);
  }

  /* ─────────────────────────────────────────────────
     8. LOADER — GSAP counter + Anime.js curtain split
  ───────────────────────────────────────────────── */
  const loaderNum = document.getElementById('loaderNum');
  const loaderLn  = document.querySelector('.loader-line');
  const counter   = { v: 0 };

  gsap.timeline({ onComplete: doSplitReveal })
    .to(counter, {
      v: 100, duration: 2.3, ease: 'power2.inOut',
      onUpdate() { loaderNum.textContent = String(Math.floor(counter.v)).padStart(2, '0'); },
    })
    .to(loaderLn, { width: '100%', duration: 2.3, ease: 'power2.inOut' }, 0);

  function doSplitReveal() {
    anime.timeline({ easing: 'easeInOutExpo' })
      .add({
        targets: '.loader-inner',
        opacity: 0,
        duration: 250,
      })
      .add({
        targets: ['.loader-panel-l', '.loader-panel-r'],
        translateX: (_el, i) => i === 0 ? '-101%' : '101%',
        duration: 1000,
        complete: () => {
          document.getElementById('loader').style.display = 'none';
          bootHero();
        },
      }, '-=50');
  }

  /* ─────────────────────────────────────────────────
     9. HERO ENTRANCE + SCROLL JOURNEY
  ───────────────────────────────────────────────── */
  function bootHero() {
    /* After loader clears: eyes.png fills screen.
       Character and text both start at opacity:0. */

    /* Scroll indicator pulses in after a short beat */
    gsap.to('#scrollIndicator', { opacity: .5, duration: 1, delay: .8 });

    /* Kick off scroll animations (includes hero journey) */
    initScroll();
  }

  /* Hero scroll journey — fires at different scroll progress points
     through the 270vh #hero section. Each step reveals content. */
  function initHeroJourney() {
    const heroEl  = document.getElementById('hero');
    const video   = document.getElementById('cin-video');
    const progBar = document.getElementById('cinProgress');
    const DURATION = 30.667; /* actual video duration in seconds */

    /* ─────────────────────────────────────────────────
       MOBILE PATH — iOS Safari won't render currentTime
       seeks on a paused video, so scroll-scrubbing shows
       only a frozen poster. Instead: autoplay + loop the
       video as a live background, reveal text with a
       normal entrance timeline (not gated on scroll).
    ───────────────────────────────────────────────── */
    if (window.innerWidth < 768) {
      if (video) {
        video.loop = true;
        video.muted = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        const tryPlay = () => { const p = video.play(); if (p) p.catch(() => {}); };
        tryPlay();
        /* Retry on first touch in case autoplay was blocked */
        document.addEventListener('touchstart', tryPlay, { once: true });
      }

      /* Hide the scrub progress bar — irrelevant when looping */
      if (progBar && progBar.parentElement) progBar.parentElement.style.display = 'none';

      /* Reveal hero text with a timed entrance */
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('#heroEyebrow', { opacity: 1, y: 0, duration: .7 }, 0.25)
        .to('#heroHeading', {
          opacity: 1, y: 0, duration: .7,
          onStart() {
            document.querySelectorAll('.hero-line').forEach((line, i) => {
              setTimeout(() => scramble(line, 900), i * 180);
            });
          },
        }, 0.45)
        .to('#heroBottom', {
          opacity: 1, y: 0, duration: .7,
          onComplete() { setTimeout(startRoleCycle, 1400); },
        }, 0.75);

      return; /* skip the desktop scrub journey entirely */
    }

    /* ── RAF loop: reads lenis.targetScroll (raw, no smooth lag) ── */
    /* heroScrollLen computed lazily so layout is settled before first read */
    let heroScrollLen = 0;

    (function videoScrubLoop() {
      requestAnimationFrame(videoScrubLoop);
      if (!video) return;

      /* Ensure video never auto-plays — we control it entirely via seek */
      if (!video.paused) video.pause();

      /* Lazy init after layout is ready */
      if (!heroScrollLen) {
        heroScrollLen = heroEl.offsetHeight - window.innerHeight;
        if (!heroScrollLen) return;
      }

      /* lenis.targetScroll = raw user intent, no easing delay */
      const rawProgress = Math.max(0, Math.min(1, lenis.targetScroll / heroScrollLen));
      const target = rawProgress * DURATION;

      if (Math.abs((video.currentTime || 0) - target) > 0.033) {
        if (video.fastSeek) video.fastSeek(target);
        else video.currentTime = target;
      }
      if (progBar) progBar.style.width = (rawProgress * 100) + '%';
    })();

    /* ── Scene timestamps (% of 500vh hero) ── */
    /* 0 %  → 0s    Scene 1: Eyes                  */
    /* 16%  → 5s    Scene 2: Head & Shoulders       */
    /* 32%  → 10s   Scene 3: Half Body + Holograms  */
    /* 52%  → 16s   Scene 4: Full Environment        */
    /* 72%  → ~22s  Final hero moment               */

    /* Eyebrow chip — 6% into hero scroll */
    ScrollTrigger.create({
      trigger: heroEl, start: '6% top', once: true,
      onEnter() {
        gsap.to('#heroEyebrow', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' });
      },
    });

    /* Heading scrambles in — 14% */
    ScrollTrigger.create({
      trigger: heroEl, start: '14% top', once: true,
      onEnter() {
        gsap.to('#heroHeading', { opacity: 1, y: 0, duration: .5, ease: 'power2.out' });
        document.querySelectorAll('.hero-line').forEach((line, i) => {
          setTimeout(() => scramble(line, 950), i * 200);
        });
      },
    });

    /* Bottom bar (role + CTAs) — 26% */
    ScrollTrigger.create({
      trigger: heroEl, start: '24% top', once: true,
      onEnter() {
        gsap.to('#heroBottom', { opacity: 1, y: 0, duration: .75, ease: 'power3.out' });
        setTimeout(startRoleCycle, 2000);
      },
    });

    /* Text fades out as final hero moment plays (72–86%) */
    gsap.to('.cin-text', {
      opacity: 0, y: -35,
      ease: 'power2.in',
      scrollTrigger: {
        trigger: heroEl,
        start: '70% top',
        end: '86% top',
        scrub: 1,
      },
    });
  }

  /* ─────────────────────────────────────────────────
     10. SCROLL ANIMATIONS
  ───────────────────────────────────────────────── */
  function initScroll() {

    /* Hero scroll journey — must run first */
    initHeroJourney();

    /* Navbar appears only after the hero section is fully scrolled past */
    let navAnimated = false;
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom top',
      onEnter() {
        document.getElementById('navbar').classList.add('scrolled');
        if (!navAnimated) {
          navAnimated = true;
          gsap.from('.nav-wordmark', { x: -18, opacity: 0, duration: .7, ease: 'power3.out', delay: .15 });
          gsap.from('.nav-link',     { y: -10, opacity: 0, duration: .5, stagger: .08, ease: 'power3.out', delay: .25 });
          gsap.from('.nav-cta',      { scale: .88, opacity: 0, duration: .55, ease: 'back.out(2)', delay: .55 });
        }
      },
      onLeaveBack: () => document.getElementById('navbar').classList.remove('scrolled'),
    });

    /* Section label clip-path wipes */
    gsap.utils.toArray('[data-clip]').forEach(el => {
      gsap.to(el, {
        clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });

    /* Generic reveal-up */
    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .95, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    /* Heading line-by-line reveals */
    function revealLines(scopeSelector) {
      gsap.utils.toArray(scopeSelector + ' .reveal-line').forEach((line, i) => {
        const inner = document.createElement('div');
        inner.className = 'reveal-line-inner';
        inner.innerHTML = line.innerHTML;
        line.innerHTML  = '';
        line.appendChild(inner);
        gsap.from(inner, {
          y: '102%', duration: 1.05, ease: 'power4.out', delay: i * 0.1,
          scrollTrigger: { trigger: line, start: 'top 87%' },
        });
      });
    }
    revealLines('#about');
    revealLines('#projects .projects-header');
    revealLines('#skills');
    revealLines('#contact');

    /* Stat counters */
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count;
      ScrollTrigger.create({
        trigger: el, start: 'top 86%', once: true,
        onEnter() {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power2.out',
            onUpdate() { el.textContent = Math.floor(obj.v); },
          });
        },
      });
    });

    /* ══════════════════════════════════════════
       PROJECTS — circular fan, infinite one-way loop
    ══════════════════════════════════════════ */
    const pcCards   = document.querySelectorAll('.pc-card');
    const projDots  = document.querySelectorAll('.proj-dot');
    const projCurEl = document.querySelector('.proj-counter-cur');
    const prevBtn   = document.querySelector('.proj-prev');
    const nextBtn   = document.querySelector('.proj-next');

    if (pcCards.length) {
      const n    = pcCards.length; // 7
      const HALF = Math.floor(n / 2); // 3

      /* ── Slot values by absolute offset level (0 = center, HALF+1 = off-screen) ── */
      const X_FRAC = [0, .26, .55, .97, 1.38];
      const ROT_Y  = [0,  33,  57,  70,  80];
      const Z_DEP  = [0,  20,  90, 200, 340];
      const SCALE  = [1, .85, .67, .50, .35];
      const OPACITY= [1, .86, .58, .26,   0];

      function slot(offset) {
        const abs  = Math.min(Math.abs(offset), HALF + 1);
        const sign = offset >= 0 ? 1 : -1;
        return {
          x:       offset === 0 ? 0 : sign * (innerWidth / 2) * X_FRAC[abs],
          z:       -Z_DEP[abs],
          rotateY: offset === 0 ? 0 : sign * ROT_Y[abs],
          scale:   SCALE[abs],
          opacity: OPACITY[abs],
        };
      }

      /* Circular offset: card i at step s → value in -HALF … +HALF */
      function getOff(cardIdx, s) {
        const raw = ((cardIdx - s % n + n) % n);
        return raw > HALF ? raw - n : raw;
      }

      /* Center all cards */
      gsap.set(pcCards, { xPercent: -50, yPercent: -50 });

      /* Initial symmetric fan — all 7 slots filled */
      let step         = 0;
      let autoCall     = null;
      let hovered      = false;
      let centerCardEl = pcCards[0];
      const DWELL      = 1000;

      pcCards.forEach((card, i) => {
        const off = getOff(i, 0);
        gsap.set(card, { ...slot(off), zIndex: Math.max(0, 8 - Math.abs(off)) });
      });

      projDots[0]?.classList.add('active');

      function updateUI(s) {
        const idx = ((s % n) + n) % n;
        projDots.forEach((d, i) => d.classList.toggle('active', i === idx));
        if (projCurEl) projCurEl.textContent = String(idx + 1).padStart(2, '0');
      }

      /* ── Advance to a new step with circular wrap ── */
      function goTo(newStep, dur = 0.52) {
        const prevStep = step;
        step = newStep;
        centerCardEl = pcCards[((step % n) + n) % n];

        pcCards.forEach((card, i) => {
          const prevOff = getOff(i, prevStep);
          const newOff  = getOff(i, step);

          /* Card exits far-left, re-enters from off-screen right */
          if (prevOff === -HALF && newOff === HALF) {
            gsap.set(card, { ...slot(HALF + 1) });
          }
          /* Card exits far-right, re-enters from off-screen left (prev btn) */
          if (prevOff === HALF && newOff === -HALF) {
            gsap.set(card, { ...slot(-(HALF + 1)) });
          }

          gsap.set(card, { zIndex: Math.max(0, 8 - Math.abs(newOff)) });
          gsap.to(card, { ...slot(newOff), duration: dur, ease: 'power3.inOut' });
        });

        updateUI(step);
        autoCall?.kill();
        scheduleAuto();
      }

      /* ── Auto-advance: forward only, wraps forever ── */
      function scheduleAuto() {
        autoCall = gsap.delayedCall(DWELL / 1000, () => {
          if (!hovered) goTo(step + 1);
          else scheduleAuto();
        });
      }
      scheduleAuto();

      /* ── Arrow buttons ── */
      prevBtn?.addEventListener('click', () => goTo(step - 1));
      nextBtn?.addEventListener('click', () => goTo(step + 1));

      /* ── Click a side card → jump forward to it ── */
      pcCards.forEach((card, i) => {
        card.addEventListener('click', () => {
          const off = getOff(i, step);
          if (off !== 0) goTo(step + (off > 0 ? off : n + off));
        });
      });

      /* ── Hover pauses auto-advance ── */
      const stickyEl = document.querySelector('.projects-sticky');
      stickyEl?.addEventListener('mouseenter', () => { hovered = true; });
      stickyEl?.addEventListener('mouseleave', () => { hovered = false; });

      /* ── Subtle rotateX tilt on center card ── */
      window.addEventListener('mousemove', e => {
        const my = (e.clientY / innerHeight - 0.5) * 7;
        gsap.to(centerCardEl, { rotateX: -my, duration: 0.9, ease: 'power2.out' });
      });
    }

    /* Skills particle snap — see section 10 below */

    /* Stat items */
    gsap.utils.toArray('.stat-item').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: i * 0.1,
        scrollTrigger: { trigger: '.about-stats', start: 'top 87%' },
      });
    });

    /* ── Role cycler ── */
    const roles = document.querySelectorAll('.about-role');
    if (roles.length > 0) {
      let activeIdx = 0;
      gsap.set(roles[0], { y: '0%', opacity: 1 });

      function cycleRole() {
        const outEl = roles[activeIdx];
        activeIdx = (activeIdx + 1) % roles.length;
        const inEl  = roles[activeIdx];

        gsap.to(outEl, {
          y: '-120%', opacity: 0, duration: .42, ease: 'power2.in',
          onComplete() { gsap.set(outEl, { y: '120%' }); },
        });
        gsap.fromTo(inEl,
          { y: '120%', opacity: 0 },
          { y: '0%', opacity: 1, duration: .5, ease: 'power3.out', delay: .1 }
        );
      }
      setInterval(cycleRole, 2400);

      /* Reveal the role strip when about section enters view */
      ScrollTrigger.create({
        trigger: '.about-role-strip', start: 'top 88%', once: true,
        onEnter() {
          gsap.to('.about-role-strip', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' });
        },
      });
    }

    /* ── Journey timeline reveal ── */
    const journeyEl = document.querySelector('.about-journey');
    if (journeyEl) {
      gsap.to(journeyEl, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: journeyEl, start: 'top 90%' },
      });

      /* Animate line fills left-to-right */
      gsap.utils.toArray('.journey-line').forEach((line, i) => {
        gsap.fromTo(line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1, duration: .8, ease: 'power2.out', delay: .3 + i * .18,
            scrollTrigger: { trigger: journeyEl, start: 'top 90%' },
          }
        );
      });

      /* Pop in the dots */
      gsap.utils.toArray('.jn-dot').forEach((dot, i) => {
        gsap.fromTo(dot,
          { scale: 0, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: .45, ease: 'back.out(2)', delay: .15 + i * .18,
            scrollTrigger: { trigger: journeyEl, start: 'top 90%' },
          }
        );
      });
    }

    /* ─────────────────────────────────────────────────
       10. SKILLS — magnetic particle snap
    ───────────────────────────────────────────────── */
    (function skillParticles() {
      const canvas = document.getElementById('skills-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const isMobile = window.innerWidth < 768;
      const N = isMobile ? 900 : 2000;

      /* Three categories: word to form + colours */
      const CATS = [
        { word: 'AI',   color: '#00e5ff', dim: '#005f6e' },
        { word: 'WEB',  color: '#7c6ef0', dim: '#312a7a' },
        { word: 'VLOG', color: '#e8ecf2', dim: '#5a6270' },
      ];

      /* Font size ratio keyed by word */
      const FS_RATIO = { AI: 0.28, WEB: 0.20, VLOG: 0.16 };

      let pts   = [];
      let cache = {};       // catIdx → sampled [{x,y}]
      let state = 'scatter';
      let scatterTimer;

      const SNAP_K = 0.055, SNAP_D = 0.80;
      const SCAT_K = 0.030, SCAT_D = 0.92;

      /* ── canvas sizing ──────────────────────────── */
      function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        cache = {};   // invalidate text samples after resize
      }

      /* ── sample lit pixels from large text ─────── */
      function sampleCat(idx) {
        if (cache[idx]) return cache[idx];
        const { word } = CATS[idx];
        const W = canvas.width, H = canvas.height;
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        const oc = off.getContext('2d');
        const fs = Math.max(50, Math.floor(W * (FS_RATIO[word] || 0.18)));
        oc.fillStyle = '#fff';
        oc.font = `900 ${fs}px "Playfair Display", serif`;
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        /* shift text up ~8% — bottom area reserved for overlay label */
        oc.fillText(word, W / 2, H * 0.42);
        const data = oc.getImageData(0, 0, W, H).data;
        const pos = [];
        const step = 4;
        for (let y = 0; y < H; y += step)
          for (let x = 0; x < W; x += step)
            if (data[(y * W + x) * 4 + 3] > 128) pos.push({ x, y });
        /* Fisher-Yates shuffle for organic particle assignment */
        for (let i = pos.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          const t = pos[i]; pos[i] = pos[j]; pos[j] = t;
        }
        cache[idx] = pos;
        return pos;
      }

      /* ── create particles at random positions ───── */
      function init() {
        const W = canvas.width, H = canvas.height;
        pts = [];
        for (let i = 0; i < N; i++) {
          const x = Math.random() * W, y = Math.random() * H;
          pts.push({
            x, y,
            tx: x + (Math.random() - .5) * W * 1.2,
            ty: y + (Math.random() - .5) * H * 1.2,
            vx: (Math.random() - .5) * 4,
            vy: (Math.random() - .5) * 4,
            size: Math.random() * 1.4 + 0.4,
            color: '#00e5ff',
            alpha: Math.random() * 0.35 + 0.08,
          });
        }
      }

      /* ── periodically re-target a few particles so scatter stays alive */
      function startScatterDrift() {
        clearTimeout(scatterTimer);
        function tick() {
          if (state !== 'scatter') return;
          const W = canvas.width, H = canvas.height;
          const count = (pts.length * 0.25) | 0;
          for (let i = 0; i < count; i++) {
            const p = pts[(Math.random() * pts.length) | 0];
            p.tx = Math.random() * W;
            p.ty = Math.random() * H;
            p.color = Math.random() > .5 ? '#00e5ff' : '#7c6ef0';
          }
          scatterTimer = setTimeout(tick, 900);
        }
        tick();
      }

      /* ── set all particles drifting randomly ─────── */
      function doScatter() {
        clearTimeout(scatterTimer);
        const W = canvas.width, H = canvas.height;
        for (const p of pts) {
          p.tx = Math.random() * W;
          p.ty = Math.random() * H;
          p.color = Math.random() > .5 ? '#00e5ff' : '#7c6ef0';
          p.alpha = Math.random() * 0.3 + 0.06;
        }
        state = 'scatter';
        startScatterDrift();
      }

      /* ── snap particles into text shape ─────────── */
      function doSnap(idx, instant) {
        clearTimeout(scatterTimer);
        const { color, dim } = CATS[idx];
        const pos = sampleCat(idx);
        const W   = canvas.width, H = canvas.height;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          if (i < pos.length) {
            p.tx    = pos[i].x;
            p.ty    = pos[i].y;
            p.color = Math.random() > .25 ? color : dim;
            p.alpha = Math.random() * 0.45 + 0.55;
          } else {
            /* overflow particles: push off left/right edge */
            p.tx    = Math.random() < .5 ? -80 : W + 80;
            p.ty    = Math.random() * H;
            p.alpha = Math.random() * 0.12;
          }
          if (instant) { p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0; }
        }
        state = idx;
      }

      /* ── render loop ─────────────────────────────── */
      function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isScat = state === 'scatter';
        const k = isScat ? SCAT_K : SNAP_K;
        const d = isScat ? SCAT_D : SNAP_D;

        for (const p of pts) {
          p.vx += (p.tx - p.x) * k;
          p.vy += (p.ty - p.y) * k;
          p.vx *= d; p.vy *= d;
          p.x  += p.vx; p.y += p.vy;

          /* outer glow halo */
          ctx.globalAlpha = p.alpha * 0.09;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4.5, 0, Math.PI * 2);
          ctx.fill();

          /* sharp core */
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(render);
      }

      /* ── DOM refs for category labels + dots ──────── */
      const catEls = document.querySelectorAll('.skills-cat');
      const dotEls = document.querySelectorAll('.sk-dot');

      function showCat(idx) {
        catEls.forEach((el, i) => el.classList.toggle('active', i === idx));
        dotEls.forEach((el, i) => el.classList.toggle('active', i === idx));
      }
      function hideCats() {
        catEls.forEach(el => el.classList.remove('active'));
        dotEls.forEach(el => el.classList.remove('active'));
      }

      /* ── boot ─────────────────────────────────────── */
      resize();
      init();
      doScatter();
      render();

      /* pre-warm text cache once fonts are ready */
      document.fonts.ready.then(() => {
        CATS.forEach((_, i) => sampleCat(i));
      });

      window.addEventListener('resize', () => {
        resize(); init();
        if (typeof state === 'number') doSnap(state, true);
        else doScatter();
      });

      /* ── ScrollTrigger: pin + scroll-driven state machine ──
         end '+=400%' → 4× viewport of scroll per pinned section.
         Each snap phase covers ~1 full viewport so it never rushes. */
      let lastKey = null;

      function phaseKey(p) {
        if (p < 0.07) return 's0'; /* initial scatter  (7%  = 0.28vp) */
        if (p < 0.38) return 'c0'; /* AI snap          (31% = 1.24vp) */
        if (p < 0.48) return 's1'; /* scatter bridge   (10% = 0.40vp) */
        if (p < 0.76) return 'c1'; /* WEB snap         (28% = 1.12vp) */
        if (p < 0.84) return 's2'; /* scatter bridge   (8%  = 0.32vp) */
        return                'c2'; /* VLOG snap        (16% = 0.64vp) */
      }

      ScrollTrigger.create({
        trigger : '#skills',
        start   : 'top top',
        end     : '+=400%',
        pin     : true,
        onUpdate(self) {
          const key = phaseKey(self.progress);
          if (key === lastKey) return;
          lastKey = key;
          if (key.startsWith('s')) { doScatter(); hideCats(); }
          else { const i = +key[1]; doSnap(i, false); showCat(i); }
        },
        onLeaveBack() { doScatter(); hideCats(); lastKey = null; },
      });
    })();

    /* Finale: slow cinematic zoom as movie poster comes into view */
    /* ─────────────────────────────────────────────────
       FINALE — Glitch reveal (Concept 2) + Live HUD (Concept 1)
    ───────────────────────────────────────────────── */
    (function initFinale() {
      if (!document.querySelector('.finale-stage')) return;

      /* Set initial offscreen/hidden states for all animated elements */
      gsap.set('.fl-name-left',   { x: '-14vw' });
      gsap.set('.fl-name-right',  { x:  '14vw' });
      gsap.set('#fl-code-card',   { x: -55, y: -35 });
      gsap.set('#fl-proj-card',   { x: -55, y:  35 });
      gsap.set('#fl-build-card',  { x:  55, y: -35 });
      gsap.set('#fl-growth-card', { x:  55, y:  35 });
      gsap.set('#fl-sidebar',     { x:  40 });
      gsap.set('.fl-badge-l1',    { x: -30 });
      gsap.set('.fl-badge-l2',    { x: -30 });
      gsap.set('.fl-badge-r1',    { x:  30 });
      gsap.set('.fl-badge-r2',    { x:  30 });

      /* ── Code typewriter ────────────────────────── */
      const CODE = [
        'function buildFuture() {',
        "  const skills = ['AI','Web'];",
        '  if (passion === true) {',
        '    return innovate(skills);',
        '  }',
        '}',
        '',
        '// Launching v2.0...',
      ];
      function typeCode() {
        const el = document.getElementById('fl-code-pre');
        if (!el) return;
        let lineIdx = 0, charIdx = 0;
        function tick() {
          if (lineIdx >= CODE.length) return;
          const line = CODE[lineIdx];
          if (charIdx <= line.length) {
            el.textContent = CODE.slice(0, lineIdx).join('\n')
              + (lineIdx ? '\n' : '')
              + line.slice(0, charIdx);
            charIdx++;
            setTimeout(tick, 26);
          } else {
            lineIdx++; charIdx = 0;
            setTimeout(tick, line === '' ? 18 : 55);
          }
        }
        tick();
      }

      /* ── Subtitle typewriter ─────────────────────── */
      const SUBTITLE = 'DEVELOPER  ·  CREATOR  ·  IIT JODHPUR';
      function typeSubtitle() {
        const tw   = document.getElementById('fl-typewriter');
        const wrap = document.querySelector('.fl-subtitle-wrap');
        if (!tw || !wrap) return;
        gsap.to(wrap, { opacity: 1, duration: .3 });
        let i = 0;
        function tick() {
          if (i > SUBTITLE.length) return;
          tw.textContent = SUBTITLE.slice(0, i++);
          setTimeout(tick, 42);
        }
        tick();
      }

      /* ── Main sequence ───────────────────────────── */
      function playFinale() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        /* 1 — Portrait glitch in */
        tl.to('.fl-portrait-main', { opacity: 1, duration: .05 })
          .to('.fl-portrait-main', {
            clipPath: 'inset(30% 0 40% 0)',
            filter: 'hue-rotate(90deg) brightness(2.2)',
            duration: .07, ease: 'none'
          })
          .to('.fl-portrait-main', {
            clipPath: 'inset(0% 0 72% 0)',
            filter: 'hue-rotate(0deg) brightness(1.5)',
            duration: .07, ease: 'none'
          })
          .to('.fl-portrait-main', {
            clipPath: 'inset(58% 0 0% 0)',
            duration: .06, ease: 'none'
          })
          .to('.fl-portrait-main', {
            clipPath: 'inset(0% 0 0% 0)',
            filter: 'none',
            duration: .14
          })
          .to('.fl-portrait-main', { skewX:  8, duration: .05, ease: 'none' })
          .to('.fl-portrait-main', {
            skewX: -5, filter: 'hue-rotate(30deg)', duration: .05, ease: 'none'
          })
          .to('.fl-portrait-main', { skewX: 0, filter: 'none', duration: .1 })
          .add(() => {
            document.querySelector('.fl-portrait-wrap').classList.add('fl-revealed');
            document.querySelector('.fl-glow-ring').classList.add('fl-revealed');
            gsap.to('.fl-glow-ring', { opacity: 1, duration: .6 });
            /* Corner brackets appear */
            gsap.to('.fl-corner', { opacity: 1, duration: .4, stagger: .06 });
            /* Scan line starts looping */
            const sl = document.querySelector('.fl-scan-line');
            if (sl) {
              sl.style.animation = 'fl-scan 2.8s ease-in-out infinite';
              sl.style.animationDelay = '.8s';
            }
          })

        /* 2 — Letterbox bars slam in */
        .to('.fl-bar-top', { scaleY: 1, duration: .35, ease: 'power2.inOut' }, '-=.1')
        .to('.fl-bar-bot', { scaleY: 1, duration: .35, ease: 'power2.inOut' }, '<')

        /* 3 — Name crashes in from opposite sides */
        .to('.fl-name-left',  { x: 0, opacity: 1, duration: .55 }, '-=.15')
        .to('.fl-name-right', { x: 0, opacity: 1, duration: .55 }, '<.06')

        /* 4 — HUD cards fly in from corners */
        .to('#fl-code-card',   { x:0, y:0, opacity:1, duration:.5, ease:'back.out(1.4)' }, '-=.2')
        .to('#fl-proj-card',   { x:0, y:0, opacity:1, duration:.5, ease:'back.out(1.4)' }, '<.07')
        .to('#fl-build-card',  { x:0, y:0, opacity:1, duration:.5, ease:'back.out(1.4)' }, '<.07')
        .to('#fl-growth-card', { x:0, y:0, opacity:1, duration:.5, ease:'back.out(1.4)' }, '<.07')

        /* 4b — Sidebar icons slide in from right (stagger) */
        .to('#fl-sidebar', { x:0, opacity:1, duration:.5, ease:'back.out(1.4)' }, '-=.3')
        .fromTo('.fl-icon-tile',
          { y: 15, opacity: 0 },
          { y: 0,  opacity: 1, duration: .35, stagger: .08, ease: 'power2.out' }, '<.1')

        /* 4c — Achievement badges slide in from sides */
        .to('.fl-badge-l1', { x:0, opacity:1, duration:.45, ease:'back.out(1.4)' }, '-=.2')
        .to('.fl-badge-l2', { x:0, opacity:1, duration:.45, ease:'back.out(1.4)' }, '<.1')
        .to('.fl-badge-r1', { x:0, opacity:1, duration:.45, ease:'back.out(1.4)' }, '<.05')
        .to('.fl-badge-r2', { x:0, opacity:1, duration:.45, ease:'back.out(1.4)' }, '<.1')

        /* 5 — Project list items stagger in */
        .to('.fl-proj-item', {
          x: 0, opacity: 1, duration: .32, stagger: .08
        }, '-=.25')

        /* 6 — Checklist items stagger in */
        .to('.fl-check', {
          opacity: 1, duration: .28, stagger: .07
        }, '<.08')

        /* 7 — Progress bar fill */
        .to('.fl-prog-fill', { width: '72%', duration: 1.3, ease: 'power2.out' }, '<.05')

        /* 8 — Chart line draws itself + area fades in */
        .to('.fl-chart-line',  { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' }, '<.15')
        .to('.fl-chart-area',  { opacity: 1, duration: .8 }, '<.4')

        /* 9 — Subtitle typewriter */
        .add(() => typeSubtitle(), '-=1.1')

        /* 10 — Status badge fades up */
        .to('.fl-status-badge', { opacity:1, y:0, duration:.5, ease:'power2.out' }, '-=.6')

        /* 11 — Code typewriter */
        .add(() => typeCode(), '+=.25')

        /* 12 — Mouse parallax on portrait + cards */
        .add(() => {
          const stage = document.querySelector('.finale-stage');
          if (!stage) return;
          stage.addEventListener('mousemove', e => {
            const { left, top, width, height } = stage.getBoundingClientRect();
            const mx = ((e.clientX - left) / width  - .5) * 2; // -1 to 1
            const my = ((e.clientY - top)  / height - .5) * 2;
            gsap.to('.fl-portrait-wrap', {
              x: mx * 12, y: my * 8, duration: 1, ease: 'power2.out',
              overwrite: 'auto',
            });
            gsap.to('.fl-name', {
              x: mx * 6, y: my * 4, duration: 1.2, ease: 'power2.out',
              overwrite: 'auto',
            });
            gsap.to('.fl-card', {
              x: (_, el) => {
                const isRight = el.classList.contains('fl-card-tr') || el.classList.contains('fl-card-br');
                return mx * (isRight ? 6 : -6);
              },
              y: my * 4, duration: 1, ease: 'power2.out', overwrite: 'auto',
            });
          });
          stage.addEventListener('mouseleave', () => {
            gsap.to(['.fl-portrait-wrap', '.fl-name', '.fl-card'], {
              x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1,.5)', overwrite: 'auto',
            });
          });
        });
      }

      /* Fire once when section scrolls into view */
      ScrollTrigger.create({
        trigger : '#finale',
        start   : 'top 82%',
        once    : true,
        onEnter : playFinale,
      });
    })();
  }

  /* ─────────────────────────────────────────────────
     11. VANILLA TILT
  ───────────────────────────────────────────────── */
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'));
  }

  /* ─────────────────────────────────────────────────
     12. MAGNETIC BUTTONS
  ───────────────────────────────────────────────── */
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const ox = e.clientX - r.left  - r.width  / 2;
      const oy = e.clientY - r.top   - r.height / 2;
      gsap.to(btn, { x: ox * 0.3, y: oy * 0.3, duration: .4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .75, ease: 'elastic.out(1,.4)' });
    });
  });

  /* ─────────────────────────────────────────────────
     13. BACK TO TOP
  ───────────────────────────────────────────────── */
  document.getElementById('backToTop')?.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.6 });
  });

  /* ─────────────────────────────────────────────────
     14. CONTACT FORM — AJAX submit (no redirect)
  ───────────────────────────────────────────────── */
  const ctForm = document.getElementById('ct-form');
  if (ctForm) {
    ctForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn     = ctForm.querySelector('.ct-form-submit');
      const btnText = btn.querySelector('span');
      const success = document.getElementById('ct-form-success');

      btn.disabled = true;
      btnText.textContent = 'SENDING...';

      try {
        const res = await fetch('https://formsubmit.co/ajax/aeshvarya310305@gmail.com', {
          method : 'POST',
          headers: { 'Accept': 'application/json' },
          body   : new FormData(ctForm),
        });
        if (!res.ok) throw new Error('server');
        ctForm.reset();
        btn.style.display     = 'none';
        success.style.display = 'block';
      } catch {
        btn.disabled        = false;
        btnText.textContent = 'SEND MESSAGE';
      }
    });
  }

  /* ─────────────────────────────────────────────────
     15. MOBILE NAV HAMBURGER
  ───────────────────────────────────────────────── */
  const navHamburger = document.getElementById('navHamburger');
  const navMobile    = document.getElementById('navMobile');

  function closeMobileNav() {
    navHamburger?.classList.remove('open');
    navMobile?.classList.remove('open');
    navMobile?.setAttribute('aria-hidden', 'true');
    navHamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    lenis.start();
  }
  function openMobileNav() {
    navHamburger?.classList.add('open');
    navMobile?.classList.add('open');
    navMobile?.setAttribute('aria-hidden', 'false');
    navHamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    lenis.stop();
  }

  navHamburger?.addEventListener('click', () => {
    navMobile?.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  navMobile?.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  /* ─────────────────────────────────────────────────
     15. RESIZE
  ───────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

});

/* ══════════════════════════════════════════════════
   TEMPORAL WARP — WebGL plasma shader (background)
   Runs independently at half resolution for perf.
══════════════════════════════════════════════════ */
(function temporalWarp() {
  const canvas = document.getElementById('warp-canvas');
  if (!canvas) return;
  if (window.innerWidth < 768) { canvas.style.display = 'none'; return; }
  const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
  if (!gl) return;

  let W, H;
  function resize() {
    W = canvas.width  = Math.floor(window.innerWidth  * 0.5);
    H = canvas.height = Math.floor(window.innerHeight * 0.5);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, W, H);
  }
  resize();
  window.addEventListener('resize', resize);

  const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

  const FS = `
    precision mediump float;
    uniform float u_t;
    uniform vec2  u_r;
    uniform vec2  u_m;

    float h(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+74.13);return fract(p.x*p.y);}
    float n(vec2 p){
      vec2 i=floor(p),f=fract(p);
      f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0.,a=.5;
      for(int i=0;i<4;i++){v+=a*n(p);p=p*2.1+vec2(1.7,9.2);a*=.5;}
      return v;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_r;
      vec2 m  = u_m / u_r;
      float t = u_t * 0.055;

      vec2 q = vec2(fbm(uv + t * .35), fbm(uv + vec2(.9,.7)));
      vec2 r = vec2(
        fbm(uv + q + vec2(1.7,9.2) + t * .28),
        fbm(uv + q + vec2(8.3,2.8) + t * .32)
      );
      float f = fbm(uv + r + m * .3);

      /* palette: near-black → dim cyan → muted violet */
      vec3 col = mix(
        vec3(.02,.03,.05),
        mix(vec3(0.,.12,.16), vec3(.1,.07,.22), f),
        f * f * 1.4
      );

      gl_FragColor = vec4(col, 1.);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const uT = gl.getUniformLocation(prog, 'u_t');
  const uR = gl.getUniformLocation(prog, 'u_r');
  const uM = gl.getUniformLocation(prog, 'u_m');

  let tick = 0;
  let mx = W * 0.5, my = H * 0.5;
  let tmx = mx, tmy = my;

  window.addEventListener('mousemove', e => {
    tmx = e.clientX * 0.5;
    tmy = (window.innerHeight - e.clientY) * 0.5;
  });

  function frame() {
    tick++;
    mx += (tmx - mx) * 0.035;
    my += (tmy - my) * 0.035;
    gl.uniform1f(uT, tick);
    gl.uniform2f(uR, W, H);
    gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ══════════════════════════════════════════════════
   NEURAL FIELD — Canvas 2D particle web
   Interactive: cursor repels nodes, scroll drifts field.
══════════════════════════════════════════════════ */
(function neuralField() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const N      = 105;   // particle count
  const LINK   = 155;   // connection threshold px
  const REPEL  = 95;    // cursor repulsion radius px
  const TOP_V  = 1.1;   // max speed

  let mx = W / 2, my = H / 2;
  let scrollV = 0, lastSY = 0;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('scroll', () => {
    scrollV = (window.scrollY - lastSY) * 0.35;
    lastSY  = window.scrollY;
  }, { passive: true });

  /* spawn particles spread across 3× viewport height so scroll reveals more */
  const pts = Array.from({ length: N }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - .5) * 0.28,
    vy: (Math.random() - .5) * 0.28,
    r:  Math.random() * 1.1 + 0.45,
  }));

  function frame() {
    ctx.clearRect(0, 0, W, H);
    scrollV *= 0.88;

    for (const p of pts) {
      /* cursor repulsion */
      const dx = p.x - mx, dy = p.y - my;
      const d  = Math.hypot(dx, dy);
      if (d < REPEL && d > 0.5) {
        const f = ((REPEL - d) / REPEL) * 0.055;
        p.vx += dx / d * f;
        p.vy += dy / d * f;
      }

      /* scroll drift */
      p.vy -= scrollV * 0.007;

      /* damping */
      p.vx *= 0.993; p.vy *= 0.993;
      p.x  += p.vx;  p.y  += p.vy;

      /* clamp speed */
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > TOP_V) { p.vx = p.vx / spd * TOP_V; p.vy = p.vy / spd * TOP_V; }

      /* wrap */
      if (p.x < -8)  p.x = W + 8;
      if (p.x > W+8) p.x = -8;
      if (p.y < -8)  p.y = H + 8;
      if (p.y > H+8) p.y = -8;
    }

    /* connections — O(n²) but n=105, trivially fast */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK) {
          const a = (1 - d / LINK) * 0.28;
          ctx.strokeStyle = `rgba(0,229,255,${a})`;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    /* dots with glow */
    for (const p of pts) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
      g.addColorStop(0, 'rgba(0,229,255,.42)');
      g.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 7, 0, 6.283); ctx.fill();

      ctx.fillStyle = 'rgba(0,229,255,.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  frame();
})();
