# Wave 4 — Stock + Dispatch + Batch Traceability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire batch traceability as the ERP spine — auto-creating `BatchTraceability` records from quality checks, enforcing OQC clearance at dispatch, generating QR-coded labels, and exposing a public `batch.html` page customers can scan.

**Architecture:** `saveQualityCheck` in Code.gs auto-upserts a `BatchTraceability` sheet row on first encounter of a `batch_id`; OQC stage updates `oqc_status`. `saveDispatch` is extended with `batch_no`, `polybag_qty`, and `label_url`. `batch.html` is a public no-auth page reading `getBatchRecord`. `js/grn.js` is wired to real GAS endpoints with stock levels driven by `getRMStock`.

**Tech Stack:** Google Apps Script (Code.gs), vanilla JS modules (IIFE pattern), HTML/CSS matching existing pages, qrcode.js via CDN for QR rendering, `clasp push --force` for GAS deploy.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `gas/Code.gs` | Modify | Add `ensureSheet`, KB consts, `upsertBatchTraceability`, `getBatchRecord`, `getRMStock`; update `saveQualityCheck`, `saveGRN`, `getGRNList`, `saveDispatch`, `doGet` routing |
| `js/grn.js` | Modify | Wire `saveGRN`/`getGRNList` to real endpoints; add stock levels tab driven by `getRMStock` |
| `js/dispatch.js` | Modify | Replace free-text batch field with batch selection panel; add polybag qty; generate + print QR label |
| `batch.html` | Create | Public batch info page (no auth); URL param `?batch=YPP-B2503-001` |
| `js/batch.js` | Create | Reads `getBatchRecord`, renders thread info + QR code via qrcode.js CDN |

---

## Task 1: Add `ensureSheet` helper + KB consts + `doGet` routing stubs

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Add `ensureSheet` helper** — insert after the `getSheet` function (line ~1147):

```javascript
function ensureSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}
```

- [ ] **Step 2: Add KB constants** — insert near top of Code.gs, after the opening comment block (before `validateSession`):

```javascript
// ── Wave 4 KB Constants ──────────────────────────────────────────────────────

const SUPPLIERS_KB = [
  { id: 'S001', name: 'Primary HDPE Supplier', category: 'RM', items: ['HDPE Resin'] },
  { id: 'S002', name: 'Alternate HDPE Supplier', category: 'RM', items: ['HDPE Resin'] },
  { id: 'S003', name: 'Masterbatch Supplier', category: 'RM', items: ['Masterbatch'] },
  { id: 'S004', name: 'Carton Supplier', category: 'Packaging', items: ['Cartons'] },
  { id: 'S005', name: 'Label Supplier', category: 'Label', items: ['Labels'] }
];

const PACKAGING_SPECS_KB = [
  { product_id: 'PRD001', product_name: 'CAN-5L',    polybag_qty: 1, marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] },
  { product_id: 'PRD002', product_name: 'BTL-1L',    polybag_qty: 6, marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] },
  { product_id: 'PRD003', product_name: 'BTL-200ML', polybag_qty: 12, marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] },
  { product_id: 'PRD004', product_name: 'BTL-100ML', polybag_qty: 24, marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] }
];

const LABEL_SPECS_KB = [
  { product_id: 'PRD001', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] },
  { product_id: 'PRD002', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] },
  { product_id: 'PRD003', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] },
  { product_id: 'PRD004', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] }
];

const BOM_KB = [
  { product_id: 'PRD001', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.5 }] },
  { product_id: 'PRD002', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.12 }] },
  { product_id: 'PRD003', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.025 }] },
  { product_id: 'PRD004', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.013 }] }
];
```

> Note: qty_per_unit_kg values are placeholder estimates — Yash Poly Pack must confirm actual values. Replace before production use.

- [ ] **Step 3: Add `doGet` routing** for new actions — insert inside the `doGet` function, before the `return respond({ success: false, error: 'unknown_action' })` line:

```javascript
    if (action === 'getBatchRecord')  return respond(getBatchRecord(e.parameter));
    if (action === 'getOQCBatchList') return respond(getOQCBatchList());
    if (action === 'getRMStock')      return respond(getRMStock());
    if (action === 'getSuppliers')    return respond(getSuppliers());
```

- [ ] **Step 4: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: add ensureSheet helper, Wave 4 KB consts, doGet routing stubs"
```

---

## Task 2: `upsertBatchTraceability` + update `saveQualityCheck`

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Add `upsertBatchTraceability`** — insert after `saveQualityCheck` (after line ~1016):

```javascript
function upsertBatchTraceability(data) {
  const BT_HEADERS = ['batch_no','product_id','production_date','shift','machine_id','mould_id','rm_lot_no','oqc_status','dispatch_id','created_at'];
  const sheet = ensureSheet('BatchTraceability', BT_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const batchNoIdx = headers.indexOf('batch_no');
  const oqcIdx     = headers.indexOf('oqc_status');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][batchNoIdx]) === String(data.batch_no)) {
      // Row exists — update oqc_status if this is an OQC check
      if (data.stage === 'OQC' && data.result) {
        sheet.getRange(i + 1, oqcIdx + 1).setValue(data.result);
      }
      return;
    }
  }

  // New batch — insert row
  sheet.appendRow([
    data.batch_no,
    data.product_id || '',
    data.production_date || new Date().toISOString().slice(0, 10),
    data.shift || '',
    data.machine_id || '',
    data.mould_id || '',
    data.rm_lot_no || '',
    data.stage === 'OQC' ? (data.result || '') : '',
    '',
    new Date().toISOString()
  ]);
}
```

- [ ] **Step 2: Update `saveQualityCheck`** — add the `upsertBatchTraceability` call at the end of the function, before the `return` statement. Replace:

```javascript
  return { success: true, check_id: checkId, result };
```

with:

```javascript
  upsertBatchTraceability({
    batch_no:        data.batch_id,
    product_id:      data.product_id || '',
    production_date: data.check_date || today,
    shift:           data.shift || '',
    machine_id:      data.machine_id || '',
    mould_id:        data.mould_id || '',
    rm_lot_no:       data.rm_lot_no || '',
    stage:           stage,
    result:          result
  });
  return { success: true, check_id: checkId, result };
```

- [ ] **Step 3: Deploy and verify**

```bash
cd gas && clasp push --force
```

Expected output: `Pushed 2 files.`

Open the GAS editor → run `saveQualityCheck` manually with a test payload including `batch_id: 'YPP-B2503-TEST'`, `stage: 'IQC'`. Check that a `BatchTraceability` sheet row is created. Run again with `stage: 'OQC'`, `result: 'OK'` — verify `oqc_status` column updates to `OK`.

- [ ] **Step 4: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: upsertBatchTraceability + hook into saveQualityCheck"
```

---

## Task 3: `getBatchRecord` + `getOQCBatchList` + `getRMStock` + `getSuppliers`

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Add `getBatchRecord`** — insert after `upsertBatchTraceability`:

```javascript
function getBatchRecord(params) {
  const batchNo = params.batch_no;
  if (!batchNo) return { success: false, error: 'batch_no required' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // BatchTraceability row
  const btSheet = ss.getSheetByName('BatchTraceability');
  if (!btSheet) return { success: false, error: 'not_found' };
  const btRows = btSheet.getDataRange().getValues();
  const btHeaders = btRows[0];
  let batch = null;
  for (let i = 1; i < btRows.length; i++) {
    const obj = rowToObj(btHeaders, btRows[i]);
    if (String(obj.batch_no) === String(batchNo)) { batch = obj; break; }
  }
  if (!batch) return { success: false, error: 'not_found' };

  // Quality checks for this batch
  const qcSheet = ss.getSheetByName('QualityChecks');
  let qcData = [];
  if (qcSheet) {
    const qcRows = qcSheet.getDataRange().getValues();
    const qcHeaders = qcRows[0];
    qcData = qcRows.slice(1)
      .map(r => rowToObj(qcHeaders, r))
      .filter(r => String(r.batch_id) === String(batchNo));
  }

  // Dispatch info
  const dispSheet = ss.getSheetByName('Dispatch');
  let dispData = null;
  if (dispSheet && batch.dispatch_id) {
    const dispRows = dispSheet.getDataRange().getValues();
    const dispHeaders = dispRows[0];
    for (let i = 1; i < dispRows.length; i++) {
      const obj = rowToObj(dispHeaders, dispRows[i]);
      if (String(obj.dispatch_id) === String(batch.dispatch_id)) { dispData = obj; break; }
    }
  }

  return { success: true, data: { batch, quality_checks: qcData, dispatch: dispData } };
}
```

- [ ] **Step 2: Add `getOQCBatchList`** — insert after `getBatchRecord`:

```javascript
function getOQCBatchList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('BatchTraceability');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1)
    .map(r => rowToObj(headers, r))
    .filter(r => r.oqc_status === 'OK' && !r.dispatch_id);
  return { success: true, data };
}
```

- [ ] **Step 3: Add `getRMStock`** — insert after `getOQCBatchList`:

```javascript
function getRMStock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sum GRN receipts per material from RMStock sheet
  const rmSheet = ss.getSheetByName('RMStock');
  const received = {};
  if (rmSheet) {
    const rows = rmSheet.getDataRange().getValues();
    const headers = rows[0];
    rows.slice(1).forEach(r => {
      const obj = rowToObj(headers, r);
      const mat = obj.material || '';
      received[mat] = (received[mat] || 0) + (Number(obj.qty_kg) || 0);
    });
  }

  // Sum BOM consumption: qty_per_unit_kg × batch count per product
  const btSheet = ss.getSheetByName('BatchTraceability');
  const consumed = {};
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHeaders = btRows[0];
    btRows.slice(1).forEach(r => {
      const obj = rowToObj(btHeaders, r);
      const bom = BOM_KB.find(b => b.product_id === obj.product_id);
      if (!bom) return;
      bom.rm_items.forEach(item => {
        consumed[item.material] = (consumed[item.material] || 0) + item.qty_per_unit_kg;
      });
    });
  }

  // Build result: all materials that appear in either received or consumed
  const allMaterials = new Set([...Object.keys(received), ...Object.keys(consumed)]);
  const data = Array.from(allMaterials).map(mat => ({
    material: mat,
    received_kg: received[mat] || 0,
    consumed_kg: consumed[mat] || 0,
    stock_kg: (received[mat] || 0) - (consumed[mat] || 0),
    low_stock: ((received[mat] || 0) - (consumed[mat] || 0)) < 100
  }));

  return { success: true, data };
}
```

- [ ] **Step 4: Add `getSuppliers`** — insert after `getRMStock`:

```javascript
function getSuppliers() {
  return { success: true, data: SUPPLIERS_KB };
}
```

- [ ] **Step 5: Deploy**

```bash
cd gas && clasp push --force
```

Expected: `Pushed 2 files.`

- [ ] **Step 6: Test `getBatchRecord`** via browser URL:
`<GAS_DEPLOY_URL>?action=getBatchRecord&batch_no=YPP-B2503-TEST`
Expected: `{"success":true,"data":{"batch":{...},"quality_checks":[...],"dispatch":null}}`

- [ ] **Step 7: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: getBatchRecord, getOQCBatchList, getRMStock, getSuppliers"
```

---

## Task 4: Update `saveGRN` to write `RMStock` sheet + update `getGRNList`

**Files:**
- Modify: `gas/Code.gs`

The existing `saveGRN` writes to a `GRN` sheet and calls `updateStock` (which writes to a `Stock` sheet with material_id as key). Wave 4 adds a parallel `RMStock` sheet using the spec schema (date, grn_id, supplier_id, material, lot_no, qty_kg) and updates the role check to include `store_dispatch`.

- [ ] **Step 1: Update `saveGRN`** — replace the existing function body:

```javascript
function saveGRN(data) {
  var authError = requireRole(data, ['director','supervisor','store_dispatch','store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['supplier_id','material','qty_kg','date']);
  if (fieldError) return { success: false, error: fieldError };

  const RM_HEADERS = ['date','grn_id','supplier_id','material','lot_no','qty_kg'];
  const sheet = ensureSheet('RMStock', RM_HEADERS);
  const rows = sheet.getDataRange().getValues();

  // Warn on duplicate lot_no (non-blocking)
  const lotNo = data.lot_no || '';
  const dupLot = lotNo && rows.slice(1).some(r => String(r[4]) === String(lotNo));

  const rowCount = rows.length;
  const today = new Date().toISOString().slice(0, 10);
  const mm = today.slice(2, 4) + today.slice(5, 7);
  const grnId = 'GRN-' + mm + '-' + String(rowCount).padStart(3, '0');

  sheet.appendRow([
    data.date || today,
    grnId,
    data.supplier_id,
    data.material,
    lotNo,
    Number(data.qty_kg)
  ]);

  return { success: true, grn_id: grnId, warning: dupLot ? 'duplicate_lot_no' : null };
}
```

- [ ] **Step 2: Update `getGRNList`** — replace the existing function body to read from `RMStock`:

```javascript
function getGRNList(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('RMStock');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params.supplier_id) {
    data = data.filter(r => String(r.supplier_id) === String(params.supplier_id));
  }
  return { success: true, data };
}
```

- [ ] **Step 3: Deploy**

```bash
cd gas && clasp push --force
```

- [ ] **Step 4: Test** — call `saveGRN` with payload `{ supplier_id: 'S001', material: 'HDPE Resin', qty_kg: 500, date: '2026-05-11', lot_no: 'LOT-001', userId: '<valid_user_id>' }`. Verify `RMStock` sheet gets a new row. Call `getGRNList` and confirm the row appears.

- [ ] **Step 5: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: saveGRN writes RMStock sheet, getGRNList reads RMStock"
```

---

## Task 5: Update `saveDispatch` to require batch + add `batch_no`, `polybag_qty`, `label_url` fields

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Update `saveDispatch`** — replace the role check line and the `dispSheet.appendRow` call. The full updated function:

```javascript
function saveDispatch(data) {
  var authError = requireRole(data, ['director','supervisor','store_dispatch','store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['so_id','qty','batch_no']);
  if (fieldError) return { success: false, error: fieldError };

  const qty = Number(data.qty);
  if (!Number.isFinite(qty) || qty <= 0) return { success: false, error: 'invalid_qty' };

  // Enforce OQC clearance
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const btSheet = ss.getSheetByName('BatchTraceability');
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHeaders = btRows[0];
    const batchRow = btRows.slice(1).map(r => rowToObj(btHeaders, r))
      .find(r => String(r.batch_no) === String(data.batch_no));
    if (!batchRow) return { success: false, error: 'batch_not_found' };
    if (batchRow.oqc_status !== 'OK') return { success: false, error: 'batch_not_oqc_cleared' };
    if (batchRow.dispatch_id) return { success: false, error: 'batch_already_dispatched' };
  }

  // Check available FG stock
  const fgSheet = ss.getSheetByName('FinishedGoods');
  if (fgSheet) {
    const fgRows = fgSheet.getDataRange().getValues();
    const totalAvailable = fgRows.slice(1)
      .filter(r => String(r[2]) === String(data.product_id) && r[6] === 'Available')
      .reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
    if (totalAvailable < qty) return { success: false, error: 'insufficient_stock' };
  }

  const dispSheet = ensureSheet('Dispatch', ['dispatch_id','so_id','dispatch_date','qty','vehicle_no','driver_name','dispatched_by','batch_no','polybag_qty','label_url']);
  const dispRows = dispSheet.getDataRange().getValues();
  const rowCount = dispRows.length;
  const dispatch_id = 'DIS' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  const label_url = 'https://plasticypp.github.io/one/batch.html?batch=' + encodeURIComponent(data.batch_no);

  dispSheet.appendRow([
    dispatch_id,
    data.so_id,
    data.dispatch_date || today,
    qty,
    data.vehicle_no || '',
    data.driver_name || '',
    data.dispatched_by || '',
    data.batch_no,
    Number(data.polybag_qty) || 0,
    label_url
  ]);

  // Update BatchTraceability with dispatch_id
  if (btSheet) {
    const btRows2 = btSheet.getDataRange().getValues();
    const btHeaders2 = btRows2[0];
    const dispIdIdx = btHeaders2.indexOf('dispatch_id');
    for (let i = 1; i < btRows2.length; i++) {
      if (String(btRows2[i][btHeaders2.indexOf('batch_no')]) === String(data.batch_no)) {
        btSheet.getRange(i + 1, dispIdIdx + 1).setValue(dispatch_id);
        break;
      }
    }
  }

  // Update SalesOrders qty_dispatched + status
  const soSheet = ss.getSheetByName('SalesOrders');
  if (soSheet) {
    const soRows = soSheet.getDataRange().getValues();
    for (let i = 1; i < soRows.length; i++) {
      if (String(soRows[i][0]) === String(data.so_id)) {
        const qtyOrdered    = Number(soRows[i][4]) || 0;
        const qtyDispatched = (Number(soRows[i][5]) || 0) + qty;
        soSheet.getRange(i + 1, 6).setValue(qtyDispatched);
        soSheet.getRange(i + 1, 7).setValue(qtyDispatched >= qtyOrdered ? 'Dispatched' : 'Partial');
        break;
      }
    }
  }

  return { success: true, dispatch_id, label_url };
}
```

- [ ] **Step 2: Deploy**

```bash
cd gas && clasp push --force
```

- [ ] **Step 3: Test** — call `saveDispatch` with a batch_no that has `oqc_status !== 'OK'`. Expect `{ success: false, error: 'batch_not_oqc_cleared' }`. Then test with a valid OQC-cleared batch — expect `{ success: true, dispatch_id: 'DIS...', label_url: 'https://plasticypp.github.io/one/batch.html?batch=...' }`.

- [ ] **Step 4: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: saveDispatch — batch OQC gate, batch_no/polybag_qty/label_url, BatchTraceability link"
```

---

## Task 6: Wire `js/grn.js` — real GRN endpoints + stock levels tab

**Files:**
- Modify: `js/grn.js`

The existing `grn.js` uses `getMasterDropdown` for suppliers and `getStockList` for materials. Wave 4 replaces these with `getSuppliers` (KB-driven) and adds the Stock Levels tab driven by `getRMStock`.

- [ ] **Step 1: Replace `loadSuppliers`** in `js/grn.js` — find the existing `loadSuppliers` function and replace it:

```javascript
async function loadSuppliers() {
  const res = await Api.get('getSuppliers');
  supplierCache = res.success ? res.data : [];
  const sel = document.getElementById('filter-supplier');
  if (sel) {
    sel.innerHTML = '<option value="">All Suppliers</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name + ' (' + s.category + ')';
      sel.appendChild(o);
    });
    sel.addEventListener('change', loadGRNList);
  }
  // Also populate form supplier dropdown
  const formSel = document.getElementById('field-supplier-id');
  if (formSel) {
    formSel.innerHTML = '<option value="">— select supplier —</option>';
    supplierCache.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      formSel.appendChild(o);
    });
  }
}
```

- [ ] **Step 2: Replace `submitGRN`** to send the fields the new `saveGRN` expects:

```javascript
async function submitGRN() {
  const supplier_id = document.getElementById('field-supplier-id')?.value?.trim();
  const material    = document.getElementById('field-material')?.value?.trim();
  const qty_kg      = document.getElementById('field-qty-kg')?.value?.trim();
  const lot_no      = document.getElementById('field-lot-no')?.value?.trim();
  const date        = document.getElementById('field-date')?.value?.trim();

  if (!supplier_id || !material || !qty_kg) {
    showToast('Supplier, material and qty are required', 'error'); return;
  }

  const res = await Api.post('saveGRN', {
    supplier_id, material, qty_kg: Number(qty_kg), lot_no, date,
    userId: session.id
  });

  if (!res.success) { showToast(res.error || 'Save failed', 'error'); return; }
  if (res.warning === 'duplicate_lot_no') showToast('Warning: duplicate lot no — saved anyway', 'warning');
  else showToast('GRN saved — ' + res.grn_id, 'success');
  slideFormOut();
  await loadGRNList();
}
```

- [ ] **Step 3: Add `loadStockLevels`** function:

```javascript
async function loadStockLevels() {
  const res = await Api.get('getRMStock');
  const rows = res.success ? res.data : [];
  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="4" class="td-empty">No stock data</td></tr>'; return; }
  tbody.innerHTML = rows.map(r => `
    <tr class="${r.low_stock ? 'row-warning' : ''}">
      <td>${r.material}</td>
      <td>${r.received_kg.toFixed(1)}</td>
      <td>${r.consumed_kg.toFixed(1)}</td>
      <td class="${r.low_stock ? 'text-warning' : ''}">${r.stock_kg.toFixed(1)} kg${r.low_stock ? ' ⚠' : ''}</td>
    </tr>`).join('');
}
```

- [ ] **Step 4: Wire `loadStockLevels` into tab switching** — find where tab switching happens in `grn.js` (look for `data-pane="stock"` or similar click handler) and call `loadStockLevels()` when the stock tab is activated:

```javascript
// In the tab switching handler, add:
if (pane === 'stock') await loadStockLevels();
```

- [ ] **Step 5: Update `grn.html`** — verify the Stock Levels pane has a `<tbody id="stock-tbody">` and columns: Material | Received (kg) | Consumed (kg) | Current Stock. If missing, add:

```html
<!-- Inside #pane-stock -->
<div class="table-wrap">
  <table class="data-table">
    <thead>
      <tr>
        <th>Material</th>
        <th>Received (kg)</th>
        <th>Consumed (kg)</th>
        <th>Current Stock</th>
      </tr>
    </thead>
    <tbody id="stock-tbody">
      <tr><td colspan="4" class="td-loading">Loading…</td></tr>
    </tbody>
  </table>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add js/grn.js grn.html
git commit -m "feat: grn.js — getSuppliers KB, saveGRN new schema, stock levels tab via getRMStock"
```

---

## Task 7: Update `js/dispatch.js` — batch selection panel + polybag qty + QR label print

**Files:**
- Modify: `js/dispatch.js`

- [ ] **Step 1: Add `loadOQCBatches`** function to fetch dispatch-eligible batches:

```javascript
async function loadOQCBatches() {
  const res = await Api.get('getOQCBatchList');
  return res.success ? res.data : [];
}
```

- [ ] **Step 2: Add `openBatchSelectPanel`** — shows a slide-in panel listing OQC-cleared batches:

```javascript
async function openBatchSelectPanel(soId, productId) {
  dispatchingSOId = soId;
  const batches = await loadOQCBatches();
  const filtered = batches.filter(b => !productId || b.product_id === productId);
  const panel = document.getElementById('batch-select-panel');
  const tbody = document.getElementById('batch-select-tbody');
  tbody.innerHTML = filtered.length
    ? filtered.map(b => `
        <tr>
          <td>${b.batch_no}</td>
          <td>${b.product_id}</td>
          <td>${b.production_date}</td>
          <td><button class="btn btn-sm btn-primary" onclick="Dispatch.selectBatch('${b.batch_no}')">Select</button></td>
        </tr>`).join('')
    : '<tr><td colspan="4" class="td-empty">No OQC-cleared batches available</td></tr>';
  panel.classList.remove('hidden');
}

function selectBatch(batchNo) {
  document.getElementById('field-batch-no').value = batchNo;
  document.getElementById('batch-select-panel').classList.add('hidden');
}
```

- [ ] **Step 3: Update the dispatch form submission** — find the existing dispatch submit handler and update it to include `batch_no`, `polybag_qty`, and open QR label on success:

```javascript
async function submitDispatch() {
  const batch_no   = document.getElementById('field-batch-no')?.value?.trim();
  const polybag_qty = document.getElementById('field-polybag-qty')?.value?.trim();
  const vehicle_no  = document.getElementById('field-vehicle-no')?.value?.trim();
  const driver_name = document.getElementById('field-driver-name')?.value?.trim();
  const qty         = document.getElementById('field-dispatch-qty')?.value?.trim();

  if (!batch_no) { showToast('Select a batch first', 'error'); return; }

  const res = await Api.post('saveDispatch', {
    so_id: dispatchingSOId,
    batch_no, polybag_qty: Number(polybag_qty) || 0,
    vehicle_no, driver_name, qty: Number(qty),
    userId: session.id
  });

  if (!res.success) {
    const msgs = {
      batch_not_oqc_cleared:    'Batch not OQC cleared',
      batch_already_dispatched: 'Batch already dispatched',
      batch_not_found:          'Batch not found',
      insufficient_stock:       'Insufficient finished goods stock'
    };
    showToast(msgs[res.error] || res.error || 'Dispatch failed', 'error');
    return;
  }

  showToast('Dispatched — ' + res.dispatch_id, 'success');
  // Open QR label print page
  const labelUrl = 'batch.html?batch=' + encodeURIComponent(batch_no) + '&print=1';
  window.open(labelUrl, '_blank');
  slideDispatchPanelOut();
  await loadSOList();
}
```

- [ ] **Step 4: Update `dispatch.html`** — add the batch selection panel and new form fields inside the dispatch action panel. Find the existing dispatch form fields and add:

```html
<!-- Batch selection row -->
<div class="form-row">
  <label>Batch</label>
  <div class="flex gap-2">
    <input type="text" id="field-batch-no" placeholder="Batch no" readonly class="flex-1">
    <button class="btn btn-sm btn-secondary" onclick="Dispatch.openBatchSelectPanel(Dispatch.getDispatchingSOId())">Select Batch</button>
  </div>
</div>
<div class="form-row">
  <label>Polybag Qty</label>
  <input type="number" id="field-polybag-qty" min="0" placeholder="e.g. 6">
</div>

<!-- Batch select panel (hidden by default) -->
<div id="batch-select-panel" class="hidden panel-overlay">
  <div class="panel-inner">
    <div class="panel-header">
      <span>Select OQC-Cleared Batch</span>
      <button onclick="document.getElementById('batch-select-panel').classList.add('hidden')">✕</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Batch No</th><th>Product</th><th>Date</th><th></th></tr></thead>
      <tbody id="batch-select-tbody"></tbody>
    </table>
  </div>
</div>
```

- [ ] **Step 5: Expose `getDispatchingSOId` and `openBatchSelectPanel` on the `Dispatch` module** — add to the return object at the bottom of the IIFE:

```javascript
return {
  init,
  loadSOList,
  openBatchSelectPanel,
  getDispatchingSOId: () => dispatchingSOId,
  selectBatch,
  // ... existing exports
};
```

- [ ] **Step 6: Commit**

```bash
git add js/dispatch.js dispatch.html
git commit -m "feat: dispatch — batch selection panel, polybag qty, QR label print on dispatch"
```

---

## Task 8: Create `batch.html` + `js/batch.js` (public batch info page)

**Files:**
- Create: `batch.html`
- Create: `js/batch.js`

- [ ] **Step 1: Create `batch.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YPP — Batch Record</title>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/style.css">
  <style>
    body { max-width: 480px; margin: 0 auto; padding: var(--space-4); font-family: Barlow, sans-serif; }
    .batch-header { text-align: center; padding: var(--space-4) 0; }
    .batch-header img { height: 40px; margin-bottom: var(--space-2); }
    .batch-no { font-size: 1.4rem; font-weight: 700; color: var(--color-primary); }
    .info-table { width: 100%; border-collapse: collapse; margin: var(--space-4) 0; }
    .info-table td { padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); }
    .info-table td:first-child { font-weight: 600; width: 45%; color: var(--color-text-secondary); }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
    .badge-ok { background: #d1fae5; color: #065f46; }
    .badge-ng { background: #fee2e2; color: #991b1b; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .qr-wrap { text-align: center; margin: var(--space-6) 0; }
    .not-found { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="batch-header">
      <div style="font-size:1.1rem;font-weight:700;color:var(--color-primary)">Yash Poly Pack</div>
      <div style="font-size:0.85rem;color:var(--color-text-secondary)">Batch Traceability Record</div>
    </div>
    <div id="content">
      <p style="text-align:center;color:var(--color-text-secondary)">Loading…</p>
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="js/api.js"></script>
  <script src="js/batch.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `js/batch.js`**

```javascript
(async () => {
  const params = new URLSearchParams(window.location.search);
  const batchNo = params.get('batch');
  const printMode = params.get('print') === '1';
  const content = document.getElementById('content');

  if (!batchNo) {
    content.innerHTML = '<div class="not-found">No batch specified.</div>';
    return;
  }

  const res = await Api.get('getBatchRecord', { batch_no: batchNo });

  if (!res.success || !res.data || !res.data.batch) {
    content.innerHTML = '<div class="not-found">Batch not found.<br><small>' + batchNo + '</small></div>';
    return;
  }

  const { batch, quality_checks, dispatch } = res.data;

  const oqcChecks = quality_checks.filter(q => q.stage === 'OQC');
  const oqcPass   = oqcChecks.length > 0 && oqcChecks.every(q => q.result === 'OK');
  const oqcBadge  = batch.oqc_status === 'OK'
    ? '<span class="badge badge-ok">OQC PASSED</span>'
    : batch.oqc_status === 'NG'
    ? '<span class="badge badge-ng">OQC FAILED</span>'
    : '<span class="badge badge-pending">Pending QC</span>';

  const labelUrl = 'https://plasticypp.github.io/one/batch.html?batch=' + encodeURIComponent(batchNo);

  content.innerHTML = `
    <div class="batch-no">${batch.batch_no}</div>
    <table class="info-table">
      <tr><td>Product</td><td>${batch.product_id}</td></tr>
      <tr><td>Production Date</td><td>${batch.production_date}</td></tr>
      <tr><td>Shift</td><td>${batch.shift || '—'}</td></tr>
      <tr><td>Machine</td><td>${batch.machine_id || '—'}</td></tr>
      <tr><td>QC Status</td><td>${oqcBadge}</td></tr>
      <tr><td>Dispatched</td><td>${dispatch ? dispatch.dispatch_date + ' (SO: ' + dispatch.so_id + ')' : 'Not yet dispatched'}</td></tr>
    </table>
    <div class="qr-wrap">
      <div id="qrcode"></div>
      <div style="margin-top:var(--space-2);font-size:0.75rem;color:var(--color-text-secondary)">${batchNo}</div>
    </div>
    <div style="text-align:center" class="no-print">
      <button class="btn btn-secondary" onclick="window.print()">Print Label</button>
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
```

- [ ] **Step 3: Verify `js/api.js` has `Api.get`** — open `js/api.js` and confirm the `get` function signature. `batch.js` calls `Api.get('getBatchRecord', { batch_no })`. If the API module uses a different pattern, adjust accordingly.

- [ ] **Step 4: Test locally** — open `batch.html?batch=YPP-B2503-TEST` in a browser. Expected: batch info table + QR code rendering. Test with unknown batch: expected "Batch not found" message.

- [ ] **Step 5: Commit**

```bash
git add batch.html js/batch.js
git commit -m "feat: batch.html + batch.js — public QR batch traceability page"
```

---

## Task 9: Deploy GAS + push to GitHub + smoke tests

**Files:**
- `gas/Code.gs` (already deployed per-task)

- [ ] **Step 1: Final GAS deploy**

```bash
cd gas && clasp push --force
```

Expected: `Pushed 2 files.`

- [ ] **Step 2: Push to GitHub**

```bash
git push origin master
```

- [ ] **Step 3: Smoke test — GRN flow**
  1. Open `https://plasticypp.github.io/one/grn.html`
  2. Log in as `store_dispatch`
  3. Create a new GRN: supplier S001, material "HDPE Resin", qty_kg 500, lot_no "LOT-2026-001"
  4. Verify GRN History tab shows the new row with GRN-YYMM-NNN id
  5. Switch to Stock Levels tab — verify "HDPE Resin" row shows received_kg ≥ 500

- [ ] **Step 4: Smoke test — quality → batch auto-create**
  1. Open `https://plasticypp.github.io/one/quality.html`
  2. Log a quality check with batch_id "YPP-B2605-001", stage IQC, any parameter
  3. In the GAS spreadsheet, open `BatchTraceability` sheet — verify row created with batch_no = "YPP-B2605-001"
  4. Log an OQC check for same batch_id with result OK — verify `oqc_status` column updates to "OK"

- [ ] **Step 5: Smoke test — dispatch OQC gate**
  1. Open `https://plasticypp.github.io/one/dispatch.html`
  2. Open a Sales Order, click Dispatch
  3. Click "Select Batch" — verify only OQC-cleared batches appear in the panel
  4. Select "YPP-B2605-001", set polybag_qty, confirm dispatch
  5. Verify `Dispatch` sheet has new row with batch_no and label_url columns populated
  6. Verify new tab opens to `batch.html?batch=YPP-B2605-001&print=1`

- [ ] **Step 6: Smoke test — public batch page**
  1. Open `https://plasticypp.github.io/one/batch.html?batch=YPP-B2605-001`
  2. Verify: batch info table renders, QR code renders, OQC badge shows "OQC PASSED"
  3. Scan QR code with phone — verify it opens the same URL
  4. Open `batch.html?batch=UNKNOWN-BATCH` — verify "Batch not found" message

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| `ensureSheet` for auto-create | Task 1 |
| KB consts: SUPPLIERS, PACKAGING_SPECS, LABEL_SPECS, BOM | Task 1 |
| `upsertBatchTraceability` | Task 2 |
| Hook into `saveQualityCheck` | Task 2 |
| `getBatchRecord` | Task 3 |
| `getOQCBatchList` | Task 3 |
| `getRMStock` (GRN sum − BOM consumption) | Task 3 |
| `getSuppliers` | Task 3 |
| `saveGRN` → RMStock sheet | Task 4 |
| `getGRNList` → RMStock | Task 4 |
| `saveDispatch` — OQC gate, batch_no, polybag_qty, label_url | Task 5 |
| BatchTraceability dispatch_id writeback | Task 5 |
| `js/grn.js` supplier dropdown from KB | Task 6 |
| `js/grn.js` stock levels tab | Task 6 |
| `js/dispatch.js` batch selection panel | Task 7 |
| `js/dispatch.js` polybag qty field | Task 7 |
| `js/dispatch.js` QR label print on dispatch | Task 7 |
| `batch.html` public page | Task 8 |
| `js/batch.js` QR render + batch info | Task 8 |
| Roles: store_dispatch allowed for GRN + dispatch | Tasks 4, 5 |
| Error: batch_not_oqc_cleared toast | Task 7 |
| Error: batch_already_dispatched toast | Task 7 |
| Error: batch not found in batch.html | Task 8 |
| Error: duplicate lot_no warning | Task 4 |
| Public batch.html (no auth) | Task 8 — no Auth.get() call |
| Smoke tests | Task 9 |
