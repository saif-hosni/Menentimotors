// Global Error Handler - Available everywhere
// This ensures error modals work even if admin.js hasn't loaded yet

(function() {
  'use strict';

  // Simple HTML escape function (basic XSS protection)
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Global error modal function
  window.showErrorGUI = function(message, actionText = null, actionCallback = null, type = 'error') {
    // Sanitize message to prevent XSS
    message = escapeHtml(String(message));

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
      modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;justify-content:center;align-items:center;';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'error-modal-content';
      modalContent.style.cssText = 'background:#111;padding:30px;border-radius:12px;max-width:400px;width:90%;border:1px solid rgba(212,0,0,0.3);';
      
      const icon = document.createElement('div');
      icon.className = 'error-icon';
      icon.style.cssText = 'font-size:48px;text-align:center;margin-bottom:20px;';
      icon.textContent = '⚠️';
      
      const title = document.createElement('h2');
      title.className = 'error-title';
      title.style.cssText = 'color:#fff;margin:0 0 15px 0;text-align:center;';
      title.textContent = 'Notice';
      
      const messageEl = document.createElement('p');
      messageEl.className = 'error-message';
      messageEl.id = 'errorMessage';
      messageEl.style.cssText = 'color:#ccc;margin:0 0 25px 0;text-align:center;line-height:1.5;';
      messageEl.textContent = 'An error occurred.';
      
      const actions = document.createElement('div');
      actions.className = 'error-actions';
      actions.style.cssText = 'display:flex;gap:12px;justify-content:center;';
      
      const closeBtn = document.createElement('button');
      closeBtn.id = 'errorClose';
      closeBtn.className = 'btn-primary';
      closeBtn.style.cssText = 'padding:10px 24px;background:#d40000;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;';
      closeBtn.textContent = 'OK';
      
      const actionBtn = document.createElement('button');
      actionBtn.id = 'errorActionBtn';
      actionBtn.className = 'btn-secondary';
      actionBtn.style.cssText = 'padding:10px 24px;background:#333;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;display:none;';
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
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
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
      actionBtn.style.display = 'inline-block';
      
      // Update action button click handler
      const newHandler = () => {
        actionCallback();
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      };
      
      // Remove old listeners and add new one
      const newActionBtn = actionBtn.cloneNode(true);
      actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
      newActionBtn.addEventListener('click', newHandler);
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
    // Only override if we want to use GUI alerts
    if (typeof window.useGUIAlerts === 'undefined' || window.useGUIAlerts === true) {
      showErrorGUI(String(message));
    } else {
      // Fallback to original alert
      originalAlert.call(window, message);
    }
  };

  // Global error handler for uncaught errors
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    
    // Don't show error modal for all errors (can be annoying)
    // Only show for critical errors
    if (event.error && event.error.message && 
        !event.error.message.includes('ResizeObserver') && 
        !event.error.message.includes('Script error')) {
      showErrorGUI('An unexpected error occurred. Please refresh the page.');
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorGUI('Something went wrong. Please try again.');
  });
})();
