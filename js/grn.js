const GRN = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let supplierCache = [];
  let activeTab = 'history';

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    renderTabs();
    await loadSuppliers();
    await loadGRNList();
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', slideFormOut);
    document.getElementById('btn-new-grn').addEventListener('click', () => openGRNForm());
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  function renderTabs() {
    document.querySelectorAll('.grn-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
      btn.addEventListener('click', async () => {
        activeTab = btn.dataset.tab;
        renderTabs();
        document.getElementById('tab-history').classList.toggle('hidden', activeTab !== 'history');
        document.getElementById('tab-stock').classList.toggle('hidden', activeTab !== 'stock');
        if (activeTab === 'stock') await loadStockPanel();
        if (activeTab === 'history') await loadGRNList();
      });
    });
    document.getElementById('tab-history').classList.toggle('hidden', activeTab !== 'history');
    document.getElementById('tab-stock').classList.toggle('hidden', activeTab !== 'stock');
  }

  // ── Supplier Dropdown ─────────────────────────────────────────────────────

  async function loadSuppliers() {
    const res = await Api.get('getMasterDropdown', { entity: 'Suppliers' });
    supplierCache = res.success ? res.data : [];
    populateSupplierFilter();
  }

  function populateSupplierFilter() {
    const sel = document.getElementById('filter-supplier');
    sel.innerHTML = '<option value="">All Suppliers</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.addEventListener('change', loadGRNList);
  }

  function populateSupplierFormDropdown(selectedId) {
    const sel = document.getElementById('field-supplier');
    sel.innerHTML = '<option value="">— select —</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name;
      if (String(s.id) === String(selectedId)) o.selected = true;
      sel.appendChild(o);
    });
  }

  // ── GRN List ──────────────────────────────────────────────────────────────

  async function loadGRNList() {
    showSpinner(true);
    try {
      const supplierId = document.getElementById('filter-supplier').value;
      const params = {};
      if (supplierId) params.supplier_id = supplierId;
      const res = await Api.get('getGRNList', params);
      const rows = res.success ? res.data : [];
      renderGRNTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function renderGRNTable(rows) {
    const tbody = document.getElementById('grn-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
      return;
    }

    // Apply date filter if set
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo   = document.getElementById('filter-date-to').value;
    const filtered = rows.filter(r => {
      if (dateFrom && String(r.date) < dateFrom) return false;
      if (dateTo   && String(r.date) > dateTo)   return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
      return;
    }

    filtered.forEach(r => {
      const supplierName = (supplierCache.find(s => String(s.id) === String(r.supplier_id)) || {}).name || r.supplier_id;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.grn_id || ''}</td>
        <td>${r.date || ''}</td>
        <td>${supplierName}</td>
        <td>${r.material_id || ''}</td>
        <td>${r.qty_received || ''}</td>
        <td>${r.unit || ''}</td>
        <td>${r.rate || ''}</td>
        <td>${r.invoice_no || ''}</td>
        <td><span class="status-badge active">${r.status || ''}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ── GRN Form ──────────────────────────────────────────────────────────────

  function openGRNForm() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-date').value = today;
    document.getElementById('field-material').value = '';
    document.getElementById('field-qty').value = '';
    document.getElementById('field-unit').value = 'kg';
    document.getElementById('field-rate').value = '';
    document.getElementById('field-invoice').value = '';
    document.getElementById('field-received-by').value = session.name || '';
    populateSupplierFormDropdown('');
    document.getElementById('form-title').textContent = 'New GRN';
    slideFormIn();
  }

  async function submitGRN() {
    const supplierId  = document.getElementById('field-supplier').value;
    const materialId  = document.getElementById('field-material').value.trim();
    const qtyReceived = document.getElementById('field-qty').value;
    const unit        = document.getElementById('field-unit').value;
    const rate        = document.getElementById('field-rate').value;
    const invoiceNo   = document.getElementById('field-invoice').value.trim();
    const receivedBy  = document.getElementById('field-received-by').value.trim();
    const date        = document.getElementById('field-date').value;

    if (!supplierId || !materialId || !qtyReceived) {
      showToast('Supplier, Material and Qty are required');
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveGRN', {
        date,
        supplier_id:  supplierId,
        material_id:  materialId,
        material_name: materialId,
        qty_received: Number(qtyReceived),
        unit,
        rate:         Number(rate) || 0,
        invoice_no:   invoiceNo,
        received_by:  receivedBy
      });
      if (res.success) {
        showToast('GRN saved — ' + (res.grn_id || ''));
        slideFormOut();
        await loadGRNList();
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Stock Panel ───────────────────────────────────────────────────────────

  async function loadStockPanel() {
    showSpinner(true);
    try {
      const res = await Api.get('getStockList');
      const items = res.success ? res.data : [];
      renderStockCards(items);
    } finally {
      showSpinner(false);
    }
  }

  function renderStockCards(items) {
    const grid = document.getElementById('stock-grid');
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<p style="color:#757575;padding:16px;">No stock data</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'stock-card' + (item.reorder_low ? ' reorder-low' : '');
      card.innerHTML = `
        <div class="stock-material">${item.material_name || item.material_id}</div>
        <div class="stock-qty">${item.current_qty} <span class="stock-unit">${item.unit || ''}</span></div>
        ${item.reorder_low ? '<div class="reorder-flag">⚠ Reorder</div>' : ''}
        <div class="stock-meta">Reorder at: ${item.reorder_level} | Updated: ${item.last_updated || '—'}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ── Slide Transitions ─────────────────────────────────────────────────────

  function slideFormIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('form-panel').classList.add('slide-in');
  }

  function slideFormOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('form-panel').classList.remove('slide-in');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  return { init, submitGRN, loadGRNList };
})();
