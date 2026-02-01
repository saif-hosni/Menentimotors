// Authentication System
class Auth {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.pendingVerificationEmail = null;
    this.pendingVerificationUser = null;
    this.init();
  }

  // Get current user from localStorage
  getCurrentUser() {
    if (typeof security === 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    }
    return security.getStoredData('currentUser');
  }

  // Get all users from localStorage
  getUsers() {
    if (typeof security === 'undefined') {
      const usersStr = localStorage.getItem('users');
      return usersStr ? JSON.parse(usersStr) : [];
    }
    return security.getStoredData('users') || [];
  }

  // Save users to localStorage
  saveUsers(users) {
    if (typeof security !== 'undefined') {
      security.setStoredData('users', users);
    } else {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // Sign up
  async signUp(name, email, password) {
    // Security validation
    if (typeof security !== 'undefined') {
      // Validate inputs
      const nameValidation = security.validateName(name);
      if (!nameValidation.valid) {
        return { success: false, message: nameValidation.message };
      }

      if (!security.validateEmail(email)) {
        return { success: false, message: 'Invalid email format' };
      }

      const passwordValidation = security.validatePassword(password);
      if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message };
      }

      // Rate limiting
      const rateLimit = security.checkRateLimit('signup_' + email);
      if (!rateLimit.allowed) {
        return { success: false, message: rateLimit.message };
      }

      // Sanitize inputs
      name = security.sanitizeInput(name);
      email = security.sanitizeInput(email).toLowerCase();
    }

    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      if (typeof security !== 'undefined') {
        security.logSecurityEvent('signup_attempt_duplicate', { email });
      }
      return { success: false, message: 'auth.emailExists' };
    }

    // Hash password securely
    let hashedPassword;
    if (typeof security !== 'undefined') {
      hashedPassword = await security.hashPassword(password);
    } else {
      hashedPassword = this.hashPassword(password);
    }

    // Create new user (unverified initially)
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    if (typeof security !== 'undefined') {
      security.logSecurityEvent('user_created', { email, userId: newUser.id });
    }

    // Send verification email
    if (typeof emailService !== 'undefined') {
      const code = emailService.generateVerificationCode();
      emailService.sendVerificationEmail(email, code);
      
      // Store pending verification
      this.pendingVerificationEmail = email;
      this.pendingVerificationUser = newUser;
      
      return { success: true, requiresVerification: true, email: email };
    }

    // If email service not available, auto sign in (fallback)
    const signInResult = await this.signIn(email, password);
    return signInResult;
  }

  // Verify email with code
  async verifyEmail(email, code) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available.' };
    }

    const result = emailService.verifyCode(email, code);
    
    if (!result.valid) {
      return { success: false, message: result.message };
    }

    // Mark user as verified
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      user.emailVerified = true;
      user.lastActivity = new Date().toISOString();
      this.saveUsers(users);

      // Update user activity
      if (typeof emailService !== 'undefined') {
        emailService.updateUserActivity(user.id);
      }

      // Sign in user directly (they've verified their email)
      const userData = { id: user.id, name: user.name, email: user.email };
      if (typeof security !== 'undefined') {
        security.setStoredData('currentUser', userData);
      } else {
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
      this.currentUser = userData;
      document.dispatchEvent(new CustomEvent('authStatusChanged'));
      
      return { success: true };
    }

    return { success: false, message: 'User not found.' };
  }

  // Resend verification code
  resendVerificationCode(email) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available.' };
    }

    const code = emailService.generateVerificationCode();
    emailService.sendVerificationEmail(email, code);
    return { success: true, message: 'Verification code resent.' };
  }

  // Request password reset
  async requestPasswordReset(email) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available.' };
    }

    const result = emailService.sendPasswordResetEmail(email);
    return result;
  }

  // Reset password with token
  async resetPassword(token, newPassword, confirmPassword) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available.' };
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    // Validate password strength
    if (typeof security !== 'undefined') {
      const passwordValidation = security.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message };
      }
    } else {
      if (newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters.' };
      }
    }

    // Verify token
    const tokenResult = emailService.verifyResetToken(token);
    if (!tokenResult.valid) {
      return { success: false, message: tokenResult.message };
    }

    // Update password
    const users = this.getUsers();
    const user = users.find(u => u.email === tokenResult.email);
    
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Hash new password
    let hashedPassword;
    if (typeof security !== 'undefined') {
      hashedPassword = await security.hashPassword(newPassword);
    } else {
      hashedPassword = this.hashPassword(newPassword);
    }

    user.password = hashedPassword;
    user.lastActivity = new Date().toISOString();
    this.saveUsers(users);

    // Mark token as used
    emailService.useResetToken(token);

    return { success: true, message: 'Password reset successfully. You can now sign in.' };
  }

  // Sign in
  async signIn(email, password) {
    // Security checks
    if (typeof security !== 'undefined') {
      // Sanitize email
      email = security.sanitizeInput(email).toLowerCase();

      // Check rate limiting
      const rateLimit = security.checkRateLimit('signin_' + email);
      if (!rateLimit.allowed) {
        return { success: false, message: rateLimit.message };
      }

      // Check if account is locked
      const lockoutCheck = security.isAccountLocked(email);
      if (lockoutCheck.locked) {
        security.logSecurityEvent('login_attempt_locked', { email });
        return { success: false, message: lockoutCheck.message };
      }

      // Validate email format
      if (!security.validateEmail(email)) {
        return { success: false, message: 'Invalid email format' };
      }
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      if (typeof security !== 'undefined') {
        security.recordFailedAttempt(email);
        security.logSecurityEvent('login_attempt_failed', { email, reason: 'user_not_found' });
      }
      return { success: false, message: 'auth.invalidCredentials' };
    }

    // Hash password for comparison
    let hashedPassword;
    if (typeof security !== 'undefined') {
      hashedPassword = await security.hashPassword(password);
    } else {
      hashedPassword = this.hashPassword(password);
    }

    // Verify password
    if (user.password !== hashedPassword) {
      if (typeof security !== 'undefined') {
        security.recordFailedAttempt(email);
        security.logSecurityEvent('login_attempt_failed', { email, reason: 'invalid_password' });
      }
      return { success: false, message: 'auth.invalidCredentials' };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Send verification code if not already sent recently
      if (typeof emailService !== 'undefined') {
        const code = emailService.generateVerificationCode();
        emailService.sendVerificationEmail(email, code);
        this.pendingVerificationEmail = email;
        return { success: false, requiresVerification: true, message: 'Please verify your email first. A new verification code has been sent.' };
      }
    }

    // Clear failed attempts on successful login
    if (typeof security !== 'undefined') {
      security.clearFailedAttempts(email);
      security.logSecurityEvent('login_success', { email, userId: user.id });
    }

    // Update user activity
    if (typeof emailService !== 'undefined') {
      emailService.updateUserActivity(user.id);
    } else {
      user.lastActivity = new Date().toISOString();
      const users = this.getUsers();
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      this.saveUsers(updatedUsers);
    }

    // Set current user
    const userData = { id: user.id, name: user.name, email: user.email };
    if (typeof security !== 'undefined') {
      security.setStoredData('currentUser', userData);
    } else {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
    this.currentUser = userData;

    // Dispatch auth event
    document.dispatchEvent(new CustomEvent('authStatusChanged'));

    return { success: true };
  }

  // Sign out
  signOut() {
    if (this.currentUser && typeof security !== 'undefined') {
      security.logSecurityEvent('logout', { email: this.currentUser.email });
    }
    
    if (typeof security !== 'undefined') {
      security.removeStoredData('currentUser');
    } else {
      localStorage.removeItem('currentUser');
    }
    this.currentUser = null;
    
    // Dispatch auth event
    document.dispatchEvent(new CustomEvent('authStatusChanged'));
  }

  // Password hash (fallback if security module not available)
  hashPassword(password) {
    if (typeof security !== 'undefined') {
      // Use security module's sync hash as fallback
      return security.hashPasswordSync(password);
    }
    // Simple hash - fallback only
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Show error message
  showError(messageKey) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = lang ? lang.t(messageKey) : messageKey;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  // Show success message
  showSuccess(messageKey) {
    const successDiv = document.getElementById('authSuccess');
    if (successDiv) {
      successDiv.textContent = lang ? lang.t(messageKey) : messageKey;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }
  }

  // Update UI based on auth state
  updateUI() {
    const profileBtn = document.getElementById('profileBtn');
    if (!profileBtn) return;

    if (this.currentUser) {
      // User is logged in - show profile icon with indicator
      profileBtn.classList.add('logged-in');
      profileBtn.setAttribute('title', this.currentUser.name);
    } else {
      // User is not logged in
      profileBtn.classList.remove('logged-in');
      profileBtn.removeAttribute('title');
    }

    // Update modal content
    this.updateModalContent();
  }

  // Update modal content based on auth state
  updateModalContent() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const userProfile = document.getElementById('userProfile');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userEmailDisplay = document.getElementById('userEmailDisplay');

    if (this.currentUser) {
      // Show profile
      this.switchForm('profile');
      if (userNameDisplay) userNameDisplay.textContent = this.currentUser.name;
      if (userEmailDisplay) userEmailDisplay.textContent = this.currentUser.email;
    } else {
      // Show sign in form
      this.switchForm('signIn');
    }
  }

  // Open modal
  openModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.updateModalContent();
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Clear forms
      const forms = document.querySelectorAll('#signInFormElement, #signUpFormElement');
      forms.forEach(form => {
        if (form) form.reset();
      });
    }
  }

  // Switch between sign in and sign up
  switchForm(toForm) {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const userProfile = document.getElementById('userProfile');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const verifyEmailForm = document.getElementById('verifyEmailForm');

    // Hide all forms
    [signInForm, signUpForm, userProfile, forgotPasswordForm, resetPasswordForm, verifyEmailForm].forEach(form => {
      if (form) form.classList.remove('active');
    });

    // Show selected form
    if (toForm === 'signUp' && signUpForm) {
      signUpForm.classList.add('active');
    } else if (toForm === 'signIn' && signInForm) {
      signInForm.classList.add('active');
    } else if (toForm === 'forgotPassword' && forgotPasswordForm) {
      forgotPasswordForm.classList.add('active');
    } else if (toForm === 'resetPassword' && resetPasswordForm) {
      resetPasswordForm.classList.add('active');
    } else if (toForm === 'verifyEmail' && verifyEmailForm) {
      verifyEmailForm.classList.add('active');
    } else if (toForm === 'profile' && userProfile) {
      userProfile.classList.add('active');
    }
  }

  init() {
    // Seed demo admin account on first load
    this.seedDemoAccount();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  // Seed demo admin account
  seedDemoAccount() {
    const users = this.getUsers();
    
    // Check if admin account already exists
    const adminExists = users.find(u => u.email === 'admin@menentimotors.com');
    if (adminExists) return;
    
    // Create demo admin account
    // Note: In production, admin accounts should be created securely on the server
    const adminPassword = 'admin123';
    let hashedPassword;
    if (typeof security !== 'undefined') {
      // Use sync hash for seeding (security module handles async)
      hashedPassword = security.hashPasswordSync(adminPassword);
    } else {
      hashedPassword = this.hashPassword(adminPassword);
    }
    
    const adminUser = {
      id: 'admin-001',
      name: 'Admin',
      email: 'admin@menentimotors.com',
      password: hashedPassword,
      isAdmin: true,
      emailVerified: true, // Admin account is pre-verified
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    users.push(adminUser);
    this.saveUsers(users);
  }

  setupEventListeners() {
    const profileBtn = document.getElementById('profileBtn');
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');
    const signInFormElement = document.getElementById('signInFormElement');
    const signUpFormElement = document.getElementById('signUpFormElement');
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToSignIn = document.getElementById('switchToSignIn');
    const signOutBtn = document.getElementById('signOutBtn');

    // Profile button click
    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal();
      });
    }

    // Close modal
    if (authClose) {
      authClose.addEventListener('click', () => this.closeModal());
    }

    // Close on backdrop click
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          this.closeModal();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && authModal && authModal.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Switch to sign up
    if (switchToSignUp) {
      switchToSignUp.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signUp');
      });
    }

    // Switch to sign in
    if (switchToSignIn) {
      switchToSignIn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signIn');
      });
    }

    // Sign in form submit
    if (signInFormElement) {
      signInFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        let email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        // Basic validation
        if (!email || !password) {
          const errorMsg = lang ? lang.t('auth.invalidCredentials') : 'Please fill in all fields';
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(errorMsg);
          } else {
            alert(errorMsg);
          }
          return;
        }

        const result = await this.signIn(email, password);
        if (result.success) {
          this.updateUI();
          this.closeModal();
          if (lang) lang.updatePage(); // Update translations
          // Notify chat system that user signed in
          if (typeof chat !== 'undefined' && chat.updateChatUI) {
            chat.updateChatUI();
          }
        } else {
          if (result.requiresVerification) {
            // Show verification form
            this.switchForm('verifyEmail');
            const errorMsg = result.message || 'Please verify your email to continue.';
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI(errorMsg, null, null, 'success');
            }
          } else {
            const errorMsg = lang ? lang.t(result.message) : result.message;
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI(errorMsg);
            } else {
              alert(errorMsg);
            }
          }
        }
      });
    }

    // Sign up form submit
    if (signUpFormElement) {
      signUpFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        let name = document.getElementById('signUpName').value;
        let email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
          const errorMsg = lang ? lang.t('auth.passwordMismatch') : 'Passwords do not match';
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(errorMsg);
          } else {
            alert(errorMsg);
          }
          return;
        }

        // Use security module for validation if available
        if (typeof security !== 'undefined') {
          const passwordValidation = security.validatePassword(password);
          if (!passwordValidation.valid) {
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI(passwordValidation.message);
            } else {
              alert(passwordValidation.message);
            }
            return;
          }
        } else {
          // Fallback validation
          if (password.length < 8) {
            const errorMsg = lang ? lang.t('auth.passwordTooShort') : 'Password must be at least 8 characters';
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI(errorMsg);
            } else {
              alert(errorMsg);
            }
            return;
          }
        }

        const result = await this.signUp(name, email, password);
        if (result.success) {
          if (result.requiresVerification) {
            // Show verification form
            this.switchForm('verifyEmail');
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI('Please check your email for the verification code.', null, null, 'success');
            }
          } else {
            this.updateUI();
            this.closeModal();
            if (lang) lang.updatePage();
            if (typeof chat !== 'undefined' && chat.updateChatUI) {
              chat.updateChatUI();
            }
          }
        } else {
          const errorMsg = lang ? lang.t(result.message) : result.message;
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(errorMsg);
          } else {
            alert(errorMsg);
          }
        }
      });
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('forgotPassword');
      });
    }

    // Back to sign in from forgot password
    const backToSignIn = document.getElementById('backToSignIn');
    if (backToSignIn) {
      backToSignIn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signIn');
      });
    }

    // Forgot password form submit
    const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotPasswordEmail').value.trim();
        
        if (!email) {
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI('Please enter your email address.');
          }
          return;
        }

        const result = await this.requestPasswordReset(email);
        if (result.success) {
          // Show reset password form
          this.switchForm('resetPassword');
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(result.message, null, null, 'success');
          }
        } else {
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(result.message);
          }
        }
      });
    }

    // Reset password form submit
    const resetPasswordForm = document.getElementById('resetPasswordFormElement');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('resetToken').value.trim();
        const newPassword = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;

        const result = await this.resetPassword(token, newPassword, confirmPassword);
        if (result.success) {
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(result.message, null, null, 'success');
          }
          this.switchForm('signIn');
          resetPasswordForm.reset();
        } else {
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(result.message);
          }
        }
      });
    }

    // Back to sign in from reset password
    const backToSignInFromReset = document.getElementById('backToSignInFromReset');
    if (backToSignInFromReset) {
      backToSignInFromReset.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signIn');
      });
    }

    // Email verification form submit
    const verifyEmailForm = document.getElementById('verifyEmailFormElement');
    if (verifyEmailForm) {
      verifyEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('verificationCode').value.trim();
        const email = this.pendingVerificationEmail;

        if (!email || !code) {
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI('Please enter the verification code.');
          }
          return;
        }

        const result = await this.verifyEmail(email, code);
        if (result.success) {
          this.updateUI();
          this.closeModal();
          if (lang) lang.updatePage();
          if (typeof chat !== 'undefined' && chat.updateChatUI) {
            chat.updateChatUI();
          }
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI('Email verified successfully! You are now signed in.', null, null, 'success');
          }
          this.pendingVerificationEmail = null;
          this.pendingVerificationUser = null;
        } else {
          if (typeof showErrorGUI !== 'undefined') {
            showErrorGUI(result.message);
          }
        }
      });
    }

    // Resend verification code
    const resendVerificationCode = document.getElementById('resendVerificationCode');
    if (resendVerificationCode) {
      resendVerificationCode.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = this.pendingVerificationEmail;
        
        if (email) {
          const result = this.resendVerificationCode(email);
          if (result.success) {
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI(result.message, null, null, 'success');
            }
          } else {
            if (typeof showErrorGUI !== 'undefined') {
              showErrorGUI(result.message);
            }
          }
        }
      });
    }

    // Back to sign up from verification
    const backToSignUpFromVerify = document.getElementById('backToSignUpFromVerify');
    if (backToSignUpFromVerify) {
      backToSignUpFromVerify.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signUp');
      });
    }

    // Sign out
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        this.signOut();
        this.updateUI();
        this.closeModal();
        if (lang) lang.updatePage(); // Update translations
        // Close chat if open and update chat UI
        if (typeof chat !== 'undefined') {
          const chatModal = document.getElementById('chatModal');
          if (chatModal && chatModal.classList.contains('open')) {
            chat.closeChat();
          }
          if (chat.updateChatUI) {
            chat.updateChatUI();
          }
        }
      });
    }

    // Initial UI update
    this.updateUI();
  }
}

// Initialize auth system
const auth = new Auth();

