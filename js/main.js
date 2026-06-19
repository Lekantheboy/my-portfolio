/* ============================================================
   LEKAN PORTFOLIO — MAIN SCRIPT
   ============================================================ */

'use strict';

// ─── DOM READY ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. MOBILE NAV ──────────────────────────────────────
  const navToggle   = document.getElementById('nav-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  function openMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }

  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMobileMenu() : openMobileMenu();
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('is-open') &&
      !mobileMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // ─── 2. SMOOTH SCROLL ───────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();

      const navHeight = document.getElementById('site-nav')?.offsetHeight ?? 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ─── 3. ACTIVE NAV LINK ON SCROLL ───────────────────────
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    const scrollY   = window.scrollY;
    const navHeight = document.getElementById('site-nav')?.offsetHeight ?? 64;

    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 80;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('is-active');
      }
    });
  }

  // Throttle scroll listener
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        setActiveLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ─── 4. REVEAL ANIMATIONS (INTERSECTION OBSERVER) ───────
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target); // fire once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ─── 5. NAV SHADOW ON SCROLL ────────────────────────────
  const siteNav = document.getElementById('site-nav');
  const scrollThreshold = 20;

  function updateNavShadow() {
    if (window.scrollY > scrollThreshold) {
      siteNav?.style.setProperty('border-bottom-color', '#E5E2E1');
    } else {
      siteNav?.style.setProperty('border-bottom-color', 'transparent');
    }
  }

  window.addEventListener('scroll', updateNavShadow, { passive: true });
  updateNavShadow(); // initial call

  // ─── 6. CONTACT FORM (FORMSPREE) ────────────────────────
  const form       = document.getElementById('contact-form');
  const statusEl   = document.getElementById('form-status');
  const submitBtn  = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const name    = form.querySelector('#field-name').value.trim();
      const email   = form.querySelector('#field-email').value.trim();
      const message = form.querySelector('#field-message').value.trim();

      if (!name || !email || !message) {
        showStatus('Please fill in all fields.', true);
        return;
      }

      if (!isValidEmail(email)) {
        showStatus('Please enter a valid email address.', true);
        return;
      }

      // Disable button
      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING...';
      clearStatus();

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          showStatus('✓ Message sent. I\'ll be in touch soon.');
          form.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = data?.errors?.map(err => err.message).join(', ')
            ?? 'Something went wrong. Please try again.';
          showStatus(msg, true);
        }
      } catch {
        showStatus('Network error. Please check your connection and try again.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEND PROPOSAL';
      }
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className   = 'form-status' + (isError ? ' error' : '');
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = '';
    statusEl.className   = 'form-status';
  }

  // ─── 7. INITIAL STATE ───────────────────────────────────
  setActiveLink();

  // ─── 8. THEME TOGGLE ────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
});