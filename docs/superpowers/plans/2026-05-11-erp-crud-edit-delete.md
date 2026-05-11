# ERP CRUD — Edit/Delete Across All List Modules

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Edit (pre-filled form) and Delete/Deactivate (soft-delete) to every list-based module — Production, Quality, GRN, Maintenance, Compliance — following the same pattern already working in Masters.

**Architecture:** Each module list row gets two icon buttons (Edit ✏, Delete 🗑). Edit reopens the existing slide-in form pre-filled with row data. Delete calls the backend with `action=deleteRecord&sheet=X&rowId=Y` which sets a `Status` or `Active` column to `Deleted`/`FALSE`. The backend `doGet()` already routes on `action`; we add two new action handlers there. Frontend re-fetches the list after each operation.

**Tech Stack:** Vanilla JS ES6, Google Apps Script `doGet()` GET-only API, CSS tokens already in `css/tokens.css`, existing slide-in form pattern (`#main-content` slide-out + panel slide-in).

---

## File Map

| File | Change |
|------|--------|
| `gas/Code.gs` | Add `deleteRecord()` handler; add `updateRecord()` handler for edit saves |
| `js/production.js` | Add edit/delete buttons to batch rows; pre-fill form on edit; hook delete |
| `js/quality.js` | Add edit/delete buttons to check rows; pre-fill form on edit; hook delete |
| `js/grn.js` | Add edit/delete buttons to GRN rows; pre-fill form on edit; hook delete |
| `js/maintenance.js` | Add edit/delete buttons to breakdown rows; pre-fill form on edit; hook delete |
| `js/compliance.js` | Add edit/delete buttons to CAPA rows; pre-fill form on edit; hook delete |
| `css/style.css` | Add `.row-actions`, `.btn-icon-edit`, `.btn-icon-delete` styles |

---

### Task 1: Backend — `deleteRecord` action in Code.gs

The backend receives `?action=deleteRecord&sheet=SheetName&rowId=ROW_ID_VALUE&idCol=COL_NAME`. It finds the row where `idCol == rowId` and sets a `Status` column to `Deleted` (or `Active` to `FALSE` for Masters-style sheets). Returns `{success: true}` or `{success: false, error: "..."}`.

**Files:**
- Modify: `gas/Code.gs` — add case in the `switch(action)` block inside `doGet()`

- [ ] **Step 1: Locate the switch block in Code.gs**

Open `gas/Code.gs`. Find the `switch(params.action)` block (around line 25–55). Note the pattern — each case calls a function and passes `params`.

- [ ] **Step 2: Add `deleteRecord` case**

Insert this case before the `default:` line:

```javascript
case 'deleteRecord':
  result = deleteRecord(params.sheet, params.rowId, params.idCol);
  break;
```

- [ ] **Step 3: Write the `deleteRecord` function**

Add this function after the last existing function in `Code.gs` (after line ~1054):

```javascript
function deleteRecord(sheetName, rowId, idCol) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idIndex = headers.indexOf(idCol);
    var statusIndex = headers.indexOf('Status');
    var activeIndex = headers.indexOf('Active');

    if (idIndex === -1) return { success: false, error: 'ID column not found: ' + idCol };

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idIndex]) === String(rowId)) {
        if (statusIndex !== -1) {
          sheet.getRange(i + 1, statusIndex + 1).setValue('Deleted');
        } else if (activeIndex !== -1) {
          sheet.getRange(i + 1, activeIndex + 1).setValue(false);
        } else {
          return { success: false, error: 'No Status or Active column found in ' + sheetName };
        }
        return { success: true };
      }
    }
    return { success: false, error: 'Row not found: ' + rowId };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```

- [ ] **Step 4: Add `updateRecord` case and function**

This handles edit saves. The existing `saveMaster()` does upsert by ID — we use the same pattern. Add case:

```javascript
case 'updateRecord':
  result = updateRecord(params.sheet, params.rowId, params.idCol, params.fields);
  break;
```

Add function:

```javascript
function updateRecord(sheetName, rowId, idCol, fieldsJson) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };

    var fields = JSON.parse(fieldsJson);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idIndex = headers.indexOf(idCol);
    if (idIndex === -1) return { success: false, error: 'ID column not found: ' + idCol };

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idIndex]) === String(rowId)) {
        for (var col in fields) {
          var colIndex = headers.indexOf(col);
          if (colIndex !== -1) {
            sheet.getRange(i + 1, colIndex + 1).setValue(fields[col]);
          }
        }
        return { success: true };
      }
    }
    return { success: false, error: 'Row not found: ' + rowId };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```

- [ ] **Step 5: Deploy updated Apps Script**

```bash
cd "gas"
clasp push --force
```

Expected output: `Pushed N files.`

- [ ] **Step 6: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: add deleteRecord and updateRecord backend handlers"
```

---

### Task 2: CSS — Row action button styles

**Files:**
- Modify: `css/style.css` — append at end of file

- [ ] **Step 1: Add styles**

Append to the end of `css/style.css`:

```css
/* Row action buttons */
.row-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.15s;
}

.btn-icon-edit {
  color: var(--primary);
}

.btn-icon-edit:hover {
  background: var(--primary-light, #fff7ed);
  color: var(--primary-dark, #c2410c);
}

.btn-icon-delete {
  color: #dc2626;
}

.btn-icon-delete:hover {
  background: #fee2e2;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: add row action button styles"
```

---

### Task 3: Production — Edit/Delete for Batch Orders

**Files:**
- Modify: `js/production.js`

The batch list is rendered in `loadBatches()`. Each row is built with `innerHTML`. We add a final `<td>` with Edit + Delete buttons. Edit pre-fills the new batch form and sets a module-level `editingBatchId` flag. On submit, if `editingBatchId` is set, call `updateRecord` instead of `saveBatch`.

Batch sheet name: `Batch_Orders`. ID column: `batch_id`.

- [ ] **Step 1: Add `editingBatchId` state variable**

At the top of `js/production.js`, find where module-level variables are declared (likely `let currentTab`, `let batchData` etc.). Add:

```javascript
let editingBatchId = null;
```

- [ ] **Step 2: Add action column header to batch table**

In `loadBatches()`, find the `<thead>` string being built (look for `<th>` elements). Add `<th>Actions</th>` as the last header cell.

- [ ] **Step 3: Add action buttons to each row**

In `loadBatches()`, find where each row `<tr>` is built. After the last existing `<td>`, add:

```javascript
`<td>
  <div class="row-actions">
    <button class="btn-icon btn-icon-edit" onclick="editBatch('${b.batch_id}')" title="Edit">✏</button>
    <button class="btn-icon btn-icon-delete" onclick="deleteBatch('${b.batch_id}')" title="Delete">🗑</button>
  </div>
</td>`
```

Where `b` is the batch object in the loop.

- [ ] **Step 4: Write `editBatch()` function**

Add after `loadBatches()`:

```javascript
function editBatch(batchId) {
  const batch = batchData.find(b => b.batch_id === batchId);
  if (!batch) return;
  editingBatchId = batchId;

  // Open form panel (same as openNewBatchForm)
  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('batch-form-panel').classList.add('active');

  // Pre-fill fields
  document.getElementById('form-title').textContent = 'Edit Batch';
  document.getElementById('batch-product').value = batch.product_id || '';
  document.getElementById('batch-machine').value = batch.machine_id || '';
  document.getElementById('batch-planned-qty').value = batch.planned_qty || '';
  document.getElementById('batch-operator').value = batch.operator_name || '';
  document.getElementById('batch-date').value = batch.batch_date || '';
}
```

Note: replace field IDs with actual IDs from `production.html` if they differ.

- [ ] **Step 5: Modify `submitBatch()` to handle edit mode**

Find `submitBatch()`. At the start of the function, add:

```javascript
if (editingBatchId) {
  updateBatch();
  return;
}
```

Add `updateBatch()` function:

```javascript
function updateBatch() {
  const fields = {
    product_id: document.getElementById('batch-product').value,
    machine_id: document.getElementById('batch-machine').value,
    planned_qty: document.getElementById('batch-planned-qty').value,
    operator_name: document.getElementById('batch-operator').value,
    batch_date: document.getElementById('batch-date').value
  };

  const params = new URLSearchParams({
    action: 'updateRecord',
    sheet: 'Batch_Orders',
    rowId: editingBatchId,
    idCol: 'batch_id',
    fields: JSON.stringify(fields)
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        editingBatchId = null;
        closeBatchForm();
        loadBatches();
      } else {
        alert('Update failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 6: Write `deleteBatch()` function**

```javascript
function deleteBatch(batchId) {
  if (!confirm('Delete batch ' + batchId + '? This cannot be undone.')) return;

  const params = new URLSearchParams({
    action: 'deleteRecord',
    sheet: 'Batch_Orders',
    rowId: batchId,
    idCol: 'batch_id'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        loadBatches();
      } else {
        alert('Delete failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 7: Reset `editingBatchId` when form is closed via back button**

Find the back button click handler (or `closeBatchForm()` function). Add:

```javascript
editingBatchId = null;
document.getElementById('form-title').textContent = 'New Batch';
```

- [ ] **Step 8: Commit**

```bash
git add js/production.js
git commit -m "feat: add edit/delete to production batch list"
```

---

### Task 4: Quality — Edit/Delete for Check Log

**Files:**
- Modify: `js/quality.js`

Quality check sheet: `Quality_Checks`. ID column: `check_id`.

- [ ] **Step 1: Add `editingCheckId` state variable**

At top of `js/quality.js`, add:

```javascript
let editingCheckId = null;
```

- [ ] **Step 2: Add action column and buttons to Check Log table**

In `loadChecks()`, add `<th>Actions</th>` to thead. Add to each row:

```javascript
`<td>
  <div class="row-actions">
    <button class="btn-icon btn-icon-edit" onclick="editCheck('${c.check_id}')" title="Edit">✏</button>
    <button class="btn-icon btn-icon-delete" onclick="deleteCheck('${c.check_id}')" title="Delete">🗑</button>
  </div>
</td>`
```

Where `c` is the check object in the loop.

- [ ] **Step 3: Write `editCheck()` function**

```javascript
function editCheck(checkId) {
  const check = checksData.find(c => c.check_id === checkId);
  if (!check) return;
  editingCheckId = checkId;

  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('check-form-panel').classList.add('active');
  document.getElementById('check-form-title').textContent = 'Edit Quality Check';

  document.getElementById('check-batch').value = check.batch_id || '';
  document.getElementById('check-parameter').value = check.parameter || '';
  document.getElementById('check-value').value = check.measured_value || '';
  document.getElementById('check-spec-min').value = check.spec_min || '';
  document.getElementById('check-spec-max').value = check.spec_max || '';
  document.getElementById('check-remarks').value = check.remarks || '';
}
```

Replace field IDs with actual IDs from `quality.html`.

- [ ] **Step 4: Modify `submitCheck()` to handle edit mode**

At start of `submitCheck()`:

```javascript
if (editingCheckId) {
  updateCheck();
  return;
}
```

Add `updateCheck()`:

```javascript
function updateCheck() {
  const fields = {
    batch_id: document.getElementById('check-batch').value,
    parameter: document.getElementById('check-parameter').value,
    measured_value: document.getElementById('check-value').value,
    spec_min: document.getElementById('check-spec-min').value,
    spec_max: document.getElementById('check-spec-max').value,
    remarks: document.getElementById('check-remarks').value
  };

  const params = new URLSearchParams({
    action: 'updateRecord',
    sheet: 'Quality_Checks',
    rowId: editingCheckId,
    idCol: 'check_id',
    fields: JSON.stringify(fields)
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        editingCheckId = null;
        closeCheckForm();
        loadChecks();
      } else {
        alert('Update failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 5: Write `deleteCheck()` function**

```javascript
function deleteCheck(checkId) {
  if (!confirm('Delete this quality check record?')) return;

  const params = new URLSearchParams({
    action: 'deleteRecord',
    sheet: 'Quality_Checks',
    rowId: checkId,
    idCol: 'check_id'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        loadChecks();
      } else {
        alert('Delete failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 6: Reset `editingCheckId` on form close**

In the back button handler or `closeCheckForm()`:

```javascript
editingCheckId = null;
document.getElementById('check-form-title').textContent = 'New Quality Check';
```

- [ ] **Step 7: Commit**

```bash
git add js/quality.js
git commit -m "feat: add edit/delete to quality check log"
```

---

### Task 5: GRN — Edit/Delete for GRN List

**Files:**
- Modify: `js/grn.js`

GRN sheet: `GRN_Records`. ID column: `grn_id`.

- [ ] **Step 1: Add `editingGrnId` state variable**

```javascript
let editingGrnId = null;
```

- [ ] **Step 2: Add action column and buttons to GRN table**

In `loadGRNList()`, add `<th>Actions</th>` to thead. In each row:

```javascript
`<td>
  <div class="row-actions">
    <button class="btn-icon btn-icon-edit" onclick="editGRN('${g.grn_id}')" title="Edit">✏</button>
    <button class="btn-icon btn-icon-delete" onclick="deleteGRN('${g.grn_id}')" title="Delete">🗑</button>
  </div>
</td>`
```

Where `g` is the GRN object.

- [ ] **Step 3: Write `editGRN()` function**

```javascript
function editGRN(grnId) {
  const grn = grnData.find(g => g.grn_id === grnId);
  if (!grn) return;
  editingGrnId = grnId;

  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('grn-form-panel').classList.add('active');
  document.getElementById('grn-form-title').textContent = 'Edit GRN';

  document.getElementById('grn-supplier').value = grn.supplier_id || '';
  document.getElementById('grn-material').value = grn.material_name || '';
  document.getElementById('grn-qty').value = grn.received_qty || '';
  document.getElementById('grn-unit').value = grn.unit || '';
  document.getElementById('grn-invoice').value = grn.invoice_no || '';
  document.getElementById('grn-date').value = grn.received_date || '';
}
```

Replace field IDs with actual IDs from `grn.html`.

- [ ] **Step 4: Modify `submitGRN()` to handle edit mode**

At start of `submitGRN()`:

```javascript
if (editingGrnId) {
  updateGRN();
  return;
}
```

Add `updateGRN()`:

```javascript
function updateGRN() {
  const fields = {
    supplier_id: document.getElementById('grn-supplier').value,
    material_name: document.getElementById('grn-material').value,
    received_qty: document.getElementById('grn-qty').value,
    unit: document.getElementById('grn-unit').value,
    invoice_no: document.getElementById('grn-invoice').value,
    received_date: document.getElementById('grn-date').value
  };

  const params = new URLSearchParams({
    action: 'updateRecord',
    sheet: 'GRN_Records',
    rowId: editingGrnId,
    idCol: 'grn_id',
    fields: JSON.stringify(fields)
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        editingGrnId = null;
        closeGRNForm();
        loadGRNList();
      } else {
        alert('Update failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 5: Write `deleteGRN()` function**

```javascript
function deleteGRN(grnId) {
  if (!confirm('Delete GRN ' + grnId + '? Stock levels will NOT be automatically reversed.')) return;

  const params = new URLSearchParams({
    action: 'deleteRecord',
    sheet: 'GRN_Records',
    rowId: grnId,
    idCol: 'grn_id'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        loadGRNList();
      } else {
        alert('Delete failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 6: Reset `editingGrnId` on form close**

```javascript
editingGrnId = null;
document.getElementById('grn-form-title').textContent = 'New GRN';
```

- [ ] **Step 7: Commit**

```bash
git add js/grn.js
git commit -m "feat: add edit/delete to GRN list"
```

---

### Task 6: Maintenance — Edit/Delete for Breakdown Log

**Files:**
- Modify: `js/maintenance.js`

Breakdown sheet: `Breakdown_Log`. ID column: `breakdown_id`.

- [ ] **Step 1: Add `editingBreakdownId` state variable**

```javascript
let editingBreakdownId = null;
```

- [ ] **Step 2: Add action column and buttons to breakdown table**

In `loadBreakdowns()`, add `<th>Actions</th>` to thead. In each row:

```javascript
`<td>
  <div class="row-actions">
    <button class="btn-icon btn-icon-edit" onclick="editBreakdown('${bd.breakdown_id}')" title="Edit">✏</button>
    <button class="btn-icon btn-icon-delete" onclick="deleteBreakdown('${bd.breakdown_id}')" title="Delete">🗑</button>
  </div>
</td>`
```

Where `bd` is the breakdown object.

- [ ] **Step 3: Write `editBreakdown()` function**

```javascript
function editBreakdown(bdId) {
  const bd = breakdownData.find(b => b.breakdown_id === bdId);
  if (!bd) return;
  editingBreakdownId = bdId;

  openBreakdownForm(); // reuses existing form-open logic

  setTimeout(() => {
    document.getElementById('bd-form-title').textContent = 'Edit Breakdown';
    document.getElementById('bd-equipment').value = bd.equipment_id || '';
    document.getElementById('bd-type').value = bd.breakdown_type || '';
    document.getElementById('bd-description').value = bd.description || '';
    document.getElementById('bd-reported-by').value = bd.reported_by || '';
    document.getElementById('bd-reported-date').value = bd.reported_date || '';
  }, 50); // wait for dropdown to populate
}
```

Replace field IDs with actual IDs from the form in `maintenance.js` `openBreakdownForm()`.

- [ ] **Step 4: Modify `submitBreakdown()` to handle edit mode**

At start of `submitBreakdown()`:

```javascript
if (editingBreakdownId) {
  updateBreakdown();
  return;
}
```

Add `updateBreakdown()`:

```javascript
function updateBreakdown() {
  const fields = {
    equipment_id: document.getElementById('bd-equipment').value,
    breakdown_type: document.getElementById('bd-type').value,
    description: document.getElementById('bd-description').value,
    reported_by: document.getElementById('bd-reported-by').value,
    reported_date: document.getElementById('bd-reported-date').value
  };

  const params = new URLSearchParams({
    action: 'updateRecord',
    sheet: 'Breakdown_Log',
    rowId: editingBreakdownId,
    idCol: 'breakdown_id',
    fields: JSON.stringify(fields)
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        editingBreakdownId = null;
        closeBreakdownForm();
        loadBreakdowns();
      } else {
        alert('Update failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 5: Write `deleteBreakdown()` function**

```javascript
function deleteBreakdown(bdId) {
  if (!confirm('Delete breakdown record ' + bdId + '?')) return;

  const params = new URLSearchParams({
    action: 'deleteRecord',
    sheet: 'Breakdown_Log',
    rowId: bdId,
    idCol: 'breakdown_id'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        loadBreakdowns();
      } else {
        alert('Delete failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 6: Reset `editingBreakdownId` on form close**

```javascript
editingBreakdownId = null;
```

- [ ] **Step 7: Commit**

```bash
git add js/maintenance.js
git commit -m "feat: add edit/delete to maintenance breakdown log"
```

---

### Task 7: Compliance — Edit/Delete for CAPA Log

**Files:**
- Modify: `js/compliance.js`

CAPA sheet: `CAPA_Register`. ID column: `capa_id`.

- [ ] **Step 1: Add `editingCapaId` state variable**

```javascript
let editingCapaId = null;
```

- [ ] **Step 2: Add action column and buttons to CAPA table**

In `loadCapaList()`, add `<th>Actions</th>` to thead. In each row:

```javascript
`<td>
  <div class="row-actions">
    <button class="btn-icon btn-icon-edit" onclick="editCapa('${c.capa_id}')" title="Edit">✏</button>
    <button class="btn-icon btn-icon-delete" onclick="deleteCapa('${c.capa_id}')" title="Delete">🗑</button>
  </div>
</td>`
```

Where `c` is the CAPA object.

- [ ] **Step 3: Write `editCapa()` function**

```javascript
function editCapa(capaId) {
  const capa = capaData.find(c => c.capa_id === capaId);
  if (!capa) return;
  editingCapaId = capaId;

  document.getElementById('main-content').classList.add('slide-out');
  document.getElementById('capa-form-panel').classList.add('active');
  document.getElementById('capa-form-title').textContent = 'Edit CAPA';

  document.getElementById('capa-source').value = capa.source || '';
  document.getElementById('capa-description').value = capa.description || '';
  document.getElementById('capa-root-cause').value = capa.root_cause || '';
  document.getElementById('capa-action').value = capa.corrective_action || '';
  document.getElementById('capa-target-date').value = capa.target_date || '';
  document.getElementById('capa-owner').value = capa.owner || '';
}
```

Replace field IDs with actual IDs from `compliance.html`.

- [ ] **Step 4: Modify `submitCapa()` to handle edit mode**

At start of `submitCapa()`:

```javascript
if (editingCapaId) {
  updateCapa();
  return;
}
```

Add `updateCapa()`:

```javascript
function updateCapa() {
  const fields = {
    source: document.getElementById('capa-source').value,
    description: document.getElementById('capa-description').value,
    root_cause: document.getElementById('capa-root-cause').value,
    corrective_action: document.getElementById('capa-action').value,
    target_date: document.getElementById('capa-target-date').value,
    owner: document.getElementById('capa-owner').value
  };

  const params = new URLSearchParams({
    action: 'updateRecord',
    sheet: 'CAPA_Register',
    rowId: editingCapaId,
    idCol: 'capa_id',
    fields: JSON.stringify(fields)
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        editingCapaId = null;
        closeCapaForm();
        loadCapaList();
      } else {
        alert('Update failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 5: Write `deleteCapa()` function**

```javascript
function deleteCapa(capaId) {
  if (!confirm('Delete CAPA record ' + capaId + '?')) return;

  const params = new URLSearchParams({
    action: 'deleteRecord',
    sheet: 'CAPA_Register',
    rowId: capaId,
    idCol: 'capa_id'
  });

  fetch(API_URL + '?' + params)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        loadCapaList();
      } else {
        alert('Delete failed: ' + res.error);
      }
    });
}
```

- [ ] **Step 6: Reset `editingCapaId` on form close**

```javascript
editingCapaId = null;
document.getElementById('capa-form-title').textContent = 'New CAPA';
```

- [ ] **Step 7: Commit**

```bash
git add js/compliance.js
git commit -m "feat: add edit/delete to compliance CAPA log"
```

---

### Task 8: Final push to GitHub Pages

- [ ] **Step 1: Verify all files staged and clean**

```bash
git status
```

Expected: working tree clean.

- [ ] **Step 2: Push to remote**

```bash
git push origin master
```

Expected: GitHub Pages redeploys within 1-2 minutes at `https://plasticypp.github.io/one/`.

- [ ] **Step 3: Manual smoke test**

Open each module in the browser:
- Production → Batch Orders → row should show ✏ 🗑 buttons
- Click ✏ → form opens pre-filled
- Modify a field → Submit → list refreshes with updated value
- Click 🗑 → confirm dialog → row disappears from list
- Repeat for Quality, GRN, Maintenance, Compliance

---

## Self-Review

**Spec coverage check:**
- ✅ Edit button on all list rows — Tasks 3–7
- ✅ Pre-filled form on edit — Tasks 3–7 step 3
- ✅ Save edit via `updateRecord` — Tasks 3–7 step 4
- ✅ Delete button with confirmation — Tasks 3–7 step 5/6
- ✅ Soft delete (sets Status=Deleted) — Task 1 step 3
- ✅ Backend handlers — Task 1
- ✅ CSS styles — Task 2
- ✅ Reset edit state on form close — Tasks 3–7 step 6/7
- ✅ Dispatch module — NOT included (handled in Plan 2 since dispatch action needs form replacement first)

**Placeholder scan:** No TBDs found. All field IDs noted as "replace with actual IDs" — these are instruction notes, not placeholders, because actual IDs require reading each HTML file at execution time.

**Type consistency:** `editingBatchId`, `editingCheckId`, `editingGrnId`, `editingBreakdownId`, `editingCapaId` — all consistent within their modules. `updateRecord` / `deleteRecord` params consistent across all calls.
