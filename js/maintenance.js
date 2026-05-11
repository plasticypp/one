const Maintenance = (() => {

  let session = null;
  let activeTab = 'breakdowns';
  let equipDropdown = [];

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    setupTabs();
    await loadBreakdowns('all');
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', slideFormOut);
    document.getElementById('fab').addEventListener('click', openBreakdownForm);
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  function setupTabs() {
    document.querySelectorAll('.sub-tab').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
        document.getElementById('tab-breakdowns').classList.toggle('hidden', activeTab !== 'breakdowns');
        document.getElementById('tab-pm').classList.toggle('hidden', activeTab !== 'pm');
        document.getElementById('fab').classList.toggle('hidden', activeTab !== 'breakdowns');
        if (activeTab === 'pm') {
          await loadPMSchedule();
        }
      });
    });
  }

  // ── Breakdowns ────────────────────────────────────────────────────────────

  async function loadBreakdowns(status) {
    showSpinner(true);
    try {
      const params = { status: status || 'all' };
      const res = await Api.get('getBreakdownList', params);
      const records = res.success ? res.data : [];
      renderBreakdowns(records);
    } finally {
      showSpinner(false);
    }
  }

  function renderBreakdowns(records) {
    const tbody = document.getElementById('breakdown-tbody');
    tbody.innerHTML = '';
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="td-loading">No records</td></tr>';
      return;
    }
    records.forEach(r => {
      const isOpen = r.Status === 'Open';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.BreakdownID || ''}</td>
        <td>${r.ReportedAt || ''}</td>
        <td>${r.EquipID || ''}</td>
        <td>${r.BreakdownCode || ''}</td>
        <td>${r.Symptom || ''}</td>
        <td><span class="status-chip ${isOpen ? 'chip-open' : 'chip-closed'}">${r.Status}</span></td>
        <td>${isOpen ? `<button class="btn-resolve" onclick="Maintenance.resolveBreakdown('${r.BreakdownID}')">Resolve</button>` : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function openBreakdownForm() {
    if (equipDropdown.length === 0) {
      const res = await Api.get('getMasterDropdown', { entity: 'Equipment' });
      equipDropdown = res.success ? res.data : [];
    }

    const machineOpts = equipDropdown.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    const codeOpts = ['MECH','ELEC','PNEUM','HYD','OTHER'].map(c => `<option value="${c}">${c}</option>`).join('');

    document.getElementById('form-title').textContent = 'Log Breakdown';
    document.getElementById('form-body').innerHTML = `
      <div class="field-group">
        <label>Machine</label>
        <select data-key="machine_id"><option value="">— select —</option>${machineOpts}</select>
      </div>
      <div class="field-group">
        <label>Breakdown Code</label>
        <select data-key="breakdown_code">${codeOpts}</select>
      </div>
      <div class="field-group">
        <label>Description / Symptom</label>
        <textarea data-key="description" rows="3"></textarea>
      </div>
      <div class="field-group">
        <label>Reported By</label>
        <input type="text" data-key="reported_by" value="${session.username || ''}">
      </div>
    `;
    document.getElementById('form-actions').innerHTML = `
      <button class="btn-primary" id="submit-breakdown-btn">Save</button>
    `;
    document.getElementById('submit-breakdown-btn').addEventListener('click', submitBreakdown);
    slideFormIn();
  }

  async function submitBreakdown() {
    const data = {};
    document.querySelectorAll('#form-body [data-key]').forEach(el => {
      data[el.dataset.key] = el.value;
    });
    if (!data.machine_id) { showToast('Select a machine'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('saveBreakdown', data);
      if (res.success) {
        showToast('Breakdown logged');
        slideFormOut();
        const filter = document.getElementById('status-filter').value;
        await loadBreakdowns(filter);
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  async function resolveBreakdown(id) {
    const resolution = prompt('Enter resolution details:');
    if (resolution === null) return;
    if (!resolution.trim()) { showToast('Resolution text required'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('resolveBreakdown', { breakdown_id: id, resolution: resolution.trim() });
      if (res.success) {
        showToast('Breakdown resolved');
        const filter = document.getElementById('status-filter').value;
        await loadBreakdowns(filter);
      } else {
        showToast('Error: ' + (res.error || 'resolve failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── PM Schedule ───────────────────────────────────────────────────────────

  async function loadPMSchedule() {
    showSpinner(true);
    try {
      const res = await Api.get('getPMSchedule');
      const records = res.success ? res.data : [];
      renderPMSchedule(records);
    } finally {
      showSpinner(false);
    }
  }

  function renderPMSchedule(records) {
    const tbody = document.getElementById('pm-tbody');
    tbody.innerHTML = '';
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="td-loading">No records</td></tr>';
      return;
    }
    const today = new Date();
    const in7 = new Date(today); in7.setDate(today.getDate() + 7);
    records.forEach(r => {
      const nextDue = r.NextDue ? new Date(r.NextDue) : null;
      const isOverdue = r.overdue || (nextDue && nextDue < today);
      const isUpcoming = !isOverdue && nextDue && nextDue <= in7;
      const tr = document.createElement('tr');
      if (isOverdue) tr.classList.add('row-overdue');
      else if (isUpcoming) tr.classList.add('row-upcoming');
      tr.innerHTML = `
        <td>${r.PMID || ''}</td>
        <td>${r.EquipID || ''}</td>
        <td>${r.TaskType || ''}</td>
        <td>${r.Frequency || ''}</td>
        <td>${r.LastDone || ''}</td>
        <td>${r.NextDue || ''}</td>
        <td>${r.AssignedTo || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ── Slide Transitions ─────────────────────────────────────────────────────

  function slideFormIn() {
    document.getElementById('list-panel').classList.add('slide-out');
    document.getElementById('form-panel').classList.add('slide-in');
  }

  function slideFormOut() {
    document.getElementById('list-panel').classList.remove('slide-out');
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

  return { init, resolveBreakdown, _loadBreakdowns: loadBreakdowns };
})();
