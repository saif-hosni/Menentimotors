// Security Module - Comprehensive Security Implementation
class Security {
  constructor() {
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.rateLimitWindow = 60 * 1000; // 1 minute
    this.rateLimitMax = 10; // Max requests per window
    this.init();
  }

  init() {
    this.setupSecurityHeaders();
    this.setupCSP();
    this.loadFailedAttempts();
  }

  // Setup security headers via meta tags (for static sites)
  setupSecurityHeaders() {
    // Add security meta tags if not present
    if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
      const meta1 = document.createElement('meta');
      meta1.setAttribute('http-equiv', 'X-Content-Type-Options');
      meta1.setAttribute('content', 'nosniff');
      document.head.appendChild(meta1);
    }

    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      const meta2 = document.createElement('meta');
      meta2.setAttribute('http-equiv', 'X-Frame-Options');
      meta2.setAttribute('content', 'DENY');
      document.head.appendChild(meta2);
    }

    if (!document.querySelector('meta[http-equiv="X-XSS-Protection"]')) {
      const meta3 = document.createElement('meta');
      meta3.setAttribute('http-equiv', 'X-XSS-Protection');
      meta3.setAttribute('content', '1; mode=block');
      document.head.appendChild(meta3);
    }
  }

  // Content Security Policy
  setupCSP() {
    // Note: CSP should ideally be set via HTTP headers on the server
    // This is a fallback for static sites
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const csp = document.createElement('meta');
      csp.setAttribute('http-equiv', 'Content-Security-Policy');
      csp.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';");
      document.head.appendChild(csp);
    }
  }

  // Input sanitization to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return String(input);
    }
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Sanitize HTML content (for safe HTML rendering)
  sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  // Validate email format
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

    // Check for at least one uppercase, one lowercase, one number
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      return { 
        valid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some(weak => lowerPassword.includes(weak))) {
      return { valid: false, message: 'Password is too common. Please choose a stronger password' };
    }

    return { valid: true };
  }

  // Validate name (alphanumeric, spaces, hyphens, apostrophes)
  validateName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: 'Name is required' };
    }
    
    if (name.length > 100) {
      return { valid: false, message: 'Name is too long (max 100 characters)' };
    }

    // Allow letters, spaces, hyphens, apostrophes, and common international characters
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(name)) {
      return { valid: false, message: 'Name contains invalid characters' };
    }

    return { valid: true };
  }

  // Validate phone number (basic validation)
  validatePhone(phone) {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Check if it's all digits and reasonable length
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, message: 'Phone number must contain only digits and formatting characters' };
    }
    
    if (cleaned.length < 7 || cleaned.length > 15) {
      return { valid: false, message: 'Phone number must be between 7 and 15 digits' };
    }

    return { valid: true };
  }

  // Rate limiting for authentication attempts
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
        message: `Too many attempts. Please wait ${waitTime} seconds before trying again.` 
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
      attempts.count = 0; // Reset counter after lockout
    }

    this.setStoredData(key, attempts);
    return attempts;
  }

  // Check if account is locked
  isAccountLocked(email) {
    const key = `failedAttempts_${this.hashString(email)}`;
    const attempts = this.getStoredData(key);
    
    if (!attempts || !attempts.lockoutUntil) {
      return { locked: false };
    }

    if (Date.now() < attempts.lockoutUntil) {
      const remainingMinutes = Math.ceil((attempts.lockoutUntil - Date.now()) / 60000);
      return { 
        locked: true, 
        message: `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute(s).` 
      };
    }

    // Lockout expired, clear it
    this.clearFailedAttempts(email);
    return { locked: false };
  }

  // Clear failed attempts (on successful login)
  clearFailedAttempts(email) {
    const key = `failedAttempts_${this.hashString(email)}`;
    this.removeStoredData(key);
  }

  // Load failed attempts from storage
  loadFailedAttempts() {
    // Clean up expired lockouts on init
    const prefix = 'failedAttempts_';
    const now = Date.now();
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const data = this.getStoredData(key);
          if (data && data.lockoutUntil && now > data.lockoutUntil) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.error('Error cleaning up expired lockouts:', e);
    }
  }

  // Improved password hashing (using Web Crypto API)
  async hashPassword(password) {
    try {
      // Convert password to ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      
      // Hash using SHA-256 (in production, use bcrypt or Argon2 on server)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Add salt (in production, use unique salt per password)
      const salt = this.getSalt();
      return this.hashString(hashHex + salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      // Fallback to simple hash if Web Crypto not available
      return this.hashString(password);
    }
  }

  // Synchronous password hash (fallback)
  hashPasswordSync(password) {
    return this.hashString(password);
  }

  // Hash string (simple but better than original)
  hashString(str) {
    let hash = 0;
    const salt = 'menenti_motors_2024';
    const saltedStr = str + salt;
    
    for (let i = 0; i < saltedStr.length; i++) {
      const char = saltedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Add additional complexity
    return Math.abs(hash).toString(16) + str.length.toString(16);
  }

  // Get salt from storage or generate
  getSalt() {
    let salt = localStorage.getItem('app_salt');
    if (!salt) {
      salt = this.generateSalt();
      localStorage.setItem('app_salt', salt);
    }
    return salt;
  }

  // Generate random salt
  generateSalt() {
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Secure JSON parse with error handling
  safeJSONParse(str, defaultValue = null) {
    try {
      if (!str || typeof str !== 'string') {
        return defaultValue;
      }
      return JSON.parse(str);
    } catch (e) {
      console.error('JSON parse error:', e);
      return defaultValue;
    }
  }

  // Secure localStorage operations
  getStoredData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? this.safeJSONParse(data) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  }

  setStoredData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
      // Handle quota exceeded error
      if (e.name === 'QuotaExceededError') {
        this.clearOldData();
      }
    }
  }

  removeStoredData(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }

  // Clear old/expired data to free space
  clearOldData() {
    const keysToKeep = ['users', 'currentUser', 'lang', 'app_salt'];
    const keysToRemove = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key) && !key.startsWith('failedAttempts_') && !key.startsWith('rateLimit_')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove oldest data first
      keysToRemove.slice(0, 10).forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error clearing old data:', e);
    }
  }

  // CSRF token generation
  generateCSRFToken() {
    const token = this.generateSalt();
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  // Verify CSRF token
  verifyCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken && storedToken === token;
  }

  // Validate and sanitize all form inputs
  validateFormInputs(inputs) {
    const errors = {};
    const sanitized = {};

    for (const [key, value] of Object.entries(inputs)) {
      if (value === null || value === undefined) {
        continue;
      }

      const trimmed = String(value).trim();
      sanitized[key] = this.sanitizeInput(trimmed);

      // Specific validations based on field type
      if (key.toLowerCase().includes('email')) {
        const emailValidation = this.validateEmail(sanitized[key]);
        if (!emailValidation) {
          errors[key] = 'Invalid email format';
        }
      } else if (key.toLowerCase().includes('password')) {
        // Password validation handled separately
      } else if (key.toLowerCase().includes('name')) {
        const nameValidation = this.validateName(sanitized[key]);
        if (!nameValidation.valid) {
          errors[key] = nameValidation.message;
        }
      } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('contact')) {
        // Allow both email and phone for contact
        if (!this.validateEmail(sanitized[key]).valid && !this.validatePhone(sanitized[key]).valid) {
          errors[key] = 'Please enter a valid email or phone number';
        }
      }

      // Length checks
      if (sanitized[key].length > 1000) {
        errors[key] = 'Input is too long (max 1000 characters)';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      sanitized
    };
  }

  // Log security events (for monitoring)
  logSecurityEvent(event, details = {}) {
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      details
    };

    // In production, send to logging service
    // For now, store in sessionStorage (limited space)
    try {
      const logs = this.safeJSONParse(sessionStorage.getItem('security_logs') || '[]', []);
      logs.push(logEntry);
      
      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.shift();
      }
      
      sessionStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error logging security event:', e);
    }
  }
}

// Initialize security system
const security = new Security();

