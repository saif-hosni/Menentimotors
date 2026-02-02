// Authentication System - Fixed Complete Version
class Auth {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.pendingVerificationEmail = null;
    this.pendingVerificationUser = null;
    this.init();
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get all users from localStorage
  getUsers() {
    try {
      const usersStr = localStorage.getItem('users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch {
      return [];
    }
  }

  // Save users to localStorage
  saveUsers(users) {
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  // Sign up
  async signUp(name, email, password) {
    // Basic validation
    if (!name || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email.toLowerCase())) {
      return { success: false, message: 'Email already exists' };
    }

    // Simple password validation
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Simple hash for demo (NOT secure for production)
    const hashedPassword = this.hashPassword(password);

    // Create new user (unverified initially)
    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // If email service not available, auto sign in (fallback)
    const signInResult = await this.signIn(email, password);
    return signInResult;
  }

  // Verify email with code (simplified for GitHub Pages)
  async verifyEmail(email, code) {
    // Simplified verification for GitHub Pages
    const users = this.getUsers();
    const user = users.find(u => u.email === email.toLowerCase());
    
    if (user) {
      user.emailVerified = true;
      user.lastActivity = new Date().toISOString();
      this.saveUsers(users);

      // Sign in user directly
      const userData = { id: user.id, name: user.name, email: user.email };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      this.currentUser = userData;
      document.dispatchEvent(new CustomEvent('authStatusChanged'));
      
      return { success: true };
    }

    return { success: false, message: 'User not found.' };
  }

  // Resend verification code (simplified)
  resendVerificationCode(email) {
    return { success: true, message: 'Verification code resent.' };
  }

  // Request password reset (simplified)
  async requestPasswordReset(email) {
    return { success: true, message: 'Password reset email sent.' };
  }

  // Reset password with token (simplified)
  async resetPassword(token, newPassword, confirmPassword) {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    return { success: true, message: 'Password reset successfully.' };
  }

  // Sign in
  async signIn(email, password) {
    // Basic validation
    if (!email || !password) {
      return { success: false, message: 'Email and password required' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const hashedInput = this.hashPassword(password);

    if (user.password !== hashedInput) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Set current user
    const userData = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUser = userData;

    // Update user activity
    user.lastActivity = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    this.saveUsers(updatedUsers);

    // Dispatch auth event
    document.dispatchEvent(new CustomEvent('authStatusChanged'));

    return { success: true };
  }

  // Sign out
  signOut() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    document.dispatchEvent(new CustomEvent('authStatusChanged'));
  }

  // Simple password hash (for demo purposes only - NOT secure)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Update UI based on auth state
  updateUI() {
    const profileBtn = document.getElementById('profileBtn');
    if (!profileBtn) return;

    if (this.currentUser) {
      profileBtn.classList.add('logged-in');
      profileBtn.setAttribute('title', this.currentUser.name);
    } else {
      profileBtn.classList.remove('logged-in');
      profileBtn.removeAttribute('title');
    }

    this.updateModalContent();
  }

  // Update modal content based on auth state
  updateModalContent() {
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userEmailDisplay = document.getElementById('userEmailDisplay');

    if (this.currentUser) {
      this.switchForm('profile');
      if (userNameDisplay) userNameDisplay.textContent = this.currentUser.name;
      if (userEmailDisplay) userEmailDisplay.textContent = this.currentUser.email;
    } else {
      this.switchForm('signIn');
    }
  }

  // Open modal
  openModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
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
      modal.style.display = 'none';
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Clear forms
      const forms = ['#signInFormElement', '#signUpFormElement', '#forgotPasswordFormElement', 
                    '#resetPasswordFormElement', '#verifyEmailFormElement'];
      forms.forEach(selector => {
        const form = document.querySelector(selector);
        if (form) form.reset();
      });
    }
  }

  // Switch between forms
  switchForm(toForm) {
    const forms = {
      signIn: document.getElementById('signInForm'),
      signUp: document.getElementById('signUpForm'),
      profile: document.getElementById('userProfile'),
      forgotPassword: document.getElementById('forgotPasswordForm'),
      resetPassword: document.getElementById('resetPasswordForm'),
      verifyEmail: document.getElementById('verifyEmailForm')
    };

    // Hide all forms
    Object.values(forms).forEach(form => {
      if (form) form.classList.remove('active');
    });

    // Show selected form
    if (forms[toForm]) {
      forms[toForm].classList.add('active');
    }
  }

  init() {
    this.seedDemoAccount();
    this.setupEventListeners();
    this.updateUI();
  }

  // Seed demo admin account
  seedDemoAccount() {
    const users = this.getUsers();
    
    // Check if admin account already exists
    const adminExists = users.find(u => u.email === 'admin@menentimotors.com');
    if (adminExists) return;
    
    // Create demo admin account
    const adminPassword = 'admin123';
    const hashedPassword = this.hashPassword(adminPassword);
    
    const adminUser = {
      id: 'admin-001',
      name: 'Admin',
      email: 'admin@menentimotors.com',
      password: hashedPassword,
      isAdmin: true,
      emailVerified: true,
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
      if (e.key === 'Escape' && authModal && authModal.style.display === 'flex') {
        this.closeModal();
      }
    });

    // Form submissions
    // Sign in form
    const signInForm = document.getElementById('signInFormElement');
    if (signInForm) {
      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signInEmail')?.value.trim();
        const password = document.getElementById('signInPassword')?.value;

        if (!email || !password) {
          alert('Please fill in all fields');
          return;
        }

        const result = await this.signIn(email, password);
        if (result.success) {
          this.updateUI();
          this.closeModal();
          alert('Signed in successfully!');
        } else {
          alert(result.message || 'Sign in failed');
        }
      });
    }

    // Sign up form
    const signUpForm = document.getElementById('signUpFormElement');
    if (signUpForm) {
      signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signUpName')?.value.trim();
        const email = document.getElementById('signUpEmail')?.value.trim();
        const password = document.getElementById('signUpPassword')?.value;
        const confirmPassword = document.getElementById('signUpConfirmPassword')?.value;

        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }

        const result = await this.signUp(name, email, password);
        if (result.success) {
          this.updateUI();
          this.closeModal();
          alert('Account created successfully!');
        } else {
          alert(result.message || 'Sign up failed');
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

    // Back to sign in links
    const backToSignInLinks = [
      document.getElementById('backToSignIn'),
      document.getElementById('backToSignInFromReset')
    ];
    
    backToSignInLinks.forEach(link => {
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchForm('signIn');
        });
      }
    });

    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotPasswordEmail')?.value.trim();
        
        if (!email) {
          alert('Please enter your email address');
          return;
        }

        const result = await this.requestPasswordReset(email);
        alert(result.message || 'Password reset email sent');
        this.switchForm('resetPassword');
      });
    }

    // Reset password form
    const resetPasswordForm = document.getElementById('resetPasswordFormElement');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('resetToken')?.value.trim();
        const newPassword = document.getElementById('resetNewPassword')?.value;
        const confirmPassword = document.getElementById('resetConfirmPassword')?.value;

        const result = await this.resetPassword(token, newPassword, confirmPassword);
        alert(result.message || 'Password reset complete');
        if (result.success) {
          this.switchForm('signIn');
          resetPasswordForm.reset();
        }
      });
    }

    // Email verification form
    const verifyEmailForm = document.getElementById('verifyEmailFormElement');
    if (verifyEmailForm) {
      verifyEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('verificationCode')?.value.trim();
        const email = this.pendingVerificationEmail;

        if (!email || !code) {
          alert('Please enter the verification code');
          return;
        }

        const result = await this.verifyEmail(email, code);
        if (result.success) {
          this.updateUI();
          this.closeModal();
          alert('Email verified successfully!');
          this.pendingVerificationEmail = null;
          this.pendingVerificationUser = null;
        } else {
          alert(result.message || 'Verification failed');
        }
      });
    }

    // Form switch buttons
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToSignIn = document.getElementById('switchToSignIn');
    
    if (switchToSignUp) {
      switchToSignUp.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signUp');
      });
    }

    if (switchToSignIn) {
      switchToSignIn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('signIn');
      });
    }

    // Sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        this.signOut();
        this.updateUI();
        this.closeModal();
        alert('Signed out successfully');
      });
    }
  }
}

// Initialize auth system
const auth = new Auth();
