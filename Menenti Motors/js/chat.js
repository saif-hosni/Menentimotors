// Chat System
class Chat {
  constructor() {
    this.messages = this.loadMessages();
    this.init();
  }

  // Load messages from localStorage
  loadMessages() {
    const messagesStr = localStorage.getItem('chatMessages');
    return messagesStr ? JSON.parse(messagesStr) : [];
  }

  // Save messages to localStorage
  saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  // Add message
  addMessage(text, sender = 'user') {
    const message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(message);
    this.saveMessages();
    this.renderMessage(message);
    this.scrollToBottom();

    // Generate bot response after a delay
    if (sender === 'user') {
      setTimeout(() => this.generateBotResponse(text), 1000);
    }
  }

  // Generate bot response using keyword matching
  generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    // Simple response logic based on keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = lang ? lang.t('chat.response.greeting') : 'Hello! How can I assist you today?';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('€')) {
      response = lang ? lang.t('chat.response.price') : 'Our prices vary depending on the vehicle. Would you like to see our showroom?';
    } else if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('ferrari') || lowerMessage.includes('porsche') || lowerMessage.includes('aston')) {
      response = lang ? lang.t('chat.response.vehicle') : 'We have a great selection of luxury vehicles. Check out our showroom for details!';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      response = lang ? lang.t('chat.response.contact') : 'You can reach us through this chat, or visit our showroom. We\'re here to help!';
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = lang ? lang.t('chat.response.thanks') : 'You\'re welcome! Is there anything else I can help you with?';
    } else {
      response = lang ? lang.t('chat.response.default') : 'Thank you for your message. Our team will get back to you soon. Is there anything specific you\'d like to know?';
    }

    this.addMessage(response, 'bot');
  }

  // Render a single message
  renderMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${message.sender}`;
    messageDiv.setAttribute('data-message-id', message.id);

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (message.sender === 'user') {
      avatar.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="3.5" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>';
    } else {
      avatar.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="3.5" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>';
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    
    const text = document.createElement('p');
    text.textContent = message.text;
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = this.formatTime(message.timestamp);

    content.appendChild(text);
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
  }

  // Format timestamp
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return lang ? lang.t('chat.justNow') : 'Just now';
    } else if (minutes < 60) {
      return `${minutes} ${lang ? lang.t('chat.minutesAgo') : 'min ago'}`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Render all messages
  renderMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    // Clear existing messages (except welcome message)
    const welcomeMessage = messagesContainer.querySelector('.chat-message-bot:first-child');
    messagesContainer.innerHTML = '';
    if (welcomeMessage) {
      messagesContainer.appendChild(welcomeMessage);
    }

    // Render saved messages
    this.messages.forEach(message => {
      this.renderMessage(message);
    });

    this.scrollToBottom();
  }

  // Scroll to bottom
  scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Check if auth system exists and user is logged in
    if (typeof auth !== 'undefined' && auth.currentUser) {
      return true;
    }
    // Fallback: check localStorage directly
    const userStr = localStorage.getItem('currentUser');
    return userStr ? true : false;
  }

  // Open chat modal
  openChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Check if user is authenticated
    if (!this.isAuthenticated()) {
      this.showSignInPrompt();
      return;
    }

    this.renderMessages();
    this.updateChatUI();
    
    // Focus input
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 300);
  }

  // Show sign-in prompt in chat
  showSignInPrompt() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Hide chat interface, show sign-in prompt
    const chatMessages = document.getElementById('chatMessages');
    const chatInputContainer = document.querySelector('.chat-input-container');
    
    if (chatMessages) chatMessages.style.display = 'none';
    if (chatInputContainer) chatInputContainer.style.display = 'none';
    
    // Show sign-in prompt
    this.renderSignInPrompt();
  }

  // Render sign-in prompt
  renderSignInPrompt() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    // Remove existing prompt if any
    const existingPrompt = messagesContainer.querySelector('.sign-in-prompt');
    if (existingPrompt) existingPrompt.remove();

    const promptDiv = document.createElement('div');
    promptDiv.className = 'sign-in-prompt';
    promptDiv.innerHTML = `
      <div class="sign-in-prompt-content">
        <div class="sign-in-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h3 data-i18n="chat.signInRequired">Sign In Required</h3>
        <p data-i18n="chat.signInMessage">Please sign in to use the chat feature and contact our team.</p>
        <button id="chatSignInBtn" class="chat-sign-in-btn" data-i18n="chat.signIn">Sign In</button>
      </div>
    `;
    
    messagesContainer.style.display = 'block';
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(promptDiv);
    
    // Update translations
    if (typeof lang !== 'undefined') {
      lang.updatePage();
    }

    // Add event listener for sign-in button
    const signInBtn = document.getElementById('chatSignInBtn');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => {
        this.closeChat();
        // Open auth modal
        if (typeof auth !== 'undefined') {
          setTimeout(() => auth.openModal(), 300);
        }
      });
    }
  }

  // Update chat UI based on auth status
  updateChatUI() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    if (this.isAuthenticated()) {
      // Show chat interface
      if (chatMessages) chatMessages.style.display = 'flex';
      if (chatInputContainer) chatInputContainer.style.display = 'block';
      if (chatInput) chatInput.disabled = false;
      if (chatInput) chatInput.placeholder = lang ? lang.t('chat.placeholder') : 'Type your message...';
    } else {
      // Hide chat interface
      if (chatMessages) chatMessages.style.display = 'none';
      if (chatInputContainer) chatInputContainer.style.display = 'none';
      if (chatInput) chatInput.disabled = true;
    }
  }

  // Close chat modal
  closeChat() {
    const modal = document.getElementById('chatModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // Initialize chat system
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    const contactUsLinks = document.querySelectorAll('#contactUsLink, a[data-i18n="nav.contact"]');
    const chatClose = document.getElementById('chatClose');
    const chatModal = document.getElementById('chatModal');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    // Contact Us links - open chat
    contactUsLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openChat();
      });
    });

    // Close button
    if (chatClose) {
      chatClose.addEventListener('click', () => this.closeChat());
    }

    // Close on backdrop click
    if (chatModal) {
      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
          this.closeChat();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatModal && chatModal.classList.contains('open')) {
        this.closeChat();
      }
    });

    // Form submit
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Check authentication before sending message
        if (!this.isAuthenticated()) {
          this.showSignInPrompt();
          return;
        }
        
        const message = chatInput.value.trim();
        
        if (message) {
          this.addMessage(message, 'user');
          chatInput.value = '';
          chatInput.focus();
        }
      });
    }

    // Listen for auth state changes
    if (typeof auth !== 'undefined') {
      // Check auth status periodically (when user signs in/out)
      const checkAuthInterval = setInterval(() => {
        if (modal && modal.classList.contains('open')) {
          if (!this.isAuthenticated()) {
            this.showSignInPrompt();
          } else {
            // User just signed in, show chat interface
            const signInPrompt = document.querySelector('.sign-in-prompt');
            if (signInPrompt) {
              signInPrompt.remove();
              this.renderMessages();
              this.updateChatUI();
            }
          }
        }
      }, 1000);

      // Clean up interval when modal closes
      if (chatClose) {
        const originalClose = chatClose.onclick;
        chatClose.addEventListener('click', () => {
          clearInterval(checkAuthInterval);
          if (originalClose) originalClose();
        });
      }
    }

    // Update welcome message time on load
    const welcomeTime = document.querySelector('.chat-message-bot:first-child .message-time');
    if (welcomeTime) {
      welcomeTime.textContent = this.formatTime(new Date().toISOString());
    }
  }
}

// Initialize chat system
const chat = new Chat();

