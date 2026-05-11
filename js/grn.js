const GRN = (() => {

  let session = null;
  let supplierCache = [];
  let materialCache = [];
  let grnCache = [];
  let rrCache = [];
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
    document.getElementById('iqc-form-back').addEventListener('click', () => document.getElementById('iqc-form-panel').classList.remove('slide-in'));
    document.getElementById('btn-save-iqc').addEventListener('click', submitIQCResult);
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

  // ── Reorder Requests ──────────────────────────────────────────────────────

  async function loadReorderList() {
    showSpinner(true);
    try {
      const statusEl = document.getElementById('filter-rr-status');
      const status = statusEl ? statusEl.value : 'all';
      const res = await Api.get('getReorderList', { status });
      rrCache = res.success ? res.data : [];
      renderReorderTable(rrCache);
    } finally {
      showSpinner(false);
    }
  }

  function renderReorderTable(rows) {
    const tbody = document.getElementById('rr-tbody');
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8);">No reorder requests</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    const canAct = ['director','supervisor','store','store_dispatch'].includes(session.role);
    rows.forEach(r => {
      const supplierName = (supplierCache.find(s => String(s.id) === String(r.supplier_id)) || {}).name || (r.supplier_id || '—');
      const statusClass = r.status === 'Open' ? 'chip-ng' : r.status === 'Ordered' ? 'chip-ok' : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600">${r.rr_id || ''}</td>
        <td>${String(r.date || '').slice(0,10)}</td>
        <td>${r.material || ''}</td>
        <td>${supplierName}</td>
        <td><strong>${r.requested_qty || ''}</strong> kg</td>
        <td><span class="result-chip ${statusClass}">${r.status || ''}</span></td>
        <td>${canAct && r.status === 'Open'
          ? `<button class="btn-sm" onclick="GRN.markOrdered('${r.rr_id}')">Mark Ordered</button>`
          : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function openReorderForm() {
    const supplierOpts = supplierCache.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const panel = document.getElementById('rr-form-panel');
    if (!panel) return;
    document.getElementById('rr-material').value = '';
    document.getElementById('rr-qty').value = '';
    document.getElementById('rr-notes').value = '';
    const sel = document.getElementById('rr-supplier');
    sel.innerHTML = '<option value="">— select supplier —</option>' + supplierOpts;
    panel.classList.add('slide-in');
    document.getElementById('form-panel').classList.remove('slide-in');
  }

  function closeReorderForm() {
    document.getElementById('rr-form-panel').classList.remove('slide-in');
  }

  async function submitReorderRequest() {
    const material     = document.getElementById('rr-material').value.trim();
    const supplier_id  = document.getElementById('rr-supplier').value;
    const requested_qty = document.getElementById('rr-qty').value;
    const notes        = document.getElementById('rr-notes').value.trim();
    if (!material || !requested_qty || Number(requested_qty) <= 0) {
      showToast('Material and qty required');
      return;
    }
    showSpinner(true);
    try {
      const res = await Api.post('saveReorderRequest', {
        material, supplier_id, requested_qty: Number(requested_qty), notes,
        userId: Auth.getUserId()
      });
      if (res.success) {
        showToast('Reorder request saved — ' + res.rr_id);
        closeReorderForm();
        await loadReorderList();
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally { showSpinner(false); }
  }

  async function markOrdered(rrId) {
    if (!confirm('Mark RR ' + rrId + ' as Ordered?')) return;
    showSpinner(true);
    try {
      const res = await Api.post('closeReorderRequest', { rr_id: rrId, status: 'Ordered', userId: Auth.getUserId() });
      if (res.success) { showToast('Marked as Ordered'); await loadReorderList(); }
      else showToast('Error: ' + res.error);
    } finally { showSpinner(false); }
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

  // ── IQC ──────────────────────────────────────────────────────────────
  async function loadIQCList() {
    const tbody = document.getElementById('iqc-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8);">Loading…</td></tr>';
    try {
      const res = await Api.get('getGRNList');
      const rows = res.success ? res.data : [];
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8);">No GRNs found</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(r => {
        const status = r.iqc_status || 'Pending';
        const cls = status === 'Accept' ? 'status-approved' : status === 'Reject' ? 'status-rejected' : status === 'Hold' ? 'status-hold' : 'status-pending';
        return `<tr>
          <td>${esc(r.grn_id)}</td>
          <td>${esc(r.lot_no)}</td>
          <td>${esc(r.material)}</td>
          <td>${esc(r.supplier_name || r.supplier_id)}</td>
          <td>${esc(r.qty_kg)}</td>
          <td><span class="status-chip ${cls}">${esc(status)}</span></td>
          <td><button class="btn btn-sm" onclick="GRN.openIQCForm('${esc(r.grn_id)}','${esc(r.lot_no)}')">Log IQC</button></td>
        </tr>`;
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Failed to load</td></tr>';
    }
  }

  function openIQCForm(grnId, lotNo) {
    document.getElementById('iqc-grn-id').value = grnId;
    document.getElementById('iqc-lot-no').value = lotNo;
    document.getElementById('iqc-lot-display').value = grnId + ' / ' + lotNo;
    document.getElementById('iqc-mfi').value = '';
    document.getElementById('iqc-density').value = '';
    document.getElementById('iqc-visual').value = '';
    document.getElementById('iqc-coa').value = 'Yes';
    document.getElementById('iqc-decision').value = '';
    document.getElementById('iqc-remarks').value = '';
    document.getElementById('iqc-form-panel').classList.add('slide-in');
  }

  async function submitIQCResult() {
    const decision = document.getElementById('iqc-decision').value;
    if (!decision) { showToast('Select a decision'); return; }
    const payload = {
      grn_id:         document.getElementById('iqc-grn-id').value,
      lot_no:         document.getElementById('iqc-lot-no').value,
      insp_date:      new Date().toISOString().slice(0, 10),
      inspector_id:   session.id,
      mfi_result:     document.getElementById('iqc-mfi').value,
      density_result: document.getElementById('iqc-density').value,
      visual_result:  document.getElementById('iqc-visual').value,
      coa_ok:         document.getElementById('iqc-coa').value,
      decision,
      remarks:        document.getElementById('iqc-remarks').value
    };
    try {
      const res = await Api.post('saveIQCResult', payload);
      if (!res.success) throw new Error(res.error || 'Save failed');
      showToast('IQC result saved');
      document.getElementById('iqc-form-panel').classList.remove('slide-in');
      loadIQCList();
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  }

  // ── Supplier Scorecard ────────────────────────────────────────────────
  async function loadScorecard() {
    const tbody = document.getElementById('scorecard-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:var(--space-8);">Loading…</td></tr>';
    try {
      const res = await Api.get('getSupplierScorecard');
      const rows = res.success ? res.data : [];
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:var(--space-8);">No data</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(r => {
        const rate = r.accept_rate != null ? r.accept_rate.toFixed(1) + '%' : '—';
        const rateClass = r.accept_rate >= 95 ? 'status-approved' : r.accept_rate >= 80 ? 'status-pending' : 'status-rejected';
        return `<tr>
          <td>${esc(r.supplier_name || r.supplier_id)}</td>
          <td>${esc(r.grn_count)}</td>
          <td>${esc(r.rejected)}</td>
          <td>${esc(r.total_kg)}</td>
          <td><span class="status-chip ${rateClass}">${rate}</span></td>
        </tr>`;
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Failed to load</td></tr>';
    }
  }

  function esc(v) { return (v == null ? '' : String(v)).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  return { init, loadGRNList, loadStockLevels, editGRN, deleteGRN, loadReorderList, openReorderForm, closeReorderForm, submitReorderRequest, markOrdered, loadIQCList, openIQCForm, submitIQCResult, loadScorecard };
})();
