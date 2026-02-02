// Admin Management System - GitHub Pages Compatible Version
class AdminManager {
  constructor() {
    this.currentEditingCardId = null;
    this.confirmCallback = null;
    this.errorActionCallback = null;
    this.init();
  }

  // Helper: check if current user is admin
  isCurrentUserAdmin() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return false;
    try {
      const currentUser = JSON.parse(userStr);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const fullUser = users.find(u => u.id === currentUser.id);
      return !!(fullUser && fullUser.isAdmin);
    } catch {
      return false;
    }
  }

  // Initialize admin panel
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
    this.updateRequestLinkVisibility();
  }

  // Update request link visibility based on auth status
  updateRequestLinkVisibility() {
    const requestLink = document.getElementById('requestVehicleLink');
    if (!requestLink) return;

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      requestLink.style.opacity = '1';
      requestLink.style.pointerEvents = 'auto';
      requestLink.style.cursor = 'pointer';
    } else {
      requestLink.style.opacity = '0.6';
      requestLink.style.pointerEvents = 'auto';
      requestLink.style.cursor = 'pointer';
    }
  }

  updateAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) return;

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      adminPanel.style.display = 'none';
      return;
    }

    try {
      const currentUser = JSON.parse(userStr);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const fullUser = users.find(u => u.id === currentUser.id);

      if (fullUser && fullUser.isAdmin) {
        adminPanel.style.display = 'flex';
        this.addEditDeleteButtons();
      } else {
        adminPanel.style.display = 'none';
        this.removeEditDeleteButtons();
      }
    } catch {
      adminPanel.style.display = 'none';
      this.removeEditDeleteButtons();
    }
  }

  setupEventListeners() {
    // Add vehicle button
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) {
      addVehicleBtn.addEventListener('click', () => this.openAdminModal());
    }

    // Admin modal close
    const adminClose = document.getElementById('adminClose');
    if (adminClose) {
      adminClose.addEventListener('click', () => this.closeAdminModal());
    }

    // Admin form submit
    const adminForm = document.getElementById('adminVehicleForm');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveVehicle();
      });
    }

    // Delete button
    const deleteBtn = document.getElementById('deleteVehicleBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteVehicle());
    }

    // Confirmation modal
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmCancel) confirmCancel.addEventListener('click', () => this.closeConfirmModal());
    if (confirmDelete) confirmDelete.addEventListener('click', () => this.handleConfirmDelete());

    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
      confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) this.closeConfirmModal();
      });
    }

    // Error modal
    const errorClose = document.getElementById('errorClose');
    const errorActionBtn = document.getElementById('errorActionBtn');
    if (errorClose) errorClose.addEventListener('click', () => this.closeErrorModal());
    if (errorActionBtn) errorActionBtn.addEventListener('click', () => this.handleErrorAction());

    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
      errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) this.closeErrorModal();
      });
    }

    // Admin modal backdrop click
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
      adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) this.closeAdminModal();
      });
    }

    // Request vehicle link
    const requestLink = document.getElementById('requestVehicleLink');
    if (requestLink) {
      requestLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openRequestModal();
      });
    }

    // Request modal close
    const requestClose = document.getElementById('requestClose');
    const requestCancel = document.getElementById('requestCancel');
    if (requestClose) requestClose.addEventListener('click', () => this.closeRequestModal());
    if (requestCancel) requestCancel.addEventListener('click', () => this.closeRequestModal());

    // Request form submit
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
      requestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitRequest();
      });
    }

    // View requests (admin)
    const viewRequestsBtn = document.getElementById('viewRequestsBtn');
    if (viewRequestsBtn) {
      viewRequestsBtn.addEventListener('click', () => this.openRequestsModal());
    }

    // Requests modal close
    const requestsClose = document.getElementById('requestsClose');
    if (requestsClose) requestsClose.addEventListener('click', () => this.closeRequestsModal());

    const requestsModal = document.getElementById('requestsModal');
    if (requestsModal) {
      requestsModal.addEventListener('click', (e) => {
        if (e.target === requestsModal) this.closeRequestsModal();
      });
    }
  }

  /* ---------- Request Handling ---------- */
  getRequests() {
    try {
      const reqStr = localStorage.getItem('vehicleRequests');
      return reqStr ? JSON.parse(reqStr) : [];
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
      this.showErrorModal(
        'Please sign in to request a vehicle.',
        'Sign In',
        () => {
          this.closeRequestModal();
          if (typeof auth !== 'undefined' && auth.openModal) {
            auth.openModal();
          }
        }
      );
      return;
    }

    let name = document.getElementById('reqName').value.trim();
    let contact = document.getElementById('reqContact').value.trim();
    let make = document.getElementById('reqMake').value.trim();
    let model = document.getElementById('reqModel').value.trim();
    let message = document.getElementById('reqMessage').value.trim();

    // Basic validation
    if (!name || !contact) {
      this.showErrorModal('Please fill in your name and contact information.');
      return;
    }

    const req = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      name: name,
      contact: contact,
      make: make,
      model: model,
      message: message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    const requests = this.getRequests();
    requests.unshift(req);
    this.saveRequests(requests);

    this.showErrorModal('Request submitted — our team will contact you.', null, null, 'success');
    this.closeRequestModal();
  }

  openRequestModal() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      this.showErrorModal(
        'Please sign in to request a vehicle.',
        'Sign In',
        () => {
          if (typeof auth !== 'undefined' && auth.openModal) {
            auth.openModal();
          }
        }
      );
      return;
    }

    const modal = document.getElementById('requestModal');
    if (!modal) return;
    
    const nameInput = document.getElementById('reqName');
    const contactInput = document.getElementById('reqContact');
    if (nameInput) nameInput.value = currentUser.name || '';
    if (contactInput) contactInput.value = currentUser.email || '';
    
    modal.style.display = 'flex';
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (!modal) return;
    modal.style.display = 'none';
    const form = document.getElementById('requestForm');
    if (form) form.reset();
  }

  openRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (!modal) return;
    this.renderRequestsList();
    modal.style.display = 'flex';
  }

  closeRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (!modal) return;
    modal.style.display = 'none';
  }

  renderRequestsList() {
    const container = document.getElementById('requestsList');
    if (!container) return;
    container.innerHTML = '';
    const requests = this.getRequests();
    
    if (!requests.length) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'muted';
      emptyDiv.textContent = 'No requests found.';
      container.appendChild(emptyDiv);
      return;
    }

    requests.forEach(req => {
      const reqDiv = document.createElement('div');
      reqDiv.className = 'request-item';
      reqDiv.style.cssText = 'padding:12px;border:1px solid rgba(255,255,255,0.04);border-radius:8px;background:rgba(255,255,255,0.01)';

      const innerDiv = document.createElement('div');
      innerDiv.style.cssText = 'display:flex;justify-content:space-between;align-items:start;gap:12px';

      const leftDiv = document.createElement('div');
      const nameStrong = document.createElement('strong');
      nameStrong.textContent = req.name || '';
      leftDiv.appendChild(nameStrong);
      
      const contactSpan = document.createElement('span');
      contactSpan.className = 'muted';
      contactSpan.textContent = ' — ' + (req.contact || '');
      leftDiv.appendChild(contactSpan);

      if (req.make || req.model) {
        const makeModelDiv = document.createElement('div');
        makeModelDiv.style.marginTop = '6px';
        makeModelDiv.textContent = (req.make ? req.make + ' ' : '') + (req.model || '');
        leftDiv.appendChild(makeModelDiv);
      }

      if (req.message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginTop = '8px';
        messageDiv.textContent = req.message;
        leftDiv.appendChild(messageDiv);
      }

      const dateDiv = document.createElement('div');
      dateDiv.className = 'muted';
      dateDiv.style.cssText = 'margin-top:8px;font-size:12px';
      dateDiv.textContent = new Date(req.createdAt).toLocaleString();
      leftDiv.appendChild(dateDiv);

      const rightDiv = document.createElement('div');
      rightDiv.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:flex-end';

      const resolveBtn = document.createElement('button');
      resolveBtn.className = 'btn-primary';
      resolveBtn.setAttribute('data-action', 'resolve');
      resolveBtn.setAttribute('data-id', req.id);
      resolveBtn.textContent = req.status === 'resolved' ? 'Resolved' : 'Mark Resolved';
      resolveBtn.addEventListener('click', () => this.markRequestResolved(req.id));
      rightDiv.appendChild(resolveBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger';
      deleteBtn.setAttribute('data-action', 'delete');
      deleteBtn.setAttribute('data-id', req.id);
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => this.deleteRequest(req.id));
      rightDiv.appendChild(deleteBtn);

      innerDiv.appendChild(leftDiv);
      innerDiv.appendChild(rightDiv);
      reqDiv.appendChild(innerDiv);
      container.appendChild(reqDiv);
    });
  }

  deleteRequest(id) {
    this.showConfirmModal(
      'Are you sure you want to delete this request as admin?',
      () => {
        const requests = this.getRequests().filter(r => r.id !== id);
        this.saveRequests(requests);
        this.renderRequestsList();
      }
    );
  }

  markRequestResolved(id) {
    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) return;
    requests[idx].status = 'resolved';
    this.saveRequests(requests);
    this.renderRequestsList();
  }

  /* ---------- Card Management ---------- */
  addEditDeleteButtons() {
    if (!this.isCurrentUserAdmin()) {
      this.removeEditDeleteButtons();
      return;
    }

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (!card.querySelector('.card-admin-controls')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'card-admin-controls';
        controlsDiv.innerHTML = `
          <button class="btn-edit" title="Edit">✏️</button>
          <button class="btn-delete" title="Delete">🗑️</button>
        `;
        card.appendChild(controlsDiv);

        controlsDiv.querySelector('.btn-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isCurrentUserAdmin()) this.openAdminModal(card);
        });

        controlsDiv.querySelector('.btn-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isCurrentUserAdmin()) {
            this.showConfirmModal(
              'Are you sure you want to delete this vehicle as admin?',
              () => this.deleteVehicleCard(card)
            );
          }
        });
      }
    });
  }

  // FIXED: Removed the problematic safeSetHTML method and replaced with direct DOM manipulation
  removeEditDeleteButtons() {
    const controls = document.querySelectorAll('.card-admin-controls');
    controls.forEach(control => control.remove());
  }

  openAdminModal(cardElement = null) {
    if (!this.isCurrentUserAdmin()) return;
    
    const modal = document.getElementById('adminModal');
    const form = document.getElementById('adminVehicleForm');
    const deleteBtn = document.getElementById('deleteVehicleBtn');

    if (!modal) return;

    form.reset();
    this.currentEditingCardId = null;

    if (cardElement) {
      this.currentEditingCardId = cardElement.getAttribute('data-card-id') || Date.now().toString();
      cardElement.setAttribute('data-card-id', this.currentEditingCardId);
      if (deleteBtn) deleteBtn.style.display = 'block';

      const model = cardElement.querySelector('.model')?.textContent || '';
      const specs = cardElement.querySelector('.specs')?.textContent || '';
      const searchText = cardElement.getAttribute('data-search') || '';
      const category = cardElement.getAttribute('data-category') || '';
      const imageSrc = cardElement.querySelector('.card-media img')?.getAttribute('data-src') || '';

      const modelParts = model.split(' ');
      const make = modelParts[0];
      const modelName = modelParts.slice(1).join(' ');

      document.getElementById('vehicleMake').value = make;
      document.getElementById('vehicleModel').value = modelName;
      document.getElementById('vehicleCategory').value = category;
      document.getElementById('vehicleSpecs').value = specs;
      document.getElementById('vehicleSearch').value = searchText;
      document.getElementById('vehicleImage').value = imageSrc;

      const moreItems = cardElement.querySelectorAll('.more p');
      if (moreItems.length >= 2) {
        const yearText = moreItems[0].textContent;
        const priceText = moreItems[1].textContent;
        document.getElementById('vehicleYear').value = yearText.replace('Year: ', '');
        document.getElementById('vehiclePrice').value = priceText.replace('Price: € ', '');
      }

      const specItems = cardElement.querySelectorAll('.card-specs .spec-item');
      specItems.forEach(item => {
        const label = item.querySelector('.spec-label')?.textContent.toLowerCase() || '';
        const value = item.querySelector('.spec-value')?.textContent || '';

        if (label.includes('engine')) {
          document.getElementById('vehicleEngine').value = value;
        } else if (label.includes('horsepower')) {
          document.getElementById('vehicleHP').value = value;
        } else if (label.includes('0-60')) {
          document.getElementById('vehicle060').value = value;
        } else if (label.includes('top speed')) {
          document.getElementById('vehicleTopSpeed').value = value;
        }
      });
    } else {
      if (deleteBtn) deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
  }

  closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
      modal.style.display = 'none';
      this.currentEditingCardId = null;
    }
  }

  saveVehicle() {
    if (!this.isCurrentUserAdmin()) {
      this.showErrorModal('You do not have permission to perform this action.');
      return;
    }

    const make = document.getElementById('vehicleMake').value;
    const model = document.getElementById('vehicleModel').value;
    const category = document.getElementById('vehicleCategory').value;
    const specs = document.getElementById('vehicleSpecs').value;
    const year = document.getElementById('vehicleYear').value;
    const price = document.getElementById('vehiclePrice').value;
    const image = document.getElementById('vehicleImage').value;
    const search = document.getElementById('vehicleSearch').value;
    const engine = document.getElementById('vehicleEngine').value;
    const hp = document.getElementById('vehicleHP').value;
    const speed060 = document.getElementById('vehicle060').value;
    const topSpeed = document.getElementById('vehicleTopSpeed').value;

    if (this.currentEditingCardId) {
      const card = document.querySelector(`[data-card-id="${this.currentEditingCardId}"]`);
      if (card) {
        this.updateCardElement(card, {
          make, model, category, specs, year, price, image, search,
          engine, hp, speed060, topSpeed
        });
      }
    } else {
      this.createCardElement({
        make, model, category, specs, year, price, image, search,
        engine, hp, speed060, topSpeed
      });
    }

    this.closeAdminModal();
  }

  createCardElement(data) {
    if (!this.isCurrentUserAdmin()) {
      this.showErrorModal('You do not have permission to perform this action.');
      return;
    }

    const grid = document.getElementById('vehicleGrid');
    if (!grid) return;

    const cardId = Date.now().toString();
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-category', data.category || '');
    card.setAttribute('data-search', data.search || '');
    card.setAttribute('data-card-id', cardId);

    // Create card structure using DOM methods instead of innerHTML
    const cardMedia = document.createElement('div');
    cardMedia.className = 'card-media';
    const img = document.createElement('img');
    img.setAttribute('data-src', data.image || '');
    img.setAttribute('alt', (data.make || '') + ' ' + (data.model || ''));
    img.className = 'lazy';
    cardMedia.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const modelHeading = document.createElement('h3');
    modelHeading.className = 'model';
    modelHeading.textContent = (data.make || '') + ' ' + (data.model || '');
    cardBody.appendChild(modelHeading);
    
    const specsPara = document.createElement('p');
    specsPara.className = 'specs';
    specsPara.textContent = data.specs || '';
    cardBody.appendChild(specsPara);
    
    const moreDiv = document.createElement('div');
    moreDiv.className = 'more';
    
    const yearPara = document.createElement('p');
    const yearSpan = document.createElement('span');
    yearSpan.setAttribute('data-i18n', 'vehicle.year');
    yearSpan.textContent = 'Year';
    yearPara.appendChild(yearSpan);
    yearPara.appendChild(document.createTextNode(': ' + (data.year || '')));
    moreDiv.appendChild(yearPara);
    
    const pricePara = document.createElement('p');
    const priceSpan = document.createElement('span');
    priceSpan.setAttribute('data-i18n', 'vehicle.price');
    priceSpan.textContent = 'Price';
    pricePara.appendChild(priceSpan);
    pricePara.appendChild(document.createTextNode(': € ' + (data.price || '')));
    moreDiv.appendChild(pricePara);
    
    const viewLink = document.createElement('a');
    viewLink.href = '#';
    viewLink.className = 'btn';
    viewLink.setAttribute('data-i18n', 'vehicle.viewDetails');
    viewLink.textContent = 'View details';
    moreDiv.appendChild(viewLink);
    
    cardBody.appendChild(moreDiv);

    const cardExtended = document.createElement('div');
    cardExtended.className = 'card-extended';
    
    const specsHeading = document.createElement('h4');
    specsHeading.setAttribute('data-i18n', 'vehicle.specs');
    specsHeading.textContent = 'Technical Specifications';
    cardExtended.appendChild(specsHeading);
    
    const cardSpecs = document.createElement('div');
    cardSpecs.className = 'card-specs';
    
    // Create spec items
    const specsData = [
      { label: 'vehicle.engine', value: data.engine || '' },
      { label: 'vehicle.horsepower', value: data.hp || '' },
      { label: 'vehicle.torque', value: '' },
      { label: 'vehicle.transmission', value: '' },
      { label: 'vehicle.zeroToSixty', value: data.speed060 || '' },
      { label: 'vehicle.topSpeed', value: data.topSpeed || '' }
    ];
    
    specsData.forEach(spec => {
      const specItem = document.createElement('div');
      specItem.className = 'spec-item';
      
      const specLabel = document.createElement('span');
      specLabel.className = 'spec-label';
      specLabel.setAttribute('data-i18n', spec.label);
      specLabel.textContent = spec.label.replace('vehicle.', '').replace(/([A-Z])/g, ' $1');
      
      const specValue = document.createElement('span');
      specValue.className = 'spec-value';
      specValue.textContent = spec.value;
      
      specItem.appendChild(specLabel);
      specItem.appendChild(specValue);
      cardSpecs.appendChild(specItem);
    });
    
    cardExtended.appendChild(cardSpecs);
    
    const priceTag = document.createElement('div');
    priceTag.className = 'price-tag';
    priceTag.textContent = '€ ' + (data.price || '');
    cardExtended.appendChild(priceTag);

    // Assemble the card
    card.appendChild(cardMedia);
    card.appendChild(cardBody);
    card.appendChild(cardExtended);

    grid.appendChild(card);
    this.addEditDeleteButtons();
    
    // Update translations if available
    if (typeof lang !== 'undefined' && lang.updatePage) {
      card.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = lang.t(key);
      });
    }
  }

  updateCardElement(card, data) {
    if (!this.isCurrentUserAdmin()) {
      this.showErrorModal('You do not have permission to perform this action.');
      return;
    }

    card.setAttribute('data-category', data.category || '');
    card.setAttribute('data-search', data.search || '');

    const modelEl = card.querySelector('.model');
    if (modelEl) modelEl.textContent = (data.make || '') + ' ' + (data.model || '');

    const specsEl = card.querySelector('.specs');
    if (specsEl) specsEl.textContent = data.specs || '';

    const moreItems = card.querySelectorAll('.more p');
    if (moreItems[0]) {
      const yearSpan = moreItems[0].querySelector('span[data-i18n="vehicle.year"]');
      if (yearSpan) {
        moreItems[0].innerHTML = `<span data-i18n="vehicle.year">${yearSpan.textContent}</span>: ${data.year || ''}`;
      } else {
        moreItems[0].innerHTML = `<span data-i18n="vehicle.year">Year</span>: ${data.year || ''}`;
      }
    }
    if (moreItems[1]) {
      const priceSpan = moreItems[1].querySelector('span[data-i18n="vehicle.price"]');
      if (priceSpan) {
        moreItems[1].innerHTML = `<span data-i18n="vehicle.price">${priceSpan.textContent}</span>: € ${data.price || ''}`;
      } else {
        moreItems[1].innerHTML = `<span data-i18n="vehicle.price">Price</span>: € ${data.price || ''}`;
      }
    }

    const img = card.querySelector('.card-media img');
    if (img) img.setAttribute('data-src', data.image || '');

    const specItems = card.querySelectorAll('.card-specs .spec-item');
    specItems.forEach(item => {
      const label = item.querySelector('.spec-label')?.textContent.toLowerCase() || '';
      const valueSpan = item.querySelector('.spec-value');

      if (!valueSpan) return;

      if (label.includes('engine')) {
        valueSpan.textContent = data.engine || '';
      } else if (label.includes('horsepower')) {
        valueSpan.textContent = data.hp || '';
      } else if (label.includes('0-60')) {
        valueSpan.textContent = data.speed060 || '';
      } else if (label.includes('top speed')) {
        valueSpan.textContent = data.topSpeed || '';
      }
    });

    const priceTag = card.querySelector('.price-tag');
    if (priceTag) priceTag.textContent = '€ ' + (data.price || '');
    
    if (typeof lang !== 'undefined' && lang.updatePage) {
      card.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = lang.t(key);
      });
    }
  }

  deleteVehicleCard(card) {
    if (!this.isCurrentUserAdmin()) {
      this.showErrorModal('You do not have permission to perform this action.');
      return;
    }
    card.remove();
  }

  deleteVehicle() {
    if (!this.currentEditingCardId) return;

    const card = document.querySelector(`[data-card-id="${this.currentEditingCardId}"]`);
    if (card) {
      this.showConfirmModal(
        'Are you sure you want to delete this vehicle as admin?',
        () => {
          card.remove();
          this.closeAdminModal();
        }
      );
    }
  }

  /* ---------- Modal Methods ---------- */
  showConfirmModal(message, callback) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    if (!modal || !messageEl) return;

    messageEl.textContent = message;
    this.confirmCallback = callback;
    modal.style.display = 'flex';
  }

  closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    modal.style.display = 'none';
    this.confirmCallback = null;
  }

  handleConfirmDelete() {
    if (this.confirmCallback) {
      this.confirmCallback();
      this.closeConfirmModal();
    }
  }

  showErrorModal(message, actionText = null, actionCallback = null, type = 'error') {
    const modal = document.getElementById('errorModal');
    const messageEl = document.getElementById('errorMessage');
    const actionBtn = document.getElementById('errorActionBtn');
    const titleEl = modal?.querySelector('.error-title');
    
    if (!modal || !messageEl) return;

    messageEl.textContent = message;
    
    if (type === 'success') {
      if (titleEl) titleEl.textContent = 'Success';
      const iconEl = modal.querySelector('.error-icon');
      if (iconEl) iconEl.textContent = '✓';
    } else {
      if (titleEl) titleEl.textContent = 'Notice';
      const iconEl = modal.querySelector('.error-icon');
      if (iconEl) iconEl.textContent = '⚠️';
    }

    if (actionText && actionCallback && actionBtn) {
      actionBtn.textContent = actionText;
      actionBtn.style.display = 'block';
      this.errorActionCallback = actionCallback;
    } else if (actionBtn) {
      actionBtn.style.display = 'none';
      this.errorActionCallback = null;
    }

    modal.style.display = 'flex';
  }

  closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (!modal) return;
    modal.style.display = 'none';
    this.errorActionCallback = null;
  }

  handleErrorAction() {
    if (this.errorActionCallback) {
      this.errorActionCallback();
      this.closeErrorModal();
    } else {
      this.closeErrorModal();
    }
  }
}

// Initialize admin manager
const adminManager = new AdminManager();
