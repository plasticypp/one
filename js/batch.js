(async () => {
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

  content.innerHTML = `
    <div class="batch-no">${batch.batch_no}</div>
    <table class="info-table">
      <tr><td>Product</td><td>${batch.product_id || '—'}</td></tr>
      <tr><td>Production Date</td><td>${batch.production_date || '—'}</td></tr>
      <tr><td>Shift</td><td>${batch.shift || '—'}</td></tr>
      <tr><td>Machine</td><td>${batch.machine_id || '—'}</td></tr>
      <tr><td>QC Status</td><td>${oqcBadge}</td></tr>
      <tr><td>Dispatched</td><td>${dispatchText}</td></tr>
    </table>
    <div class="qr-wrap">
      <div id="qrcode"></div>
      <div class="qr-label">${batchNo}</div>
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
