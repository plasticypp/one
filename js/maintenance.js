const Maintenance = (() => {

  let session = null;
  let activeTab = 'breakdowns';
  let equipDropdown = [];
  let bdCache = [];
  let pmCache = [];
  let resolvingBdId = null;
  let editingBreakdownId = null;
  let editingPMId = null;

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
    const resolveBack = document.getElementById('resolve-back');
    if (resolveBack) resolveBack.addEventListener('click', slideResolvePanelOut);
    const resolveBackBtn = document.getElementById('resolve-back-btn');
    if (resolveBackBtn) resolveBackBtn.addEventListener('click', slideResolvePanelOut);
    document.getElementById('detail-back').addEventListener('click', slideDetailOut);
    document.getElementById('fab').addEventListener('click', () => {
      if (activeTab === 'pm') openPMForm(); else openBreakdownForm();
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
          document.getElementById('fab').classList.remove('hidden');
          document.getElementById('fab').onclick = openPMForm;
        } else {
          document.getElementById('fab').onclick = openBreakdownForm;
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
      bdCache = records;
      renderBreakdowns(records);
    } finally {
      showSpinner(false);
    }
  }

  function renderBreakdowns(records) {
    const tbody = document.getElementById('breakdown-tbody');
    tbody.innerHTML = '';
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="td-loading">No records</td></tr>';
      return;
    }
    records.forEach(r => {
      const isOpen = r.Status === 'Open';
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.BreakdownID || ''}</td>
        <td>${r.ReportedAt || ''}</td>
        <td>${r.EquipID || ''}</td>
        <td>${r.BreakdownCode || ''}</td>
        <td>${r.Symptom || ''}</td>
        <td><span class="status-chip ${isOpen ? 'chip-open' : 'chip-closed'}">${r.Status}</span></td>
        <td>${isOpen ? `<button class="btn-resolve" onclick="event.stopPropagation();Maintenance.resolveBreakdown('${r.BreakdownID}')">Resolve</button>` : ''}</td>
        <td><div class="row-actions"><button class="btn-icon btn-icon-edit" onclick="event.stopPropagation();Maintenance.editBreakdown('${r.BreakdownID}')" title="Edit">✏</button><button class="btn-icon btn-icon-delete" onclick="event.stopPropagation();Maintenance.deleteBreakdown('${r.BreakdownID}')" title="Delete">🗑</button></div></td>
      `;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        openBdDetail(r.BreakdownID);
      });
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
    if (editingBreakdownId) {
      const data = {};
      document.querySelectorAll('#form-body [data-key]').forEach(el => {
        data[el.dataset.key] = el.value;
      });
      showSpinner(true);
      try {
        const res = await Api.post('updateRecord', {
          sheet: 'Breakdown_Log',
          idCol: 'breakdown_id',
          idVal: editingBreakdownId,
          userId: Auth.getUserId(),
          fields: {
            machine_id:     data.machine_id,
            breakdown_code: data.breakdown_code,
            description:    data.description,
            reported_by:    data.reported_by
          }
        });
        if (res && res.success) {
          showToast('Breakdown updated');
          editingBreakdownId = null;
          slideFormOut();
          const filter = document.getElementById('status-filter').value;
          await loadBreakdowns(filter);
        } else {
          showToast('Update failed: ' + (res && res.error || 'error'));
        }
      } finally {
        showSpinner(false);
      }
      return;
    }
    const data = {};
    document.querySelectorAll('#form-body [data-key]').forEach(el => {
      data[el.dataset.key] = el.value;
    });
    if (!data.machine_id) { showToast('Select a machine'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('saveBreakdown', { ...data, userId: Auth.getUserId() });
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

  async function editBreakdown(bdId) {
    const bd = bdCache.find(b => String(b.BreakdownID) === String(bdId));
    if (!bd) return;
    editingBreakdownId = bdId;
    await openBreakdownForm();
    document.getElementById('form-title').textContent = 'Edit Breakdown';
    const setKey = (key, val) => {
      const el = document.querySelector(`#form-body [data-key="${key}"]`);
      if (el) el.value = val || '';
    };
    setKey('machine_id', bd.EquipID);
    setKey('breakdown_code', bd.BreakdownCode);
    setKey('description', bd.Symptom);
    setKey('reported_by', bd.ReportedBy);
  }

  async function deleteBreakdown(bdId) {
    if (!confirm('Delete breakdown record ' + bdId + '?')) return;
    showSpinner(true);
    try {
      const res = await Api.post('deleteRecord', { sheet: 'Breakdown_Log', idCol: 'breakdown_id', idVal: bdId, userId: Auth.getUserId() });
      if (res && res.success) {
        showToast('Breakdown deleted');
        const filter = document.getElementById('status-filter').value;
        await loadBreakdowns(filter);
      } else {
        showToast('Delete failed: ' + (res && res.error || 'error'));
      }
    } finally {
      showSpinner(false);
    }
  }

  function resolveBreakdown(id) {
    const bd = bdCache.find(b => String(b.BreakdownID) === String(id));
    if (!bd) return;
    resolvingBdId = id;

    document.getElementById('resolve-bd-id').value = id;
    document.getElementById('resolve-bd-display').value = id;
    document.getElementById('resolve-equipment-display').value = bd.EquipID || '';
    document.getElementById('resolve-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('resolve-notes').value = '';
    document.getElementById('resolve-by').value = '';
    document.getElementById('resolve-spares').value = '';
    document.getElementById('resolve-downtime').value = '';

    slideResolvePanelIn();
  }

  async function submitResolve() {
    const notes = document.getElementById('resolve-notes').value.trim();
    const resolvedBy = document.getElementById('resolve-by').value.trim();
    const resolvedDate = document.getElementById('resolve-date').value;

    if (!notes) { showToast('Resolution notes are required'); return; }
    if (!resolvedBy) { showToast('Resolved by is required'); return; }
    if (!resolvedDate) { showToast('Resolved date is required'); return; }

    showSpinner(true);
    try {
      const res = await Api.post('resolveBreakdown', {
        breakdown_id:     resolvingBdId,
        resolution:       notes,
        root_cause:       (document.getElementById('resolve-root-cause') || {}).value || '',
        spare_used:       (document.getElementById('resolve-spares') || {}).value || '',
        resolved_by:      resolvedBy,
        fixed_date:       resolvedDate,
        downtime_min:     Number(document.getElementById('resolve-downtime').value) || 0,
        spare_used:       document.getElementById('resolve-spares').value.trim(),
        spares_used:      document.getElementById('resolve-spares').value.trim(),
        downtime_hrs:     document.getElementById('resolve-downtime').value || '0',
        userId:           Auth.getUserId()
      });
      if (res.success) {
        showToast('Breakdown resolved');
        resolvingBdId = null;
        slideResolvePanelOut();
        const filter = document.getElementById('status-filter').value;
        await loadBreakdowns(filter);
      } else {
        showToast('Error: ' + (res.error || 'resolve failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openBdDetail(bdId) {
    const r = bdCache.find(b => String(b.BreakdownID) === String(bdId));
    if (!r) return;
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>BD ID</span><strong>${r.BreakdownID}</strong></div>
      <div class="detail-row"><span>Equipment</span><strong>${r.EquipID || '—'}</strong></div>
      <div class="detail-row"><span>Reported At</span><strong>${r.ReportedAt || '—'}</strong></div>
      <div class="detail-row"><span>Reported By</span><strong>${r.ReportedBy || '—'}</strong></div>
      <div class="detail-row"><span>Symptom</span><strong>${r.Symptom || '—'}</strong></div>
      <div class="detail-row"><span>Code</span><strong>${r.BreakdownCode || '—'}</strong></div>
      <div class="detail-row"><span>Root Cause</span><strong>${r.RootCause || '—'}</strong></div>
      <div class="detail-row"><span>Action Taken</span><strong>${r.ActionTaken || '—'}</strong></div>
      <div class="detail-row"><span>Fixed At</span><strong>${r.FixedAt || '—'}</strong></div>
      <div class="detail-row"><span>Downtime (min)</span><strong>${r.Downtime_min || '—'}</strong></div>
      <div class="detail-row"><span>Spare Used</span><strong>${r.SpareUsed || '—'}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${r.Status}</strong></div>
    `;
    document.getElementById('detail-actions').innerHTML = '';
    slideDetailIn();
  }

  // ── PM Schedule ───────────────────────────────────────────────────────────

  async function loadPMSchedule() {
    showSpinner(true);
    try {
      const res = await Api.get('getPMSchedule');
      pmCache = res.success ? res.data : [];
      renderPMSchedule(pmCache);
    } finally {
      showSpinner(false);
    }
  }

  function renderPMSchedule(records) {
    const tbody = document.getElementById('pm-tbody');
    tbody.innerHTML = '';
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="td-loading">No records</td></tr>';
      return;
    }
    const today = new Date();
    const in7 = new Date(today); in7.setDate(today.getDate() + 7);
    records.forEach(r => {
      const nextDue = r.NextDue ? new Date(r.NextDue) : null;
      const isOverdue = r.overdue || (nextDue && nextDue < today);
      const isUpcoming = !isOverdue && nextDue && nextDue <= in7;
      const isDone = r.Status === 'Completed';
      const tr = document.createElement('tr');
      if (isOverdue) tr.classList.add('row-overdue');
      else if (isUpcoming) tr.classList.add('row-upcoming');
      const canEdit = ['director','supervisor'].includes(session.role);
      tr.innerHTML = `
        <td>${r.PMID || ''}</td>
        <td>${r.EquipID || ''}</td>
        <td>${r.TaskType || ''}</td>
        <td>${r.Frequency || ''}</td>
        <td>${r.LastDone || ''}</td>
        <td>${r.NextDue || ''}</td>
        <td>${r.AssignedTo || ''}</td>
        <td>
          ${!isDone ? `<button class="btn-sm" onclick="Maintenance.completePM('${r.PMID}')">Done</button>` : ''}
          ${canEdit ? `<button class="btn-sm" onclick="event.stopPropagation();Maintenance.editPM('${r.PMID}')" style="margin-left:4px;">✏</button>` : ''}
          ${canEdit ? `<button class="btn-sm btn-danger" onclick="event.stopPropagation();Maintenance.deletePM('${r.PMID}')" style="margin-left:2px;">✕</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function openPMForm(pmId) {
    editingPMId = pmId || null;
    if (equipDropdown.length === 0) {
      const res = await Api.get('getMachineList');
      equipDropdown = res.success ? res.data : [];
    }
    const existing = pmId ? pmCache.find(p => String(p.PMID) === String(pmId)) : null;
    const machineOpts = equipDropdown.map(e => `<option value="${e.id}" ${existing && existing.EquipID === e.id ? 'selected' : ''}>${e.name}</option>`).join('');
    document.getElementById('form-title').textContent = pmId ? 'Edit PM Task' : 'Add PM Task';
    document.getElementById('form-body').innerHTML = `
      <div class="field-group">
        <label>Machine / Equipment</label>
        <select data-key="equip_id"><option value="">— select —</option>${machineOpts}</select>
      </div>
      <div class="field-group">
        <label>Task Description</label>
        <input type="text" data-key="task_type" value="${existing ? existing.TaskType || '' : ''}" placeholder="e.g. Hydraulic oil check">
      </div>
      <div class="field-group">
        <label>Frequency (days)</label>
        <input type="number" data-key="frequency_days" value="${existing ? existing.Frequency || 7 : 7}" min="1">
      </div>
      <div class="field-group">
        <label>Last Done</label>
        <input type="date" data-key="last_done" value="${existing ? existing.LastDone || '' : ''}">
      </div>
      <div class="field-group">
        <label>Assigned To</label>
        <input type="text" data-key="assigned_to" value="${existing ? existing.AssignedTo || '' : ''}" placeholder="Technician name">
      </div>
      <div class="field-group">
        <label>Remarks</label>
        <input type="text" data-key="remarks" value="${existing ? existing.Remarks || '' : ''}" placeholder="Optional">
      </div>
    `;
    document.getElementById('form-actions').innerHTML = `
      <button class="btn-primary" id="submit-pm-btn">Save</button>
    `;
    document.getElementById('submit-pm-btn').addEventListener('click', submitPMTask);
    slideFormIn();
  }

  async function submitPMTask() {
    const data = {};
    document.querySelectorAll('#form-body [data-key]').forEach(el => { data[el.dataset.key] = el.value; });
    if (!data.equip_id) { showToast('Select a machine'); return; }
    if (!data.task_type) { showToast('Task description required'); return; }
    showSpinner(true);
    try {
      const payload = { ...data, userId: Auth.getUserId() };
      if (editingPMId) payload.pm_id = editingPMId;
      const res = await Api.post('savePMTask', payload);
      if (res.success) {
        showToast(editingPMId ? 'PM task updated' : 'PM task added');
        editingPMId = null;
        slideFormOut();
        await loadPMSchedule();
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally { showSpinner(false); }
  }

  function editPM(pmId) {
    openPMForm(pmId);
  }

  async function deletePM(pmId) {
    if (!confirm('Delete PM task ' + pmId + '?')) return;
    showSpinner(true);
    try {
      const res = await Api.post('deletePMTask', { pm_id: pmId, userId: Auth.getUserId() });
      if (res.success) { showToast('PM task deleted'); await loadPMSchedule(); }
      else showToast('Delete failed: ' + res.error);
    } finally { showSpinner(false); }
  }

  async function completePM(pmId) {
    if (!confirm('Mark PM ' + pmId + ' as complete?')) return;
    showSpinner(true);
    try {
      const res = await Api.post('completePM', { pm_id: pmId, remarks: '', userId: Auth.getUserId() });
      if (res.success) { showToast('PM marked complete'); await loadPMSchedule(); }
      else showToast('Error: ' + res.error);
    } finally { showSpinner(false); }
  }

  // ── Slide Transitions ─────────────────────────────────────────────────────

  function slideFormIn() {
    document.getElementById('list-panel').classList.add('slide-out');
    document.getElementById('form-panel').classList.add('slide-in');
  }

  function slideFormOut() {
    editingBreakdownId = null;
    editingPMId = null;
    const titleEl = document.getElementById('form-title');
    if (titleEl) titleEl.textContent = 'Log Breakdown';
    document.getElementById('list-panel').classList.remove('slide-out');
    document.getElementById('form-panel').classList.remove('slide-in');
  }

  function slideResolvePanelIn() {
    document.getElementById('list-panel').classList.add('slide-out');
    document.getElementById('resolve-panel').classList.add('slide-in');
  }

  function slideResolvePanelOut() {
    document.getElementById('list-panel').classList.remove('slide-out');
    document.getElementById('resolve-panel').classList.remove('slide-in');
    resolvingBdId = null;
  }

  function slideDetailIn() {
    document.getElementById('list-panel').classList.add('slide-out');
    document.getElementById('detail-panel').classList.add('slide-in');
  }

  function slideDetailOut() {
    document.getElementById('list-panel').classList.remove('slide-out');
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

  return { init, resolveBreakdown, submitResolve, completePM, editBreakdown, deleteBreakdown, editPM, deletePM, _loadBreakdowns: loadBreakdowns };
})();

// Global shim so onclick="submitResolve()" in HTML works
function submitResolve() { Maintenance.submitResolve(); }
