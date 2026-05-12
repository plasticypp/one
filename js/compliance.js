const Compliance = (() => {

  let session = null;
  let capaStatusFilter = 'all';
  let capaCache = [];
  let editingLegalId = null;
  let editingCapaId = null;

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
    document.getElementById('legal-form-back').addEventListener('click', closeLegalForm);
    document.getElementById('capa-detail-back').addEventListener('click', closeCapaDetail);
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });

    // Show/hide New Regulation button based on role
    const newLegalBtn = document.getElementById('btn-new-legal');
    if (newLegalBtn) {
      newLegalBtn.classList.toggle('hidden', !['director','qmr'].includes(session.role));
    }
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
    UI.showSpinner(true);
    try {
      const res = await Api.get('getLegalRegister');
      const data = res.success ? res.data : [];
      renderLegalTable(data);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderLegalTable(data) {
    const container = document.getElementById('legal-table-wrap');
    if (data.length === 0) {
      container.innerHTML = '<div class="empty-msg">No records</div>';
      return;
    }
    const rows = data.map(r => {
      const chipClass = r.overdue ? 'chip-red' : (r.status === 'Due Soon' || r.ComplianceStatus === 'Due Soon' ? 'chip-yellow' : 'chip-green');
      const statusText = r.overdue ? 'Overdue' : (r.status || r.ComplianceStatus || '—');
      const act = r.Act || r.regulation || '—';
      const applicability = r.Applicability || r.applicability || '—';
      const due = (r.due_date || r.NextReview) ? String(r.due_date || r.NextReview).slice(0, 10) : '—';
      const reviewed = (r.LastReview || r.last_reviewed) ? String(r.LastReview || r.last_reviewed).slice(0, 10) : '—';
      const id = r.LegalID || r.reg_id || '—';
      return `<tr style="cursor:pointer" data-id="${id}">
        <td>${id}</td>
        <td>${act}</td>
        <td>${applicability}</td>
        <td>${due}</td>
        <td><span class="chip ${chipClass}">${statusText}</span></td>
        <td>${reviewed}</td>
      </tr>`;
    }).join('');
    container.innerHTML = `
      <table class="comp-table">
        <thead><tr>
          <th>ID</th><th>Act / Regulation</th><th>Applicability</th>
          <th>Next Review</th><th>Status</th><th>Last Reviewed</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── Legal Register Form ───────────────────────────────────────────────────

  function openLegalForm(legalId) {
    editingLegalId = legalId || null;
    document.getElementById('lf-act').value = '';
    document.getElementById('lf-req').value = '';
    document.getElementById('lf-applicability').value = '';
    document.getElementById('lf-status').value = 'Pending';
    document.getElementById('lf-last-review').value = '';
    document.getElementById('lf-next-review').value = '';
    document.getElementById('lf-remarks').value = '';
    document.getElementById('legal-form-title').textContent = legalId ? 'Edit Legal Entry' : 'New Legal Entry';
    document.getElementById('legal-form-panel').classList.add('slide-in');
    document.getElementById('panel-legal').classList.add('slide-out');
  }

  function closeLegalForm() {
    document.getElementById('legal-form-panel').classList.remove('slide-in');
    document.getElementById('panel-legal').classList.remove('slide-out');
    editingLegalId = null;
  }

  async function submitLegalEntry() {
    const act = document.getElementById('lf-act').value.trim();
    const nextReview = document.getElementById('lf-next-review').value;
    if (!act) { UI.showToast('Act / Regulation is required'); return; }
    if (!nextReview) { UI.showToast('Next Review Date is required'); return; }
    const data = {
      LegalID:          editingLegalId || undefined,
      Act:              act,
      Requirement:      document.getElementById('lf-req').value.trim(),
      Applicability:    document.getElementById('lf-applicability').value.trim(),
      ComplianceStatus: document.getElementById('lf-status').value,
      LastReview:       document.getElementById('lf-last-review').value,
      NextReview:       nextReview,
      Remarks:          document.getElementById('lf-remarks').value.trim()
    };
    if (!data.LegalID) delete data.LegalID;
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveLegalEntry', { ...data, userId: Auth.getUserId() });
      if (res.success) {
        UI.showToast('Saved');
        closeLegalForm();
        await loadLegalRegister();
      } else {
        UI.showToast('Save failed: ' + res.error);
      }
    } finally { UI.showSpinner(false); }
  }

  // ── CAPA Log ──────────────────────────────────────────────────────────────

  async function loadCapaList(status) {
    capaStatusFilter = status;
    document.querySelectorAll('.capa-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === status);
    });
    UI.showSpinner(true);
    try {
      const params = status && status !== 'all' ? { status } : {};
      const res = await Api.get('getCapaList', params);
      const data = res.success ? res.data : [];
      capaCache = data;
      renderCapaTable(data);
    } finally {
      UI.showSpinner(false);
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
      const source = r.Source || r.source || '—';
      const status = r.Status || r.status || '—';
      const id     = r.CAPAID || r.capa_id || '—';
      const date   = r.CAPADate || r.date || '—';
      const desc   = r.ProblemDesc || r.description || '—';
      const target = r.TargetDate || r.target_date || '—';
      const sourceClass = source === 'Customer Complaint' ? 'chip-red'
        : source === 'Internal Audit' ? 'chip-yellow' : 'chip-blue';
      const statusClass = status === 'Open' ? 'chip-yellow' : 'chip-green';
      const closeBtn = (canClose && status === 'Open')
        ? `<button class="btn-close-capa" data-id="${id}">Close</button>` : '';
      return `<tr style="cursor:pointer" data-id="${id}">
        <td>${id}</td>
        <td>${String(date).slice(0, 10)}</td>
        <td><span class="chip ${sourceClass}">${source}</span></td>
        <td class="desc-cell">${desc}</td>
        <td>${String(target).slice(0, 10)}</td>
        <td><span class="chip ${statusClass}">${status}</span></td>
        <td>${closeBtn}</td>
        <td><div class="row-actions"><button class="btn-icon btn-icon-edit" onclick="Compliance.editCapa('${id}')" title="Edit">✏</button><button class="btn-icon btn-icon-delete" onclick="Compliance.deleteCapa('${id}')" title="Delete">🗑</button></div></td>
      </tr>`;
    }).join('');
    container.innerHTML = `
      <table class="comp-table">
        <thead><tr>
          <th>CAPA ID</th><th>Date</th><th>Source</th><th>Description</th>
          <th>Target Date</th><th>Status</th><th></th><th>Actions</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

    container.querySelectorAll('.btn-close-capa').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); closeCapaItem(btn.dataset.id); });
    });

    container.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        openCapaDetail(tr.dataset.id);
      });
    });
  }

  // ── CAPA Detail ───────────────────────────────────────────────────────────

  function openCapaDetail(capaId) {
    const r = capaCache.find(c => String(c.CAPAID || c.capa_id) === String(capaId));
    if (!r) return;
    const id     = r.CAPAID || r.capa_id;
    const status = r.Status || r.status || '—';
    document.getElementById('capa-detail-body').innerHTML = `
      <div class="detail-row"><span>CAPA ID</span><strong>${id}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${(r.CAPADate || r.date || '—').toString().slice(0,10)}</strong></div>
      <div class="detail-row"><span>Source</span><strong>${r.Source || r.source || '—'}</strong></div>
      <div class="detail-row"><span>NCR Ref</span><strong>${r.NCRRef || '—'}</strong></div>
      <div class="detail-row"><span>Description</span><strong>${r.ProblemDesc || r.description || '—'}</strong></div>
      <div class="detail-row"><span>Root Cause</span><strong>${r.RootCause || r.root_cause || '—'}</strong></div>
      <div class="detail-row"><span>Corrective Action</span><strong>${r.CorrectiveAction || r.action || '—'}</strong></div>
      <div class="detail-row"><span>Preventive Action</span><strong>${r.PreventiveAction || '—'}</strong></div>
      <div class="detail-row"><span>Responsible</span><strong>${r.ResponsibleID || '—'}</strong></div>
      <div class="detail-row"><span>Target Date</span><strong>${(r.TargetDate || r.target_date || '—').toString().slice(0,10)}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${status}</strong></div>
      <div class="detail-row"><span>Closed Date</span><strong>${(r.ClosedDate || '—').toString().slice(0,10)}</strong></div>
      <div class="detail-row"><span>Effectiveness</span><strong>${r.Effectiveness || '—'}</strong></div>
    `;
    const canClose = ['director','qmr'].includes(session.role) && status === 'Open';
    document.getElementById('capa-detail-actions').innerHTML = canClose
      ? `<button class="btn-primary" onclick="Compliance.closeCapaItemFromDetail('${id}')">Close CAPA</button>`
      : '';
    document.getElementById('capa-detail-panel').classList.add('slide-in');
    document.getElementById('panel-capa').classList.add('slide-out');
  }

  function closeCapaDetail() {
    document.getElementById('capa-detail-panel').classList.remove('slide-in');
    document.getElementById('panel-capa').classList.remove('slide-out');
  }

  async function closeCapaItemFromDetail(id) {
    const effectiveness = prompt('Effectiveness notes (optional):');
    if (effectiveness === null) return;
    UI.showSpinner(true);
    try {
      const res = await Api.post('updateCapaStatus', { capa_id: id, status: 'Closed', effectiveness, userId: Auth.getUserId() });
      if (res.success) {
        UI.showToast('CAPA closed');
        closeCapaDetail();
        await loadCapaList(capaStatusFilter);
      } else {
        UI.showToast('Update failed');
      }
    } finally { UI.showSpinner(false); }
  }

  // ── CAPA Form ─────────────────────────────────────────────────────────────

  async function openCapaForm() {
    editingCapaId = null;
    document.getElementById('capa-form-source').value = '';
    document.getElementById('capa-form-description').value = '';
    document.getElementById('capa-form-root-cause').value = '';
    document.getElementById('capa-form-action').value = '';
    document.getElementById('capa-form-corrective-action') && (document.getElementById('capa-form-corrective-action').value = '');
    document.getElementById('capa-form-preventive-action') && (document.getElementById('capa-form-preventive-action').value = '');
    document.getElementById('capa-form-ncr-ref') && (document.getElementById('capa-form-ncr-ref').value = '');
    document.getElementById('capa-form-target-date').value = '';
    // Populate responsible dropdown from Personnel
    const rSel = document.getElementById('capa-form-responsible');
    if (rSel && rSel.tagName === 'SELECT') {
      try {
        const pRes = await Api.get('getPersonnelList');
        const people = pRes && pRes.success ? pRes.data : [];
        rSel.innerHTML = '<option value="">— select responsible person —</option>' +
          people.map(p => `<option value="${p.id}">${p.name} (${p.role || p.id})</option>`).join('');
      } catch(e) { rSel.innerHTML = '<option value="">— could not load —</option>'; }
    }
    const titleEl = document.getElementById('capa-form-title') || document.querySelector('#capa-form-panel h2');
    if (titleEl) titleEl.textContent = 'New CAPA';
    document.getElementById('capa-form-panel').classList.add('slide-in');
    document.getElementById('panel-capa').classList.add('slide-out');
  }

  function closeCapaForm() {
    editingCapaId = null;
    const titleEl = document.getElementById('capa-form-title') || document.querySelector('#capa-form-panel h2');
    if (titleEl) titleEl.textContent = 'New CAPA';
    document.getElementById('capa-form-panel').classList.remove('slide-in');
    document.getElementById('panel-capa').classList.remove('slide-out');
  }

  function editCapa(capaId) {
    const capa = capaCache.find(c => String(c.CAPAID || c.capa_id) === String(capaId));
    if (!capa) return;
    editingCapaId = capaId;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('capa-form-source',      capa.Source      || capa.source      || '');
    setVal('capa-form-description', capa.ProblemDesc || capa.description || '');
    setVal('capa-form-root-cause',  capa.RootCause   || capa.root_cause  || '');
    setVal('capa-form-action',      capa.CorrectiveAction || capa.action || '');
    setVal('capa-form-corrective-action', capa.CorrectiveAction || capa.action || '');
    setVal('capa-form-preventive-action', capa.PreventiveAction || '');
    setVal('capa-form-ncr-ref',     capa.NCRRef      || '');
    setVal('capa-form-responsible', capa.ResponsibleID || '');
    setVal('capa-form-target-date', (capa.TargetDate || capa.target_date || '').toString().slice(0, 10));
    const titleEl = document.getElementById('capa-form-title') || document.querySelector('#capa-form-panel h2');
    if (titleEl) titleEl.textContent = 'Edit CAPA';
    document.getElementById('capa-form-panel').classList.add('slide-in');
    document.getElementById('panel-capa').classList.add('slide-out');
  }

  function deleteCapa(capaId) {
    if (!confirm('Delete CAPA ' + capaId + '?')) return;
    Api.post('deleteRecord', { sheet: 'CAPA_Register', idCol: 'capa_id', idVal: capaId, userId: Auth.getUserId() })
      .then(res => {
        if (res && res.success) loadCapaList(capaStatusFilter);
        else UI.showToast('Delete failed: ' + (res && res.error || 'error'), 'error');
      });
  }

  async function submitCapa() {
    const source = document.getElementById('capa-form-source').value;
    const description = document.getElementById('capa-form-description').value;
    if (!source || !description) {
      UI.showToast('Source and Description are required');
      return;
    }
    if (editingCapaId) {
      UI.showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'CAPA_Register',
          idCol: 'capa_id',
          idVal: editingCapaId,
          userId: Auth.getUserId(),
          fields: {
            source,
            description,
            root_cause:        document.getElementById('capa-form-root-cause').value,
            corrective_action: (document.getElementById('capa-form-corrective-action') || {}).value || document.getElementById('capa-form-action').value,
            preventive_action: (document.getElementById('capa-form-preventive-action') || {}).value || '',
            ncr_ref:           (document.getElementById('capa-form-ncr-ref') || {}).value || '',
            responsible_id:    (document.getElementById('capa-form-responsible') || {}).value || '',
            target_date:       document.getElementById('capa-form-target-date').value
          }
        });
        if (res && res.success) {
          editingCapaId = null;
          closeCapaForm();
          await loadCapaList(capaStatusFilter);
        } else {
          UI.showToast('Update failed: ' + (res && res.error));
        }
      } finally { UI.showSpinner(false); }
      return;
    }
    const data = {
      source,
      description,
      root_cause:           document.getElementById('capa-form-root-cause').value,
      corrective_action:    (document.getElementById('capa-form-corrective-action') || {}).value || document.getElementById('capa-form-action').value,
      preventive_action:    (document.getElementById('capa-form-preventive-action') || {}).value || '',
      ncr_ref:              (document.getElementById('capa-form-ncr-ref') || {}).value || '',
      responsible_id:       (document.getElementById('capa-form-responsible') || {}).value || '',
      target_date:          document.getElementById('capa-form-target-date').value
    };
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveCapa', { ...data, userId: Auth.getUserId() });
      if (res.success) {
        if (res.responsible_warn) UI.showToast('CAPA saved — responsible person not in Personnel list');
        else UI.showToast('CAPA saved: ' + res.capa_id);
        closeCapaForm();
        await loadCapaList(capaStatusFilter);
      } else if (res.error && res.error.startsWith('invalid_responsible')) {
        UI.showToast('Selected person not found in Personnel. Please re-select.');
      } else {
        UI.showToast('Save failed: ' + (res && res.error));
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  async function closeCapaItem(id) {
    if (!confirm('Mark CAPA ' + id + ' as Closed?')) return;
    UI.showSpinner(true);
    try {
      const res = await Api.post('updateCapaStatus', { capa_id: id, status: 'Closed', userId: Auth.getUserId() });
      if (res.success) {
        UI.showToast('CAPA closed');
        await loadCapaList(capaStatusFilter);
      } else {
        UI.showToast('Update failed');
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  return { init, openCapaForm, closeCapaForm, submitCapa, loadCapa: loadCapaList, openLegalForm, closeLegalForm, submitLegalEntry, closeCapaItemFromDetail, editCapa, deleteCapa };
})();
