const Quality = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let batchCache = [];
  let checkCache = [];
  let qualityParamCache = [];
  let selectedParam = null;
  let editingCheckId = null;
  let activeTab = 'summary';

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    renderTabs();
    await loadBatches();
    await loadSummary();
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
    document.getElementById('btn-new-check').addEventListener('click', () => openCheckForm());
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
        document.getElementById('tab-summary').classList.toggle('hidden', activeTab !== 'summary');
        document.getElementById('tab-checks').classList.toggle('hidden', activeTab !== 'checks');
        if (activeTab === 'summary') await loadSummary();
        if (activeTab === 'checks') {
          const batchId = document.getElementById('filter-batch').value;
          await loadChecks(batchId);
        }
      });
    });
    document.getElementById('tab-summary').classList.toggle('hidden', activeTab !== 'summary');
    document.getElementById('tab-checks').classList.toggle('hidden', activeTab !== 'checks');
  }

  // ── Batch Dropdown ────────────────────────────────────────────────────────

  async function loadBatches() {
    const res = await Api.get('getBatchList', {});
    batchCache = res.success ? res.data : [];
    populateBatchDropdowns();
  }

  function populateBatchDropdowns() {
    ['filter-batch', 'field-batch'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const isFilter = id === 'filter-batch';
      sel.innerHTML = isFilter ? '<option value="">All Batches</option>' : '<option value="">— select —</option>';
      batchCache.forEach(b => {
        const o = document.createElement('option');
        o.value = b.batch_id;
        o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
        sel.appendChild(o);
      });
    });

    document.getElementById('filter-batch').addEventListener('change', async () => {
      const batchId = document.getElementById('filter-batch').value;
      await loadChecks(batchId);
    });
  }

  // ── Summary Tab ───────────────────────────────────────────────────────────

  async function loadSummary() {
    showSpinner(true);
    try {
      const res = await Api.get('getQualitySummary');
      const rows = res.success ? res.data : [];
      renderSummaryCards(rows);
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
        activeTab = 'checks';
        document.getElementById('filter-batch').value = r.batch_id;
        renderTabs();
        loadChecks(r.batch_id);
      });
      grid.appendChild(card);
    });
  }

  // ── Check Log Tab ─────────────────────────────────────────────────────────

  async function loadChecks(batchId) {
    showSpinner(true);
    try {
      const params = {};
      if (batchId) params.batch_id = batchId;
      const res = await Api.get('getQualityChecks', params);
      const rows = res.success ? res.data : [];
      checkCache = rows;
      renderChecksTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function renderChecksTable(rows) {
    const tbody = document.getElementById('checks-tbody');
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
      tr.addEventListener('click', () => openCheckDetail(r.check_id));
      tbody.appendChild(tr);
    });
  }

  // ── Check Form ────────────────────────────────────────────────────────────

  function openCheckForm() {
    editingCheckId = null;
    selectedParam = null;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-check-date').value = today;
    document.getElementById('field-inspector').value = session.name || '';
    document.getElementById('field-actual').value = '';
    document.getElementById('field-remarks').value = '';
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';
    document.getElementById('field-spec-min').readOnly = false;
    document.getElementById('field-spec-max').readOnly = false;
    renderParamButtons([]);

    const batchSel = document.getElementById('field-batch');
    const filterVal = document.getElementById('filter-batch').value;
    if (filterVal) {
      batchSel.value = filterVal;
      const batch = batchCache.find(b => String(b.batch_id) === String(filterVal));
      if (batch) loadQualityParamsForProduct(batch.product_id);
    }

    batchSel.onchange = async () => {
      const batch = batchCache.find(b => String(b.batch_id) === String(batchSel.value));
      await loadQualityParamsForProduct(batch ? batch.product_id : null);
    };

    document.getElementById('form-title').textContent = 'New Quality Check';
    slideFormIn();
  }

  async function loadQualityParamsForProduct(productId) {
    if (!productId) { renderParamButtons([]); return; }
    const res = await Api.get('getQualityParams', { product_id: productId });
    qualityParamCache = res.success ? res.data : [];
    renderParamButtons(qualityParamCache);
  }

  function renderParamButtons(params) {
    const container = document.getElementById('param-btn-group');
    container.innerHTML = '';
    selectedParam = null;
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';

    if (params.length === 0) {
      container.innerHTML = '<span style="font-size:0.85rem;color:var(--neutral-500);">Select a batch first, or add specs in Masters → Quality Specs.</span>';
      return;
    }
    params.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'param-btn';
      btn.textContent = p.Parameter + (p.Unit ? ' (' + p.Unit + ')' : '');
      btn.dataset.paramId = p.ParamID;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.param-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedParam = p;
        document.getElementById('field-spec-min').value = p.SpecMin;
        document.getElementById('field-spec-max').value = p.SpecMax;
        document.getElementById('field-spec-min').readOnly = true;
        document.getElementById('field-spec-max').readOnly = true;
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

    if (!batchId || actual === '') {
      showToast('Batch ID and Actual Value are required');
      return;
    }

    // Determine parameter + specs: from selectedParam if available, else from manual fields
    const parameter = selectedParam
      ? selectedParam.Parameter
      : (document.getElementById('param-btn-group').querySelector('.param-btn.active') ? '' : 'Manual');
    const specMin = selectedParam ? selectedParam.SpecMin : Number(document.getElementById('field-spec-min').value) || 0;
    const specMax = selectedParam ? selectedParam.SpecMax : Number(document.getElementById('field-spec-max').value) || 0;

    if (editingCheckId) {
      const fields = {
        check_date:   checkDate,
        inspector_id: inspector,
        actual_value: Number(actual),
        remarks
      };
      if (selectedParam) {
        fields.parameter = selectedParam.Parameter;
        fields.spec_min  = selectedParam.SpecMin;
        fields.spec_max  = selectedParam.SpecMax;
        const actualNum = Number(actual);
        fields.result = (actualNum >= selectedParam.SpecMin && actualNum <= selectedParam.SpecMax) ? 'OK' : 'NG';
      }
      showSpinner(true);
      try {
        const res = await Api.post('updateRecord', { sheet: 'QualityChecks', idCol: 'check_id', idVal: editingCheckId, userId: Auth.getUserId(), fields });
        if (res.success) {
          editingCheckId = null;
          slideFormOut();
          await loadSummary();
          await loadChecks(document.getElementById('filter-batch').value);
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
        userId:       Auth.getUserId()
      });
      if (res.success) {
        showToast('Check saved — ' + (res.check_id || ''));
        slideFormOut();
        await loadSummary();
        await loadChecks(document.getElementById('filter-batch').value);
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openCheckDetail(checkId) {
    const r = checkCache.find(c => String(c.check_id || c.CheckID || c.check_id) === String(checkId));
    if (!r) return;
    const fv = (v) => (v === undefined || v === null || v === '') ? '—' : String(v).slice(0, 30);
    const dateStr = (v) => v ? String(v).slice(0, 10) : '—';
    const result = r.result || r.Result || '—';
    const isOK = result === 'OK';
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>Check ID</span><strong>${fv(r.check_id)}</strong></div>
      <div class="detail-row"><span>Batch</span><strong>${fv(r.batch_id)}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${dateStr(r.check_date)}</strong></div>
      <div class="detail-row"><span>Inspector</span><strong>${fv(r.inspector_id)}</strong></div>
      <div class="detail-row"><span>Parameter</span><strong>${fv(r.parameter)}</strong></div>
      <div class="detail-row"><span>Spec Min</span><strong>${fv(r.spec_min)}</strong></div>
      <div class="detail-row"><span>Spec Max</span><strong>${fv(r.spec_max)}</strong></div>
      <div class="detail-row"><span>Actual Value</span><strong>${fv(r.actual_value)}</strong></div>
      <div class="detail-row"><span>Result</span><span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${result}</span></div>
      <div class="detail-row"><span>Remarks</span><strong>${fv(r.remarks)}</strong></div>
    `;
    const canEdit = ['director','qmr','supervisor'].includes(session.role);
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="Quality.editCheck('${checkId}')">Edit</button>
         <button class="btn-deactivate" onclick="Quality.deleteCheck('${checkId}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editCheck(checkId) {
    const r = checkCache.find(c => String(c.check_id) === String(checkId));
    if (!r) return;
    editingCheckId = checkId;
    slideDetailOut();
    document.getElementById('field-check-date').value = r.check_date || '';
    document.getElementById('field-batch').value = r.batch_id || '';
    document.getElementById('field-inspector').value = r.inspector_id || '';
    document.getElementById('field-actual').value = r.actual_value ?? '';
    document.getElementById('field-remarks').value = r.remarks || '';
    document.getElementById('field-spec-min').value = r.spec_min ?? '';
    document.getElementById('field-spec-max').value = r.spec_max ?? '';

    const batch = batchCache.find(b => String(b.batch_id) === String(r.batch_id));
    loadQualityParamsForProduct(batch ? batch.product_id : null).then(() => {
      document.querySelectorAll('.param-btn').forEach(btn => {
        if (btn.textContent.startsWith(r.parameter)) btn.click();
      });
    });

    document.getElementById('form-title').textContent = 'Edit Check';
    slideFormIn();
  }

  async function deleteCheck(checkId) {
    if (!confirm('Delete check ' + checkId + '?')) return;
    const res = await Api.post('deleteRecord', { sheet: 'QualityChecks', idCol: 'check_id', idVal: checkId, userId: Auth.getUserId() });
    if (res.success) {
      slideDetailOut();
      await loadChecks(document.getElementById('filter-batch').value);
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

  return { init, submitCheck, loadChecks, loadSummary, editCheck, deleteCheck };
})();
