const Dispatch = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let customerCache = [];
  let productCache = [];
  let machineCache = [];
  let soCache = [];
  let dispatchingSOId = null;
  let editingSOId = null;
  let planningSOId = null;
  let activeTab = 'so';

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    renderTabs();
    await loadDropdowns();
    await loadSOList();
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', () => {
      editingSOId = null;
      slideFormOut();
    });
    document.getElementById('dispatch-back').addEventListener('click', slideDispatchPanelOut);
    const dispatchActionBackBtn = document.getElementById('dispatch-action-back-btn');
    if (dispatchActionBackBtn) dispatchActionBackBtn.addEventListener('click', slideDispatchActionPanelOut);
    document.getElementById('detail-back').addEventListener('click', slideDetailOut);
    document.getElementById('btn-new-so').addEventListener('click', () => openSOForm());
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
    document.querySelectorAll('.sub-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
      btn.addEventListener('click', async () => {
        activeTab = btn.dataset.tab;
        renderTabs();
        document.getElementById('tab-so').classList.toggle('hidden', activeTab !== 'so');
        document.getElementById('tab-log').classList.toggle('hidden', activeTab !== 'log');
        if (activeTab === 'log') await loadDispatchLog();
        if (activeTab === 'so') await loadSOList();
      });
    });
    document.getElementById('tab-so').classList.toggle('hidden', activeTab !== 'so');
    document.getElementById('tab-log').classList.toggle('hidden', activeTab !== 'log');
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────

  async function loadDropdowns() {
    const [cRes, pRes, mRes] = await Promise.all([
      Api.get('getMasterDropdown', { entity: 'Customers' }),
      Api.get('getMasterDropdown', { entity: 'Products' }),
      Api.get('getMachineList')
    ]);
    customerCache = cRes.success ? cRes.data : [];
    productCache  = pRes.success ? pRes.data : [];
    machineCache  = mRes.success ? mRes.data : [];
    populateFormDropdowns();
  }

  function populateFormDropdowns() {
    const cSel = document.getElementById('field-customer');
    cSel.innerHTML = '<option value="">— select —</option>';
    customerCache.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.name;
      cSel.appendChild(o);
    });

    const pSel = document.getElementById('field-product');
    pSel.innerHTML = '<option value="">— select —</option>';
    productCache.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name;
      pSel.appendChild(o);
    });
  }

  // ── SO List ───────────────────────────────────────────────────────────────

  async function loadSOList(status) {
    UI.showSpinner(true);
    try {
      const filterStatus = status || document.getElementById('filter-status').value;
      const params = {};
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      const res = await Api.get('getSOList', params);
      const rows = res.success ? res.data : [];
      soCache = rows;
      renderSOTable(rows);
    } finally {
      UI.showSpinner(false);
    }
  }

  function statusChip(status) {
    const colors = { Pending: 'var(--color-warning)', Partial: 'var(--color-warning)', Dispatched: 'var(--color-success)' };
    const bg     = { Pending: 'var(--color-warning-bg, #fff3e0)', Partial: 'var(--color-warning-bg, #fbe9e7)', Dispatched: 'var(--color-success-bg, #e8f5e9)' };
    const color  = colors[status] || 'var(--color-text-muted)';
    const bgCol  = bg[status]     || 'var(--color-surface)';
    return `<span style="background:${bgCol};color:${color};padding:3px 10px;border-radius:12px;font-size:0.8rem;font-weight:600;">${status}</span>`;
  }

  function renderSOTable(rows) {
    const tbody = document.getElementById('so-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="td-loading">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const customerName = (customerCache.find(c => String(c.id) === String(r.customer_id)) || {}).name || r.customer_id;
      const productName  = (productCache.find(p => String(p.id) === String(r.product_id)) || {}).name  || r.product_id;
      const remaining    = (r.qty_ordered || 0) - (r.qty_dispatched || 0);
      const canDispatch  = r.status !== 'Dispatched';
      const canPlanBatch = r.status === 'Pending' && !r.batch_id;
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.so_id || ''}</td>
        <td>${String(r.date || "").slice(0,10)}</td>
        <td>${customerName}</td>
        <td>${productName}</td>
        <td>${r.qty_ordered || 0}</td>
        <td>${r.qty_dispatched || 0}</td>
        <td>${remaining}</td>
        <td>${statusChip(r.status)}</td>
        <td style="white-space:nowrap;">
          ${canPlanBatch ? `<button class="btn-sm" style="background:#0288d1;color:#fff;margin-right:4px;" onclick="event.stopPropagation();Dispatch.openPlanBatchPanel('${r.so_id}')">Plan Batch</button>` : ''}
          ${canDispatch ? `<button class="btn-dispatch" onclick="event.stopPropagation();Dispatch.dispatchAction('${r.so_id}','${r.product_id}')">Dispatch</button>` : '—'}
        </td>
      `;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        openSODetail(r.so_id);
      });
      tbody.appendChild(tr);
    });
  }

  // ── SO Form ───────────────────────────────────────────────────────────────

  function openSOForm() {
    editingSOId = null;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-date').value = today;
    document.getElementById('field-qty-ordered').value = '';
    document.getElementById('field-invoice').value = '';
    populateFormDropdowns();
    document.getElementById('form-title').textContent = 'New Sales Order';
    slideFormIn();
  }

  async function submitSO() {
    const customer_id  = document.getElementById('field-customer').value;
    const product_id   = document.getElementById('field-product').value;
    const qty_ordered  = document.getElementById('field-qty-ordered').value;
    const invoice_no   = document.getElementById('field-invoice').value.trim();
    const date         = document.getElementById('field-date').value;

    if (editingSOId) {
      if (!customer_id || !product_id || !qty_ordered) {
        UI.showToast('Customer, Product and Qty are required');
        return;
      }
      UI.showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'SalesOrders', idCol: 'so_id', idVal: editingSOId,
          userId: Auth.getUserId(),
          fields: { customer_id, product_id, qty_ordered: Number(qty_ordered), date, invoice_no }
        });
        if (res.success) {
          editingSOId = null;
          slideFormOut();
          await loadSOList();
        } else {
          UI.showToast('Update failed: ' + res.error);
        }
      } finally { UI.showSpinner(false); }
      return;
    }

    if (!customer_id || !product_id || !qty_ordered) {
      UI.showToast('Customer, Product and Qty are required');
      return;
    }

    if (invoice_no && soCache.some(s => s.invoice_no && s.invoice_no.trim() === invoice_no)) {
      UI.showToast('Invoice no already exists — check for duplicate SO');
      return;
    }

    UI.showSpinner(true);
    try {
      const res = await Api.post('saveSO', {
        date,
        customer_id,
        product_id,
        qty_ordered: Number(qty_ordered),
        invoice_no,
        userId:      Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('SO saved — ' + (res.so_id || ''));
        slideFormOut();
        await loadSOList();
      } else {
        UI.showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Plan Batch Panel ──────────────────────────────────────────────────────

  function openPlanBatchPanel(soId) {
    planningSOId = soId;
    const so = soCache.find(s => String(s.so_id) === String(soId));
    if (!so) return;
    const productName = (productCache.find(p => String(p.id) === String(so.product_id)) || {}).name || so.product_id;
    const machineOpts = machineCache.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    const panel = document.getElementById('plan-batch-panel');
    if (!panel) return;
    document.getElementById('plan-so-display').value = soId;
    document.getElementById('plan-product-display').value = productName;
    document.getElementById('plan-qty').value = (so.qty_ordered || '') - (so.qty_dispatched || 0);
    document.getElementById('plan-date').value = new Date().toISOString().slice(0, 10);
    const machineSel = document.getElementById('plan-machine');
    machineSel.innerHTML = '<option value="">— select machine —</option>' + machineOpts;
    slideFormIn();
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('form-panel').classList.remove('slide-in');
    panel.classList.add('slide-in');
    document.getElementById('main-content').classList.add('slide-out');
  }

  function slidePlanBatchPanelOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('plan-batch-panel').classList.remove('slide-in');
    planningSOId = null;
  }

  async function submitPlanBatch() {
    const machineId  = document.getElementById('plan-machine').value;
    const plannedQty = document.getElementById('plan-qty').value;
    const date       = document.getElementById('plan-date').value;
    if (!machineId) { UI.showToast('Select a machine'); return; }
    if (!plannedQty || Number(plannedQty) <= 0) { UI.showToast('Enter planned quantity'); return; }
    const so = soCache.find(s => String(s.so_id) === String(planningSOId));
    UI.showSpinner(true);
    try {
      const res = await Api.post('planBatchFromSO', {
        so_id:       planningSOId,
        product_id:  so ? so.product_id : '',
        planned_qty: Number(plannedQty),
        machine_id:  machineId,
        date,
        userId:      Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Batch ' + res.batch_id + ' planned — go to Production');
        slidePlanBatchPanelOut();
        await loadSOList();
      } else {
        UI.showToast('Error: ' + (res.error || 'plan failed'));
      }
    } finally { UI.showSpinner(false); }
  }

  // ── Dispatch Action Panel ─────────────────────────────────────────────────

  function dispatchAction(soId) {
    const so = soCache.find(s => String(s.so_id) === String(soId));
    if (!so) return;
    dispatchingSOId = soId;
    const customerName = (customerCache.find(c => String(c.id) === String(so.customer_id)) || {}).name || so.customer_id;
    const productName  = (productCache.find(p => String(p.id) === String(so.product_id))   || {}).name || so.product_id;

    // Populate new dispatch-action-panel fields
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    setVal('dispatch-so-id',          soId);
    setVal('dispatch-so-display',     soId);
    setVal('dispatch-customer-display', customerName);
    setVal('dispatch-product-display',  productName);
    setVal('dispatch-so-qty-display', so.qty_ordered || '');
    setVal('dispatch-date',           new Date().toISOString().slice(0, 10));
    setVal('dispatch-qty',            '');
    setVal('dispatch-invoice',        '');
    setVal('dispatch-vehicle',        '');

    slideDispatchActionPanelIn();
  }

  function closeDispatchActionPanel() {
    slideDispatchActionPanelOut();
  }

  async function loadOQCBatches() {
    const res = await Api.get('getOQCBatchList');
    return res.success ? res.data : [];
  }

  async function openBatchSelectPanel() {
    const tbody = document.getElementById('batch-select-tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Loading…</td></tr>';
    document.getElementById('batch-select-panel').classList.add('slide-in');
    const so = soCache.find(s => String(s.so_id) === String(dispatchingSOId));
    const batches = await loadOQCBatches();
    const filtered = so ? batches.filter(b => !b.product_id || b.product_id === so.product_id) : batches;
    tbody.innerHTML = filtered.length
      ? filtered.map(b => `
          <tr>
            <td style="font-weight:600;">${b.batch_no}</td>
            <td>${b.product_id || '—'}</td>
            <td>${b.production_date || '—'}</td>
            <td><button class="btn btn-sm btn-primary" onclick="Dispatch.selectBatch('${b.batch_no}')">Select</button></td>
          </tr>`).join('')
      : '<tr><td colspan="4" class="text-center text-muted" style="padding:16px;">No OQC-cleared batches available</td></tr>';
  }

  function selectBatch(batchNo) {
    const el = document.getElementById('dispatch-batch-no');
    if (el) el.value = batchNo;
    document.getElementById('batch-select-panel').classList.remove('slide-in');
  }

  async function submitDispatchAction() {
    const qty        = Number(document.getElementById('dispatch-qty').value);
    const invoice    = document.getElementById('dispatch-invoice').value.trim();
    const date       = document.getElementById('dispatch-date').value;
    const vehicle    = document.getElementById('dispatch-vehicle').value.trim();
    const driverName = document.getElementById('dispatch-driver-name')?.value?.trim() || '';
    const batchNo    = document.getElementById('dispatch-batch-no')?.value?.trim() || '';
    const polybagQty = Number(document.getElementById('dispatch-polybag-qty')?.value) || 0;

    const eQty  = document.getElementById('err-dispatch-qty');
    const eDate = document.getElementById('err-dispatch-date');
    if (eQty)  eQty.textContent  = '';
    if (eDate) eDate.textContent = '';

    let valid = true;
    if (!qty || qty <= 0)  { if (eQty)  eQty.textContent  = 'Enter a valid quantity'; valid = false; }
    if (!date)             { if (eDate) eDate.textContent = 'Date is required'; valid = false; }
    if (!batchNo)          { UI.showToast('Select a batch before dispatching'); valid = false; }
    if (!valid) return;

    const so = soCache.find(s => String(s.so_id) === String(dispatchingSOId));
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveDispatch', {
        so_id:         dispatchingSOId,
        product_id:    so ? so.product_id : '',
        qty,
        dispatch_date: date,
        invoice_no:    invoice,
        vehicle_no:    vehicle,
        driver_name:   driverName,
        batch_no:      batchNo,
        polybag_qty:   polybagQty,
        dispatched_by: session.username || session.name || '',
        userId:        Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Dispatched — ' + (res.dispatch_id || ''));
        dispatchingSOId = null;
        slideDispatchActionPanelOut();
        await loadSOList();
        if (activeTab === 'log') await loadDispatchLog();
        // Open QR label print page
        if (res.label_url) {
          const printUrl = res.label_url + '&print=1';
          window.open(printUrl, '_blank');
        }
      } else {
        const msgs = {
          batch_not_oqc_cleared:    'Batch not OQC cleared',
          batch_already_dispatched: 'Batch already dispatched',
          batch_not_found:          'Batch not found',
          insufficient_stock:       'Insufficient FG stock for this product'
        };
        UI.showToast(msgs[res.error] || ('Error: ' + res.error));
      }
    } finally { UI.showSpinner(false); }
  }


  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openSODetail(soId) {
    const r = soCache.find(s => String(s.so_id) === String(soId));
    if (!r) return;
    const customerName = (customerCache.find(c => String(c.id) === String(r.customer_id)) || {}).name || r.customer_id;
    const productName  = (productCache.find(p => String(p.id) === String(r.product_id))   || {}).name || r.product_id;
    const remaining    = (r.qty_ordered || 0) - (r.qty_dispatched || 0);
    document.getElementById('detail-title').textContent = 'SO Detail';
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>SO ID</span><strong>${r.so_id}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${String(r.date || "").slice(0,10) || "—"}</strong></div>
      <div class="detail-row"><span>Customer</span><strong>${customerName}</strong></div>
      <div class="detail-row"><span>Product</span><strong>${productName}</strong></div>
      <div class="detail-row"><span>Qty Ordered</span><strong>${r.qty_ordered}</strong></div>
      <div class="detail-row"><span>Qty Dispatched</span><strong>${r.qty_dispatched || 0}</strong></div>
      <div class="detail-row"><span>Remaining</span><strong>${remaining}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${r.status}</strong></div>
      <div class="detail-row"><span>Invoice No</span><strong>${r.invoice_no || '—'}</strong></div>
    `;
    const canEdit = ['director','store'].includes(session.role) && r.status !== 'Dispatched';
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="Dispatch.editSO('${soId}')">Edit</button>
         <button class="btn-deactivate" onclick="Dispatch.deleteSO('${soId}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editSO(soId) {
    const r = soCache.find(s => String(s.so_id) === String(soId));
    if (!r) return;
    editingSOId = soId;
    slideDetailOut();
    populateFormDropdowns();
    document.getElementById('field-date').value = r.date || '';
    document.getElementById('field-customer').value = r.customer_id || '';
    document.getElementById('field-product').value = r.product_id || '';
    document.getElementById('field-qty-ordered').value = r.qty_ordered || '';
    document.getElementById('field-invoice').value = r.invoice_no || '';
    document.getElementById('form-title').textContent = 'Edit Sales Order';
    slideFormIn();
  }

  async function deleteSO(soId) {
    if (!confirm('Delete SO ' + soId + '?')) return;
    const res = await Api.post('deleteRecord', { sheet: 'SalesOrders', idCol: 'so_id', idVal: soId, userId: Auth.getUserId() });
    if (res.success) { slideDetailOut(); await loadSOList(); }
    else UI.showToast('Delete failed: ' + res.error);
  }

  // ── Dispatch Log ──────────────────────────────────────────────────────────

  async function loadDispatchLog() {
    UI.showSpinner(true);
    try {
      const res = await Api.get('getDispatchList', {});
      const rows = res.success ? res.data : [];
      renderDispatchTable(rows);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderDispatchTable(rows) {
    const tbody = document.getElementById('dispatch-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="td-loading">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.dispatch_id || ''}</td>
        <td>${r.so_id || ''}</td>
        <td>${String(r.dispatch_date || "").slice(0,10)}</td>
        <td>${r.qty || ''}</td>
        <td>${r.vehicle_no || ''}</td>
        <td>${r.driver_name || ''}</td>
      `;
      tbody.appendChild(tr);
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
    editingSOId = null;
  }

  function slideDispatchActionPanelIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('dispatch-action-panel').classList.add('slide-in');
  }

  function slideDispatchActionPanelOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('dispatch-action-panel').classList.remove('slide-in');
    dispatchingSOId = null;
  }

  function slideDetailIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('detail-panel').classList.add('slide-in');
  }

  function slideDetailOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('detail-panel').classList.remove('slide-in');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function UI.showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  function UI.showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  return { init, loadSOList, submitSO, dispatchAction, submitDispatchAction, closeDispatchActionPanel, editSO, deleteSO, openBatchSelectPanel, selectBatch, openPlanBatchPanel, slidePlanBatchPanelOut, submitPlanBatch };
})();

// Global shims for inline onclick handlers
function submitDispatchAction() { Dispatch.submitDispatchAction(); }
function closeDispatchActionPanel() { Dispatch.closeDispatchActionPanel(); }
function submitPlanBatch() { Dispatch.submitPlanBatch(); }
