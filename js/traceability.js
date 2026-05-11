const Traceability = (() => {
  function showSpinner(v) { document.getElementById('spinner').classList.toggle('hidden', !v); }
  function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type === 'error' ? ' error' : '');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
  function esc(v) { return (v == null ? '—' : String(v)).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function fmt(v) { return v ? new Date(v).toLocaleDateString() : '—'; }

  async function search() {
    const q = document.getElementById('trace-search').value.trim();
    if (!q) { showToast('Enter a batch number or lot number', 'error'); return; }
    showSpinner(true);
    document.getElementById('trace-results').classList.add('hidden');
    document.getElementById('trace-empty').classList.add('hidden');
    try {
      const res = await Api.get('getBatchTraceabilitySearch', { q });
      if (!res || !res.success || !res.data) {
        document.getElementById('trace-empty').classList.remove('hidden');
        return;
      }
      renderResults(res.data);
    } catch (e) {
      showToast('Search failed: ' + e.message, 'error');
    } finally {
      showSpinner(false);
    }
  }

  function renderResults(d) {
    // Batch Order
    const bo = d.batch_order || {};
    document.getElementById('trace-batch-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-row"><span>Batch No</span><strong>${esc(d.batch_no)}</strong></div>
        <div class="detail-row"><span>Product</span><strong>${esc(bo.product_name || bo.product_id)}</strong></div>
        <div class="detail-row"><span>Planned Qty</span><strong>${esc(bo.planned_qty)} pcs</strong></div>
        <div class="detail-row"><span>Status</span><strong>${esc(bo.status)}</strong></div>
        <div class="detail-row"><span>Start Date</span><strong>${fmt(bo.start_date)}</strong></div>
        <div class="detail-row"><span>End Date</span><strong>${fmt(bo.end_date)}</strong></div>
        <div class="detail-row"><span>Machine</span><strong>${esc(bo.machine_id)}</strong></div>
        <div class="detail-row"><span>Supervisor</span><strong>${esc(bo.supervisor_id)}</strong></div>
      </div>`;

    // RM Lots
    const rmRows = d.rm_lots || [];
    document.getElementById('trace-rm-tbody').innerHTML = rmRows.length
      ? rmRows.map(r => `<tr>
          <td>${esc(r.lot_no)}</td>
          <td>${esc(r.material)}</td>
          <td>${esc(r.supplier_name || r.supplier_id)}</td>
          <td>${esc(r.qty_kg)}</td>
          <td><span class="status-chip ${iqcClass(r.iqc_status)}">${esc(r.iqc_status || 'Pending')}</span></td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty-cell">No RM lots linked</td></tr>';

    // Production Params
    const params = d.prod_log || [];
    document.getElementById('trace-params-tbody').innerHTML = params.length
      ? params.map(r => `<tr>
          <td>${fmt(r.log_time)}</td>
          <td>${esc(r.zone1_temp)}</td>
          <td>${esc(r.zone2_temp)}</td>
          <td>${esc(r.blow_pressure)}</td>
          <td>${esc(r.cycle_time)}</td>
          <td>${esc(r.parison_weight)}</td>
          <td>${esc(r.operator_id)}</td>
        </tr>`).join('')
      : '<tr><td colspan="7" class="empty-cell">No production params logged</td></tr>';

    // Quality Checks
    const qcs = d.quality_checks || [];
    document.getElementById('trace-qc-tbody').innerHTML = qcs.length
      ? qcs.map(r => `<tr>
          <td>${esc(r.check_id)}</td>
          <td>${esc(r.check_type)}</td>
          <td>${fmt(r.check_date)}</td>
          <td>${esc(r.inspector_id)}</td>
          <td><span class="status-chip ${qcClass(r.overall_result)}">${esc(r.overall_result)}</span></td>
          <td>${esc(r.remarks)}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-cell">No quality checks found</td></tr>';

    // NCRs
    const ncrs = d.ncrs || [];
    document.getElementById('trace-ncr-tbody').innerHTML = ncrs.length
      ? ncrs.map(r => `<tr>
          <td>${esc(r.ncr_id)}</td>
          <td>${fmt(r.ncr_date)}</td>
          <td>${esc(r.defect_type)}</td>
          <td><span class="status-chip ${severityClass(r.severity)}">${esc(r.severity)}</span></td>
          <td>${esc(r.status)}</td>
          <td>${r.capa_id ? `<a href="compliance.html" style="color:var(--color-primary)">${esc(r.capa_id)}</a>` : '—'}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-cell">No NCRs found</td></tr>';

    // Dispatch
    const dispatches = d.dispatch || [];
    document.getElementById('trace-dispatch-tbody').innerHTML = dispatches.length
      ? dispatches.map(r => `<tr>
          <td>${esc(r.dispatch_id)}</td>
          <td>${fmt(r.dispatch_date)}</td>
          <td>${esc(r.customer_name || r.customer_id)}</td>
          <td>${esc(r.qty)}</td>
          <td>${esc(r.vehicle_no)}</td>
          <td>${esc(r.driver_name)}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-cell">No dispatch records found</td></tr>';

    document.getElementById('trace-results').classList.remove('hidden');
  }

  function iqcClass(s) {
    if (!s || s === 'Pending') return 'status-pending';
    if (s === 'Accept') return 'status-approved';
    if (s === 'Reject') return 'status-rejected';
    return 'status-hold';
  }
  function qcClass(s) {
    if (!s) return '';
    if (s === 'Pass') return 'status-approved';
    if (s === 'Fail') return 'status-rejected';
    return 'status-pending';
  }
  function severityClass(s) {
    if (!s) return '';
    if (s === 'Critical') return 'status-rejected';
    if (s === 'Major') return 'status-hold';
    return 'status-pending';
  }

  async function init() {
    document.getElementById('back-to-app').addEventListener('click', () => { window.location.href = 'index.html'; });
    document.getElementById('trace-search-btn').addEventListener('click', search);
    document.getElementById('trace-search').addEventListener('keydown', e => { if (e.key === 'Enter') search(); });

    // Pre-fill from URL param
    const urlQ = new URLSearchParams(location.search).get('q');
    if (urlQ) {
      document.getElementById('trace-search').value = urlQ;
      await search();
    }
  }

  return { init };
})();
