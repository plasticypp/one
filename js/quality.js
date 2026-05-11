const Quality = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let batchCache = [];
  let checkCache = {};
  let inspectionParamCache = [];
  let selectedParam = null;
  let editingCheckId = null;
  let activeTab = 'summary';
  let activeStage = null;

  const STAGE_TABS = { iqc: 'IQC', ipc: 'IPC', oqc: 'OQC' };

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);
    setupHeader();
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && STAGE_TABS[tabParam]) {
      activeTab = tabParam;
      activeStage = STAGE_TABS[tabParam];
    }
    renderTabs();
    await loadBatches();
    if (activeTab === 'summary') await loadSummary();
    else await loadChecks('', activeStage);
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', () => {
      editingCheckId = null;
      slideFormOut();
    });
    document.getElementById('detail-back').addEventListener('click', slideDetailOut);
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
      const tab = btn.dataset.tab;
      btn.classList.toggle('active', tab === activeTab);
      btn.onclick = async () => {
        activeTab = tab;
        activeStage = STAGE_TABS[tab] || null;
        renderTabs();
        if (activeTab === 'summary') await loadSummary();
        if (activeStage) {
          const batchId = document.getElementById('filter-batch-' + tab).value;
          await loadChecks(batchId, activeStage);
        }
      };
    });
    document.getElementById('tab-summary').classList.toggle('hidden', activeTab !== 'summary');
    ['iqc', 'ipc', 'oqc'].forEach(t => {
      document.getElementById('tab-' + t).classList.toggle('hidden', activeTab !== t);
    });
  }

  // ── Batch Dropdowns ───────────────────────────────────────────────────────

  async function loadBatches() {
    const res = await Api.get('getBatchList', {});
    batchCache = res.success ? res.data : [];
    populateBatchDropdowns();
  }

  function populateBatchDropdowns() {
    ['iqc', 'ipc', 'oqc'].forEach(tabKey => {
      const sel = document.getElementById('filter-batch-' + tabKey);
      if (!sel) return;
      sel.innerHTML = '<option value="">All Batches</option>';
      batchCache.forEach(b => {
        const o = document.createElement('option');
        o.value = b.batch_id;
        o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
        sel.appendChild(o);
      });
      sel.addEventListener('change', async () => {
        await loadChecks(sel.value, STAGE_TABS[tabKey]);
      });

      const btn = document.getElementById('btn-new-check-' + tabKey);
      if (btn) btn.addEventListener('click', () => openCheckForm(STAGE_TABS[tabKey]));
    });

    // Also populate form batch dropdown
    const formSel = document.getElementById('field-batch');
    if (formSel) {
      formSel.innerHTML = '<option value="">— select —</option>';
      batchCache.forEach(b => {
        const o = document.createElement('option');
        o.value = b.batch_id;
        o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
        formSel.appendChild(o);
      });
    }
  }

  // ── Summary Tab ───────────────────────────────────────────────────────────

  async function loadSummary() {
    showSpinner(true);
    try {
      const res = await Api.get('getQualitySummary');
      renderSummaryCards(res.success ? res.data : []);
    } finally {
      showSpinner(false);
    }
  }

  function renderSummaryCards(rows) {
    const grid = document.getElementById('summary-grid');
    grid.innerHTML = '';
    if (rows.length === 0) {
      grid.innerHTML = '<p class="empty-msg">No quality data</p>';
      return;
    }
    rows.forEach(r => {
      const rate = r.pass_rate;
      const color = rate >= 95 ? '#2e7d32' : rate >= 80 ? '#f57f17' : '#c62828';
      const bg    = rate >= 95 ? '#f1f8f1' : rate >= 80 ? '#fffde7' : '#fff5f5';
      const card = document.createElement('div');
      card.className = 'qc-card';
      card.style.borderColor = color;
      card.style.background = bg;
      card.innerHTML = `
        <div class="qc-batch-id">${r.batch_id}</div>
        <div class="qc-pass-rate" style="color:${color}">${rate}%</div>
        <div class="qc-counts">
          <span class="qc-ok">OK: ${r.ok}</span>
          <span class="qc-ng">NG: ${r.ng}</span>
          <span class="qc-total">Total: ${r.total}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        activeTab = 'ipc';
        activeStage = 'IPC';
        document.getElementById('filter-batch-ipc').value = r.batch_id;
        renderTabs();
        loadChecks(r.batch_id, 'IPC');
      });
      grid.appendChild(card);
    });
  }

  // ── Check Log Tabs ────────────────────────────────────────────────────────

  async function loadChecks(batchId, stage) {
    showSpinner(true);
    try {
      const params = { stage };
      if (batchId) params.batch_id = batchId;
      const res = await Api.get('getQualityChecks', params);
      const rows = res.success ? res.data : [];
      checkCache[stage] = rows;
      renderChecksTable(rows, stage);
    } finally {
      showSpinner(false);
    }
  }

  function renderChecksTable(rows, stage) {
    const tbodyId = 'checks-tbody-' + stage.toLowerCase();
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="td-loading">No records</td></tr>';
      return;
    }
    rows.forEach(r => {
      const isOK = r.result === 'OK';
      const chip = `<span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${r.result}</span>`;
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.check_id || ''}</td>
        <td>${r.batch_id || ''}</td>
        <td>${r.parameter || ''}</td>
        <td>${r.spec_min ?? ''}</td>
        <td>${r.spec_max ?? ''}</td>
        <td>${r.actual_value ?? ''}</td>
        <td>${chip}</td>
        <td>${r.remarks || ''}</td>
      `;
      tr.addEventListener('click', () => openCheckDetail(r.check_id, stage));
      tbody.appendChild(tr);
    });
  }

  // ── Check Form ────────────────────────────────────────────────────────────

  function openCheckForm(stage) {
    editingCheckId = null;
    selectedParam = null;
    activeStage = stage;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-check-date').value = today;
    document.getElementById('field-inspector').value = session.name || '';
    document.getElementById('field-actual').value = '';
    document.getElementById('field-remarks').value = '';
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';
    renderParamButtons([]);

    const tabKey = stage.toLowerCase();
    const batchSel = document.getElementById('field-batch');
    const filterVal = document.getElementById('filter-batch-' + tabKey)
      ? document.getElementById('filter-batch-' + tabKey).value
      : '';
    if (filterVal) {
      batchSel.value = filterVal;
      const batch = batchCache.find(b => String(b.batch_id) === String(filterVal));
      if (batch) loadInspectionParams(stage, batch.product_id);
    }
    batchSel.onchange = async () => {
      const batch = batchCache.find(b => String(b.batch_id) === String(batchSel.value));
      await loadInspectionParams(stage, batch ? batch.product_id : null);
    };
    document.getElementById('form-title').textContent = 'New ' + stage + ' Check';
    slideFormIn();
  }

  async function loadInspectionParams(stage, productId) {
    if (!productId) { renderParamButtons([]); return; }
    const res = await Api.get('getInspectionParams', { stage, product_id: productId });
    inspectionParamCache = res.success ? res.data : [];
    renderParamButtons(inspectionParamCache);
  }

  function renderParamButtons(params) {
    const container = document.getElementById('param-btn-group');
    container.innerHTML = '';
    selectedParam = null;
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';

    if (params.length === 0) {
      container.innerHTML = '<span style="font-size:0.85rem;color:var(--neutral-500);">Select a batch first.</span>';
      return;
    }
    params.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'param-btn';
      btn.textContent = p.parameter + (p.unit ? ' (' + p.unit + ')' : '');
      btn.dataset.paramId = p.id;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.param-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedParam = p;
        document.getElementById('field-spec-min').value = p.spec_min ?? '';
        document.getElementById('field-spec-max').value = p.spec_max ?? '';
        document.getElementById('field-spec-min').readOnly = false;
        document.getElementById('field-spec-max').readOnly = false;
        const hint = document.getElementById('param-hint');
        if (hint) hint.textContent = p.sample_size ? 'Sample: ' + p.sample_size : '';
      });
      container.appendChild(btn);
    });
  }

  async function submitCheck() {
    const batchId   = document.getElementById('field-batch').value.trim();
    const inspector = document.getElementById('field-inspector').value.trim();
    const actual    = document.getElementById('field-actual').value;
    const remarks   = document.getElementById('field-remarks').value.trim();
    const checkDate = document.getElementById('field-check-date').value;

    const eBatch  = document.getElementById('err-batch');
    const eActual = document.getElementById('err-actual');
    if (eBatch)  eBatch.textContent  = '';
    if (eActual) eActual.textContent = '';
    let valid = true;
    if (!batchId)    { if (eBatch)  eBatch.textContent  = 'Select a batch'; valid = false; }
    if (actual === '') { if (eActual) eActual.textContent = 'Enter actual value'; valid = false; }
    if (!valid) return;

    const parameter = selectedParam ? selectedParam.parameter : 'Manual';
    const specMin   = selectedParam ? (selectedParam.spec_min ?? null) : (document.getElementById('field-spec-min').value !== '' ? Number(document.getElementById('field-spec-min').value) : null);
    const specMax   = selectedParam ? (selectedParam.spec_max ?? null) : (document.getElementById('field-spec-max').value !== '' ? Number(document.getElementById('field-spec-max').value) : null);

    if (editingCheckId) {
      const fields = { check_date: checkDate, inspector_id: inspector, actual_value: Number(actual), remarks };
      if (selectedParam) {
        fields.parameter = selectedParam.parameter;
        fields.spec_min  = selectedParam.spec_min;
        fields.spec_max  = selectedParam.spec_max;
        const a = Number(actual);
        const sMin = selectedParam.spec_min;
        const sMax = selectedParam.spec_max;
        fields.result = (sMin === null && sMax === null) ? 'OK'
                      : (a >= (sMin ?? -Infinity) && a <= (sMax ?? Infinity)) ? 'OK' : 'NG';
      }
      showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'QualityChecks', idCol: 'check_id', idVal: editingCheckId,
          userId: Auth.getUserId(), fields
        });
        if (res.success) {
          editingCheckId = null;
          slideFormOut();
          await loadSummary();
          const tabKey = (activeStage || 'IPC').toLowerCase();
          await loadChecks(document.getElementById('filter-batch-' + tabKey).value, activeStage || 'IPC');
        } else {
          showToast('Update failed: ' + res.error);
        }
      } finally { showSpinner(false); }
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveQualityCheck', {
        batch_id:     batchId,
        check_date:   checkDate,
        inspector_id: inspector,
        parameter,
        spec_min:     specMin,
        spec_max:     specMax,
        actual_value: Number(actual),
        remarks,
        stage:        activeStage || 'IPC',
        userId:       Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        const tabKey = (activeStage || 'IPC').toLowerCase();
        await loadSummary();
        await loadChecks(document.getElementById('filter-batch-' + tabKey).value, activeStage || 'IPC');
        if (res.result === 'NG') {
          const batchParam = encodeURIComponent(batchId);
          showToastWithLink(
            'Check saved — NG.',
            'Log NCR →',
            'ncr.html?batch=' + batchParam + '&stage=' + (activeStage || 'IPC')
          );
        } else {
          showToast('Check saved — ' + (res.check_id || ''));
        }
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openCheckDetail(checkId, stage) {
    const cache = checkCache[stage] || [];
    const r = cache.find(c => String(c.check_id) === String(checkId));
    if (!r) return;
    const fv = (v) => (v === undefined || v === null || v === '') ? '—' : String(v).slice(0, 30);
    const dateStr = (v) => v ? String(v).slice(0, 10) : '—';
    const result = r.result || '—';
    const isOK = result === 'OK';
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>Check ID</span><strong>${fv(r.check_id)}</strong></div>
      <div class="detail-row"><span>Batch</span><strong>${fv(r.batch_id)}</strong></div>
      <div class="detail-row"><span>Stage</span><strong>${fv(r.stage || stage)}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${dateStr(r.check_date)}</strong></div>
      <div class="detail-row"><span>Inspector</span><strong>${fv(r.inspector_id)}</strong></div>
      <div class="detail-row"><span>Parameter</span><strong>${fv(r.parameter)}</strong></div>
      <div class="detail-row"><span>Spec Min</span><strong>${fv(r.spec_min)}</strong></div>
      <div class="detail-row"><span>Spec Max</span><strong>${fv(r.spec_max)}</strong></div>
      <div class="detail-row"><span>Actual Value</span><strong>${fv(r.actual_value)}</strong></div>
      <div class="detail-row"><span>Result</span><span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${result}</span></div>
      <div class="detail-row"><span>Remarks</span><strong>${fv(r.remarks)}</strong></div>
    `;
    const canEdit = ['director', 'qmr', 'supervisor'].includes(session.role);
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="Quality.editCheck('${checkId}','${stage}')">Edit</button>
         <button class="btn-deactivate" onclick="Quality.deleteCheck('${checkId}','${stage}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editCheck(checkId, stage) {
    const cache = checkCache[stage] || [];
    const r = cache.find(c => String(c.check_id) === String(checkId));
    if (!r) return;
    editingCheckId = checkId;
    activeStage = stage;
    slideDetailOut();
    document.getElementById('field-check-date').value = r.check_date || '';
    document.getElementById('field-batch').value = r.batch_id || '';
    document.getElementById('field-inspector').value = r.inspector_id || '';
    document.getElementById('field-actual').value = r.actual_value ?? '';
    document.getElementById('field-remarks').value = r.remarks || '';
    document.getElementById('field-spec-min').value = r.spec_min ?? '';
    document.getElementById('field-spec-max').value = r.spec_max ?? '';
    const batch = batchCache.find(b => String(b.batch_id) === String(r.batch_id));
    loadInspectionParams(stage, batch ? batch.product_id : null).then(() => {
      document.querySelectorAll('.param-btn').forEach(btn => {
        if (btn.textContent.startsWith(r.parameter)) btn.click();
      });
    });
    document.getElementById('form-title').textContent = 'Edit ' + stage + ' Check';
    slideFormIn();
  }

  async function deleteCheck(checkId, stage) {
    if (!confirm('Delete check ' + checkId + '?')) return;
    const res = await Api.post('deleteRecord', {
      sheet: 'QualityChecks', idCol: 'check_id', idVal: checkId, userId: Auth.getUserId()
    });
    if (res.success) {
      slideDetailOut();
      const tabKey = stage.toLowerCase();
      await loadChecks(document.getElementById('filter-batch-' + tabKey).value, stage);
    } else {
      showToast('Delete failed: ' + res.error);
    }
  }

  // ── Slide Transitions ─────────────────────────────────────────────────────

  function slideFormIn() {
    document.getElementById('main-content').classList.add('slide-out');
    document.getElementById('form-panel').classList.add('slide-in');
  }

  function slideFormOut() {
    document.getElementById('main-content').classList.remove('slide-out');
    document.getElementById('form-panel').classList.remove('slide-in');
    editingCheckId = null;
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

  function showToastWithLink(msg, linkText, href) {
    const t = document.getElementById('toast');
    t.innerHTML = msg + ' <a href="' + href + '" style="color:#fff;text-decoration:underline;">' + linkText + '</a>';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }

  return { init, submitCheck, loadChecks, loadSummary, editCheck, deleteCheck };
})();
