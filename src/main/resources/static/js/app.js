/**
 * SmartStore - Inventory & Reorder Alert Dashboard
 * Client Application Logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    products: [],
    movements: [],
    alerts: [],
    stocks: {}, // productId -> currentStock
    currentView: 'dashboard',
    analyticsData: [],
    isLoading: false
  };

  // API Client Base
  const api = {
    baseUrl: '/api',

    async get(endpoint) {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP Error ${response.status}`);
      }
      return response.json();
    },

    async post(endpoint, data) {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP Error ${response.status}`);
      }
      return response.json();
    },

    async put(endpoint, data) {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP Error ${response.status}`);
      }
      return response.json();
    },

    async delete(endpoint) {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP Error ${response.status}`);
      }
      return response.text();
    }
  };

  // DOM Elements
  const DOM = {
    navLinks: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view-panel'),
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    sidebarAlertBadge: document.getElementById('sidebar-alert-badge'),
    urgentAlertBanner: document.getElementById('urgent-alert-banner'),
    bannerAlertDesc: document.getElementById('banner-alert-desc'),
    btnViewAlertsFromBanner: document.getElementById('btn-view-alerts-from-banner'),
    btnRefreshAll: document.getElementById('btn-refresh-all'),

    // KPI Elements
    kpiTotalProducts: document.getElementById('kpi-total-products'),
    kpiActiveAlerts: document.getElementById('kpi-active-alerts'),
    kpiLowStock: document.getElementById('kpi-low-stock'),
    kpiTotalMovements: document.getElementById('kpi-total-movements'),

    // Tables
    dashboardAlertsTbody: document.getElementById('dashboard-alerts-tbody'),
    dashboardMovementsTbody: document.getElementById('dashboard-movements-tbody'),
    productsTbody: document.getElementById('products-tbody'),
    movementsTbody: document.getElementById('movements-tbody'),
    alertsTbody: document.getElementById('alerts-tbody'),
    productHistoryTbody: document.getElementById('product-history-tbody'),

    // Filters
    productsSearchInput: document.getElementById('products-search-input'),
    productsCategoryFilter: document.getElementById('products-category-filter'),
    productsStockFilter: document.getElementById('products-stock-filter'),
    movementsProductFilter: document.getElementById('movements-product-filter'),
    movementsTypeFilter: document.getElementById('movements-type-filter'),
    movementsReasonFilter: document.getElementById('movements-reason-filter'),
    alertsStatusFilter: document.getElementById('alerts-status-filter'),

    // Analytics
    analyticsStartDate: document.getElementById('analytics-start-date'),
    analyticsEndDate: document.getElementById('analytics-end-date'),
    btnRunAnalytics: document.getElementById('btn-run-analytics'),
    analyticsChartContainer: document.getElementById('analytics-chart-container'),

    // Action Buttons
    btnOpenProductModal: document.getElementById('btn-open-product-modal'),
    btnOpenMovementModal: document.getElementById('btn-open-movement-modal'),
    btnGotoAlerts: document.getElementById('btn-goto-alerts'),
    btnGotoMovements: document.getElementById('btn-goto-movements'),

    // Modals
    modalProduct: document.getElementById('modal-product'),
    modalProductTitle: document.getElementById('modal-product-title'),
    formProduct: document.getElementById('form-product'),
    productId: document.getElementById('product-id'),
    productName: document.getElementById('product-name'),
    productSku: document.getElementById('product-sku'),
    productCategory: document.getElementById('product-category'),
    productThreshold: document.getElementById('product-threshold'),
    productQuantity: document.getElementById('product-quantity'),
    btnCloseProductModal: document.getElementById('btn-close-product-modal'),
    btnCancelProductModal: document.getElementById('btn-cancel-product-modal'),

    modalMovement: document.getElementById('modal-movement'),
    formMovement: document.getElementById('form-movement'),
    movementProductSelect: document.getElementById('movement-product-select'),
    movementReasonSelect: document.getElementById('movement-reason-select'),
    movementTypeHintText: document.getElementById('movement-type-hint-text'),
    movementCurrentStockInfo: document.getElementById('movement-current-stock-info'),
    movementQuantity: document.getElementById('movement-quantity'),
    movementNotes: document.getElementById('movement-notes'),
    btnCloseMovementModal: document.getElementById('btn-close-movement-modal'),
    btnCancelMovementModal: document.getElementById('btn-cancel-movement-modal'),

    modalHistory: document.getElementById('modal-history'),
    modalHistoryTitle: document.getElementById('modal-history-title'),
    btnCloseHistoryModal: document.getElementById('btn-close-history-modal'),
    btnCloseHistoryFooter: document.getElementById('btn-close-history-footer'),

    toastContainer: document.getElementById('toast-container')
  };

  // Toast Notification System
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Helper formatting functions
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(isoStr) {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  }

  function formatISODateTime(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function getReasonBadge(reason) {
    switch (reason) {
      case 'PURCHASE':
        return `<span class="badge badge-reason-purchase">Purchase (IN)</span>`;
      case 'SALE':
        return `<span class="badge badge-reason-sale">Sale (OUT)</span>`;
      case 'RETURN':
        return `<span class="badge badge-reason-return">Return (IN)</span>`;
      case 'DAMAGE':
        return `<span class="badge badge-reason-damage">Damage (OUT)</span>`;
      default:
        return `<span class="badge">${reason || '-'}</span>`;
    }
  }

  function getStockTag(stock, threshold) {
    if (stock <= 0) {
      return `<span class="stock-tag out">Out of Stock</span>`;
    }
    if (stock <= threshold) {
      return `<span class="stock-tag low">Low Stock</span>`;
    }
    return `<span class="stock-tag optimal">In Stock</span>`;
  }

  // Navigation and Views Switching
  function switchView(viewId) {
    state.currentView = viewId;

    DOM.views.forEach(panel => {
      panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`view-${viewId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    DOM.navLinks.forEach(link => {
      if (link.dataset.view === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const viewTitles = {
      dashboard: { title: 'Inventory Operations Center', subtitle: 'Real-time stock monitor & automated reorder intelligence' },
      products: { title: 'Product Catalog & Inventory', subtitle: 'Manage SKUs, categories, and safety stock thresholds' },
      movements: { title: 'Stock Movement Audit Log', subtitle: 'Track purchases, sales, customer returns, and scrap write-offs' },
      alerts: { title: 'Reorder Alerts Command', subtitle: 'Monitor stock deficiencies and execute replenishment orders' },
      analytics: { title: 'Product Velocity Analytics', subtitle: 'Identify fast-moving inventory items over customizable time windows' }
    };

    if (viewTitles[viewId]) {
      DOM.pageTitle.textContent = viewTitles[viewId].title;
      DOM.pageSubtitle.textContent = viewTitles[viewId].subtitle;
    }

    // Refresh view specific components if necessary
    if (viewId === 'analytics' && state.analyticsData.length === 0) {
      loadFastMovingProducts();
    }
  }

  // Data Fetching & Syncing
  async function loadAllData() {
    state.isLoading = true;
    try {
      const [products, movements, alerts] = await Promise.all([
        api.get('/products').catch(() => []),
        api.get('/stock-movements').catch(() => []),
        api.get('/reorder-alerts').catch(() => [])
      ]);

      state.products = products;
      state.movements = movements.sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));
      state.alerts = alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Calculate stock for each product
      await updateAllStocks();

      renderDashboard();
      renderProducts();
      renderMovements();
      renderAlerts();
      populateSelectOptions();

    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('Error syncing system data: ' + err.message, 'error');
    } finally {
      state.isLoading = false;
    }
  }

  async function updateAllStocks() {
    const stockPromises = state.products.map(async (p) => {
      try {
        const stock = await api.get(`/stock-movements/product/${p.productId}/stock`);
        state.stocks[p.productId] = stock;
      } catch {
        state.stocks[p.productId] = 0;
      }
    });
    await Promise.all(stockPromises);
  }

  function populateSelectOptions() {
    // Populate Product Category Filter
    const categories = Array.from(new Set(state.products.map(p => p.category).filter(Boolean))).sort();
    DOM.productsCategoryFilter.innerHTML = '<option value="">All Categories</option>' +
      categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

    // Populate Movement Product Select in Modal & Filter
    const productOptions = state.products.map(p => 
      `<option value="${p.productId}">${escapeHtml(p.productName)} (${escapeHtml(p.sku)})</option>`
    ).join('');

    DOM.movementProductSelect.innerHTML = '<option value="">-- Choose Product --</option>' + productOptions;
    DOM.movementsProductFilter.innerHTML = '<option value="">All Products</option>' + productOptions;
  }

  // ==========================================================================
  // Render: Dashboard View
  // ==========================================================================
  function renderDashboard() {
    const totalProducts = state.products.length;
    const openAlerts = state.alerts.filter(a => a.status === 'OPEN');
    const openAlertsCount = openAlerts.length;

    let lowStockCount = 0;
    state.products.forEach(p => {
      const stock = state.stocks[p.productId] ?? 0;
      if (stock <= (p.reorderThreshold ?? 0)) {
        lowStockCount++;
      }
    });

    DOM.kpiTotalProducts.textContent = totalProducts;
    DOM.kpiActiveAlerts.textContent = openAlertsCount;
    DOM.kpiLowStock.textContent = lowStockCount;
    DOM.kpiTotalMovements.textContent = state.movements.length;

    // Sidebar badge
    if (openAlertsCount > 0) {
      DOM.sidebarAlertBadge.textContent = openAlertsCount;
      DOM.sidebarAlertBadge.classList.remove('hidden');

      DOM.urgentAlertBanner.classList.remove('hidden');
      DOM.bannerAlertDesc.textContent = `${openAlertsCount} product(s) are critically low and require immediate restocking!`;
    } else {
      DOM.sidebarAlertBadge.classList.add('hidden');
      DOM.urgentAlertBanner.classList.add('hidden');
    }

    // Dashboard Recent Alerts (Open alerts first, top 5)
    if (openAlerts.length === 0) {
      DOM.dashboardAlertsTbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>All stock levels healthy! No active reorder alerts.</p>
          </td>
        </tr>`;
    } else {
      DOM.dashboardAlertsTbody.innerHTML = openAlerts.slice(0, 5).map(alert => {
        const prod = alert.product || {};
        const currentStock = state.stocks[prod.productId] ?? alert.stockAtAlert ?? 0;
        return `
          <tr>
            <td><strong>${escapeHtml(prod.productName || 'Unknown')}</strong></td>
            <td><code>${escapeHtml(prod.sku || '-')}</code></td>
            <td><span class="stock-number">${currentStock}</span></td>
            <td>${alert.threshold ?? prod.reorderThreshold ?? '-'}</td>
            <td><strong>${alert.reorderQuantity ?? prod.reorderQuantity ?? '-'} units</strong></td>
            <td>${formatDate(alert.createdAt)}</td>
            <td>
              <button class="btn btn-success btn-table-action" onclick="app.quickReorder(${prod.productId}, ${alert.reorderQuantity || 50})">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Restock IN
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Dashboard Recent Movements (top 5)
    if (state.movements.length === 0) {
      DOM.dashboardMovementsTbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <p>No inventory movements logged yet.</p>
          </td>
        </tr>`;
    } else {
      DOM.dashboardMovementsTbody.innerHTML = state.movements.slice(0, 5).map(m => {
        const prod = m.product || {};
        const isIN = m.movementType === 'IN';
        return `
          <tr>
            <td>${formatDate(m.movementDate)}</td>
            <td><strong>${escapeHtml(prod.productName || 'Unknown')}</strong></td>
            <td><span class="badge ${isIN ? 'badge-in' : 'badge-out'}">${m.movementType}</span></td>
            <td><strong>${m.quantity}</strong></td>
            <td>${getReasonBadge(m.reason)}</td>
            <td><span class="form-helper">${escapeHtml(m.notes || '-')}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // ==========================================================================
  // Render: Products View
  // ==========================================================================
  function renderProducts() {
    const searchTerm = DOM.productsSearchInput.value.toLowerCase().trim();
    const selectedCat = DOM.productsCategoryFilter.value;
    const stockFilter = DOM.productsStockFilter.value;

    const filtered = state.products.filter(p => {
      const matchSearch = !searchTerm ||
        p.productName.toLowerCase().includes(searchTerm) ||
        p.sku.toLowerCase().includes(searchTerm);

      const matchCat = !selectedCat || p.category === selectedCat;

      const currentStock = state.stocks[p.productId] ?? 0;
      let matchStock = true;
      if (stockFilter === 'OPTIMAL') {
        matchStock = currentStock > (p.reorderThreshold ?? 0);
      } else if (stockFilter === 'LOW') {
        matchStock = currentStock <= (p.reorderThreshold ?? 0) && currentStock > 0;
      } else if (stockFilter === 'OUT') {
        matchStock = currentStock <= 0;
      }

      return matchSearch && matchCat && matchStock;
    });

    if (filtered.length === 0) {
      DOM.productsTbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 21l-4.35-4.35"/>
              <circle cx="11" cy="11" r="7"/>
            </svg>
            <p>No products match your current filters.</p>
            <button class="btn btn-primary" onclick="app.openProductModal()">+ Add New Product</button>
          </td>
        </tr>`;
      return;
    }

    DOM.productsTbody.innerHTML = filtered.map(p => {
      const currentStock = state.stocks[p.productId] ?? 0;
      return `
        <tr>
          <td>
            <strong>${escapeHtml(p.productName)}</strong>
          </td>
          <td><code>${escapeHtml(p.sku)}</code></td>
          <td><span class="badge badge-category">${escapeHtml(p.category || 'General')}</span></td>
          <td>
            <div class="stock-meter">
              <span class="stock-number">${currentStock}</span>
              ${getStockTag(currentStock, p.reorderThreshold)}
            </div>
          </td>
          <td>${p.reorderThreshold ?? '-'}</td>
          <td>${p.reorderQuantity ?? '-'}</td>
          <td>
            <div class="table-actions">
              <button class="btn-table-action" title="Record Movement" onclick="app.openMovementForProduct(${p.productId})">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4M7 4 3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>
                Movement
              </button>
              <button class="btn-table-action" title="View History" onclick="app.viewProductHistory(${p.productId}, '${escapeHtml(p.productName)}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
              <button class="btn-table-action" title="Edit Product" onclick="app.editProduct(${p.productId})">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
              <button class="btn-table-action delete" title="Delete Product" onclick="app.deleteProduct(${p.productId}, '${escapeHtml(p.productName)}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // Render: Movements View
  // ==========================================================================
  function renderMovements() {
    const prodFilter = DOM.movementsProductFilter.value;
    const typeFilter = DOM.movementsTypeFilter.value;
    const reasonFilter = DOM.movementsReasonFilter.value;

    const filtered = state.movements.filter(m => {
      const matchProd = !prodFilter || (m.product && String(m.product.productId) === prodFilter);
      const matchType = !typeFilter || m.movementType === typeFilter;
      const matchReason = !reasonFilter || m.reason === reasonFilter;
      return matchProd && matchType && matchReason;
    });

    if (filtered.length === 0) {
      DOM.movementsTbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <p>No stock movement logs found for this filter criteria.</p>
          </td>
        </tr>`;
      return;
    }

    DOM.movementsTbody.innerHTML = filtered.map(m => {
      const prod = m.product || {};
      const isIN = m.movementType === 'IN';
      return `
        <tr>
          <td><code>#${m.movementId}</code></td>
          <td>${formatDate(m.movementDate)}</td>
          <td>
            <strong>${escapeHtml(prod.productName || 'Unknown')}</strong>
            <span class="form-helper">(${escapeHtml(prod.sku || '-')})</span>
          </td>
          <td><span class="badge ${isIN ? 'badge-in' : 'badge-out'}">${m.movementType}</span></td>
          <td><strong style="font-size: 1rem;">${m.quantity}</strong></td>
          <td>${getReasonBadge(m.reason)}</td>
          <td>${escapeHtml(m.notes || '-')}</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // Render: Alerts View
  // ==========================================================================
  function renderAlerts() {
    const statusFilter = DOM.alertsStatusFilter.value;

    const filtered = state.alerts.filter(a => {
      return !statusFilter || a.status === statusFilter;
    });

    if (filtered.length === 0) {
      DOM.alertsTbody.innerHTML = `
        <tr>
          <td colspan="10" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>No reorder alerts match the selected status.</p>
          </td>
        </tr>`;
      return;
    }

    DOM.alertsTbody.innerHTML = filtered.map(a => {
      const prod = a.product || {};
      const isOpen = a.status === 'OPEN';
      return `
        <tr>
          <td><code>#${a.alertId}</code></td>
          <td><strong>${escapeHtml(prod.productName || 'Unknown')}</strong></td>
          <td><code>${escapeHtml(prod.sku || '-')}</code></td>
          <td><span class="stock-number">${a.stockAtAlert ?? '-'}</span></td>
          <td>${a.threshold ?? '-'}</td>
          <td><strong>${a.reorderQuantity ?? '-'}</strong></td>
          <td>
            <span class="badge ${isOpen ? 'badge-open' : 'badge-fulfilled'}">
              ${a.status}
            </span>
          </td>
          <td>${formatDate(a.createdAt)}</td>
          <td>${a.fulfilledAt ? formatDate(a.fulfilledAt) : '-'}</td>
          <td>
            ${isOpen ? `
              <div class="table-actions">
                <button class="btn btn-success btn-table-action" onclick="app.quickReorder(${prod.productId}, ${a.reorderQuantity || 50})">
                  Restock IN
                </button>
                <button class="btn btn-secondary btn-table-action" onclick="app.fulfillAlert(${a.alertId})">
                  Mark Fulfilled
                </button>
              </div>
            ` : `<span class="form-helper">Resolved</span>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // Product Operations (Create / Edit / Delete)
  // ==========================================================================
  function openProductModal(productId = null) {
    DOM.formProduct.reset();
    DOM.productId.value = '';

    if (productId) {
      const p = state.products.find(item => item.productId === productId);
      if (p) {
        DOM.modalProductTitle.textContent = 'Edit Product';
        DOM.productId.value = p.productId;
        DOM.productName.value = p.productName;
        DOM.productSku.value = p.sku;
        DOM.productCategory.value = p.category || '';
        DOM.productThreshold.value = p.reorderThreshold ?? '';
        DOM.productQuantity.value = p.reorderQuantity ?? '';
      }
    } else {
      DOM.modalProductTitle.textContent = 'Add New Product';
    }

    DOM.modalProduct.classList.add('active');
    DOM.productName.focus();
  }

  function closeProductModal() {
    DOM.modalProduct.classList.remove('active');
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    const id = DOM.productId.value;
    const productPayload = {
      productName: DOM.productName.value.trim(),
      sku: DOM.productSku.value.trim(),
      category: DOM.productCategory.value.trim() || 'General',
      reorderThreshold: parseInt(DOM.productThreshold.value, 10),
      reorderQuantity: parseInt(DOM.productQuantity.value, 10)
    };

    try {
      if (id) {
        await api.put(`/products/${id}`, productPayload);
        showToast(`Product "${productPayload.productName}" updated successfully!`, 'success');
      } else {
        await api.post('/products', productPayload);
        showToast(`Product "${productPayload.productName}" created successfully!`, 'success');
      }
      closeProductModal();
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete product "${productName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      showToast(`Product "${productName}" deleted successfully.`, 'info');
      await loadAllData();
    } catch (err) {
      showToast('Could not delete product: ' + err.message, 'error');
    }
  }

  // ==========================================================================
  // Stock Movement Operations
  // ==========================================================================
  function openMovementModal(preselectedProductId = null) {
    DOM.formMovement.reset();
    if (preselectedProductId) {
      DOM.movementProductSelect.value = preselectedProductId;
      updateMovementStockDisplay(preselectedProductId);
    } else {
      DOM.movementCurrentStockInfo.textContent = '';
    }
    updateMovementHint();
    DOM.modalMovement.classList.add('active');
  }

  function closeMovementModal() {
    DOM.modalMovement.classList.remove('active');
  }

  function updateMovementStockDisplay(productId) {
    if (!productId) {
      DOM.movementCurrentStockInfo.textContent = '';
      return;
    }
    const currentStock = state.stocks[productId] ?? 0;
    DOM.movementCurrentStockInfo.innerHTML = `Current in stock: <strong>${currentStock} units</strong>`;
  }

  function updateMovementHint() {
    const reason = DOM.movementReasonSelect.value;
    if (reason === 'PURCHASE') {
      DOM.movementTypeHintText.textContent = 'Stock IN: Increases stock and automatically fulfills open reorder alerts.';
    } else if (reason === 'SALE') {
      DOM.movementTypeHintText.textContent = 'Stock OUT: Decreases inventory based on customer sale. Checks reorder threshold.';
    } else if (reason === 'RETURN') {
      DOM.movementTypeHintText.textContent = 'Stock IN: Increases inventory for customer return item.';
    } else if (reason === 'DAMAGE') {
      DOM.movementTypeHintText.textContent = 'Stock OUT: Decreases inventory for broken / expired write-offs.';
    }
  }

  async function handleMovementSubmit(e) {
    e.preventDefault();
    const productId = DOM.movementProductSelect.value;
    if (!productId) {
      showToast('Please select a product', 'error');
      return;
    }

    const reason = DOM.movementReasonSelect.value;
    const quantity = parseInt(DOM.movementQuantity.value, 10);
    const notes = DOM.movementNotes.value.trim();

    const payload = {
      reason: reason,
      quantity: quantity,
      notes: notes
    };

    try {
      await api.post(`/stock-movements/${productId}`, payload);
      showToast(`Stock movement recorded successfully!`, 'success');
      closeMovementModal();
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Quick Restock Shortcut
  function quickReorder(productId, defaultQty = 50) {
    openMovementModal(productId);
    DOM.movementReasonSelect.value = 'PURCHASE';
    DOM.movementQuantity.value = defaultQty;
    DOM.movementNotes.value = 'Automated restock order';
    updateMovementHint();
  }

  // Fulfill Alert
  async function fulfillAlert(alertId) {
    try {
      await api.put(`/reorder-alerts/${alertId}/fulfill`);
      showToast(`Alert #${alertId} marked as fulfilled!`, 'success');
      await loadAllData();
    } catch (err) {
      showToast('Failed to fulfill alert: ' + err.message, 'error');
    }
  }

  // ==========================================================================
  // Product History Modal
  // ==========================================================================
  async function viewProductHistory(productId, productName) {
    DOM.modalHistoryTitle.textContent = `Stock History: ${productName}`;
    DOM.productHistoryTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Loading movement records...</td></tr>`;
    DOM.modalHistory.classList.add('active');

    try {
      const history = await api.get(`/stock-movements/product/${productId}`);
      if (!history || history.length === 0) {
        DOM.productHistoryTbody.innerHTML = `<tr><td colspan="5" class="empty-state"><p>No stock movement history recorded for this product.</p></td></tr>`;
        return;
      }

      history.sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));

      DOM.productHistoryTbody.innerHTML = history.map(m => {
        const isIN = m.movementType === 'IN';
        return `
          <tr>
            <td>${formatDate(m.movementDate)}</td>
            <td><span class="badge ${isIN ? 'badge-in' : 'badge-out'}">${m.movementType}</span></td>
            <td><strong>${m.quantity}</strong></td>
            <td>${getReasonBadge(m.reason)}</td>
            <td>${escapeHtml(m.notes || '-')}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      DOM.productHistoryTbody.innerHTML = `<tr><td colspan="5" style="color: var(--danger); text-align: center;">Failed to load history: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  // ==========================================================================
  // Velocity Analytics View
  // ==========================================================================
  function setupDefaultAnalyticsDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30); // Default to last 30 days

    // Format for datetime-local input
    const toInputVal = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    DOM.analyticsStartDate.value = toInputVal(start);
    DOM.analyticsEndDate.value = toInputVal(end);
  }

  async function loadFastMovingProducts() {
    let startVal = DOM.analyticsStartDate.value;
    let endVal = DOM.analyticsEndDate.value;

    if (!startVal || !endVal) {
      setupDefaultAnalyticsDates();
      startVal = DOM.analyticsStartDate.value;
      endVal = DOM.analyticsEndDate.value;
    }

    // Format to ISO string for backend LocalDateTime.parse
    const startIso = `${startVal}:00`;
    const endIso = `${endVal}:00`;

    DOM.analyticsChartContainer.innerHTML = `<p style="text-align: center; color: var(--text-dim);">Calculating velocity analytics...</p>`;

    try {
      const data = await api.get(`/stock-movements/fast-moving?startDate=${encodeURIComponent(startIso)}&endDate=${encodeURIComponent(endIso)}`);
      state.analyticsData = data;
      renderAnalyticsChart(data);
    } catch (err) {
      DOM.analyticsChartContainer.innerHTML = `<p style="color: var(--danger); text-align: center;">Error running velocity report: ${escapeHtml(err.message)}</p>`;
    }
  }

  function renderAnalyticsChart(items) {
    if (!items || items.length === 0) {
      DOM.analyticsChartContainer.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p>No sales recorded within this date range.</p>
        </div>`;
      return;
    }

    // Find maximum sales quantity for scaling
    const maxSales = Math.max(...items.map(i => i.salesQuantity || 1), 1);

    DOM.analyticsChartContainer.innerHTML = items.map((item, idx) => {
      const pct = Math.round((item.salesQuantity / maxSales) * 100);
      return `
        <div class="chart-item">
          <div class="chart-labels">
            <span>#${idx + 1}. ${escapeHtml(item.productName)}</span>
            <span>${item.salesQuantity} units sold</span>
          </div>
          <div class="chart-track">
            <div class="chart-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // Event Listeners Registration
  // ==========================================================================
  function initEventListeners() {
    // Navigation Links
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        switchView(view);
      });
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      switchView(hash);
    });

    // Quick banner & button routing
    DOM.btnViewAlertsFromBanner.addEventListener('click', () => switchView('alerts'));
    DOM.btnGotoAlerts.addEventListener('click', () => switchView('alerts'));
    DOM.btnGotoMovements.addEventListener('click', () => switchView('movements'));
    DOM.btnRefreshAll.addEventListener('click', async () => {
      await loadAllData();
      showToast('Data refreshed successfully', 'info');
    });

    // Product Modal & Form
    DOM.btnOpenProductModal.addEventListener('click', () => openProductModal());
    DOM.btnCloseProductModal.addEventListener('click', closeProductModal);
    DOM.btnCancelProductModal.addEventListener('click', closeProductModal);
    DOM.formProduct.addEventListener('submit', handleProductSubmit);

    // Movement Modal & Form
    DOM.btnOpenMovementModal.addEventListener('click', () => openMovementModal());
    DOM.btnCloseMovementModal.addEventListener('click', closeMovementModal);
    DOM.btnCancelMovementModal.addEventListener('click', closeMovementModal);
    DOM.formMovement.addEventListener('submit', handleMovementSubmit);

    DOM.movementProductSelect.addEventListener('change', (e) => {
      updateMovementStockDisplay(e.target.value);
    });

    DOM.movementReasonSelect.addEventListener('change', updateMovementHint);

    // History Modal
    DOM.btnCloseHistoryModal.addEventListener('click', () => DOM.modalHistory.classList.remove('active'));
    DOM.btnCloseHistoryFooter.addEventListener('click', () => DOM.modalHistory.classList.remove('active'));

    // Filters & Search
    DOM.productsSearchInput.addEventListener('input', renderProducts);
    DOM.productsCategoryFilter.addEventListener('change', renderProducts);
    DOM.productsStockFilter.addEventListener('change', renderProducts);

    DOM.movementsProductFilter.addEventListener('change', renderMovements);
    DOM.movementsTypeFilter.addEventListener('change', renderMovements);
    DOM.movementsReasonFilter.addEventListener('change', renderMovements);

    DOM.alertsStatusFilter.addEventListener('change', renderAlerts);

    // Analytics Run Button
    DOM.btnRunAnalytics.addEventListener('click', loadFastMovingProducts);

    // Backdrop click close for modals
    [DOM.modalProduct, DOM.modalMovement, DOM.modalHistory].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Keyboard ESC to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [DOM.modalProduct, DOM.modalMovement, DOM.modalHistory].forEach(m => m.classList.remove('active'));
      }
    });
  }

  // Expose global methods for inline table onclicks
  window.app = {
    openProductModal,
    editProduct: openProductModal,
    deleteProduct,
    openMovementForProduct: openMovementModal,
    viewProductHistory,
    quickReorder,
    fulfillAlert
  };

  // Initialization
  async function init() {
    initEventListeners();
    setupDefaultAnalyticsDates();

    const initialView = window.location.hash.replace('#', '') || 'dashboard';
    switchView(initialView);

    await loadAllData();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
