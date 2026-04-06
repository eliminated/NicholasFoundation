/**
 * THE NICHOLAS FOUNDATION — Modal System
 * modal.js — Custom modals with focus trap, backdrop, ESC close
 */

'use strict';

/* ============================================================
   Modal Manager
   ============================================================ */
const ModalManager = (() => {
  const openModals = [];

  // Focusable elements for focus trap
  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function trapFocus(modal, e) {
    const focusable = [...modal.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function open(modalId) {
    const backdrop = document.getElementById(modalId);
    if (!backdrop) return;

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    openModals.push(modalId);

    // Focus first focusable element
    const modal     = backdrop.querySelector('.modal');
    const focusable = modal?.querySelector(FOCUSABLE);
    setTimeout(() => focusable?.focus(), 300);

    // Store last focused element
    backdrop._lastFocus = document.activeElement;

    // Focus trap handler
    backdrop._trapHandler = (e) => {
      if (e.key === 'Tab' && modal) trapFocus(modal, e);
    };
    document.addEventListener('keydown', backdrop._trapHandler);
  }

  function close(modalId) {
    const backdrop = document.getElementById(modalId);
    if (!backdrop) return;

    backdrop.classList.remove('open');
    openModals.splice(openModals.indexOf(modalId), 1);

    if (!openModals.length) {
      document.body.style.overflow = '';
    }

    // Restore focus
    backdrop._lastFocus?.focus();

    // Remove trap handler
    if (backdrop._trapHandler) {
      document.removeEventListener('keydown', backdrop._trapHandler);
    }
  }

  function closeTop() {
    if (openModals.length) {
      close(openModals[openModals.length - 1]);
    }
  }

  function init() {
    // Escape key closes topmost modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeTop();
    });

    // Backdrop click closes
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('mousedown', e => {
        if (e.target === backdrop) close(backdrop.id);
      });
    });

    // Close buttons inside modals
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const backdrop = btn.closest('.modal-backdrop');
        if (backdrop) close(backdrop.id);
      });
    });

    // Open triggers (data-modal-open="modal-id")
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        open(trigger.dataset.modalOpen);
      });
    });

    // Close triggers (data-modal-close="modal-id")
    document.querySelectorAll('[data-modal-close]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        close(trigger.dataset.modalClose);
      });
    });
  }

  return { init, open, close };
})();


/* ============================================================
   Contact Form Handling (with custom modal confirm)
   ============================================================ */
const ContactForm = (() => {
  function validate(form) {
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(g => {
      g.classList.remove('error', 'success');
      const err = g.querySelector('.form-error-msg');
      if (err) err.remove();
    });

    const showError = (input, msg) => {
      const group = input.closest('.form-group');
      group?.classList.add('error');
      const errEl = document.createElement('div');
      errEl.className = 'form-error-msg';
      errEl.textContent = msg;
      group?.appendChild(errEl);
      valid = false;
    };

    // Name
    const name = form.querySelector('[name="name"]');
    if (name && name.value.trim().length < 2) {
      showError(name, 'Please enter your full name.');
    } else if (name) {
      name.closest('.form-group')?.classList.add('success');
    }

    // Email
    const email = form.querySelector('[name="email"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
    } else if (email) {
      email.closest('.form-group')?.classList.add('success');
    }

    // Subject
    const subject = form.querySelector('[name="subject"]');
    if (subject && subject.value.trim().length < 3) {
      showError(subject, 'Please enter a subject.');
    } else if (subject) {
      subject.closest('.form-group')?.classList.add('success');
    }

    // Message
    const message = form.querySelector('[name="message"]');
    if (message && message.value.trim().length < 20) {
      showError(message, 'Message must be at least 20 characters.');
    } else if (message) {
      message.closest('.form-group')?.classList.add('success');
    }

    return valid;
  }

  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(form)) return;

      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled  = true;
      btn.textContent = 'Sending…';

      // Simulate async send
      await new Promise(r => setTimeout(r, 1500));

      btn.disabled  = false;
      btn.textContent = originalText;

      // Show success modal or notification
      const successModal = document.getElementById('contact-success-modal');
      if (successModal) {
        ModalManager.open('contact-success-modal');
      } else {
        window.showNotification('Message Sent! ✓', 'We\'ll get back to you within 24 hours.', 'success');
      }

      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('success', 'error'));
    });
  }

  return { init };
})();


/* ============================================================
   Careers Application Modal
   ============================================================ */
const CareersModal = (() => {
  function init() {
    // Wire up "Apply Now" buttons
    document.querySelectorAll('[data-apply-job]').forEach(btn => {
      btn.addEventListener('click', () => {
        const jobTitle = btn.dataset.applyJob;
        const titleEl  = document.getElementById('apply-job-title');
        if (titleEl) titleEl.textContent = jobTitle;
        ModalManager.open('apply-modal');
      });
    });

    // Apply form submit
    const applyForm = document.getElementById('apply-form');
    if (applyForm) {
      applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = applyForm.querySelector('[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Submitting…';
        await new Promise(r => setTimeout(r, 1500));
        ModalManager.close('apply-modal');
        window.showNotification('Application Submitted! ✓', 'Our team will review your application shortly.', 'success');
        applyForm.reset();
        btn.disabled = false;
        btn.textContent = 'Submit Application';
      });
    }
  }

  return { init };
})();


/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ModalManager.init();
  ContactForm.init();
  CareersModal.init();
});

// Expose globally for inline usage
window.ModalManager = ModalManager;
