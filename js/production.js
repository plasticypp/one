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

  // Plan tab state
  let planSOList = [];
  let lotPickerBatchId = null;
  let lotPickerSOId = null;
  let lotPickerFeasibility = null;

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
      activeTab = 'plan';
      renderTabs();
      await loadPlanTab();
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
        document.getElementById('tab-plan').classList.toggle('hidden', activeTab !== 'plan');
        if (activeTab === 'fg') await loadFinishedGoods();
        if (activeTab === 'batches') await loadBatches();
        if (activeTab === 'params') await loadParamsLog();
        if (activeTab === 'plan') await loadPlanTab();
      });
    });
    document.getElementById('tab-batches').classList.toggle('hidden', activeTab !== 'batches');
    document.getElementById('tab-fg').classList.toggle('hidden', activeTab !== 'fg');
    document.getElementById('tab-params').classList.toggle('hidden', activeTab !== 'params');
    document.getElementById('tab-plan').classList.toggle('hidden', activeTab !== 'plan');
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

  async function openBatchDetail(batchId) {
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
      <div id="detail-issues-section"></div>
    `;
    const canEdit = ['director','supervisor'].includes(session.role) && r.status !== 'Closed';
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="Production.editBatch('${batchId}')">Edit</button>
         <button class="btn-deactivate" onclick="Production.deleteBatch('${batchId}')">Delete</button>`
      : '';
    slideDetailIn();

    // Async: load material issues
    const miRes = await Api.get('getMaterialIssueByBatch', { batch_id: batchId });
    const section = document.getElementById('detail-issues-section');
    if (!section) return;
    const issues = miRes.success ? miRes.data : [];
    if (!issues.length) {
      section.innerHTML = '<div style="margin-top:16px;font-size:var(--text-sm);color:var(--color-text-muted)">No materials issued for this batch.</div>';
      return;
    }
    section.innerHTML = `
      <div style="margin-top:16px;font-weight:600;font-size:var(--text-sm);border-top:1px solid var(--color-border);padding-top:12px;margin-bottom:8px">Materials Issued</div>
      ${issues.map(i => `
        <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);padding:4px 0;border-bottom:1px solid var(--color-border-light)">
          <div>
            <div style="font-weight:500">${esc(i.material)} · ${esc(i.lot_no)}</div>
            <div style="color:var(--color-text-muted);font-size:var(--text-xs)">${esc(i.grn_id)} · ${esc(i.status)}</div>
          </div>
          <div style="font-weight:700;white-space:nowrap">${esc(String(i.qty_issued_kg))} kg</div>
        </div>`).join('')}
      <div style="text-align:right;margin-top:6px;">
        <a href="pickslip.html?batch_id=${encodeURIComponent(batchId)}" target="_blank" style="font-size:var(--text-sm);color:var(--color-primary)">View Pick Slip →</a>
      </div>`;
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
    document.getElementById('field-shift').value = r.shift || 'A';
    document.getElementById('field-rm-lot').value = r.rm_lot || '';
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

  // ── Plan Tab ──────────────────────────────────────────────────────────────

  async function loadPlanTab() {
    const container = document.getElementById('plan-cards');
    container.innerHTML = '<div class="td-loading" style="padding:32px;text-align:center;color:var(--color-text-muted)">Loading…</div>';
    try {
      const res = await Api.get('getSOList', { status: 'active' });
      planSOList = res.success ? res.data : [];
      if (!planSOList.length) {
        container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--color-text-muted)">No active Sales Orders</div>';
        return;
      }
      // Fetch feasibility for each SO in parallel
      const feasResults = await Promise.all(planSOList.map(so => Api.get('getSOFeasibility', { so_id: so.so_id })));
      container.innerHTML = '';
      planSOList.forEach((so, i) => {
        const f = feasResults[i].success ? feasResults[i].data : null;
        container.appendChild(buildPlanCard(so, f));
      });
    } catch (e) {
      container.innerHTML = '<div style="padding:32px;text-align:center;color:#c62828">Failed to load plan data</div>';
    }
  }

  function buildPlanCard(so, f) {
    const div = document.createElement('div');
    div.style.cssText = 'border:1px solid var(--color-border);border-radius:10px;padding:14px 16px;margin-bottom:12px;background:var(--color-surface)';

    const productName = so.product_name || so.product_id;
    const qtyRemaining = so.qty_remaining || 0;

    let fgRow = '';
    let bomRows = '';
    let actionBtn = '';

    if (f) {
      const fgBadge = f.fg_stock >= qtyRemaining
        ? `<span style="color:#16a34a;font-weight:600">✓ ${f.fg_stock} in stock</span>`
        : `<span style="color:#92400e">${f.fg_stock} in stock</span>`;

      fgRow = `<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin:8px 0 4px;">
        <span style="color:var(--color-text-muted)">FG Stock</span>${fgBadge}</div>`;

      if (f.bom_requirements && f.bom_requirements.length) {
        bomRows = f.bom_requirements.map(b => {
          const ok = b.shortfall_kg <= 0;
          return `<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);padding:3px 0;">
            <span>${b.material}</span>
            <span style="color:${ok ? '#16a34a' : '#c62828'};font-weight:600">
              ${ok ? `✓ ${b.available_kg} kg avail` : `⚠ Short ${b.shortfall_kg} kg`}
            </span></div>`;
        }).join('');
      }

      const canProduce = f.feasible_qty > 0;
      const linkedBatch = batchCache.find(b => String(b.so_id) === String(so.so_id) && b.status !== 'Closed');

      if (f.can_fulfill_from_stock) {
        actionBtn = `<button class="btn-sm" style="background:#16a34a;color:#fff;margin-top:10px" disabled>Ready to Dispatch</button>`;
      } else if (linkedBatch && (linkedBatch.status === 'Planned' || linkedBatch.status === 'In Progress')) {
        const hasIssue = false; // TODO: check MaterialIssue sheet
        actionBtn = `<button class="btn-sm" style="background:#EA580C;color:#fff;margin-top:10px"
          onclick="Production.openLotPicker('${linkedBatch.batch_id}','${so.so_id}')">Issue Materials → ${linkedBatch.batch_id}</button>`;
      } else if (canProduce) {
        actionBtn = `<button class="btn-sm" style="background:#1d4ed8;color:#fff;margin-top:10px"
          onclick="Production.planBatchForSO('${so.so_id}','${so.product_id}',${qtyRemaining})">Plan Batch</button>`;
      } else {
        actionBtn = `<button class="btn-sm" style="background:#6b7280;color:#fff;margin-top:10px" disabled>Raise Reorder</button>`;
      }
    }

    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div>
          <div style="font-weight:700;font-size:var(--text-base)">${esc(so.so_id)}</div>
          <div style="font-size:var(--text-sm);color:var(--color-text-muted)">${esc(productName)} · ${esc(so.customer_name || '')}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:var(--text-xl);font-weight:700">${qtyRemaining}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted)">pcs remaining</div>
        </div>
      </div>
      ${fgRow}
      <div style="border-top:1px solid var(--color-border);margin:8px 0;padding-top:8px;">${bomRows}</div>
      ${actionBtn}
    `;
    return div;
  }

  async function planBatchForSO(soId, productId, plannedQty) {
    if (!['director','supervisor'].includes(session.role)) { UI.showToast('Director or Supervisor only'); return; }
    const machineId = machineCache.length ? machineCache[0].id : '';
    UI.showSpinner(true);
    try {
      const res = await Api.post('planBatchFromSO', {
        so_id: soId, product_id: productId, planned_qty: plannedQty,
        machine_id: machineId, userId: Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Batch ' + res.batch_id + ' planned');
        await Promise.all([loadBatches(), loadPlanTab()]);
      } else {
        UI.showToast('Error: ' + res.error);
      }
    } finally { UI.showSpinner(false); }
  }

  async function openLotPicker(batchId, soId) {
    lotPickerBatchId = batchId;
    lotPickerSOId = soId;
    document.getElementById('lot-picker-batch-id').textContent = batchId;
    document.getElementById('lot-picker-body').innerHTML = '<div class="td-loading" style="padding:20px;text-align:center">Loading…</div>';
    slideLotPickerIn();

    const res = await Api.get('getSOFeasibility', { so_id: soId });
    if (!res.success) { document.getElementById('lot-picker-body').innerHTML = '<div style="color:#c62828;padding:16px">Failed to load feasibility</div>'; return; }
    lotPickerFeasibility = res.data;
    renderLotPicker(res.data);
  }

  function renderLotPicker(f) {
    const body = document.getElementById('lot-picker-body');
    if (!f.bom_requirements || !f.bom_requirements.length) {
      body.innerHTML = '<div style="padding:16px;color:var(--color-text-muted)">No BOM requirements found</div>';
      return;
    }

    const qtyNeeded = f.qty_remaining;
    let html = `<p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:12px">Batch: <strong>${esc(lotPickerBatchId)}</strong> · Planned qty: <strong>${qtyNeeded}</strong> pcs</p>`;

    f.bom_requirements.forEach(item => {
      const neededKg = item.qty_needed_kg;
      html += `<div style="margin-bottom:16px;border:1px solid var(--color-border);border-radius:8px;padding:12px">
        <div style="font-weight:600;margin-bottom:8px">${esc(item.material)} — need ${neededKg} kg</div>`;

      if (!item.lots || !item.lots.length) {
        html += `<div style="font-size:var(--text-sm);color:#c62828">No usable lots available</div>`;
      } else {
        item.lots.forEach(lot => {
          html += `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--color-border-light);font-size:var(--text-sm)">
            <input type="checkbox" class="lot-check" data-lot="${esc(lot.lot_no)}" data-grn="${esc(lot.grn_id)}" data-material="${esc(item.material)}" data-avail="${lot.available_kg}" checked style="width:16px;height:16px">
            <div style="flex:1">
              <div style="font-weight:500">${esc(lot.lot_no)} (${esc(lot.grn_id)})</div>
              <div style="color:var(--color-text-muted)">${lot.available_kg} kg avail · IQC: ${esc(lot.iqc_status)} · ${esc(lot.date).slice(0,10)}</div>
            </div>
            <input type="number" class="lot-qty" data-lot="${esc(lot.lot_no)}" data-material="${esc(item.material)}" value="${Math.min(lot.available_kg, neededKg)}" max="${lot.available_kg}" min="0" step="0.001" style="width:80px;border:1px solid var(--color-border);border-radius:6px;padding:4px 6px;font-size:var(--text-sm)">
            <span style="color:var(--color-text-muted)">kg</span>
          </div>`;
        });
      }
      html += '</div>';
    });

    body.innerHTML = html;
  }

  async function confirmIssueMaterials() {
    const checks = document.querySelectorAll('.lot-check:checked');
    if (!checks.length) { UI.showToast('Select at least one lot'); return; }

    const lots = [];
    checks.forEach(cb => {
      const lotNo = cb.dataset.lot;
      const material = cb.dataset.material;
      const grn_id = cb.dataset.grn;
      const qtyInput = document.querySelector(`.lot-qty[data-lot="${lotNo}"][data-material="${material}"]`);
      const qtyKg = qtyInput ? Number(qtyInput.value) : 0;
      if (qtyKg > 0) lots.push({ lot_no: lotNo, grn_id, material, qty_kg: qtyKg });
    });

    if (!lots.length) { UI.showToast('Enter quantity for selected lots'); return; }

    UI.showSpinner(true);
    try {
      const res = await Api.post('issueMaterials', {
        batch_id: lotPickerBatchId,
        lots,
        userId: Auth.getUserId()
      });
      if (res.success) {
        UI.showToast('Materials issued — ' + res.issue_ids.join(', '));
        slideLotPickerOut();
        window.open('pickslip.html?batch_id=' + encodeURIComponent(lotPickerBatchId), '_blank');
        await loadPlanTab();
      } else {
        UI.showToast('Error: ' + res.error);
      }
    } finally { UI.showSpinner(false); }
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function slideLotPickerIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('lot-picker-panel').classList.add('slide-in');
  }

  function slideLotPickerOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('lot-picker-panel').classList.remove('slide-in');
    lotPickerBatchId = null;
    lotPickerSOId = null;
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

  return { init, loadBatches, submitBatch, closeBatchAction, submitClose, editBatch, deleteBatch, loadParamsLog, submitParamsLog, slideParamsPanelOut, planBatchForSO, openLotPicker, confirmIssueMaterials, slideLotPickerOut };
})();
