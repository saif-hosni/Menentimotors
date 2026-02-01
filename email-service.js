// Email Service - Simulates email sending and management
// In production, this would connect to a real email service (SendGrid, AWS SES, etc.)

class EmailService {
  constructor() {
    this.sentEmails = this.loadSentEmails();
    this.pendingVerifications = this.loadPendingVerifications();
    this.pendingResets = this.loadPendingResets();
    this.init();
  }

  init() {
    // Check for inactive users weekly
    this.checkInactiveUsers();
    
    // Set up interval to check weekly (every 24 hours for demo, in production would be weekly)
    setInterval(() => {
      this.checkInactiveUsers();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Load sent emails from storage
  loadSentEmails() {
    try {
      const emails = localStorage.getItem('sentEmails');
      return emails ? JSON.parse(emails) : [];
    } catch (e) {
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

  // Send verification email
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

    // In production, this would actually send an email
    // For demo, we'll show the code in console and store it
    console.log(`[EMAIL SERVICE] Verification code for ${email}: ${code}`);
    
    // Show code to user in development (remove in production)
    if (typeof showErrorGUI !== 'undefined') {
      showErrorGUI(
        `Verification code sent to ${email}. Code: ${code} (This is for demo - in production, check your email)`,
        null,
        null,
        'success'
      );
    }

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

  // Send password reset email
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

    // In production, this would send an email with a link like:
    // https://menentimotors.com/reset-password?token=TOKEN
    console.log(`[EMAIL SERVICE] Password reset token for ${email}: ${token}`);
    
    // For demo, show the token
    if (typeof showErrorGUI !== 'undefined') {
      showErrorGUI(
        `Password reset link sent to ${email}. Token: ${token} (This is for demo - in production, check your email)`,
        null,
        null,
        'success'
      );
    }

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
      user.lastEmailReminder = user.lastEmailReminder || null;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // Check for inactive users and send reminder emails
  checkInactiveUsers() {
    const users = this.getUsers();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    users.forEach(user => {
      // Skip if user is not logged in (no email)
      if (!user.email) return;

      const lastActivity = user.lastActivity ? new Date(user.lastActivity) : new Date(user.createdAt);
      const lastReminder = user.lastEmailReminder ? new Date(user.lastEmailReminder) : null;

      // Check if user has been inactive for at least a week
      if (lastActivity < oneWeekAgo) {
        // Check if we've sent a reminder in the last week
        const shouldSendReminder = !lastReminder || 
          (new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) > lastReminder);

        if (shouldSendReminder) {
          this.sendWelcomeBackEmail(user.email, user.name);
          
          // Update last reminder date
          user.lastEmailReminder = now.toISOString();
          const updatedUsers = users.map(u => 
            u.id === user.id ? user : u
          );
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
      }
    });
  }

  // Send "we miss you" email
  sendWelcomeBackEmail(email, name) {
    const emailData = {
      to: email,
      subject: 'We Miss You at Menenti Motors!',
      type: 'welcome_back',
      sentAt: new Date().toISOString()
    };

    this.sentEmails.push(emailData);
    this.saveSentEmails();

    // In production, this would send an actual email
    console.log(`[EMAIL SERVICE] Welcome back email sent to ${email} (${name})`);
    
    // For demo purposes, we'll just log it
    // In production, this would trigger an actual email send
  }

  // Get email history for a user (for admin/debugging)
  getEmailHistory(email) {
    return this.sentEmails.filter(email => email.to === email);
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

// Clean up expired items on load
emailService.cleanupExpired();

