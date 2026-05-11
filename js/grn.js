const GRN = (() => {

  let session = null;
  let supplierCache = [];
  let materialCache = [];
  let grnCache = [];
  let editingGrnId = null;

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);
    setupHeader();
    await loadSuppliers();
    await loadMaterials();
    await loadGRNList();
  }

  function setupHeader() {
    document.getElementById('form-back').addEventListener('click', () => {
      editingGrnId = null;
      slideFormOut();
    });
    document.getElementById('detail-back').addEventListener('click', slideDetailOut);
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

  async function loadMaterials() {
    const res = await Api.get('getStockList');
    materialCache = res.success ? res.data : [];
    const sel = document.getElementById('field-material-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">— select existing —</option>';
    materialCache.forEach(item => {
      const o = document.createElement('option');
      o.value = item.material_id;
      o.dataset.name = item.material_name;
      o.textContent = item.material_id + ' — ' + item.material_name;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => {
      const opt = sel.options[sel.selectedIndex];
      if (opt.value) {
        document.getElementById('field-material-id').value = opt.value;
        document.getElementById('field-material').value = opt.dataset.name || '';
      } else {
        document.getElementById('field-material-id').value = '';
        document.getElementById('field-material').value = '';
      }
    });
  }

  async function loadGRNList() {
    showSpinner(true);
    try {
      const supplierId = document.getElementById('filter-supplier').value;
      const params = supplierId ? { supplier_id: supplierId } : {};
      const res = await Api.get('getGRNList', params);
      const rows = res.success ? res.data : [];
      grnCache = rows;
      renderGRNTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function renderGRNTable(rows) {
    const tbody = document.getElementById('grn-tbody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8);">No records found</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    rows.forEach(r => {
      const supplierName = (supplierCache.find(s => String(s.id) === String(r.supplier_id)) || {}).name || r.supplier_id;
      const statusClass = (r.status || '').toLowerCase().replace(' ', '-');
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td style="font-weight:600;font-size:var(--text-sm);">${r.grn_id || ''}</td>
        <td class="text-muted">${r.date || ''}</td>
        <td>${r.material_id || ''}</td>
        <td><strong>${r.qty_received || ''}</strong> ${r.unit || ''}</td>
        <td class="text-muted">${r.invoice_no || '—'}</td>
        <td><span class="badge badge-${statusClass}">${r.status || ''}</span></td>
        <td><div class="row-actions"><button class="btn-icon btn-icon-edit" title="Edit">✏</button><button class="btn-icon btn-icon-delete" title="Delete">🗑</button></div></td>
      `;
      tr.querySelector('.btn-icon-edit').addEventListener('click', e => { e.stopPropagation(); GRN.editGRN(r.grn_id); });
      tr.querySelector('.btn-icon-delete').addEventListener('click', e => { e.stopPropagation(); GRN.deleteGRN(r.grn_id); });
      tr.addEventListener('click', () => openGRNDetail(r.grn_id));
      tbody.appendChild(tr);
    });
  }

  function openGRNForm() {
    editingGrnId = null;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-date').value = today;
    document.getElementById('field-material-select').value = '';
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

    if (editingGrnId) {
      // On edit, only allow updating qty, unit, rate, invoice_no
      if (!qtyReceived) { errEl.textContent = 'Qty is required'; return; }
      errEl.textContent = '';
      const btn = document.getElementById('btn-save-grn');
      btn.disabled = true;
      showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'GRN', idCol: 'grn_id', idVal: editingGrnId,
          userId: Auth.getUserId(),
          fields: { qty_received: Number(qtyReceived), unit, rate: Number(rate) || 0, invoice_no: invoiceNo }
        });
        if (res.success) {
          editingGrnId = null;
          slideFormOut();
          await loadGRNList();
        } else {
          errEl.textContent = 'Update failed: ' + res.error;
        }
      } finally { btn.disabled = false; showSpinner(false); }
      return;
    }

    if (!supplierId || !materialId || !qtyReceived) {
      errEl.textContent = 'Supplier, Material and Qty are required';
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
        received_by:   receivedBy,
        userId:        Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        showToast('GRN saved — ' + (res.grn_id || ''));
        await loadGRNList();
      } else {
        errEl.textContent = res.error === 'internal_error' ? 'Save failed. Check Apps Script logs.' : (res.error || 'Save failed');
      }
    } finally {
      btn.disabled = false;
      showSpinner(false);
    }
  }

  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openGRNDetail(grnId) {
    const r = grnCache.find(g => String(g.grn_id) === String(grnId));
    if (!r) return;
    const supplierName = (supplierCache.find(s => String(s.id) === String(r.supplier_id)) || {}).name || r.supplier_id;
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>GRN ID</span><strong>${r.grn_id}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${r.date || '—'}</strong></div>
      <div class="detail-row"><span>Supplier</span><strong>${supplierName}</strong></div>
      <div class="detail-row"><span>Material ID</span><strong>${r.material_id || '—'}</strong></div>
      <div class="detail-row"><span>Qty Received</span><strong>${r.qty_received} ${r.unit || ''}</strong></div>
      <div class="detail-row"><span>Rate</span><strong>₹${r.rate || 0}</strong></div>
      <div class="detail-row"><span>Invoice No</span><strong>${r.invoice_no || '—'}</strong></div>
      <div class="detail-row"><span>Received By</span><strong>${r.received_by || '—'}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${r.status || '—'}</strong></div>
    `;
    const canEdit = ['director','store','qmr'].includes(session.role);
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn btn-primary" onclick="GRN.editGRN('${grnId}')">Edit</button>
         <button class="btn-deactivate" onclick="GRN.deleteGRN('${grnId}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editGRN(grnId) {
    const r = grnCache.find(g => String(g.grn_id) === String(grnId));
    if (!r) return;
    editingGrnId = grnId;
    slideDetailOut();
    // Pre-fill form (supplier + material read-only on edit)
    const sel = document.getElementById('field-supplier');
    sel.innerHTML = '<option value="">— select supplier —</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      if (String(s.id) === String(r.supplier_id)) o.selected = true;
      sel.appendChild(o);
    });
    sel.disabled = true;
    document.getElementById('field-material-select').value = '';
    document.getElementById('field-material-select').disabled = true;
    document.getElementById('field-material-id').value = r.material_id || '';
    document.getElementById('field-material-id').readOnly = true;
    document.getElementById('field-material').value = '';
    document.getElementById('field-date').value = r.date || '';
    document.getElementById('field-qty').value = r.qty_received || '';
    document.getElementById('field-unit').value = r.unit || 'kg';
    document.getElementById('field-rate').value = r.rate || '';
    document.getElementById('field-invoice').value = r.invoice_no || '';
    document.getElementById('field-received-by').value = r.received_by || '';
    document.getElementById('form-error').textContent = '';
    slideFormIn();
  }

  async function deleteGRN(grnId) {
    if (!confirm('Delete GRN ' + grnId + '?')) return;
    const res = await Api.post('deleteRecord', { sheet: 'GRN', idCol: 'grn_id', idVal: grnId, userId: Auth.getUserId() });
    if (res.success) { slideDetailOut(); await loadGRNList(); }
    else showToast('Delete failed: ' + res.error);
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

  function slideFormIn()  {
    document.getElementById('form-panel').classList.add('slide-in');
    // Reset disabled fields on fresh form open
    if (!editingGrnId) {
      document.getElementById('field-supplier').disabled = false;
      document.getElementById('field-material-select').disabled = false;
      document.getElementById('field-material-id').readOnly = false;
    }
  }
  function slideFormOut() {
    document.getElementById('form-panel').classList.remove('slide-in');
    document.getElementById('field-supplier').disabled = false;
    document.getElementById('field-material-select').disabled = false;
    document.getElementById('field-material-id').readOnly = false;
    editingGrnId = null;
  }

  function slideDetailIn()  { document.getElementById('detail-panel').classList.add('slide-in'); }
  function slideDetailOut() { document.getElementById('detail-panel').classList.remove('slide-in'); }

  function showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'toast'; }, 2500);
  }

  return { init, loadGRNList, loadStockLevels, editGRN, deleteGRN };
})();
