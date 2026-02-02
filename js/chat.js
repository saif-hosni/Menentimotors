class Chat {
  constructor() {
    this.messages = this.loadMessages();
    this.init();
  }

  // Load messages from localStorage
  loadMessages() {
    try {
      const messagesStr = localStorage.getItem('chatMessages');
      return messagesStr ? JSON.parse(messagesStr) : [];
    } catch (e) {
      console.error('Failed to load chat messages:', e);
      return [];
    }
  }

  // Save messages to localStorage
  saveMessages() {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Failed to save chat messages:', e);
    }
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

    // Generate bot response after delay
    if (sender === 'user') {
      setTimeout(() => this.generateBotResponse(text), 800);
    }
  }

  // Simple keyword-based bot response
  generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    let response = "Thank you for your message. How can I assist you today?";

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! How can I assist you today?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('€')) {
      response = "Our prices vary depending on the vehicle. Would you like to see our showroom?";
    } else if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || 
               lowerMessage.includes('ferrari') || lowerMessage.includes('porsche') || 
               lowerMessage.includes('aston')) {
      response = "We have a great selection of luxury vehicles. Check out our showroom for details!";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || 
               lowerMessage.includes('email')) {
      response = "You can reach us through this chat, or visit our showroom. We're here to help!";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = "You're welcome! Is there anything else I can help you with?";
    }

    this.addMessage(response, 'bot');
  }

  // Render a single message
  renderMessage(message) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${message.sender}`;
    messageDiv.setAttribute('data-message-id', message.id);

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;

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
    container.appendChild(messageDiv);
  }

  // Format timestamp
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Render all saved messages
  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.innerHTML = ''; // Clear first

    // Add welcome message
    this.addMessage("Hello! How can we help you today?", 'bot');

    // Render saved messages (excluding welcome)
    this.messages.forEach(msg => this.renderMessage(msg));
    this.scrollToBottom();
  }

  // Scroll to bottom
  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Check if user is logged in
  isAuthenticated() {
    // Try to use global auth object if it exists
    if (typeof auth !== 'undefined' && auth?.currentUser) {
      return true;
    }
    // Fallback to localStorage
    return !!localStorage.getItem('currentUser');
  }

  // Open chat modal
  openChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!this.isAuthenticated()) {
      this.showSignInPrompt();
    } else {
      this.renderMessages();
    }

    // Focus input after a small delay
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 300);
  }

  // Show sign-in prompt instead of chat
  showSignInPrompt() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.innerHTML = `
      <div class="sign-in-prompt">
        <div class="sign-in-prompt-content">
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
      </div>
    `;

    const signInBtn = document.getElementById('chatSignInBtn');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => {
        this.closeChat();
        // Open auth modal if auth system exists
        if (typeof auth !== 'undefined' && typeof auth.openModal === 'function') {
          setTimeout(() => auth.openModal(), 300);
        }
      });
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

  // Initialize
  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const chatClose = document.getElementById('chatClose');
    const chatModal = document.getElementById('chatModal');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const contactLinks = document.querySelectorAll('#contactUsLink, a[data-i18n="nav.contact"]');

    // Open chat when clicking "Contact Us" links
    contactLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openChat();
      });
    });

    // Close button
    if (chatClose) {
      chatClose.addEventListener('click', () => this.closeChat());
    }

    // Click outside to close
    if (chatModal) {
      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) this.closeChat();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatModal?.classList.contains('open')) {
        this.closeChat();
      }
    });

    // Form submit (send message)
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (message) {
          this.addMessage(message, 'user');
          chatInput.value = '';
          chatInput.focus();
        }
      });
    }
  }
}

// Initialize only once
const chat = new Chat();
