/**
 * animations.js — Tigaon HCI Site
 * Adds: scroll progress, scroll-reveal, counters,
 * bar animations, typewriter, particles, scroll-spy, ripple
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════
   * 1. SCROLL PROGRESS BAR
   * ═══════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0', left: '0',
      height: '2px',
      width: '0%',
      background: 'linear-gradient(90deg, #2dd4bf 0%, #f59e0b 100%)',
      zIndex: '9999',
      transition: 'width 0.08s linear',
      pointerEvents: 'none',
      borderRadius: '0 1px 1px 0',
    });
    document.body.appendChild(bar);

    function update() {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ═══════════════════════════════════════════════
   * 2. SCROLL-TRIGGERED REVEAL for .anim elements
   * ═══════════════════════════════════════════════ */
  function initScrollReveal() {
    const els = document.querySelectorAll('.anim');
    if (!els.length) return;

    // Pause CSS animation until the element enters the viewport
    els.forEach(el => {
      el.style.animationPlayState = 'paused';
    });

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => io.observe(el));
  }

  /* ═══════════════════════════════════════════════
   * 3. COUNTER ANIMATION for .stat-num
   * ═══════════════════════════════════════════════ */
  function animateCount(el, target, decimals, duration) {
    const startTime = performance.now();
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const value = eased * target;
      el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.textContent.trim();
        const parsed = parseFloat(raw);
        if (isNaN(parsed)) return;
        const decimals = (raw.split('.')[1] || '').length;
        animateCount(el, parsed, decimals, 1400);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    nums.forEach(el => io.observe(el));
  }

  /* ═══════════════════════════════════════════════
   * 4. ANIMATED BAR FILLS (static + dynamic)
   * ═══════════════════════════════════════════════ */
  function prepAndObserveBars(container) {
    if (!container) return;

    // Find every inner fill div: a div whose parent is a track-like div,
    // which in turn sits inside a flex row.  We match by style.width set inline.
    const fills = Array.from(container.querySelectorAll('div[style*="width:"]')).filter(el => {
      // Only leaf-ish divs that have a % width and are used as bar fills
      const w = el.style.width;
      return w && w.endsWith('%') && parseFloat(w) > 0;
    });

    fills.forEach(fill => {
      if (!fill.dataset.barTarget) {
        fill.dataset.barTarget = fill.style.width;
        fill.style.width = '0%';
        fill.style.transition = 'none';
      }
    });

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const innerFills = Array.from(entry.target.querySelectorAll('[data-bar-target]'));
        innerFills.forEach(function (fill, i) {
          setTimeout(function () {
            fill.style.transition = 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
            fill.style.width = fill.dataset.barTarget;
          }, i * 55);
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    io.observe(container);
  }

  function initBarAnimations() {
    // Static .sus-bar-fill elements (data-gathering / results pages)
    document.querySelectorAll('.sus-bar-fill').forEach(function (fill) {
      const parent = fill.closest('.sus-bars, .sus-bar-item')
                  || fill.parentElement.parentElement;
      prepAndObserveBars(parent);
    });

    // Dynamically generated bars inside #item-bars and #benchmarks
    ['item-bars', 'benchmarks'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) prepAndObserveBars(el);
    });
  }

  /* ═══════════════════════════════════════════════
   * 5. SECTION-LEVEL SCROLL REVEAL (non-.anim elements)
   * ═══════════════════════════════════════════════ */
  function initSectionReveal() {
    const targets = document.querySelectorAll(
      '.document-card, .stats-row, .members-grid, .prototype-showcase, ' +
      '.issues-list, .rec-list, .two-col, .photo-grid, ' +
      '.demo-table-wrap, .sus-table-wrap, .reflection-card'
    );

    targets.forEach(function (el, i) {
      if (el.classList.contains('anim')) return; // already handled
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    });

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // slight stagger based on sibling position
        const delay = (Array.from(el.parentElement.children).indexOf(el) % 4) * 70;
        setTimeout(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

    targets.forEach(function (el) {
      if (!el.classList.contains('anim')) io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════
   * 6. TYPEWRITER EFFECT on .page-title span
   * ═══════════════════════════════════════════════ */
  function initTypewriter() {
    const span = document.querySelector('.page-title span');
    if (!span) return;
    const full = span.textContent;
    span.textContent = '';

    // Cursor blink element
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.cssText = 'color:#2dd4bf;animation:blink 0.75s step-end infinite;margin-left:1px;';
    span.parentNode.insertBefore(cursor, span.nextSibling);

    // Add blink keyframe if not present
    if (!document.getElementById('blink-style')) {
      const s = document.createElement('style');
      s.id = 'blink-style';
      s.textContent = '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
      document.head.appendChild(s);
    }

    let i = 0;
    // Delay so the fade-in of the title has started first
    setTimeout(function type() {
      if (i <= full.length) {
        span.textContent = full.slice(0, i++);
        setTimeout(type, 52);
      } else {
        setTimeout(function () {
          cursor.style.animation = 'none';
          cursor.style.opacity = '0';
          cursor.style.transition = 'opacity 0.4s';
        }, 800);
      }
    }, 550);
  }

  /* ═══════════════════════════════════════════════
   * 7. FLOATING PARTICLES in .page-header
   * ═══════════════════════════════════════════════ */
  function initParticles() {
    const header = document.querySelector('.page-header');
    if (!header) return;

    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      opacity: '0.45',
      zIndex: '0',
    });
    header.style.position = 'relative';
    header.insertBefore(canvas, header.firstChild);

    // Lift content above canvas
    Array.from(header.children).forEach(function (c) {
      if (c !== canvas && !c.style.position) {
        c.style.position = 'relative';
        c.style.zIndex = '1';
      }
    });

    const ctx = canvas.getContext('2d');
    let W, H, pts, raf = null;

    function resize() {
      W = canvas.width  = header.offsetWidth;
      H = canvas.height = header.offsetHeight;
    }

    function spawn() {
      pts = [];
      const n = Math.max(8, Math.floor((W * H) / 14000));
      for (let i = 0; i < n; i++) {
        pts.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          r:  Math.random() * 1.4 + 0.4,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          a:  Math.random() * 0.45 + 0.15,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(function (p) {
        // draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45,212,191,' + p.a + ')';
        ctx.fill();

        // move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)  p.x = W;
        if (p.x > W)  p.x = 0;
        if (p.y < 0)  p.y = H;
        if (p.y > H)  p.y = 0;
      });

      // draw connecting lines between close pairs
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = 'rgba(45,212,191,' + (0.12 * (1 - dist / 90)) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function startDraw() { if (!raf) draw(); }
    function stopDraw()  { if (raf)  { cancelAnimationFrame(raf); raf = null; } }

    const io = new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? startDraw() : stopDraw();
    }, { threshold: 0 });
    io.observe(header);

    resize();
    spawn();
    window.addEventListener('resize', function () { resize(); spawn(); }, { passive: true });
  }

  /* ═══════════════════════════════════════════════
   * 8. SIDEBAR SCROLL-SPY (On This Page links)
   * ═══════════════════════════════════════════════ */
  function initScrollSpy() {
    const anchors = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    if (!anchors.length) return;

    const sectionIds = Array.from(anchors).map(a => a.getAttribute('href').slice(1));
    const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    function activate(id) {
      anchors.forEach(function (a) {
        const match = a.getAttribute('href') === '#' + id;
        a.classList.toggle('active', match);
        if (match) a.style.setProperty('color', 'var(--accent)');
        else       a.style.removeProperty('color');
      });
    }

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activate(entry.target.id);
      });
    }, { threshold: 0.25, rootMargin: '-60px 0px -55% 0px' });

    sections.forEach(s => io.observe(s));
  }

  /* ═══════════════════════════════════════════════
   * 9. RIPPLE ON CARDS & BUTTONS
   * ═══════════════════════════════════════════════ */
  function initRipple() {
    const els = document.querySelectorAll(
      '.member-card, .rec-card, .document-card, .meta-tag, .proto-feature, .badge'
    );
    els.forEach(function (el) {
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
      el.addEventListener('click', function (e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const circle = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        Object.assign(circle.style, {
          position: 'absolute',
          width:  size + 'px',
          height: size + 'px',
          left:   (x - size / 2) + 'px',
          top:    (y - size / 2) + 'px',
          background: 'rgba(45,212,191,0.15)',
          borderRadius: '50%',
          transform: 'scale(0)',
          animation: 'ripple-expand 0.55s linear',
          pointerEvents: 'none',
          zIndex: '0',
        });
        if (!document.getElementById('ripple-style')) {
          const s = document.createElement('style');
          s.id = 'ripple-style';
          s.textContent = '@keyframes ripple-expand{to{transform:scale(1);opacity:0}}';
          document.head.appendChild(s);
        }
        el.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
      });
    });
  }

  /* ═══════════════════════════════════════════════
   * 10. SMOOTH ACTIVE-NAV INDICATOR (sidebar glow)
   * ═══════════════════════════════════════════════ */
  function initNavGlow() {
    const active = document.querySelector('.sidebar-nav a.active');
    if (!active) return;

    // Add a subtle pulsing left border on the active item
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-nav li a.active {
        box-shadow: -2px 0 0 var(--accent), inset 0 0 0 1px rgba(45,212,191,0.12);
        animation: nav-pulse 2.8s ease-in-out infinite;
      }
      @keyframes nav-pulse {
        0%, 100% { box-shadow: -2px 0 0 var(--accent), inset 0 0 12px rgba(45,212,191,0.04); }
        50%       { box-shadow: -2px 0 0 var(--accent), inset 0 0 20px rgba(45,212,191,0.10); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════
   * 11. STAT-NUM ANIMATED HIGHLIGHT GLOW
   * ═══════════════════════════════════════════════ */
  function initStatGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .stat-num {
        transition: text-shadow 0.4s ease;
      }
      .stat-num.counted {
        text-shadow: 0 0 24px rgba(45,212,191,0.45);
      }
    `;
    document.head.appendChild(style);

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          setTimeout(function () { e.target.classList.add('counted'); }, 1200);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.stat-num').forEach(el => io.observe(el));
  }

  /* ═══════════════════════════════════════════════
   * INIT — fire after DOM is ready
   * ═══════════════════════════════════════════════ */
  function init() {
    initScrollProgress();
    initScrollReveal();
    initCounters();
    initBarAnimations();
    initSectionReveal();
    initTypewriter();
    initParticles();
    initScrollSpy();
    initRipple();
    initNavGlow();
    initStatGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ═══════════════════════════════════════════════
 * FLOATING LAPTOP — proto-laptop image
 * Smooth JS-driven float so we can sync the shadow
 * ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* How the float behaves */
  var FLOAT_AMP   = 14;    // px up-down amplitude
  var FLOAT_SPEED = 0.0018; // radians per ms  (≈ 5.7-second cycle)
  var TILT_AMP    = 1.4;   // degrees tilt left/right
  var SHADOW_MIN  = 0.55;  // min shadow scale
  var SHADOW_MAX  = 1.0;   // max shadow scale
  var GLOW_MIN    = '0px 0px 18px rgba(45,212,191,0.12)';
  var GLOW_MAX    = '0px 8px 38px rgba(45,212,191,0.38)';

  function lerp(a, b, t) { return a + (b - a) * t; }

  function initFloat() {
    var img    = document.getElementById('proto-laptop');
    var wrap   = document.getElementById('proto-float-wrap');
    var shadow = document.getElementById('proto-shadow');
    if (!img) return;

    /* Add a gentle entrance: start transparent, slide up */
    img.style.opacity   = '0';
    img.style.transform = 'translateY(30px)';
    img.style.transition = 'opacity 0.9s ease 0.4s, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.4s';
    img.style.willChange = 'transform';
    if (shadow) shadow.style.willChange = 'transform, opacity';

    /* Wait until the image is in view before starting */
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();

      /* Entrance animation */
      requestAnimationFrame(function () {
        img.style.opacity   = '1';
        img.style.transform = 'translateY(0px)';
      });

      /* After entrance settles, hand off to JS float loop */
      setTimeout(function () {
        img.style.transition = 'none'; // JS takes over from here

        var startTime = null;
        var raf;

        function floatLoop(ts) {
          if (!startTime) startTime = ts;
          var elapsed = ts - startTime;
          var angle   = elapsed * FLOAT_SPEED;          // always increasing
          var sinVal  = Math.sin(angle);                 // −1 … +1
          var t01     = (sinVal + 1) / 2;               // 0 … 1 (for shadow)

          /* ── Laptop image ── */
          var ty     = -sinVal * FLOAT_AMP;             // up when sinVal > 0
          var tilt   = Math.sin(angle * 0.6) * TILT_AMP;
          img.style.transform =
            'translateY(' + ty.toFixed(2) + 'px) ' +
            'rotate('    + tilt.toFixed(3) + 'deg)';

          /* ── Drop-shadow glow ── */
          var glowA = lerp(0.12, 0.38, t01);
          var glowY = lerp(2, 10, t01);
          var glowB = lerp(18, 42, t01);
          img.style.filter =
            'drop-shadow(0px ' + glowY.toFixed(1) + 'px ' +
            glowB.toFixed(1)  + 'px rgba(45,212,191,' +
            glowA.toFixed(3)  + '))';

          /* ── Elliptical ground shadow ── */
          if (shadow) {
            var sc = lerp(SHADOW_MIN, SHADOW_MAX, 1 - t01); // shrinks as laptop rises
            var op = lerp(0.3, 0.7, 1 - t01);
            shadow.style.transform =
              'translateX(-50%) scaleX(' + sc.toFixed(3) + ')';
            shadow.style.opacity = op.toFixed(3);
          }

          raf = requestAnimationFrame(floatLoop);
        }

        /* Pause when off-screen to save CPU */
        var visObs = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            if (!raf) raf = requestAnimationFrame(floatLoop);
          } else {
            cancelAnimationFrame(raf);
            raf = null;
          }
        }, { threshold: 0 });

        visObs.observe(wrap || img);
        raf = requestAnimationFrame(floatLoop);
      }, 1100); /* wait for entrance to finish */
    }, { threshold: 0.2 });

    io.observe(wrap || img);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloat);
  } else {
    initFloat();
  }
}());

/* ═══════════════════════════════════════════════════════════════
 * DOCUMENTATION PHOTO GALLERY ANIMATIONS
 * – Staggered scroll-in reveal (alternating directions)
 * – 3-D mouse-tilt + zoom on hover
 * – Teal glow border on hover
 * – Fullscreen lightbox with prev/next & keyboard support
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── inject styles ── */
  var style = document.createElement('style');
  style.textContent = [

    /* === CARD BASE === */
    '.photo-card {',
    '  position:relative;',
    '  border-radius:10px;',
    '  overflow:hidden;',
    '  border:1px solid var(--border,#1a2535);',
    '  aspect-ratio:3/4;',
    '  cursor:pointer;',
    '  transform-style:preserve-3d;',
    '  transition:border-color .3s, box-shadow .3s;',
    '  will-change:transform;',
    '}',

    /* === SHIMMER while loading === */
    '.photo-card::before {',
    '  content:"";',
    '  position:absolute;inset:0;z-index:1;',
    '  background:linear-gradient(90deg,',
    '    rgba(255,255,255,0) 0%,',
    '    rgba(45,212,191,.07) 50%,',
    '    rgba(255,255,255,0) 100%);',
    '  background-size:200% 100%;',
    '  animation:shimmer 1.6s infinite;',
    '  pointer-events:none;',
    '  transition:opacity .5s;',
    '}',
    '.photo-card.loaded::before { opacity:0; }',

    '@keyframes shimmer {',
    '  0%   { background-position:200% 0; }',
    '  100% { background-position:-200% 0; }',
    '}',

    /* === INNER IMAGE === */
    '.photo-card img {',
    '  width:100%;height:100%;',
    '  object-fit:cover;',
    '  display:block;',
    '  transition:transform .45s cubic-bezier(.25,.8,.25,1), filter .3s;',
    '  will-change:transform;',
    '}',
    '.photo-card:hover img {',
    '  transform:scale(1.07);',
    '  filter:brightness(1.08);',
    '}',

    /* === HOVER GLOW === */
    '.photo-card:hover {',
    '  border-color:rgba(45,212,191,.55);',
    '  box-shadow:0 0 0 1px rgba(45,212,191,.2),',
    '             0 12px 40px rgba(0,0,0,.45),',
    '             0 0 24px rgba(45,212,191,.15);',
    '}',

    /* === CAPTION OVERLAY === */
    '.photo-card .pc-caption {',
    '  position:absolute;bottom:0;left:0;right:0;',
    '  padding:.65rem .9rem;',
    '  background:linear-gradient(transparent,rgba(7,11,15,.88));',
    '  font-family:"JetBrains Mono",monospace;',
    '  font-size:.6rem;letter-spacing:.1em;',
    '  color:rgba(45,212,191,.85);',
    '  transform:translateY(100%);',
    '  transition:transform .3s ease;',
    '  pointer-events:none;',
    '}',
    '.photo-card:hover .pc-caption { transform:translateY(0); }',

    /* === CLICK HINT ICON === */
    '.photo-card .pc-zoom {',
    '  position:absolute;top:.6rem;right:.6rem;',
    '  width:28px;height:28px;',
    '  background:rgba(7,11,15,.65);',
    '  border:1px solid rgba(45,212,191,.35);',
    '  border-radius:5px;',
    '  display:flex;align-items:center;justify-content:center;',
    '  font-size:.75rem;color:rgba(45,212,191,.85);',
    '  opacity:0;transform:scale(.7);',
    '  transition:opacity .25s,transform .25s;',
    '  pointer-events:none;',
    '}',
    '.photo-card:hover .pc-zoom { opacity:1;transform:scale(1); }',

    /* === SCROLL-REVEAL states === */
    '.photo-card.pc-hidden {',
    '  opacity:0;',
    '}',
    '.photo-card.pc-from-left  { transform:translateX(-50px) scale(.95); }',
    '.photo-card.pc-from-right { transform:translateX(50px)  scale(.95); }',
    '.photo-card.pc-from-below { transform:translateY(50px)  scale(.95); }',

    '.photo-card.pc-visible {',
    '  opacity:1 !important;',
    '  transform:none !important;',
    '  transition:',
    '    opacity .55s ease,',
    '    transform .55s cubic-bezier(.22,1,.36,1),',
    '    border-color .3s,',
    '    box-shadow .3s;',
    '}',

    /* === LIGHTBOX === */
    '#pc-lightbox {',
    '  display:none;',
    '  position:fixed;inset:0;z-index:10000;',
    '  background:rgba(4,7,10,.96);',
    '  backdrop-filter:blur(6px);',
    '  align-items:center;justify-content:center;',
    '  flex-direction:column;',
    '}',
    '#pc-lightbox.open { display:flex; }',

    '#pc-lb-img {',
    '  max-width:88vw;max-height:82vh;',
    '  border-radius:10px;',
    '  box-shadow:0 0 0 1px rgba(45,212,191,.25),',
    '             0 24px 80px rgba(0,0,0,.7);',
    '  object-fit:contain;',
    '  transition:opacity .25s ease, transform .25s ease;',
    '}',
    '#pc-lb-img.switching { opacity:0;transform:scale(.96); }',

    '#pc-lb-bar {',
    '  display:flex;align-items:center;gap:1.5rem;',
    '  margin-top:1.25rem;',
    '}',

    '.pc-lb-btn {',
    '  background:rgba(13,19,25,.8);',
    '  border:1px solid rgba(45,212,191,.3);',
    '  color:#2dd4bf;',
    '  width:42px;height:42px;',
    '  border-radius:8px;',
    '  font-size:1.1rem;',
    '  cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:background .2s, border-color .2s, transform .15s;',
    '}',
    '.pc-lb-btn:hover {',
    '  background:rgba(45,212,191,.12);',
    '  border-color:rgba(45,212,191,.7);',
    '  transform:scale(1.08);',
    '}',

    '#pc-lb-counter {',
    '  font-family:"JetBrains Mono",monospace;',
    '  font-size:.72rem;letter-spacing:.15em;',
    '  color:rgba(45,212,191,.7);',
    '  min-width:60px;text-align:center;',
    '}',

    '#pc-lb-close {',
    '  position:fixed;top:1.25rem;right:1.25rem;',
    '  background:rgba(13,19,25,.8);',
    '  border:1px solid rgba(45,212,191,.3);',
    '  color:#2dd4bf;',
    '  width:38px;height:38px;',
    '  border-radius:8px;',
    '  font-size:1.1rem;',
    '  cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:background .2s, transform .15s;',
    '}',
    '#pc-lb-close:hover { background:rgba(239,68,68,.15);color:#f87171;transform:rotate(90deg); }',

    '#pc-lb-caption {',
    '  font-family:"JetBrains Mono",monospace;',
    '  font-size:.62rem;letter-spacing:.12em;',
    '  color:rgba(45,212,191,.55);',
    '  margin-top:.75rem;',
    '}',

    /* strip inline border/overflow so .photo-card takes over */
    '.photo-grid > div { border:none !important; border-radius:0 !important; overflow:visible !important; }',

  ].join('\n');
  document.head.appendChild(style);

  /* ── wait for DOM ── */
  function init() {
    var grid = document.querySelector('.photo-grid');
    if (!grid) return;   /* only runs on data-gathering page */

    var cards = [];
    var lightboxImgs = [];

    /* grab every wrapper div inside .photo-grid */
    var wrappers = Array.from(grid.querySelectorAll('div'));

    wrappers.forEach(function (wrap, i) {
      var img = wrap.querySelector('img');
      if (!img) return;

      /* ── promote wrapper to .photo-card ── */
      wrap.className = 'photo-card pc-hidden';

      /* pick entrance direction: left / right / below in rotation */
      var dirs = ['pc-from-left', 'pc-from-right', 'pc-from-below'];
      wrap.classList.add(dirs[i % 3]);

      /* shimmer loaded flag */
      if (img.complete) {
        wrap.classList.add('loaded');
      } else {
        img.addEventListener('load',  function () { wrap.classList.add('loaded'); });
        img.addEventListener('error', function () { wrap.classList.add('loaded'); });
      }

      /* caption overlay */
      var cap = document.createElement('div');
      cap.className = 'pc-caption';
      cap.textContent = img.alt || ('Session ' + (i + 1));
      wrap.appendChild(cap);

      /* zoom icon */
      var icon = document.createElement('div');
      icon.className = 'pc-zoom';
      icon.innerHTML = '⤢';
      wrap.appendChild(icon);

      /* track for lightbox */
      var idx = lightboxImgs.length;
      lightboxImgs.push({ src: img.src, alt: img.alt || ('Session ' + (i + 1)) });
      wrap.dataset.lbIdx = idx;
      cards.push(wrap);

      /* ── 3-D TILT on mouse move ── */
      wrap.addEventListener('mousemove', function (e) {
        var r   = wrap.getBoundingClientRect();
        var xPct = (e.clientX - r.left)  / r.width  - 0.5;   /* -0.5 … +0.5 */
        var yPct = (e.clientY - r.top)   / r.height - 0.5;
        var tiltX =  yPct * -14;   /* degrees */
        var tiltY =  xPct *  14;
        wrap.style.transform =
          'perspective(600px) rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + tiltY.toFixed(2) + 'deg) scale(1.03)';
        wrap.style.transition = 'transform .05s linear, border-color .3s, box-shadow .3s';
      });
      wrap.addEventListener('mouseleave', function () {
        wrap.style.transform = '';
        wrap.style.transition = 'transform .4s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .3s';
      });

      /* ── CLICK → lightbox ── */
      wrap.addEventListener('click', function () {
        openLightbox(parseInt(wrap.dataset.lbIdx, 10));
      });
    });

    /* ── STAGGERED SCROLL-IN with IntersectionObserver ── */
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card  = entry.target;
        var order = cards.indexOf(card);
        var delay = (order % 6) * 80;   /* stagger up to ~480ms within each row-group */
        setTimeout(function () {
          card.classList.remove('pc-from-left', 'pc-from-right', 'pc-from-below');
          card.classList.add('pc-visible');
        }, delay);
        revealIO.unobserve(card);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(function (c) { revealIO.observe(c); });

    /* ════════════════════════════════
     * LIGHTBOX
     * ════════════════════════════════ */
    var lb      = document.createElement('div');
    lb.id       = 'pc-lightbox';
    lb.innerHTML =
      '<button id="pc-lb-close" title="Close (Esc)">✕</button>' +
      '<img id="pc-lb-img" src="" alt="" />' +
      '<div id="pc-lb-caption"></div>' +
      '<div id="pc-lb-bar">' +
        '<button class="pc-lb-btn" id="pc-lb-prev" title="Previous (←)">‹</button>' +
        '<span id="pc-lb-counter"></span>' +
        '<button class="pc-lb-btn" id="pc-lb-next" title="Next (→)">›</button>' +
      '</div>';
    document.body.appendChild(lb);

    var lbImg     = document.getElementById('pc-lb-img');
    var lbCap     = document.getElementById('pc-lb-caption');
    var lbCounter = document.getElementById('pc-lb-counter');
    var lbClose   = document.getElementById('pc-lb-close');
    var lbPrev    = document.getElementById('pc-lb-prev');
    var lbNext    = document.getElementById('pc-lb-next');
    var currentIdx = 0;
    var total      = lightboxImgs.length;

    function showImg(idx) {
      lbImg.classList.add('switching');
      setTimeout(function () {
        currentIdx = (idx + total) % total;
        lbImg.src        = lightboxImgs[currentIdx].src;
        lbImg.alt        = lightboxImgs[currentIdx].alt;
        lbCap.textContent = lightboxImgs[currentIdx].alt;
        lbCounter.textContent = (currentIdx + 1) + ' / ' + total;
        lbImg.classList.remove('switching');
      }, 220);
    }

    function openLightbox(idx) {
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      showImg(idx);
    }

    function closeLightbox() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click',  function () { showImg(currentIdx - 1); });
    lbNext.addEventListener('click',  function () { showImg(currentIdx + 1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  showImg(currentIdx - 1);
      if (e.key === 'ArrowRight') showImg(currentIdx + 1);
    });

    /* swipe support for mobile */
    var touchStartX = 0;
    lb.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) showImg(currentIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
