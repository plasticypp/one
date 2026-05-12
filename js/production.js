const Production = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let productCache = [];
  let machineCache = [];
  let operatorCache = [];
  let batchCache = [];
  let closingBatchId = null;
  let editingBatchId = null;
  let activeTab = 'batches';

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    await loadDropdowns();
    await loadBatches();

    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'new') {
      renderTabs();
      openBatchForm();
    } else if (view === 'params') {
      activeTab = 'params';
      renderTabs();
      try { await loadParamsLog(); } catch (_) {}
      openParamsForm();
    } else if (view === 'mine') {
      renderTabs();
      // filter batches table to current operator's batches
      const myBatches = batchCache.filter(b => String(b.operator_id) === String(session.id));
      renderBatchTable(myBatches);
    } else if (view === 'plan') {
      renderTabs();
      // scroll to first Open/Planned batch
    } else if (view === 'today') {
      renderTabs();
      const today = new Date().toISOString().slice(0, 10);
      const todayBatches = batchCache.filter(b => b.start_date && String(b.start_date).slice(0, 10) === today);
      renderBatchTable(todayBatches);
    } else {
      renderTabs();
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', () => {
      editingBatchId = null;
      slideFormOut();
    });
    document.getElementById('close-back').addEventListener('click', slideClosePanelOut);
    document.getElementById('detail-back').addEventListener('click', slideDetailOut);
    document.getElementById('btn-new-batch').addEventListener('click', () => openBatchForm());
    document.getElementById('btn-log-params').addEventListener('click', openParamsForm);
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
        document.getElementById('tab-params').classList.toggle('hidden', activeTab !== 'params');
        if (activeTab === 'fg') await loadFinishedGoods();
        if (activeTab === 'batches') await loadBatches();
        if (activeTab === 'params') await loadParamsLog();
      });
    });
    document.getElementById('tab-batches').classList.toggle('hidden', activeTab !== 'batches');
    document.getElementById('tab-fg').classList.toggle('hidden', activeTab !== 'fg');
    document.getElementById('tab-params').classList.toggle('hidden', activeTab !== 'params');
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────

  async function loadDropdowns() {
    const [pRes, mRes, oRes] = await Promise.all([
      Api.get('getMasterDropdown', { entity: 'Products' }),
      Api.get('getMachineList'),
      Api.get('getOperatorList')
    ]);
    productCache = pRes.success ? pRes.data : [];
    machineCache = mRes.success ? mRes.data : [];
    operatorCache = oRes.success ? oRes.data : [];
  }

  // ── Production Params Log ─────────────────────────────────────────────────

  async function loadParamsLog() {
    UI.showSpinner(true);
    try {
      const batchSel = document.getElementById('filter-params-batch');
      const batchId = batchSel ? batchSel.value : '';
      const params = batchId ? { batch_id: batchId } : {};
      const res = await Api.get('getProductionLog', params);
      renderParamsTable(res.success ? res.data : []);
    } finally { UI.showSpinner(false); }
  }

  function renderParamsTable(rows) {
    const tbody = document.getElementById('params-tbody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="td-loading">No param logs yet</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td style="font-size:var(--text-xs);color:var(--color-text-muted)">${r.log_id || ''}</td>
        <td style="font-weight:600">${r.batch_id || ''}</td>
        <td style="font-size:var(--text-xs)">${String(r.log_time || '').slice(0, 16).replace('T',' ')}</td>
        <td>${r.zone1_temp !== '' && r.zone1_temp !== null ? r.zone1_temp : '—'}</td>
        <td>${r.zone2_temp !== '' && r.zone2_temp !== null ? r.zone2_temp : '—'}</td>
        <td>${r.blow_pressure_bar !== '' && r.blow_pressure_bar !== null ? r.blow_pressure_bar : '—'}</td>
        <td>${r.cycle_time_sec !== '' && r.cycle_time_sec !== null ? r.cycle_time_sec : '—'}</td>
        <td>${r.parison_weight_g !== '' && r.parison_weight_g !== null ? r.parison_weight_g : '—'}</td>
        <td>${(operatorCache.find(o => String(o.id) === String(r.operator_id)) || {}).name || r.operator_id || '—'}</td>
      </tr>`).join('');
  }

  function openParamsForm() {
    const sel = document.getElementById('params-batch-sel');
    sel.innerHTML = '<option value="">— select batch —</option>';
    batchCache.filter(b => b.status !== 'Closed').forEach(b => {
      const pName = (productCache.find(p => String(p.id) === String(b.product_id)) || {}).name || b.product_id;
      const o = document.createElement('option');
      o.value = b.batch_id;
      o.textContent = b.batch_id + ' — ' + pName;
      sel.appendChild(o);
    });
    ['params-zone1','params-zone2','params-blow','params-cycle','params-parison','params-remarks'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('params-panel').classList.add('slide-in');
  }

  function slideParamsPanelOut() {
    document.getElementById('params-panel').classList.remove('slide-in');
  }

  async function submitParamsLog() {
    const batchId = document.getElementById('params-batch-sel').value;
    if (!batchId) { UI.showToast('Select a batch'); return; }
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveProductionLog', {
        batch_id:          batchId,
        zone1_temp:        document.getElementById('params-zone1').value,
        zone2_temp:        document.getElementById('params-zone2').value,
        blow_pressure_bar: document.getElementById('params-blow').value,
        cycle_time_sec:    document.getElementById('params-cycle').value,
        parison_weight_g:  document.getElementById('params-parison').value,
        remarks:           document.getElementById('params-remarks').value,
        userId:            Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Params logged — ' + res.log_id);
        slideParamsPanelOut();
        await loadParamsLog();
      } else { UI.showToast('Error: ' + res.error); }
    } finally { UI.showSpinner(false); }
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

    const oSel = document.getElementById('field-operator');
    oSel.innerHTML = '<option value="">— select operator —</option>';
    operatorCache.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name + (p.role ? ' (' + p.role + ')' : '');
      oSel.appendChild(o);
    });
  }

  // ── Batch List ────────────────────────────────────────────────────────────

  async function loadBatches(status) {
    UI.showSpinner(true);
    try {
      const filterStatus = status || document.getElementById('filter-status').value || 'all';
      const params = {};
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      const res = await Api.get('getBatchList', params);
      const rows = res.success ? res.data : [];
      batchCache = rows;
      renderBatchTable(rows);
      // Sync params batch filter
      const sel = document.getElementById('filter-params-batch');
      if (sel) {
        const cur = sel.value;
        sel.innerHTML = '<option value="">All Batches</option>';
        rows.forEach(b => {
          const pName = (productCache.find(p => String(p.id) === String(b.product_id)) || {}).name || b.product_id;
          const o = document.createElement('option');
          o.value = b.batch_id; o.textContent = b.batch_id + ' — ' + pName;
          if (b.batch_id === cur) o.selected = true;
          sel.appendChild(o);
        });
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderBatchTable(rows) {
    const tbody = document.getElementById('batch-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="td-loading">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const productName = (productCache.find(p => String(p.id) === String(r.product_id)) || {}).name || r.product_id;
      const machineName = (machineCache.find(m => String(m.id) === String(r.machine_id)) || {}).name || r.machine_id;
      const isClosed = r.status === 'Closed';
      const chipClass = isClosed ? 'status-badge active' : 'status-badge planned';
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.batch_id || ''}</td>
        <td>${String(r.date || '').slice(0, 10)}</td>
        <td>${productName}</td>
        <td>${machineName}</td>
        <td>${r.planned_qty || ''}</td>
        <td>${r.actual_qty || '—'}</td>
        <td><span class="${chipClass}">${r.status || ''}</span></td>
        <td>${!isClosed && ['director','supervisor'].includes(session.role) ? `<button class="btn-sm" onclick="event.stopPropagation();Production.closeBatchAction('${r.batch_id}')">Close</button>` : ''}</td>
      `;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        openBatchDetail(r.batch_id);
      });
      tbody.appendChild(tr);
    });
  }

  // ── Batch Form ────────────────────────────────────────────────────────────

  function openBatchForm() {
    editingBatchId = null;
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

    if (editingBatchId) {
      if (!productId || !machineId || !plannedQty) {
        UI.showToast('Product, Machine and Planned Qty are required');
        return;
      }
      UI.showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'BatchOrders', idCol: 'batch_id', idVal: editingBatchId,
          userId: Auth.getUserId(),
          fields: { product_id: productId, machine_id: machineId, operator_id: operatorId, shift: document.getElementById('field-shift').value, rm_lot: document.getElementById('field-rm-lot').value, planned_qty: Number(plannedQty), start_time: startTime }
        });
        if (res.success) {
          editingBatchId = null;
          slideFormOut();
          await loadBatches();
        } else {
          UI.showToast('Update failed: ' + res.error);
        }
      } finally { UI.showSpinner(false); }
      return;
    }

    if (!productId || !machineId || !plannedQty) {
      UI.showToast('Product, Machine and Planned Qty are required');
      return;
    }

    UI.showSpinner(true);
    try {
      const res = await Api.post('saveBatch', {
        product_id:  productId,
        machine_id:  machineId,
        operator_id: operatorId,
        shift:       document.getElementById('field-shift').value,
        rm_lot:      document.getElementById('field-rm-lot').value,
        planned_qty: Number(plannedQty),
        start_time:  startTime,
        userId:      Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Batch saved — ' + (res.batch_id || ''));
        slideFormOut();
        await loadBatches();
      } else {
        UI.showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Close Batch Panel ─────────────────────────────────────────────────────

  async function closeBatchAction(batchId) {
    const batch = batchCache.find(b => String(b.batch_id) === String(batchId));
    if (!batch) return;
    closingBatchId = batchId;
    document.getElementById('close-batch-id-display').value = batchId;
    document.getElementById('close-planned-qty').value = batch.planned_qty || '';
    document.getElementById('close-actual-qty').value = '';
    document.getElementById('close-rejections').value = '0';
    document.getElementById('close-rejection-reason').value = '';
    document.getElementById('close-downtime-min').value = '0';
    document.getElementById('close-downtime-reason').value = '';
    document.getElementById('close-end-time').value = '';
    document.getElementById('close-notes').value = '';
    const warn = document.getElementById('close-qc-warning');
    warn.style.display = 'none';

    const qcRes = await Api.get('getQualityChecks', { batch_id: batchId });
    if (qcRes.success && qcRes.data.length > 0) {
      const ng = qcRes.data.filter(c => c.result === 'NG').length;
      if (ng > 0) {
        warn.style.display = 'block';
        warn.textContent = `Warning: ${ng} of ${qcRes.data.length} quality checks are NG. Director override required if NG rate > 20%.`;
      }
    }
    slideClosePanelIn();
  }

  async function submitClose() {
    const actualQty = Number(document.getElementById('close-actual-qty').value);
    if (!actualQty || actualQty <= 0) { UI.showToast('Enter actual quantity'); return; }
    UI.showSpinner(true);
    try {
      const res = await Api.post('closeBatch', {
        batch_id:         closingBatchId,
        actual_qty:       actualQty,
        rejections:       Number(document.getElementById('close-rejections').value) || 0,
        rejection_reason: document.getElementById('close-rejection-reason').value,
        downtime_min:     Number(document.getElementById('close-downtime-min').value) || 0,
        downtime_reason:  document.getElementById('close-downtime-reason').value,
        end_time:         document.getElementById('close-end-time').value,
        notes:            document.getElementById('close-notes').value,
        override:         session.role === 'director' ? 'true' : 'false',
        userId:           Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Batch ' + closingBatchId + ' closed');
        closingBatchId = null;
        slideClosePanelOut();
        await loadBatches();
      } else if (res.error === 'iqc_not_passed') {
        UI.showToast(`IQC gate: RM lot ${res.lot_no} has not passed IQC. Complete IQC before closing batch.`);
      } else if (res.error === 'no_param_logs') {
        UI.showToast('No parameter logs found for this batch. Log params before closing.');
      } else if (res.error === 'quality_gate') {
        UI.showToast(`Quality gate: ${res.ng_count}/${res.total} NG (${res.ng_rate}%). Only director can override.`);
      } else {
        UI.showToast('Error: ' + res.error);
      }
    } finally { UI.showSpinner(false); }
  }

  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openBatchDetail(batchId) {
    const r = batchCache.find(b => String(b.batch_id) === String(batchId));
    if (!r) return;
    const pName = (productCache.find(p => String(p.id) === String(r.product_id)) || {}).name || r.product_id;
    const mName = (machineCache.find(m => String(m.id) === String(r.machine_id)) || {}).name || r.machine_id;
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>Batch ID</span><strong>${r.batch_id}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${String(r.date || '').slice(0, 10) || '—'}</strong></div>
      <div class="detail-row"><span>Product</span><strong>${pName}</strong></div>
      <div class="detail-row"><span>Machine</span><strong>${mName}</strong></div>
      <div class="detail-row"><span>Operator</span><strong>${(operatorCache.find(o => String(o.id) === String(r.operator_id)) || {}).name || r.operator_id || '—'}</strong></div>
      <div class="detail-row"><span>Planned Qty</span><strong>${r.planned_qty}</strong></div>
      <div class="detail-row"><span>Actual Qty</span><strong>${r.actual_qty || '—'}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${r.status}</strong></div>
      <div class="detail-row"><span>Start Time</span><strong>${r.start_time || '—'}</strong></div>
      <div class="detail-row"><span>End Time</span><strong>${r.end_time || '—'}</strong></div>
    `;
    const canEdit = ['director','supervisor'].includes(session.role) && r.status !== 'Closed';
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="Production.editBatch('${batchId}')">Edit</button>
         <button class="btn-deactivate" onclick="Production.deleteBatch('${batchId}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editBatch(batchId) {
    const r = batchCache.find(b => String(b.batch_id) === String(batchId));
    if (!r) return;
    editingBatchId = batchId;
    slideDetailOut();
    populateFormDropdowns();
    document.getElementById('field-product').value = r.product_id || '';
    document.getElementById('field-machine').value = r.machine_id || '';
    document.getElementById('field-operator').value = r.operator_id || '';
    document.getElementById('field-planned-qty').value = r.planned_qty || '';
    document.getElementById('field-start-time').value = r.start_time || '';
    document.getElementById('form-title').textContent = 'Edit Batch';
    slideFormIn();
  }

  async function deleteBatch(batchId) {
    if (!confirm('Delete batch ' + batchId + '?')) return;
    const res = await Api.post('deleteRecord', { sheet: 'BatchOrders', idCol: 'batch_id', idVal: batchId, userId: Auth.getUserId() });
    if (res.success) { slideDetailOut(); await loadBatches(); }
    else UI.showToast('Delete failed: ' + res.error);
  }

  // ── Finished Goods ────────────────────────────────────────────────────────

  async function loadFinishedGoods() {
    UI.showSpinner(true);
    try {
      const res = await Api.get('getFinishedGoods');
      const rows = res.success ? res.data : [];
      renderFGTable(rows);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderFGTable(rows) {
    const tbody = document.getElementById('fg-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="td-loading">No records</td></tr>';
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
        <td>${String(r.produced_date || '').slice(0, 10)}</td>
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
    editingBatchId = null;
  }

  function slideClosePanelIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('close-panel').classList.add('slide-in');
  }

  function slideClosePanelOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('close-panel').classList.remove('slide-in');
    closingBatchId = null;
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

  return { init, loadBatches, submitBatch, closeBatchAction, submitClose, editBatch, deleteBatch, loadParamsLog, submitParamsLog, slideParamsPanelOut };
})();
