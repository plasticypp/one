const People = (() => {

  let session = null;
  let activeTab = 'personnel';
  let trainingCache = [];

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
    showSpinner(true);
    try {
      const res = await Api.get('getPersonnelList');
      renderPersonnel(res && res.success ? res.data : []);
    } finally {
      showSpinner(false);
    }
  }

  function renderPersonnel(records) {
    const tbody = document.getElementById('personnel-tbody');
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="td-loading">No personnel records</td></tr>';
      return;
    }
    tbody.innerHTML = records.map(r => `
      <tr>
        <td>${r.PersonID || r.person_id || '—'}</td>
        <td style="font-weight:500;">${r.Name || r.name || '—'}</td>
        <td>${r.Designation || r.designation || r.Role || r.role || '—'}</td>
        <td>${r.Department || r.department || '—'}</td>
        <td>${r.Phone || r.phone || '—'}</td>
      </tr>`).join('');
  }

  // ── Training Log ──────────────────────────────────────────────────────────

  async function loadTraining() {
    showSpinner(true);
    try {
      const res = await Api.get('getTrainingLog', {});
      trainingCache = res && res.success ? res.data : [];
      const filter = document.getElementById('training-status-filter').value;
      renderTraining(trainingCache, filter);
    } finally {
      showSpinner(false);
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
    const kbRes = await Api.get('getTrainingPlanKB');
    const kb = kbRes && kbRes.success ? kbRes.data : [];
    const topicOpts = kb.map(t => `<option value="${t.topic}">${t.topic} (${t.category})</option>`).join('');
    document.getElementById('tf-topic').innerHTML = '<option value="">— select or type —</option>' + topicOpts;
    document.getElementById('tf-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('tf-trainer').value = '';
    document.getElementById('tf-participants').value = '';
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
    if (!topic)   { showToast('Select a topic'); return; }
    if (!date)    { showToast('Enter date'); return; }
    if (!trainer) { showToast('Enter trainer name'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('saveTrainingLog', {
        topic,
        date,
        trainer_id:   trainer,
        participants: document.getElementById('tf-participants').value.trim(),
        method:       document.getElementById('tf-method').value.trim(),
        eval_score:   document.getElementById('tf-score').value,
        status:       document.getElementById('tf-status').value,
        remarks:      document.getElementById('tf-remarks').value.trim(),
        userId:       Auth.getUserId()
      });
      if (res && res.success) {
        showToast('Training logged');
        closeTrainingForm();
        await loadTraining();
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

  // ── Training Matrix ───────────────────────────────────────────────────────

  async function loadTrainingMatrix() {
    const wrap = document.getElementById('matrix-wrap');
    wrap.innerHTML = '<p class="text-muted" style="padding:var(--space-8);text-align:center;">Loading…</p>';
    showSpinner(true);
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
      // Build lookup: topic → Set of participant tokens
      const topicParticipants = {};
      logs.forEach(l => {
        if (!l.topic || l.status !== 'Completed') return;
        if (!topicParticipants[l.topic]) topicParticipants[l.topic] = [];
        (l.participants || '').split(',').forEach(p => {
          const token = p.trim().toLowerCase();
          if (token) topicParticipants[l.topic].push(token);
        });
      });

      let html = '<table class="data-table" style="white-space:nowrap;"><thead><tr><th>Name</th>';
      topics.forEach(t => { html += `<th style="writing-mode:vertical-rl;padding:8px 4px;max-width:40px;" title="${t}">${t.length > 18 ? t.slice(0, 16) + '…' : t}</th>`; });
      html += '</tr></thead><tbody>';

      personnel.forEach(p => {
        const name = (p.name || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        html += `<tr><td style="white-space:nowrap;">${p.name || p.id}</td>`;
        topics.forEach(t => {
          const participants = topicParticipants[t] || [];
          const trained = participants.some(tok => tok.includes(name) || (id && tok.includes(id)) || name.includes(tok));
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
      showSpinner(false);
    }
  }

  return { init };
})();
