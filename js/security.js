// Security Module - Simplified & Cleaned (for static GitHub Pages site)
// Removed useless <meta> tag injections that cause console warnings

class Security {
  constructor() {
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.rateLimitWindow = 60 * 1000;      // 1 minute
    this.rateLimitMax = 10;               // Max requests per minute
    this.init();
  }

  init() {
    // No more meta tag injection – GitHub Pages already handles security headers
    this.loadFailedAttempts();
  }

  // Input sanitization (prevents XSS when rendering user input)
  sanitizeInput(input) {
    if (typeof input !== 'string') return String(input);
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Sanitize HTML content safely
  sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate password strength
  validatePassword(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (password.length > 128) {
      return { valid: false, message: 'Password is too long (max 128 characters)' };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase, one lowercase, and one number'
      };
    }

    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
      return { valid: false, message: 'Password is too common. Choose a stronger one.' };
    }

    return { valid: true };
  }

  // Validate name
  validateName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: 'Name is required' };
    }
    if (name.length > 100) {
      return { valid: false, message: 'Name is too long (max 100 characters)' };
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(name)) {
      return { valid: false, message: 'Name contains invalid characters' };
    }
    return { valid: true };
  }

  // Validate phone (basic)
  validatePhone(phone) {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, message: 'Phone number must contain only digits' };
    }
    if (cleaned.length < 7 || cleaned.length > 15) {
      return { valid: false, message: 'Phone number must be 7–15 digits' };
    }
    return { valid: true };
  }

  // Rate limiting (simple localStorage based)
  checkRateLimit(identifier) {
    const key = `rateLimit_${identifier}`;
    const now = Date.now();
    const attempts = this.getStoredData(key) || { count: 0, resetTime: now + this.rateLimitWindow };

    if (now > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = now + this.rateLimitWindow;
    }

    if (attempts.count >= this.rateLimitMax) {
      const waitTime = Math.ceil((attempts.resetTime - now) / 1000);
      return {
        allowed: false,
        message: `Too many requests. Wait ${waitTime} seconds.`
      };
    }

    attempts.count++;
    this.setStoredData(key, attempts);
    return { allowed: true };
  }

  // Track failed login attempts
  recordFailedAttempt(email) {
    const key = `failedAttempts_${this.hashString(email)}`;
    const attempts = this.getStoredData(key) || { count: 0, lockoutUntil: 0 };

    attempts.count++;

    if (attempts.count >= this.maxLoginAttempts) {
      attempts.lockoutUntil = Date.now() + this.lockoutDuration;
      attempts.count = 0; // Reset after lockout
    }

    this.setStoredData(key, attempts);
    return attempts;
  }

  // Check if locked
  isAccountLocked(email) {
    const key = `failedAttempts_${this.hashString(email)}`;
    const attempts = this.getStoredData(key);

    if (!attempts || !attempts.lockoutUntil) return { locked: false };

    if (Date.now() < attempts.lockoutUntil) {
      const remainingMinutes = Math.ceil((attempts.lockoutUntil - Date.now()) / 60000);
      return {
        locked: true,
        message: `Account locked. Try again in ${remainingMinutes} minute(s).`
      };
    }

    this.clearFailedAttempts(email);
    return { locked: false };
  }

  clearFailedAttempts(email) {
    const key = `failedAttempts_${this.hashString(email)}`;
    this.removeStoredData(key);
  }

  loadFailedAttempts() {
    const now = Date.now();
    const prefix = 'failedAttempts_';
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          const data = this.getStoredData(key);
          if (data?.lockoutUntil && now > data.lockoutUntil) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.error('Error cleaning expired lockouts:', e);
    }
  }

  // Simple hash (for local use only – not cryptographic)
  hashString(str) {
    let hash = 0;
    const salt = 'menenti_motors_2024';
    const salted = str + salt;
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32-bit
    }
    return Math.abs(hash).toString(16) + str.length.toString(16);
  }

  // Safe localStorage helpers
  getStoredData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return null;
    }
  }

  setStoredData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }

  removeStoredData(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
}

// Initialize security (global instance)
const security = new Security();
