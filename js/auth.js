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
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get all users
  getUsers() {
    try {
      const usersStr = localStorage.getItem('users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch {
      return [];
    }
  }

  // Save users
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

    // Check if email exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already exists' };
    }

    // Simple password check (fallback if security module missing)
    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters' };
    }

    // Hash password (use security if available)
    let hashedPassword = password;
    if (typeof security !== 'undefined' && security.hashPassword) {
      hashedPassword = await security.hashPassword(password);
    }

    // Create new user
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

    // Send verification if emailService exists
    if (typeof emailService !== 'undefined') {
      const code = emailService.generateVerificationCode();
      emailService.sendVerificationEmail(email, code);

      this.pendingVerificationEmail = email;
      this.pendingVerificationUser = newUser;

      return { success: true, requiresVerification: true, email };
    }

    // Fallback: auto sign in if no email service
    return await this.signIn(email, password);
  }

  // Verify email
  async verifyEmail(email, code) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available' };
    }

    const result = emailService.verifyCode(email, code);
    if (!result.valid) {
      return { success: false, message: result.message };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    user.emailVerified = true;
    user.lastActivity = new Date().toISOString();
    this.saveUsers(users);

    // Auto sign in after verification
    const userData = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUser = userData;

    document.dispatchEvent(new CustomEvent('authStatusChanged'));

    return { success: true };
  }

  // Resend verification code
  resendVerificationCode(email) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available' };
    }

    const code = emailService.generateVerificationCode();
    emailService.sendVerificationEmail(email, code);
    return { success: true, message: 'New code sent' };
  }

  // Request password reset
  async requestPasswordReset(email) {
    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available' };
    }

    const result = emailService.sendPasswordResetEmail(email);
    return result;
  }

  // Reset password
  async resetPassword(token, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters' };
    }

    if (typeof emailService === 'undefined') {
      return { success: false, message: 'Email service not available' };
    }

    const tokenResult = emailService.verifyResetToken(token);
    if (!tokenResult.valid) {
      return { success: false, message: tokenResult.message };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === tokenResult.email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let hashedPassword = newPassword;
    if (typeof security !== 'undefined' && security.hashPassword) {
      hashedPassword = await security.hashPassword(newPassword);
    }

    user.password = hashedPassword;
    user.lastActivity = new Date().toISOString();
    this.saveUsers(users);

    emailService.useResetToken(token);

    return { success: true, message: 'Password reset successfully' };
  }

  // Sign in
  async signIn(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Email and password required' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    let hashedInput = password;
    if (typeof security !== 'undefined' && security.hashPassword) {
      hashedInput = await security.hashPassword(password);
    }

    if (user.password !== hashedInput) {
      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.emailVerified) {
      if (typeof emailService !== 'undefined') {
        const code = emailService.generateVerificationCode();
        emailService.sendVerificationEmail(email, code);
        this.pendingVerificationEmail = email;
        return { success: false, requiresVerification: true, message: 'Please verify your email' };
      }
    }

    const userData = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUser = userData;

    user.lastActivity = new Date().toISOString();
    this.saveUsers(users);

    document.dispatchEvent(new CustomEvent('authStatusChanged'));

    return { success: true };
  }

  // Sign out
  signOut() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    document.dispatchEvent(new CustomEvent('authStatusChanged'));
  }

  // Open auth modal
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
    }
  }

  // Switch between forms
  switchForm(formName) {
    const forms = {
      signIn: document.getElementById('signInForm'),
      signUp: document.getElementById('signUpForm'),
      profile: document.getElementById('userProfile'),
      forgotPassword: document.getElementById('forgotPasswordForm'),
      resetPassword: document.getElementById('resetPasswordForm'),
      verifyEmail: document.getElementById('verifyEmailForm')
    };

    Object.values(forms).forEach(f => {
      if (f) f.classList.remove('active');
    });

    if (forms[formName]) {
      forms[formName].classList.add('active');
    }
  }

  // Update modal UI based on auth state
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

  init() {
    this.seedDemoAccount();
    this.setupEventListeners();
    this.updateModalContent();
  }

  // Seed demo admin account (only once)
  seedDemoAccount() {
    const users = this.getUsers();
    if (users.find(u => u.email === 'admin@menentimotors.com')) return;

    const adminPassword = 'admin123';
    let hashedPassword = adminPassword;
    if (typeof security !== 'undefined' && security.hashPasswordSync) {
      hashedPassword = security.hashPasswordSync(adminPassword);
    }

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

  // Setup all event listeners
  setupEventListeners() {
    const profileBtn = document.getElementById('profileBtn');
    const authClose = document.getElementById('authClose');
    const authModal = document.getElementById('authModal');

    // Open modal on profile click
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
        if (e.target === authModal) this.closeModal();
      });
    }

    // Escape key close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && authModal?.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Form submissions (sign in, sign up, etc.)
    const signInForm = document.getElementById('signInFormElement');
    if (signInForm) {
      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signInEmail')?.value.trim();
        const password = document.getElementById('signInPassword')?.value;
        if (!email || !password) return;

        const result = await this.signIn(email, password);
        if (result.success) {
          this.updateModalContent();
          this.closeModal();
        } else {
          alert(result.message || 'Sign in failed');
        }
      });
    }

    // Add similar listeners for signUpFormElement, forgotPasswordFormElement, resetPasswordFormElement, verifyEmailFormElement...
    // (you can copy-paste the pattern from your original code if you want them back)
  }
}

// Initialize
const auth = new Auth();
