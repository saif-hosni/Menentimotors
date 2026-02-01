// Admin Management System
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
    const currentUser = JSON.parse(userStr);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const fullUser = users.find(u => u.id === currentUser.id);
    return fullUser && fullUser.isAdmin;
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
    // Check if admin is logged in and show/hide admin panel
    this.updateAdminPanel();

    // Listen for auth changes
    document.addEventListener('authStatusChanged', () => {
      this.updateAdminPanel();
      this.updateRequestLinkVisibility();
    });

    // Setup admin event listeners
    this.setupEventListeners();
    
    // Initial update of request link visibility
    this.updateRequestLinkVisibility();
  }

  // Update request link visibility based on auth status
  updateRequestLinkVisibility() {
    const requestLink = document.getElementById('requestVehicleLink');
    if (!requestLink) return;

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      // User is logged in - ensure link is clickable
      requestLink.style.opacity = '1';
      requestLink.style.pointerEvents = 'auto';
      requestLink.style.cursor = 'pointer';
    } else {
      // User is not logged in - make link appear disabled
      requestLink.style.opacity = '0.6';
      requestLink.style.pointerEvents = 'auto'; // Still clickable to show message
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

    // Confirmation modal buttons
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmCancel) {
      confirmCancel.addEventListener('click', () => this.closeConfirmModal());
    }
    if (confirmDelete) {
      confirmDelete.addEventListener('click', () => this.handleConfirmDelete());
    }

    // Close confirmation modal on backdrop click
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
      confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
          this.closeConfirmModal();
        }
      });
    }

    // Error modal buttons
    const errorClose = document.getElementById('errorClose');
    const errorActionBtn = document.getElementById('errorActionBtn');
    if (errorClose) {
      errorClose.addEventListener('click', () => this.closeErrorModal());
    }
    if (errorActionBtn) {
      errorActionBtn.addEventListener('click', () => this.handleErrorAction());
    }

    // Close error modal on backdrop click
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
      errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) {
          this.closeErrorModal();
        }
      });
    }

    // Close modal on backdrop click
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
      adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
          this.closeAdminModal();
        }
      });
    }

    // User request link (opens request modal)
    const requestLink = document.getElementById('requestVehicleLink');
    if (requestLink) {
      requestLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openRequestModal();
      });
    }

    // Request modal close and cancel
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

    // Click outside requests modal to close
    const requestsModal = document.getElementById('requestsModal');
    if (requestsModal) {
      requestsModal.addEventListener('click', (e) => {
        if (e.target === requestsModal) this.closeRequestsModal();
      });
    }
  }

  /* ---------- Requests: storage and UI ---------- */
  getRequests() {
    const reqStr = localStorage.getItem('vehicleRequests');
    return reqStr ? JSON.parse(reqStr) : [];
  }

  saveRequests(requests) {
    localStorage.setItem('vehicleRequests', JSON.stringify(requests));
  }

  submitRequest() {
    // Check if user is logged in
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

    // Sanitize all inputs
    if (typeof security !== 'undefined') {
      name = security.sanitizeInput(name);
      contact = security.sanitizeInput(contact);
      make = security.sanitizeInput(make);
      model = security.sanitizeInput(model);
      message = security.sanitizeInput(message);

      // Validate inputs
      const nameValidation = security.validateName(name);
      if (!nameValidation.valid) {
        this.showErrorModal(nameValidation.message);
        return;
      }

      // Validate contact (email or phone)
      const isEmail = security.validateEmail(contact);
      const isPhone = security.validatePhone(contact);
      if (!isEmail && !isPhone.valid) {
        this.showErrorModal('Please enter a valid email address or phone number.');
        return;
      }
    }

    // Validate required fields
    if (!name || !contact) {
      this.showErrorModal('Please fill in your name and contact information.');
      return;
    }

    // Length validation
    if (name.length > 100 || contact.length > 254 || make.length > 50 || model.length > 50 || message.length > 2000) {
      this.showErrorModal('One or more fields exceed the maximum length.');
      return;
    }

    const req = {
      id: Date.now().toString(),
      userId: currentUser.id, // Store user ID with request
      userName: currentUser.name, // Store user name
      userEmail: currentUser.email, // Store user email
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

    // Show success message
    this.showErrorModal('Request submitted — our team will contact you.', null, null, 'success');
    this.closeRequestModal();
  }

  openRequestModal() {
    // Check if user is logged in
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      // User is not logged in - show message and open auth modal
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
    
    // Auto-populate user information
    const nameInput = document.getElementById('reqName');
    const contactInput = document.getElementById('reqContact');
    if (nameInput) nameInput.value = currentUser.name || '';
    if (contactInput) contactInput.value = currentUser.email || '';
    
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  // Helper method to get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    const form = document.getElementById('requestForm');
    if (form) form.reset();
  }

  openRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (!modal) return;
    this.renderRequestsList();
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  closeRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
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
      reqDiv.style.padding = '12px';
      reqDiv.style.border = '1px solid rgba(255,255,255,0.04)';
      reqDiv.style.borderRadius = '8px';
      reqDiv.style.background = 'rgba(255,255,255,0.01)';

      // Sanitize all user inputs
      const safeName = typeof security !== 'undefined' ? security.sanitizeInput(req.name || '') : (req.name || '');
      const safeContact = typeof security !== 'undefined' ? security.sanitizeInput(req.contact || '') : (req.contact || '');
      const safeMake = typeof security !== 'undefined' ? security.sanitizeInput(req.make || '') : (req.make || '');
      const safeModel = typeof security !== 'undefined' ? security.sanitizeInput(req.model || '') : (req.model || '');
      const safeMessage = typeof security !== 'undefined' ? security.sanitizeInput(req.message || '') : (req.message || '');

      const innerDiv = document.createElement('div');
      innerDiv.style.display = 'flex';
      innerDiv.style.justifyContent = 'space-between';
      innerDiv.style.alignItems = 'start';
      innerDiv.style.gap = '12px';

      const leftDiv = document.createElement('div');
      const nameStrong = document.createElement('strong');
      nameStrong.textContent = safeName;
      leftDiv.appendChild(nameStrong);
      
      const contactSpan = document.createElement('span');
      contactSpan.className = 'muted';
      contactSpan.textContent = ' — ' + safeContact;
      leftDiv.appendChild(contactSpan);

      if (safeMake || safeModel) {
        const makeModelDiv = document.createElement('div');
        makeModelDiv.style.marginTop = '6px';
        makeModelDiv.textContent = (safeMake ? safeMake + ' ' : '') + (safeModel || '');
        leftDiv.appendChild(makeModelDiv);
      }

      const messageDiv = document.createElement('div');
      messageDiv.style.marginTop = '8px';
      if (safeMessage) {
        messageDiv.textContent = safeMessage;
      } else {
        const noMsgSpan = document.createElement('span');
        noMsgSpan.className = 'muted';
        noMsgSpan.textContent = '(no message)';
        messageDiv.appendChild(noMsgSpan);
      }
      leftDiv.appendChild(messageDiv);

      const dateDiv = document.createElement('div');
      dateDiv.className = 'muted';
      dateDiv.style.marginTop = '8px';
      dateDiv.style.fontSize = '12px';
      dateDiv.textContent = new Date(req.createdAt).toLocaleString();
      leftDiv.appendChild(dateDiv);

      const rightDiv = document.createElement('div');
      rightDiv.style.display = 'flex';
      rightDiv.style.flexDirection = 'column';
      rightDiv.style.gap = '8px';
      rightDiv.style.alignItems = 'flex-end';

      const resolveBtn = document.createElement('button');
      resolveBtn.className = 'btn-primary';
      resolveBtn.setAttribute('data-action', 'resolve');
      resolveBtn.setAttribute('data-id', req.id);
      resolveBtn.textContent = req.status === 'resolved' ? 'Resolved' : 'Mark Resolved';
      rightDiv.appendChild(resolveBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger';
      deleteBtn.setAttribute('data-action', 'delete');
      deleteBtn.setAttribute('data-id', req.id);
      deleteBtn.textContent = 'Delete';
      rightDiv.appendChild(deleteBtn);

      innerDiv.appendChild(leftDiv);
      innerDiv.appendChild(rightDiv);
      reqDiv.appendChild(innerDiv);

      container.appendChild(reqDiv);
    });

    // Attach handlers
    container.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (action === 'delete') this.deleteRequest(id);
        if (action === 'resolve') this.markRequestResolved(id);
      });
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

  // Add edit/delete buttons to each card
  addEditDeleteButtons() {
    // Only add controls for admins
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

        // Edit button
        controlsDiv.querySelector('.btn-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this.isCurrentUserAdmin()) return;
          this.openAdminModal(card);
        });

        // Delete button
        controlsDiv.querySelector('.btn-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this.isCurrentUserAdmin()) return;
          this.showConfirmModal(
            'Are you sure you want to delete this vehicle as admin?',
            () => {
              this.deleteVehicleCard(card);
            }
          );
        });
      }
    });
  }

  // Safe HTML creation helper
  safeSetHTML(element, html) {
    if (typeof security !== 'undefined') {
      // Use textContent for safety, or sanitize HTML
      element.textContent = '';
      const temp = document.createElement('div');
      temp.innerHTML = security.sanitizeHTML(html);
      while (temp.firstChild) {
        element.appendChild(temp.firstChild);
      }
    } else {
      element.innerHTML = html;
    }
  }

  removeEditDeleteButtons() {
    const controls = document.querySelectorAll('.card-admin-controls');
    controls.forEach(control => control.remove());
  }

  openAdminModal(cardElement = null) {
    // Guard: only admins may open admin modal
    if (!this.isCurrentUserAdmin()) return;
    const modal = document.getElementById('adminModal');
    const form = document.getElementById('adminVehicleForm');
    const deleteBtn = document.getElementById('deleteVehicleBtn');

    if (!modal) return;

    // Reset form
    form.reset();
    this.currentEditingCardId = null;

    if (cardElement) {
      // Edit mode
      this.currentEditingCardId = cardElement.getAttribute('data-card-id') || Date.now().toString();
      cardElement.setAttribute('data-card-id', this.currentEditingCardId);
      deleteBtn.style.display = 'block';

      // Populate form with card data
      const model = cardElement.querySelector('.model').textContent;
      const specs = cardElement.querySelector('.specs').textContent;
      const searchText = cardElement.getAttribute('data-search') || '';
      const category = cardElement.getAttribute('data-category') || '';
      const imageSrc = cardElement.querySelector('.card-media img')?.getAttribute('data-src') || '';

      // Parse model into make and model
      const modelParts = model.split(' ');
      const make = modelParts[0];
      const modelName = modelParts.slice(1).join(' ');

      document.getElementById('vehicleMake').value = make;
      document.getElementById('vehicleModel').value = modelName;
      document.getElementById('vehicleCategory').value = category;
      document.getElementById('vehicleSpecs').value = specs;
      document.getElementById('vehicleSearch').value = searchText;
      document.getElementById('vehicleImage').value = imageSrc;

      // Get year and price
      const moreItems = cardElement.querySelectorAll('.more p');
      if (moreItems.length >= 2) {
        const yearText = moreItems[0].textContent;
        const priceText = moreItems[1].textContent;
        document.getElementById('vehicleYear').value = yearText.replace('Year: ', '');
        document.getElementById('vehiclePrice').value = priceText.replace('Price: € ', '');
      }

      // Get specs from card-extended
      const specItems = cardElement.querySelectorAll('.card-specs .spec-item');
      specItems.forEach(item => {
        const label = item.querySelector('.spec-label').textContent.toLowerCase();
        const value = item.querySelector('.spec-value').textContent;

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
      // Add mode
      deleteBtn.style.display = 'none';
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      this.currentEditingCardId = null;
    }
  }

  saveVehicle() {
    // Guard: only admins may save vehicles
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
      // Update existing card
      const card = document.querySelector(`[data-card-id="${this.currentEditingCardId}"]`);
      if (card) {
        this.updateCardElement(card, {
          make,
          model,
          category,
          specs,
          year,
          price,
          image,
          search,
          engine,
          hp,
          speed060,
          topSpeed
        });
      }
    } else {
      // Create new card
      this.createCardElement({
        make,
        model,
        category,
        specs,
        year,
        price,
        image,
        search,
        engine,
        hp,
        speed060,
        topSpeed
      });
    }

    this.closeAdminModal();
  }

  createCardElement(data) {
    // Guard: only admins may create cards
    if (!this.isCurrentUserAdmin()) {
      this.showErrorModal('You do not have permission to perform this action.');
      return;
    }
    const grid = document.getElementById('vehicleGrid');
    if (!grid) return;

    const cardId = Date.now().toString();
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-category', data.category);
    card.setAttribute('data-search', data.search);
    card.setAttribute('data-card-id', cardId);

    // Sanitize all data inputs
    const safeMake = typeof security !== 'undefined' ? security.sanitizeInput(data.make || '') : (data.make || '');
    const safeModel = typeof security !== 'undefined' ? security.sanitizeInput(data.model || '') : (data.model || '');
    const safeSpecs = typeof security !== 'undefined' ? security.sanitizeInput(data.specs || '') : (data.specs || '');
    const safeImage = typeof security !== 'undefined' ? security.sanitizeInput(data.image || '') : (data.image || '');
    const safeEngine = typeof security !== 'undefined' ? security.sanitizeInput(data.engine || '') : (data.engine || '');
    const safeHP = typeof security !== 'undefined' ? security.sanitizeInput(data.hp || '') : (data.hp || '');
    const safeSpeed060 = typeof security !== 'undefined' ? security.sanitizeInput(data.speed060 || '') : (data.speed060 || '');
    const safeTopSpeed = typeof security !== 'undefined' ? security.sanitizeInput(data.topSpeed || '') : (data.topSpeed || '');
    const safeYear = typeof security !== 'undefined' ? security.sanitizeInput(String(data.year || '')) : String(data.year || '');
    const safePrice = typeof security !== 'undefined' ? security.sanitizeInput(String(data.price || '')) : String(data.price || '');

    // Build HTML safely
    const cardHTML = `
      <div class="card-media">
        <img data-src="${safeImage}" alt="${safeMake} ${safeModel}" class="lazy">
      </div>
      <div class="card-body">
        <h3 class="model">${safeMake} ${safeModel}</h3>
        <p class="specs">${safeSpecs}</p>
        <div class="more">
          <p><span data-i18n="vehicle.year">Year</span>: ${safeYear}</p>
          <p><span data-i18n="vehicle.price">Price</span>: € ${safePrice}</p>
          <a href="#" class="btn" data-i18n="vehicle.viewDetails">View details</a>
        </div>
      </div>
      <div class="card-extended">
        <h4 data-i18n="vehicle.specs">Technical Specifications</h4>
        <div class="card-specs">
          <div class="spec-item">
            <span class="spec-label" data-i18n="vehicle.engine">Engine:</span>
            <span class="spec-value">${safeEngine}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label" data-i18n="vehicle.horsepower">Horsepower:</span>
            <span class="spec-value">${safeHP}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label" data-i18n="vehicle.torque">Torque:</span>
            <span class="spec-value"></span>
          </div>
          <div class="spec-item">
            <span class="spec-label" data-i18n="vehicle.transmission">Transmission:</span>
            <span class="spec-value"></span>
          </div>
          <div class="spec-item">
            <span class="spec-label" data-i18n="vehicle.zeroToSixty">0-60 mph:</span>
            <span class="spec-value">${safeSpeed060}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label" data-i18n="vehicle.topSpeed">Top Speed:</span>
            <span class="spec-value">${safeTopSpeed}</span>
          </div>
        </div>
        <div class="price-tag">€ ${safePrice}</div>
      </div>
    `;
    
    this.safeSetHTML(card, cardHTML);

    grid.appendChild(card);
    this.addEditDeleteButtons();
    
    // Update language for the new card if language system is available
    if (typeof lang !== 'undefined' && lang.updatePage) {
      // Update translations for elements in the new card
      card.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          el.textContent = lang.t(key);
        }
      });
    }
  }

  updateCardElement(card, data) {
    // Guard: only admins may update cards
    if (!this.isCurrentUserAdmin()) {
      this.showErrorModal('You do not have permission to perform this action.');
      return;
    }
    card.setAttribute('data-category', data.category);
    card.setAttribute('data-search', data.search);

    card.querySelector('.model').textContent = `${data.make} ${data.model}`;
    card.querySelector('.specs').textContent = data.specs;

    const moreItems = card.querySelectorAll('.more p');
    if (moreItems[0]) {
      // Preserve data-i18n structure for Year
      const yearSpan = moreItems[0].querySelector('span[data-i18n="vehicle.year"]');
      if (yearSpan) {
        const safeYear = typeof security !== 'undefined' ? security.sanitizeInput(String(data.year || '')) : String(data.year || '');
        moreItems[0].innerHTML = `<span data-i18n="vehicle.year">${yearSpan.textContent}</span>: ${safeYear}`;
      } else {
        const safeYear = typeof security !== 'undefined' ? security.sanitizeInput(String(data.year || '')) : String(data.year || '');
        moreItems[0].innerHTML = `<span data-i18n="vehicle.year">Year</span>: ${safeYear}`;
      }
    }
    if (moreItems[1]) {
      // Preserve data-i18n structure for Price
      const priceSpan = moreItems[1].querySelector('span[data-i18n="vehicle.price"]');
      const safePrice = typeof security !== 'undefined' ? security.sanitizeInput(String(data.price || '')) : String(data.price || '');
      if (priceSpan) {
        moreItems[1].innerHTML = `<span data-i18n="vehicle.price">${priceSpan.textContent}</span>: € ${safePrice}`;
      } else {
        moreItems[1].innerHTML = `<span data-i18n="vehicle.price">Price</span>: € ${safePrice}`;
      }
    }

    const img = card.querySelector('.card-media img');
    if (img) img.setAttribute('data-src', data.image);

    const specItems = card.querySelectorAll('.card-specs .spec-item');
    specItems.forEach(item => {
      const label = item.querySelector('.spec-label').textContent.toLowerCase();
      const valueSpan = item.querySelector('.spec-value');

      if (label.includes('engine')) {
        valueSpan.textContent = data.engine;
      } else if (label.includes('horsepower')) {
        valueSpan.textContent = data.hp;
      } else if (label.includes('0-60')) {
        valueSpan.textContent = data.speed060;
      } else if (label.includes('top speed')) {
        valueSpan.textContent = data.topSpeed;
      }
    });

    const priceTag = card.querySelector('.price-tag');
    if (priceTag) priceTag.textContent = `€ ${data.price}`;
    
    // Update language for the updated card if language system is available
    if (typeof lang !== 'undefined' && lang.updatePage) {
      // Update translations for elements in the updated card
      card.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          // For year and price spans, we need to preserve the structure
          if (key === 'vehicle.year' || key === 'vehicle.price') {
            // The span text should be translated, but we keep the structure
            el.textContent = lang.t(key);
          } else {
            el.textContent = lang.t(key);
          }
        }
      });
    }
  }

  deleteVehicleCard(card) {
    // Guard: only admins may delete
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

  // Confirmation modal methods
  showConfirmModal(message, callback) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    if (!modal || !messageEl) return;

    messageEl.textContent = message;
    this.confirmCallback = callback;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    this.confirmCallback = null;
  }

  handleConfirmDelete() {
    if (this.confirmCallback) {
      this.confirmCallback();
      this.closeConfirmModal();
    }
  }

  // Error modal methods
  showErrorModal(message, actionText = null, actionCallback = null, type = 'error') {
    const modal = document.getElementById('errorModal');
    const messageEl = document.getElementById('errorMessage');
    const actionBtn = document.getElementById('errorActionBtn');
    const titleEl = modal?.querySelector('.error-title');
    
    if (!modal || !messageEl) return;

    messageEl.textContent = message;
    
    const contentEl = modal.querySelector('.error-modal-content');
    
    // Update title and icon based on type
    if (type === 'success') {
      if (titleEl) titleEl.textContent = 'Success';
      const iconEl = modal.querySelector('.error-icon');
      if (iconEl) iconEl.textContent = '✓';
      if (contentEl) contentEl.style.borderColor = 'rgba(0, 255, 0, 0.3)';
    } else {
      if (titleEl) titleEl.textContent = 'Notice';
      const iconEl = modal.querySelector('.error-icon');
      if (iconEl) iconEl.textContent = '⚠️';
      if (contentEl) contentEl.style.borderColor = 'rgba(212, 0, 0, 0.3)';
    }

    // Show/hide action button
    if (actionText && actionCallback) {
      if (actionBtn) {
        actionBtn.textContent = actionText;
        actionBtn.style.display = 'block';
        this.errorActionCallback = actionCallback;
      }
    } else {
      if (actionBtn) {
        actionBtn.style.display = 'none';
      }
      this.errorActionCallback = null;
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
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
