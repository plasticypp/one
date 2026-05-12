const People = (() => {

  let session = null;
  let activeTab = 'personnel';
  let trainingCache = [];
  let personnelCache = [];

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

    document.getElementById('tab-personnel-btn').addEventListener('click', () => switchTab('personnel'));
    document.getElementById('tab-training-btn').addEventListener('click',  () => switchTab('training'));
    document.getElementById('tab-matrix-btn').addEventListener('click',    () => switchTab('matrix'));
    document.getElementById('add-training-btn').addEventListener('click',  openTrainingForm);
    document.getElementById('training-form-back').addEventListener('click', closeTrainingForm);
    document.getElementById('training-submit-btn').addEventListener('click', submitTraining);
    document.getElementById('training-status-filter').addEventListener('change', e => {
      renderTraining(trainingCache, e.target.value);
    });

    const canEditPersonnel = ['director','hr'].includes(session.role);
    if (canEditPersonnel) {
      document.getElementById('add-personnel-btn').classList.remove('hidden');
      document.getElementById('add-personnel-btn').addEventListener('click', () => openPersonnelForm(null));
    }
    document.getElementById('personnel-form-back').addEventListener('click', closePersonnelForm);
    document.getElementById('personnel-submit-btn').addEventListener('click', submitPersonnel);

    await switchTab('personnel');
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  async function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tab-personnel-btn').classList.toggle('active', tab === 'personnel');
    document.getElementById('tab-training-btn').classList.toggle('active',  tab === 'training');
    document.getElementById('tab-matrix-btn').classList.toggle('active',    tab === 'matrix');
    document.getElementById('panel-personnel').classList.toggle('hidden', tab !== 'personnel');
    document.getElementById('panel-training').classList.toggle('hidden',  tab !== 'training');
    document.getElementById('panel-matrix').classList.toggle('hidden',    tab !== 'matrix');
    document.getElementById('add-training-btn').classList.toggle('hidden', tab !== 'training');
    const canEditPersonnel = ['director','hr'].includes(session.role);
    document.getElementById('add-personnel-btn').classList.toggle('hidden', tab !== 'personnel' || !canEditPersonnel);
    if (tab === 'personnel') {
      await loadPersonnel();
    } else if (tab === 'matrix') {
      await loadTrainingMatrix();
    } else {
      await loadTraining();
    }
  }

  // ── Personnel ─────────────────────────────────────────────────────────────

  async function loadPersonnel() {
    UI.showSpinner(true);
    try {
      const res = await Api.get('getPersonnelList');
      personnelCache = res && res.success ? res.data : [];
      renderPersonnel(personnelCache);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderPersonnel(records) {
    const canEdit = ['director','hr'].includes(session.role);
    const thead = document.querySelector('#panel-personnel thead tr');
    if (thead && canEdit && !thead.querySelector('th.edit-col')) {
      thead.insertAdjacentHTML('beforeend', '<th class="edit-col"></th>');
    }
    const tbody = document.getElementById('personnel-tbody');
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${canEdit ? 6 : 5}" class="td-loading">No personnel records</td></tr>`;
      return;
    }
    tbody.innerHTML = records.map(r => {
      const id = r.PersonID || r.person_id || '';
      return `<tr>
        <td>${id || '—'}</td>
        <td style="font-weight:500;">${r.Name || r.name || '—'}</td>
        <td>${r.Designation || r.designation || r.Role || r.role || '—'}</td>
        <td>${r.Department || r.department || '—'}</td>
        <td>${r.Phone || r.phone || '—'}</td>
        ${canEdit ? `<td><button class="btn-sm" data-person-id="${id}">Edit</button></td>` : ''}
      </tr>`;
    }).join('');
    if (canEdit) {
      tbody.querySelectorAll('button[data-person-id]').forEach(btn => {
        btn.addEventListener('click', () => openPersonnelForm(btn.dataset.personId));
      });
    }
  }

  function openPersonnelForm(personId) {
    const r = personId ? personnelCache.find(p => String(p.PersonID || p.person_id) === String(personId)) : null;
    document.getElementById('pf-person-id').value     = r ? (r.PersonID || r.person_id || '') : '';
    document.getElementById('pf-name').value          = r ? (r.Name || r.name || '') : '';
    document.getElementById('pf-role').value          = r ? (r.Role || r.role || '') : '';
    document.getElementById('pf-department').value    = r ? (r.Department || r.department || '') : '';
    document.getElementById('pf-phone').value         = r ? (r.Phone || r.phone || '') : '';
    document.getElementById('pf-qualification').value = r ? (r.Qualification || r.qualification || '') : '';
    document.getElementById('pf-date-joined').value   = r ? String(r.DateJoined || r.date_joined || '').slice(0,10) : '';
    document.getElementById('personnel-form-title').textContent = r ? 'Edit Personnel' : 'Add Personnel';
    document.getElementById('personnel-form-panel').classList.add('slide-in');
    document.getElementById('people-list-area').classList.add('slide-out');
  }

  function closePersonnelForm() {
    document.getElementById('personnel-form-panel').classList.remove('slide-in');
    document.getElementById('people-list-area').classList.remove('slide-out');
  }

  async function submitPersonnel() {
    const name       = document.getElementById('pf-name').value.trim();
    const role       = document.getElementById('pf-role').value;
    const department = document.getElementById('pf-department').value;
    if (!name)       { UI.showToast('Name is required'); return; }
    if (!role)       { UI.showToast('Select a role'); return; }
    if (!department) { UI.showToast('Select a department'); return; }
    UI.showSpinner(true);
    try {
      const res = await Api.post('savePersonnel', {
        PersonID:      document.getElementById('pf-person-id').value || undefined,
        name, role, department,
        phone:         document.getElementById('pf-phone').value.trim(),
        qualification: document.getElementById('pf-qualification').value.trim(),
        date_joined:   document.getElementById('pf-date-joined').value,
        userId:        Auth.getUserId()
      });
      if (res && res.success) {
        UI.showToast(document.getElementById('pf-person-id').value ? 'Personnel updated' : 'Personnel added: ' + res.person_id);
        closePersonnelForm();
        await loadPersonnel();
      } else {
        UI.showToast('Error: ' + (res && res.error || 'save failed'));
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Training Log ──────────────────────────────────────────────────────────

  async function loadTraining() {
    UI.showSpinner(true);
    try {
      const res = await Api.get('getTrainingLog', {});
      trainingCache = res && res.success ? res.data : [];
      const filter = document.getElementById('training-status-filter').value;
      renderTraining(trainingCache, filter);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderTraining(records, filter) {
    const data = filter && filter !== 'all'
      ? records.filter(r => (r.Status || '') === filter)
      : records;
    const tbody = document.getElementById('training-tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="td-loading">No training records</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => {
      const statusClass = r.Status === 'Completed' ? 'chip-green' : 'chip-yellow';
      return `<tr>
        <td>${String(r.Date || '').slice(0, 10)}</td>
        <td style="font-weight:500;">${r.Topic || '—'}</td>
        <td>${r.TrainerID || '—'}</td>
        <td>${r.Participants || '—'}</td>
        <td>${r.EvalScore || '—'}</td>
        <td><span class="chip ${statusClass}">${r.Status || 'Planned'}</span></td>
      </tr>`;
    }).join('');
  }

  // ── Training Form ─────────────────────────────────────────────────────────

  async function openTrainingForm() {
    const [kbRes, pRes] = await Promise.all([Api.get('getTrainingPlanKB'), Api.get('getPersonnelList')]);
    const kb = kbRes && kbRes.success ? kbRes.data : [];
    const topicOpts = kb.map(t => `<option value="${t.topic}">${t.topic} (${t.category})</option>`).join('');
    document.getElementById('tf-topic').innerHTML = '<option value="">— select or type —</option>' + topicOpts;
    document.getElementById('tf-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('tf-trainer').value = '';
    const pSel = document.getElementById('tf-participants');
    const personnel = pRes && pRes.success ? pRes.data : [];
    pSel.innerHTML = personnel.map(p => `<option value="${p.id}">${p.name} (${p.role || p.department || p.id})</option>`).join('') || '<option value="" disabled>No personnel found</option>';
    document.getElementById('tf-method').value = '';
    document.getElementById('tf-score').value = '';
    document.getElementById('tf-remarks').value = '';
    document.getElementById('tf-status').value = 'Completed';

    document.getElementById('training-form-panel').classList.add('slide-in');
    document.getElementById('people-list-area').classList.add('slide-out');
  }

  function closeTrainingForm() {
    document.getElementById('training-form-panel').classList.remove('slide-in');
    document.getElementById('people-list-area').classList.remove('slide-out');
  }

  async function submitTraining() {
    const topic   = document.getElementById('tf-topic').value;
    const date    = document.getElementById('tf-date').value;
    const trainer = document.getElementById('tf-trainer').value.trim();
    if (!topic)   { UI.showToast('Select a topic'); return; }
    if (!date)    { UI.showToast('Enter date'); return; }
    if (!trainer) { UI.showToast('Enter trainer name'); return; }
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveTrainingLog', {
        topic,
        date,
        trainer_id:   trainer,
        participants: Array.from(document.getElementById('tf-participants').selectedOptions).map(o => o.value).join(','),
        method:       document.getElementById('tf-method').value.trim(),
        eval_score:   document.getElementById('tf-score').value,
        status:       document.getElementById('tf-status').value,
        remarks:      document.getElementById('tf-remarks').value.trim(),
        userId:       Auth.getUserId()
      });
      if (res && res.success) {
        UI.showToast('Training logged');
        closeTrainingForm();
        await loadTraining();
      } else {
        UI.showToast('Error: ' + (res && res.error || 'save failed'));
      }
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function UI.showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  function UI.showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ── Training Matrix ───────────────────────────────────────────────────────

  async function loadTrainingMatrix() {
    const wrap = document.getElementById('matrix-wrap');
    wrap.innerHTML = '<p class="text-muted" style="padding:var(--space-8);text-align:center;">Loading…</p>';
    UI.showSpinner(true);
    try {
      const [pRes, tRes] = await Promise.all([
        Api.get('getPersonnelList'),
        Api.get('getTrainingLog')
      ]);
      const personnel = pRes && pRes.success ? pRes.data : [];
      const logs = tRes && tRes.success ? tRes.data : [];

      if (!personnel.length || !logs.length) {
        wrap.innerHTML = '<p class="text-muted" style="padding:var(--space-8);text-align:center;">Not enough data to build matrix.</p>';
        return;
      }

      // Unique topics (columns)
      const topics = [...new Set(logs.map(l => l.topic).filter(Boolean))].sort();
      // Build lookup: topic → Set of participant person_ids
      const topicParticipants = {};
      logs.forEach(l => {
        if (!l.topic || l.status !== 'Completed') return;
        if (!topicParticipants[l.topic]) topicParticipants[l.topic] = new Set();
        (l.participants || '').split(',').forEach(p => {
          const token = p.trim();
          if (token) topicParticipants[l.topic].add(token);
        });
      });

      const escStr = v => (v == null ? '' : String(v)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      let html = '<table class="data-table" style="white-space:nowrap;"><thead><tr><th>Name</th>';
      topics.forEach(t => {
        const te = escStr(t);
        const label = t.length > 18 ? escStr(t.slice(0, 16)) + '…' : te;
        html += `<th style="writing-mode:vertical-rl;padding:8px 4px;max-width:40px;" title="${te}">${label}</th>`;
      });
      html += '</tr></thead><tbody>';

      personnel.forEach(p => {
        const name = (p.name || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        html += `<tr><td style="white-space:nowrap;">${escStr(p.name || p.id)}</td>`;
        topics.forEach(t => {
          const participants = topicParticipants[t] || new Set();
          // Exact person_id match; fall back to name-includes for legacy string-participant records
          const trained = participants.has(p.id) || [...participants].some(tok => tok.toLowerCase().includes(name) && name.length > 2);
          html += trained
            ? '<td style="text-align:center;color:var(--color-success)">✓</td>'
            : '<td style="text-align:center;color:var(--color-muted)">—</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      wrap.innerHTML = html;
    } catch (e) {
      wrap.innerHTML = '<p class="text-muted" style="padding:var(--space-8);text-align:center;">Failed to load matrix.</p>';
    } finally {
      UI.showSpinner(false);
    }
  }

  return { init };
})();
