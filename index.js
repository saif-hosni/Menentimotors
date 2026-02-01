/* Elements */
    const navToggle = document.getElementById('navToggle');
    const sideNav = document.getElementById('sideNav');
    const sideClose = document.getElementById('sideClose');
    const searchInput = document.getElementById('siteSearch');
    const searchClear = document.getElementById('searchClear');
    const vehicleGrid = document.getElementById('vehicleGrid');
    const lazyImgs = document.querySelectorAll('img.lazy');

    /* Side navigation toggle */
    navToggle.addEventListener('click', () => {
      sideNav.classList.add('open');
      sideNav.setAttribute('aria-hidden', 'false');
    });
    sideClose.addEventListener('click', closeSide);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSide(); });

    function closeSide(){
      sideNav.classList.remove('open');
      sideNav.setAttribute('aria-hidden', 'true');
    }

    /* Click outside to close side panel */
    window.addEventListener('click', (e) => {
      if (!sideNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeSide();
      }
    });

  /* Combined search + category filtering (client-side) */
  // Only enable search/category filtering on the showroom page
  const isShowroom = !!document.getElementById('showroom');
  const categoryBar = document.getElementById('categoryBar');
  const categoryButtons = categoryBar ? categoryBar.querySelectorAll('.category-btn') : [];
  let activeCategory = 'all';

    function updateVisibility(){
      const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const allCards = vehicleGrid ? vehicleGrid.querySelectorAll('.card') : [];
      allCards.forEach(card => {
        const cat = card.getAttribute('data-category') || 'all';
        const matchesCategory = (activeCategory === 'all') || (cat === activeCategory);
        const text = (card.getAttribute('data-search') || card.innerText).toLowerCase();
        const matchesSearch = !term || text.includes(term);
        card.style.display = (matchesCategory && matchesSearch) ? '' : 'none';
      });
      // highlight matches inside visible cards
      highlightMatches(term);
    }

    // utility: escape regex special chars
    function escapeRegex(str){
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Highlight matching substrings in target elements within cards
    function highlightMatches(term){
      const targetsSelector = '.card .model, .card .specs, .card .more';
      const elems = vehicleGrid ? vehicleGrid.querySelectorAll(targetsSelector) : [];
      elems.forEach(el => {
        if (!el.dataset.original) el.dataset.original = el.textContent;
        const original = el.dataset.original;
        if (!term) {
          el.innerHTML = original;
          return;
        }
        try {
          const re = new RegExp(escapeRegex(term), 'ig');
          const highlighted = original.replace(re, match => `<span class="search-hit">${match}</span>`);
          el.innerHTML = highlighted;
        } catch (e) {
          // if regex fails, restore original
          el.innerHTML = original;
        }
      });
    }

    // Only attach handlers when on the showroom page and grid exists
    if (isShowroom && vehicleGrid){
      if (searchInput){
        searchInput.addEventListener('input', () => { updateVisibility(); });

        // On Enter: stop typing (blur) but do not collapse the search UI
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter'){
            // blur to dismiss virtual keyboards and remove focus
            searchInput.blur();
            // prevent default form submission if any
            e.preventDefault();
          }
        });

        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          updateVisibility();
        });
      }

      if (categoryButtons.length){
        categoryButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-cat') || 'all';
            updateVisibility();
          });
        });
      }

      // run once to set initial visibility (e.g., if page loaded with search value)
      updateVisibility();
    }

    /* Lazy load images (IntersectionObserver) */
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
      // fallback: load all
      lazyImgs.forEach(img => { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); });
    }

    /* Subtle parallax on mouse move for hero */
    const hero = document.querySelector('.hero');
    const heroMedia = document.querySelector('.hero-media');
    if(hero && heroMedia){
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        heroMedia.style.transform = `translate(${x * 10}px, ${y * 8}px) scale(1.06)`;
      });
      hero.addEventListener('mouseleave', () => { heroMedia.style.transform = 'scale(1.05)'; });
    }

    /* Optional: progressive reveal for cards (on scroll) */
    const cards = document.querySelectorAll('.card');
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = 1;
          e.target.style.transform = 'translateY(0)';
          reveal.unobserve(e.target);
        }
      });
    },{threshold:0.12});
    cards.forEach(c => {
      c.style.opacity = 0;
      c.style.transform = 'translateY(18px)';
      reveal.observe(c);
    });

    /* Hide nav on scroll down, show on scroll up (performant) */
    (function(){
      const navEl = document.querySelector('.nav');
      if (!navEl) return;

      let lastY = window.scrollY || 0;
      let ticking = false;
      const MIN_DELTA = 8; // ignore tiny scrolls

      function onScroll(){
        const currentY = window.scrollY || 0;
        const delta = currentY - lastY;

        // only act when movement is meaningful
        if (Math.abs(delta) < MIN_DELTA) {
          ticking = false;
          return;
        }

        if (currentY > lastY && currentY > 80) {
          // scrolling down and past the header height -> hide
          navEl.classList.add('nav--hidden');
        } else {
          // scrolling up -> show
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

      // Fallbacks: listen for wheel and touch gestures so we catch scrolls
      // that don't change window.scrollY (e.g. inner scrollable containers).
      window.addEventListener('wheel', (e) => {
        const dy = e.deltaY;
        if (Math.abs(dy) < MIN_DELTA) return;
        if (dy > 0 && window.scrollY > 80) {
          navEl.classList.add('nav--hidden');
        } else {
          navEl.classList.remove('nav--hidden');
        }
      }, { passive: true });

      let touchStartY = null;
      window.addEventListener('touchstart', (e) => { touchStartY = e.touches && e.touches[0] ? e.touches[0].clientY : null; }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (touchStartY === null) return;
        const curY = e.touches && e.touches[0] ? e.touches[0].clientY : null;
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
    })();