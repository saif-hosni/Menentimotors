// Global Error Handler - Available everywhere
// Ensures error modals work reliably even if other scripts load later

(function() {
  'use strict';

  // Global error modal function
  window.showErrorGUI = function(message, actionText = null, actionCallback = null, type = 'error') {
    // Sanitize message if security module is available
    if (typeof security !== 'undefined' && security.sanitizeInput) {
      message = security.sanitizeInput(String(message));
    }

    let modal = document.getElementById('errorModal');

    // Create modal if it doesn't exist yet
    if (!modal) {
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

      // Close button handler
      closeBtn.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      });

      // Action button handler (will be updated dynamically)
      actionBtn.addEventListener('click', () => {
        if (actionCallback) actionCallback();
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

    // Update content
    const messageEl = document.getElementById('errorMessage');
    const actionBtn = document.getElementById('errorActionBtn');
    const titleEl = modal.querySelector('.error-title');
    const iconEl = modal.querySelector('.error-icon');

    if (messageEl) messageEl.textContent = message || 'An error occurred.';

    // Type-based styling
    if (type === 'success') {
      if (titleEl) titleEl.textContent = 'Success';
      if (iconEl) iconEl.textContent = '✓';
    } else {
      if (titleEl) titleEl.textContent = 'Notice';
      if (iconEl) iconEl.textContent = '⚠️';
    }

    // Action button
    if (actionText && actionCallback && actionBtn) {
      actionBtn.textContent = actionText;
      actionBtn.style.display = 'block';

      // Remove old listener and add new one (clean way)
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

  // Override native alert to use our GUI modal (optional fallback)
  const originalAlert = window.alert;
  window.alert = function(message) {
    // Use GUI if modal exists, otherwise fallback to native alert
    if (document.getElementById('errorModal')) {
      showErrorGUI(String(message));
    } else {
      originalAlert.call(window, message);
    }
  };
})();
