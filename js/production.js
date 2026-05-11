const Production = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let productCache = [];
  let machineCache = [];
  let activeTab = 'batches';

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    renderTabs();
    await loadDropdowns();
    await loadBatches();
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', slideFormOut);
    document.getElementById('btn-new-batch').addEventListener('click', () => openBatchForm());
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
        document.getElementById('tab-batches').classList.toggle('hidden', activeTab !== 'batches');
        document.getElementById('tab-fg').classList.toggle('hidden', activeTab !== 'fg');
        if (activeTab === 'fg') await loadFinishedGoods();
        if (activeTab === 'batches') await loadBatches();
      });
    });
    document.getElementById('tab-batches').classList.toggle('hidden', activeTab !== 'batches');
    document.getElementById('tab-fg').classList.toggle('hidden', activeTab !== 'fg');
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────

  async function loadDropdowns() {
    const [pRes, mRes] = await Promise.all([
      Api.get('getMasterDropdown', { entity: 'Products' }),
      Api.get('getMasterDropdown', { entity: 'Equipment' })
    ]);
    productCache = pRes.success ? pRes.data : [];
    machineCache = mRes.success ? mRes.data : [];
  }

  function populateFormDropdowns() {
    const pSel = document.getElementById('field-product');
    pSel.innerHTML = '<option value="">— select —</option>';
    productCache.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name;
      pSel.appendChild(o);
    });

    const mSel = document.getElementById('field-machine');
    mSel.innerHTML = '<option value="">— select —</option>';
    machineCache.forEach(m => {
      const o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name;
      mSel.appendChild(o);
    });
  }

  // ── Batch List ────────────────────────────────────────────────────────────

  async function loadBatches(status) {
    showSpinner(true);
    try {
      const filterStatus = status || document.getElementById('filter-status').value || 'all';
      const params = {};
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      const res = await Api.get('getBatchList', params);
      const rows = res.success ? res.data : [];
      renderBatchTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function renderBatchTable(rows) {
    const tbody = document.getElementById('batch-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const productName = (productCache.find(p => String(p.id) === String(r.product_id)) || {}).name || r.product_id;
      const machineName = (machineCache.find(m => String(m.id) === String(r.machine_id)) || {}).name || r.machine_id;
      const isClosed = r.status === 'Closed';
      const chipClass = isClosed ? 'status-badge active' : 'status-badge planned';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.batch_id || ''}</td>
        <td>${r.date || ''}</td>
        <td>${productName}</td>
        <td>${machineName}</td>
        <td>${r.planned_qty || ''}</td>
        <td>${r.actual_qty || '—'}</td>
        <td><span class="${chipClass}">${r.status || ''}</span></td>
        <td>${!isClosed ? `<button class="btn-sm" onclick="Production.closeBatchAction('${r.batch_id}')">Close</button>` : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ── Batch Form ────────────────────────────────────────────────────────────

  function openBatchForm() {
    populateFormDropdowns();
    document.getElementById('field-operator').value = session.name || '';
    document.getElementById('field-planned-qty').value = '';
    document.getElementById('field-start-time').value = '';
    document.getElementById('form-title').textContent = 'New Batch Order';
    slideFormIn();
  }

  async function submitBatch() {
    const productId  = document.getElementById('field-product').value;
    const machineId  = document.getElementById('field-machine').value;
    const operatorId = document.getElementById('field-operator').value.trim();
    const plannedQty = document.getElementById('field-planned-qty').value;
    const startTime  = document.getElementById('field-start-time').value;

    if (!productId || !machineId || !plannedQty) {
      showToast('Product, Machine and Planned Qty are required');
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveBatch', {
        product_id:  productId,
        machine_id:  machineId,
        operator_id: operatorId,
        planned_qty: Number(plannedQty),
        start_time:  startTime
      });
      if (res.success) {
        showToast('Batch saved — ' + (res.batch_id || ''));
        slideFormOut();
        await loadBatches();
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  async function closeBatchAction(batchId) {
    const actualQty = prompt('Enter actual quantity produced for ' + batchId + ':');
    if (actualQty === null || actualQty === '') return;
    const qty = Number(actualQty);
    if (isNaN(qty) || qty < 0) { showToast('Invalid quantity'); return; }

    showSpinner(true);
    try {
      const res = await Api.post('closeBatch', { batch_id: batchId, actual_qty: qty });
      if (res.success) {
        showToast('Batch ' + batchId + ' closed');
        await loadBatches();
      } else {
        showToast('Error: ' + (res.error || 'close failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Finished Goods ────────────────────────────────────────────────────────

  async function loadFinishedGoods() {
    showSpinner(true);
    try {
      const res = await Api.get('getFinishedGoods');
      const rows = res.success ? res.data : [];
      renderFGTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function renderFGTable(rows) {
    const tbody = document.getElementById('fg-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const productName = (productCache.find(p => String(p.id) === String(r.product_id)) || {}).name || r.product_id;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.fg_id || ''}</td>
        <td>${r.batch_id || ''}</td>
        <td>${productName}</td>
        <td>${r.qty || ''}</td>
        <td>${r.produced_date || ''}</td>
        <td><span class="status-badge active">${r.status || ''}</span></td>
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

  return { init, loadBatches, submitBatch, closeBatchAction };
})();
