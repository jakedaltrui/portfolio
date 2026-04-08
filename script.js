document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Mobile Nav Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = navMenu?.querySelectorAll('a');

  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  };

  navToggle?.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks?.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // --- Smooth Scroll with Offset ---
  const NAV_HEIGHT = 70;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });

      closeMenu();
    });
  });

  // --- Active Nav Highlight ---
  const sections = document.querySelectorAll('section[id]');

  if (sections.length && navLinks?.length) {
    const activateLink = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateLink(entry.target.id);
          }
        });
      },
      { rootMargin: `-${NAV_HEIGHT}px 0px -40% 0px`, threshold: 0 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // --- Stagger Delays on Cards ---
  document.querySelectorAll('.capabilities-grid, .projects-grid').forEach((grid) => {
    grid.querySelectorAll('.animate-in').forEach((card, i) => {
      card.style.setProperty('--stagger', `${i * 150}ms`);
    });
  });

  // --- Scroll-Triggered Animations (cards + section headers) ---
  if (!prefersReducedMotion) {
    const animateElements = document.querySelectorAll('.animate-in, .section-number, .section-heading');

    if (animateElements.length) {
      const animateObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              animateObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      animateElements.forEach((el) => animateObserver.observe(el));
    }
  } else {
    document.querySelectorAll('.animate-in, .section-number, .section-heading').forEach((el) => {
      el.classList.add('visible');
    });
  }

  // --- Metric Counter Animation ---
  const metrics = document.querySelectorAll('.metric-number');

  if (metrics.length) {
    const parseMetric = (text) => {
      const cleaned = text.replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || 0;
    };

    const getPrefix = (text) => {
      const match = text.match(/^([^0-9]*)/);
      return match ? match[1] : '';
    };

    const getSuffix = (text) => {
      const match = text.match(/[0-9.]([^0-9]*)$/);
      return match ? match[1] : '';
    };

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animateCounter = (el) => {
      const original = el.textContent.trim();
      const target = parseMetric(original);
      const prefix = getPrefix(original);
      const suffix = getSuffix(original);
      const isDecimal = original.includes('.');
      const duration = 2200;
      const start = performance.now();

      if (prefersReducedMotion) return;

      el.textContent = prefix + '0' + suffix;

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = eased * target;

        if (isDecimal) {
          el.textContent = prefix + current.toFixed(1) + suffix;
        } else {
          el.textContent = prefix + Math.round(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = original;
        }
      };

      requestAnimationFrame(tick);
    };

    const metricObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            metricObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    metrics.forEach((m) => metricObserver.observe(m));
  }

  // --- Nav Background on Scroll ---
  const nav = document.querySelector('nav');

  // --- Scroll Indicator ---
  const scrollIndicator = document.querySelector('.scroll-indicator');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    nav?.classList.toggle('scrolled', scrollY > 50);
    scrollIndicator?.classList.toggle('hidden', scrollY > 100);
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Contact Form Handling ---
  const contactForm = document.querySelector('.contact-form');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const requiredFields = contactForm.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    if (!valid) return;

    const successEl = document.getElementById('form-success');
    contactForm.hidden = true;
    if (successEl) successEl.hidden = false;
  });
});
