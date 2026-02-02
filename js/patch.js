// patch.js - Add this as the FIRST script in your HTML
(function() {
  'use strict';

  // Create fallback security module if it doesn't exist
  if (typeof security === 'undefined') {
    window.security = {
      // Basic fallback methods
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
      
      // Simple sanitization
      sanitizeInput: function(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>]/g, '');
      },
      
      // Basic validation
      validateEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      
      validatePassword: function(password) {
        if (password.length < 6) {
          return { valid: false, message: 'Password must be at least 6 characters' };
        }
        return { valid: true };
      },
      
      validateName: function(name) {
        if (name.length < 2) {
          return { valid: false, message: 'Name must be at least 2 characters' };
        }
        return { valid: true };
      },
      
      // Simple hash (for demo only)
      hashPassword: function(password) {
        return Promise.resolve('hashed_' + password);
      },
      
      hashPasswordSync: function(password) {
        return 'hashed_' + password;
      },
      
      // Rate limiting (simple fallback)
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

  // Create showErrorGUI if it doesn't exist
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

  // Make sure lang exists (it will be loaded from lang.js)
  if (typeof lang === 'undefined') {
    window.lang = {
      t: function(key) { return key; },
      updatePage: function() {}
    };
  }

  console.log('GitHub Pages patch loaded successfully');
})();