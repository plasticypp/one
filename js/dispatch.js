const Dispatch = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  let session = null;
  let soCache = [];
  let batchCache = [];
  let selectedSO = null;    // SO object
  let selectedBatch = null; // batch object
  let activeLeftTab = 'orders';

  // ── Init ───────────────────────────────────────────────────────────────────
  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);
    setupHeader();
    setupLeftTabs();
    setupStrip();
    setupFilters();
    await Promise.all([loadSOList(), loadBatches(), loadLog()]);
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
    });
  }

  // ── Left tab switching ─────────────────────────────────────────────────────
  function setupLeftTabs() {
    document.querySelectorAll('.dp-left-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLeftTab = btn.dataset.ltab;
        document.querySelectorAll('.dp-left-tab').forEach(b => b.classList.toggle('active', b === btn));
        document.getElementById('ltab-orders').classList.toggle('hidden', activeLeftTab !== 'orders');
        document.getElementById('ltab-log').classList.toggle('hidden', activeLeftTab !== 'log');
        if (activeLeftTab === 'log') loadLog();
      });
    });
  }

  // ── Filter wiring ──────────────────────────────────────────────────────────
  function setupFilters() {
    document.getElementById('filter-so-status').addEventListener('change', loadSOList);
    document.getElementById('filter-batch-product').addEventListener('change', renderBatches);
    document.getElementById('search-batch').addEventListener('input', renderBatches);
  }

  // ── Sales Orders (left panel) ──────────────────────────────────────────────
  async function loadSOList() {
    const status = document.getElementById('filter-so-status').value;
    UI.showSpinner(true);
    try {
      const res = await Api.get('getSOList', { status });
      soCache = res.success ? res.data : [];
    } catch (e) {
      soCache = [];
    } finally {
      UI.showSpinner(false);
    }
    renderSOList();
  }

  function renderSOList() {
    const el = document.getElementById('so-list');
    if (!soCache.length) {
      el.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px;">No pending orders.</div>';
      return;
    }
    el.innerHTML = '';
    soCache.forEach(so => {
      const age = so.date ? Math.floor((Date.now() - new Date(so.date)) / 86400000) : '—';
      const card = document.createElement('div');
      card.className = 'so-card' + (selectedSO && selectedSO.so_id === so.so_id ? ' selected' : '');
      const qtyOrdered = Number(so.qty_ordered) || 0;
      const qtyDispatched = Number(so.qty_dispatched) || 0;
      const pct = qtyOrdered > 0 ? Math.round((qtyDispatched / qtyOrdered) * 100) : 0;
      card.innerHTML = `
        <div class="so-card-id">${esc(so.so_id)}</div>
        <div class="so-card-customer">${esc(so.customer_name || so.customer_id)}</div>
        <div class="so-card-product">${esc(so.product_name || so.product_id)}</div>
        <div style="margin:6px 0 4px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7280;margin-bottom:3px">
            <span>${qtyDispatched} / ${qtyOrdered} pcs dispatched</span>
            <span>${pct}%</span>
          </div>
          <div style="background:#e5e7eb;border-radius:4px;height:5px;overflow:hidden">
            <div style="background:${pct >= 100 ? '#16a34a' : '#EA580C'};width:${pct}%;height:100%;border-radius:4px;transition:width .3s"></div>
          </div>
        </div>
        <div class="so-card-meta">
          <span>Remaining: <strong>${esc(String(so.qty_remaining ?? so.qty_ordered))}</strong> pcs</span>
          <span>Age: <strong>${age}d</strong></span>
          <span class="status-chip ${so.status === 'Partial' ? 'status-hold' : 'status-pending'}">${esc(so.status)}</span>
        </div>`;
      card.addEventListener('click', () => selectSO(so));
      el.appendChild(card);
    });
  }

  function selectSO(so) {
    if (selectedSO && selectedSO.so_id === so.so_id) {
      // Deselect
      selectedSO = null;
    } else {
      selectedSO = so;
    }
    renderSOList();
    renderBatches();
    updateStrip();
  }

  // ── FG Batches (right panel) ───────────────────────────────────────────────
  async function loadBatches() {
    try {
      const res = await Api.get('getFGBatches');
      batchCache = res.success ? res.data : [];
    } catch (e) {
      batchCache = [];
    }
    // Populate product filter
    const prodSel = document.getElementById('filter-batch-product');
    const seen = new Set();
    prodSel.innerHTML = '<option value="">All Products</option>';
    batchCache.forEach(b => {
      if (!seen.has(b.product_id)) {
        seen.add(b.product_id);
        const o = document.createElement('option');
        o.value = b.product_id;
        o.textContent = b.product_name || b.product_id;
        prodSel.appendChild(o);
      }
    });
    renderBatches();
  }

  function renderBatches() {
    const el = document.getElementById('batch-list');
    const prodFilter = document.getElementById('filter-batch-product').value;
    const search = document.getElementById('search-batch').value.toLowerCase();

    let batches = batchCache;
    if (prodFilter) batches = batches.filter(b => b.product_id === prodFilter);
    if (search) batches = batches.filter(b => b.batch_no.toLowerCase().includes(search));

    if (!batches.length) {
      el.innerHTML = '<div class="dp-right-empty">No OQC-cleared batches available.<br>Check production module.</div>';
      return;
    }

    el.innerHTML = '';
    batches.forEach(b => {
      const isSelected = selectedBatch && selectedBatch.batch_no === b.batch_no;
      const matchesSO = selectedSO && b.product_id === selectedSO.product_id;
      const isDimmed = selectedSO && !matchesSO;

      const card = document.createElement('div');
      card.className = ['batch-card',
        isSelected ? 'selected' : '',
        isDimmed   ? 'dimmed'   : '',
        !isSelected && matchesSO ? 'match' : ''
      ].filter(Boolean).join(' ');

      card.innerHTML = `
        <div class="batch-card-no">${esc(b.batch_no)}</div>
        <div class="batch-card-product">${esc(b.product_name || b.product_id)}</div>
        <div class="batch-card-qty">${esc(String(b.qty))} <span>pcs</span></div>
        <div class="oqc-badge">✓ OQC Cleared</div>
        <div class="batch-card-meta">
          <span>${esc(b.machine_id || '—')}</span>
          <span>${b.age_days != null ? b.age_days + 'd ago' : ''}</span>
          <span>${esc(b.production_date || '')}</span>
        </div>`;
      card.addEventListener('click', () => selectBatch(b));
      el.appendChild(card);
    });
  }

  function selectBatch(b) {
    if (selectedBatch && selectedBatch.batch_no === b.batch_no) {
      selectedBatch = null;
    } else {
      selectedBatch = b;
    }
    renderBatches();
    updateStrip();
  }

  // ── Dispatch strip ─────────────────────────────────────────────────────────
  function setupStrip() {
    document.getElementById('strip-cancel').addEventListener('click', () => {
      selectedSO = null;
      selectedBatch = null;
      renderSOList();
      renderBatches();
      updateStrip();
    });
    document.getElementById('btn-confirm-dispatch').addEventListener('click', confirmDispatch);
    // Default date to today
    document.getElementById('strip-date').value = new Date().toISOString().slice(0, 10);
  }

  function updateStrip() {
    const strip = document.getElementById('dispatch-strip');
    const summary = document.getElementById('strip-summary');
    if (selectedSO && selectedBatch) {
      strip.classList.add('visible');
      const maxQty = Math.min(
        Number(selectedSO.qty_remaining ?? selectedSO.qty_ordered) || 0,
        Number(selectedBatch.qty) || 0
      );
      summary.innerHTML = `
        <strong>${esc(selectedSO.so_id)}</strong> · ${esc(selectedSO.customer_name || selectedSO.customer_id)} · ${esc(selectedSO.product_name || selectedSO.product_id)}<br>
        Batch: <strong>${esc(selectedBatch.batch_no)}</strong> · Available: <strong>${esc(String(selectedBatch.qty))}</strong> pcs · Max dispatch: <strong>${maxQty}</strong> pcs`;
      document.getElementById('strip-qty').max = maxQty;
      if (!document.getElementById('strip-qty').value) {
        document.getElementById('strip-qty').value = maxQty;
      }
    } else {
      strip.classList.remove('visible');
      document.getElementById('strip-error').textContent = '';
    }
  }

  async function confirmDispatch() {
    const errEl = document.getElementById('strip-error');
    errEl.textContent = '';

    const qty = Number(document.getElementById('strip-qty').value);
    const date = document.getElementById('strip-date').value;
    const maxQty = Math.min(
      Number(selectedSO.qty_remaining ?? selectedSO.qty_ordered) || 0,
      Number(selectedBatch.qty) || 0
    );

    if (!qty || qty <= 0) { errEl.textContent = 'Enter a valid dispatch qty.'; return; }
    if (qty > maxQty) { errEl.textContent = `Qty exceeds available (${maxQty} pcs).`; return; }
    if (!date) { errEl.textContent = 'Select a dispatch date.'; return; }

    const payload = {
      so_id:        selectedSO.so_id,
      batch_no:     selectedBatch.batch_no,
      product_id:   selectedSO.product_id,
      qty:          qty,
      dispatch_date: date,
      vehicle_no:   document.getElementById('strip-vehicle').value.trim(),
      driver_name:  document.getElementById('strip-driver').value.trim(),
      invoice_no:   document.getElementById('strip-invoice').value.trim(),
      dispatched_by: session.id,
      userId:       session.id
    };

    UI.showSpinner(true);
    try {
      const res = await Api.post('saveDispatch', payload);
      if (res.success) {
        UI.showToast('Dispatched — ' + res.dispatch_id);
        // Open challan in new tab
        window.open('challan.html?id=' + encodeURIComponent(res.dispatch_id), '_blank');
        // Reset state
        selectedSO = null;
        selectedBatch = null;
        document.getElementById('strip-qty').value = '';
        document.getElementById('strip-vehicle').value = '';
        document.getElementById('strip-driver').value = '';
        document.getElementById('strip-invoice').value = '';
        updateStrip();
        await Promise.all([loadSOList(), loadBatches()]);
      } else {
        const msgs = {
          batch_not_oqc_cleared: 'Batch not OQC-cleared. Perform OQC first.',
          batch_already_dispatched: 'This batch has already been dispatched.',
          batch_not_found: 'Batch not found in system.',
          batch_not_in_fg_stock: 'Batch not found in Finished Goods stock.',
          insufficient_stock: 'Insufficient stock in this batch.',
          invalid_qty: 'Invalid quantity.',
          missing_fields: 'Required fields missing.'
        };
        errEl.textContent = msgs[res.error] || ('Error: ' + (res.error || 'unknown'));
      }
    } catch (e) {
      errEl.textContent = 'Network error — try again.';
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Dispatch log (left panel log tab) ─────────────────────────────────────
  async function loadLog() {
    try {
      const res = await Api.get('getDispatchList', {});
      const rows = res.success ? res.data : [];
      const tbody = document.getElementById('log-tbody');
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;text-align:center;color:#999;">No dispatches yet.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(r => `
        <tr>
          <td style="font-weight:600;">${esc(r.dispatch_id)}</td>
          <td class="text-muted">${String(r.dispatch_date || '').slice(0,10)}</td>
          <td>${esc(r.customer_name || r.so_id)}</td>
          <td><strong>${esc(String(r.qty))}</strong></td>
          <td><button class="btn btn-sm reprint-btn" onclick="Dispatch.reprintChallan('${esc(r.dispatch_id)}')">Reprint</button></td>
        </tr>`).join('');
    } catch (e) {
      document.getElementById('log-tbody').innerHTML = '<tr><td colspan="5" style="padding:20px;text-align:center;color:#c62828;">Failed to load log.</td></tr>';
    }
  }

  function reprintChallan(dispatchId) {
    window.open('challan.html?id=' + encodeURIComponent(dispatchId), '_blank');
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, reprintChallan };
})();
