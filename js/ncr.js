const NCR = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  let session = null;
  let batchCache = [];
  let productCache = [];
  let personnelCache = [];
  let ncrCache = [];
  let defectCache = [];
  let editingNcrId = null;
  let activeTab = 'ncr';

  // ── Init ───────────────────────────────────────────────────────────────────
  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);
    setupHeader();
    renderTabs();
    const [, , pRes, oRes] = await Promise.all([
      loadBatches(),
      loadDefectCatalogue(),
      Api.get('getMasterDropdown', { entity: 'Products' }),
      Api.get('getOperatorList')
    ]);
    productCache = pRes.success ? pRes.data : [];
    personnelCache = oRes.success ? oRes.data : [];
    populatePersonnelDropdown();
    await loadNCRs();
    readURLParams();
  }

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => window.location.href = 'app.html');
    document.getElementById('form-back').addEventListener('click', () => { editingNcrId = null; slideFormOut(); });
    document.getElementById('detail-back').addEventListener('click', slideDetailOut);
    document.getElementById('btn-new-ncr').addEventListener('click', () => openNCRForm());
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = (session.lang || 'en').toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────
  function renderTabs() {
    document.querySelectorAll('.sub-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
      btn.onclick = async () => {
        activeTab = btn.dataset.tab;
        renderTabs();
        document.getElementById('tab-ncr').classList.toggle('hidden', activeTab !== 'ncr');
        document.getElementById('tab-catalogue').classList.toggle('hidden', activeTab !== 'catalogue');
        if (activeTab === 'catalogue') renderDefectCatalogue();
      };
    });
    document.getElementById('tab-ncr').classList.toggle('hidden', activeTab !== 'ncr');
    document.getElementById('tab-catalogue').classList.toggle('hidden', activeTab !== 'catalogue');
  }

  // ── URL params ─────────────────────────────────────────────────────────────
  function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    const batch = params.get('batch');
    const stage = params.get('stage');
    if (batch || stage) openNCRForm(batch, stage);
  }

  // ── Personnel Dropdown ─────────────────────────────────────────────────────
  function populatePersonnelDropdown() {
    const sel = document.getElementById('field-ncr-detected-by');
    if (!sel) return;
    sel.innerHTML = '<option value="">— select —</option>';
    personnelCache.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name + (p.role ? ' (' + p.role + ')' : '');
      sel.appendChild(o);
    });
    if (session && session.id) sel.value = session.id;
  }

  // ── Batches ────────────────────────────────────────────────────────────────
  async function loadBatches() {
    const res = await Api.get('getBatchList', {});
    batchCache = res.success ? res.data : [];
    const sel = document.getElementById('field-ncr-batch');
    sel.innerHTML = '<option value="">— select —</option>';
    batchCache.forEach(b => {
      const o = document.createElement('option');
      o.value = b.batch_id;
      o.textContent = b.batch_id + (b.product_id ? ' — ' + ((productCache.find(p => String(p.id) === String(b.product_id)) || {}).name || b.product_id) : '');
      sel.appendChild(o);
    });
  }

  // ── NCR Log ────────────────────────────────────────────────────────────────
  async function loadNCRs(filters) {
    UI.showSpinner(true);
    try {
      const res = await Api.get('getNCRList', filters || {});
      ncrCache = res.success ? res.data : [];
      renderNCRTable(ncrCache);
    } finally {
      UI.showSpinner(false);
    }
  }

  function renderNCRTable(rows) {
    const tbody = document.getElementById('ncr-tbody');
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="td-loading">No NCR records</td></tr>';
      return;
    }
    const canEdit = ['director', 'qmr', 'supervisor'].includes(session.role);
    rows.forEach(r => {
      const sevClass = r.severity === 'Critical' ? 'chip-ng' : r.severity === 'Major' ? 'chip-ng' : 'chip-ok';
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.ncr_id || ''}</td>
        <td>${r.date ? String(r.date).slice(0, 10) : ''}</td>
        <td>${r.batch_id || ''}</td>
        <td>${r.stage || ''}</td>
        <td>${r.defect_type || ''}</td>
        <td><span class="result-chip ${sevClass}">${r.severity || ''}</span></td>
        <td>${r.qty_affected ?? ''}</td>
        <td>${r.disposition || ''}</td>
        <td>${r.status || ''}</td>
        <td>${canEdit
          ? `<button class="btn-sm" onclick="event.stopPropagation();NCR.editNCR('${r.ncr_id}')">Edit</button>
             <button class="btn-sm btn-danger" onclick="event.stopPropagation();NCR.deleteNCR('${r.ncr_id}')">Del</button>`
          : ''}</td>
      `;
      tr.addEventListener('click', () => openNCRDetail(r.ncr_id));
      tbody.appendChild(tr);
    });
  }

  // ── NCR Form ───────────────────────────────────────────────────────────────
  function openNCRForm(preBatch, preStage) {
    editingNcrId = null;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-ncr-date').value = today;
    document.getElementById('field-ncr-qty').value = '';
    document.getElementById('field-ncr-remarks').value = '';
    document.getElementById('field-ncr-severity').value = '';
    if (session.id) document.getElementById('field-ncr-detected-by').value = session.id;
    document.getElementById('field-ncr-defect').value = '';

    if (preBatch) document.getElementById('field-ncr-batch').value = preBatch;
    if (preStage) document.getElementById('field-ncr-stage').value = preStage;

    document.getElementById('field-ncr-defect').onchange = () => {
      const defectName = document.getElementById('field-ncr-defect').value;
      const defect = defectCache.find(d => d.name === defectName);
      document.getElementById('field-ncr-severity').value = defect ? defect.severity : '';
    };

    document.getElementById('form-title').textContent = 'New NCR';
    slideFormIn();
  }

  async function submitNCR() {
    const batchId     = document.getElementById('field-ncr-batch').value.trim();
    const stage       = document.getElementById('field-ncr-stage').value;
    const defectType  = document.getElementById('field-ncr-defect').value.trim();
    const severity    = document.getElementById('field-ncr-severity').value.trim();
    const qty         = document.getElementById('field-ncr-qty').value;
    const disposition = document.getElementById('field-ncr-disposition').value;
    const detectedBy  = document.getElementById('field-ncr-detected-by').value.trim();
    const remarks     = document.getElementById('field-ncr-remarks').value.trim();
    const date        = document.getElementById('field-ncr-date').value;

    if (!batchId || !defectType || !qty || !disposition) {
      UI.showToast('Batch, Defect Type, Qty, and Disposition are required');
      return;
    }

    if (editingNcrId) {
      UI.showSpinner(true);
      try {
        const fields = { date, batch_id: batchId, stage, defect_type: defectType, severity, qty_affected: Number(qty), disposition, detected_by: detectedBy, remarks };
        const res = await Api.post('updateRecord', {
          sheet: 'NCR_Log', idCol: 'ncr_id', idVal: editingNcrId,
          userId: Auth.getUserId(), fields
        });
        if (res.success) { editingNcrId = null; slideFormOut(); await loadNCRs(); }
        else UI.showToast('Update failed: ' + res.error);
      } finally { UI.showSpinner(false); }
      return;
    }

    UI.showSpinner(true);
    try {
      const res = await Api.post('saveNCR', {
        date, batch_id: batchId, stage, defect_type: defectType, severity,
        qty_affected: Number(qty), disposition, detected_by: detectedBy,
        remarks, userId: Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        await loadNCRs();
        UI.showToast('NCR saved — ' + res.ncr_id);
        if (res.capa_required) {
          showCAPABanner(res.capa_trigger_reason);
          if (res.capa_id) UI.showToast('CAPA auto-created: ' + res.capa_id);
        }
      } else {
        UI.showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally { UI.showSpinner(false); }
  }

  // ── CAPA Banner ────────────────────────────────────────────────────────────
  function showCAPABanner(reason) {
    document.getElementById('capa-banner-msg').textContent = 'CAPA Required: ' + reason;
    document.getElementById('capa-banner').classList.remove('hidden');
  }

  // ── NCR Detail ─────────────────────────────────────────────────────────────
  function openNCRDetail(ncrId) {
    const r = ncrCache.find(n => String(n.ncr_id) === String(ncrId));
    if (!r) return;
    const fv = (v) => (v === undefined || v === null || v === '') ? '—' : String(v).slice(0, 40);
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>NCR ID</span><strong>${fv(r.ncr_id)}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${fv(r.date)}</strong></div>
      <div class="detail-row"><span>Batch</span><strong>${fv(r.batch_id)}</strong></div>
      <div class="detail-row"><span>Stage</span><strong>${fv(r.stage)}</strong></div>
      <div class="detail-row"><span>Defect Type</span><strong>${fv(r.defect_type)}</strong></div>
      <div class="detail-row"><span>Severity</span><strong>${fv(r.severity)}</strong></div>
      <div class="detail-row"><span>Qty Affected</span><strong>${fv(r.qty_affected)}</strong></div>
      <div class="detail-row"><span>Disposition</span><strong>${fv(r.disposition)}</strong></div>
      <div class="detail-row"><span>Detected By</span><strong>${fv(r.detected_by)}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${fv(r.status)}</strong></div>
      <div class="detail-row"><span>CAPA Required</span><strong>${r.capa_required ? 'Yes — ' + fv(r.capa_trigger_reason) : 'No'}</strong></div>
      ${r.capa_id ? `<div class="detail-row"><span>CAPA</span><strong><a href="compliance.html" style="color:var(--color-primary)">${r.capa_id} → View in Compliance</a></strong></div>` : ''}
      <div class="detail-row"><span>Remarks</span><strong>${fv(r.remarks)}</strong></div>
    `;
    const canEdit = ['director', 'qmr', 'supervisor'].includes(session.role);
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="NCR.editNCR('${r.ncr_id}')">Edit</button>
         <button class="btn-deactivate" onclick="NCR.deleteNCR('${r.ncr_id}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editNCR(ncrId) {
    const r = ncrCache.find(n => String(n.ncr_id) === String(ncrId));
    if (!r) return;
    editingNcrId = ncrId;
    slideDetailOut();
    document.getElementById('field-ncr-date').value = r.date ? String(r.date).slice(0, 10) : '';
    document.getElementById('field-ncr-batch').value = r.batch_id || '';
    document.getElementById('field-ncr-stage').value = r.stage || 'IPC';
    document.getElementById('field-ncr-defect').value = r.defect_type || '';
    document.getElementById('field-ncr-severity').value = r.severity || '';
    document.getElementById('field-ncr-qty').value = r.qty_affected ?? '';
    document.getElementById('field-ncr-disposition').value = r.disposition || 'Rework';
    document.getElementById('field-ncr-detected-by').value = r.detected_by || '';
    document.getElementById('field-ncr-remarks').value = r.remarks || '';
    document.getElementById('field-ncr-defect').onchange = () => {
      const defectName = document.getElementById('field-ncr-defect').value;
      const defect = defectCache.find(d => d.name === defectName);
      document.getElementById('field-ncr-severity').value = defect ? defect.severity : '';
    };
    document.getElementById('form-title').textContent = 'Edit NCR';
    slideFormIn();
  }

  async function deleteNCR(ncrId) {
    if (!confirm('Delete NCR ' + ncrId + '?')) return;
    const res = await Api.post('deleteRecord', {
      sheet: 'NCR_Log', idCol: 'ncr_id', idVal: ncrId, userId: Auth.getUserId()
    });
    if (res.success) { slideDetailOut(); await loadNCRs(); }
    else UI.showToast('Delete failed: ' + res.error);
  }

  // ── Defect Catalogue ───────────────────────────────────────────────────────
  async function loadDefectCatalogue() {
    const res = await Api.get('getDefectCatalogue', {});
    defectCache = res.success ? res.data : [];
    const sel = document.getElementById('field-ncr-defect');
    defectCache.forEach(d => {
      const o = document.createElement('option');
      o.value = d.name;
      o.textContent = d.name + ' (' + d.severity + ')';
      o.dataset.severity = d.severity;
      sel.appendChild(o);
    });
  }

  function renderDefectCatalogue() {
    const grid = document.getElementById('defect-catalogue-grid');
    grid.innerHTML = '';
    if (defectCache.length === 0) {
      grid.innerHTML = '<p class="empty-msg">No defects loaded</p>';
      return;
    }
    const sevColor = { Critical: 'var(--color-error)', Major: 'var(--color-warning)', Minor: 'var(--color-success)' };
    const sevBg    = { Critical: '#fff5f5', Major: 'var(--color-warning-bg, #fff3e0)', Minor: '#f1f8f1' };
    defectCache.forEach(d => {
      const color = sevColor[d.severity] || '#555';
      const bg    = sevBg[d.severity]    || '#f9f9f9';
      const card  = document.createElement('div');
      card.className = 'qc-card';
      card.style.cssText = 'border-color:' + color + ';background:' + bg + ';cursor:default;';
      const stages = Array.isArray(d.detection_stage) ? d.detection_stage.join(', ') : (d.detection_stage || '');
      card.innerHTML = `
        <div class="qc-batch-id" style="font-size:var(--text-sm);color:var(--neutral-500);">${d.code}</div>
        <div class="qc-pass-rate" style="font-size:var(--text-base);color:${color};">${d.name}</div>
        <div style="margin-top:4px;">
          <span class="result-chip" style="background:${color};color:#fff;">${d.severity}</span>
          <span style="font-size:0.75rem;color:var(--neutral-500);margin-left:6px;">Stage: ${stages}</span>
        </div>
        <details style="margin-top:8px;font-size:0.8rem;color:var(--neutral-600);">
          <summary style="cursor:pointer;">Corrective action hint</summary>
          <p style="margin-top:4px;">${d.corrective_action_hint || ''}</p>
        </details>
      `;
      grid.appendChild(card);
    });
  }

  // ── Slide Transitions ──────────────────────────────────────────────────────
  function slideFormIn()    { document.getElementById('main-content').classList.add('slide-out');    document.getElementById('form-panel').classList.add('slide-in'); }
  function slideFormOut()   { document.getElementById('main-content').classList.remove('slide-out'); document.getElementById('form-panel').classList.remove('slide-in'); editingNcrId = null; }
  function slideDetailIn()  { document.getElementById('main-content').classList.add('slide-out');    document.getElementById('detail-panel').classList.add('slide-in'); }
  function slideDetailOut() { document.getElementById('main-content').classList.remove('slide-out'); document.getElementById('detail-panel').classList.remove('slide-in'); }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function UI.showSpinner(show) { document.getElementById('spinner').classList.toggle('hidden', !show); }
  function UI.showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  return { init, submitNCR, editNCR, deleteNCR };
})();
