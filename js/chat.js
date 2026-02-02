// Chat System
class Chat {
  constructor() {
    this.messages = this.loadMessages();
    this.init();
  }

  // ... (loadMessages, saveMessages, addMessage, generateBotResponse, renderMessage, formatTime, scrollToBottom stay the same)

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

  // ... rest of the class stays exactly the same (closeChat, init, setupEventListeners)

  isAuthenticated() {
    return !!localStorage.getItem('currentUser');
  }
}

// Initialize
const chat = new Chat();
