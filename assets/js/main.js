/**
 * Adscalify - Main JavaScript
 * Handles: Mobile menu, FAQ accordion, Testimonials carousel, Smooth scroll
 */
(function () {
  'use strict';

  // ===== MOBILE MENU =====
  const menuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const iconOpen = document.getElementById('menuIconOpen');
  const iconClose = document.getElementById('menuIconClose');
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('active', menuOpen);
    mobileOverlay.classList.toggle('active', menuOpen);
    iconOpen.style.display = menuOpen ? 'none' : 'block';
    iconClose.style.display = menuOpen ? 'block' : 'none';
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  function closeMenu() {
    if (menuOpen) {
      menuOpen = false;
      mobileMenu.classList.remove('active');
      mobileOverlay.classList.remove('active');
      iconOpen.style.display = 'block';
      iconClose.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMenu);
  }

  // Close mobile menu on nav link click
  var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });


  // ===== FAQ ACCORDION =====
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(function (fi) {
          fi.classList.remove('open');
        });

        // Open clicked (if it was closed)
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });


  // ===== TESTIMONIALS CAROUSEL =====
  var testimonials = [
    {
      name: 'Jockey',
      role: 'Brand Representative',
      quote: 'Adscalify transformed our digital strategy. Their team understood our brand voice perfectly and delivered campaigns that significantly increased both engagement and store visits.',
      rating: 5,
    },
    {
      name: 'Shaad Fabrics',
      role: 'Marketing Head',
      quote: 'Working with Adscalify has been a game-changer. Our online presence skyrocketed and we saw measurable results in our sales within the first quarter.',
      rating: 5,
    },
    {
      name: 'Jenpharm',
      role: 'Digital Manager',
      quote: 'Their data-driven approach to performance marketing exceeded our expectations. The ROI we achieved with Adscalify was unlike anything we\'d experienced before.',
      rating: 5,
    },
    {
      name: 'Faster',
      role: 'Founder',
      quote: 'Adscalify doesn\'t just run ads—they build brands. Their strategic thinking and creative execution have been invaluable to our growth.',
      rating: 5,
    },
    {
      name: 'Russet',
      role: 'E-Commerce Lead',
      quote: 'From SEO to social media to paid campaigns, Adscalify delivered a complete package that drove 85% more traffic and 65% more sales for us.',
      rating: 5,
    },
  ];

  var activeTestimonial = 0;
  var quoteEl = document.getElementById('testimonialQuote');
  var nameEl = document.getElementById('testimonialName');
  var roleEl = document.getElementById('testimonialRole');
  var starsEl = document.getElementById('testimonialStars');
  var dotsContainer = document.getElementById('testimonialDots');

  function renderTestimonial(index) {
    if (!quoteEl || !nameEl || !roleEl || !starsEl) return;

    var t = testimonials[index];
    quoteEl.textContent = '\u201C' + t.quote + '\u201D';
    nameEl.textContent = t.name;
    roleEl.textContent = t.role;

    // Stars
    starsEl.innerHTML = '';
    for (var i = 0; i < t.rating; i++) {
      var star = document.createElement('span');
      star.className = 'star';
      star.textContent = '★';
      starsEl.appendChild(star);
    }

    // Update dots
    if (dotsContainer) {
      var dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach(function (dot, di) {
        dot.classList.toggle('active', di === index);
      });
    }
  }

  // Create dots
  if (dotsContainer) {
    testimonials.forEach(function (t, i) {
      var dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'View ' + t.name + ' testimonial');
      dot.addEventListener('click', function () {
        activeTestimonial = i;
        renderTestimonial(i);
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Initial render
  renderTestimonial(0);


  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerOffset = 100;
        var elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });


  // ===== FADE-IN-UP ON SCROLL (Intersection Observer) =====
  var fadeElements = document.querySelectorAll(
    '.feature-card, .service-card, .specialty-card, .case-study-card, .pricing-card, .lookbook-item, .stat-circle'
  );

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    fadeElements.forEach(function (el) {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

})();
