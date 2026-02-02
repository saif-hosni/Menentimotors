// Chat System
class Chat {
  constructor() {
    this.messages = this.loadMessages();
    this.init();
  }

  // ADD THIS MISSING METHOD:
  loadMessages() {
    try {
      const saved = localStorage.getItem('chatMessages');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // ADD THIS METHOD TOO (for saving messages):
  saveMessages() {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  // Add a new message
  addMessage(text, sender = 'user') {
    const message = {
      id: Date.now(),
      text,
      sender,
      time: new Date().toISOString()
    };
    
    this.messages.push(message);
    this.saveMessages();
    this.renderMessage(message);
    this.scrollToBottom();

    // Generate bot response if user sent message
    if (sender === 'user') {
      setTimeout(() => {
        this.generateBotResponse(text);
      }, 1000);
    }
  }

  // Generate bot response
  generateBotResponse(userMessage) {
    let response = "Thank you for your message. Our team will get back to you soon.";
    
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('€')) {
      response = "For pricing details on specific vehicles, please visit our showroom or contact our sales team directly.";
    } else if (lowerMsg.includes('available') || lowerMsg.includes('stock')) {
      response = "Our inventory is constantly updated. Check the showroom page for current availability.";
    } else if (lowerMsg.includes('test drive') || lowerMsg.includes('drive')) {
      response = "Test drives can be arranged by appointment. Please contact us to schedule one.";
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone')) {
      response = "You can reach us at info@menentimotors.com or call +39 123 456 7890.";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      response = "Hello! How can I assist you today?";
    }
    
    this.addMessage(response, 'bot');
  }

  // Render a single message
  renderMessage(message) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${message.sender}`;
    
    const time = new Date(message.time);
    const formattedTime = this.formatTime(time);
    
    const avatarSvg = message.sender === 'user' ? 
      `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" />
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">YOU</text>
      </svg>` :
      `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;

    messageDiv.innerHTML = `
      <div class="message-avatar">
        ${avatarSvg}
      </div>
      <div class="message-content">
        <p>${this.escapeHtml(message.text)}</p>
        <span class="message-time">${formattedTime}</span>
      </div>
    `;
    
    container.appendChild(messageDiv);
  }

  // Format time for display
  formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Escape HTML for safety
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Scroll to bottom of chat
  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.innerHTML = '';

    // Add welcome message
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'chat-message chat-message-bot';
    welcomeDiv.innerHTML = `
      <div class="message-avatar">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="message-content">
        <p>Hello! How can we help you today?</p>
        <span class="message-time">Just now</span>
      </div>
    `;
    container.appendChild(welcomeDiv);

    // Render saved messages
    this.messages.forEach(msg => this.renderMessage(msg));
    this.scrollToBottom();
  }

  // NEW: Show sign-in prompt without destroying the chat structure
  showSignInPrompt() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    // Create overlay if not exists
    let promptOverlay = modal.querySelector('.sign-in-overlay');
    if (!promptOverlay) {
      promptOverlay = document.createElement('div');
      promptOverlay.className = 'sign-in-overlay';
      promptOverlay.innerHTML = `
        <div class="sign-in-prompt">
          <div class="sign-in-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Sign In Required</h3>
          <p>Please sign in to use the chat feature and contact our team.</p>
          <button id="chatSignInBtn" class="chat-sign-in-btn">Sign In</button>
        </div>
      `;
      modal.appendChild(promptOverlay);
    }

    // Show overlay
    promptOverlay.style.display = 'flex';

    // Hide chat input
    const inputContainer = document.querySelector('.chat-input-container');
    if (inputContainer) inputContainer.style.display = 'none';

    // Add sign-in button handler
    const signInBtn = document.getElementById('chatSignInBtn');
    if (signInBtn) {
      // Remove old listeners to avoid duplicates
      signInBtn.replaceWith(signInBtn.cloneNode(true));
      const newBtn = document.getElementById('chatSignInBtn');
      newBtn.addEventListener('click', () => {
        this.closeChat();
        if (typeof auth !== 'undefined' && auth.openModal) {
          auth.openModal();
        }
      });
    }
  }

  // NEW: Hide sign-in prompt and show chat
  hideSignInPrompt() {
    const overlay = document.querySelector('.sign-in-overlay');
    if (overlay) overlay.style.display = 'none';

    const inputContainer = document.querySelector('.chat-input-container');
    if (inputContainer) inputContainer.style.display = 'block';
  }

  openChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!this.isAuthenticated()) {
      this.showSignInPrompt();
    } else {
      this.hideSignInPrompt();
      this.renderMessages();
    }

    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input && this.isAuthenticated()) input.focus();
    }, 300);
  }

  closeChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    modal.style.display = 'none';
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Chat close button
    const chatCloseBtn = document.getElementById('chatClose');
    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', () => this.closeChat());
    }

    // Contact Us link (opens chat)
    const contactLink = document.getElementById('contactUsLink');
    if (contactLink) {
      contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openChat();
      });
    }

    // Chat form submission
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        if (input && input.value.trim()) {
          this.addMessage(input.value.trim(), 'user');
          input.value = '';
        }
      });
    }

    // Close chat when clicking outside
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
          this.closeChat();
        }
      });
    }

    // Close chat with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatModal && chatModal.style.display === 'flex') {
        this.closeChat();
      }
    });
  }

  isAuthenticated() {
    return !!localStorage.getItem('currentUser');
  }
}

// Initialize
const chat = new Chat();
