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
    const res = await Api.get('getSuppliers');
    supplierCache = res.success ? res.data : [];
    const filterSel = document.getElementById('filter-supplier');
    if (filterSel) {
      filterSel.innerHTML = '<option value="">All Suppliers</option>';
      supplierCache.forEach(s => {
        const o = document.createElement('option');
        o.value = s.id; o.textContent = s.name + ' (' + s.category + ')';
        filterSel.appendChild(o);
      });
      filterSel.addEventListener('change', loadGRNList);
    }
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
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8);">No records found</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    rows.forEach(r => {
      const supplierName = (supplierCache.find(s => String(s.id) === String(r.supplier_id)) || {}).name || r.supplier_id;
      const dateStr = r.date ? String(r.date).slice(0, 10) : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;font-size:var(--text-sm);">${r.grn_id || ''}</td>
        <td class="text-muted">${dateStr}</td>
        <td>${supplierName}</td>
        <td>${r.material || ''}</td>
        <td><strong>${r.qty_kg || ''}</strong> kg</td>
        <td class="text-muted">${r.lot_no || '—'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function openGRNForm() {
    editingGrnId = null;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-date').value = today;
    document.getElementById('field-material').value = '';
    document.getElementById('field-qty-kg').value = '';
    const lotEl = document.getElementById('field-lot-no');
    if (lotEl) lotEl.value = '';
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
    const supplierId = document.getElementById('field-supplier').value;
    const material   = document.getElementById('field-material').value.trim();
    const qtyKg      = document.getElementById('field-qty-kg').value;
    const lotNo      = document.getElementById('field-lot-no')?.value?.trim() || '';
    const date       = document.getElementById('field-date').value;
    const errEl      = document.getElementById('form-error');

    let valid = true;
    const eQty = document.getElementById('err-qty-kg');
    if (eQty) eQty.textContent = '';
    errEl.textContent = '';
    if (!supplierId) { errEl.textContent = 'Select a supplier'; valid = false; }
    if (!material)   { errEl.textContent = 'Material is required'; valid = false; }
    if (!qtyKg || Number(qtyKg) <= 0) { if (eQty) eQty.textContent = 'Enter a valid quantity'; valid = false; }
    if (!valid) return;

    const btn = document.getElementById('btn-save-grn');
    btn.disabled = true;
    showSpinner(true);
    try {
      const res = await Api.post('saveGRN', {
        date, supplier_id: supplierId, material,
        qty_kg: Number(qtyKg), lot_no: lotNo,
        userId: Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        if (res.warning === 'duplicate_lot_no') showToast('Warning: duplicate lot no — saved anyway', 'warning');
        else showToast('GRN saved — ' + (res.grn_id || ''));
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
      <div class="detail-row"><span>Date</span><strong>${String(r.date || "").slice(0,10) || "—"}</strong></div>
      <div class="detail-row"><span>Supplier</span><strong>${supplierName}</strong></div>
      <div class="detail-row"><span>Material</span><strong>${r.material || '—'}</strong></div>
      <div class="detail-row"><span>Lot No</span><strong>${r.lot_no || '—'}</strong></div>
      <div class="detail-row"><span>Qty Received</span><strong>${r.qty_kg ?? '—'} kg</strong></div>
    `;
    const canEdit = ['director','store','qmr'].includes(session.role);
    const iqcLink = `<a class="btn btn-secondary" href="quality.html?tab=iqc&lot=${encodeURIComponent(r.lot_no||'')}">Log IQC Check →</a>`;
    document.getElementById('detail-actions').innerHTML = iqcLink + (canEdit
      ? `<button class="btn btn-primary" onclick="GRN.editGRN('${grnId}')">Edit</button>
         <button class="btn-deactivate" onclick="GRN.deleteGRN('${grnId}')">Delete</button>`
      : '');
    slideDetailIn();
  }

  function editGRN(grnId) {
    const r = grnCache.find(g => String(g.grn_id) === String(grnId));
    if (!r) return;
    editingGrnId = grnId;
    slideDetailOut();
    const sel = document.getElementById('field-supplier');
    sel.innerHTML = '<option value="">— select supplier —</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      if (String(s.id) === String(r.supplier_id)) o.selected = true;
      sel.appendChild(o);
    });
    sel.disabled = true;
    document.getElementById('field-material').value = r.material || '';
    document.getElementById('field-material').readOnly = true;
    document.getElementById('field-date').value = r.date || '';
    document.getElementById('field-qty-kg').value = r.qty_kg || '';
    const lotEl = document.getElementById('field-lot-no');
    if (lotEl) lotEl.value = r.lot_no || '';
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
      const res = await Api.get('getRMStock');
      renderStockTable(res.success ? res.data : []);
    } finally {
      showSpinner(false);
    }
  }

  function renderStockTable(items) {
    const tbody = document.getElementById('stock-tbody');
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:var(--space-8);">No stock data</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(r => `
      <tr>
        <td>${r.material}</td>
        <td>${r.received_kg.toFixed(1)}</td>
        <td>${r.consumed_kg.toFixed(1)}</td>
        <td class="${r.low_stock ? 'text-warning' : ''}" style="font-weight:600;">
          ${r.stock_kg.toFixed(1)} kg${r.low_stock ? ' ⚠' : ''}
        </td>
      </tr>`).join('');
  }

  function slideFormIn()  { document.getElementById('form-panel').classList.add('slide-in'); }
  function slideFormOut() {
    document.getElementById('form-panel').classList.remove('slide-in');
    editingGrnId = null;
    document.getElementById('field-supplier').disabled = false;
    document.getElementById('field-material').readOnly = false;
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
