/**
 * THE NICHOLAS FOUNDATION — Main JavaScript
 * main.js — Navbar, Sidebar, Dark Mode, Scroll Effects, Back-to-Top
 */

'use strict';

/* ============================================================
   1. THEME (Dark / Light Mode)
   ============================================================ */
const ThemeManager = (() => {
  const HTML = document.documentElement;
  const KEY  = 'tnf-theme';
  const BTN  = document.getElementById('theme-toggle');

  function getTheme() {
    // Always default to dark on first visit — TNF is a dark-first brand.
    // Only respect stored user preference after they've explicitly toggled.
    return localStorage.getItem(KEY) || 'dark';
  }

  function applyTheme(theme) {
    HTML.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    if (BTN) {
      BTN.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      BTN.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
  }

  function toggle() {
    const current = HTML.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    applyTheme(getTheme());
    if (BTN) BTN.addEventListener('click', toggle);
  }

  return { init };
})();


/* ============================================================
   2. NAVBAR — Scroll Behavior (transparent → glass)
   ============================================================ */
const NavbarManager = (() => {
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;
  let ticking = false;

  function update() {
    const scrollY = window.scrollY;

    if (scrollY > 20) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }

    // Hide on scroll down (fast), show on scroll up
    // Disabled for UX — navbar stays visible always
    lastScrollY = scrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.sidebar-nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (href === 'index.html' && currentPage === '')) {
        link.classList.add('active');
      }
    });
  }

  function init() {
    if (!navbar) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // run once immediately
    setActivePage();
  }

  return { init };
})();


/* ============================================================
   3. SIDEBAR — Hamburger Menu
   ============================================================ */
const SidebarManager = (() => {
  const hamburger       = document.getElementById('hamburger');
  const sidebar         = document.getElementById('sidebar');
  const backdrop        = document.getElementById('sidebar-backdrop');
  const closeBtn        = document.getElementById('sidebar-close');
  const navLinks        = document.querySelectorAll('.sidebar-nav-link');

  function open() {
    sidebar?.classList.add('open');
    backdrop?.classList.add('open');
    hamburger?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first nav link for accessibility
    setTimeout(() => navLinks[0]?.focus(), 300);
  }

  function close() {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function init() {
    hamburger?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);

    // Close on nav link click (mobile)
    navLinks.forEach(link => link.addEventListener('click', close));

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
  }

  return { init };
})();


/* ============================================================
   4. SCROLL PROGRESS BAR
   ============================================================ */
const ScrollProgress = (() => {
  const bar = document.getElementById('scroll-progress');

  function update() {
    if (!bar) return;
    const scrollTop = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(progress, 100)}%`;
  }

  function init() {
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  return { init };
})();


/* ============================================================
   5. BACK TO TOP
   ============================================================ */
const BackToTop = (() => {
  const btn = document.getElementById('back-to-top');

  function init() {
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();


/* ============================================================
   6. PROFILE BUTTON — Modal Prompt
   ============================================================ */
const ProfileButton = (() => {
  function init() {
    const btn = document.getElementById('profile-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Open the login/profile modal if it exists
      const modal = document.getElementById('profile-modal');
      if (modal) {
        modal.classList.add('open');
      } else {
        // Fallback: show a custom notification
        showNotification('Coming Soon', 'User accounts will be available in the next release.', 'info');
      }
    });
  }

  return { init };
})();


/* ============================================================
   7. NOTIFICATION TOAST
   ============================================================ */
function showNotification(title, message, type = 'info') {
  // Create container if not exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: calc(var(--navbar-h, 72px) + 16px);
      right: 24px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    info:    ['#4F8EF7', 'rgba(79,142,247,0.15)'],
    success: ['#10B981', 'rgba(16,185,129,0.15)'],
    warning: ['#F5C842', 'rgba(245,200,66,0.15)'],
    error:   ['#EF4444', 'rgba(239,68,68,0.15)'],
  };
  const [accent, bg] = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--bg-card, #0F1B33);
    border: 1px solid ${accent}55;
    border-left: 3px solid ${accent};
    border-radius: 12px;
    padding: 14px 18px;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    transform: translateX(120%);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  toast.innerHTML = `
    <div style="font-weight:600;font-size:0.875rem;color:${accent};margin-bottom:4px;">${title}</div>
    <div style="font-size:0.8rem;color:var(--text-secondary,#A8B9D4);line-height:1.5;">${message}</div>
  `;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  });

  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Expose globally
window.showNotification = showNotification;


/* ============================================================
   8. SMOOTH SCROLL (for anchor links)
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
}


/* ============================================================
   9. NEWSLETTER FORM
   Handled by enhancements.js (double opt-in success state)
   ============================================================ */
function initNewsletterForms() {
  // No-op — overridden in enhancements.js with double opt-in UX
}


/* ============================================================
   10. INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavbarManager.init();
  SidebarManager.init();
  ScrollProgress.init();
  BackToTop.init();
  ProfileButton.init();
  initSmoothScroll();
  initNewsletterForms();
});
