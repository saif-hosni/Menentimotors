// Chat System - Fixed GitHub Pages Version
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
    } catch {
      return [];
    }
  }

  // Save messages to localStorage
  saveMessages() {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  }

  // Add message
  addMessage(text, sender = 'user') {
    const message = {
      id: Date.now().toString(),
      text: text,
      sender: sender,
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
      response = 'Hello! How can I assist you today?';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('€')) {
      response = 'Our prices vary depending on the vehicle. Would you like to see our showroom?';
    } else if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('ferrari') || lowerMessage.includes('porsche') || lowerMessage.includes('aston')) {
      response = 'We have a great selection of luxury vehicles. Check out our showroom for details!';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      response = 'You can reach us through this chat, or visit our showroom. We\'re here to help!';
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = 'You\'re welcome! Is there anything else I can help you with?';
    } else {
      response = 'Thank you for your message. Our team will get back to you soon. Is there anything specific you\'d like to know?';
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
    
    // Create avatar SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "32");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");
    
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "8");
    circle.setAttribute("r", "3.5");
    
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M4 20c0-4 4-7 8-7s8 3 8 7");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.6");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    
    svg.appendChild(circle);
    svg.appendChild(path);
    avatar.appendChild(svg);

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
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) {
        return 'Just now';
      } else if (minutes < 60) {
        return `${minutes} min ago`;
      } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      return 'Just now';
    }
  }

  // Render all messages
  renderMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    // Clear existing messages (except welcome message)
    const existingMessages = messagesContainer.querySelectorAll('.chat-message');
    existingMessages.forEach(msg => {
      if (!msg.classList.contains('chat-message-bot') || msg.querySelector('p')?.textContent !== 'Hello! How can we help you today?') {
        msg.remove();
      }
    });

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
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? true : false;
    } catch {
      return false;
    }
  }

  // Open chat modal
  openChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('open');
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

    modal.style.display = 'flex';
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

    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'block';
    
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
        <h3>Sign In Required</h3>
        <p>Please sign in to use the chat feature and contact our team.</p>
        <button id="chatSignInBtn" class="chat-sign-in-btn">Sign In</button>
      </div>
    `;
    
    messagesContainer.appendChild(promptDiv);

    // Add event listener for sign-in button
    const signInBtn = document.getElementById('chatSignInBtn');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => {
        this.closeChat();
        // Open auth modal
        if (typeof auth !== 'undefined' && auth.openModal) {
          setTimeout(() => auth.openModal(), 300);
        }
      });
    }
  }

  // Update chat UI based on auth status
  updateChatUI() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const chatInput = document.getElementById('chatInput');

    if (this.isAuthenticated()) {
      // Show chat interface
      if (chatMessages) chatMessages.style.display = 'flex';
      if (chatInputContainer) chatInputContainer.style.display = 'block';
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = 'Type your message...';
      }
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
      modal.style.display = 'none';
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Initialize chat system
  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const contactUsLink = document.getElementById('contactUsLink');
    const chatClose = document.getElementById('chatClose');
    const chatModal = document.getElementById('chatModal');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    // Contact Us link - open chat
    if (contactUsLink) {
      contactUsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openChat();
      });
    }

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
      const modal = document.getElementById('chatModal');
      if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
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

    // Listen for auth changes
    document.addEventListener('authStatusChanged', () => {
      const modal = document.getElementById('chatModal');
      if (modal && modal.style.display === 'flex') {
        if (this.isAuthenticated()) {
          // User signed in, show chat interface
          const prompt = document.querySelector('.sign-in-prompt');
          if (prompt) prompt.remove();
          this.renderMessages();
          this.updateChatUI();
        } else {
          // User signed out, show sign-in prompt
          this.showSignInPrompt();
        }
      }
    });
  }
}

// Initialize chat system
const chat = new Chat();
