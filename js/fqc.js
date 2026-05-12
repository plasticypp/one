const FQC = (() => {

  let session = null;
  let batchCache = [];
  let personnelCache = [];

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

    const canLog = ['director','qmr','supervisor'].includes(session.role);
    if (!canLog) document.getElementById('btn-new-fqc').classList.add('hidden');

    document.getElementById('btn-new-fqc').addEventListener('click', openForm);
    document.getElementById('fqc-form-back').addEventListener('click', closeForm);
    document.getElementById('btn-save-fqc').addEventListener('click', submitFQC);
    document.getElementById('filter-fqc-result').addEventListener('change', e => loadFQCList(e.target.value));

    await Promise.all([loadBatches(), loadPersonnel()]);
    await loadFQCList();
  }

  async function loadBatches() {
    const res = await Api.get('getBatchList', {});
    batchCache = res.success ? res.data : [];
    const sel = document.getElementById('fqc-batch');
    batchCache.forEach(b => {
      const o = document.createElement('option');
      o.value = b.batch_id;
      o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
      sel.appendChild(o);
    });
  }

  async function loadPersonnel() {
    const res = await Api.get('getPersonnelList');
    personnelCache = res.success ? res.data : [];
    ['fqc-inspector','fqc-released-by'].forEach(id => {
      const sel = document.getElementById(id);
      sel.innerHTML = '<option value="">— select —</option>';
      personnelCache.forEach(p => {
        const o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.name + (p.role ? ' (' + p.role + ')' : '');
        sel.appendChild(o);
      });
    });
    if (session && session.id) {
      document.getElementById('fqc-inspector').value = session.id;
    }
  }

  async function loadFQCList(resultFilter) {
    UI.showSpinner(true);
    try {
      const params = resultFilter ? { result: resultFilter } : {};
      const res = await Api.get('getFQCList', params);
      renderTable(res.success ? res.data : []);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderTable(rows) {
    const tbody = document.getElementById('fqc-tbody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted" style="padding:var(--space-8);">No records</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(r => {
      const resClass = r.result === 'Pass' ? 'chip-ok' : r.result === 'Fail' ? 'chip-ng' : 'chip-warn';
      return `<tr>
        <td>${r.fqc_id || ''}</td>
        <td>${r.date ? String(r.date).slice(0,10) : ''}</td>
        <td>${r.batch_id || ''}</td>
        <td>${r.product_id || ''}</td>
        <td>${r.total_qty || ''}</td>
        <td>${r.aql_level || ''}</td>
        <td><span class="result-chip ${resClass}">${r.result || ''}</span></td>
        <td>${r.released_by || ''}</td>
      </tr>`;
    }).join('');
  }

  function openForm() {
    document.getElementById('fqc-date').value = new Date().toISOString().slice(0,10);
    document.getElementById('fqc-batch').value = '';
    document.getElementById('fqc-customer').value = '';
    document.getElementById('fqc-total-qty').value = '';
    document.getElementById('fqc-aql-level').value = 'AQL 2.5';
    document.getElementById('fqc-sample-size').value = '';
    document.getElementById('fqc-height').value = '';
    document.getElementById('fqc-diameter').value = '';
    document.getElementById('fqc-neck-dia').value = '';
    document.getElementById('fqc-wall-thick').value = '';
    document.getElementById('fqc-capacity').value = '';
    document.getElementById('fqc-flash').value = 'OK';
    document.getElementById('fqc-contamination').value = 'OK';
    document.getElementById('fqc-colour-finish').value = 'OK';
    document.getElementById('fqc-labelling').value = 'OK';
    document.getElementById('fqc-packaging').value = 'OK';
    document.getElementById('fqc-leak-test').value = 'Pass';
    document.getElementById('fqc-drop-base').value = 'Pass';
    document.getElementById('fqc-drop-side').value = 'Pass';
    document.getElementById('fqc-drop-test').value = 'Pass';
    document.getElementById('fqc-top-load').value = 'Pass';
    document.getElementById('fqc-brim-u1').value = '';
    document.getElementById('fqc-brim-u2').value = '';
    document.getElementById('fqc-brim-result').value = 'Pass';
    document.getElementById('fqc-torque-test').value = 'Pass';
    document.getElementById('fqc-mfi-check').value = 'NA';
    document.getElementById('fqc-nc-units').value = '0';
    document.getElementById('fqc-result').value = '';
    document.getElementById('fqc-remarks').value = '';
    if (session && session.id) document.getElementById('fqc-inspector').value = session.id;
    document.getElementById('fqc-form-panel').classList.add('open');
  }

  function closeForm() {
    document.getElementById('fqc-form-panel').classList.remove('open');
  }

  async function submitFQC() {
    const batchId   = document.getElementById('fqc-batch').value;
    const result    = document.getElementById('fqc-result').value;
    const inspector = document.getElementById('fqc-inspector').value;
    const totalQty  = document.getElementById('fqc-total-qty').value;
    if (!batchId || !result || !inspector || !totalQty) {
      UI.showToast('Batch, Total Qty, Result, and Inspector are required', 'error');
      return;
    }
    const payload = {
      userId:         Auth.getUserId(),
      date:           document.getElementById('fqc-date').value,
      batch_id:       batchId,
      customer:       document.getElementById('fqc-customer').value,
      total_qty:      Number(totalQty),
      aql_level:      document.getElementById('fqc-aql-level').value,
      sample_size:    document.getElementById('fqc-sample-size').value,
      height:         document.getElementById('fqc-height').value,
      diameter:       document.getElementById('fqc-diameter').value,
      neck_dia:       document.getElementById('fqc-neck-dia').value,
      wall_thick:     document.getElementById('fqc-wall-thick').value,
      capacity:       document.getElementById('fqc-capacity').value,
      flash:          document.getElementById('fqc-flash').value,
      contamination:  document.getElementById('fqc-contamination').value,
      colour_finish:  document.getElementById('fqc-colour-finish').value,
      labelling:      document.getElementById('fqc-labelling').value,
      packaging:      document.getElementById('fqc-packaging').value,
      leak_test:      document.getElementById('fqc-leak-test').value,
      drop_base:      document.getElementById('fqc-drop-base').value,
      drop_side:      document.getElementById('fqc-drop-side').value,
      drop_test:      document.getElementById('fqc-drop-test').value,
      top_load:       document.getElementById('fqc-top-load').value,
      brim_u1:        document.getElementById('fqc-brim-u1').value,
      brim_u2:        document.getElementById('fqc-brim-u2').value,
      brim_result:    document.getElementById('fqc-brim-result').value,
      torque_test:    document.getElementById('fqc-torque-test').value,
      mfi_check:      document.getElementById('fqc-mfi-check').value,
      nc_units:       Number(document.getElementById('fqc-nc-units').value) || 0,
      result,
      inspector_id:   inspector,
      released_by:    document.getElementById('fqc-released-by').value,
      remarks:        document.getElementById('fqc-remarks').value
    };
    UI.showSpinner(true);
    try {
      const res = await Api.post('saveFQC', payload);
      if (!res || !res.success) { UI.showToast(res?.error || 'Save failed', 'error'); return; }
      UI.showToast('FQC record saved — ' + res.fqc_id);
      closeForm();
      await loadFQCList();
    } finally {
      UI.showSpinner(false);
    }
  }

  return { init };
})();
