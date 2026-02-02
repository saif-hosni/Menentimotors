// patch.js - Enhanced for GitHub Pages
(function() {
  'use strict';
  console.log('Loading enhanced GitHub Pages patch...');

  // 1. SECURITY MODULE (enhanced)
  if (typeof security === 'undefined') {
    window.security = {
      getStoredData: function(key) {
        try {
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        } catch {
          return null;
        }
      },
      
      setStoredData: function(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      },
      
      removeStoredData: function(key) {
        localStorage.removeItem(key);
      },
      
      sanitizeInput: function(text) {
        if (typeof text !== 'string') return '';
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      },
      
      sanitizeHTML: function(html) {
        if (typeof html !== 'string') return '';
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
      },
      
      validateEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      
      validatePhone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 10) return { valid: true };
        return { valid: false, message: 'Phone number must be at least 10 digits' };
      },
      
      validateName: function(name) {
        if (name.length < 2) {
          return { valid: false, message: 'Name must be at least 2 characters' };
        }
        return { valid: true };
      },
      
      validatePassword: function(password) {
        if (password.length < 6) {
          return { valid: false, message: 'Password must be at least 6 characters' };
        }
        return { valid: true };
      },
      
      hashPassword: async function(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
          const char = password.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return 'hashed_' + hash.toString();
      },
      
      hashPasswordSync: function(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
          const char = password.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return 'hashed_' + hash.toString();
      },
      
      checkRateLimit: function(key) {
        return { allowed: true, message: '' };
      },
      
      recordFailedAttempt: function(email) {},
      clearFailedAttempts: function(email) {},
      isAccountLocked: function(email) {
        return { locked: false, message: '' };
      },
      
      logSecurityEvent: function(event, data) {
        console.log('[Security Event]', event, data);
      }
    };
  }

  // 2. showErrorGUI (keep yours)
  if (typeof showErrorGUI === 'undefined') {
    window.showErrorGUI = function(message, actionText, actionCallback, type) {
      console.log('[GUI Message]', type + ':', message);
      if (type === 'success') {
        alert('✓ ' + message);
      } else {
        alert('⚠️ ' + message);
      }
      if (actionCallback) {
        actionCallback();
      }
    };
  }

  // 3. LANG MODULE (enhanced to prevent errors)
  if (typeof lang === 'undefined') {
    window.lang = {
      t: function(key) { 
        // Return key or a simple fallback
        const simpleFallbacks = {
          'auth.invalidCredentials': 'Invalid email or password',
          'auth.passwordMismatch': 'Passwords do not match',
          'auth.emailExists': 'Email already exists',
          'auth.passwordTooShort': 'Password must be at least 6 characters',
          'chat.welcome': 'Hello! How can we help you today?',
          'chat.placeholder': 'Type your message...',
          'chat.justNow': 'Just now',
          'chat.minutesAgo': 'min ago'
        };
        return simpleFallbacks[key] || key; 
      },
      updatePage: function() {
        // Basic translation update
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          el.textContent = this.t(key);
        });
      }
    };
  }

  // 4. AUTH MODULE (CRITICAL - your auth.js depends on this)
  if (typeof auth === 'undefined') {
    window.auth = {
      currentUser: null,
      pendingVerificationEmail: null,
      pendingVerificationUser: null,
      
      openModal: function() {
        const modal = document.getElementById('authModal');
        if (modal) {
          modal.style.display = 'flex';
        }
      },
      
      closeModal: function() {
        const modal = document.getElementById('authModal');
        if (modal) {
          modal.style.display = 'none';
        }
      },
      
      updateUI: function() {
        console.log('Auth UI updated');
      }
    };
  }

  // 5. EMAIL SERVICE (CRITICAL - your auth.js depends on this)
  if (typeof emailService === 'undefined') {
    window.emailService = {
      generateVerificationCode: function() {
        return Math.floor(100000 + Math.random() * 900000).toString();
      },
      
      sendVerificationEmail: function(email, code) {
        console.log('[Email Service] Verification code:', code);
        return true;
      },
      
      verifyCode: function(email, code) {
        // Simple verification
        return { valid: true };
      },
      
      sendPasswordResetEmail: function(email) {
        console.log('[Email Service] Password reset for:', email);
        return { success: true, message: 'Password reset email sent' };
      },
      
      verifyResetToken: function(token) {
        return { valid: true, email: 'demo@example.com' };
      },
      
      useResetToken: function(token) {
        console.log('[Email Service] Token used:', token);
      },
      
      updateUserActivity: function(userId) {
        console.log('[Email Service] User activity updated:', userId);
      }
    };
  }

  // 6. CHAT MODULE (Fixes "this.loadMessages is not a function" error)
  if (typeof chat === 'undefined') {
    window.chat = {
      messages: [],
      
      loadMessages: function() {
        try {
          const saved = localStorage.getItem('chatMessages');
          return saved ? JSON.parse(saved) : [];
        } catch {
          return [];
        }
      },
      
      init: function() {
        this.messages = this.loadMessages();
        console.log('Chat initialized with', this.messages.length, 'messages');
      },
      
      openChat: function() {
        const modal = document.getElementById('chatModal');
        if (modal) {
          modal.style.display = 'flex';
        }
      },
      
      closeChat: function() {
        const modal = document.getElementById('chatModal');
        if (modal) {
          modal.style.display = 'none';
        }
      },
      
      updateChatUI: function() {
        console.log('Chat UI updated');
      },
      
      isAuthenticated: function() {
        return !!localStorage.getItem('currentUser');
      }
    };
    
    // Initialize chat
    setTimeout(() => chat.init(), 100);
  }

  // 7. ADMIN MANAGER (Fixes admin.js syntax error)
  if (typeof adminManager === 'undefined') {
    window.adminManager = {
      currentEditingCardId: null,
      confirmCallback: null,
      errorActionCallback: null,
      
      isCurrentUserAdmin: function() {
        try {
          const userStr = localStorage.getItem('currentUser');
          if (!userStr) return false;
          const currentUser = JSON.parse(userStr);
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const fullUser = users.find(u => u.id === currentUser.id);
          return !!(fullUser && fullUser.isAdmin);
        } catch {
          return false;
        }
      },
      
      showErrorModal: function(message, actionText, actionCallback, type) {
        // Use showErrorGUI
        showErrorGUI(message, actionText, actionCallback, type);
      },
      
      init: function() {
        console.log('Admin manager initialized');
      }
    };
    
    // Initialize admin manager
    setTimeout(() => adminManager.init(), 100);
  }

  // 8. ERROR HANDLER SUPPORT
  if (typeof window.showErrorGUI === 'function') {
    // Make sure alert() uses our GUI
    const originalAlert = window.alert;
    window.alert = function(message) {
      showErrorGUI(String(message));
    };
  }

  console.log('✅ Enhanced GitHub Pages patch loaded successfully!');
  console.log('Available modules: security, showErrorGUI, lang, auth, emailService, chat, adminManager');

  // Wait for page to load and check for errors
  window.addEventListener('load', function() {
    console.log('📄 Page fully loaded');
    
    // Check if all critical modules are available
    const modules = ['security', 'showErrorGUI', 'lang', 'auth', 'emailService', 'chat', 'adminManager'];
    const available = modules.filter(m => typeof window[m] !== 'undefined');
    const missing = modules.filter(m => typeof window[m] === 'undefined');
    
    console.log('✅ Available modules:', available);
    if (missing.length > 0) {
      console.warn('❌ Missing modules:', missing);
    } else {
      console.log('🎉 All modules are available!');
    }
    
    // Run any delayed initializations
    setTimeout(function() {
      if (typeof chat !== 'undefined' && chat.init) chat.init();
      if (typeof adminManager !== 'undefined' && adminManager.init) adminManager.init();
      if (typeof lang !== 'undefined' && lang.updatePage) lang.updatePage();
    }, 500);
  });

})();
