# Wave 3 — Quality Module Expansion: Design Spec
Date: 2026-05-11
Status: Approved

## Scope

Wire `inspection_plans.json` (22 records), `defect_catalogue.json` (15 defects), `capa_triggers.json` (12 rules) into the live ERP. Activate `ncr.html` from stub to full NCR+defect log. Extend `quality.html` from 2 tabs to 4 stage-split tabs.

Out of scope: COA templates (Wave 4), training module (Wave 5).

---

## 1. quality.html — Tab Restructure

### Before
- Tab 1: Summary (pass-rate cards per batch)
- Tab 2: Check Log (all checks, batch filter)

### After
- Tab 1: Summary (unchanged)
- Tab 2: IQC — Incoming Quality Control
- Tab 3: IPC — In-Process Control
- Tab 4: OQC — Outgoing Quality Control

### Per-Stage Tab Behaviour
Each of IQC / IPC / OQC:
- Renders its own check log table filtered by `stage` column in `QualityChecks` sheet
- "+ New Check" button opens the existing slide-in form
- On open, `getInspectionParams(stage, product_id)` is called to populate parameter buttons
- Parameters come from `inspection_plans.json` filtered by stage; each button auto-fills spec_min, spec_max, unit, aql_level
- Batch selector triggers product lookup → param reload (same as current behaviour)
- On save: if result = NG, toast shows "Check saved — NG. [Log NCR →]" button that navigates to `ncr.html?batch=X&stage=IQC`

### QualityChecks Sheet — New Column
Add `stage` column (values: IQC | IPC | OQC). Existing rows default to IPC.
`saveQualityCheck` and `updateRecord` must accept and persist `stage`.

---

## 2. ncr.html — NCR Log + Defect Catalogue

### Tabs
- Tab 1: Non-Conformance Log (default)
- Tab 2: Defect Catalogue (read-only reference)

### NCR Form (slide-in panel)
Fields:
| Field | Source |
|---|---|
| NCR ID | Auto: YPP-NCR-YYMM-NNN |
| Date | Date picker, default today |
| Batch ID | Dropdown from getBatchList |
| Stage | IQC / IPC / OQC (pre-filled from URL param if present) |
| Defect Type | Dropdown from defect_catalogue.json (15 options) |
| Severity | Auto-filled from defect catalogue (Critical / Major / Minor) |
| Qty Affected | Number input |
| Disposition | Select: Rework / Reject / Accept-on-deviation |
| Detected By | Text, default session.name |
| Remarks | Text optional |

### NCR Log Table Columns
`NCR ID | Date | Batch | Stage | Defect Type | Severity | Qty | Disposition | Status | Actions`

Status values: Open | Under-Review | Closed
Actions: edit / delete (roles: director, qmr, supervisor)

### CAPA Auto-Trigger Logic
After `saveNCR` backend runs, it evaluates `capa_triggers.json` rules:
- `critical_defect`: severity = Critical → always trigger
- `rejection_rate`: batch reject% > threshold → trigger
- `customer_complaint`, `repeat_nc`: evaluated against recent NCR history

If triggered: `saveNCR` returns `{ capa_required: true, capa_trigger_reason: "..." }`.
Frontend renders a sticky banner: "CAPA Required: [reason] — Go to Compliance →" (links to `compliance.html`).

### Defect Catalogue Tab
Read-only cards from `defect_catalogue.json`:
- Defect name (bold), severity chip (color-coded), detection stage badge
- Corrective action hint (truncated, expandable)
- 15 cards in a 2-column grid

---

## 3. Backend — Code.gs Additions

### New Functions

#### `getInspectionParams(stage, product_id)`
- Source: `inspection_plans.json` hardcoded as a const in Code.gs (no Drive read needed — static KB)
- Filter: `stage` exact match + `product_id` match (or `product_id = "ALL"` wildcard)
- Returns: `[{ param_id, parameter, unit, spec_min, spec_max, aql_level, instrument_id, sample_size }]`
- No auth required (read-only, non-sensitive)

#### `saveNCR(data)`
- Auth guard: `validateSession` + `requireRole(['director','qmr','supervisor','quality_inspector'])`
- Validates: `batch_id`, `defect_type`, `qty_affected`, `disposition` required
- Auto-generates NCR ID: `YPP-NCR-YYMM-NNN` (sequential, scoped to month)
- Writes to `NCR_Log` sheet
- Evaluates CAPA triggers (see Section 2)
- Returns: `{ success, ncr_id, capa_required, capa_trigger_reason }`

#### `getNCRList(filters)`
- Params: `batch_id`, `stage`, `status` (all optional)
- Returns filtered rows from `NCR_Log` sheet
- No auth required

#### `getDefectCatalogue()`
- Returns the 15 defects from `defect_catalogue.json` hardcoded const
- No auth required

### `NCR_Log` Sheet Schema
`ncr_id | date | batch_id | stage | defect_type | severity | qty_affected | disposition | detected_by | remarks | status | capa_required | capa_trigger_reason | created_by | created_at`

### Modified Functions
- `saveQualityCheck`: accept + persist `stage` param (default: `IPC`)
- `getQualityChecks`: accept `stage` filter param

---

## 4. Data Flow

```
User opens quality.html → selects IQC tab
  → getInspectionParams('IQC', product_id) → param buttons from KB
  → user records actual value → save
  → if NG: toast with "Log NCR →" link to ncr.html?batch=X&stage=IQC

User lands on ncr.html (from link or direct)
  → URL params pre-fill batch + stage
  → user selects defect type → severity auto-fills
  → save → saveNCR() → CAPA trigger check
  → if capa_required: banner shown, link to compliance.html
```

---

## 5. Files Changed

| File | Change |
|---|---|
| `quality.html` | Add IQC/IPC/OQC tabs (replace Check Log tab) |
| `js/quality.js` | Tab routing, stage param on save/load, NG toast with NCR link |
| `ncr.html` | Full implementation from stub |
| `js/ncr.js` | New file: NCR CRUD, defect catalogue render, CAPA banner |
| `gas/Code.gs` | 4 new functions + modify saveQualityCheck/getQualityChecks |

No changes to: `css/style.css` (existing styles cover all patterns), `auth.js`, `api.js`.

---

## 6. Testing Checklist

- [ ] IQC tab: param buttons load correct IQC parameters for a product
- [ ] IPC tab: param buttons load correct IPC parameters
- [ ] OQC tab: param buttons load correct OQC parameters
- [ ] NG save → toast with Log NCR link appears
- [ ] NCR form: URL params pre-fill batch + stage
- [ ] Defect type dropdown populates all 15 defects
- [ ] Severity auto-fills on defect selection
- [ ] Critical defect → capa_required = true → banner shown
- [ ] Non-critical defect below threshold → no banner
- [ ] Defect catalogue tab: 15 cards rendered
- [ ] NCR edit/delete works for authorised roles
- [ ] Unauthorised role: edit/delete buttons absent
