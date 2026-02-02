// Language System - Enhanced for GitHub Pages
class Lang {
  constructor() {
    // Load language from localStorage or default to 'en'
    this.currentLang = 'en';
    try {
      const storedLang = localStorage.getItem('lang');
      if (storedLang && this.isValidLang(storedLang)) {
        this.currentLang = storedLang;
      }
    } catch (e) {
      console.warn('Failed to load language from localStorage:', e);
    }
    
    this.languages = {
      en: 'English',
      it: 'Italiano',
      de: 'Deutsch',
      pl: 'Polski',
      fr: 'Français',
      ar: 'العربية',
      ru: 'Русский',
      es: 'Español'
    };
    
    // Keep all your translations - they're fine!
    this.translations = {
      en: {
        // Your English translations here...
        'nav.home': 'Home',
        'nav.showroom': 'Showroom',
        'nav.contact': 'Contact Us',
        'nav.request': 'Request vehicle',
        'nav.about': 'About Us',
        // ... (keep all your existing translations)
      },
      it: {
        // Your Italian translations here...
      },
      de: {
        // Your German translations here...
      },
      pl: {
        // Your Polish translations here...
      },
      fr: {
        // Your French translations here...
      },
      ar: {
        // Your Arabic translations here...
      },
      ru: {
        // Your Russian translations here...
      },
      es: {
        // Your Spanish translations here...
      }
    };
  }

  // Helper to validate language code
  isValidLang(lang) {
    return Object.keys(this.languages).includes(lang);
  }

  // Get translation for key
  t(key) {
    // Try current language first
    if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
      return this.translations[this.currentLang][key];
    }
    // Fallback to English
    if (this.translations['en'] && this.translations['en'][key]) {
      return this.translations['en'][key];
    }
    // Return key if not found
    return key;
  }

  // Set new language
  setLang(lang) {
    if (this.isValidLang(lang)) {
      this.currentLang = lang;
      try {
        localStorage.setItem('lang', lang);
      } catch (e) {
        console.warn('Failed to save language to localStorage:', e);
      }
      this.updatePage();
      return true;
    }
    return false;
  }

  // Update the entire page with translations
  updatePage() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      try {
        const key = el.getAttribute('data-i18n');
        if (key) {
          el.textContent = this.t(key);
        }
      } catch (e) {
        console.warn('Failed to update element:', e);
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      try {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
          el.placeholder = this.t(key);
        }
      } catch (e) {
        console.warn('Failed to update placeholder:', e);
      }
    });

    // Update aria labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      try {
        const key = el.getAttribute('data-i18n-aria');
        if (key) {
          el.setAttribute('aria-label', this.t(key));
        }
      } catch (e) {
        console.warn('Failed to update aria-label:', e);
      }
    });

    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      try {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
          el.title = this.t(key);
        }
      } catch (e) {
        console.warn('Failed to update title:', e);
      }
    });

    // Set document language and direction
    document.documentElement.lang = this.currentLang;
    if (this.currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // Update language selector
    this.updateLangSelector();
    
    // Notify other systems that language changed
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { lang: this.currentLang }
    }));
  }

  // Update language selector UI
  updateLangSelector() {
    const langCurrent = document.getElementById('langCurrent');
    if (langCurrent) {
      const langCode = this.t('lang.' + this.currentLang) || this.currentLang.toUpperCase();
      langCurrent.textContent = langCode + ' ▾';
    }

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(option => {
      const lang = option.getAttribute('data-lang');
      if (lang === this.currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  // Initialize language system
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Initial page translation
    this.updatePage();
    
    // Setup language selector
    this.setupLangSelector();
    
    console.log('Language system initialized:', this.currentLang);
  }

  // Setup language selector dropdown
  setupLangSelector() {
    const langSelector = document.querySelector('.lang-selector');
    const langCurrent = document.getElementById('langCurrent');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');

    if (!langSelector || !langCurrent || !langDropdown) return;

    // Toggle dropdown
    langCurrent.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('open');
      if (langSelector.classList.contains('open')) {
        this.positionDropdown(langCurrent, langDropdown);
      }
    });

    // Language selection
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = option.getAttribute('data-lang');
        if (selectedLang && selectedLang !== this.currentLang) {
          this.setLang(selectedLang);
        }
        langSelector.classList.remove('open');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!langSelector.contains(e.target)) {
        langSelector.classList.remove('open');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && langSelector.classList.contains('open')) {
        langSelector.classList.remove('open');
      }
    });

    // Reposition on window resize
    window.addEventListener('resize', () => {
      if (langSelector.classList.contains('open')) {
        this.positionDropdown(langCurrent, langDropdown);
      }
    });
  }

  // Position dropdown correctly
  positionDropdown(button, dropdown) {
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate available space below
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      // Position below
      dropdown.style.top = (buttonRect.bottom + 8) + 'px';
      dropdown.style.bottom = 'auto';
    } else {
      // Position above
      dropdown.style.bottom = (viewportHeight - buttonRect.top + 8) + 'px';
      dropdown.style.top = 'auto';
    }
    
    // Align with button
    dropdown.style.left = buttonRect.left + 'px';
    dropdown.style.right = 'auto';
  }
}

// Initialize language system
const lang = new Lang();
lang.init();
