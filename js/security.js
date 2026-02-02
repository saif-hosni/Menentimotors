// Security Module - Comprehensive Security Implementation
class Security {
  constructor() {
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000;
    this.rateLimitWindow = 60 * 1000;
    this.rateLimitMax = 10;
    this.FAILED_ATTEMPTS_PREFIX = 'failed_';
    this.RATE_LIMIT_PREFIX = 'rate_';
    this.init();
  }

  init() {
    this.setupSecurityHeaders();
    this.setupCSP();
    this.cleanupLockouts();
  }

  setupSecurityHeaders() {
    // Add security meta tags if not present
    if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'X-Content-Type-Options');
      meta.setAttribute('content', 'nosniff');
      document.head.appendChild(meta);
    }

    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'X-Frame-Options');
      meta.setAttribute('content', 'DENY');
      document.head.appendChild(meta);
    }

    if (!document.querySelector('meta[http-equiv="X-XSS-Protection"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'X-XSS-Protection');
      meta.setAttribute('content', '1; mode=block');
      document.head.appendChild(meta);
    }
  }

  setupCSP() {
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';");
      document.head.appendChild(meta);
    }
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return String(input);
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

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

    if (!hasUpper || !hasLower || !hasNumber) {
      return { 
        valid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }

    const common = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    const lowerPass = password.toLowerCase();
    if (common.some(weak => lowerPass.includes(weak))) {
      return { valid: false, message: 'Password is too common. Please choose a stronger password' };
    }

    return { valid: true };
  }

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

  validatePhone(phone) {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    
    const clean = phone.replace(/[\s\-\(\)\+]/g, '');
    
    if (!/^\d+$/.test(clean)) {
      return { valid: false, message: 'Phone number must contain only digits and formatting characters' };
    }
    
    if (clean.length < 7 || clean.length > 15) {
      return { valid: false, message: 'Phone number must be between 7 and 15 digits' };
    }

    return { valid: true };
  }

  checkRateLimit(id) {
    const key = `${this.RATE_LIMIT_PREFIX}${id}`;
    const now = Date.now();
    const attempts = this.getData(key) || { count: 0, reset: now + this.rateLimitWindow };

    if (now > attempts.reset) {
      attempts.count = 0;
      attempts.reset = now + this.rateLimitWindow;
    }

    if (attempts.count >= this.rateLimitMax) {
      const wait = Math.ceil((attempts.reset - now) / 1000);
      return { 
        allowed: false, 
        message: `Too many attempts. Please wait ${wait} seconds before trying again.` 
      };
    }

    attempts.count++;
    this.setData(key, attempts);
    return { allowed: true };
  }

  recordFailedAttempt(email) {
    const key = `${this.FAILED_ATTEMPTS_PREFIX}${this.hash(email)}`;
    const attempts = this.getData(key) || { count: 0, lockout: 0 };
    
    attempts.count++;
    
    if (attempts.count >= this.maxLoginAttempts) {
      attempts.lockout = Date.now() + this.lockoutDuration;
      attempts.count = 0;
    }

    this.setData(key, attempts);
    return attempts;
  }

  isAccountLocked(email) {
    const key = `${this.FAILED_ATTEMPTS_PREFIX}${this.hash(email)}`;
    const attempts = this.getData(key);
    
    if (!attempts || !attempts.lockout) {
      return { locked: false };
    }

    if (Date.now() < attempts.lockout) {
      const remaining = Math.ceil((attempts.lockout - Date.now()) / 60000);
      return { 
        locked: true, 
        message: `Account temporarily locked due to too many failed attempts. Please try again in ${remaining} minute(s).` 
      };
    }

    this.clearFailedAttempts(email);
    return { locked: false };
  }

  clearFailedAttempts(email) {
    const key = `${this.FAILED_ATTEMPTS_PREFIX}${this.hash(email)}`;
    this.removeData(key);
  }

  cleanupLockouts() {
    const now = Date.now();
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.FAILED_ATTEMPTS_PREFIX)) {
          const data = this.getData(key);
          if (data && data.lockout && now > data.lockout) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.error('Error cleaning up expired lockouts:', e);
    }
  }

  async hashPassword(password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const salt = this.getSalt();
      return this.hash(hashHex + salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      return this.hash(password);
    }
  }

  hashPasswordSync(password) {
    return this.hash(password);
  }

  hash(str) {
    let hash = 0;
    const salt = 'menenti_motors_2024';
    const salted = str + salt;
    
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16) + str.length.toString(16);
  }

  getSalt() {
    let salt = localStorage.getItem('app_salt');
    if (!salt) {
      salt = this.generateSalt();
      localStorage.setItem('app_salt', salt);
    }
    return salt;
  }

  generateSalt() {
    const arr = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  parseJSON(str, def = null) {
    try {
      if (!str || typeof str !== 'string') return def;
      return JSON.parse(str);
    } catch (e) {
      console.error('JSON parse error:', e);
      return def;
    }
  }

  getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? this.parseJSON(data) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  }

  setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
      if (e.name === 'QuotaExceededError') {
        this.cleanupStorage();
      }
    }
  }

  removeData(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }

  cleanupStorage() {
    const keep = ['users', 'currentUser', 'lang', 'app_salt'];
    const remove = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const shouldKeep = keep.includes(key) || 
                          key.startsWith(this.FAILED_ATTEMPTS_PREFIX) || 
                          key.startsWith(this.RATE_LIMIT_PREFIX);
        if (key && !shouldKeep) {
          remove.push(key);
        }
      }
      
      remove.slice(0, 10).forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error cleaning storage:', e);
    }
  }

  generateToken() {
    const token = this.generateSalt();
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  verifyToken(token) {
    const stored = sessionStorage.getItem('csrf_token');
    return stored && stored === token;
  }

  validateForm(formData) {
    const errors = {};
    const clean = {};

    for (const [field, value] of Object.entries(formData)) {
      if (value === null || value === undefined) continue;

      const trimmed = String(value).trim();
      clean[field] = this.sanitizeInput(trimmed);

      if (field.toLowerCase().includes('email')) {
        if (!this.validateEmail(clean[field])) {
          errors[field] = 'Invalid email format';
        }
      } else if (field.toLowerCase().includes('name')) {
        const nameCheck = this.validateName(clean[field]);
        if (!nameCheck.valid) {
          errors[field] = nameCheck.message;
        }
      } else if (field.toLowerCase().includes('phone') || field.toLowerCase().includes('contact')) {
        const emailValid = this.validateEmail(clean[field]);
        const phoneCheck = this.validatePhone(clean[field]);
        if (!emailValid && !phoneCheck.valid) {
          errors[field] = 'Please enter a valid email or phone number';
        }
      }

      if (clean[field].length > 1000) {
        errors[field] = 'Input is too long (max 1000 characters)';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      clean
    };
  }

  logEvent(event, details = {}) {
    const log = {
      event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      details
    };

    try {
      const logs = this.parseJSON(sessionStorage.getItem('security_logs') || '[]', []);
      logs.push(log);
      
      if (logs.length > 50) {
        logs.shift();
      }
      
      sessionStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error logging event:', e);
    }
  }
}

const security = new Security();
