(async () => {
  function esc(v) {
    if (v === null || v === undefined) return '—';
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  const params   = new URLSearchParams(window.location.search);
  const batchNo  = params.get('batch');
  const printMode = params.get('print') === '1';
  const content  = document.getElementById('content');

  if (!batchNo) {
    content.innerHTML = '<div class="not-found"><strong>No batch specified.</strong>Scan a YPP product label to view batch info.</div>';
    return;
  }

  let res;
  try {
    res = await Api.get('getBatchRecord', { batch_no: batchNo });
  } catch (e) {
    content.innerHTML = '<div class="not-found"><strong>Connection error.</strong>Could not reach the YPP server. Please try again.</div>';
    return;
  }

  if (!res.success || !res.data || !res.data.batch) {
    content.innerHTML = '<div class="not-found"><strong>Batch not found.</strong><span>' + batchNo + '</span></div>';
    return;
  }

  const { batch, quality_checks, dispatch } = res.data;

  const oqcBadge = batch.oqc_status === 'OK'
    ? '<span class="badge badge-ok">OQC PASSED</span>'
    : batch.oqc_status === 'NG'
    ? '<span class="badge badge-ng">OQC FAILED</span>'
    : '<span class="badge badge-pending">Pending QC</span>';

  const labelUrl = 'https://plasticypp.github.io/one/batch.html?batch=' + encodeURIComponent(batchNo);

  const dispatchText = dispatch
    ? (dispatch.dispatch_date || '—') + (dispatch.so_id ? ' (SO: ' + dispatch.so_id + ')' : '')
    : 'Not yet dispatched';

  const qcRows = quality_checks.length
    ? quality_checks.map(q => `
        <tr>
          <td>${esc(String(q.check_date || '').slice(0,10))}</td>
          <td>${esc(q.check_type)}</td>
          <td>${esc(q.parameter)}</td>
          <td>${esc(q.result_value)}</td>
          <td>${esc(q.result)}</td>
          <td>${esc(q.checked_by)}</td>
        </tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:12px;">No quality checks recorded</td></tr>';

  const dispSection = dispatch
    ? `<table class="info-table">
        <tr><td>Dispatch Date</td><td>${esc(dispatch.dispatch_date)}</td></tr>
        <tr><td>Sales Order</td><td>${esc(dispatch.so_id)}</td></tr>
        <tr><td>Customer</td><td>${esc(dispatch.customer_id)}</td></tr>
        <tr><td>Qty Dispatched</td><td>${esc(dispatch.qty_dispatched)}</td></tr>
        <tr><td>Vehicle No</td><td>${esc(dispatch.vehicle_no)}</td></tr>
      </table>`
    : '<p style="color:#6b7280;font-size:0.9rem;margin:0;">Not yet dispatched</p>';

  content.innerHTML = `
    <div class="batch-no">${esc(batch.batch_no)}</div>

    <h3 class="section-heading">Production Details</h3>
    <table class="info-table">
      <tr><td>Product</td><td>${esc(batch.product_id)}</td></tr>
      <tr><td>Production Date</td><td>${esc(batch.production_date)}</td></tr>
      <tr><td>Shift</td><td>${esc(batch.shift)}</td></tr>
      <tr><td>Machine</td><td>${esc(batch.machine_id)}</td></tr>
      <tr><td>Qty Produced</td><td>${esc(batch.qty_produced)}</td></tr>
      <tr><td>OQC Status</td><td>${oqcBadge}</td></tr>
    </table>

    <h3 class="section-heading">Quality Checks</h3>
    <div style="overflow-x:auto;">
      <table class="info-table" style="font-size:0.82rem;">
        <thead><tr style="background:#f9fafb;">
          <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;border-bottom:1px solid #f0f0f0;">Date</th>
          <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;border-bottom:1px solid #f0f0f0;">Type</th>
          <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;border-bottom:1px solid #f0f0f0;">Parameter</th>
          <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;border-bottom:1px solid #f0f0f0;">Value</th>
          <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;border-bottom:1px solid #f0f0f0;">Result</th>
          <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;border-bottom:1px solid #f0f0f0;">By</th>
        </tr></thead>
        <tbody>${qcRows}</tbody>
      </table>
    </div>

    <h3 class="section-heading">Dispatch</h3>
    ${dispSection}

    <div class="qr-wrap">
      <div id="qrcode"></div>
      <div class="qr-label">${esc(batchNo)}</div>
    </div>
    <div class="no-print" style="text-align:center;margin-top:16px;">
      <button class="print-btn" onclick="window.print()">Print Label</button>
    </div>
  `;

  new QRCode(document.getElementById('qrcode'), {
    text: labelUrl,
    width: 180,
    height: 180,
    colorDark: '#1a1a1a',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  if (printMode) {
    setTimeout(() => window.print(), 800);
  }
})();
