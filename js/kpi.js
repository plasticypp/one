const KPI = (() => {

  let session = null;
  let kpisKB  = [];
  let logCache = [];

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    document.getElementById('back-to-app').addEventListener('click', () => window.location.href = 'app.html');
    document.getElementById('lang-toggle').textContent = (session.lang || 'en').toUpperCase();
    document.getElementById('lang-toggle').addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      document.getElementById('lang-toggle').textContent = next.toUpperCase();
    });
    document.getElementById('log-kpi-btn').addEventListener('click', openLogForm);
    document.getElementById('kpi-form-back').addEventListener('click', closeLogForm);
    document.getElementById('kpi-submit-btn').addEventListener('click', submitKPILog);
    document.getElementById('kpi-filter').addEventListener('change', e => renderLog(logCache, e.target.value));

    showSpinner(true);
    try {
      const [statsRes, kbRes, logRes] = await Promise.all([
        Api.get('getDashboardStats'),
        Api.get('getKPIsKB'),
        Api.get('getKPILog', {})
      ]);
      if (statsRes && statsRes.success) renderStats(statsRes.data);
      kpisKB = kbRes && kbRes.success ? kbRes.data : [];
      logCache = logRes && logRes.success ? logRes.data : [];
      renderLog(logCache, 'all');
      populateKPISelect();
    } finally {
      showSpinner(false);
    }
  }

  // ── Stats Grid ────────────────────────────────────────────────────────────

  function renderStats(d) {
    const items = [
      { label: 'Active Batches',     value: d.activeBatches,      mod: 'neutral' },
      { label: 'Open Breakdowns',    value: d.openBreakdowns,     mod: d.openBreakdowns    > 0 ? 'error'  : 'ok' },
      { label: 'Open CAPAs',         value: d.openCapas,          mod: d.openCapas         > 0 ? 'warn'   : 'ok' },
      { label: 'Overdue Compliance', value: d.overdueCompliance,  mod: d.overdueCompliance > 0 ? 'error'  : 'ok' },
      { label: 'Low Stock Items',    value: d.lowStockCount,      mod: d.lowStockCount     > 0 ? 'warn'   : 'ok' },
      { label: 'Overdue PMs',        value: d.overduePMs,         mod: d.overduePMs        > 0 ? 'warn'   : 'ok' },
      { label: 'Open Complaints',    value: d.openComplaints,     mod: d.openComplaints    > 0 ? 'error'  : 'ok' }
    ];
    document.getElementById('stat-grid').innerHTML = items.map(i => `
      <div class="stat-card stat-card--${i.mod}">
        <div class="stat-card-value">${i.value ?? '—'}</div>
        <div class="stat-card-label">${i.label}</div>
      </div>`).join('');
  }

  // ── KPI Log Table ─────────────────────────────────────────────────────────

  function renderLog(records, filter) {
    const data = filter && filter !== 'all'
      ? records.filter(r => r.KPICode === filter)
      : records;
    const tbody = document.getElementById('kpi-log-tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="td-loading">No entries yet</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => {
      const def = kpisKB.find(k => k.id === r.KPICode) || {};
      return `<tr>
        <td>${String(r.LogDate || '').slice(0, 10)}</td>
        <td>${r.KPIName || def.name || r.KPICode || '—'}</td>
        <td style="font-weight:600;">${r.Value ?? '—'} ${r.Unit || ''}</td>
        <td>${r.Target || def.target_label || '—'}</td>
        <td>${r.Period || '—'}</td>
        <td>${r.RecordedBy || '—'}</td>
      </tr>`;
    }).join('');
  }

  // ── Log Entry Form ────────────────────────────────────────────────────────

  function populateKPISelect() {
    const sel = document.getElementById('kf-kpi-code');
    sel.innerHTML = '<option value="">— select KPI —</option>' +
      kpisKB.map(k => `<option value="${k.id}">${k.name} (${k.category})</option>`).join('');
  }

  function openLogForm() {
    document.getElementById('kpi-form-panel').classList.add('slide-in');
    document.getElementById('kpi-list-panel').classList.add('slide-out');
    const today = new Date().toISOString().slice(0, 7);
    document.getElementById('kf-period').value = today;
    document.getElementById('kf-value').value = '';
    document.getElementById('kf-kpi-code').value = '';
  }

  function closeLogForm() {
    document.getElementById('kpi-form-panel').classList.remove('slide-in');
    document.getElementById('kpi-list-panel').classList.remove('slide-out');
  }

  async function submitKPILog() {
    const kpi_code = document.getElementById('kf-kpi-code').value;
    const value    = document.getElementById('kf-value').value;
    const period   = document.getElementById('kf-period').value;
    if (!kpi_code) { showToast('Select a KPI'); return; }
    if (!value)    { showToast('Enter a value'); return; }
    if (!period)   { showToast('Enter period'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('saveKPILog', { kpi_code, value, period, userId: Auth.getUserId() });
      if (res && res.success) {
        showToast('KPI logged');
        closeLogForm();
        const logRes = await Api.get('getKPILog', {});
        logCache = logRes && logRes.success ? logRes.data : logCache;
        const filter = document.getElementById('kpi-filter').value;
        renderLog(logCache, filter);
      } else {
        showToast('Error: ' + (res && res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
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

  return { init };
})();
