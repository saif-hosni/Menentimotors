// Global Error Handler - Available everywhere
// This ensures error modals work even if admin.js hasn't loaded yet

(function() {
  'use strict';

  // Global error modal function
  window.showErrorGUI = function(message, actionText = null, actionCallback = null, type = 'error') {
    // Sanitize message to prevent XSS
    if (typeof security !== 'undefined' && security.sanitizeInput) {
      message = security.sanitizeInput(String(message));
    }

    // Try to use adminManager's error modal if available (preferred)
    if (typeof adminManager !== 'undefined' && adminManager.showErrorModal) {
      adminManager.showErrorModal(message, actionText, actionCallback, type);
      return;
    }
    
    // Fallback: use existing modal or create one
    let modal = document.getElementById('errorModal');
    
    if (!modal) {
      // Create modal if it doesn't exist
      modal = document.createElement('div');
      modal.id = 'errorModal';
      modal.className = 'error-modal';
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'error-modal-content';
      
      const icon = document.createElement('div');
      icon.className = 'error-icon';
      icon.textContent = '⚠️';
      
      const title = document.createElement('h2');
      title.className = 'error-title';
      title.textContent = 'Notice';
      
      const messageEl = document.createElement('p');
      messageEl.className = 'error-message';
      messageEl.id = 'errorMessage';
      messageEl.textContent = 'An error occurred.';
      
      const actions = document.createElement('div');
      actions.className = 'error-actions';
      
      const closeBtn = document.createElement('button');
      closeBtn.id = 'errorClose';
      closeBtn.className = 'btn-primary';
      closeBtn.textContent = 'OK';
      
      const actionBtn = document.createElement('button');
      actionBtn.id = 'errorActionBtn';
      actionBtn.className = 'btn-secondary';
      actionBtn.style.display = 'none';
      actionBtn.textContent = 'Action';
      
      actions.appendChild(closeBtn);
      actions.appendChild(actionBtn);
      
      modalContent.appendChild(icon);
      modalContent.appendChild(title);
      modalContent.appendChild(messageEl);
      modalContent.appendChild(actions);
      modal.appendChild(modalContent);
      
      document.body.appendChild(modal);
      
      // Setup event listeners
      closeBtn.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      });
      
      actionBtn.addEventListener('click', () => {
        if (actionCallback) {
          actionCallback();
        }
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      });
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.setAttribute('aria-hidden', 'true');
          modal.style.display = 'none';
        }
      });
    }
    
    // Update modal content
    const messageEl = document.getElementById('errorMessage');
    const actionBtn = document.getElementById('errorActionBtn');
    const titleEl = modal.querySelector('.error-title');
    const iconEl = modal.querySelector('.error-icon');
    const contentEl = modal.querySelector('.error-modal-content');
    
    if (messageEl) {
      messageEl.textContent = message;
    }
    
    // Update based on type
    if (type === 'success') {
      if (titleEl) titleEl.textContent = 'Success';
      if (iconEl) iconEl.textContent = '✓';
      if (contentEl) contentEl.style.borderColor = 'rgba(0, 255, 0, 0.3)';
    } else {
      if (titleEl) titleEl.textContent = 'Notice';
      if (iconEl) iconEl.textContent = '⚠️';
      if (contentEl) contentEl.style.borderColor = 'rgba(212, 0, 0, 0.3)';
    }
    
    // Handle action button
    if (actionText && actionCallback && actionBtn) {
      actionBtn.textContent = actionText;
      actionBtn.style.display = 'block';
      // Replace onclick to ensure callback works
      const newActionBtn = actionBtn.cloneNode(true);
      actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
      newActionBtn.addEventListener('click', () => {
        actionCallback();
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      });
    } else if (actionBtn) {
      actionBtn.style.display = 'none';
    }
    
    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  };

  // Override alert to use GUI (optional - can be disabled)
  const originalAlert = window.alert;
  window.alert = function(message) {
    // Only override if error modal is available
    if (document.getElementById('errorModal') || typeof adminManager !== 'undefined') {
      showErrorGUI(String(message));
    } else {
      // Fallback to original alert
      originalAlert.call(window, message);
    }
  };
})();

