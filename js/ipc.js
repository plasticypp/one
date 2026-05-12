const IPC = (() => {

  let session = null;
  let batchCache = [];
  let personnelCache = [];
  let ipcCache = [];

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

    const canLog = ['director','qmr','supervisor','operator'].includes(session.role);
    if (!canLog) document.getElementById('btn-new-ipc').classList.add('hidden');

    document.getElementById('btn-new-ipc').addEventListener('click', openForm);
    document.getElementById('ipc-form-back').addEventListener('click', closeForm);
    document.getElementById('btn-save-ipc').addEventListener('click', submitIPC);

    // Auto-calculate averages
    ['ipc-wt-s1','ipc-wt-s2','ipc-wt-s3','ipc-wt-s4','ipc-wt-s5'].forEach(id => {
      document.getElementById(id).addEventListener('input', calcWeightAvg);
    });
    ['ipc-wt0','ipc-wt45','ipc-wt90','ipc-wt135','ipc-wt180','ipc-wt225','ipc-wt270','ipc-wt315'].forEach(id => {
      document.getElementById(id).addEventListener('input', calcWallAvg);
    });

    await Promise.all([loadBatches(), loadPersonnel()]);
    await loadIPCList();
  }

  async function loadBatches() {
    const res = await Api.get('getBatchList', {});
    batchCache = res.success ? res.data : [];
    const sel = document.getElementById('ipc-batch');
    const filterSel = document.getElementById('filter-ipc-batch');
    batchCache.forEach(b => {
      [sel, filterSel].forEach(s => {
        const o = document.createElement('option');
        o.value = b.batch_id;
        o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
        s.appendChild(o);
      });
    });
    filterSel.addEventListener('change', () => loadIPCList(filterSel.value));
  }

  async function loadPersonnel() {
    const res = await Api.get('getOperatorList');
    personnelCache = res.success ? res.data : [];
    const sel = document.getElementById('ipc-checked-by');
    sel.innerHTML = '<option value="">— select —</option>';
    personnelCache.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name + (p.role ? ' (' + p.role + ')' : '');
      sel.appendChild(o);
    });
    if (session && session.id) sel.value = session.id;
  }

  async function loadIPCList(batchFilter) {
    UI.showSpinner(true);
    try {
      const params = batchFilter ? { batch_id: batchFilter } : {};
      const res = await Api.get('getIPCList', params);
      ipcCache = res.success ? res.data : [];
      renderTable(ipcCache);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderTable(rows) {
    const tbody = document.getElementById('ipc-tbody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted" style="padding:var(--space-8);">No records</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(r => {
      const resClass = r.result === 'Pass' ? 'chip-ok' : r.result === 'Fail' ? 'chip-ng' : 'chip-warn';
      return `<tr>
        <td>${r.ipc_id || ''}</td>
        <td>${r.date ? String(r.date).slice(0,10) : ''}</td>
        <td>${r.batch_id || ''}</td>
        <td>${r.shift || ''}</td>
        <td>${r.product_id || ''}</td>
        <td>${r.tare_wt || ''}</td>
        <td>${r.height || ''}</td>
        <td><span class="result-chip ${resClass}">${r.result || ''}</span></td>
        <td>${r.checked_by || ''}</td>
      </tr>`;
    }).join('');
  }

  function calcWeightAvg() {
    const vals = ['ipc-wt-s1','ipc-wt-s2','ipc-wt-s3','ipc-wt-s4','ipc-wt-s5']
      .map(id => parseFloat(document.getElementById(id).value)).filter(v => !isNaN(v));
    document.getElementById('ipc-tare-wt').value = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : '';
  }

  function calcWallAvg() {
    const vals = ['ipc-wt0','ipc-wt45','ipc-wt90','ipc-wt135','ipc-wt180','ipc-wt225','ipc-wt270','ipc-wt315']
      .map(id => parseFloat(document.getElementById(id).value)).filter(v => !isNaN(v));
    document.getElementById('ipc-wall-thick').value = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(3) : '';
  }

  function openForm() {
    document.getElementById('ipc-date').value = new Date().toISOString().slice(0,10);
    document.getElementById('ipc-shift').value = 'A';
    document.getElementById('ipc-batch').value = '';
    document.getElementById('ipc-machine').value = '';
    document.getElementById('ipc-mould-no').value = '';
    document.getElementById('ipc-check-type').value = 'First-Off';
    document.getElementById('ipc-sample-size').value = '5';
    ['ipc-wt-s1','ipc-wt-s2','ipc-wt-s3','ipc-wt-s4','ipc-wt-s5'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('ipc-tare-wt').value = '';
    ['ipc-wt0','ipc-wt45','ipc-wt90','ipc-wt135','ipc-wt180','ipc-wt225','ipc-wt270','ipc-wt315'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('ipc-wall-thick').value = '';
    document.getElementById('ipc-height').value = '';
    document.getElementById('ipc-diameter').value = '';
    document.getElementById('ipc-neck-dia').value = '';
    document.getElementById('ipc-flash').value = 'OK';
    document.getElementById('ipc-sink-marks').value = 'OK';
    document.getElementById('ipc-colour').value = 'OK';
    document.getElementById('ipc-contamination').value = 'OK';
    document.getElementById('ipc-short-shot').value = 'OK';
    document.getElementById('ipc-warpage').value = 'OK';
    document.getElementById('ipc-base-pinch').value = 'OK';
    document.getElementById('ipc-thread').value = 'OK';
    document.getElementById('ipc-surface').value = 'OK';
    document.getElementById('ipc-leak-s1').value = 'Pass';
    document.getElementById('ipc-leak-s2').value = 'Pass';
    document.getElementById('ipc-leak-test').value = 'Pass';
    document.getElementById('ipc-result').value = '';
    document.getElementById('ipc-remarks').value = '';
    if (session && session.id) document.getElementById('ipc-checked-by').value = session.id;
    document.getElementById('ipc-form-panel').classList.add('open');
  }

  function closeForm() {
    document.getElementById('ipc-form-panel').classList.remove('open');
  }

  async function submitIPC() {
    const batchId = document.getElementById('ipc-batch').value;
    const result  = document.getElementById('ipc-result').value;
    const checkedBy = document.getElementById('ipc-checked-by').value;
    if (!batchId || !result || !checkedBy) {
      UI.showToast('Batch, Result, and Checked By are required', 'error');
      return;
    }
    const payload = {
      userId:       Auth.getUserId(),
      date:         document.getElementById('ipc-date').value,
      shift:        document.getElementById('ipc-shift').value,
      batch_id:     batchId,
      machine_id:   document.getElementById('ipc-machine').value,
      mould_no:     document.getElementById('ipc-mould-no').value,
      check_type:   document.getElementById('ipc-check-type').value,
      sample_size:  document.getElementById('ipc-sample-size').value,
      wt_s1:        document.getElementById('ipc-wt-s1').value,
      wt_s2:        document.getElementById('ipc-wt-s2').value,
      wt_s3:        document.getElementById('ipc-wt-s3').value,
      wt_s4:        document.getElementById('ipc-wt-s4').value,
      wt_s5:        document.getElementById('ipc-wt-s5').value,
      tare_wt:      document.getElementById('ipc-tare-wt').value,
      wt_0:         document.getElementById('ipc-wt0').value,
      wt_45:        document.getElementById('ipc-wt45').value,
      wt_90:        document.getElementById('ipc-wt90').value,
      wt_135:       document.getElementById('ipc-wt135').value,
      wt_180:       document.getElementById('ipc-wt180').value,
      wt_225:       document.getElementById('ipc-wt225').value,
      wt_270:       document.getElementById('ipc-wt270').value,
      wt_315:       document.getElementById('ipc-wt315').value,
      wall_thick:   document.getElementById('ipc-wall-thick').value,
      height:       document.getElementById('ipc-height').value,
      diameter:     document.getElementById('ipc-diameter').value,
      neck_dia:     document.getElementById('ipc-neck-dia').value,
      flash:        document.getElementById('ipc-flash').value,
      sink_marks:   document.getElementById('ipc-sink-marks').value,
      colour:       document.getElementById('ipc-colour').value,
      contamination:document.getElementById('ipc-contamination').value,
      short_shot:   document.getElementById('ipc-short-shot').value,
      warpage:      document.getElementById('ipc-warpage').value,
      base_pinch:   document.getElementById('ipc-base-pinch').value,
      thread:       document.getElementById('ipc-thread').value,
      surface:      document.getElementById('ipc-surface').value,
      leak_s1:      document.getElementById('ipc-leak-s1').value,
      leak_s2:      document.getElementById('ipc-leak-s2').value,
      cap_fitment:  document.getElementById('ipc-leak-test').value,
      result,
      checked_by:   checkedBy,
      remarks:      document.getElementById('ipc-remarks').value
    };
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveIPC', payload);
      if (!res || !res.success) { UI.showToast(res?.error || 'Save failed', 'error'); return; }
      UI.showToast('IPC record saved — ' + res.ipc_id);
      closeForm();
      await loadIPCList();
    } finally {
      UI.showSpinner(false);
    }
  }

  return { init };
})();
