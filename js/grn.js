const GRN = (() => {

  let session = null;
  let supplierCache = [];

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);
    setupHeader();
    await loadSuppliers();
    await loadGRNList();
  }

  function setupHeader() {
    document.getElementById('form-back').addEventListener('click', slideFormOut);
    document.getElementById('btn-new-grn').addEventListener('click', openGRNForm);
    document.getElementById('btn-save-grn').addEventListener('click', submitGRN);
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });
  }

  async function loadSuppliers() {
    const res = await Api.get('getMasterDropdown', { entity: 'Suppliers' });
    supplierCache = res.success ? res.data : [];
    const sel = document.getElementById('filter-supplier');
    sel.innerHTML = '<option value="">All Suppliers</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.addEventListener('change', loadGRNList);
  }

  async function loadGRNList() {
    showSpinner(true);
    try {
      const supplierId = document.getElementById('filter-supplier').value;
      const params = supplierId ? { supplier_id: supplierId } : {};
      const res = await Api.get('getGRNList', params);
      renderGRNTable(res.success ? res.data : []);
    } finally {
      showSpinner(false);
    }
  }

  function renderGRNTable(rows) {
    const tbody = document.getElementById('grn-tbody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8);">No records found</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    rows.forEach(r => {
      const supplierName = (supplierCache.find(s => String(s.id) === String(r.supplier_id)) || {}).name || r.supplier_id;
      const statusClass = (r.status || '').toLowerCase().replace(' ', '-');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;font-size:var(--text-sm);">${r.grn_id || ''}</td>
        <td class="text-muted">${r.date || ''}</td>
        <td>${r.material_id || ''}</td>
        <td><strong>${r.qty_received || ''}</strong> ${r.unit || ''}</td>
        <td class="text-muted">${r.invoice_no || '—'}</td>
        <td><span class="badge badge-${statusClass}">${r.status || ''}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function openGRNForm() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-date').value = today;
    document.getElementById('field-material-id').value = '';
    document.getElementById('field-material').value = '';
    document.getElementById('field-qty').value = '';
    document.getElementById('field-unit').value = 'kg';
    document.getElementById('field-rate').value = '';
    document.getElementById('field-invoice').value = '';
    document.getElementById('field-received-by').value = session.name || '';
    document.getElementById('form-error').textContent = '';
    const sel = document.getElementById('field-supplier');
    sel.innerHTML = '<option value="">— select supplier —</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      sel.appendChild(o);
    });
    slideFormIn();
  }

  async function submitGRN() {
    const supplierId  = document.getElementById('field-supplier').value;
    const materialId  = document.getElementById('field-material-id').value.trim();
    const materialName = document.getElementById('field-material').value.trim();
    const qtyReceived = document.getElementById('field-qty').value;
    const unit        = document.getElementById('field-unit').value;
    const rate        = document.getElementById('field-rate').value;
    const invoiceNo   = document.getElementById('field-invoice').value.trim();
    const receivedBy  = document.getElementById('field-received-by').value.trim();
    const date        = document.getElementById('field-date').value;
    const errEl       = document.getElementById('form-error');

    if (!supplierId || !materialId || !qtyReceived) {
      errEl.textContent = 'Supplier, Material ID and Qty are required';
      return;
    }
    errEl.textContent = '';

    const btn = document.getElementById('btn-save-grn');
    btn.disabled = true;
    showSpinner(true);
    try {
      const res = await Api.post('saveGRN', {
        date,
        supplier_id:   supplierId,
        material_id:   materialId,
        material_name: materialName || materialId,
        qty_received:  Number(qtyReceived),
        unit,
        rate:          Number(rate) || 0,
        invoice_no:    invoiceNo,
        received_by:   receivedBy
      });
      if (res.success) {
        slideFormOut();
        window.showToast && window.showToast('GRN saved — ' + (res.grn_id || ''), 'success');
        await loadGRNList();
      } else {
        errEl.textContent = res.error === 'internal_error' ? 'Save failed. Check Apps Script logs.' : (res.error || 'Save failed');
      }
    } finally {
      btn.disabled = false;
      showSpinner(false);
    }
  }

  async function loadStockLevels() {
    showSpinner(true);
    try {
      const res = await Api.get('getStockList');
      renderStockCards(res.success ? res.data : []);
    } finally {
      showSpinner(false);
    }
  }

  function renderStockCards(items) {
    const grid = document.getElementById('stock-grid');
    if (!items.length) {
      grid.innerHTML = '<p class="text-muted text-sm" style="padding:var(--space-4);">No stock data</p>';
      return;
    }
    grid.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'stock-card' + (item.reorder_low ? ' reorder-low' : '');
      card.innerHTML = `
        <div class="stock-material">${item.material_name || item.material_id}</div>
        <div class="stock-qty">${item.current_qty}<span class="stock-unit"> ${item.unit || ''}</span></div>
        ${item.reorder_low ? '<div class="reorder-flag">Low stock — reorder</div>' : ''}
        <div class="stock-meta">Reorder: ${item.reorder_level} &nbsp;·&nbsp; ${item.last_updated || '—'}</div>
      `;
      grid.appendChild(card);
    });
  }

  function slideFormIn()  { document.getElementById('form-panel').classList.add('slide-in'); }
  function slideFormOut() { document.getElementById('form-panel').classList.remove('slide-in'); }

  function showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  return { init, loadGRNList, loadStockLevels };
})();
