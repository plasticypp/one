const Complaints = (() => {

  let session = null;
  let cache   = [];
  let statusFilter = 'all';

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

    document.getElementById('new-complaint-btn').addEventListener('click', openForm);
    document.getElementById('complaint-form-back').addEventListener('click', closeForm);
    document.getElementById('complaint-submit-btn').addEventListener('click', submitComplaint);
    document.getElementById('close-complaint-back').addEventListener('click', closeClosePanel);
    document.getElementById('close-submit-btn').addEventListener('click', submitClose);

    document.querySelectorAll('.cc-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cc-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        statusFilter = btn.dataset.status;
        renderTable(cache, statusFilter);
      });
    });

    const canClose = ['director','qmr'].includes(session.role);
    if (!canClose) document.getElementById('new-complaint-btn').classList.add('hidden');

    await loadComplaints();
  }

  // ── Load & Render ─────────────────────────────────────────────────────────

  async function loadComplaints() {
    showSpinner(true);
    try {
      const res = await Api.get('getCustomerComplaints', {});
      cache = res && res.success ? res.data : [];
      renderTable(cache, statusFilter);
    } finally {
      showSpinner(false);
    }
  }

  function renderTable(records, filter) {
    const data = filter && filter !== 'all'
      ? records.filter(r => (r.Status || '') === filter)
      : records;
    const tbody = document.getElementById('complaints-tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="td-loading">No complaints</td></tr>';
      return;
    }
    const canClose = ['director','qmr'].includes(session.role);
    tbody.innerHTML = data.map(r => {
      const isOpen = (r.Status || 'Open') === 'Open';
      const sevClass = r.Severity === 'High' ? 'chip-red' : r.Severity === 'Low' ? 'chip-green' : 'chip-yellow';
      const stClass  = isOpen ? 'chip-yellow' : 'chip-green';
      return `<tr style="cursor:pointer" data-no="${r.ComplaintNo}">
        <td>${r.ComplaintNo || '—'}</td>
        <td>${String(r.DateReceived || '').slice(0, 10)}</td>
        <td>${r.CustomerID || '—'}</td>
        <td class="desc-cell">${r.Description || '—'}</td>
        <td><span class="chip ${sevClass}">${r.Severity || '—'}</span></td>
        <td><span class="chip ${stClass}">${r.Status || 'Open'}</span></td>
        <td>${canClose && isOpen ? `<button class="btn-sm btn-close-cc" data-no="${r.ComplaintNo}">Close</button>` : ''}</td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-close-cc').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); openClosePanel(btn.dataset.no); });
    });

    tbody.querySelectorAll('tr[data-no]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        openDetail(tr.dataset.no);
      });
    });
  }

  // ── New Complaint Form ────────────────────────────────────────────────────

  async function openForm() {
    const custRes = await Api.get('getMasterDropdown', { entity: 'Customers' });
    const custs   = custRes && custRes.success ? custRes.data : [];
    const prodRes = await Api.get('getMasterDropdown', { entity: 'Products' });
    const prods   = prodRes && prodRes.success ? prodRes.data : [];

    document.getElementById('cf-customer').innerHTML =
      '<option value="">— select customer —</option>' +
      custs.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.getElementById('cf-product').innerHTML =
      '<option value="">— select product —</option>' +
      prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    document.getElementById('cf-contact').value     = '';
    document.getElementById('cf-batch').value       = '';
    document.getElementById('cf-type').value        = '';
    document.getElementById('cf-description').value = '';
    document.getElementById('cf-severity').value    = 'Medium';
    document.getElementById('cf-invoice-ref').value = '';
    document.getElementById('cf-ack-sent').value    = 'No';
    document.getElementById('cf-remarks').value     = '';

    document.getElementById('complaint-form-panel').classList.add('slide-in');
    document.getElementById('complaints-list-panel').classList.add('slide-out');
  }

  function closeForm() {
    document.getElementById('complaint-form-panel').classList.remove('slide-in');
    document.getElementById('complaints-list-panel').classList.remove('slide-out');
  }

  async function submitComplaint() {
    const customer_id    = document.getElementById('cf-customer').value;
    const complaint_type = document.getElementById('cf-type').value.trim();
    const description    = document.getElementById('cf-description').value.trim();
    if (!customer_id)    { showToast('Select a customer'); return; }
    if (!complaint_type) { showToast('Enter complaint type'); return; }
    if (!description)    { showToast('Enter description'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('saveCustomerComplaint', {
        customer_id,
        contact_person: document.getElementById('cf-contact').value.trim(),
        batch_no_ref:   document.getElementById('cf-batch').value.trim(),
        product_id:     document.getElementById('cf-product').value,
        complaint_type,
        description,
        severity:       document.getElementById('cf-severity').value,
        invoice_ref:    document.getElementById('cf-invoice-ref').value.trim(),
        ack_sent:       document.getElementById('cf-ack-sent').value,
        remarks:        document.getElementById('cf-remarks').value.trim(),
        userId:         Auth.getUserId()
      });
      if (res && res.success) {
        showToast('Complaint registered: ' + res.complaint_no);
        closeForm();
        await loadComplaints();
      } else {
        showToast('Error: ' + (res && res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Detail Panel ──────────────────────────────────────────────────────────

  function openDetail(complaintNo) {
    const r = cache.find(c => String(c.ComplaintNo) === String(complaintNo));
    if (!r) return;
    document.getElementById('cc-detail-body').innerHTML = `
      <div class="detail-row"><span>Complaint No</span><strong>${r.ComplaintNo}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${String(r.DateReceived || '').slice(0,10)}</strong></div>
      <div class="detail-row"><span>Customer</span><strong>${r.CustomerID || '—'}</strong></div>
      <div class="detail-row"><span>Contact</span><strong>${r.ContactPerson || '—'}</strong></div>
      <div class="detail-row"><span>Batch Ref</span><strong>${r.BatchNoRef || '—'}</strong></div>
      <div class="detail-row"><span>Product</span><strong>${r.ProductID || '—'}</strong></div>
      <div class="detail-row"><span>Type</span><strong>${r.ComplaintType || '—'}</strong></div>
      <div class="detail-row"><span>Description</span><strong>${r.Description || '—'}</strong></div>
      <div class="detail-row"><span>Severity</span><strong>${r.Severity || '—'}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${r.Status || '—'}</strong></div>
      <div class="detail-row"><span>Root Cause</span><strong>${r.RootCause || '—'}</strong></div>
      <div class="detail-row"><span>Corrective Action</span><strong>${r.CorrectiveAction || '—'}</strong></div>
      <div class="detail-row"><span>Closed Date</span><strong>${String(r.ClosedDate || '—').slice(0,10)}</strong></div>
      <div class="detail-row"><span>Remarks</span><strong>${r.Remarks || '—'}</strong></div>
    `;
    document.getElementById('cc-detail-panel').classList.add('slide-in');
    document.getElementById('complaints-list-panel').classList.add('slide-out');
    document.getElementById('cc-detail-back').onclick = () => {
      document.getElementById('cc-detail-panel').classList.remove('slide-in');
      document.getElementById('complaints-list-panel').classList.remove('slide-out');
    };
  }

  // ── Close Panel ───────────────────────────────────────────────────────────

  function openClosePanel(complaintNo) {
    document.getElementById('close-complaint-no').value    = complaintNo;
    document.getElementById('close-display-no').textContent = complaintNo;
    document.getElementById('close-root-cause').value       = '';
    document.getElementById('close-investigation').value    = '';
    document.getElementById('close-action').value           = '';
    document.getElementById('close-response-date').value    = '';
    document.getElementById('close-response-summary').value = '';
    document.getElementById('close-customer-acceptance').value = '';
    document.getElementById('close-complaint-panel').classList.add('slide-in');
    document.getElementById('complaints-list-panel').classList.add('slide-out');
  }

  function closeClosePanel() {
    document.getElementById('close-complaint-panel').classList.remove('slide-in');
    document.getElementById('complaints-list-panel').classList.remove('slide-out');
  }

  async function submitClose() {
    const complaint_no     = document.getElementById('close-complaint-no').value;
    const root_cause       = document.getElementById('close-root-cause').value.trim();
    const corrective_action = document.getElementById('close-action').value.trim();
    if (!root_cause)        { showToast('Root cause required'); return; }
    if (!corrective_action) { showToast('Corrective action required'); return; }
    showSpinner(true);
    try {
      const res = await Api.post('closeCustomerComplaint', {
        complaint_no,
        root_cause,
        investigation:       document.getElementById('close-investigation').value.trim(),
        corrective_action,
        response_date:       document.getElementById('close-response-date').value,
        response_summary:    document.getElementById('close-response-summary').value.trim(),
        customer_acceptance: document.getElementById('close-customer-acceptance').value,
        userId:              Auth.getUserId()
      });
      if (res && res.success) {
        if (res.capa_id) showToast('Complaint closed — CAPA auto-created: ' + res.capa_id);
        else showToast('Complaint closed');
        closeClosePanel();
        await loadComplaints();
      } else {
        showToast('Error: ' + (res && res.error || 'close failed'));
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

  return { init };
})();
