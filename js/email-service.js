// Email Service - Simulated for GitHub Pages
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
    
    // For demo, we'll check every 5 minutes instead of 24 hours
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Load sent emails from storage
  loadSentEmails() {
    try {
      const emails = localStorage.getItem('sentEmails');
      return emails ? JSON.parse(emails) : [];
    } catch (e) {
      console.warn('Failed to load sent emails:', e);
      return [];
    }
  }

  // Save sent emails to storage
  saveSentEmails() {
    try {
      localStorage.setItem('sentEmails', JSON.stringify(this.sentEmails));
    } catch (e) {
      console.error('Error saving sent emails:', e);
    }
  }

  // Load pending verifications
  loadPendingVerifications() {
    try {
      const verifications = localStorage.getItem('pendingVerifications');
      return verifications ? JSON.parse(verifications) : {};
    } catch (e) {
      console.warn('Failed to load pending verifications:', e);
      return {};
    }
  }

  // Save pending verifications
  savePendingVerifications() {
    try {
      localStorage.setItem('pendingVerifications', JSON.stringify(this.pendingVerifications));
    } catch (e) {
      console.error('Error saving pending verifications:', e);
    }
  }

  // Load pending password resets
  loadPendingResets() {
    try {
      const resets = localStorage.getItem('pendingResets');
      return resets ? JSON.parse(resets) : {};
    } catch (e) {
      console.warn('Failed to load pending resets:', e);
      return {};
    }
  }

  // Save pending password resets
  savePendingResets() {
    try {
      localStorage.setItem('pendingResets', JSON.stringify(this.pendingResets));
    } catch (e) {
      console.error('Error saving pending resets:', e);
    }
  }

  // Generate verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  // Generate password reset token
  generateResetToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Send verification email (simulated)
  sendVerificationEmail(email, code) {
    const emailData = {
      to: email,
      subject: 'Verify Your Email - Menenti Motors',
      type: 'verification',
      code: code,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    // Store in pending verifications
    this.pendingVerifications[email] = {
      code: code,
      expiresAt: emailData.expiresAt,
      attempts: 0
    };
    this.savePendingVerifications();

    // Store in sent emails
    this.sentEmails.push(emailData);
    this.saveSentEmails();

    // For GitHub Pages demo - show code in alert
    console.log(`[EMAIL SERVICE] Verification code for ${email}: ${code}`);
    alert(`Verification code sent to ${email}:\n${code}\n\n(This is simulated - in production, check your real email)`);

    return true;
  }

  // Verify code
  verifyCode(email, code) {
    const verification = this.pendingVerifications[email];
    
    if (!verification) {
      return { valid: false, message: 'No verification code found for this email.' };
    }

    if (new Date() > new Date(verification.expiresAt)) {
      delete this.pendingVerifications[email];
      this.savePendingVerifications();
      return { valid: false, message: 'Verification code has expired. Please request a new one.' };
    }

    if (verification.attempts >= 5) {
      delete this.pendingVerifications[email];
      this.savePendingVerifications();
      return { valid: false, message: 'Too many failed attempts. Please request a new verification code.' };
    }

    if (verification.code !== code) {
      verification.attempts++;
      this.savePendingVerifications();
      return { valid: false, message: 'Invalid verification code. Please try again.' };
    }

    // Code is valid
    delete this.pendingVerifications[email];
    this.savePendingVerifications();
    return { valid: true };
  }

  // Send password reset email (simulated)
  sendPasswordResetEmail(email) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return { success: true, message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    const token = this.generateResetToken();
    const resetData = {
      email: email,
      token: token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      used: false
    };

    this.pendingResets[token] = resetData;
    this.savePendingResets();

    const emailData = {
      to: email,
      subject: 'Reset Your Password - Menenti Motors',
      type: 'password_reset',
      token: token,
      sentAt: new Date().toISOString()
    };

    this.sentEmails.push(emailData);
    this.saveSentEmails();

    // For GitHub Pages demo - show token in alert
    console.log(`[EMAIL SERVICE] Password reset token for ${email}: ${token}`);
    alert(`Password reset token for ${email}:\n${token}\n\n(Use this token in the reset password form)`);

    return { success: true, message: 'Password reset email sent.', token: token };
  }

  // Verify reset token
  verifyResetToken(token) {
    const reset = this.pendingResets[token];
    
    if (!reset) {
      return { valid: false, message: 'Invalid or expired reset token.' };
    }

    if (reset.used) {
      return { valid: false, message: 'This reset token has already been used.' };
    }

    if (new Date() > new Date(reset.expiresAt)) {
      delete this.pendingResets[token];
      this.savePendingResets();
      return { valid: false, message: 'Reset token has expired. Please request a new one.' };
    }

    return { valid: true, email: reset.email };
  }

  // Use reset token (mark as used)
  useResetToken(token) {
    if (this.pendingResets[token]) {
      this.pendingResets[token].used = true;
      this.savePendingResets();
    }
  }

  // Get users (helper method)
  getUsers() {
    try {
      const usersStr = localStorage.getItem('users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (e) {
      return [];
    }
  }

  // Update user last activity
  updateUserActivity(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      user.lastActivity = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // Clean up expired verifications and resets
  cleanupExpired() {
    const now = new Date();
    
    // Clean expired verifications
    Object.keys(this.pendingVerifications).forEach(email => {
      if (new Date(this.pendingVerifications[email].expiresAt) < now) {
        delete this.pendingVerifications[email];
      }
    });
    this.savePendingVerifications();

    // Clean expired resets
    Object.keys(this.pendingResets).forEach(token => {
      if (new Date(this.pendingResets[token].expiresAt) < now) {
        delete this.pendingResets[token];
      }
    });
    this.savePendingResets();
  }
}

// Initialize email service
const emailService = new EmailService();
