// Chat System
class Chat {
  constructor() {
    this.messages = this.loadMessages();
    this.init();
  }

  loadMessages() {
    try {
      const messagesStr = localStorage.getItem('chatMessages');
      return messagesStr ? JSON.parse(messagesStr) : [];
    } catch (e) {
      console.error('Failed to load chat messages:', e);
      return [];
    }
  }

  saveMessages() {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Failed to save chat messages:', e);
    }
  }

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

    if (sender === 'user') {
      setTimeout(() => this.generateBotResponse(text), 800);
    }
  }

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
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      response = "You can reach us through this chat, or visit our showroom. We're here to help!";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = "You're welcome! Is there anything else I can help you with?";
    }

    this.addMessage(response, 'bot');
  }

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

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.innerHTML = '';

    // Welcome message
    this.addMessage("Hello! How can we help you today?", 'bot');

    this.messages.forEach(msg => this.renderMessage(msg));
    this.scrollToBottom();
  }

  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('currentUser');
  }

  openChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) {
      console.warn('Chat modal not found');
      return;
    }

    // Force show
    modal.style.display = 'flex';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!this.isAuthenticated()) {
      this.showSignInPrompt();
    } else {
      this.renderMessages();
    }

    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 300);
  }

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
          <p>Please sign in to use the chat feature.</p>
          <button id="chatSignInBtn" class="chat-sign-in-btn">Sign In</button>
        </div>
      </div>
    `;

    document.getElementById('chatSignInBtn')?.addEventListener('click', () => {
      this.closeChat();
      const authModal = document.getElementById('authModal');
      if (authModal) {
        authModal.style.display = 'flex';
        authModal.classList.add('open');
      }
    });
  }

  closeChat() {
    const modal = document.getElementById('chatModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Catch all possible "Contact Us" links
    const contactLinks = document.querySelectorAll(
      '#contactUsLink, a[data-i18n="nav.contact"], [data-i18n="nav.contact"]'
    );

    console.log('Found Contact Us links:', contactLinks.length);

    contactLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Contact Us clicked – opening chat');
        this.openChat();
      });
    });

    const chatClose = document.getElementById('chatClose');
    if (chatClose) {
      chatClose.addEventListener('click', () => this.closeChat());
    }

    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) this.closeChat();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatModal?.classList.contains('open')) {
        this.closeChat();
      }
    });

    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const chatInput = document.getElementById('chatInput');
        const message = chatInput?.value.trim();
        if (message) {
          this.addMessage(message, 'user');
          chatInput.value = '';
          chatInput?.focus();
        }
      });
    }
  }
}

// Initialize
const chat = new Chat();
