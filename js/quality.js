const Quality = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let batchCache = [];
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
    document.getElementById('form-back').addEventListener('click', slideFormOut);
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
      grid.innerHTML = '<p style="color:#757575;padding:16px;">No quality data</p>';
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
      renderChecksTable(rows);
    } finally {
      showSpinner(false);
    }
  }

  function renderChecksTable(rows) {
    const tbody = document.getElementById('checks-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#757575;padding:24px;">No records</td></tr>';
      return;
    }

    rows.forEach(r => {
      const isOK = r.result === 'OK';
      const chip = `<span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${r.result}</span>`;
      const tr = document.createElement('tr');
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
      tbody.appendChild(tr);
    });
  }

  // ── Check Form ────────────────────────────────────────────────────────────

  function openCheckForm() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-check-date').value = today;
    document.getElementById('field-inspector').value = session.name || '';
    document.getElementById('field-parameter').value = 'Wall Thickness';
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';
    document.getElementById('field-actual').value = '';
    document.getElementById('field-remarks').value = '';
    const batchSel = document.getElementById('field-batch');
    const filterVal = document.getElementById('filter-batch').value;
    if (filterVal) batchSel.value = filterVal;
    document.getElementById('form-title').textContent = 'New Quality Check';
    slideFormIn();
  }

  async function submitCheck() {
    const batchId    = document.getElementById('field-batch').value.trim();
    const inspector  = document.getElementById('field-inspector').value.trim();
    const parameter  = document.getElementById('field-parameter').value;
    const specMin    = document.getElementById('field-spec-min').value;
    const specMax    = document.getElementById('field-spec-max').value;
    const actual     = document.getElementById('field-actual').value;
    const remarks    = document.getElementById('field-remarks').value.trim();
    const checkDate  = document.getElementById('field-check-date').value;

    if (!batchId || !parameter || actual === '') {
      showToast('Batch ID, Parameter and Actual Value are required');
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveQualityCheck', {
        batch_id:    batchId,
        check_date:  checkDate,
        inspector_id: inspector,
        parameter,
        spec_min:    Number(specMin) || 0,
        spec_max:    Number(specMax) || 0,
        actual_value: Number(actual),
        remarks
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

  return { init, submitCheck, loadChecks, loadSummary };
})();
