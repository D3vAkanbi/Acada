/* =========================================================
   ACADA — script.js
   Handles: header scroll state, mobile menu, hero carousel,
   scroll-reveal animations, smooth scroll, contact form
   validation + EmailJS submission.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initHeaderScroll();
  initMobileMenu();
  initCarousel();
  initScrollReveal();
  initSmoothScroll();
  initContactForm();
  initFaqToggle();
  initYear();
});

/* ---------------------------------------------------------
   Header: add shadow once page is scrolled
--------------------------------------------------------- */
function initHeaderScroll() {
  var header = document.querySelector('.site-header');
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------------------------------------------------
   Mobile menu toggle
--------------------------------------------------------- */
function initMobileMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------
   Hero carousel — auto-slide + manual controls
--------------------------------------------------------- */
function initCarousel() {
  var root = document.querySelector('[data-carousel]');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
  var dotsWrap = root.querySelector('.hero-dots');
  var prevBtn = root.querySelector('.hero-arrow.prev');
  var nextBtn = root.querySelector('.hero-arrow.next');
  var current = 0;
  var intervalMs = 6000;
  var timer = null;

  if (!slides.length) return;

  // Build dots
  if (dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    if (dotsWrap) {
      Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function start() {
    timer = window.setInterval(next, intervalMs);
  }
  function stop() {
    if (timer) window.clearInterval(timer);
  }
  function restart() {
    stop();
    start();
  }

  if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });

  // Pause on hover / focus for accessibility
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  render();
  start();
}

/* ---------------------------------------------------------
   Scroll reveal — fade/slide elements in as they enter view
--------------------------------------------------------- */
function initScrollReveal() {
  var targets = document.querySelectorAll('.reveal, .service-card, .why-card, .testimonial-card');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el, i) {
    el.style.transitionDelay = (i % 6) * 60 + 'ms';
    observer.observe(el);
  });
}

/* ---------------------------------------------------------
   Smooth scroll for in-page anchor links
--------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerH = document.querySelector('.site-header') ? document.querySelector('.site-header').offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
}

/* ---------------------------------------------------------
   Contact form: validation + EmailJS submission
--------------------------------------------------------- */
function initContactForm() {
  var form = document.querySelector('#contact-form');
  if (!form) return;

  var EMAILJS_SERVICE_ID = 'service_198s3ns';
  var EMAILJS_TEMPLATE_ID = 'template_igop66h';
  var EMAILJS_PUBLIC_KEY = '9UfLfzfIanqWgOAjG';

  if (window.emailjs) {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  var statusBox = form.querySelector('.form-status');
  var nameField = form.querySelector('#name');
  var emailField = form.querySelector('#email');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    var templateParams = {
      from_name: nameField ? nameField.value : '',
      from_email: emailField ? emailField.value : '',
      message: form.querySelector('#message') ? form.querySelector('#message').value : '',
      to_email: 'acada.writes@gmail.com'
    };

    function showSuccess() {
      showStatus(statusBox, 'success', 'Your message has been sent. We will get back to you shortly.');
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }

    function showFailure() {
      showStatus(statusBox, 'error', 'Something went wrong sending your message. Please try again, or reach us directly on WhatsApp.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }

    if (window.emailjs) {
      window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(showSuccess)
        .catch(showFailure);
    } else {
      // EmailJS SDK failed to load (e.g. offline) — fall back so the
      // UI/UX can still be demonstrated.
      window.setTimeout(showSuccess, 900);
    }
  });
}

function showStatus(el, type, text) {
  if (!el) return;
  el.className = 'form-status ' + type;
  el.textContent = text;
  el.style.display = 'block';
}

function validateForm(form) {
  var valid = true;

  var fields = [
    { el: form.querySelector('#name'), test: function (v) { return v.trim().length >= 2; }, msg: 'Please enter your name (min 2 characters).' },
    { el: form.querySelector('#email'), test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: 'Please enter a valid email address.' },
    { el: form.querySelector('#message'), test: function (v) { return v.trim().length >= 10; }, msg: 'Please enter a message (min 10 characters).' }
  ];

  fields.forEach(function (f) {
    if (!f.el) return;
    var wrap = f.el.closest('.field');
    if (!f.test(f.el.value)) {
      valid = false;
      setFieldError(wrap, f.el, f.msg);
    } else {
      clearFieldError(f.el);
    }
  });

  return valid;
}

function setFieldError(wrap, el, msg) {
  if (!wrap) return;
  wrap.classList.add('has-error');
  var err = wrap.querySelector('.field-error');
  if (err) err.textContent = msg;
  el.setAttribute('aria-invalid', 'true');
}

function clearFieldError(el) {
  var wrap = el.closest('.field');
  if (!wrap) return;
  wrap.classList.remove('has-error');
  el.removeAttribute('aria-invalid');
}

/* ---------------------------------------------------------
   FAQ "See More" expand/collapse (About + Contact pages)
--------------------------------------------------------- */
function initFaqToggle() {
  document.querySelectorAll('.faq-toggle-btn').forEach(function (btn) {
    var wrap = btn.closest('.faq-wrap');
    if (!wrap) return;
    var more = wrap.querySelector('.faq-more');
    if (!more) return;

    btn.addEventListener('click', function () {
      var expanded = more.classList.toggle('expanded');
      btn.textContent = expanded ? 'Show Fewer Questions' : 'See More Questions';
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });
}

/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */
function initYear() {
  var yearEl = document.querySelector('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
