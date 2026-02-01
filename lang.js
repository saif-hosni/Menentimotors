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
        // Navigation
        'nav.home': 'Home',
        'nav.showroom': 'Showroom',
        'nav.contact': 'Contattaci',
        'nav.request': 'Richiedi veicolo',
        'nav.about': 'Chi Siamo',
        
        // Hero section
        'hero.title': 'Quando la passione incontra la precisione',
        'hero.subtitle': 'Veicoli ad alte prestazioni esclusivi e curati — scopri la nostra ultima collezione.',
        'hero.cta': 'Esplora lo showroom',
        
        // Showroom
        'showroom.title': 'Nuovi veicoli',
        'showroom.subtitle': 'Modelli selezionati — clicca o passa il mouse per i dettagli',
        'showroom.our': 'Il Nostro Showroom',
        'showroom.available': 'Ecco tutti i veicoli disponibili.',
        'showroom.showAll': 'Mostra tutto',
        
        // Vehicle details
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
        
        // Search
        'search.placeholder': 'Cerca modelli, specifiche...',
        'search.clear': 'Cancella',
        
        // Footer
        'footer.privacy': 'Privacy',
        'footer.terms': 'Termini',
        
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
        'video.notSupported': 'Il tuo browser non supporta il tag video.',
        
        // Aria labels
        'aria.openProfile': 'Apri profilo',
        'aria.openNav': 'Apri navigazione',
        'aria.search': 'Cerca',
        'aria.luxuryCar': 'Sfondo auto di lusso',
        'aria.vehicleMakes': 'Marchi di veicoli',
        
        // Auth
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
        
        // Chat
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
      de: {
        // Navigation
        'nav.home': 'Startseite',
        'nav.showroom': 'Ausstellung',
        'nav.contact': 'Kontakt',
        'nav.request': 'Fahrzeug anfragen',
        'nav.about': 'Über uns',
        
        // Hero section
        'hero.title': 'Wenn Leidenschaft auf Präzision trifft',
        'hero.subtitle': 'Exklusive, kuratierte Hochleistungsfahrzeuge — entdecken Sie unsere neueste Kollektion.',
        'hero.cta': 'Ausstellung erkunden',
        
        // Showroom
        'showroom.title': 'Neue Fahrzeuge',
        'showroom.subtitle': 'Ausgewählte Modelle — klicken oder hovern Sie für Details',
        'showroom.our': 'Unsere Ausstellung',
        'showroom.available': 'Hier sind alle verfügbaren Fahrzeuge.',
        'showroom.showAll': 'Alle anzeigen',
        
        // Vehicle details
        'vehicle.year': 'Jahr',
        'vehicle.price': 'Preis',
        'vehicle.viewDetails': 'Details anzeigen',
        'vehicle.specs': 'Technische Daten',
        'vehicle.engine': 'Motor:',
        'vehicle.horsepower': 'Leistung:',
        'vehicle.torque': 'Drehmoment:',
        'vehicle.transmission': 'Getriebe:',
        'vehicle.topSpeed': 'Höchstgeschwindigkeit:',
        'vehicle.zeroToSixty': '0-60 mph:',
        
        // Search
        'search.placeholder': 'Modelle, Daten suchen...',
        'search.clear': 'Löschen',
        
        // Footer
        'footer.privacy': 'Datenschutz',
        'footer.terms': 'Bedingungen',
        
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
        'video.notSupported': 'Ihr Browser unterstützt das Video-Tag nicht.',
        
        // Aria labels
        'aria.openProfile': 'Profil öffnen',
        'aria.openNav': 'Navigation öffnen',
        'aria.search': 'Suchen',
        'aria.luxuryCar': 'Luxusauto-Hintergrund',
        'aria.vehicleMakes': 'Fahrzeugmarken',
        
        // Auth
        'auth.signIn': 'Anmelden',
        'auth.signUp': 'Registrieren',
        'auth.signOut': 'Abmelden',
        'auth.profile': 'Profil',
        'auth.email': 'E-Mail',
        'auth.password': 'Passwort',
        'auth.name': 'Name',
        'auth.confirmPassword': 'Passwort bestätigen',
        'auth.noAccount': 'Noch kein Konto?',
        'auth.haveAccount': 'Bereits ein Konto?',
        'auth.emailExists': 'E-Mail existiert bereits',
        'auth.invalidCredentials': 'Ungültige E-Mail oder Passwort',
        'auth.passwordMismatch': 'Passwörter stimmen nicht überein',
        'auth.passwordTooShort': 'Passwort muss mindestens 6 Zeichen lang sein',
        
        // Chat
        'chat.title': 'Kontaktieren Sie uns',
        'chat.online': 'Online',
        'chat.welcome': 'Hallo! Wie können wir Ihnen heute helfen?',
        'chat.placeholder': 'Geben Sie Ihre Nachricht ein...',
        'chat.justNow': 'Gerade eben',
        'chat.minutesAgo': 'Min. vor',
        'chat.response.greeting': 'Hallo! Wie kann ich Ihnen heute helfen?',
        'chat.response.price': 'Unsere Preise variieren je nach Fahrzeug. Möchten Sie unseren Showroom sehen?',
        'chat.response.vehicle': 'Wir haben eine großartige Auswahl an Luxusfahrzeugen. Schauen Sie sich unseren Showroom für Details an!',
        'chat.response.testDrive': 'Probefahrten können arrangiert werden! Bitte geben Sie Ihre Kontaktinformationen und das bevorzugte Fahrzeug an.',
        'chat.response.contact': 'Sie können uns über diesen Chat erreichen oder unseren Showroom besuchen. Wir sind hier, um zu helfen!',
        'chat.response.thanks': 'Gern geschehen! Gibt es noch etwas, womit ich Ihnen helfen kann?',
        'chat.response.default': 'Vielen Dank für Ihre Nachricht. Unser Team wird sich bald bei Ihnen melden. Gibt es etwas Bestimmtes, das Sie wissen möchten?',
        'chat.signInRequired': 'Anmeldung erforderlich',
        'chat.signInMessage': 'Bitte melden Sie sich an, um die Chat-Funktion zu nutzen und unser Team zu kontaktieren.',
        'chat.signIn': 'Anmelden'
      },
      pl: {
        // Navigation
        'nav.home': 'Strona główna',
        'nav.showroom': 'Salon',
        'nav.contact': 'Skontaktuj się',
        'nav.request': 'Zapytaj o pojazd',
        'nav.about': 'O nas',
        
        // Hero section
        'hero.title': 'Gdy pasja spotyka się z precyzją',
        'hero.subtitle': 'Ekskluzywne, starannie wyselekcjonowane pojazdy wyścigowe — odkryj naszą najnowszą kolekcję.',
        'hero.cta': 'Zwiedź salon',
        
        // Showroom
        'showroom.title': 'Nowe pojazdy',
        'showroom.subtitle': 'Wybrane modele — kliknij lub najedź, aby zobaczyć szczegóły',
        'showroom.our': 'Nasz Salon',
        'showroom.available': 'Oto wszystkie dostępne pojazdy.',
        'showroom.showAll': 'Pokaż wszystkie',
        
        // Vehicle details
        'vehicle.year': 'Rok',
        'vehicle.price': 'Cena',
        'vehicle.viewDetails': 'Zobacz szczegóły',
        'vehicle.specs': 'Specyfikacja Techniczna',
        'vehicle.engine': 'Silnik:',
        'vehicle.horsepower': 'Moc:',
        'vehicle.torque': 'Moment obrotowy:',
        'vehicle.transmission': 'Skrzynia biegów:',
        'vehicle.topSpeed': 'Prędkość maksymalna:',
        'vehicle.zeroToSixty': '0-60 mph:',
        
        // Search
        'search.placeholder': 'Szukaj modeli, specyfikacji...',
        'search.clear': 'Wyczyść',
        
        // Footer
        'footer.privacy': 'Prywatność',
        'footer.terms': 'Warunki',
        
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
        'video.notSupported': 'Twoja przeglądarka nie obsługuje tagu wideo.',
        
        // Aria labels
        'aria.openProfile': 'Otwórz profil',
        'aria.openNav': 'Otwórz nawigację',
        'aria.search': 'Szukaj',
        'aria.luxuryCar': 'Tło luksusowego samochodu',
        'aria.vehicleMakes': 'Marki pojazdów',
        
        // Auth
        'auth.signIn': 'Zaloguj się',
        'auth.signUp': 'Zarejestruj się',
        'auth.signOut': 'Wyloguj się',
        'auth.profile': 'Profil',
        'auth.email': 'Email',
        'auth.password': 'Hasło',
        'auth.name': 'Imię',
        'auth.confirmPassword': 'Potwierdź hasło',
        'auth.noAccount': 'Nie masz konta?',
        'auth.haveAccount': 'Masz już konto?',
        'auth.emailExists': 'Email już istnieje',
        'auth.invalidCredentials': 'Nieprawidłowy email lub hasło',
        'auth.passwordMismatch': 'Hasła nie pasują',
        'auth.passwordTooShort': 'Hasło musi mieć co najmniej 6 znaków',
        
        // Chat
        'chat.title': 'Skontaktuj się z nami',
        'chat.online': 'Online',
        'chat.welcome': 'Cześć! Jak możemy Ci dzisiaj pomóc?',
        'chat.placeholder': 'Wpisz swoją wiadomość...',
        'chat.justNow': 'Właśnie teraz',
        'chat.minutesAgo': 'min temu',
        'chat.response.greeting': 'Cześć! Jak mogę Ci dzisiaj pomóc?',
        'chat.response.price': 'Nasze ceny różnią się w zależności od pojazdu. Chciałbyś zobaczyć nasz salon?',
        'chat.response.vehicle': 'Mamy świetny wybór luksusowych pojazdów. Sprawdź nasz salon, aby uzyskać szczegóły!',
        'chat.response.testDrive': 'Możemy zorganizować jazdy próbne! Podaj swoje dane kontaktowe i preferowany pojazd.',
        'chat.response.contact': 'Możesz się z nami skontaktować przez ten czat lub odwiedzić nasz salon. Jesteśmy tutaj, aby pomóc!',
        'chat.response.thanks': 'Nie ma za co! Czy jest coś jeszcze, w czym mogę pomóc?',
        'chat.response.default': 'Dziękujemy za wiadomość. Nasz zespół wkrótce się z Tobą skontaktuje. Czy jest coś konkretnego, o czym chciałbyś wiedzieć?',
        'chat.signInRequired': 'Wymagane logowanie',
        'chat.signInMessage': 'Zaloguj się, aby korzystać z funkcji czatu i skontaktować się z naszym zespołem.',
        'chat.signIn': 'Zaloguj się'
      },
      fr: {
        // Navigation
        'nav.home': 'Accueil',
        'nav.showroom': 'Showroom',
        'nav.contact': 'Contactez-nous',
        'nav.request': 'Demander un véhicule',
        'nav.about': 'À propos',
        
        // Hero section
        'hero.title': 'Quand la passion rencontre la précision',
        'hero.subtitle': 'Véhicules de performance exclusifs et sélectionnés — découvrez notre dernière collection.',
        'hero.cta': 'Explorer le showroom',
        
        // Showroom
        'showroom.title': 'Nouveaux véhicules',
        'showroom.subtitle': 'Modèles sélectionnés — cliquez ou survolez pour les détails',
        'showroom.our': 'Notre Showroom',
        'showroom.available': 'Voici tous les véhicules disponibles.',
        'showroom.showAll': 'Tout afficher',
        
        // Vehicle details
        'vehicle.year': 'Année',
        'vehicle.price': 'Prix',
        'vehicle.viewDetails': 'Voir les détails',
        'vehicle.specs': 'Spécifications Techniques',
        'vehicle.engine': 'Moteur:',
        'vehicle.horsepower': 'Puissance:',
        'vehicle.torque': 'Couple:',
        'vehicle.transmission': 'Transmission:',
        'vehicle.topSpeed': 'Vitesse maximale:',
        'vehicle.zeroToSixty': '0-60 mph:',
        
        // Search
        'search.placeholder': 'Rechercher modèles, spécifications...',
        'search.clear': 'Effacer',
        
        // Footer
        'footer.privacy': 'Confidentialité',
        'footer.terms': 'Conditions',
        
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
        'video.notSupported': 'Votre navigateur ne prend pas en charge la balise vidéo.',
        
        // Aria labels
        'aria.openProfile': 'Ouvrir le profil',
        'aria.openNav': 'Ouvrir la navigation',
        'aria.search': 'Rechercher',
        'aria.luxuryCar': 'Arrière-plan de voiture de luxe',
        'aria.vehicleMakes': 'Marques de véhicules',
        
        // Auth
        'auth.signIn': 'Se connecter',
        'auth.signUp': "S'inscrire",
        'auth.signOut': 'Se déconnecter',
        'auth.profile': 'Profil',
        'auth.email': 'Email',
        'auth.password': 'Mot de passe',
        'auth.name': 'Nom',
        'auth.confirmPassword': 'Confirmer le mot de passe',
        'auth.noAccount': "Vous n'avez pas de compte?",
        'auth.haveAccount': 'Vous avez déjà un compte?',
        'auth.emailExists': "L'email existe déjà",
        'auth.invalidCredentials': 'Email ou mot de passe invalide',
        'auth.passwordMismatch': 'Les mots de passe ne correspondent pas',
        'auth.passwordTooShort': 'Le mot de passe doit contenir au moins 6 caractères',
        
        // Chat
        'chat.title': 'Contactez-nous',
        'chat.online': 'En ligne',
        'chat.welcome': 'Bonjour! Comment pouvons-nous vous aider aujourd\'hui?',
        'chat.placeholder': 'Tapez votre message...',
        'chat.justNow': 'À l\'instant',
        'chat.minutesAgo': 'min',
        'chat.response.greeting': 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
        'chat.response.price': 'Nos prix varient selon le véhicule. Souhaitez-vous voir notre showroom?',
        'chat.response.vehicle': 'Nous avons une excellente sélection de véhicules de luxe. Consultez notre showroom pour plus de détails!',
        'chat.response.testDrive': 'Des essais peuvent être organisés! Veuillez fournir vos coordonnées et le véhicule de votre choix.',
        'chat.response.contact': 'Vous pouvez nous joindre via ce chat ou visiter notre showroom. Nous sommes là pour vous aider!',
        'chat.response.thanks': 'De rien! Y a-t-il autre chose avec laquelle je peux vous aider?',
        'chat.response.default': 'Merci pour votre message. Notre équipe vous répondra bientôt. Y a-t-il quelque chose de spécifique que vous aimeriez savoir?',
        'chat.signInRequired': 'Connexion requise',
        'chat.signInMessage': 'Veuillez vous connecter pour utiliser la fonction de chat et contacter notre équipe.',
        'chat.signIn': 'Se connecter'
      },
      ar: {
        // Navigation
        'nav.home': 'الرئيسية',
        'nav.showroom': 'المعرض',
        'nav.contact': 'اتصل بنا',
        'nav.request': 'طلب مركبة',
        'nav.about': 'من نحن',
        
        // Hero section
        'hero.title': 'عندما تلتقي الشغف بالدقة',
        'hero.subtitle': 'مركبات أداء حصرية ومنتقاة — اكتشف مجموعتنا الأحدث.',
        'hero.cta': 'استكشف المعرض',
        
        // Showroom
        'showroom.title': 'مركبات جديدة',
        'showroom.subtitle': 'نماذج مختارة — انقر أو مرر للتفاصيل',
        'showroom.our': 'معرضنا',
        'showroom.available': 'إليك جميع المركبات المتاحة.',
        'showroom.showAll': 'عرض الكل',
        
        // Vehicle details
        'vehicle.year': 'السنة',
        'vehicle.price': 'السعر',
        'vehicle.viewDetails': 'عرض التفاصيل',
        'vehicle.specs': 'المواصفات التقنية',
        'vehicle.engine': 'المحرك:',
        'vehicle.horsepower': 'القوة:',
        'vehicle.torque': 'عزم الدوران:',
        'vehicle.transmission': 'ناقل الحركة:',
        'vehicle.topSpeed': 'السرعة القصوى:',
        'vehicle.zeroToSixty': '0-60 ميل في الساعة:',
        
        // Search
        'search.placeholder': 'البحث عن النماذج والمواصفات...',
        'search.clear': 'مسح',
        
        // Footer
        'footer.privacy': 'الخصوصية',
        'footer.terms': 'الشروط',
        
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
        'video.notSupported': 'متصفحك لا يدعم علامة الفيديو.',
        
        // Aria labels
        'aria.openProfile': 'فتح الملف الشخصي',
        'aria.openNav': 'فتح التنقل',
        'aria.search': 'بحث',
        'aria.luxuryCar': 'خلفية سيارة فاخرة',
        'aria.vehicleMakes': 'علامات المركبات',
        
        // Auth
        'auth.signIn': 'تسجيل الدخول',
        'auth.signUp': 'إنشاء حساب',
        'auth.signOut': 'تسجيل الخروج',
        'auth.profile': 'الملف الشخصي',
        'auth.email': 'البريد الإلكتروني',
        'auth.password': 'كلمة المرور',
        'auth.name': 'الاسم',
        'auth.confirmPassword': 'تأكيد كلمة المرور',
        'auth.noAccount': 'ليس لديك حساب؟',
        'auth.haveAccount': 'لديك حساب بالفعل؟',
        'auth.emailExists': 'البريد الإلكتروني موجود بالفعل',
        'auth.invalidCredentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'auth.passwordMismatch': 'كلمات المرور غير متطابقة',
        'auth.passwordTooShort': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
        
        // Chat
        'chat.title': 'اتصل بنا',
        'chat.online': 'متصل',
        'chat.welcome': 'مرحباً! كيف يمكننا مساعدتك اليوم؟',
        'chat.placeholder': 'اكتب رسالتك...',
        'chat.justNow': 'الآن',
        'chat.minutesAgo': 'دقيقة',
        'chat.response.greeting': 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        'chat.response.price': 'تختلف أسعارنا حسب المركبة. هل تود رؤية معرضنا؟',
        'chat.response.vehicle': 'لدينا مجموعة رائعة من المركبات الفاخرة. تحقق من معرضنا للتفاصيل!',
        'chat.response.testDrive': 'يمكن ترتيب تجربة قيادة! يرجى تقديم معلومات الاتصال الخاصة بك والمركبة المفضلة.',
        'chat.response.contact': 'يمكنك التواصل معنا من خلال هذه الدردشة أو زيارة معرضنا. نحن هنا للمساعدة!',
        'chat.response.thanks': 'على الرحب والسعة! هل هناك أي شيء آخر يمكنني مساعدتك فيه؟',
        'chat.response.default': 'شكراً لرسالتك. سيتواصل فريقنا معك قريباً. هل هناك شيء محدد تود معرفته؟',
        'chat.signInRequired': 'تسجيل الدخول مطلوب',
        'chat.signInMessage': 'يرجى تسجيل الدخول لاستخدام ميزة الدردشة والاتصال بفريقنا.',
        'chat.signIn': 'تسجيل الدخول'
      },
      ru: {
        // Navigation
        'nav.home': 'Главная',
        'nav.showroom': 'Шоурум',
        'nav.contact': 'Связаться с нами',
        'nav.request': 'Запросить автомобиль',
        'nav.about': 'О нас',
        
        // Hero section
        'hero.title': 'Когда страсть встречается с точностью',
        'hero.subtitle': 'Эксклюзивные, тщательно отобранные спортивные автомобили — откройте для себя нашу новейшую коллекцию.',
        'hero.cta': 'Исследовать шоурум',
        
        // Showroom
        'showroom.title': 'Новые автомобили',
        'showroom.subtitle': 'Отобранные модели — нажмите или наведите для деталей',
        'showroom.our': 'Наш Шоурум',
        'showroom.available': 'Вот все доступные автомобили.',
        'showroom.showAll': 'Показать все',
        
        // Vehicle details
        'vehicle.year': 'Год',
        'vehicle.price': 'Цена',
        'vehicle.viewDetails': 'Посмотреть детали',
        'vehicle.specs': 'Технические Характеристики',
        'vehicle.engine': 'Двигатель:',
        'vehicle.horsepower': 'Мощность:',
        'vehicle.torque': 'Крутящий момент:',
        'vehicle.transmission': 'Трансмиссия:',
        'vehicle.topSpeed': 'Максимальная скорость:',
        'vehicle.zeroToSixty': '0-60 миль/ч:',
        
        // Search
        'search.placeholder': 'Поиск моделей, характеристик...',
        'search.clear': 'Очистить',
        
        // Footer
        'footer.privacy': 'Конфиденциальность',
        'footer.terms': 'Условия',
        
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
        'video.notSupported': 'Ваш браузер не поддерживает тег видео.',
        
        // Aria labels
        'aria.openProfile': 'Открыть профиль',
        'aria.openNav': 'Открыть навигацию',
        'aria.search': 'Поиск',
        'aria.luxuryCar': 'Фон роскошного автомобиля',
        'aria.vehicleMakes': 'Марки автомобилей',
        
        // Auth
        'auth.signIn': 'Войти',
        'auth.signUp': 'Зарегистрироваться',
        'auth.signOut': 'Выйти',
        'auth.profile': 'Профиль',
        'auth.email': 'Email',
        'auth.password': 'Пароль',
        'auth.name': 'Имя',
        'auth.confirmPassword': 'Подтвердите пароль',
        'auth.noAccount': 'Нет аккаунта?',
        'auth.haveAccount': 'Уже есть аккаунт?',
        'auth.emailExists': 'Email уже существует',
        'auth.invalidCredentials': 'Неверный email или пароль',
        'auth.passwordMismatch': 'Пароли не совпадают',
        'auth.passwordTooShort': 'Пароль должен содержать не менее 6 символов',
        
        // Chat
        'chat.title': 'Свяжитесь с нами',
        'chat.online': 'В сети',
        'chat.welcome': 'Здравствуйте! Чем мы можем вам помочь сегодня?',
        'chat.placeholder': 'Введите ваше сообщение...',
        'chat.justNow': 'Только что',
        'chat.minutesAgo': 'мин назад',
        'chat.response.greeting': 'Здравствуйте! Чем я могу вам помочь сегодня?',
        'chat.response.price': 'Наши цены различаются в зависимости от автомобиля. Хотели бы вы посмотреть наш шоурум?',
        'chat.response.vehicle': 'У нас отличный выбор роскошных автомобилей. Посмотрите наш шоурум для деталей!',
        'chat.response.testDrive': 'Тест-драйвы могут быть организованы! Пожалуйста, предоставьте вашу контактную информацию и предпочтительный автомобиль.',
        'chat.response.contact': 'Вы можете связаться с нами через этот чат или посетить наш шоурум. Мы здесь, чтобы помочь!',
        'chat.response.thanks': 'Пожалуйста! Есть ли что-то еще, с чем я могу помочь?',
        'chat.response.default': 'Спасибо за ваше сообщение. Наша команда скоро свяжется с вами. Есть ли что-то конкретное, что вы хотели бы узнать?',
        'chat.signInRequired': 'Требуется вход',
        'chat.signInMessage': 'Пожалуйста, войдите в систему, чтобы использовать функцию чата и связаться с нашей командой.',
        'chat.signIn': 'Войти'
      },
      es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.showroom': 'Showroom',
        'nav.contact': 'Contáctanos',
        'nav.request': 'Solicitar vehículo',
        'nav.about': 'Acerca de',
        
        // Hero section
        'hero.title': 'Cuando la pasión se encuentra con la precisión',
        'hero.subtitle': 'Vehículos de alto rendimiento exclusivos y curados — descubre nuestra última colección.',
        'hero.cta': 'Explorar el showroom',
        
        // Showroom
        'showroom.title': 'Vehículos nuevos',
        'showroom.subtitle': 'Modelos seleccionados — haz clic o pasa el mouse para detalles',
        'showroom.our': 'Nuestro Showroom',
        'showroom.available': 'Aquí están todos los vehículos disponibles.',
        'showroom.showAll': 'Mostrar todo',
        
        // Vehicle details
        'vehicle.year': 'Año',
        'vehicle.price': 'Precio',
        'vehicle.viewDetails': 'Ver detalles',
        'vehicle.specs': 'Especificaciones Técnicas',
        'vehicle.engine': 'Motor:',
        'vehicle.horsepower': 'Caballos de fuerza:',
        'vehicle.torque': 'Par motor:',
        'vehicle.transmission': 'Transmisión:',
        'vehicle.topSpeed': 'Velocidad máxima:',
        'vehicle.zeroToSixty': '0-60 mph:',
        
        // Search
        'search.placeholder': 'Buscar modelos, especificaciones...',
        'search.clear': 'Limpiar',
        
        // Footer
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Términos',
        
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
        'video.notSupported': 'Tu navegador no admite la etiqueta de video.',
        
        // Aria labels
        'aria.openProfile': 'Abrir perfil',
        'aria.openNav': 'Abrir navegación',
        'aria.search': 'Buscar',
        'aria.luxuryCar': 'Fondo de auto de lujo',
        'aria.vehicleMakes': 'Marcas de vehículos',
        
        // Auth
        'auth.signIn': 'Iniciar sesión',
        'auth.signUp': 'Registrarse',
        'auth.signOut': 'Cerrar sesión',
        'auth.profile': 'Perfil',
        'auth.email': 'Email',
        'auth.password': 'Contraseña',
        'auth.name': 'Nombre',
        'auth.confirmPassword': 'Confirmar contraseña',
        'auth.noAccount': '¿No tienes una cuenta?',
        'auth.haveAccount': '¿Ya tienes una cuenta?',
        'auth.emailExists': 'El email ya existe',
        'auth.invalidCredentials': 'Email o contraseña inválidos',
        'auth.passwordMismatch': 'Las contraseñas no coinciden',
        'auth.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
        
        // Chat
        'chat.title': 'Contáctanos',
        'chat.online': 'En línea',
        'chat.welcome': '¡Hola! ¿Cómo podemos ayudarte hoy?',
        'chat.placeholder': 'Escribe tu mensaje...',
        'chat.justNow': 'Ahora mismo',
        'chat.minutesAgo': 'min',
        'chat.response.greeting': '¡Hola! ¿Cómo puedo ayudarte hoy?',
        'chat.response.price': 'Nuestros precios varían según el vehículo. ¿Te gustaría ver nuestro showroom?',
        'chat.response.vehicle': 'Tenemos una gran selección de vehículos de lujo. ¡Consulta nuestro showroom para más detalles!',
        'chat.response.testDrive': '¡Se pueden organizar pruebas de manejo! Por favor proporciona tu información de contacto y el vehículo preferido.',
        'chat.response.contact': 'Puedes contactarnos a través de este chat o visitar nuestro showroom. ¡Estamos aquí para ayudar!',
        'chat.response.thanks': '¡De nada! ¿Hay algo más en lo que pueda ayudarte?',
        'chat.response.default': 'Gracias por tu mensaje. Nuestro equipo te responderá pronto. ¿Hay algo específico que te gustaría saber?',
        'chat.signInRequired': 'Inicio de sesión requerido',
        'chat.signInMessage': 'Por favor inicia sesión para usar la función de chat y contactar a nuestro equipo.',
        'chat.signIn': 'Iniciar sesión'
      }
    };
  }

  t(key) {
    return this.translations[this.currentLang]?.[key] || this.translations['en'][key] || key;
  }

  setLang(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      this.updatePage();
    }
  }

  updatePage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Update aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', this.t(key));
    });

    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // Update text content for elements like video fallback
    document.querySelectorAll('[data-i18n-text]').forEach(el => {
      const key = el.getAttribute('data-i18n-text');
      el.textContent = this.t(key);
    });

    // Update HTML lang and dir attributes
    document.documentElement.lang = this.currentLang;
    // Set RTL for Arabic
    if (this.currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // Update language selector display
    const langCurrent = document.getElementById('langCurrent');
    if (langCurrent) {
      langCurrent.textContent = this.t('lang.' + this.currentLang) + ' ▾';
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

  init() {
    this.updatePage();
    
    // Setup language selector dropdown
    const langSelector = document.querySelector('.lang-selector');
    const langCurrent = document.getElementById('langCurrent');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');

    if (langSelector && langCurrent && langDropdown) {
      // Function to position dropdown relative to viewport
      const positionDropdown = () => {
        const buttonRect = langCurrent.getBoundingClientRect();
        const dropdownHeight = langDropdown.offsetHeight || 200;
        const viewportHeight = window.innerHeight;
        
        // Position directly below the button
        let top = buttonRect.bottom + 8;
        
        // If dropdown goes below viewport, position it above instead
        if (top + dropdownHeight > viewportHeight) {
          top = buttonRect.top - dropdownHeight - 8;
        }
        
        // Align dropdown with the right edge of the button
        let right = window.innerWidth - buttonRect.right;
        
        langDropdown.style.top = top + 'px';
        langDropdown.style.right = right + 'px';
        langDropdown.style.left = 'auto';
      };

      // Toggle dropdown on click
      langCurrent.addEventListener('click', (e) => {
        e.stopPropagation();
        langSelector.classList.toggle('open');
        // Position dropdown when it opens
        if (langSelector.classList.contains('open')) {
          setTimeout(positionDropdown, 0);
        }
      });

      // Handle language selection
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

      // Close dropdown on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && langSelector.classList.contains('open')) {
          langSelector.classList.remove('open');
        }
      });

      // Reposition dropdown on window resize and scroll
      window.addEventListener('resize', () => {
        if (langSelector.classList.contains('open')) {
          positionDropdown();
        }
      });

      window.addEventListener('scroll', () => {
        if (langSelector.classList.contains('open')) {
          positionDropdown();
        }
      }, true); // Use capture phase for better accuracy
    }
  }
}

// Initialize language system
const lang = new Lang();
lang.init();

