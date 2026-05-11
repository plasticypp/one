const Compliance = (() => {

  let session = null;
  let capaStatusFilter = 'all';

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    setupHeader();
    setupTabs();
    await switchTab('legal');
  }

  // ── Header ────────────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
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
    document.getElementById('tab-legal').addEventListener('click', () => switchTab('legal'));
    document.getElementById('tab-capa').addEventListener('click', () => switchTab('capa'));
  }

  async function switchTab(tab) {
    document.querySelectorAll('.sub-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('panel-legal').classList.toggle('hidden', tab !== 'legal');
    document.getElementById('panel-capa').classList.toggle('hidden', tab !== 'capa');
    if (tab === 'legal') {
      await loadLegalRegister();
    } else {
      await loadCapaList(capaStatusFilter);
    }
  }

  // ── Legal Register ────────────────────────────────────────────────────────

  async function loadLegalRegister() {
    showSpinner(true);
    try {
      const res = await Api.get('getLegalRegister');
      const data = res.success ? res.data : [];
      renderLegalTable(data);
    } finally {
      showSpinner(false);
    }
  }

  function renderLegalTable(data) {
    const container = document.getElementById('legal-table-wrap');
    if (data.length === 0) {
      container.innerHTML = '<div class="empty-msg">No records</div>';
      return;
    }
    const rows = data.map(r => {
      const chipClass = r.overdue ? 'chip-red' : (r.status === 'Due Soon' ? 'chip-yellow' : 'chip-green');
      const due = r.due_date ? String(r.due_date).slice(0, 10) : '—';
      const reviewed = r.last_reviewed ? String(r.last_reviewed).slice(0, 10) : '—';
      return `<tr>
        <td>${r.reg_id || '—'}</td>
        <td>${r.regulation || '—'}</td>
        <td>${r.applicability || '—'}</td>
        <td>${due}</td>
        <td><span class="chip ${chipClass}">${r.overdue ? 'Overdue' : (r.status || '—')}</span></td>
        <td>${reviewed}</td>
      </tr>`;
    }).join('');
    container.innerHTML = `
      <table class="comp-table">
        <thead><tr>
          <th>Reg ID</th><th>Regulation</th><th>Applicability</th>
          <th>Due Date</th><th>Status</th><th>Last Reviewed</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── CAPA Log ──────────────────────────────────────────────────────────────

  async function loadCapaList(status) {
    capaStatusFilter = status;
    document.querySelectorAll('.capa-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === status);
    });
    showSpinner(true);
    try {
      const params = status && status !== 'all' ? { status } : {};
      const res = await Api.get('getCapaList', params);
      const data = res.success ? res.data : [];
      renderCapaTable(data);
    } finally {
      showSpinner(false);
    }
  }

  function renderCapaTable(data) {
    const container = document.getElementById('capa-table-wrap');
    if (data.length === 0) {
      container.innerHTML = '<div class="empty-msg">No records</div>';
      return;
    }
    const canClose = ['director', 'qmr'].includes(session.role);
    const rows = data.map(r => {
      const sourceClass = r.source === 'Customer Complaint' ? 'chip-red'
        : r.source === 'Internal Audit' ? 'chip-yellow' : 'chip-blue';
      const statusClass = r.status === 'Open' ? 'chip-yellow' : 'chip-green';
      const target = r.target_date ? String(r.target_date).slice(0, 10) : '—';
      const closeBtn = (canClose && r.status === 'Open')
        ? `<button class="btn-close-capa" data-id="${r.capa_id}">Close</button>` : '';
      return `<tr>
        <td>${r.capa_id || '—'}</td>
        <td>${r.date ? String(r.date).slice(0, 10) : '—'}</td>
        <td><span class="chip ${sourceClass}">${r.source || '—'}</span></td>
        <td class="desc-cell">${r.description || '—'}</td>
        <td>${target}</td>
        <td><span class="chip ${statusClass}">${r.status || '—'}</span></td>
        <td>${closeBtn}</td>
      </tr>`;
    }).join('');
    container.innerHTML = `
      <table class="comp-table">
        <thead><tr>
          <th>CAPA ID</th><th>Date</th><th>Source</th><th>Description</th>
          <th>Target Date</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

    container.querySelectorAll('.btn-close-capa').forEach(btn => {
      btn.addEventListener('click', () => closeCapaItem(btn.dataset.id));
    });
  }

  // ── CAPA Form ─────────────────────────────────────────────────────────────

  function openCapaForm() {
    document.getElementById('capa-form-source').value = '';
    document.getElementById('capa-form-description').value = '';
    document.getElementById('capa-form-root-cause').value = '';
    document.getElementById('capa-form-action').value = '';
    document.getElementById('capa-form-target-date').value = '';
    document.getElementById('capa-form-panel').classList.add('slide-in');
    document.getElementById('panel-capa').classList.add('slide-out');
  }

  function closeCapaForm() {
    document.getElementById('capa-form-panel').classList.remove('slide-in');
    document.getElementById('panel-capa').classList.remove('slide-out');
  }

  async function submitCapa() {
    const data = {
      source:      document.getElementById('capa-form-source').value,
      description: document.getElementById('capa-form-description').value,
      root_cause:  document.getElementById('capa-form-root-cause').value,
      action:      document.getElementById('capa-form-action').value,
      target_date: document.getElementById('capa-form-target-date').value
    };
    if (!data.source || !data.description) {
      showToast('Source and Description are required');
      return;
    }
    showSpinner(true);
    try {
      const res = await Api.post('saveCapa', data);
      if (res.success) {
        showToast('CAPA saved: ' + res.capa_id);
        closeCapaForm();
        await loadCapaList(capaStatusFilter);
      } else {
        showToast('Save failed');
      }
    } finally {
      showSpinner(false);
    }
  }

  async function closeCapaItem(id) {
    if (!confirm('Mark CAPA ' + id + ' as Closed?')) return;
    showSpinner(true);
    try {
      const res = await Api.post('updateCapaStatus', { capa_id: id, status: 'Closed' });
      if (res.success) {
        showToast('CAPA closed');
        await loadCapaList(capaStatusFilter);
      } else {
        showToast('Update failed');
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

  return { init, openCapaForm, closeCapaForm, submitCapa, loadCapa: loadCapaList };
})();
