/* ============================================================
   TNF ENHANCEMENTS — js/enhancements.js
   Features: page transitions, announcement, cookie consent,
   global search (Cmd+K), copy email, form draft auto-save,
   char counter, testimonial arrows, newsletter success state,
   noopener enforcement, breadcrumb active, reading progress
   ============================================================ */
'use strict';

/* ────────────────────────────────────────────────────────────
   SHARED UTILITIES
   ──────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const dispatch = (el, name, detail = {}) =>
  el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

/* ────────────────────────────────────────────────────────────
   1. PAGE TRANSITIONS
   Smooth fade between all internal page navigations
   ──────────────────────────────────────────────────────────── */
const PageTransitions = (() => {
  let overlay;

  function init() {
    overlay = document.getElementById('page-transition-overlay');
    if (!overlay) return;

    // Fade in the page (remove loading class)
    requestAnimationFrame(() => {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    });

    // Intercept all internal navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      const isInternal = href &&
        !href.startsWith('http') &&
        !href.startsWith('mailto') &&
        !href.startsWith('tel') &&
        !href.startsWith('#') &&
        !href.startsWith('//') &&
        !link.hasAttribute('target');

      if (!isInternal) return;

      e.preventDefault();
      overlay.classList.add('fading-out');

      setTimeout(() => {
        window.location.href = href;
      }, 200);
    });
  }

  return { init };
})();

/* ────────────────────────────────────────────────────────────
   2. ANNOUNCEMENT BANNER
   Dismissible, persisted per session via sessionStorage
   ──────────────────────────────────────────────────────────── */
const AnnouncementBanner = (() => {
  const STORAGE_KEY = 'tnf-announcement-v1';

  function init() {
    const banner = document.getElementById('announcement-banner');
    const btn    = document.getElementById('close-announcement');
    if (!banner) return;

    // Already dismissed this session
    if (sessionStorage.getItem(STORAGE_KEY)) {
      banner.classList.add('dismissed');
      return;
    }

    // Show it
    banner.classList.remove('dismissed');

    btn?.addEventListener('click', () => {
      banner.classList.add('dismissed');
      sessionStorage.setItem(STORAGE_KEY, '1');
    });
  }

  return { init };
})();

/* ────────────────────────────────────────────────────────────
   3. COOKIE CONSENT
   Bottom banner, persisted in localStorage
   ──────────────────────────────────────────────────────────── */
const CookieConsent = (() => {
  const STORAGE_KEY = 'tnf-cookies';

  function init() {
    const banner  = document.getElementById('cookie-consent');
    const accept  = document.getElementById('cookie-accept');
    const reject  = document.getElementById('cookie-reject');
    if (!banner) return;

    // Already handled
    if (localStorage.getItem(STORAGE_KEY)) {
      banner.classList.add('hidden');
      return;
    }

    // Show after short delay
    setTimeout(() => {
      banner.classList.add('visible');
    }, 1500);

    function dismiss(choice) {
      localStorage.setItem(STORAGE_KEY, choice);
      banner.classList.remove('visible');
      banner.classList.add('hidden');
    }

    accept?.addEventListener('click', () => dismiss('accepted'));
    reject?.addEventListener('click', () => dismiss('essential'));

    // Close on outside click
    banner.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
      if (!banner.contains(e.target) && banner.classList.contains('visible')) {
        // Don't auto-dismiss — force explicit choice
      }
    });
  }

  return { init };
})();

/* ────────────────────────────────────────────────────────────
   4. GLOBAL SEARCH  (Ctrl/Cmd + K)
   Client-side full-text search across all 9 pages
   ──────────────────────────────────────────────────────────── */
const GlobalSearch = (() => {
  const INDEX = [
    {
      title: 'Home',
      url: 'index.html',
      desc: 'Engineering the future of innovative systems for global impact.',
      tags: ['home', 'hero', 'mission', 'ai', 'blockchain', 'impact', 'open source'],
      icon: '<i data-lucide="home"></i>',
    },
    {
      title: 'About Us',
      url: 'about.html',
      desc: 'Our mission, vision, history, leadership team, and core values.',
      tags: ['about', 'team', 'mission', 'vision', 'history', 'values', 'timeline', 'partners'],
      icon: '<i data-lucide="telescope"></i>',
    },
    {
      title: 'Products & Services',
      url: 'products.html',
      desc: 'FedCore, DID.chain, GlobalPulse API, OfflineKit, SecureLayer, OpenData Commons.',
      tags: ['products', 'platforms', 'fedcore', 'blockchain', 'api', 'offlinekit', 'security', 'datasets', 'federated learning'],
      icon: '<i data-lucide="zap"></i>',
    },
    {
      title: 'Careers',
      url: 'careers.html',
      desc: 'Open roles in engineering, research, partnerships, and design.',
      tags: ['careers', 'jobs', 'hiring', 'remote', 'engineering', 'research', 'roles', 'benefits', 'apply'],
      icon: '<i data-lucide="rocket"></i>',
    },
    {
      title: 'Contact Us',
      url: 'contact.html',
      desc: 'Get in touch for partnerships, technical support, media, or general inquiries.',
      tags: ['contact', 'email', 'partnerships', 'support', 'press', 'media', 'message'],
      icon: '<i data-lucide="mail"></i>',
    },
    {
      title: 'Support Center',
      url: 'support.html',
      desc: 'Documentation, guides, and help for all TNF platforms.',
      tags: ['support', 'docs', 'help', 'documentation', 'api', 'fedcore', 'articles', 'search'],
      icon: '<i data-lucide="shield"></i>',
    },
    {
      title: 'FAQ',
      url: 'faq.html',
      desc: 'Frequently asked questions about TNF, licensing, partnerships, and technical setup.',
      tags: ['faq', 'questions', 'licensing', 'mit', 'nonprofit', 'partnership', 'fedcore', 'api'],
      icon: '<i data-lucide="lightbulb"></i>',
    },
    {
      title: 'Blog',
      url: 'blog.html',
      desc: 'Research insights, technical deep dives, and impact stories from the TNF team.',
      tags: ['blog', 'research', 'articles', 'federated learning', 'blockchain', 'impact', 'agi', 'safety'],
      icon: '<i data-lucide="rss"></i>',
    },
    {
      title: 'Research',
      url: 'research.html',
      desc: 'Our AI research — building the Nyx AI engine from scratch, starting with a rule-based approach and evolving toward full machine learning.',
      tags: ['research', 'nyx', 'ai', 'artificial intelligence', 'rule-based', 'machine learning', 'engine', 'safety', 'memory', 'organizer'],
      icon: '<i data-lucide="microscope"></i>',
    },
    {
      title: 'Privacy & Terms',
      url: 'privacy.html',
      desc: 'Privacy policy, terms of service, data rights, cookies, and acceptable use.',
      tags: ['privacy', 'terms', 'gdpr', 'cookies', 'data', 'legal', 'rights', 'security'],
      icon: '<i data-lucide="lock"></i>',
    },
  ];

  let overlay, field, results, activeIndex = -1;
  let currentResults = [];

  function highlight(text, query) {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${safe})`, 'gi'), '<mark>$1</mark>');
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return INDEX.filter(p => {
      const corpus = [p.title, p.desc, ...p.tags].join(' ').toLowerCase();
      return corpus.includes(q);
    }).sort((a, b) => {
      // Exact title match scores higher
      const at = a.title.toLowerCase().includes(q) ? 1 : 0;
      const bt = b.title.toLowerCase().includes(q) ? 1 : 0;
      return bt - at;
    });
  }

  function renderResults(query) {
    currentResults = search(query);
    activeIndex = -1;

    if (!query.trim()) {
      results.innerHTML = '';
      return;
    }

    if (currentResults.length === 0) {
      results.innerHTML = `<div class="search-empty">No results for "<strong>${query}</strong>"</div>`;
      return;
    }

    results.innerHTML = currentResults.map((item, i) => `
      <a href="${item.url}" class="search-result" data-index="${i}" role="option">
        <div class="search-result-icon">${item.icon}</div>
        <div class="search-result-text">
          <div class="search-result-title">${highlight(item.title, query)}</div>
          <div class="search-result-desc">${highlight(item.desc, query)}</div>
        </div>
        <span class="search-result-arrow">→</span>
      </a>
    `).join('');
    // Render Lucide icons in dynamically generated search results
    if (window.lucide) window.lucide.createIcons();
  }

  function setActive(idx) {
    const items = $$('.search-result', results);
    items.forEach(el => el.classList.remove('active'));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('active');
      items[idx].scrollIntoView({ block: 'nearest' });
      activeIndex = idx;
    } else {
      activeIndex = -1;
    }
  }

  function open() {
    overlay.classList.add('open');
    field.value = '';
    results.innerHTML = '';
    activeIndex = -1;
    setTimeout(() => field.focus(), 80);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    field.blur();
  }

  function init() {
    overlay = document.getElementById('search-overlay');
    field   = document.getElementById('search-field');
    results = document.getElementById('search-results');
    if (!overlay || !field || !results) return;

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        overlay.classList.contains('open') ? close() : open();
      }
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();

      if (overlay.classList.contains('open')) {
        const len = currentResults.length;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIndex + 1, len - 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(Math.max(activeIndex - 1, 0)); }
        if (e.key === 'Enter' && activeIndex >= 0) {
          $$('.search-result', results)[activeIndex]?.click();
        }
      }
    });

    // Search button
    document.getElementById('search-btn')?.addEventListener('click', open);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Close button
    document.getElementById('search-close')?.addEventListener('click', close);

    // Live search
    field.addEventListener('input', () => renderResults(field.value));

    // Result click (with page transition)
    results.addEventListener('click', (e) => {
      const result = e.target.closest('.search-result');
      if (result) close();
    });
  }

  return { init };
})();

/* ────────────────────────────────────────────────────────────
   5. COPY EMAIL TO CLIPBOARD
   Adds a copy icon button next to email addresses
   ──────────────────────────────────────────────────────────── */
function initCopyEmails() {
  const COPY_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
  const CHECK_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

  // Find all email-looking text nodes
  const emailSelectors = [
    '.footer-contact-item .footer-contact-icon + div',
    '.contact-info-text p:first-of-type',
    '.footer-col .footer-contact-item div:last-child',
  ];

  emailSelectors.forEach(sel => {
    $$(sel).forEach(el => {
      const text = el.textContent?.trim() || '';
      if (!text.includes('@')) return;

      // Don't double-wrap
      if (el.querySelector('.copy-email-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-email-btn';
      btn.setAttribute('aria-label', `Copy ${text}`);
      btn.innerHTML = COPY_SVG;

      const wrap = document.createElement('span');
      wrap.className = 'copy-email-wrap';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      wrap.appendChild(btn);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(text).then(() => {
          btn.classList.add('copied');
          btn.innerHTML = CHECK_SVG;
          btn.setAttribute('aria-label', 'Copied!');
          // Show toast
          showToast(`Copied: ${text}`, 'success');
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = COPY_SVG;
            btn.setAttribute('aria-label', `Copy ${text}`);
          }, 2000);
        });
      });
    });
  });
}

/* ────────────────────────────────────────────────────────────
   6. FORM DRAFT AUTO-SAVE
   Auto-saves contact form inputs to localStorage, restores
   on next visit with a dismissible banner prompt
   ──────────────────────────────────────────────────────────── */
function initFormDraft() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const DRAFT_KEY = 'tnf-contact-draft';
  const FIELDS    = ['contact-name', 'contact-email', 'contact-org', 'contact-type', 'contact-subject', 'contact-message'];

  // Check for saved draft
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; }
  })();

  if (saved && Object.values(saved).some(v => v?.trim())) {
    // Show restore banner
    const banner = document.createElement('div');
    banner.className = 'draft-restore-banner';
    banner.innerHTML = `
      <span class="draft-prompt"><strong>📝 Restore your draft?</strong> You left a message in progress.</span>
      <div class="draft-restore-actions">
        <button type="button" class="btn btn-sm btn-primary" id="draft-restore-yes">Restore</button>
        <button type="button" class="btn btn-sm btn-secondary" id="draft-restore-no">Discard</button>
      </div>
    `;
    form.insertAdjacentElement('beforebegin', banner);

    document.getElementById('draft-restore-yes')?.addEventListener('click', () => {
      FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && saved[id] !== undefined) el.value = saved[id];
      });
      banner.remove();
      // Update char counter after restore
      document.getElementById('contact-message')?.dispatchEvent(new Event('input'));
    });

    document.getElementById('draft-restore-no')?.addEventListener('click', () => {
      localStorage.removeItem(DRAFT_KEY);
      banner.remove();
    });
  }

  // Auto-save on input
  function saveDraft() {
    const draft = {};
    FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) draft[id] = el.value;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  FIELDS.forEach(id => {
    document.getElementById(id)?.addEventListener('input', saveDraft);
    document.getElementById(id)?.addEventListener('change', saveDraft);
  });

  // Clear draft on submission
  form.addEventListener('submit', () => {
    setTimeout(() => localStorage.removeItem(DRAFT_KEY), 500);
  });
}

/* ────────────────────────────────────────────────────────────
   7. CHARACTER COUNTER FOR TEXTAREA
   ──────────────────────────────────────────────────────────── */
function initCharCounter() {
  const textarea = document.getElementById('contact-message');
  if (!textarea) return;

  const MAX = parseInt(textarea.getAttribute('maxlength') || '2000', 10);
  const counter = document.getElementById('message-char-counter');
  if (!counter) return;

  function update() {
    const len = textarea.value.length;
    const remaining = MAX - len;
    counter.textContent = `${len.toLocaleString()} / ${MAX.toLocaleString()}`;
    counter.classList.toggle('warning', remaining < 200 && remaining >= 50);
    counter.classList.toggle('error',   remaining < 50);
  }

  textarea.addEventListener('input', update);
  update();
}

/* ────────────────────────────────────────────────────────────
   8. TESTIMONIALS — ARROW NAVIGATION + DOTS
   ──────────────────────────────────────────────────────────── */
function initTestimonialArrows() {
  const track = document.querySelector('.testimonials-track');
  const nav   = document.querySelector('.testimonial-nav');
  if (!track || !nav) return;

  const cards = $$('.card-testimonial', track);
  if (cards.length < 2) return;

  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.querySelector('.testimonial-dots');

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = cards.map((_, i) => `
      <button class="testimonial-dot${i === 0 ? ' active' : ''}"
              aria-label="Go to testimonial ${i + 1}"></button>
    `).join('');
  }

  let current = 0;

  function scrollTo(idx) {
    if (idx < 0 || idx >= cards.length) return;
    current = idx;
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // Update dots
    $$('.testimonial-dot', dotsContainer).forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    // Update arrows
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === cards.length - 1;
  }

  prevBtn?.addEventListener('click', () => scrollTo(current - 1));
  nextBtn?.addEventListener('click', () => scrollTo(current + 1));

  $$('.testimonial-dot', dotsContainer).forEach((dot, i) => {
    dot.addEventListener('click', () => scrollTo(i));
  });

  // Keyboard
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') scrollTo(current + 1);
    if (e.key === 'ArrowLeft')  scrollTo(current - 1);
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) scrollTo(dx > 0 ? current - 1 : current + 1);
  });

  // Auto-advance
  let autoTimer = setInterval(() => scrollTo((current + 1) % cards.length), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => scrollTo((current + 1) % cards.length), 5000);
  });

  // Init state
  scrollTo(0);
}

/* ────────────────────────────────────────────────────────────
   9. CONTACT FORM — AJAX SUBMISSION
   Intercepts submit → POST /api/contact (local Express dev).
   On Netlify prod, native form handling takes over (JS skips).
   ──────────────────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const btn  = document.getElementById('contact-submit-btn');
  const lbl  = document.getElementById('contact-submit-label');
  if (!form || !btn) return;

  // On Netlify/production: let native Netlify Forms POST handle it
  const isProd = window.location.hostname !== 'localhost' &&
                 window.location.hostname !== '127.0.0.1';
  if (isProd) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side validation
    const required = ['contact-name','contact-email','contact-subject','contact-message'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el?.value?.trim()) {
        el?.classList.add('input-error');
        setTimeout(() => el?.classList.remove('input-error'), 2000);
        valid = false;
      }
    });
    if (!valid) { showToast('Please fill in all required fields.', 'error'); return; }

    btn.disabled = true;
    if (lbl) lbl.textContent = 'Sending…';

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      // Remove honeypot field before sending
      delete data['bot-field'];
      delete data['form-name'];

      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.ok) {
        const modal = document.getElementById('contact-success-modal');
        modal?.classList.add('open');
        form.reset();
        document.getElementById('contact-message')?.dispatchEvent(new Event('input'));
        localStorage.removeItem('tnf-contact-draft');
        showToast('Message sent! We\'ll respond within 24 hours.', 'success');
      } else {
        showToast(json.error || 'Failed to send. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      btn.disabled = false;
      if (lbl) lbl.textContent = 'Send Message';
    }
  });
}

/* ────────────────────────────────────────────────────────────
   10. NEWSLETTER — EmailJS (prod) / Express API (local dev)
   ──────────────────────────────────────────────────────────── */
function initNewsletterForms() {
  $$('.footer-newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value?.trim();
      if (!email || !email.includes('@')) {
        input?.classList.add('input-error');
        setTimeout(() => input?.classList.remove('input-error'), 1500);
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const isProd = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1';
      try {
        if (isProd && window.emailjs) {
          // Production: EmailJS SDK (load via CDN script in HTML)
          await window.emailjs.send(
            window.TNF_EMAILJS_SERVICE  || 'service_tnf',
            window.TNF_EMAILJS_TEMPLATE || 'template_newsletter',
            { to_email: email, reply_to: email },
          );
        } else {
          // Local dev: Express API
          const res  = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const json = await res.json();
          if (!json.ok) throw new Error(json.error);
        }
        const msg = document.createElement('div');
        msg.className = 'newsletter-success-msg';
        msg.innerHTML = `
          <span class="success-icon">✅</span>
          <span>Thanks! <strong>Check your inbox</strong> for a confirmation email.</span>
        `;
        form.parentNode.replaceChild(msg, form);
        showToast('Subscribed! Check your inbox.', 'success');
      } catch (err) {
        console.error('Newsletter error:', err);
        showToast('Subscription failed. Please try again.', 'error');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
}

/* ────────────────────────────────────────────────────────────
   10. ENFORCE noopener ON EXTERNAL LINKS
   ──────────────────────────────────────────────────────────── */
function enforceNoopener() {
  $$('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isExternal = href.startsWith('http') || href.startsWith('//');
    if (isExternal) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/* ────────────────────────────────────────────────────────────
   11. READING PROGRESS (per-article on long pages)
   Shows an article-specific reading indicator on Privacy/Blog
   ──────────────────────────────────────────────────────────── */
function initReadingProgress() {
  const article = document.querySelector('.privacy-content, .blog-post-body');
  const bar     = document.getElementById('scroll-progress');
  if (!article || !bar) return;

  // The global scroll-progress bar already tracks page progress.
  // Here we additionally add an article-specific top label.
  const label = document.createElement('div');
  label.id = 'reading-label';
  label.style.cssText = `
    position:fixed;top:var(--navbar-h);right:var(--sp-4);
    font-size:var(--text-xs);color:var(--text-muted);
    background:var(--bg-elevated);border:1px solid var(--border);
    border-radius:var(--r-sm);padding:2px 8px;z-index:900;
    opacity:0;transition:opacity 0.3s;
  `;
  document.body.appendChild(label);

  window.addEventListener('scroll', () => {
    const { top, height } = article.getBoundingClientRect();
    const progress = Math.min(100, Math.max(0, Math.round((-top / (height - window.innerHeight)) * 100)));
    label.textContent = `${progress}% read`;
    label.style.opacity = (progress > 0 && progress < 100) ? '1' : '0';
  }, { passive: true });
}

/* ────────────────────────────────────────────────────────────
   TOAST HELPER (used by copy-email and other features)
   ──────────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const existing = document.getElementById('tnf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'tnf-toast';
  const colors = { success: '#10B981', error: '#EF4444', info: '#4F8EF7' };
  toast.style.cssText = `
    position:fixed;bottom:var(--sp-6);right:var(--sp-6);z-index:9999;
    display:flex;align-items:center;gap:var(--sp-3);
    background:var(--bg-elevated);border:1px solid var(--border);
    border-left:3px solid ${colors[type] || colors.info};
    border-radius:var(--r-md);padding:var(--sp-3) var(--sp-5);
    font-size:var(--text-sm);color:var(--text-primary);
    box-shadow:0 8px 30px rgba(0,0,0,0.35);
    animation:reveal-up 0.3s ease;pointer-events:none;
    max-width:320px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ────────────────────────────────────────────────────────────
   INIT ALL
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  PageTransitions.init();
  AnnouncementBanner.init();
  CookieConsent.init();
  GlobalSearch.init();
  initCopyEmails();
  initFormDraft();
  initContactForm();    // NEW: real AJAX form submission
  initCharCounter();
  initTestimonialArrows();
  initNewsletterForms(); // Updated: EmailJS prod / Express dev
  enforceNoopener();
  initReadingProgress();
});
