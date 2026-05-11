const Dispatch = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let customerCache = [];
  let productCache = [];
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
    document.getElementById('form-back').addEventListener('click', slideFormOut);
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
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const customerName = (customerCache.find(c => String(c.id) === String(r.customer_id)) || {}).name || r.customer_id;
      const productName  = (productCache.find(p => String(p.id) === String(r.product_id)) || {}).name  || r.product_id;
      const canDispatch  = r.status !== 'Dispatched';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.so_id || ''}</td>
        <td>${r.date || ''}</td>
        <td>${customerName}</td>
        <td>${productName}</td>
        <td>${r.qty_ordered || 0}</td>
        <td>${r.qty_dispatched || 0}</td>
        <td>${statusChip(r.status)}</td>
        <td>${canDispatch ? `<button class="btn-dispatch" onclick="Dispatch.dispatchAction('${r.so_id}','${r.product_id}')">Dispatch</button>` : '—'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ── SO Form ───────────────────────────────────────────────────────────────

  function openSOForm() {
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

  // ── Dispatch Action ───────────────────────────────────────────────────────

  async function dispatchAction(soId, productId) {
    const qty         = prompt('Qty to dispatch:');
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;
    const vehicle_no  = prompt('Vehicle No:') || '';
    const driver_name = prompt('Driver Name:') || '';
    const dispatched_by = session.username || session.name || '';

    showSpinner(true);
    try {
      const res = await Api.post('saveDispatch', {
        so_id: soId,
        product_id: productId,
        qty: Number(qty),
        vehicle_no,
        driver_name,
        dispatched_by
      });
      if (res.success) {
        showToast('Dispatched — ' + (res.dispatch_id || ''));
        await loadSOList();
      } else {
        showToast('Error: ' + (res.error || 'dispatch failed'));
      }
    } finally {
      showSpinner(false);
    }
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
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
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

  return { init, loadSOList, submitSO, dispatchAction };
})();
