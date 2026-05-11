const Dispatch = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let customerCache = [];
  let productCache = [];
  let soCache = [];
  let dispatchingSOId = null;
  let editingSOId = null;
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
    const [cRes, pRes] = await Promise.all([
      Api.get('getMasterDropdown', { entity: 'Customers' }),
      Api.get('getMasterDropdown', { entity: 'Products' })
    ]);
    customerCache = cRes.success ? cRes.data : [];
    productCache  = pRes.success ? pRes.data : [];
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
    showSpinner(true);
    try {
      const filterStatus = status || document.getElementById('filter-status').value;
      const params = {};
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      const res = await Api.get('getSOList', params);
      const rows = res.success ? res.data : [];
      soCache = rows;
      renderSOTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function statusChip(status) {
    const colors = { Pending: '#f57c00', Partial: '#e65100', Dispatched: '#2e7d32' };
    const bg     = { Pending: '#fff3e0', Partial: '#fbe9e7', Dispatched: '#e8f5e9' };
    const color  = colors[status] || '#616161';
    const bgCol  = bg[status]     || '#f5f5f5';
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
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.so_id || ''}</td>
        <td>${r.date || ''}</td>
        <td>${customerName}</td>
        <td>${productName}</td>
        <td>${r.qty_ordered || 0}</td>
        <td>${r.qty_dispatched || 0}</td>
        <td>${remaining}</td>
        <td>${statusChip(r.status)}</td>
        <td>${canDispatch ? `<button class="btn-dispatch" onclick="event.stopPropagation();Dispatch.dispatchAction('${r.so_id}','${r.product_id}')">Dispatch</button>` : '—'}</td>
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
        showToast('Customer, Product and Qty are required');
        return;
      }
      showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'SalesOrders', idCol: 'so_id', idVal: editingSOId,
          fields: { customer_id, product_id, qty_ordered: Number(qty_ordered), date, invoice_no }
        });
        if (res.success) {
          editingSOId = null;
          slideFormOut();
          await loadSOList();
        } else {
          showToast('Update failed: ' + res.error);
        }
      } finally { showSpinner(false); }
      return;
    }

    if (!customer_id || !product_id || !qty_ordered) {
      showToast('Customer, Product and Qty are required');
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveSO', {
        date,
        customer_id,
        product_id,
        qty_ordered: Number(qty_ordered),
        invoice_no
      });
      if (res.success) {
        showToast('SO saved — ' + (res.so_id || ''));
        slideFormOut();
        await loadSOList();
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Dispatch Action Panel ─────────────────────────────────────────────────

  function dispatchAction(soId) {
    const so = soCache.find(s => String(s.so_id) === String(soId));
    if (!so) return;
    dispatchingSOId = soId;
    const customerName = (customerCache.find(c => String(c.id) === String(so.customer_id)) || {}).name || so.customer_id;
    const productName  = (productCache.find(p => String(p.id) === String(so.product_id))   || {}).name || so.product_id;
    document.getElementById('dp-so-id').value   = soId;
    document.getElementById('dp-customer').value = customerName;
    document.getElementById('dp-product').value  = productName;
    document.getElementById('dp-ordered').value  = so.qty_ordered || 0;
    document.getElementById('dp-already').value  = so.qty_dispatched || 0;
    document.getElementById('dp-qty').value      = '';
    document.getElementById('dp-date').value     = new Date().toISOString().slice(0, 10);
    document.getElementById('dp-vehicle').value  = '';
    document.getElementById('dp-driver').value   = '';
    slideDispatchPanelIn();
  }

  async function submitDispatch() {
    const qty  = Number(document.getElementById('dp-qty').value);
    const date = document.getElementById('dp-date').value;
    if (!qty || qty <= 0) { showToast('Enter a valid quantity'); return; }
    if (!date) { showToast('Dispatch date required'); return; }
    const so = soCache.find(s => String(s.so_id) === String(dispatchingSOId));
    showSpinner(true);
    try {
      const res = await Api.post('saveDispatch', {
        so_id:          dispatchingSOId,
        product_id:     so ? so.product_id : '',
        qty,
        dispatch_date:  date,
        vehicle_no:     document.getElementById('dp-vehicle').value.trim(),
        driver_name:    document.getElementById('dp-driver').value.trim(),
        dispatched_by:  session.username || session.name || ''
      });
      if (res.success) {
        showToast('Dispatched — ' + res.dispatch_id);
        dispatchingSOId = null;
        slideDispatchPanelOut();
        await loadSOList();
      } else if (res.error === 'insufficient_stock') {
        showToast('Insufficient FG stock for this product');
      } else {
        showToast('Error: ' + res.error);
      }
    } finally { showSpinner(false); }
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
      <div class="detail-row"><span>Date</span><strong>${r.date || '—'}</strong></div>
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
    const res = await Api.post('deleteRecord', { sheet: 'SalesOrders', idCol: 'so_id', idVal: soId });
    if (res.success) { slideDetailOut(); await loadSOList(); }
    else showToast('Delete failed: ' + res.error);
  }

  // ── Dispatch Log ──────────────────────────────────────────────────────────

  async function loadDispatchLog() {
    showSpinner(true);
    try {
      const res = await Api.get('getDispatchList', {});
      const rows = res.success ? res.data : [];
      renderDispatchTable(rows);
    } finally {
      showSpinner(false);
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
        <td>${r.dispatch_date || ''}</td>
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

  function slideDispatchPanelIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('dispatch-panel').classList.add('slide-in');
  }

  function slideDispatchPanelOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('dispatch-panel').classList.remove('slide-in');
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

  function showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  return { init, loadSOList, submitSO, dispatchAction, submitDispatch, editSO, deleteSO };
})();
