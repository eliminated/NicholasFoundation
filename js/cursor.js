/**
 * THE NICHOLAS FOUNDATION — Custom Cursor
 * cursor.js — GSAP-powered dual-ring cursor with magnetic effects
 * Requires: GSAP 3.x loaded via CDN before this script
 */

'use strict';

const CustomCursor = (() => {
  // --- Config ---
  const MAGNETIC_STRENGTH = 0.35;
  const MAGNETIC_DISTANCE = 80; // px
  const DOT_SPEED = 0.15;       // quickTo duration (seconds)
  const RING_SPEED = 0.45;      // ring trails slower for spring feel

  // --- Elements ---
  let dot, ring;
  let dotX, dotY, ringX, ringY; // GSAP quickTo instances
  let isTouch = false;
  let mouseVisible = false;
  let currentState = 'default'; // default | hover | text | click | hidden

  // Selectors for interactive elements
  const HOVER_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    '[role="button"]',
    '.btn',
    '.card',
    '.card-feature',
    '.card-blog',
    '.card-team',
    '.value-card',
    '.product-card',
    '.job-card',
    '.support-cat-card',
    '.testimonial-card',
    '.partner-logo',
    '.tag',
    '.accordion-trigger',
    '.sidebar-nav-link',
    '.footer-social',
    '.sidebar-social-link',
    '#hamburger',
    '#theme-toggle',
    '#profile-btn',
    '#search-btn',
    '#back-to-top',
    '.lang-option',
  ].join(', ');

  const TEXT_SELECTORS = [
    'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])',
    'textarea',
    '[contenteditable="true"]',
  ].join(', ');

  const HIDDEN_SELECTORS = [
    'iframe',
    'video',
    'canvas',
    'select',
  ].join(', ');

  // --- State Machine ---
  function setState(state) {
    if (currentState === state) return;

    // Remove all state classes
    dot.classList.remove('cursor-hover', 'cursor-text', 'cursor-click', 'cursor-hidden');
    ring.classList.remove('cursor-hover', 'cursor-text', 'cursor-click', 'cursor-hidden');

    // Apply new state
    if (state !== 'default') {
      dot.classList.add(`cursor-${state}`);
      ring.classList.add(`cursor-${state}`);
    }

    currentState = state;
  }

  // --- Magnetic Effect ---
  function applyMagnetic(e, el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MAGNETIC_DISTANCE) {
      const pull = (1 - dist / MAGNETIC_DISTANCE) * MAGNETIC_STRENGTH;
      gsap.to(el, {
        x: dx * pull,
        y: dy * pull,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }

  function resetMagnetic(el) {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)',
    });
  }

  // --- Mouse Move Handler ---
  function onMouseMove(e) {
    if (!mouseVisible) {
      dot.classList.add('cursor-visible');
      ring.classList.add('cursor-visible');
      mouseVisible = true;
      document.documentElement.classList.add('cursor-ready');
    }

    // Move both elements
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);

    // Check what we're hovering
    const target = e.target;

    // Hidden elements (canvas for globe, iframes, etc.)
    if (target.closest(HIDDEN_SELECTORS)) {
      setState('hidden');
      return;
    }

    // Text inputs
    if (target.closest(TEXT_SELECTORS)) {
      setState('text');
      return;
    }

    // Interactive hover
    const hoverEl = target.closest(HOVER_SELECTORS);
    if (hoverEl) {
      setState('hover');
      // Apply magnetic pull to small interactive elements
      if (hoverEl.matches('button, #hamburger, #theme-toggle, #profile-btn, #search-btn, #back-to-top, .footer-social, .sidebar-social-link, .testimonial-arrow, .testimonial-dot, .lang-btn')) {
        applyMagnetic(e, hoverEl);
      }
      return;
    }

    // Default state
    setState('default');
  }

  function onMouseLeave() {
    dot.classList.remove('cursor-visible');
    ring.classList.remove('cursor-visible');
    mouseVisible = false;
  }

  function onMouseDown() {
    dot.classList.add('cursor-click');
    ring.classList.add('cursor-click');
  }

  function onMouseUp() {
    dot.classList.remove('cursor-click');
    ring.classList.remove('cursor-click');
  }

  // --- Magnetic Reset on Mouseleave ---
  function initMagneticElements() {
    const magneticEls = document.querySelectorAll(
      'button, #hamburger, #theme-toggle, #profile-btn, #search-btn, #back-to-top, .footer-social, .sidebar-social-link, .testimonial-arrow, .testimonial-dot, .lang-btn'
    );
    magneticEls.forEach(el => {
      el.addEventListener('mouseleave', () => resetMagnetic(el));
    });
  }

  // --- Init ---
  function init() {
    // Check for touch device
    isTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );

    if (isTouch) return; // Don't initialize on touch devices

    // Check GSAP is loaded
    if (typeof gsap === 'undefined') {
      console.warn('[CustomCursor] GSAP not loaded — cursor disabled.');
      return;
    }

    dot = document.getElementById('cursor-dot');
    ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    // Create GSAP quickTo for buttery smooth tracking
    dotX = gsap.quickTo(dot, 'left', { duration: DOT_SPEED, ease: 'power3.out' });
    dotY = gsap.quickTo(dot, 'top', { duration: DOT_SPEED, ease: 'power3.out' });
    ringX = gsap.quickTo(ring, 'left', { duration: RING_SPEED, ease: 'power2.out' });
    ringY = gsap.quickTo(ring, 'top', { duration: RING_SPEED, ease: 'power2.out' });

    // Event listeners
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // Wire up magnetic resets
    initMagneticElements();

    // Re-wire magnetic elements after DOM mutations (e.g. search results)
    const observer = new MutationObserver(() => {
      requestAnimationFrame(initMagneticElements);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  CustomCursor.init();
});
