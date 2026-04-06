/**
 * THE NICHOLAS FOUNDATION — Animations JavaScript
 * animations.js — Particle Canvas, Typewriter, Scroll Reveal, Counters
 */

'use strict';

/* ============================================================
   1. CANVAS PARTICLE NETWORK
   ============================================================ */
const ParticleCanvas = (() => {
  let canvas, ctx, particles = [], animId;
  const CONFIG = {
    count:          80,
    maxDist:        130,
    speed:          0.35,
    dotRadius:      2,
    colorPrimary:   [79, 142, 247],   // accent blue
    colorSecondary: [124, 58, 237],   // purple
    connectionOpacity: 0.18,
    mouseRadius:    160,
  };
  let mouse = { x: null, y: null };
  let W, H;

  class Particle {
    constructor() { this.reset(true); }

    reset(random = false) {
      this.x  = random ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
      this.y  = random ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * CONFIG.speed * 2;
      this.vy = (Math.random() - 0.5) * CONFIG.speed * 2;
      this.r  = CONFIG.dotRadius * (0.6 + Math.random() * 0.8);
      // Interpolate between primary and secondary colors
      const t = Math.random();
      this.color = [
        Math.round(CONFIG.colorPrimary[0] * (1-t) + CONFIG.colorSecondary[0] * t),
        Math.round(CONFIG.colorPrimary[1] * (1-t) + CONFIG.colorSecondary[1] * t),
        Math.round(CONFIG.colorPrimary[2] * (1-t) + CONFIG.colorSecondary[2] * t),
      ];
      this.opacity = 0.3 + Math.random() * 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * 0.015;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      // Speed clamp
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > CONFIG.speed * 2) {
        this.vx = (this.vx / speed) * CONFIG.speed * 2;
        this.vy = (this.vy / speed) * CONFIG.speed * 2;
      }

      // Bounce off walls
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      this.x = Math.max(0, Math.min(W, this.x));
      this.y = Math.max(0, Math.min(H, this.y));
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.opacity})`;
      ctx.fill();
    }
  }

  function resize() {
    if (!canvas) return;
    // Use the parent hero section's dimensions — canvas.offsetWidth/Height
    // returns 0 until browser lays out the canvas element itself.
    const hero = canvas.closest('#hero') || canvas.parentElement;
    W = canvas.width  = hero ? hero.clientWidth  : window.innerWidth;
    H = canvas.height = hero ? hero.clientHeight : window.innerHeight;
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * CONFIG.connectionOpacity;
          const p = particles[i];
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();

    // Create particles
    particles = Array.from({ length: CONFIG.count }, () => new Particle());

    // Mouse tracking
    const hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    }

    // Resize observer
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // Pause when tab hidden (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        loop();
      }
    });

    loop();
  }

  return { init };
})();


/* ============================================================
   2. TYPEWRITER EFFECT
   ============================================================ */
const Typewriter = (() => {
  function init() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const phrases = [
      'Innovative Systems',
      'Global Impact',
      'Open Technology',
      'Scalable Solutions',
      'Future Infrastructure',
    ];

    let phraseIdx  = 0;
    let charIdx    = 0;
    let deleting   = false;
    let pauseTimer = null;

    function tick() {
      const phrase = phrases[phraseIdx];

      if (!deleting) {
        charIdx++;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          pauseTimer = setTimeout(tick, 2200); // hold
          return;
        }
        setTimeout(tick, 75);
      } else {
        charIdx--;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 400); // pause before next word
          return;
        }
        setTimeout(tick, 40);
      }
    }

    setTimeout(tick, 800); // initial delay
  }

  return { init };
})();


/* ============================================================
   3. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
const ScrollReveal = (() => {
  function init() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // fire once
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   4. ANIMATED COUNTERS
   ============================================================ */
const AnimatedCounters = (() => {
  function animateValue(el, from, to, suffix, duration = 1800) {
    const startTime = performance.now();
    const isDecimal = to % 1 !== 0;

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = from + (to - from) * eased;
      el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function init() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseFloat(el.dataset.counter);
          const suffix = el.dataset.suffix || '';
          animateValue(el, 0, target, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   5. TESTIMONIAL CAROUSEL — auto-scroll & dots
   ============================================================ */
const TestimonialCarousel = (() => {
  function init() {
    const track = document.querySelector('.testimonials-track');
    const dots  = document.querySelectorAll('.testimonials-dot');
    if (!track || !dots.length) return;

    let current = 0;

    function goTo(idx) {
      const cards = track.querySelectorAll('.testimonial-card');
      if (!cards.length) return;
      current = (idx + cards.length) % cards.length;
      const card = cards[current];
      track.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' });
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Auto-advance every 5s
    let autoTimer = setInterval(() => goTo(current + 1), 5000);
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    });

    // init first dot
    if (dots[0]) dots[0].classList.add('active');
  }

  return { init };
})();


/* ============================================================
   6. PRODUCT / BLOG FILTER TABS
   ============================================================ */
const FilterTabs = (() => {
  function init(filterSelector, itemSelector, dataAttr = 'category') {
    const filters = document.querySelectorAll(filterSelector);
    const items   = document.querySelectorAll(itemSelector);
    if (!filters.length || !items.length) return;

    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        const value = filter.dataset[dataAttr] || filter.dataset.filter || 'all';

        items.forEach(item => {
          const category = item.dataset[dataAttr] || item.dataset.category || '';
          const show = value === 'all' || category === value;
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          if (show) {
            item.style.opacity   = '1';
            item.style.transform = 'scale(1)';
            item.style.display   = '';
          } else {
            item.style.opacity   = '0';
            item.style.transform = 'scale(0.96)';
            setTimeout(() => { if (item.style.opacity === '0') item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  return { init };
})();

window.FilterTabs = FilterTabs;


/* ============================================================
   7. PRIVACY TOC — Active Section Highlighting
   ============================================================ */
const PrivacyTOC = (() => {
  function init() {
    const links    = document.querySelectorAll('.privacy-toc-link');
    const sections = document.querySelectorAll('.privacy-content h2[id]');
    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.privacy-toc-link[href="#${entry.target.id}"]`);
          active?.classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  return { init };
})();


/* ============================================================
   8. FAQ ACCORDION
   ============================================================ */
const Accordion = (() => {
  function init() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item    = trigger.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isOpen  = item.classList.contains('open');

        // Close all (single-open mode)
        document.querySelectorAll('.accordion-item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.accordion-trigger')?.classList.remove('open');
            openItem.querySelector('.accordion-content').style.maxHeight = '0';
          }
        });

        // Toggle current
        if (isOpen) {
          item.classList.remove('open');
          trigger.classList.remove('open');
          content.style.maxHeight = '0';
        } else {
          item.classList.add('open');
          trigger.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  return { init };
})();


/* ============================================================
   9. SUPPORT SEARCH — Client-side filter
   ============================================================ */
const SupportSearch = (() => {
  function init() {
    const input    = document.querySelector('#support-search');
    const articles = document.querySelectorAll('.support-article-item');
    if (!input || !articles.length) return;

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      articles.forEach(article => {
        const text  = article.textContent.toLowerCase();
        article.style.display = (!query || text.includes(query)) ? '' : 'none';
      });
    });
  }

  return { init };
})();


/* ============================================================
   10. INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ParticleCanvas.init();
  Typewriter.init();
  ScrollReveal.init();
  AnimatedCounters.init();
  TestimonialCarousel.init();
  Accordion.init();
  SupportSearch.init();
  PrivacyTOC.init();
});
