// Email Service - Simulates email sending and management
// In production, replace with real email provider (SendGrid, AWS SES, etc.)
class EmailService {
  constructor() {
    this.sentEmails = this.loadSentEmails();
    this.pendingVerifications = this.loadPendingVerifications();
    this.pendingResets = this.loadPendingResets();
    this.init();
  }

  init() {
    // Clean up expired items on startup
    this.cleanupExpired();
  }

  // Load / save helpers
  loadSentEmails() {
    try {
      const data = localStorage.getItem('sentEmails');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSentEmails() {
    try {
      localStorage.setItem('sentEmails', JSON.stringify(this.sentEmails));
    } catch (e) {
      console.error('Failed to save sent emails:', e);
    }
  }

  loadPendingVerifications() {
    try {
      const data = localStorage.getItem('pendingVerifications');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  savePendingVerifications() {
    try {
      localStorage.setItem('pendingVerifications', JSON.stringify(this.pendingVerifications));
    } catch (e) {
      console.error('Failed to save verifications:', e);
    }
  }

  loadPendingResets() {
    try {
      const data = localStorage.getItem('pendingResets');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  savePendingResets() {
    try {
      localStorage.setItem('pendingResets', JSON.stringify(this.pendingResets));
    } catch (e) {
      console.error('Failed to save resets:', e);
    }
  }

  // Generate 6-digit verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure reset token
  generateResetToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Send verification "email" (simulated)
  sendVerificationEmail(email, code) {
    const emailData = {
      to: email,
      subject: 'Verify Your Email - Menenti Motors',
      type: 'verification',
      code,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
    };

    // Store verification
    this.pendingVerifications[email] = {
      code,
      expiresAt: emailData.expiresAt,
      attempts: 0
    };
    this.savePendingVerifications();

    // Store in sent log
    this.sentEmails.push(emailData);
    this.saveSentEmails();

    // In real app: send actual email here
    // For demo: just log to console (no popup anymore)
    console.log(`[EMAIL] Verification code for ${email}: ${code}`);

    return true;
  }

  // Verify code
  verifyCode(email, code) {
    const verification = this.pendingVerifications[email];

    if (!verification) {
      return { valid: false, message: 'No verification code found.' };
    }

    if (new Date() > new Date(verification.expiresAt)) {
      delete this.pendingVerifications[email];
      this.savePendingVerifications();
      return { valid: false, message: 'Code expired. Request a new one.' };
    }

    if (verification.attempts >= 5) {
      delete this.pendingVerifications[email];
      this.savePendingVerifications();
      return { valid: false, message: 'Too many failed attempts. Request a new code.' };
    }

    if (verification.code !== code) {
      verification.attempts++;
      this.savePendingVerifications();
      return { valid: false, message: 'Invalid code. Try again.' };
    }

    // Success
    delete this.pendingVerifications[email];
    this.savePendingVerifications();
    return { valid: true };
  }

  // Send password reset "email" (simulated)
  sendPasswordResetEmail(email) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return { success: true, message: 'If an account exists, a reset link was sent.' };
    }

    const token = this.generateResetToken();
    const resetData = {
      email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      used: false
    };

    this.pendingResets[token] = resetData;
    this.savePendingResets();

    const emailData = {
      to: email,
      subject: 'Reset Your Password - Menenti Motors',
      type: 'password_reset',
      token,
      sentAt: new Date().toISOString()
    };

    this.sentEmails.push(emailData);
    this.saveSentEmails();

    // In real app: send email with link
    // For demo: log to console
    console.log(`[EMAIL] Password reset token for ${email}: ${token}`);

    return { success: true, message: 'Reset link sent (check console for demo token).', token };
  }

  // Verify reset token
  verifyResetToken(token) {
    const reset = this.pendingResets[token];

    if (!reset) {
      return { valid: false, message: 'Invalid or expired token.' };
    }

    if (reset.used) {
      return { valid: false, message: 'Token already used.' };
    }

    if (new Date() > new Date(reset.expiresAt)) {
      delete this.pendingResets[token];
      this.savePendingResets();
      return { valid: false, message: 'Token expired. Request a new one.' };
    }

    return { valid: true, email: reset.email };
  }

  // Mark token as used
  useResetToken(token) {
    if (this.pendingResets[token]) {
      this.pendingResets[token].used = true;
      this.savePendingResets();
    }
  }

  // Helper: get all users
  getUsers() {
    try {
      const data = localStorage.getItem('users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Clean up expired verifications and resets
  cleanupExpired() {
    const now = new Date();

    Object.keys(this.pendingVerifications).forEach(email => {
      if (new Date(this.pendingVerifications[email].expiresAt) < now) {
        delete this.pendingVerifications[email];
      }
    });
    this.savePendingVerifications();

    Object.keys(this.pendingResets).forEach(token => {
      if (new Date(this.pendingResets[token].expiresAt) < now) {
        delete this.pendingResets[token];
      }
    });
    this.savePendingResets();
  }
}

// Initialize
const emailService = new EmailService();
