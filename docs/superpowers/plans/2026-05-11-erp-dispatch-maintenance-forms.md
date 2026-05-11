# ERP — Replace Modal Prompts with Proper Forms (Dispatch + Maintenance)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `window.prompt()` calls in Dispatch (dispatch action) and Maintenance (resolve breakdown) with proper slide-in form panels, and add Edit/Delete to the Dispatch Sales Order list.

**Architecture:** Both modules currently use `window.prompt()` for critical data entry (dispatch qty/invoice; resolution notes/date). These become dedicated form panels using the same slide-in pattern already established (`#main-content slide-out` + panel `.active`). Dispatch gets a second form panel for the dispatch action (separate from the SO creation form). Maintenance gets a resolve form panel. Both panels hook into existing backend handlers (`saveDispatch`, `resolveBreakdown`).

**Tech Stack:** Vanilla JS ES6, Google Apps Script GET-only API, existing CSS slide-in pattern.

---

## File Map

| File | Change |
|------|--------|
| `dispatch.html` | Add `#dispatch-action-panel` slide-in form HTML |
| `js/dispatch.js` | Replace `dispatchAction()` prompt logic with form open/submit; add edit/delete for SO list |
| `maintenance.html` | Add `#resolve-panel` slide-in form HTML |
| `js/maintenance.js` | Replace `resolveBreakdown()` prompt logic with form open/submit |
| `gas/Code.gs` | Add `updateRecord` and `deleteRecord` if not already added by Plan 1 |

---

### Task 1: Dispatch — Add dispatch action form panel to HTML

The dispatch action currently fires `window.prompt()` for qty and invoice. We replace this with a slide-in panel containing a proper form.

**Files:**
- Modify: `dispatch.html`

- [ ] **Step 1: Locate where form panels are in dispatch.html**

Open `dispatch.html`. Find the existing `#so-form-panel` div (the Sales Order creation form). Note its structure — it will be the template for the new panel.

- [ ] **Step 2: Add `#dispatch-action-panel` after `#so-form-panel`**

Insert the following HTML immediately after the closing `</div>` of `#so-form-panel`:

```html
<!-- Dispatch Action Panel -->
<div id="dispatch-action-panel" class="form-panel">
  <div class="form-panel-header">
    <button class="back-btn" id="dispatch-action-back-btn" aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h2 class="form-panel-title">Dispatch Sales Order</h2>
  </div>
  <div class="form-panel-body">
    <input type="hidden" id="dispatch-so-id">
    <div class="form-group">
      <label class="form-label">SO #</label>
      <input type="text" id="dispatch-so-display" class="form-input" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Customer</label>
      <input type="text" id="dispatch-customer-display" class="form-input" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Product</label>
      <input type="text" id="dispatch-product-display" class="form-input" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">SO Qty (ordered)</label>
      <input type="number" id="dispatch-so-qty-display" class="form-input" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Dispatch Qty *</label>
      <input type="number" id="dispatch-qty" class="form-input" placeholder="Enter quantity to dispatch" required min="1">
    </div>
    <div class="form-group">
      <label class="form-label">Invoice No *</label>
      <input type="text" id="dispatch-invoice" class="form-input" placeholder="e.g. INV-2024-001" required>
    </div>
    <div class="form-group">
      <label class="form-label">Dispatch Date *</label>
      <input type="date" id="dispatch-date" class="form-input" required>
    </div>
    <div class="form-group">
      <label class="form-label">Vehicle / LR No</label>
      <input type="text" id="dispatch-vehicle" class="form-input" placeholder="Optional">
    </div>
    <button class="btn btn-primary btn-full" onclick="submitDispatchAction()">Confirm Dispatch</button>
  </div>
</div>
```

- [ ] **Step 3: Commit HTML**

```bash
git add dispatch.html
git commit -m "feat: add dispatch action form panel to dispatch.html"
```

---

### Task 2: Dispatch — Wire up dispatch action form in JS

**Files:**
- Modify: `js/dispatch.js`

- [ ] **Step 1: Add state variables at top of dispatch.js**

```javascript
let dispatchingSOId = null;
let soListData = [];
let editingSOId = null;
```

- [ ] **Step 2: Store list data when loaded**

In `loadSOList()`, after building the table rows, store the raw data:

```javascript
soListData = data; // where `data` is the array returned by the API
```

If `data` is built from a response object, store before the loop:

```javascript
soListData = res.data || [];
```

- [ ] **Step 3: Replace `dispatchAction()` with form-opening version**

Find the existing `dispatchAction(soId)` function and replace its entire body:

```javascript
function dispatchAction(soId) {
  const so = soListData.find(s => s.so_id === soId);
  if (!so) return;
  dispatchingSOId = soId;

  // Populate read-only display fields
  document.getElementById('dispatch-so-id').value = soId;
  document.getElementById('dispatch-so-display').value = soId;
  document.getElementById('dispatch-customer-display').value = so.customer_name || so.customer_id || '';
  document.getElementById('dispatch-product-display').value = so.product_name || so.product_id || '';
  document.getElementById('dispatch-so-qty-display').value = so.qty || '';

  // Set today's date
  document.getElementById('dispatch-date').value = new Date().toISOString().split('T')[0];

  // Clear entry fields
  document.getElementById('dispatch-qty').value = '';
  document.getElementById('dispatch-invoice').value = '';
  document.getElementById('dispatch-vehicle').value = '';

  // Open panel
  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('dispatch-action-panel').classList.add('active');
}
```

- [ ] **Step 4: Write `submitDispatchAction()` function**

```javascript
function submitDispatchAction() {
  const qty = document.getElementById('dispatch-qty').value.trim();
  const invoice = document.getElementById('dispatch-invoice').value.trim();
  const date = document.getElementById('dispatch-date').value;
  const vehicle = document.getElementById('dispatch-vehicle').value.trim();

  if (!qty || isNaN(qty) || Number(qty) <= 0) {
    alert('Enter a valid dispatch quantity.');
    return;
  }
  if (!invoice) {
    alert('Invoice number is required.');
    return;
  }
  if (!date) {
    alert('Dispatch date is required.');
    return;
  }

  const params = new URLSearchParams({
    action: 'saveDispatch',
    so_id: dispatchingSOId,
    qty_dispatched: qty,
    invoice_no: invoice,
    dispatch_date: date,
    vehicle_lr: vehicle
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        dispatchingSOId = null;
        closeDispatchActionPanel();
        loadSOList();
        loadDispatchLog();
      } else {
        alert('Dispatch failed: ' + res.error);
      }
    })
    .catch(e => alert('Network error: ' + e.message));
}
```

- [ ] **Step 5: Write `closeDispatchActionPanel()` and wire back button**

```javascript
function closeDispatchActionPanel() {
  document.getElementById('dispatch-action-panel').classList.remove('active');
  document.getElementById('main-content').classList.remove('slide-out');
  dispatchingSOId = null;
}
```

In the `DOMContentLoaded` or init block, add:

```javascript
document.getElementById('dispatch-action-back-btn').addEventListener('click', closeDispatchActionPanel);
```

- [ ] **Step 6: Add Edit/Delete to SO list**

Add `editingSOId = null;` at top (already in Step 1).

In `loadSOList()`, add `<th>Actions</th>` to thead. In each row:

```javascript
`<td>
  <div class="row-actions">
    <button class="btn-icon btn-icon-edit" onclick="editSO('${s.so_id}')" title="Edit">✏</button>
    <button class="btn-icon btn-icon-delete" onclick="deleteSO('${s.so_id}')" title="Delete">🗑</button>
  </div>
</td>`
```

- [ ] **Step 7: Write `editSO()`, `updateSO()`, `deleteSO()` functions**

```javascript
function editSO(soId) {
  const so = soListData.find(s => s.so_id === soId);
  if (!so) return;
  editingSOId = soId;

  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('so-form-panel').classList.add('active');
  document.getElementById('so-form-title').textContent = 'Edit Sales Order';

  document.getElementById('so-customer').value = so.customer_id || '';
  document.getElementById('so-product').value = so.product_id || '';
  document.getElementById('so-qty').value = so.qty || '';
  document.getElementById('so-date').value = so.so_date || '';
  document.getElementById('so-po-ref').value = so.po_ref || '';
}

function updateSO() {
  const fields = {
    customer_id: document.getElementById('so-customer').value,
    product_id: document.getElementById('so-product').value,
    qty: document.getElementById('so-qty').value,
    so_date: document.getElementById('so-date').value,
    po_ref: document.getElementById('so-po-ref').value
  };

  const params = new URLSearchParams({
    action: 'updateRecord',
    sheet: 'Sales_Orders',
    rowId: editingSOId,
    idCol: 'so_id',
    fields: JSON.stringify(fields)
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        editingSOId = null;
        closeSOForm();
        loadSOList();
      } else {
        alert('Update failed: ' + res.error);
      }
    });
}

function deleteSO(soId) {
  if (!confirm('Delete Sales Order ' + soId + '?')) return;

  const params = new URLSearchParams({
    action: 'deleteRecord',
    sheet: 'Sales_Orders',
    rowId: soId,
    idCol: 'so_id'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        loadSOList();
      } else {
        alert('Delete failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 8: Modify `submitSO()` to handle edit mode**

At the top of `submitSO()`:

```javascript
if (editingSOId) {
  updateSO();
  return;
}
```

- [ ] **Step 9: Commit**

```bash
git add js/dispatch.js
git commit -m "feat: replace dispatch prompt with form; add SO edit/delete"
```

---

### Task 3: Maintenance — Add resolve form panel to HTML

**Files:**
- Modify: `maintenance.html`

- [ ] **Step 1: Locate form panels in maintenance.html**

Open `maintenance.html`. Find `#breakdown-form-panel`. Note its structure.

- [ ] **Step 2: Add `#resolve-panel` after `#breakdown-form-panel`**

```html
<!-- Resolve Breakdown Panel -->
<div id="resolve-panel" class="form-panel">
  <div class="form-panel-header">
    <button class="back-btn" id="resolve-back-btn" aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h2 class="form-panel-title">Resolve Breakdown</h2>
  </div>
  <div class="form-panel-body">
    <input type="hidden" id="resolve-bd-id">
    <div class="form-group">
      <label class="form-label">Breakdown ID</label>
      <input type="text" id="resolve-bd-display" class="form-input" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Equipment</label>
      <input type="text" id="resolve-equipment-display" class="form-input" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Resolution Notes *</label>
      <textarea id="resolve-notes" class="form-input" rows="3" placeholder="Describe what was done to fix the issue" required></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Resolved By *</label>
      <input type="text" id="resolve-by" class="form-input" placeholder="Name of technician" required>
    </div>
    <div class="form-group">
      <label class="form-label">Resolved Date *</label>
      <input type="date" id="resolve-date" class="form-input" required>
    </div>
    <div class="form-group">
      <label class="form-label">Spare Parts Used</label>
      <input type="text" id="resolve-spares" class="form-input" placeholder="Optional — list parts replaced">
    </div>
    <div class="form-group">
      <label class="form-label">Downtime (hours)</label>
      <input type="number" id="resolve-downtime" class="form-input" placeholder="Optional" min="0" step="0.5">
    </div>
    <button class="btn btn-primary btn-full" onclick="submitResolve()">Mark as Resolved</button>
  </div>
</div>
```

- [ ] **Step 3: Commit HTML**

```bash
git add maintenance.html
git commit -m "feat: add resolve breakdown form panel to maintenance.html"
```

---

### Task 4: Maintenance — Wire up resolve form in JS

**Files:**
- Modify: `js/maintenance.js`

- [ ] **Step 1: Add state variables at top of maintenance.js**

```javascript
let resolvingBdId = null;
let breakdownData = [];
```

If `breakdownData` already exists, skip the second line.

- [ ] **Step 2: Store list data when loaded**

In `loadBreakdowns()`, before the loop that builds HTML rows, store:

```javascript
breakdownData = data; // the raw array from API response
```

- [ ] **Step 3: Replace `resolveBreakdown()` with form-opening version**

Find the existing `resolveBreakdown(bdId)` function and replace its entire body:

```javascript
function resolveBreakdown(bdId) {
  const bd = breakdownData.find(b => b.breakdown_id === bdId);
  if (!bd) return;
  resolvingBdId = bdId;

  document.getElementById('resolve-bd-id').value = bdId;
  document.getElementById('resolve-bd-display').value = bdId;
  document.getElementById('resolve-equipment-display').value = bd.equipment_name || bd.equipment_id || '';
  document.getElementById('resolve-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('resolve-notes').value = '';
  document.getElementById('resolve-by').value = '';
  document.getElementById('resolve-spares').value = '';
  document.getElementById('resolve-downtime').value = '';

  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('resolve-panel').classList.add('active');
}
```

- [ ] **Step 4: Write `submitResolve()` function**

```javascript
function submitResolve() {
  const notes = document.getElementById('resolve-notes').value.trim();
  const resolvedBy = document.getElementById('resolve-by').value.trim();
  const resolvedDate = document.getElementById('resolve-date').value;

  if (!notes) { alert('Resolution notes are required.'); return; }
  if (!resolvedBy) { alert('Resolved by is required.'); return; }
  if (!resolvedDate) { alert('Resolved date is required.'); return; }

  const params = new URLSearchParams({
    action: 'resolveBreakdown',
    breakdown_id: resolvingBdId,
    resolution_notes: notes,
    resolved_by: resolvedBy,
    resolved_date: resolvedDate,
    spares_used: document.getElementById('resolve-spares').value.trim(),
    downtime_hrs: document.getElementById('resolve-downtime').value || '0'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        resolvingBdId = null;
        closeResolvePanel();
        loadBreakdowns();
      } else {
        alert('Resolve failed: ' + res.error);
      }
    })
    .catch(e => alert('Network error: ' + e.message));
}
```

- [ ] **Step 5: Write `closeResolvePanel()` and wire back button**

```javascript
function closeResolvePanel() {
  document.getElementById('resolve-panel').classList.remove('active');
  document.getElementById('main-content').classList.remove('slide-out');
  resolvingBdId = null;
}
```

In `DOMContentLoaded` or init block:

```javascript
document.getElementById('resolve-back-btn').addEventListener('click', closeResolvePanel);
```

- [ ] **Step 6: Update `resolveBreakdown` backend handler to accept new fields**

Open `gas/Code.gs`. Find `resolveBreakdown()` function (around line 314). Add columns for `spares_used` and `downtime_hrs` if the sheet has those columns. The existing function should map params — add:

```javascript
// In the resolveBreakdown() function, after setting resolution notes:
if (params.spares_used !== undefined) {
  var sparesIndex = headers.indexOf('spares_used');
  if (sparesIndex !== -1) sheet.getRange(rowNum, sparesIndex + 1).setValue(params.spares_used);
}
if (params.downtime_hrs !== undefined) {
  var downtimeIndex = headers.indexOf('downtime_hrs');
  if (downtimeIndex !== -1) sheet.getRange(rowNum, downtimeIndex + 1).setValue(Number(params.downtime_hrs));
}
```

If the existing handler uses a fixed column layout (not header lookup), add the values to the row array in the correct positions matching the `Breakdown_Log` sheet schema.

- [ ] **Step 7: Commit**

```bash
git add js/maintenance.js gas/Code.gs
git commit -m "feat: replace resolve prompt with form; add downtime/spares fields"
```

---

### Task 5: Push and smoke test

- [ ] **Step 1: Push**

```bash
git push origin master
```

- [ ] **Step 2: Smoke test Dispatch**

1. Open `https://plasticypp.github.io/one/` → Dispatch module → Sales Orders tab
2. Find a Pending SO → click Dispatch button → verify form panel slides in with pre-filled SO details
3. Enter qty, invoice, date → click Confirm Dispatch → verify list refreshes, SO status changes
4. No `window.prompt()` should appear at any point

- [ ] **Step 3: Smoke test Maintenance**

1. Open Maintenance module → Breakdowns tab
2. Find an Open breakdown → click Resolve button → verify resolve form slides in
3. Enter resolution notes, resolved by, date → click Mark as Resolved → verify breakdown status changes to Closed

- [ ] **Step 4: Final commit if any fixes applied**

```bash
git add -A
git commit -m "fix: smoke test corrections for dispatch/maintenance forms"
git push origin master
```
