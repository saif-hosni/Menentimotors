// Main site script - index.js

// Elements (with safe checks)
const navToggle = document.getElementById('navToggle');
const sideNav = document.getElementById('sideNav');
const sideClose = document.getElementById('sideClose');
const searchInput = document.getElementById('siteSearch');
const searchClear = document.getElementById('searchClear');
const vehicleGrid = document.getElementById('vehicleGrid');
const lazyImgs = document.querySelectorAll('img.lazy');
const navEl = document.querySelector('.nav');

// Side navigation toggle
if (navToggle && sideNav) {
  navToggle.addEventListener('click', () => {
    sideNav.classList.add('open');
    sideNav.setAttribute('aria-hidden', 'false');
  });
}

if (sideClose) {
  sideClose.addEventListener('click', closeSide);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSide();
});

function closeSide() {
  if (sideNav) {
    sideNav.classList.remove('open');
    sideNav.setAttribute('aria-hidden', 'true');
  }
}

// Click outside to close side panel
window.addEventListener('click', (e) => {
  if (sideNav && navToggle && 
      !sideNav.contains(e.target) && 
      !navToggle.contains(e.target)) {
    closeSide();
  }
});

// Search + category filtering (only on showroom page)
const isShowroom = !!vehicleGrid;
const categoryBar = document.getElementById('categoryBar');
const categoryButtons = categoryBar ? categoryBar.querySelectorAll('.category-btn') : [];
let activeCategory = 'all';

function updateVisibility() {
  if (!vehicleGrid) return;

  const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const allCards = vehicleGrid.querySelectorAll('.card');

  allCards.forEach(card => {
    const cat = card.getAttribute('data-category') || 'all';
    const matchesCategory = (activeCategory === 'all') || (cat === activeCategory);
    const text = (card.getAttribute('data-search') || card.innerText || '').toLowerCase();
    const matchesSearch = !term || text.includes(term);
    card.style.display = (matchesCategory && matchesSearch) ? '' : 'none';
  });

  highlightMatches(term);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatches(term) {
  if (!vehicleGrid || !term) return;

  const targets = vehicleGrid.querySelectorAll('.card .model, .card .specs, .card .more');
  targets.forEach(el => {
    if (!el.dataset.original) el.dataset.original = el.textContent || '';
    const original = el.dataset.original;

    try {
      const re = new RegExp(escapeRegex(term), 'ig');
      const highlighted = original.replace(re, match => `<span class="search-hit">${match}</span>`);
      el.innerHTML = highlighted;
    } catch {
      el.innerHTML = original;
    }
  });
}

// Attach search/category listeners only if on showroom
if (isShowroom) {
  if (searchInput) {
    searchInput.addEventListener('input', updateVisibility);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchInput.blur();
        e.preventDefault();
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      updateVisibility();
    });
  }

  if (categoryButtons.length) {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat') || 'all';
        updateVisibility();
      });
    });
  }

  // Initial run
  updateVisibility();
}

// Lazy load images
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  lazyImgs.forEach(img => io.observe(img));
} else {
  // Fallback: load all immediately
  lazyImgs.forEach(img => {
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
  });
}

// Subtle parallax on hero (mouse move)
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('.hero-media');
if (hero && heroMedia) {
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    heroMedia.style.transform = `translate(${x * 10}px, ${y * 8}px) scale(1.06)`;
  });

  hero.addEventListener('mouseleave', () => {
    heroMedia.style.transform = 'scale(1.05)';
  });
}

// Progressive reveal for cards on scroll
const cards = document.querySelectorAll('.card');
if (cards.length && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';
    reveal.observe(card);
  });
}

// Hide nav on scroll down, show on scroll up
if (navEl) {
  let lastY = window.scrollY || 0;
  let ticking = false;
  const MIN_DELTA = 8;

  function onScroll() {
    const currentY = window.scrollY || 0;
    const delta = currentY - lastY;

    if (Math.abs(delta) < MIN_DELTA) {
      ticking = false;
      return;
    }

    if (currentY > lastY && currentY > 80) {
      navEl.classList.add('nav--hidden');
    } else {
      navEl.classList.remove('nav--hidden');
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  // Wheel fallback
  window.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < MIN_DELTA) return;
    if (e.deltaY > 0 && window.scrollY > 80) {
      navEl.classList.add('nav--hidden');
    } else {
      navEl.classList.remove('nav--hidden');
    }
  }, { passive: true });

  // Touch fallback
  let touchStartY = null;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches?.[0]?.clientY ?? null;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (touchStartY === null) return;
    const curY = e.touches?.[0]?.clientY ?? null;
    if (curY === null) return;

    const dy = touchStartY - curY;
    if (Math.abs(dy) < MIN_DELTA) return;

    if (dy > 0 && window.scrollY > 80) {
      navEl.classList.add('nav--hidden');
    } else {
      navEl.classList.remove('nav--hidden');
    }
    touchStartY = curY;
  }, { passive: true });
}
