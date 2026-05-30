# Portfolio — CLAUDE.md
> Project context for Claude. Read this at the start of every session involving this portfolio.

---

## What This Is
Premium 3D personal portfolio for **Aeshvarya Awasthi** — AI Engineer, IIT Jodhpur, YouTuber (Zack, 31K+).
Stack: Pure HTML/CSS/JS — no build step. Open `index.html` directly in browser.

---

## Tech Stack
| Library | Version | Purpose |
|---|---|---|
| Three.js | r160 (CDN) | Galaxy particles + 3D icosahedron/torus in hero |
| GSAP | 3.12 (CDN) | All scroll + entrance animations |
| ScrollTrigger | 3.12 (CDN) | Scroll-driven animation triggers |
| Lenis | 1.0.33 (CDN) | Smooth scrolling (synced with GSAP ticker) |
| VanillaTilt | 1.8.1 (CDN) | 3D tilt on About image |

---

## Design System
- **Background:** `#090b10` (near-black, blue-tinted)
- **Primary:** `#00e5ff` (electric cyan)
- **Secondary:** `#7c6ef0` (violet)
- **Text:** `#e8ecf2`
- **Fonts:** Playfair Display (headings) · JetBrains Mono (labels) · Sora (body)
- **Card radius:** 48px · Pill radius: 9999px

---

## File Map
```
portfolio/
  index.html   — full page structure (10 sections)
  style.css    — all styles, keyframes, responsive
  script.js    — Three.js, GSAP, Lenis, cursor, magnetic btns
  photo.jpg    — DROP YOUR PHOTO HERE (portrait, any size)
  CLAUDE.md    — this file
```

---

## Sections Built ✅
1. **Loader** — counter 00→100, sweep line, curtain slide-up reveal
2. **Custom Cursor** — dot + ring, cursor-link/cursor-card states, magnetic
3. **Navbar** — floating pill, blur glass, active underline, scrolled state
4. **Hero** — face-first portrait + Three.js galaxy particles + animated heading chars
5. **Marquee** — infinite horizontal scroll strip
6. **About** — clip-path reveals, heading line-by-line, stat counters, rotating glow border on image
7. **Projects** — 4 cards: full/half/half/full, each with unique 3D scroll reveal direction
8. **Skills** — alternating pill rows slide in left/right, 3 detail cards
9. **Contact** — giant heading, magnetic CTA button, social links
10. **Footer** — gradient divider, back-to-top

---

## How Animations Work (key patterns)
- **Loader → hero:** `gsap.timeline` counter + line, then `yPercent:-100` slide
- **Char split:** `splitChars()` wraps each letter in `.char > .char-inner`, GSAP staggers `y:100%→0`
- **Reveal lines:** JS wraps heading content in `.reveal-line-inner`, `gsap.from({ y:'102%' })`
- **Reveal-up:** CSS `opacity:0; transform:translateY(40px)` → `gsap.to({ opacity:1, y:0 })`
- **Data-clip:** CSS `clip-path:inset(0 100% 0 0)` → `gsap.to clip-path:inset(0 0% 0 0)`
- **Project reveals:** `data-project-reveal="up|left|right"` attribute → different `gsap.from` values
- **Magnetic buttons:** `.magnetic-btn` class, mousemove offset × 0.32, mouseleave elastic snap

---

## Content / Copy
- **Name:** Aeshvarya Awasthi
- **Titles:** AI Engineer · Creator · IIT Jodhpur
- **Email:** aeshvarya310305@gmail.com
- **About blurb:** Chemical Eng @ IIT Jodhpur, AI obsessed, YouTuber as "Zack" (31K+)
- **Stats:** 31K+ YouTube subs · 4 Projects · 2 Channels · 1st year IIT

### Projects
| # | Title | Stack | Card |
|---|---|---|---|
| 01 | Us — Always | React Native · AI | Full width |
| 02 | Neural Vision | Python · CV | Half left |
| 03 | Zack Analytics | JavaScript · API | Half right |
| 04 | StudySync | Next.js · AI | Full width |

### Social Links
- YouTube: `https://youtube.com/@zackvlogs` ← update if different
- GitHub: `https://github.com` ← update with actual username
- LinkedIn: `https://linkedin.com` ← update with actual profile

---

## Status Log
| Date | What Changed |
|---|---|
| 2026-05-30 | v1.0 built — all 10 sections, Three.js galaxy, full GSAP animation suite |

---

## TODO / Next Steps
- [ ] Add real `photo.jpg` (portrait, ideally vertical crop)
- [ ] Update GitHub / LinkedIn / YouTube URLs with real links
- [ ] Add real project screenshots or gradient covers for project cards
- [ ] Deploy to Vercel / GitHub Pages (just drag the folder)
- [ ] Mobile: test on actual iPhone (hero image + font sizes)
- [ ] Add Open Graph meta tags for social sharing preview
- [ ] Consider: horizontal scroll section for more projects
- [ ] Consider: GSAP SplitText for smoother text reveals (needs Club GreenSock)

---

## Known Quirks / Notes
- Photo fallback: if `photo.jpg` missing, hero shows "AE" initials in gradient; about-image shows gradient bg
- Three.js: uses `AdditiveBlending` on particles — looks best on dark screens, washes out on light backgrounds
- Lenis + GSAP: ticker synced with `gsap.ticker.add(t => lenis.raf(t*1000))` — do NOT add a separate RAF loop for Lenis
- VanillaTilt: only applied to `[data-tilt]` element (about image). Data attributes control max angle + glare
- ScrollTrigger: `ScrollTrigger.refresh()` called on window resize to recalculate trigger offsets
- The `.reveal-line-inner` wrappers are injected by JS in `revealLines(scopeSelector)` — don't add them manually in HTML
