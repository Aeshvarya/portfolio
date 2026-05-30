/* ═══════════════════════════════════════════════════
   AESHVARYA AWASTHI — PORTFOLIO v2
   Three.js · GSAP ScrollTrigger · Anime.js · Lenis
═══════════════════════════════════════════════════ */

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
  document.querySelectorAll('.project-row').forEach(r => {
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

    /* Start role cycling — runs independently */
    setTimeout(startRoleCycle, 6000);
  }

  /* Hero scroll journey — fires at different scroll progress points
     through the 270vh #hero section. Each step reveals content. */
  function initHeroJourney() {
    const heroEl  = document.getElementById('hero');
    const video   = document.getElementById('cin-video');
    const progBar = document.getElementById('cinProgress');
    const DURATION = 30.667; /* actual video duration in seconds */

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

    /* Navbar state on scroll */
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: s => document.getElementById('navbar').classList.toggle('scrolled', s.progress > 0),
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

    /* Project rows — staggered slide-up (Anime.js timeline) */
    ScrollTrigger.create({
      trigger: '.project-list',
      start: 'top 85%',
      once: true,
      onEnter() {
        anime({
          targets: '.project-row',
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 800,
          delay: anime.stagger(110),
          easing: 'easeOutExpo',
        });
      },
    });

    /* Skills detail cards */
    gsap.utils.toArray('.skill-detail-item').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: i * 0.1,
        scrollTrigger: { trigger: '.skills-detail', start: 'top 86%' },
      });
    });

    /* Stat items */
    gsap.utils.toArray('.stat-item').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: i * 0.1,
        scrollTrigger: { trigger: '.about-stats', start: 'top 87%' },
      });
    });

    /* Skills marquee pause on mouse-over */
    document.querySelectorAll('.skills-mq-inner').forEach(row => {
      row.addEventListener('mouseenter', () => row.style.animationPlayState = 'paused');
      row.addEventListener('mouseleave', () => row.style.animationPlayState = 'running');
    });

    /* Finale: slow cinematic zoom as movie poster comes into view */
    gsap.fromTo('.finale-img',
      { scale: 1 },
      {
        scale: 1.07,
        ease: 'none',
        scrollTrigger: {
          trigger: '#finale',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      }
    );
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
     14. RESIZE
  ───────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

});
