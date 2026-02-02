// Admin Management System
class AdminManager {
  constructor() {
    this.currentEditingCardId = null;
    this.confirmCallback = null;
    this.errorActionCallback = null;
    this.init();
  }

  // Check if current user is admin
  isCurrentUserAdmin() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return false;

    try {
      const currentUser = JSON.parse(userStr);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const fullUser = users.find(u => u.id === currentUser.id);
      return !!fullUser?.isAdmin;
    } catch {
      return false;
    }
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.updateAdminPanel();
    this.updateRequestLinkVisibility();

    // Listen for auth changes
    document.addEventListener('authStatusChanged', () => {
      this.updateAdminPanel();
      this.updateRequestLinkVisibility();
    });

    this.setupEventListeners();
  }

  // Show/hide admin panel
  updateAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) return;

    if (this.isCurrentUserAdmin()) {
      adminPanel.style.display = 'flex';
      this.addEditDeleteButtons();
    } else {
      adminPanel.style.display = 'none';
      this.removeEditDeleteButtons();
    }
  }

  // Make "Request vehicle" link clickable or disabled-looking
  updateRequestLinkVisibility() {
    const requestLink = document.getElementById('requestVehicleLink');
    if (!requestLink) return;

    requestLink.style.opacity = '1';
    requestLink.style.pointerEvents = 'auto';
    requestLink.style.cursor = 'pointer';
  }

  setupEventListeners() {
    // Add vehicle button
    document.getElementById('addVehicleBtn')?.addEventListener('click', () => {
      if (this.isCurrentUserAdmin()) this.openAdminModal();
    });

    // Admin modal close
    document.getElementById('adminClose')?.addEventListener('click', () => this.closeAdminModal());

    // Admin form submit
    document.getElementById('adminVehicleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.isCurrentUserAdmin()) this.saveVehicle();
    });

    // Delete button in edit modal
    document.getElementById('deleteVehicleBtn')?.addEventListener('click', () => {
      if (this.isCurrentUserAdmin()) this.deleteVehicle();
    });

    // Confirmation modal
    document.getElementById('confirmCancel')?.addEventListener('click', () => this.closeConfirmModal());
    document.getElementById('confirmDelete')?.addEventListener('click', () => this.handleConfirmDelete());

    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
      confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) this.closeConfirmModal();
      });
    }

    // Error modal
    document.getElementById('errorClose')?.addEventListener('click', () => this.closeErrorModal());
    document.getElementById('errorActionBtn')?.addEventListener('click', () => this.handleErrorAction());

    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
      errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) this.closeErrorModal();
      });
    }

    // Request vehicle link
    document.getElementById('requestVehicleLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openRequestModal();
    });

    // Request modal close/cancel
    document.getElementById('requestClose')?.addEventListener('click', () => this.closeRequestModal());
    document.getElementById('requestCancel')?.addEventListener('click', () => this.closeRequestModal());

    // Request form submit
    document.getElementById('requestForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitRequest();
    });

    // View requests (admin only)
    document.getElementById('viewRequestsBtn')?.addEventListener('click', () => {
      if (this.isCurrentUserAdmin()) this.openRequestsModal();
    });

    // Requests modal close
    document.getElementById('requestsClose')?.addEventListener('click', () => this.closeRequestsModal());

    const requestsModal = document.getElementById('requestsModal');
    if (requestsModal) {
      requestsModal.addEventListener('click', (e) => {
        if (e.target === requestsModal) this.closeRequestsModal();
      });
    }
  }

  /* ------------------- Request Handling ------------------- */

  getRequests() {
    try {
      const data = localStorage.getItem('vehicleRequests');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveRequests(requests) {
    try {
      localStorage.setItem('vehicleRequests', JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save requests:', e);
    }
  }

  submitRequest() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      alert('Please sign in to request a vehicle.');
      if (typeof auth !== 'undefined' && auth.openModal) auth.openModal();
      return;
    }

    const name = document.getElementById('reqName')?.value.trim() || '';
    const contact = document.getElementById('reqContact')?.value.trim() || '';
    const make = document.getElementById('reqMake')?.value.trim() || '';
    const model = document.getElementById('reqModel')?.value.trim() || '';
    const message = document.getElementById('reqMessage')?.value.trim() || '';

    if (!name || !contact) {
      alert('Name and contact are required.');
      return;
    }

    const req = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      name,
      contact,
      make,
      model,
      message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    const requests = this.getRequests();
    requests.unshift(req);
    this.saveRequests(requests);

    alert('Request submitted successfully!');
    this.closeRequestModal();
  }

  openRequestModal() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      alert('Please sign in first.');
      if (typeof auth !== 'undefined' && auth.openModal) auth.openModal();
      return;
    }

    const modal = document.getElementById('requestModal');
    if (!modal) return;

    // Pre-fill user info
    document.getElementById('reqName')?.setAttribute('value', currentUser.name || '');
    document.getElementById('reqContact')?.setAttribute('value', currentUser.email || '');

    modal.style.display = 'flex';
  }

  closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) {
      modal.style.display = 'none';
      document.getElementById('requestForm')?.reset();
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /* ------------------- Vehicle Management ------------------- */

  addEditDeleteButtons() {
    if (!this.isCurrentUserAdmin()) {
      this.removeEditDeleteButtons();
      return;
    }

    document.querySelectorAll('.card').forEach(card => {
      if (card.querySelector('.card-admin-controls')) return;

      const controls = document.createElement('div');
      controls.className = 'card-admin-controls';
      controls.innerHTML = `
        <button class="btn-edit" title="Edit">✏️</button>
        <button class="btn-delete" title="Delete">🗑️</button>
      `;

      card.appendChild(controls);

      controls.querySelector('.btn-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAdminModal(card);
      });

      controls.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.showConfirmModal('Delete this vehicle?', () => {
          card.remove();
        });
      });
    });
  }

  removeEditDeleteButtons() {
    document.querySelectorAll('.card-admin-controls').forEach(el => el.remove());
  }

  openAdminModal(card = null) {
    if (!this.isCurrentUserAdmin()) return;

    const modal = document.getElementById('adminModal');
    if (!modal) return;

    const form = document.getElementById('adminVehicleForm');
    const deleteBtn = document.getElementById('deleteVehicleBtn');

    if (form) form.reset();
    this.currentEditingCardId = null;

    if (card) {
      this.currentEditingCardId = card.dataset.cardId || Date.now().toString();
      card.dataset.cardId = this.currentEditingCardId;
      if (deleteBtn) deleteBtn.style.display = 'block';

      // Populate form (simplified)
      document.getElementById('vehicleMake')?.value = card.querySelector('.model')?.textContent.split(' ')[0] || '';
      // ... add more population fields as needed
    } else {
      if (deleteBtn) deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
  }

  closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
    this.currentEditingCardId = null;
  }

  saveVehicle() {
    if (!this.isCurrentUserAdmin()) return;

    // Get form values (add your fields)
    const make = document.getElementById('vehicleMake')?.value || '';
    // ... get other fields

    if (this.currentEditingCardId) {
      const card = document.querySelector(`[data-card-id="${this.currentEditingCardId}"]`);
      if (card) {
        // Update existing card
        card.querySelector('.model').textContent = `${make} ...`;
        // ... update other parts
      }
    } else {
      // Create new card (simplified example)
      const grid = document.getElementById('vehicleGrid');
      if (grid) {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `<div class="card-body"><h3 class="model">${make}</h3>...</div>`;
        grid.appendChild(card);
        this.addEditDeleteButtons();
      }
    }

    this.closeAdminModal();
  }

  deleteVehicle() {
    if (!this.currentEditingCardId || !this.isCurrentUserAdmin()) return;

    const card = document.querySelector(`[data-card-id="${this.currentEditingCardId}"]`);
    if (card) {
      this.showConfirmModal('Delete this vehicle?', () => {
        card.remove();
        this.closeAdminModal();
      });
    }
  }

  /* ------------------- Modals Helpers ------------------- */

  showConfirmModal(message, callback) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    const msgEl = document.getElementById('confirmMessage');
    if (msgEl) msgEl.textContent = message;

    this.confirmCallback = callback;
    modal.style.display = 'flex';
  }

  closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    this.confirmCallback = null;
  }

  handleConfirmDelete() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmModal();
  }

  showErrorModal(message) {
    alert(message || 'An error occurred'); // fallback
    // You can expand this to use your error modal later
  }
}

// Initialize
const adminManager = new AdminManager();
