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
     3. THREE.JS — GALAXY PARTICLE SYSTEM
  ───────────────────────────────────────────────── */
  const canvas   = document.getElementById('hero-canvas');
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 2, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const COUNT = 5500, BRANCHES = 3, RADIUS = 7.5, SPIN = 1.2, RANDOM = 0.26, RND_POW = 3;

  const positions = new Float32Array(COUNT * 3);
  const aColors   = new Float32Array(COUNT * 3);
  const aSizes    = new Float32Array(COUNT);

  const innerCol = new THREE.Color('#00e5ff');
  const outerCol = new THREE.Color('#7c6ef0');

  function rnd(scale, power) {
    return Math.pow(Math.random(), power) * (Math.random() < .5 ? 1 : -1) * scale;
  }

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const r = Math.random() * RADIUS;
    const spin = r * SPIN;
    const arm = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;

    positions[i3]     = Math.cos(arm + spin) * r + rnd(RANDOM * r, RND_POW);
    positions[i3 + 1] = rnd(RANDOM * r * 0.4, RND_POW);
    positions[i3 + 2] = Math.sin(arm + spin) * r + rnd(RANDOM * r, RND_POW);

    const mix = innerCol.clone().lerp(outerCol, r / RADIUS);
    aColors[i3] = mix.r; aColors[i3+1] = mix.g; aColors[i3+2] = mix.b;
    aSizes[i] = Math.random() * 2.2 + 0.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor',   new THREE.BufferAttribute(aColors, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(aSizes, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3  aColor;
      attribute float aSize;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (200.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        float s = pow(smoothstep(.5, 0., d), 1.6);
        gl_FragColor = vec4(vColor, s);
      }
    `,
  });

  const galaxy = new THREE.Points(geo, mat);
  scene.add(galaxy);

  const icoMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.3, 1),
    new THREE.MeshBasicMaterial({ color:0x00e5ff, wireframe:true, transparent:true, opacity:0.11 })
  );
  icoMesh.position.set(3, 0.5, 0);
  scene.add(icoMesh);

  const torusMesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.02, 16, 80),
    new THREE.MeshBasicMaterial({ color:0x7c6ef0, transparent:true, opacity:0.15 })
  );
  torusMesh.position.set(-3.5, 1, -1);
  torusMesh.rotation.x = Math.PI / 3;
  scene.add(torusMesh);

  let mxTarget = 0, myTarget = 0, mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mxTarget =  (e.clientX / innerWidth  - 0.5) * 2;
    myTarget = -(e.clientY / innerHeight - 0.5) * 2;
  });

  const clock3 = new THREE.Clock();
  function threeLoop() {
    requestAnimationFrame(threeLoop);
    const t = clock3.getElapsedTime();
    mx += (mxTarget - mx) * 0.04;
    my += (myTarget - my) * 0.04;

    galaxy.rotation.y = t * 0.045;
    galaxy.rotation.x = my * 0.07;
    icoMesh.rotation.x = t * 0.28;
    icoMesh.rotation.y = t * 0.44;
    icoMesh.position.y = 0.5 + Math.sin(t * 0.5) * 0.35;
    torusMesh.rotation.z = t * 0.11;
    torusMesh.rotation.x = Math.PI / 3 + my * 0.1;

    camera.position.x += (mx * 0.4  - camera.position.x) * 0.04;
    camera.position.y += (my * 0.22 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  threeLoop();

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
     9. HERO ENTRANCE
  ───────────────────────────────────────────────── */
  function bootHero() {
    /* Eyebrow row */
    gsap.to('#heroEyebrow', { opacity: 1, y: 0, duration: .75, delay: .1, ease: 'power3.out' });

    /* Scramble the heading lines (Anime.js-driven via rAF) */
    document.querySelectorAll('.hero-line').forEach((line, i) => {
      setTimeout(() => scramble(line, 900), 280 + i * 190);
    });

    /* Bottom bar: role + buttons */
    gsap.to('#heroBottom', { opacity: 1, y: 0, duration: .8, delay: 1.25, ease: 'power3.out' });

    /* Scroll indicator */
    gsap.to('#scrollIndicator', { opacity: .5, duration: .8, delay: 1.8 });

    /* Start role cycling after heading settles */
    setTimeout(startRoleCycle, 2800);

    /* Kick off all scroll animations */
    initScroll();
  }

  /* ─────────────────────────────────────────────────
     10. SCROLL ANIMATIONS
  ───────────────────────────────────────────────── */
  function initScroll() {

    /* Navbar state on scroll */
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: s => document.getElementById('navbar').classList.toggle('scrolled', s.progress > 0),
    });

    /* Hero image parallax */
    gsap.to('#heroImage', {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
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
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    ScrollTrigger.refresh();
  });

});
