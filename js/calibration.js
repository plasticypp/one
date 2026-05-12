const Calibration = (() => {

  let session = null;
  let instruments = [];
  let cache = [];
  let filterStatus = 'all';

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    document.getElementById('back-to-app').addEventListener('click', () => window.location.href = 'app.html');
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = (session.lang || 'en').toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });

    const canLog = ['director','qmr'].includes(session.role);
    if (canLog) {
      document.getElementById('fab').classList.remove('hidden');
      document.getElementById('fab').addEventListener('click', openForm);
    }
    document.getElementById('cal-form-back').addEventListener('click', closeForm);
    document.getElementById('cal-submit-btn').addEventListener('click', submitLog);
    document.getElementById('cal-inst-select').addEventListener('change', onInstrumentChange);

    document.querySelectorAll('.cal-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cal-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterStatus = btn.dataset.status;
        renderTable();
      });
    });

    await loadData();
  }

  async function loadData() {
    UI.showSpinner(true);
    try {
      const [instRes, logRes] = await Promise.all([
        Api.get('getInstrumentsKB', {}),
        Api.get('getCalibrationList', {})
      ]);
      instruments = instRes && instRes.success ? instRes.data : [];
      cache = logRes && logRes.success ? logRes.data : [];
      populateInstrumentSelect();
      renderSummary();
      renderTable();
    } finally {
      UI.showSpinner(false);
    }
  }

  function populateInstrumentSelect() {
    const sel = document.getElementById('cal-inst-select');
    sel.innerHTML = '<option value="">— Select Instrument —</option>';
    instruments.forEach(inst => {
      const opt = document.createElement('option');
      opt.value = inst.id;
      opt.textContent = inst.name + ' (' + inst.location + ')';
      opt.dataset.name = inst.name;
      sel.appendChild(opt);
    });
  }

  function onInstrumentChange() {
    const sel = document.getElementById('cal-inst-select');
    const inst = instruments.find(i => i.id === sel.value);
    document.getElementById('cal-standard-display').textContent = inst ? inst.standard : '—';
    document.getElementById('cal-freq-display').textContent = inst ? inst.frequency_months + ' months' : '—';
  }

  function renderSummary() {
    const today = new Date(); today.setHours(0,0,0,0);
    const upcoming = [];
    instruments.forEach(inst => {
      const logs = cache.filter(r => r.inst_id === inst.id);
      if (logs.length === 0) {
        upcoming.push({ name: inst.name, due: 'Never calibrated', overdue: true });
        return;
      }
      const latest = logs.reduce((a, b) => (new Date(a.due_date) > new Date(b.due_date) ? a : b));
      const due = new Date(latest.due_date);
      upcoming.push({ name: inst.name, due: fmtDate(latest.due_date), overdue: due < today });
    });
    const container = document.getElementById('cal-summary');
    container.innerHTML = upcoming.map(u => `
      <div class="cal-summary-card ${u.overdue ? 'cal-overdue' : ''}">
        <span class="cal-inst-name">${u.name}</span>
        <span class="cal-due-label">${u.overdue ? 'OVERDUE' : 'Due'}: ${u.due}</span>
      </div>`).join('');
  }

  function renderTable() {
    const today = new Date(); today.setHours(0,0,0,0);
    let data = [...cache].sort((a,b) => new Date(b.calibration_date) - new Date(a.calibration_date));
    if (filterStatus === 'overdue') {
      data = data.filter(r => new Date(r.due_date) < today);
    } else if (filterStatus === 'ok') {
      data = data.filter(r => new Date(r.due_date) >= today);
    }
    const tbody = document.getElementById('cal-tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="td-loading">No records</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => {
      const due = new Date(r.due_date);
      const isOverdue = due < today;
      return `<tr>
        <td>${r.inst_id || ''}</td>
        <td>${r.inst_name || ''}</td>
        <td>${fmtDate(r.calibration_date)}</td>
        <td class="${isOverdue ? 'text-danger' : ''}">${fmtDate(r.due_date)}</td>
        <td><span class="badge badge-${r.result === 'Pass' ? 'ok' : 'fail'}">${r.result || ''}</span></td>
        <td>${r.certificate_no || '—'}</td>
        <td>${r.done_by || ''}</td>
      </tr>`;
    }).join('');
  }

  function openForm() {
    document.getElementById('cal-form-panel').classList.add('open');
    document.getElementById('cal-date').value = new Date().toISOString().slice(0,10);
    document.getElementById('cal-inst-select').value = '';
    document.getElementById('cal-standard-display').textContent = '—';
    document.getElementById('cal-freq-display').textContent = '—';
    document.getElementById('cal-make-model').value  = '';
    document.getElementById('cal-serial-no').value   = '';
    document.getElementById('cal-range').value        = '';
    document.getElementById('cal-location').value     = '';
    document.getElementById('cal-method').value       = '';
    document.getElementById('cal-as-found').value     = '';
    document.getElementById('cal-adjustments').value  = 'None';
    document.getElementById('cal-as-left').value      = '';
    document.getElementById('cal-oot-flag').value     = 'No';
    document.getElementById('cal-result').value       = 'Pass';
    document.getElementById('cal-cert-no').value      = '';
    document.getElementById('cal-agency').value       = '';
    document.getElementById('cal-done-by').value      = '';
    document.getElementById('cal-remarks').value      = '';
  }

  function closeForm() {
    document.getElementById('cal-form-panel').classList.remove('open');
  }

  async function submitLog() {
    const sel = document.getElementById('cal-inst-select');
    const instId = sel.value;
    const instName = sel.options[sel.selectedIndex]?.dataset?.name || '';
    const date = document.getElementById('cal-date').value;
    const result = document.getElementById('cal-result').value;
    const certNo = document.getElementById('cal-cert-no').value.trim();
    const agency = document.getElementById('cal-agency').value.trim();
    const doneBy = document.getElementById('cal-done-by').value.trim();
    const remarks = document.getElementById('cal-remarks').value.trim();

    if (!instId || !date || !doneBy) {
      UI.showToast('Instrument, date and done-by are required', 'error'); return;
    }
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveCalibrationLog', {
        userId:             Auth.getUserId(),
        inst_id:            instId,
        inst_name:          instName,
        make_model:         document.getElementById('cal-make-model').value.trim(),
        serial_no:          document.getElementById('cal-serial-no').value.trim(),
        range_capacity:     document.getElementById('cal-range').value.trim(),
        location:           document.getElementById('cal-location').value.trim(),
        calibration_date:   date,
        calibration_method: document.getElementById('cal-method').value.trim(),
        as_found:           document.getElementById('cal-as-found').value,
        adjustments_made:   document.getElementById('cal-adjustments').value,
        as_left:            document.getElementById('cal-as-left').value,
        oot_flag:           document.getElementById('cal-oot-flag').value,
        result,
        certificate_no:     certNo,
        agency,
        done_by:            doneBy,
        remarks
      });
      if (!res || !res.success) { UI.showToast(res?.error || 'Save failed', 'error'); return; }
      const inst = instruments.find(i => i.id === instId);
      const freqMonths = inst ? inst.frequency_months : 12;
      const nextDue = new Date(date);
      nextDue.setMonth(nextDue.getMonth() + freqMonths);
      UI.showToast('Saved — next due ' + nextDue.toISOString().slice(0,10));
      closeForm();
      await loadData();
    } finally {
      UI.showSpinner(false);
    }
  }

  function fmtDate(v) {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', Calibration.init);
