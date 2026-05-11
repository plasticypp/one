# Wave 3 — Quality Module Expansion: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire inspection_plans.json / defect_catalogue.json / capa_triggers.json into live ERP, split quality.html into 4 stage-aware tabs (Summary / IQC / IPC / OQC), and build ncr.html from stub into full NCR+defect workflow.

**Architecture:** GAS backend gains 4 new functions (`getInspectionParams`, `saveNCR`, `getNCRList`, `getDefectCatalogue`) plus modifications to `saveQualityCheck` / `getQualityChecks` to carry a `stage` column. Frontend quality.html replaces the single "Check Log" tab with three stage tabs, each calling `getInspectionParams` to load KB-driven parameter buttons. ncr.html gains a full slide-in NCR form, an NCR log table, and a read-only defect catalogue tab; CAPA auto-trigger banner fires when `saveNCR` returns `capa_required: true`.

**Tech Stack:** Google Apps Script (GAS), vanilla JS IIFE modules, HTML/CSS following existing YPP ERP patterns, clasp for deploy.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `gas/Code.gs` | Modify | Add 4 functions; modify saveQualityCheck + getQualityChecks; register new actions in doGet |
| `quality.html` | Modify | Replace 2-tab layout with 4-tab layout (Summary / IQC / IPC / OQC) |
| `js/quality.js` | Modify | Tab routing for 3 stage tabs, stage param on save/load, NG toast with NCR link |
| `ncr.html` | Modify | Replace stub with full NCR page (log table, form panel, detail panel, defect catalogue tab) |
| `js/ncr.js` | Create | NCR module: init, loadNCRs, submitNCR, renderDefectCatalogue, CAPA banner, edit/delete |

---

## Task 1: Backend — add `stage` column to QualityChecks functions

**Files:**
- Modify: `gas/Code.gs` (functions `getQualityChecks` and `saveQualityCheck`, lines ~836–877)

### Context
`QualityChecks` sheet currently has headers:
`check_id | batch_id | check_date | inspector_id | parameter | spec_min | spec_max | actual_value | result | remarks`

We need to append a `stage` column (IQC / IPC / OQC). Existing rows have no value — they default to `IPC`.

- [ ] **Step 1: Modify `getQualityChecks` to accept a `stage` filter**

Replace the existing `getQualityChecks` function body with:

```javascript
function getQualityChecks(params) {
  const sheet = getSheet('QualityChecks');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => rowToObj(headers, row));
  if (params.batch_id) data = data.filter(r => String(r.batch_id) === String(params.batch_id));
  if (params.stage)    data = data.filter(r => (r.stage || 'IPC') === params.stage);
  return { success: true, data };
}
```

- [ ] **Step 2: Modify `saveQualityCheck` to accept and persist `stage`**

Replace the existing `saveQualityCheck` function body with:

```javascript
function saveQualityCheck(data) {
  var authError = requireRole(data, ['director','qmr','supervisor','operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['batch_id','parameter','actual_value']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('QualityChecks');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const checkId = 'QC' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  const specMin = Number(data.spec_min) || 0;
  const specMax = Number(data.spec_max) || 0;
  const actual  = Number(data.actual_value);
  const result  = (actual >= specMin && actual <= specMax) ? 'OK' : 'NG';
  const stage   = data.stage || 'IPC';
  sheet.appendRow([
    checkId,
    data.batch_id,
    data.check_date || today,
    data.inspector_id,
    data.parameter,
    specMin,
    specMax,
    actual,
    result,
    data.remarks || '',
    stage
  ]);
  return { success: true, check_id: checkId, result };
}
```

Note: `result` is now returned so the frontend can show the NG toast without re-parsing.

- [ ] **Step 3: Verify no other Code.gs code reads QualityChecks headers by position**

Search Code.gs for any code that reads QualityChecks column by index (e.g. `row[9]`). There should be none — the project uses `rowToObj` everywhere. If found, update to use the header name.

- [ ] **Step 4: Commit**

```bash
cd gas
git add Code.gs
git commit -m "feat: add stage column to QualityChecks — saveQualityCheck + getQualityChecks"
```

---

## Task 2: Backend — add `getInspectionParams`

**Files:**
- Modify: `gas/Code.gs` (add new function + doGet route)

### Context
`inspection_plans.json` (22 records) has fields: `id, stage, product_id, process_id, parameter, method, instrument_id, specification, aql_level, sample_size, frequency, record_form, responsible_role_id`.

The function filters by `stage` (exact) and `product_id` (exact match OR `"ALL"` wildcard).

- [ ] **Step 1: Add the `INSPECTION_PLANS` const and `getInspectionParams` function**

Add this block in Code.gs, just before the `// ── Quality / IPQC` section:

```javascript
// ── KB Constants ─────────────────────────────────────────────────────────────

const INSPECTION_PLANS = [
  { id:'IP001', stage:'IQC', product_id:'ALL', parameter:'MFI (Melt Flow Index)',            unit:'g/10 min', spec_min:null, spec_max:null, aql_level:null, sample_size:'Per lot — COA document' },
  { id:'IP002', stage:'IQC', product_id:'ALL', parameter:'Density',                          unit:'g/cm³',    spec_min:null, spec_max:null, aql_level:null, sample_size:'Per lot — COA document' },
  { id:'IP003', stage:'IQC', product_id:'ALL', parameter:'Colour and Appearance of Resin Pellets', unit:'Visual', spec_min:null, spec_max:null, aql_level:null, sample_size:'Per lot — COA document' },
  { id:'IP004', stage:'IQC', product_id:'ALL', parameter:'Moisture Content',                 unit:'%',        spec_min:null, spec_max:null, aql_level:null, sample_size:'Per lot — COA document' },
  { id:'IP005', stage:'IQC', product_id:'ALL', parameter:'Contamination / Foreign Material', unit:'Visual',   spec_min:null, spec_max:null, aql_level:null, sample_size:'Per lot — COA document' },
  { id:'IP006', stage:'IPC', product_id:'ALL', parameter:'Parison Weight',                   unit:'g',        spec_min:null, spec_max:null, aql_level:'AQL 1.5', sample_size:'5 per hour' },
  { id:'IP007', stage:'IPC', product_id:'ALL', parameter:'Wall Thickness',                   unit:'mm',       spec_min:null, spec_max:null, aql_level:'AQL 1.5', sample_size:'5 per hour' },
  { id:'IP008', stage:'IPC', product_id:'ALL', parameter:'Container Weight',                 unit:'g',        spec_min:null, spec_max:null, aql_level:'AQL 1.5', sample_size:'5 per hour' },
  { id:'IP009', stage:'IPC', product_id:'ALL', parameter:'Neck/Thread Dimensions',           unit:'mm',       spec_min:null, spec_max:null, aql_level:'AQL 1.5', sample_size:'5 per hour' },
  { id:'IP010', stage:'IPC', product_id:'ALL', parameter:'Visual Defects',                   unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 2.5', sample_size:'10 per hour' },
  { id:'IP011', stage:'IPC', product_id:'ALL', parameter:'Leak Test',                        unit:'Pass/Fail',spec_min:null, spec_max:null, aql_level:'AQL 0.65',sample_size:'5 per hour' },
  { id:'IP012', stage:'IPC', product_id:'ALL', parameter:'Flash Trimming Check',             unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 2.5', sample_size:'5 per hour' },
  { id:'IP013', stage:'IPC', product_id:'ALL', parameter:'Label Application',                unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 2.5', sample_size:'5 per hour' },
  { id:'IP014', stage:'OQC', product_id:'ALL', parameter:'Final Visual Inspection',          unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 2.5', sample_size:'Per batch AQL table' },
  { id:'IP015', stage:'OQC', product_id:'ALL', parameter:'Dimensional Check (Critical)',     unit:'mm',       spec_min:null, spec_max:null, aql_level:'AQL 1.5', sample_size:'Per batch AQL table' },
  { id:'IP016', stage:'OQC', product_id:'ALL', parameter:'Weight Check',                     unit:'g',        spec_min:null, spec_max:null, aql_level:'AQL 1.5', sample_size:'Per batch AQL table' },
  { id:'IP017', stage:'OQC', product_id:'ALL', parameter:'Leak / Pressure Test',             unit:'Pass/Fail',spec_min:null, spec_max:null, aql_level:'AQL 0.65',sample_size:'Per batch AQL table' },
  { id:'IP018', stage:'OQC', product_id:'ALL', parameter:'Label / Print Quality',            unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 2.5', sample_size:'Per batch AQL table' },
  { id:'IP019', stage:'OQC', product_id:'ALL', parameter:'Packaging Integrity',              unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 2.5', sample_size:'Per batch AQL table' },
  { id:'IP020', stage:'OQC', product_id:'ALL', parameter:'Batch / Label Traceability',       unit:'Visual',   spec_min:null, spec_max:null, aql_level:'AQL 4.0', sample_size:'Per batch AQL table' },
  { id:'IP021', stage:'IPC', product_id:'ALL', parameter:'Mould Temperature',                unit:'°C',       spec_min:null, spec_max:null, aql_level:null,      sample_size:'Per shift' },
  { id:'IP022', stage:'IPC', product_id:'ALL', parameter:'Cycle Time',                       unit:'sec',      spec_min:null, spec_max:null, aql_level:null,      sample_size:'Per hour' }
];

const DEFECT_CATALOGUE = [
  { id:'DEF001', code:'D-VIS-001', name:'Flash',                    category:'Visual',      severity:'Major',    detection_stage:['IPC','OQC'], corrective_action_hint:'Trim flash; check mould pinch-off wear or clamp force; reduce parison weight.' },
  { id:'DEF002', code:'D-VIS-002', name:'Sink Marks',               category:'Visual',      severity:'Minor',    detection_stage:['IPC','OQC'], corrective_action_hint:'Increase cooling time; improve mould cooling; adjust blow pressure.' },
  { id:'DEF003', code:'D-DIM-001', name:'Warpage / Distortion',     category:'Dimensional', severity:'Major',    detection_stage:['IPC','OQC'], corrective_action_hint:'Increase cooling time; verify mould cooling balance; enforce proper part placement.' },
  { id:'DEF004', code:'D-VIS-003', name:'Black Specks / Contamination', category:'Visual',  severity:'Critical', detection_stage:['IQC','IPC','OQC'], corrective_action_hint:'Stop production; purge barrel; investigate raw material lot.' },
  { id:'DEF005', code:'D-STR-001', name:'Pinhole / Leak',           category:'Structural',  severity:'Critical', detection_stage:['IPC','OQC'], corrective_action_hint:'100% leak test; reject affected batch; investigate parison/blow cycle.' },
  { id:'DEF006', code:'D-VIS-004', name:'Short Shot',               category:'Visual',      severity:'Critical', detection_stage:['IPC'], corrective_action_hint:'Check parison weight; adjust extrusion speed; inspect die gap.' },
  { id:'DEF007', code:'D-DIM-002', name:'Neck / Thread Defect',     category:'Dimensional', severity:'Critical', detection_stage:['IPC','OQC'], corrective_action_hint:'Check neck tooling; verify mould alignment; inspect thread inserts.' },
  { id:'DEF008', code:'D-STR-002', name:'Parison Burst',            category:'Structural',  severity:'Critical', detection_stage:['IPC'], corrective_action_hint:'Reduce blow pressure; check parison wall; inspect die tooling.' },
  { id:'DEF009', code:'D-STR-003', name:'Uneven Wall Thickness',    category:'Structural',  severity:'Critical', detection_stage:['IPC','OQC'], corrective_action_hint:'Adjust parison programming; check die centering; review blow ratio.' },
  { id:'DEF010', code:'D-VIS-005', name:'Surface Scratches',        category:'Visual',      severity:'Minor',    detection_stage:['OQC'], corrective_action_hint:'Check handling procedures; inspect conveyor and ejection mechanism.' },
  { id:'DEF011', code:'D-VIS-006', name:'Colour Variation',         category:'Visual',      severity:'Major',    detection_stage:['IPC','OQC'], corrective_action_hint:'Check masterbatch dosing; verify let-down ratio; inspect mixing.' },
  { id:'DEF012', code:'D-DIM-003', name:'Dimension Out of Spec',    category:'Dimensional', severity:'Major',    detection_stage:['IPC','OQC'], corrective_action_hint:'Verify mould dimensions; check shrinkage allowance; calibrate gauges.' },
  { id:'DEF013', code:'D-RM-001',  name:'Raw Material Contamination', category:'Raw Material', severity:'Critical', detection_stage:['IQC'], corrective_action_hint:'Quarantine lot; notify supplier; request COA and re-inspection.' },
  { id:'DEF014', code:'D-RM-002',  name:'MFI Out of Spec',          category:'Raw Material', severity:'Major',    detection_stage:['IQC'], corrective_action_hint:'Hold lot; verify against COA; consider supplier deviation approval.' },
  { id:'DEF015', code:'D-LBL-001', name:'Label Mismatch / Missing', category:'Label',       severity:'Major',    detection_stage:['OQC'], corrective_action_hint:'Stop labelling line; verify label stock; 100% check affected batch.' }
];
```

- [ ] **Step 2: Add `getInspectionParams` function**

Add this function after the `DEFECT_CATALOGUE` const:

```javascript
function getInspectionParams(params) {
  const stage     = params.stage;
  const productId = params.product_id;
  let data = INSPECTION_PLANS;
  if (stage)     data = data.filter(r => r.stage === stage);
  if (productId) data = data.filter(r => r.product_id === productId || r.product_id === 'ALL');
  return { success: true, data };
}

function getDefectCatalogue() {
  return { success: true, data: DEFECT_CATALOGUE };
}
```

- [ ] **Step 3: Register both actions in `doGet`**

In `doGet`, after the `getQualityParams` line (currently line ~114), add:

```javascript
if (action === 'getInspectionParams') return respond(getInspectionParams(e.parameter));
if (action === 'getDefectCatalogue')  return respond(getDefectCatalogue());
```

- [ ] **Step 4: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: add getInspectionParams + getDefectCatalogue with hardcoded KB consts"
```

---

## Task 3: Backend — add `saveNCR` and `getNCRList`

**Files:**
- Modify: `gas/Code.gs` (add functions + doGet routes)

### Context
NCR_Log sheet schema (15 columns):
`ncr_id | date | batch_id | stage | defect_type | severity | qty_affected | disposition | detected_by | remarks | status | capa_required | capa_trigger_reason | created_by | created_at`

NCR ID format: `YPP-NCR-YYMM-NNN` (sequential, scoped to current month).

CAPA trigger rules from `capa_triggers.json` — simplified to these checks in the backend:
1. `severity === 'Critical'` → trigger (CT002)
2. `disposition === 'Reject'` and batch reject count > 5 within last 30 rows → trigger (CT003)

- [ ] **Step 1: Add `saveNCR` function**

Add after `getDefectCatalogue`:

```javascript
function saveNCR(data) {
  var authError = requireRole(data, ['director','qmr','supervisor','quality_inspector']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['batch_id','defect_type','qty_affected','disposition']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('NCR_Log');
  // Create sheet with headers if it does not exist
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ncrSheet = ss.getSheetByName('NCR_Log');
  if (!ncrSheet) {
    ncrSheet = ss.insertSheet('NCR_Log');
    const hdrs = ['ncr_id','date','batch_id','stage','defect_type','severity','qty_affected','disposition','detected_by','remarks','status','capa_required','capa_trigger_reason','created_by','created_at'];
    ncrSheet.getRange(1,1,1,hdrs.length).setValues([hdrs]);
    ncrSheet.setFrozenRows(1);
  }

  // Generate NCR ID scoped to current month
  const now = new Date();
  const yymm = String(now.getFullYear()).slice(2) + String(now.getMonth()+1).padStart(2,'0');
  const allRows = ncrSheet.getDataRange().getValues();
  const monthPrefix = 'YPP-NCR-' + yymm + '-';
  const monthCount = allRows.slice(1).filter(r => String(r[0]).startsWith(monthPrefix)).length;
  const ncrId = monthPrefix + String(monthCount + 1).padStart(3,'0');

  const today = now.toISOString().slice(0,10);
  const severity = data.severity || '';

  // Evaluate CAPA triggers
  let capaRequired = false;
  let capaTriggerReason = '';
  if (severity === 'Critical') {
    capaRequired = true;
    capaTriggerReason = 'Critical defect detected (CT002)';
  } else if (data.disposition === 'Reject') {
    const recentRows = allRows.slice(Math.max(1, allRows.length - 30));
    const rejectCount = recentRows.filter(r => r[7] === 'Reject').length;
    if (rejectCount >= 5) {
      capaRequired = true;
      capaTriggerReason = 'Rejection rate exceeds threshold in recent NCRs (CT003)';
    }
  }

  ncrSheet.appendRow([
    ncrId,
    data.date || today,
    data.batch_id,
    data.stage || '',
    data.defect_type,
    severity,
    Number(data.qty_affected),
    data.disposition,
    data.detected_by || '',
    data.remarks || '',
    'Open',
    capaRequired,
    capaTriggerReason,
    data.userId || '',
    today
  ]);

  return { success: true, ncr_id: ncrId, capa_required: capaRequired, capa_trigger_reason: capaTriggerReason };
}
```

- [ ] **Step 2: Add `getNCRList` function**

```javascript
function getNCRList(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ncrSheet = ss.getSheetByName('NCR_Log');
  if (!ncrSheet) return { success: true, data: [] };
  const rows = ncrSheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => rowToObj(headers, row));
  if (params.batch_id) data = data.filter(r => String(r.batch_id) === String(params.batch_id));
  if (params.stage)    data = data.filter(r => r.stage === params.stage);
  if (params.status)   data = data.filter(r => r.status === params.status);
  return { success: true, data };
}
```

- [ ] **Step 3: Register actions in `doGet`**

After the `getDefectCatalogue` route line, add:

```javascript
if (action === 'getNCRList') return respond(getNCRList(e.parameter));
```

After the `saveQualityCheck` route (in the payload block), add:

```javascript
if (action === 'saveNCR') return respond(saveNCR(data));
```

- [ ] **Step 4: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: add saveNCR (with CAPA trigger eval) + getNCRList to Code.gs"
```

---

## Task 4: Deploy GAS and smoke-test backend

**Files:**
- `gas/Code.gs` (already edited)

- [ ] **Step 1: Push to GAS**

```bash
cd "c:\Users\Appex\My Drive (tu55h4r@gmail.com)\#Ypp\ERP\gas"
clasp push --force
```

Expected: `Pushed N files.`

- [ ] **Step 2: Test `getInspectionParams` via browser**

Open:
```
https://script.google.com/macros/s/<DEPLOY_ID>/exec?action=getInspectionParams&stage=IQC
```
Expected response: `{ "success": true, "data": [ ... 5 IQC records ... ] }`

- [ ] **Step 3: Test `getDefectCatalogue`**

```
?action=getDefectCatalogue
```
Expected: `{ "success": true, "data": [ ... 15 defects ... ] }`

- [ ] **Step 4: Test `saveNCR` with a critical defect**

Post payload via `?action=saveNCR&payload={"batch_id":"B001","defect_type":"Flash","severity":"Critical","qty_affected":5,"disposition":"Reject","userId":"<valid_director_userId>"}`.
Expected: `{ "success": true, "ncr_id": "YPP-NCR-2605-001", "capa_required": true, "capa_trigger_reason": "Critical defect detected (CT002)" }`

- [ ] **Step 5: Verify NCR_Log sheet was created in the Spreadsheet**

Open the Google Sheet. Confirm `NCR_Log` tab exists with correct 15-column header row and one data row.

---

## Task 5: quality.html — 4-tab restructure

**Files:**
- Modify: `quality.html`

### Target structure
- Tab 1: Summary (unchanged `id="tab-summary"`)
- Tab 2: IQC (`data-tab="iqc"`, `id="tab-iqc"`)
- Tab 3: IPC (`data-tab="ipc"`, `id="tab-ipc"`)
- Tab 4: OQC (`data-tab="oqc"`, `id="tab-oqc"`)

Each stage tab is identical in structure — batch filter select, `+ New Check` button, `checks-table` tbody (8 cols same as before).

- [ ] **Step 1: Replace the tab bar**

Replace:
```html
  <div class="sub-tab-bar">
    <button class="sub-tab active" data-tab="summary">Summary</button>
    <button class="sub-tab" data-tab="checks">Check Log</button>
  </div>
```
With:
```html
  <div class="sub-tab-bar">
    <button class="sub-tab active" data-tab="summary">Summary</button>
    <button class="sub-tab" data-tab="iqc">IQC</button>
    <button class="sub-tab" data-tab="ipc">IPC</button>
    <button class="sub-tab" data-tab="oqc">OQC</button>
  </div>
```

- [ ] **Step 2: Replace the main content area**

Replace the entire `<div id="main-content">` block (lines 35–73 in the original) with:

```html
  <!-- Main Content -->
  <div id="main-content">

    <!-- Summary Tab -->
    <div id="tab-summary" class="tab-content">
      <div id="summary-grid" class="summary-grid">
        <p class="empty-msg">Loading…</p>
      </div>
    </div>

    <!-- IQC Tab -->
    <div id="tab-iqc" class="tab-content hidden">
      <div class="filter-bar">
        <select id="filter-batch-iqc"><option value="">All Batches</option></select>
      </div>
      <div class="new-check-bar">
        <button class="btn-primary" id="btn-new-check-iqc">+ New Check</button>
      </div>
      <div class="checks-table-wrap">
        <table class="checks-table">
          <thead><tr>
            <th>Check ID</th><th>Batch</th><th>Parameter</th>
            <th>Spec Min</th><th>Spec Max</th><th>Actual</th><th>Result</th><th>Remarks</th>
          </tr></thead>
          <tbody id="checks-tbody-iqc">
            <tr><td colspan="8" class="td-loading">Select a batch to view checks</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- IPC Tab -->
    <div id="tab-ipc" class="tab-content hidden">
      <div class="filter-bar">
        <select id="filter-batch-ipc"><option value="">All Batches</option></select>
      </div>
      <div class="new-check-bar">
        <button class="btn-primary" id="btn-new-check-ipc">+ New Check</button>
      </div>
      <div class="checks-table-wrap">
        <table class="checks-table">
          <thead><tr>
            <th>Check ID</th><th>Batch</th><th>Parameter</th>
            <th>Spec Min</th><th>Spec Max</th><th>Actual</th><th>Result</th><th>Remarks</th>
          </tr></thead>
          <tbody id="checks-tbody-ipc">
            <tr><td colspan="8" class="td-loading">Select a batch to view checks</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- OQC Tab -->
    <div id="tab-oqc" class="tab-content hidden">
      <div class="filter-bar">
        <select id="filter-batch-oqc"><option value="">All Batches</option></select>
      </div>
      <div class="new-check-bar">
        <button class="btn-primary" id="btn-new-check-oqc">+ New Check</button>
      </div>
      <div class="checks-table-wrap">
        <table class="checks-table">
          <thead><tr>
            <th>Check ID</th><th>Batch</th><th>Parameter</th>
            <th>Spec Min</th><th>Spec Max</th><th>Actual</th><th>Result</th><th>Remarks</th>
          </tr></thead>
          <tbody id="checks-tbody-oqc">
            <tr><td colspan="8" class="td-loading">Select a batch to view checks</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
```

- [ ] **Step 3: Commit**

```bash
git add quality.html
git commit -m "feat: quality.html — replace 2-tab with 4-tab layout (Summary/IQC/IPC/OQC)"
```

---

## Task 6: js/quality.js — stage-aware tab routing + NG toast

**Files:**
- Modify: `js/quality.js`

### Changes needed
1. `activeTab` default stays `'summary'`; add `activeStage` helper that maps tab name to stage string
2. `renderTabs()` now manages 4 tabs and 4 content divs
3. `loadChecks(batchId, stage)` passes stage filter to API
4. `openCheckForm(stage)` calls `getInspectionParams` instead of `getQualityParams`; passes stage to `submitCheck`
5. `submitCheck()` posts `stage` field; on result = NG shows toast with NCR link
6. Batch dropdowns: one per stage tab (`filter-batch-iqc`, etc.)
7. `+ New Check` buttons: one per stage tab

- [ ] **Step 1: Update state and `init`**

Replace the state block and `init` function:

```javascript
  let session = null;
  let batchCache = [];
  let checkCache = {};        // keyed by stage: { IQC: [], IPC: [], OQC: [] }
  let inspectionParamCache = [];
  let selectedParam = null;
  let editingCheckId = null;
  let activeTab = 'summary';
  let activeStage = null;     // 'IQC' | 'IPC' | 'OQC' | null

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);
    setupHeader();
    renderTabs();
    await loadBatches();
    await loadSummary();
  }
```

- [ ] **Step 2: Replace `renderTabs`**

```javascript
  const STAGE_TABS = { iqc: 'IQC', ipc: 'IPC', oqc: 'OQC' };

  function renderTabs() {
    document.querySelectorAll('.sub-tab').forEach(btn => {
      const tab = btn.dataset.tab;
      btn.classList.toggle('active', tab === activeTab);
      btn.onclick = async () => {
        activeTab = tab;
        activeStage = STAGE_TABS[tab] || null;
        renderTabs();
        if (activeTab === 'summary') await loadSummary();
        if (activeStage) {
          const batchId = document.getElementById('filter-batch-' + tab).value;
          await loadChecks(batchId, activeStage);
        }
      };
    });
    document.getElementById('tab-summary').classList.toggle('hidden', activeTab !== 'summary');
    ['iqc','ipc','oqc'].forEach(t => {
      document.getElementById('tab-' + t).classList.toggle('hidden', activeTab !== t);
    });
  }
```

- [ ] **Step 3: Replace `populateBatchDropdowns` and `loadBatches`**

```javascript
  async function loadBatches() {
    const res = await Api.get('getBatchList', {});
    batchCache = res.success ? res.data : [];
    populateBatchDropdowns();
  }

  function populateBatchDropdowns() {
    ['iqc','ipc','oqc'].forEach(tabKey => {
      const filterId = 'filter-batch-' + tabKey;
      const sel = document.getElementById(filterId);
      if (!sel) return;
      sel.innerHTML = '<option value="">All Batches</option>';
      batchCache.forEach(b => {
        const o = document.createElement('option');
        o.value = b.batch_id;
        o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
        sel.appendChild(o);
      });
      sel.addEventListener('change', async () => {
        await loadChecks(sel.value, STAGE_TABS[tabKey]);
      });

      const btnId = 'btn-new-check-' + tabKey;
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener('click', () => openCheckForm(STAGE_TABS[tabKey]));
    });
  }
```

- [ ] **Step 4: Replace `loadChecks`**

```javascript
  async function loadChecks(batchId, stage) {
    showSpinner(true);
    try {
      const params = { stage };
      if (batchId) params.batch_id = batchId;
      const res = await Api.get('getQualityChecks', params);
      const rows = res.success ? res.data : [];
      checkCache[stage] = rows;
      renderChecksTable(rows, stage);
    } finally {
      showSpinner(false);
    }
  }
```

- [ ] **Step 5: Replace `renderChecksTable`**

```javascript
  function renderChecksTable(rows, stage) {
    const tbodyId = 'checks-tbody-' + stage.toLowerCase();
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="td-loading">No records</td></tr>';
      return;
    }
    rows.forEach(r => {
      const isOK = r.result === 'OK';
      const chip = `<span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${r.result}</span>`;
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.check_id || ''}</td>
        <td>${r.batch_id || ''}</td>
        <td>${r.parameter || ''}</td>
        <td>${r.spec_min ?? ''}</td>
        <td>${r.spec_max ?? ''}</td>
        <td>${r.actual_value ?? ''}</td>
        <td>${chip}</td>
        <td>${r.remarks || ''}</td>
      `;
      tr.addEventListener('click', () => openCheckDetail(r.check_id, stage));
      tbody.appendChild(tr);
    });
  }
```

- [ ] **Step 6: Replace `openCheckForm` and `loadQualityParamsForProduct`**

```javascript
  function openCheckForm(stage) {
    editingCheckId = null;
    selectedParam = null;
    activeStage = stage;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('field-check-date').value = today;
    document.getElementById('field-inspector').value = session.name || '';
    document.getElementById('field-actual').value = '';
    document.getElementById('field-remarks').value = '';
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';
    document.getElementById('field-spec-min').readOnly = false;
    document.getElementById('field-spec-max').readOnly = false;
    renderParamButtons([]);

    const tabKey = stage.toLowerCase();
    const batchSel = document.getElementById('field-batch');
    const filterVal = document.getElementById('filter-batch-' + tabKey) ? document.getElementById('filter-batch-' + tabKey).value : '';
    if (filterVal) {
      batchSel.value = filterVal;
      const batch = batchCache.find(b => String(b.batch_id) === String(filterVal));
      if (batch) loadInspectionParams(stage, batch.product_id);
    }
    batchSel.onchange = async () => {
      const batch = batchCache.find(b => String(b.batch_id) === String(batchSel.value));
      await loadInspectionParams(stage, batch ? batch.product_id : null);
    };
    document.getElementById('form-title').textContent = 'New ' + stage + ' Check';
    slideFormIn();
  }

  async function loadInspectionParams(stage, productId) {
    if (!productId) { renderParamButtons([]); return; }
    const res = await Api.get('getInspectionParams', { stage, product_id: productId });
    inspectionParamCache = res.success ? res.data : [];
    renderParamButtons(inspectionParamCache);
  }
```

- [ ] **Step 7: Replace `renderParamButtons` (use new field names from inspection_plans)**

```javascript
  function renderParamButtons(params) {
    const container = document.getElementById('param-btn-group');
    container.innerHTML = '';
    selectedParam = null;
    document.getElementById('field-spec-min').value = '';
    document.getElementById('field-spec-max').value = '';

    if (params.length === 0) {
      container.innerHTML = '<span style="font-size:0.85rem;color:var(--neutral-500);">Select a batch first.</span>';
      return;
    }
    params.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'param-btn';
      btn.textContent = p.parameter + (p.unit ? ' (' + p.unit + ')' : '');
      btn.dataset.paramId = p.id;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.param-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedParam = p;
        document.getElementById('field-spec-min').value = p.spec_min ?? '';
        document.getElementById('field-spec-max').value = p.spec_max ?? '';
        document.getElementById('field-spec-min').readOnly = p.spec_min !== null;
        document.getElementById('field-spec-max').readOnly = p.spec_max !== null;
      });
      container.appendChild(btn);
    });
  }
```

- [ ] **Step 8: Replace `submitCheck` — add stage, return result, NG toast**

```javascript
  async function submitCheck() {
    const batchId   = document.getElementById('field-batch').value.trim();
    const inspector = document.getElementById('field-inspector').value.trim();
    const actual    = document.getElementById('field-actual').value;
    const remarks   = document.getElementById('field-remarks').value.trim();
    const checkDate = document.getElementById('field-check-date').value;

    if (!batchId || actual === '') {
      showToast('Batch ID and Actual Value are required');
      return;
    }

    const parameter = selectedParam ? selectedParam.parameter : 'Manual';
    const specMin   = selectedParam ? (selectedParam.spec_min ?? 0) : Number(document.getElementById('field-spec-min').value) || 0;
    const specMax   = selectedParam ? (selectedParam.spec_max ?? 0) : Number(document.getElementById('field-spec-max').value) || 0;

    if (editingCheckId) {
      const fields = { check_date: checkDate, inspector_id: inspector, actual_value: Number(actual), remarks };
      if (selectedParam) {
        fields.parameter = selectedParam.parameter;
        fields.spec_min  = selectedParam.spec_min;
        fields.spec_max  = selectedParam.spec_max;
        const a = Number(actual);
        fields.result = (a >= (selectedParam.spec_min || 0) && a <= (selectedParam.spec_max || 0)) ? 'OK' : 'NG';
      }
      showSpinner(true);
      try {
        const res = await Api.post('updateRecord', { sheet: 'QualityChecks', idCol: 'check_id', idVal: editingCheckId, userId: Auth.getUserId(), fields });
        if (res.success) {
          editingCheckId = null;
          slideFormOut();
          await loadSummary();
          await loadChecks(document.getElementById('filter-batch-' + activeStage.toLowerCase()).value, activeStage);
        } else {
          showToast('Update failed: ' + res.error);
        }
      } finally { showSpinner(false); }
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveQualityCheck', {
        batch_id:     batchId,
        check_date:   checkDate,
        inspector_id: inspector,
        parameter,
        spec_min:     specMin,
        spec_max:     specMax,
        actual_value: Number(actual),
        remarks,
        stage:        activeStage || 'IPC',
        userId:       Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        await loadSummary();
        await loadChecks(document.getElementById('filter-batch-' + (activeStage || 'ipc').toLowerCase()).value, activeStage || 'IPC');
        if (res.result === 'NG') {
          const batchParam = encodeURIComponent(batchId);
          showToastWithLink(
            'Check saved — NG.',
            'Log NCR →',
            'ncr.html?batch=' + batchParam + '&stage=' + (activeStage || 'IPC')
          );
        } else {
          showToast('Check saved — ' + (res.check_id || ''));
        }
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally {
      showSpinner(false);
    }
  }
```

- [ ] **Step 9: Replace `openCheckDetail` and `editCheck` / `deleteCheck`**

```javascript
  function openCheckDetail(checkId, stage) {
    const cache = checkCache[stage] || [];
    const r = cache.find(c => String(c.check_id) === String(checkId));
    if (!r) return;
    const fv = (v) => (v === undefined || v === null || v === '') ? '—' : String(v).slice(0, 30);
    const dateStr = (v) => v ? String(v).slice(0, 10) : '—';
    const result = r.result || '—';
    const isOK = result === 'OK';
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-row"><span>Check ID</span><strong>${fv(r.check_id)}</strong></div>
      <div class="detail-row"><span>Batch</span><strong>${fv(r.batch_id)}</strong></div>
      <div class="detail-row"><span>Stage</span><strong>${fv(r.stage || stage)}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${dateStr(r.check_date)}</strong></div>
      <div class="detail-row"><span>Inspector</span><strong>${fv(r.inspector_id)}</strong></div>
      <div class="detail-row"><span>Parameter</span><strong>${fv(r.parameter)}</strong></div>
      <div class="detail-row"><span>Spec Min</span><strong>${fv(r.spec_min)}</strong></div>
      <div class="detail-row"><span>Spec Max</span><strong>${fv(r.spec_max)}</strong></div>
      <div class="detail-row"><span>Actual Value</span><strong>${fv(r.actual_value)}</strong></div>
      <div class="detail-row"><span>Result</span><span class="result-chip ${isOK ? 'chip-ok' : 'chip-ng'}">${result}</span></div>
      <div class="detail-row"><span>Remarks</span><strong>${fv(r.remarks)}</strong></div>
    `;
    const canEdit = ['director','qmr','supervisor'].includes(session.role);
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="Quality.editCheck('${checkId}','${stage}')">Edit</button>
         <button class="btn-deactivate" onclick="Quality.deleteCheck('${checkId}','${stage}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editCheck(checkId, stage) {
    const cache = checkCache[stage] || [];
    const r = cache.find(c => String(c.check_id) === String(checkId));
    if (!r) return;
    editingCheckId = checkId;
    activeStage = stage;
    slideDetailOut();
    document.getElementById('field-check-date').value = r.check_date || '';
    document.getElementById('field-batch').value = r.batch_id || '';
    document.getElementById('field-inspector').value = r.inspector_id || '';
    document.getElementById('field-actual').value = r.actual_value ?? '';
    document.getElementById('field-remarks').value = r.remarks || '';
    document.getElementById('field-spec-min').value = r.spec_min ?? '';
    document.getElementById('field-spec-max').value = r.spec_max ?? '';
    const batch = batchCache.find(b => String(b.batch_id) === String(r.batch_id));
    loadInspectionParams(stage, batch ? batch.product_id : null).then(() => {
      document.querySelectorAll('.param-btn').forEach(btn => {
        if (btn.textContent.startsWith(r.parameter)) btn.click();
      });
    });
    document.getElementById('form-title').textContent = 'Edit ' + stage + ' Check';
    slideFormIn();
  }

  async function deleteCheck(checkId, stage) {
    if (!confirm('Delete check ' + checkId + '?')) return;
    const res = await Api.post('deleteRecord', { sheet: 'QualityChecks', idCol: 'check_id', idVal: checkId, userId: Auth.getUserId() });
    if (res.success) {
      slideDetailOut();
      await loadChecks(document.getElementById('filter-batch-' + stage.toLowerCase()).value, stage);
    } else {
      showToast('Delete failed: ' + res.error);
    }
  }
```

- [ ] **Step 10: Add `showToastWithLink` helper and update return statement**

Add after `showToast`:

```javascript
  function showToastWithLink(msg, linkText, href) {
    const t = document.getElementById('toast');
    t.innerHTML = msg + ' <a href="' + href + '" style="color:#fff;text-decoration:underline;">' + linkText + '</a>';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }
```

Update the return statement at the bottom of the IIFE:

```javascript
  return { init, submitCheck, loadChecks, loadSummary, editCheck, deleteCheck };
```

(No change needed — same exported surface.)

- [ ] **Step 11: Commit**

```bash
git add js/quality.js
git commit -m "feat: quality.js — stage-aware tabs, getInspectionParams, NG toast with NCR link"
```

---

## Task 7: ncr.html — full implementation

**Files:**
- Modify: `ncr.html`

Replace the stub body entirely with the full NCR page.

- [ ] **Step 1: Replace ncr.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#EA580C">
  <title>YPP ERP — NCR / Defects</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/masters.css">
</head>
<body>

  <header class="header">
    <div class="header-flex">
      <button class="back-btn" id="back-to-app">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="header-title">NCR / Defects</span>
    </div>
    <div class="header-actions">
      <button class="lang-toggle" id="lang-toggle">EN</button>
    </div>
  </header>

  <!-- CAPA Banner (hidden until triggered) -->
  <div id="capa-banner" class="capa-banner hidden">
    <span id="capa-banner-msg"></span>
    <a href="compliance.html" class="capa-banner-link">Go to Compliance →</a>
    <button class="capa-banner-close" onclick="document.getElementById('capa-banner').classList.add('hidden')">✕</button>
  </div>

  <div class="sub-tab-bar">
    <button class="sub-tab active" data-tab="ncr">Non-Conformance</button>
    <button class="sub-tab" data-tab="catalogue">Defect Catalogue</button>
  </div>

  <div id="main-content">

    <!-- NCR Log Tab -->
    <div id="tab-ncr" class="tab-content">
      <div class="new-check-bar">
        <button class="btn-primary" id="btn-new-ncr">+ New NCR</button>
      </div>
      <div class="checks-table-wrap">
        <table class="checks-table">
          <thead><tr>
            <th>NCR ID</th><th>Date</th><th>Batch</th><th>Stage</th>
            <th>Defect</th><th>Severity</th><th>Qty</th><th>Disposition</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody id="ncr-tbody">
            <tr><td colspan="10" class="td-loading">Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Defect Catalogue Tab -->
    <div id="tab-catalogue" class="tab-content hidden">
      <div id="defect-catalogue-grid" class="summary-grid">
        <p class="empty-msg">Loading…</p>
      </div>
    </div>

  </div>

  <!-- NCR Form Panel (slide-in) -->
  <div class="form-panel" id="form-panel">
    <div class="form-header">
      <button class="back-btn" id="form-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="form-title" id="form-title">New NCR</span>
    </div>
    <div class="form-body">
      <div class="field-group">
        <label>Date</label>
        <input type="date" id="field-ncr-date">
      </div>
      <div class="field-group">
        <label>Batch ID</label>
        <select id="field-ncr-batch"><option value="">— select —</option></select>
      </div>
      <div class="field-group">
        <label>Stage</label>
        <select id="field-ncr-stage">
          <option value="IQC">IQC — Incoming</option>
          <option value="IPC" selected>IPC — In-Process</option>
          <option value="OQC">OQC — Outgoing</option>
        </select>
      </div>
      <div class="field-group">
        <label>Defect Type</label>
        <select id="field-ncr-defect"><option value="">— select —</option></select>
      </div>
      <div class="field-group">
        <label>Severity (auto-filled)</label>
        <input type="text" id="field-ncr-severity" readonly>
      </div>
      <div class="field-group">
        <label>Qty Affected</label>
        <input type="number" id="field-ncr-qty" min="1">
      </div>
      <div class="field-group">
        <label>Disposition</label>
        <select id="field-ncr-disposition">
          <option value="Rework">Rework</option>
          <option value="Reject">Reject</option>
          <option value="Accept-on-deviation">Accept-on-deviation</option>
        </select>
      </div>
      <div class="field-group">
        <label>Detected By</label>
        <input type="text" id="field-ncr-detected-by">
      </div>
      <div class="field-group">
        <label>Remarks</label>
        <input type="text" id="field-ncr-remarks" placeholder="Optional">
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-primary" onclick="NCR.submitNCR()">Save NCR</button>
    </div>
  </div>

  <!-- Detail Panel (slide-in) -->
  <div class="form-panel" id="detail-panel">
    <div class="form-header">
      <button class="back-btn" id="detail-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="form-title">NCR Detail</span>
    </div>
    <div class="form-body" id="detail-body"></div>
    <div class="form-actions" id="detail-actions"></div>
  </div>

  <div class="spinner-overlay hidden" id="spinner"><div class="spinner"></div></div>
  <div class="toast" id="toast"></div>

  <script src="js/api.js" defer></script>
  <script src="js/auth.js" defer></script>
  <script src="js/lang.js" defer></script>
  <script src="js/ncr.js" defer></script>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      (async () => {
        await Api.init();
        await NCR.init();
      })();
    });
  </script>
</body>
</html>
```

Note: `.capa-banner` styles are inline for now (Task 8 adds inline styles if needed — the existing `css/style.css` covers `.hidden`, `.form-panel`, `.sub-tab-bar`, `.checks-table`, `.summary-grid`, and `.btn-primary`). Add CAPA banner CSS inline in the `<head>` of ncr.html:

```html
  <style>
    .capa-banner {
      background: #c62828; color: #fff;
      padding: var(--space-3) var(--space-4);
      display: flex; align-items: center; gap: var(--space-3);
      font-size: var(--text-sm); font-weight: var(--weight-semibold);
      position: sticky; top: 0; z-index: 100;
    }
    .capa-banner.hidden { display: none; }
    .capa-banner-link { color: #fff; text-decoration: underline; margin-left: auto; }
    .capa-banner-close { background: none; border: none; color: #fff; cursor: pointer; font-size: 1rem; }
  </style>
```

- [ ] **Step 2: Commit**

```bash
git add ncr.html
git commit -m "feat: ncr.html — full implementation from stub (NCR log, form, defect catalogue)"
```

---

## Task 8: js/ncr.js — NCR module

**Files:**
- Create: `js/ncr.js`

- [ ] **Step 1: Create `js/ncr.js`**

```javascript
const NCR = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  let session = null;
  let batchCache = [];
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
    await Promise.all([loadBatches(), loadDefectCatalogue()]);
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

  // ── URL params pre-fill ────────────────────────────────────────────────────
  function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    const batch = params.get('batch');
    const stage = params.get('stage');
    if (batch || stage) openNCRForm(batch, stage);
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
      o.textContent = b.batch_id + (b.product_id ? ' — ' + b.product_id : '');
      sel.appendChild(o);
    });
  }

  // ── NCR Log ────────────────────────────────────────────────────────────────
  async function loadNCRs(filters) {
    showSpinner(true);
    try {
      const res = await Api.get('getNCRList', filters || {});
      ncrCache = res.success ? res.data : [];
      renderNCRTable(ncrCache);
    } finally {
      showSpinner(false);
    }
  }

  function renderNCRTable(rows) {
    const tbody = document.getElementById('ncr-tbody');
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="td-loading">No NCR records</td></tr>';
      return;
    }
    const canEdit = ['director','qmr','supervisor'].includes(session.role);
    rows.forEach(r => {
      const sevClass = r.severity === 'Critical' ? 'chip-ng' : r.severity === 'Major' ? 'chip-ng' : 'chip-ok';
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${r.ncr_id || ''}</td>
        <td>${r.date ? String(r.date).slice(0,10) : ''}</td>
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
    document.getElementById('field-ncr-detected-by').value = session.name || '';
    document.getElementById('field-ncr-defect').value = '';

    if (preBatch) document.getElementById('field-ncr-batch').value = preBatch;
    if (preStage) document.getElementById('field-ncr-stage').value = preStage;

    // Wire defect selection → auto-fill severity
    document.getElementById('field-ncr-defect').onchange = () => {
      const defectName = document.getElementById('field-ncr-defect').value;
      const defect = defectCache.find(d => d.name === defectName);
      document.getElementById('field-ncr-severity').value = defect ? defect.severity : '';
    };

    document.getElementById('form-title').textContent = 'New NCR';
    slideFormIn();
  }

  async function submitNCR() {
    const batchId    = document.getElementById('field-ncr-batch').value.trim();
    const stage      = document.getElementById('field-ncr-stage').value;
    const defectType = document.getElementById('field-ncr-defect').value.trim();
    const severity   = document.getElementById('field-ncr-severity').value.trim();
    const qty        = document.getElementById('field-ncr-qty').value;
    const disposition= document.getElementById('field-ncr-disposition').value;
    const detectedBy = document.getElementById('field-ncr-detected-by').value.trim();
    const remarks    = document.getElementById('field-ncr-remarks').value.trim();
    const date       = document.getElementById('field-ncr-date').value;

    if (!batchId || !defectType || !qty || !disposition) {
      showToast('Batch, Defect Type, Qty, and Disposition are required');
      return;
    }

    if (editingNcrId) {
      showSpinner(true);
      try {
        const fields = { date, batch_id: batchId, stage, defect_type: defectType, severity, qty_affected: Number(qty), disposition, detected_by: detectedBy, remarks };
        const res = await Api.post('updateRecord', { sheet: 'NCR_Log', idCol: 'ncr_id', idVal: editingNcrId, userId: Auth.getUserId(), fields });
        if (res.success) { editingNcrId = null; slideFormOut(); await loadNCRs(); }
        else showToast('Update failed: ' + res.error);
      } finally { showSpinner(false); }
      return;
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveNCR', {
        date, batch_id: batchId, stage, defect_type: defectType, severity,
        qty_affected: Number(qty), disposition, detected_by: detectedBy,
        remarks, userId: Auth.getUserId()
      });
      if (res.success) {
        slideFormOut();
        await loadNCRs();
        showToast('NCR saved — ' + res.ncr_id);
        if (res.capa_required) showCAPABanner(res.capa_trigger_reason);
      } else {
        showToast('Error: ' + (res.error || 'save failed'));
      }
    } finally { showSpinner(false); }
  }

  // ── CAPA Banner ────────────────────────────────────────────────────────────
  function showCAPABanner(reason) {
    const banner = document.getElementById('capa-banner');
    document.getElementById('capa-banner-msg').textContent = 'CAPA Required: ' + reason;
    banner.classList.remove('hidden');
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
      <div class="detail-row"><span>Remarks</span><strong>${fv(r.remarks)}</strong></div>
    `;
    const canEdit = ['director','qmr','supervisor'].includes(session.role);
    document.getElementById('detail-actions').innerHTML = canEdit
      ? `<button class="btn-primary" onclick="NCR.editNCR('${ncrId}')">Edit</button>
         <button class="btn-deactivate" onclick="NCR.deleteNCR('${ncrId}')">Delete</button>`
      : '';
    slideDetailIn();
  }

  function editNCR(ncrId) {
    const r = ncrCache.find(n => String(n.ncr_id) === String(ncrId));
    if (!r) return;
    editingNcrId = ncrId;
    slideDetailOut();
    document.getElementById('field-ncr-date').value = r.date ? String(r.date).slice(0,10) : '';
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
    const res = await Api.post('deleteRecord', { sheet: 'NCR_Log', idCol: 'ncr_id', idVal: ncrId, userId: Auth.getUserId() });
    if (res.success) { slideDetailOut(); await loadNCRs(); }
    else showToast('Delete failed: ' + res.error);
  }

  // ── Defect Catalogue ───────────────────────────────────────────────────────
  async function loadDefectCatalogue() {
    const res = await Api.get('getDefectCatalogue', {});
    defectCache = res.success ? res.data : [];
    // Populate defect dropdown
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
    const sevColor = { Critical: '#c62828', Major: '#e65100', Minor: '#2e7d32' };
    const sevBg    = { Critical: '#fff5f5', Major: '#fff3e0', Minor: '#f1f8f1' };
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
  function showSpinner(show) { document.getElementById('spinner').classList.toggle('hidden', !show); }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  return { init, submitNCR, editNCR, deleteNCR };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/ncr.js
git commit -m "feat: create js/ncr.js — NCR CRUD, defect catalogue, CAPA banner"
```

---

## Task 9: Deploy and end-to-end test

**Files:** None changed — test only.

- [ ] **Step 1: Push GAS final state**

```bash
cd "c:\Users\Appex\My Drive (tu55h4r@gmail.com)\#Ypp\ERP\gas"
clasp push --force
```

- [ ] **Step 2: Test IQC tab**

1. Open `quality.html` → click IQC tab
2. Select any batch → confirm parameter buttons appear (IQC params from inspection_plans)
3. Click a param button → confirm Spec Min / Spec Max auto-fill (null values show blank; that's correct since KB has `[TO BE ENTERED]` placeholders)
4. Enter an actual value outside spec range → Save → confirm NG toast with "Log NCR →" link

- [ ] **Step 3: Test IPC tab**

1. Click IPC tab
2. Select a batch → confirm IPC params appear (Parison Weight, Wall Thickness, etc.)
3. Save a passing check → confirm it appears in IPC table (not IQC)

- [ ] **Step 4: Test OQC tab**

1. Click OQC tab → confirm OQC-specific params appear (Final Visual Inspection, etc.)

- [ ] **Step 5: Test NCR flow from NG toast**

1. Save an NG check on IQC tab
2. Click "Log NCR →" in the toast
3. Confirm ncr.html opens with batch and stage pre-filled in the form
4. Select a Critical defect → confirm Severity auto-fills as "Critical"
5. Save → confirm CAPA banner appears: "CAPA Required: Critical defect detected (CT002) — Go to Compliance →"
6. Confirm NCR row appears in NCR Log table with status "Open"

- [ ] **Step 6: Test Defect Catalogue tab**

1. On ncr.html, click "Defect Catalogue" tab
2. Confirm 15 cards render with correct severity colors (red=Critical, orange=Major, green=Minor)
3. Click a `<details>` element → confirm corrective action hint expands

- [ ] **Step 7: Test edit/delete NCR (authorised role)**

1. Log in as a director or supervisor
2. Click a NCR row → detail panel opens
3. Click Edit → form opens pre-filled → change qty → Save → confirm table updates
4. Open detail again → Delete → confirm row removed from table

- [ ] **Step 8: Test edit/delete NCR (unauthorised role)**

1. Log in as operator
2. Confirm NCR rows have no Edit/Del buttons in the table
3. Open detail panel → confirm no Edit/Delete buttons

- [ ] **Step 9: Final commit and push to GitHub**

```bash
git add quality.html js/quality.js ncr.html js/ncr.js gas/Code.gs
git status
git push origin master
```

---

## Self-Review Against Spec

| Spec requirement | Task that covers it |
|---|---|
| IQC/IPC/OQC as 3 tabs in quality.html | Task 5 (HTML), Task 6 (JS) |
| `getInspectionParams(stage, product_id)` from KB const | Task 2 |
| Param buttons auto-fill spec_min, spec_max, unit, aql_level | Task 6 Step 7 (renderParamButtons) |
| On save: result = NG → toast with "Log NCR →" | Task 6 Step 8 (submitCheck) |
| `stage` column in QualityChecks sheet | Task 1 |
| `saveQualityCheck` / `getQualityChecks` accept stage | Task 1 |
| NCR form with all 10 fields | Task 7 |
| URL params pre-fill batch + stage | Task 8 (readURLParams) |
| Defect type → severity auto-fill | Task 8 (openNCRForm onchange) |
| saveNCR with auth guard + validation | Task 3 |
| NCR ID format YPP-NCR-YYMM-NNN | Task 3 |
| NCR_Log sheet created on first save | Task 3 |
| CAPA trigger: Critical → banner | Task 3 (saveNCR) + Task 8 (showCAPABanner) |
| CAPA trigger: rejection rate | Task 3 (saveNCR) |
| CAPA banner → link to compliance.html | Task 7 + Task 8 |
| Defect catalogue tab: 15 cards | Task 8 (renderDefectCatalogue) |
| NCR edit/delete for director/qmr/supervisor | Task 8 (editNCR, deleteNCR, role check) |
| Unauthorised role: no edit/delete buttons | Task 8 (renderNCRTable canEdit check) |
| `getDefectCatalogue()` from KB const | Task 2 |
| `getNCRList(filters)` | Task 3 |
