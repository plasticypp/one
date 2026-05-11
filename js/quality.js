const Quality = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let batchCache = [];
  let productCache = [];
  let personnelCache = [];
  let checkCache = {};
  let activeTab = 'summary';
  let activeStage = null;
  let sheetRows = [];

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
    const [, pRes, oRes] = await Promise.all([
      loadBatches(),
      Api.get('getMasterDropdown', { entity: 'Products' }),
      Api.get('getOperatorList')
    ]);
    productCache = pRes.success ? pRes.data : [];
    personnelCache = oRes.success ? oRes.data : [];
    populateInspectorDropdown();
    if (activeTab === 'summary') await loadSummary();
    else await loadChecks('', activeStage);
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', slideFormOut);
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
          const batchId = document.getElementById('filter-batch-' + tab)?.value || '';
          await loadChecks(batchId, activeStage);
        }
      };
    });
    document.getElementById('tab-summary').classList.toggle('hidden', activeTab !== 'summary');
    ['iqc', 'ipc', 'oqc'].forEach(t => {
      document.getElementById('tab-' + t).classList.toggle('hidden', activeTab !== t);
    });
  }

  // ── Personnel Dropdown ────────────────────────────────────────────────────

  function populateInspectorDropdown() {
    const sel = document.getElementById('field-inspector');
    if (!sel) return;
    sel.innerHTML = '<option value="">— select inspector —</option>';
    personnelCache.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name + (p.role ? ' (' + p.role + ')' : '');
      sel.appendChild(o);
    });
    if (session && session.id) sel.value = session.id;
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
        o.textContent = b.batch_id + (b.product_id ? ' — ' + ((productCache.find(p => String(p.id) === String(b.product_id)) || {}).name || b.product_id) : '');
        sel.appendChild(o);
      });
      sel.addEventListener('change', async () => {
        await loadChecks(sel.value, STAGE_TABS[tabKey]);
      });
      const btn = document.getElementById('btn-new-check-' + tabKey);
      if (btn) btn.addEventListener('click', () => openCheckSheet(STAGE_TABS[tabKey]));
    });
    // form batch dropdown
    const formSel = document.getElementById('field-batch');
    if (formSel) {
      formSel.innerHTML = '<option value="">— select batch —</option>';
      batchCache.forEach(b => {
        const o = document.createElement('option');
        o.value = b.batch_id;
        o.textContent = b.batch_id + (b.product_id ? ' — ' + ((productCache.find(p => String(p.id) === String(b.product_id)) || {}).name || b.product_id) : '');
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
    if (!rows.length) {
      grid.innerHTML = '<p class="empty-msg">No quality data yet. Start by logging a check.</p>';
      return;
    }
    rows.forEach(r => {
      const rate  = r.pass_rate;
      const color = rate >= 95 ? '#2e7d32' : rate >= 80 ? '#f57f17' : '#c62828';
      const bg    = rate >= 95 ? '#f1f8f1' : rate >= 80 ? '#fffde7' : '#fff5f5';
      const card  = document.createElement('div');
      card.className = 'qc-card';
      card.style.borderColor = color;
      card.style.background  = bg;
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
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="td-loading">No records</td></tr>';
      return;
    }
    // Group by check_date + inspector to show as sessions
    const sessions = {};
    rows.forEach(r => {
      const key = (r.check_date || '').slice(0,10) + '|' + (r.batch_id || '') + '|' + (r.inspector_id || '');
      if (!sessions[key]) sessions[key] = { date: (r.check_date || '').slice(0,10), batch: r.batch_id, inspector: r.inspector_id, rows: [], ng: 0 };
      sessions[key].rows.push(r);
      if (r.result === 'NG') sessions[key].ng++;
    });
    Object.values(sessions).reverse().forEach(s => {
      const result = s.ng > 0 ? 'NG' : 'OK';
      const chip = `<span class="result-chip ${result === 'OK' ? 'chip-ok' : 'chip-ng'}">${result}</span>`;
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td style="font-weight:600">${s.date}</td>
        <td>${s.batch}</td>
        <td>${s.inspector || '—'}</td>
        <td>${s.rows.length} params</td>
        <td>${s.ng > 0 ? `<span style="color:#c62828">${s.ng} NG</span>` : '—'}</td>
        <td>${chip}</td>
      `;
      tr.addEventListener('click', () => openSessionDetail(s, stage));
      tbody.appendChild(tr);
    });
  }

  // ── Check Sheet Form ──────────────────────────────────────────────────────

  async function openCheckSheet(stage) {
    activeStage = stage;
    sheetRows = [];
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-check-date').value = today;
    if (session.id) document.getElementById('field-inspector').value = session.id;
    document.getElementById('form-title').textContent = 'New ' + stage + ' Check Sheet';

    const tabKey = stage.toLowerCase();
    const batchSel = document.getElementById('field-batch');
    const filterVal = document.getElementById('filter-batch-' + tabKey)?.value || '';
    if (filterVal) batchSel.value = filterVal;

    batchSel.onchange = async () => {
      const batch = batchCache.find(b => String(b.batch_id) === String(batchSel.value));
      await loadParamSheet(stage, batch ? batch.product_id : null);
    };

    const errBatch = document.getElementById('err-batch');
    if (errBatch) errBatch.textContent = '';

    if (filterVal) {
      const batch = batchCache.find(b => String(b.batch_id) === String(filterVal));
      await loadParamSheet(stage, batch ? batch.product_id : null);
    } else {
      renderParamSheet([]);
    }
    slideFormIn();
  }

  async function loadParamSheet(stage, productId) {
    if (!productId) { renderParamSheet([]); return; }
    showSpinner(true);
    try {
      // Try QualityParams master first, fall back to INSPECTION_PLANS
      const [masterRes, planRes] = await Promise.all([
        Api.get('getQualityParams', { product_id: productId, stage }),
        Api.get('getInspectionParams', { stage, product_id: productId })
      ]);
      const masterParams = masterRes.success ? masterRes.data : [];
      const planParams   = planRes.success   ? planRes.data   : [];
      // Merge: master params take priority, fill remaining from INSPECTION_PLANS
      const masterParamNames = masterParams.map(p => p.parameter);
      const combined = [
        ...masterParams,
        ...planParams.filter(p => !masterParamNames.includes(p.parameter))
      ];
      renderParamSheet(combined);
    } finally {
      showSpinner(false);
    }
  }

  function renderParamSheet(params) {
    const container = document.getElementById('param-sheet-body');
    if (!params.length) {
      container.innerHTML = `
        <div style="padding:var(--space-4);text-align:center;color:var(--color-text-muted);font-size:0.9rem;">
          Select a batch to load parameters.<br>
          <a href="masters.html" style="color:var(--color-primary);font-weight:600;">+ Add params in Masters → Quality Params</a>
        </div>`;
      sheetRows = [];
      return;
    }
    sheetRows = params.map(p => ({ ...p, actual_value: '', remarks: '' }));
    container.innerHTML = '';
    params.forEach((p, i) => {
      const isVisual = !p.spec_min && !p.spec_max;
      const row = document.createElement('div');
      row.className = 'check-sheet-row';
      row.innerHTML = `
        <div class="check-sheet-param">
          <span class="check-sheet-param-name">${p.parameter}</span>
          <span class="check-sheet-param-unit">${p.unit || ''}</span>
          ${p.spec_min != null || p.spec_max != null
            ? `<span class="check-sheet-spec">${p.spec_min ?? '—'} – ${p.spec_max ?? '—'}</span>`
            : '<span class="check-sheet-spec check-sheet-spec--visual">Visual / Pass-Fail</span>'}
          ${p.sample_size ? `<span class="check-sheet-sample">${p.sample_size}</span>` : ''}
        </div>
        <div class="check-sheet-inputs">
          ${isVisual
            ? `<select class="check-sheet-actual" data-idx="${i}" data-visual="1">
                <option value="">—</option>
                <option value="OK">OK / Pass</option>
                <option value="NG">NG / Fail</option>
               </select>`
            : `<input type="number" class="check-sheet-actual" data-idx="${i}" placeholder="Actual" step="any">`}
          <input type="text" class="check-sheet-remarks" data-idx="${i}" placeholder="Remarks">
          <span class="check-sheet-result" id="result-${i}"></span>
        </div>
      `;
      container.appendChild(row);
    });

    // Wire live result calc
    container.querySelectorAll('.check-sheet-actual').forEach(input => {
      input.addEventListener('input', () => updateRowResult(input));
      input.addEventListener('change', () => updateRowResult(input));
    });
    container.querySelectorAll('.check-sheet-remarks').forEach(input => {
      input.addEventListener('input', () => {
        const i = parseInt(input.dataset.idx);
        if (sheetRows[i]) sheetRows[i].remarks = input.value;
      });
    });
  }

  function updateRowResult(input) {
    const i = parseInt(input.dataset.idx);
    if (!sheetRows[i]) return;
    const isVisual = input.dataset.visual === '1';
    if (isVisual) {
      sheetRows[i].actual_value = input.value;
      sheetRows[i].result = input.value || '';
    } else {
      const val = input.value;
      sheetRows[i].actual_value = val;
      const p = sheetRows[i];
      if (val === '') {
        sheetRows[i].result = '';
      } else {
        const a = parseFloat(val);
        const sMin = p.spec_min;
        const sMax = p.spec_max;
        sheetRows[i].result = (sMin == null && sMax == null) ? 'OK'
          : (a >= (sMin ?? -Infinity) && a <= (sMax ?? Infinity)) ? 'OK' : 'NG';
      }
    }
    const chip = document.getElementById('result-' + i);
    if (chip) {
      const r = sheetRows[i].result;
      chip.textContent = r;
      chip.className = 'check-sheet-result' + (r === 'OK' ? ' chip-ok' : r === 'NG' ? ' chip-ng' : '');
    }
  }

  async function submitCheckSheet() {
    const batchId   = document.getElementById('field-batch').value.trim();
    const inspector = document.getElementById('field-inspector').value.trim();
    const checkDate = document.getElementById('field-check-date').value;

    const eBatch = document.getElementById('err-batch');
    if (eBatch) eBatch.textContent = '';
    if (!batchId) { if (eBatch) eBatch.textContent = 'Select a batch'; return; }
    if (!sheetRows.length) { showToast('No parameters loaded — add params in Masters → Quality Params'); return; }

    const filledRows = sheetRows.filter(r => r.actual_value !== '' && r.actual_value !== null);
    if (!filledRows.length) { showToast('Enter at least one actual value'); return; }

    const batch = batchCache.find(b => String(b.batch_id) === String(batchId));
    showSpinner(true);
    try {
      const res = await Api.post('saveQualityCheckSheet', {
        batch_id:    batchId,
        product_id:  batch ? batch.product_id : '',
        stage:       activeStage || 'IPC',
        check_date:  checkDate,
        inspector_id: inspector,
        rows:        filledRows.map(r => ({
          parameter:   r.parameter,
          spec_min:    r.spec_min,
          spec_max:    r.spec_max,
          actual_value: r.actual_value,
          result:      r.result,
          remarks:     r.remarks
        })),
        userId: Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        await loadSummary();
        const tabKey = (activeStage || 'IPC').toLowerCase();
        await loadChecks(document.getElementById('filter-batch-' + tabKey)?.value || '', activeStage || 'IPC');
        if (res.overall_result === 'NG') {
          const batchParam = encodeURIComponent(batchId);
          showToastWithLink('Check sheet saved — NG result.', 'Log NCR →',
            'ncr.html?batch=' + batchParam + '&stage=' + (activeStage || 'IPC'));
        } else {
          showToast('Check sheet saved — All OK');
        }
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Session Detail Panel ──────────────────────────────────────────────────

  function openSessionDetail(s, stage) {
    const result = s.ng > 0 ? 'NG' : 'OK';
    const isOK = result === 'OK';
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>Date</span><strong>${s.date}</strong></div>
      <div class="detail-row"><span>Batch</span><strong>${s.batch}</strong></div>
      <div class="detail-row"><span>Stage</span><strong>${stage}</strong></div>
      <div class="detail-row"><span>Inspector</span><strong>${s.inspector || '—'}</strong></div>
      <div class="detail-row"><span>Overall Result</span><span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${result}</span></div>
      <div style="margin-top:var(--space-4);">
        <table class="checks-table" style="font-size:0.85rem;">
          <thead><tr><th>Parameter</th><th>Min</th><th>Max</th><th>Actual</th><th>Result</th><th>Remarks</th></tr></thead>
          <tbody>
            ${s.rows.map(r => `
              <tr>
                <td>${r.parameter || ''}</td>
                <td>${r.spec_min ?? '—'}</td>
                <td>${r.spec_max ?? '—'}</td>
                <td><strong>${r.actual_value ?? '—'}</strong></td>
                <td><span class="result-chip ${r.result === 'OK' ? 'chip-ok' : 'chip-ng'}">${r.result || '—'}</span></td>
                <td>${r.remarks || ''}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('detail-actions').innerHTML = s.ng > 0
      ? `<a class="btn btn-primary" href="ncr.html?batch=${encodeURIComponent(s.batch)}&stage=${stage}">Log NCR for NG →</a>`
      : '';
    slideDetailIn();
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

  return { init, submitCheckSheet };
})();
