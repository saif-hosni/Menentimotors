// Language System
class Lang {
  constructor() {
    this.currentLang = localStorage.getItem('lang') || 'en';
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

    this.translations = {
      en: {
        // Navigation
        'nav.home': 'Home',
        'nav.showroom': 'Showroom',
        'nav.contact': 'Contact Us',
        'nav.request': 'Request vehicle',
        'nav.about': 'About Us',

        // Hero section
        'hero.title': 'When passion meets precision',
        'hero.subtitle': 'Exclusive, curated performance vehicles — discover our latest collection.',
        'hero.cta': 'Explore the showroom',

        // Showroom
        'showroom.title': 'New vehicles',
        'showroom.subtitle': 'Selected models — click or hover for details',
        'showroom.our': 'Our Showroom',
        'showroom.available': 'Here are all the vehicles available.',
        'showroom.showAll': 'Show all',

        // Vehicle details
        'vehicle.year': 'Year',
        'vehicle.price': 'Price',
        'vehicle.viewDetails': 'View details',
        'vehicle.specs': 'Technical Specifications',
        'vehicle.engine': 'Engine:',
        'vehicle.horsepower': 'Horsepower:',
        'vehicle.torque': 'Torque:',
        'vehicle.transmission': 'Transmission:',
        'vehicle.topSpeed': 'Top Speed:',
        'vehicle.zeroToSixty': '0-60 mph:',

        // Search
        'search.placeholder': 'Search models, specs...',
        'search.clear': 'Clear',

        // Footer
        'footer.privacy': 'Privacy',
        'footer.terms': 'Terms',

        // Language
        'lang.en': 'EN',
        'lang.it': 'IT',
        'lang.de': 'DE',
        'lang.pl': 'PL',
        'lang.fr': 'FR',
        'lang.ar': 'AR',
        'lang.ru': 'RU',
        'lang.es': 'ES',

        // Video fallback
        'video.notSupported': 'Your browser does not support the video tag.',

        // Aria labels
        'aria.openProfile': 'Open profile',
        'aria.openNav': 'Open navigation',
        'aria.search': 'Search',
        'aria.luxuryCar': 'Luxury car background',
        'aria.vehicleMakes': 'Vehicle makes',

        // Auth
        'auth.signIn': 'Sign In',
        'auth.signUp': 'Sign Up',
        'auth.signOut': 'Sign Out',
        'auth.profile': 'Profile',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Name',
        'auth.confirmPassword': 'Confirm Password',
        'auth.noAccount': "Don't have an account?",
        'auth.haveAccount': 'Already have an account?',
        'auth.emailExists': 'Email already exists',
        'auth.invalidCredentials': 'Invalid email or password',
        'auth.passwordMismatch': 'Passwords do not match',
        'auth.passwordTooShort': 'Password must be at least 6 characters',

        // Chat
        'chat.title': 'Contact Us',
        'chat.online': 'Online',
        'chat.welcome': 'Hello! How can we help you today?',
        'chat.placeholder': 'Type your message...',
        'chat.justNow': 'Just now',
        'chat.minutesAgo': 'min ago',
        'chat.response.greeting': 'Hello! How can I assist you today?',
        'chat.response.price': 'Our prices vary depending on the vehicle. Would you like to see our showroom?',
        'chat.response.vehicle': 'We have a great selection of luxury vehicles. Check out our showroom for details!',
        'chat.response.testDrive': 'Test drives can be arranged! Please provide your contact information and preferred vehicle.',
        'chat.response.contact': 'You can reach us through this chat, or visit our showroom. We\'re here to help!',
        'chat.response.thanks': 'You\'re welcome! Is there anything else I can help you with?',
        'chat.response.default': 'Thank you for your message. Our team will get back to you soon. Is there anything specific you\'d like to know?',
        'chat.signInRequired': 'Sign In Required',
        'chat.signInMessage': 'Please sign in to use the chat feature and contact our team.',
        'chat.signIn': 'Sign In'
      },
      it: {
        'nav.home': 'Home',
        'nav.showroom': 'Showroom',
        'nav.contact': 'Contattaci',
        'nav.request': 'Richiedi veicolo',
        'nav.about': 'Chi Siamo',
        'hero.title': 'Quando la passione incontra la precisione',
        'hero.subtitle': 'Veicoli ad alte prestazioni esclusivi e curati — scopri la nostra ultima collezione.',
        'hero.cta': 'Esplora lo showroom',
        'showroom.title': 'Nuovi veicoli',
        'showroom.subtitle': 'Modelli selezionati — clicca o passa il mouse per i dettagli',
        'showroom.our': 'Il Nostro Showroom',
        'showroom.available': 'Ecco tutti i veicoli disponibili.',
        'showroom.showAll': 'Mostra tutto',
        'vehicle.year': 'Anno',
        'vehicle.price': 'Prezzo',
        'vehicle.viewDetails': 'Visualizza dettagli',
        'vehicle.specs': 'Specifiche Tecniche',
        'vehicle.engine': 'Motore:',
        'vehicle.horsepower': 'Cavalli:',
        'vehicle.torque': 'Coppia:',
        'vehicle.transmission': 'Trasmissione:',
        'vehicle.topSpeed': 'Velocità Massima:',
        'vehicle.zeroToSixty': '0-60 mph:',
        'search.placeholder': 'Cerca modelli, specifiche...',
        'search.clear': 'Cancella',
        'footer.privacy': 'Privacy',
        'footer.terms': 'Termini',
        'lang.en': 'EN',
        'lang.it': 'IT',
        'lang.de': 'DE',
        'lang.pl': 'PL',
        'lang.fr': 'FR',
        'lang.ar': 'AR',
        'lang.ru': 'RU',
        'lang.es': 'ES',
        'video.notSupported': 'Il tuo browser non supporta il tag video.',
        'aria.openProfile': 'Apri profilo',
        'aria.openNav': 'Apri navigazione',
        'aria.search': 'Cerca',
        'aria.luxuryCar': 'Sfondo auto di lusso',
        'aria.vehicleMakes': 'Marchi di veicoli',
        'auth.signIn': 'Accedi',
        'auth.signUp': 'Registrati',
        'auth.signOut': 'Esci',
        'auth.profile': 'Profilo',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Nome',
        'auth.confirmPassword': 'Conferma Password',
        'auth.noAccount': 'Non hai un account?',
        'auth.haveAccount': 'Hai già un account?',
        'auth.emailExists': 'Email già esistente',
        'auth.invalidCredentials': 'Email o password non validi',
        'auth.passwordMismatch': 'Le password non corrispondono',
        'auth.passwordTooShort': 'La password deve essere di almeno 6 caratteri',
        'chat.title': 'Contattaci',
        'chat.online': 'Online',
        'chat.welcome': 'Ciao! Come possiamo aiutarti oggi?',
        'chat.placeholder': 'Scrivi il tuo messaggio...',
        'chat.justNow': 'Proprio ora',
        'chat.minutesAgo': 'min fa',
        'chat.response.greeting': 'Ciao! Come posso aiutarti oggi?',
        'chat.response.price': 'I nostri prezzi variano a seconda del veicolo. Vorresti vedere il nostro showroom?',
        'chat.response.vehicle': 'Abbiamo un\'ottima selezione di veicoli di lusso. Dai un\'occhiata al nostro showroom per i dettagli!',
        'chat.response.testDrive': 'Possiamo organizzare test drive! Fornisci le tue informazioni di contatto e il veicolo preferito.',
        'chat.response.contact': 'Puoi contattarci tramite questa chat o visitare il nostro showroom. Siamo qui per aiutarti!',
        'chat.response.thanks': 'Prego! C\'è qualcos\'altro in cui posso aiutarti?',
        'chat.response.default': 'Grazie per il tuo messaggio. Il nostro team ti risponderà presto. C\'è qualcosa di specifico che vorresti sapere?',
        'chat.signInRequired': 'Accesso Richiesto',
        'chat.signInMessage': 'Accedi per utilizzare la funzione di chat e contattare il nostro team.',
        'chat.signIn': 'Accedi'
      },
      // ... (your other languages remain unchanged, I only showed 'en' and 'it' as example)
      // Keep all your de, pl, fr, ar, ru, es translations exactly as you had them
    };

    // Default to English if lang missing
    if (!this.translations[this.currentLang]) {
      this.currentLang = 'en';
    }
  }

  t(key) {
    return this.translations[this.currentLang]?.[key] || 
           this.translations['en']?.[key] || 
           key;
  }

  setLang(langCode) {
    if (this.translations[langCode]) {
      this.currentLang = langCode;
      localStorage.setItem('lang', langCode);
      document.documentElement.lang = langCode;
      document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr';
      this.updatePage();
    }
  }

  updatePage() {
    // Cache selectors for better performance
    const elements = document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-title], [data-i18n-text]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n') || 
                  el.getAttribute('data-i18n-placeholder') || 
                  el.getAttribute('data-i18n-aria') || 
                  el.getAttribute('data-i18n-title') || 
                  el.getAttribute('data-i18n-text');

      if (!key) return;

      const translated = this.t(key);

      if (el.hasAttribute('data-i18n-placeholder')) {
        el.placeholder = translated;
      } else if (el.hasAttribute('data-i18n-aria')) {
        el.setAttribute('aria-label', translated);
      } else if (el.hasAttribute('data-i18n-title')) {
        el.title = translated;
      } else if (el.hasAttribute('data-i18n-text')) {
        el.textContent = translated;
      } else {
        el.textContent = translated;
      }
    });

    // Update language selector display
    const langCurrent = document.getElementById('langCurrent');
    if (langCurrent) {
      langCurrent.textContent = this.t(`lang.${this.currentLang}`) + ' ▾';
    }

    // Update active class in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === this.currentLang);
    });

    // Update document direction
    document.documentElement.dir = (this.currentLang === 'ar') ? 'rtl' : 'ltr';
  }

  init() {
    // Apply initial language
    this.updatePage();

    // Setup language dropdown
    const langCurrent = document.getElementById('langCurrent');
    const langDropdown = document.getElementById('langDropdown');
    const langSelector = document.querySelector('.lang-selector');

    if (!langCurrent || !langDropdown || !langSelector) return;

    const toggleDropdown = () => {
      const isOpen = langSelector.classList.toggle('open');
      if (isOpen) {
        this.positionDropdown(langCurrent, langDropdown);
      }
    };

    langCurrent.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Language selection
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const langCode = opt.dataset.lang;
        if (langCode && langCode !== this.currentLang) {
          this.setLang(langCode);
        }
        langSelector.classList.remove('open');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!langSelector.contains(e.target)) {
        langSelector.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && langSelector.classList.contains('open')) {
        langSelector.classList.remove('open');
      }
    });

    // Reposition on resize/scroll
    const reposition = () => {
      if (langSelector.classList.contains('open')) {
        this.positionDropdown(langCurrent, langDropdown);
      }
    };

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, { passive: true });
  }

  // Position dropdown intelligently
  positionDropdown(button, dropdown) {
    if (!button || !dropdown) return;

    const rect = button.getBoundingClientRect();
    const dropdownHeight = dropdown.offsetHeight || 300;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = rect.bottom + 8;
    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      top = rect.top - dropdownHeight - 8;
    }

    const right = window.innerWidth - rect.right;

    dropdown.style.top = `${top}px`;
    dropdown.style.right = `${right}px`;
    dropdown.style.left = 'auto';
  }
}

// Initialize
const lang = new Lang();
lang.init();
