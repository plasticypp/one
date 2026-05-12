# Inspection Matrix Module — YPP ERP
**Date:** 2026-05-12  
**Status:** Approved for implementation  
**Stack:** Vanilla JS + Google Apps Script + GitHub Pages

---

## Context

YPP ERP needs a reusable, real-time parameter entry matrix for in-process and final quality checks. Currently IPC/OQC data entry is a flat form — no time tracking, no period-based structure, no live out-of-spec alerting. The matrix replaces this with a column-per-period, row-per-parameter grid that operators fill in real time on the factory floor.

The matrix is a **shared component** used by three modules:
- **IPC** (In-Process Check) — during production, per batch
- **OQC** (Outgoing Quality Check) — before dispatch, per batch
- **Cleaning Checklist** — per shift/machine

---

## How It Works

```
Operator opens IPC page → selects batch → clicks "Start IPC Check"
  → ipc-matrix.html?batch=YPP-B2503-001&shift=A&stage=IPC opens
  → Parameters load from QualityParams sheet (stage = IPC)
  → Matrix renders: rows = parameters, columns = periods (empty at start)

Operator clicks ▶ (Play)
  → New period column added: "Period 1 — 09:14"
  → Timer starts (HH:MM:SS counting up, shown below button)
  → All cells in that column become editable

Operator fills measurements:
  → Numeric rows: type value → cell turns green (in-spec) or red (out-of-spec)
  → Pass/Fail rows: tap Pass / Fail toggle
  → Out-of-spec cell: red + "Action Taken" text field appears below that cell (required)

Operator clicks ▶ again (Stop)
  → Timer stops → duration recorded (e.g., "12m 34s")
  → Validation: all out-of-spec cells must have "Action Taken" filled
  → Period auto-saves to GAS (saveMatrixPeriod)
  → Column header updates: "Period 1 — 09:14 — 12m34s"
  → New ▶ button appears for next period

Operator clicks + to add another period (same as clicking ▶ on a fresh column)

When all periods done:
  → Operator clicks "Submit & Close Session"
  → Summary: total periods, total duration, any out-of-spec count
  → Saves session record (saveMatrixSession)
  → Page closes / redirects back to calling module
```

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  IPC CHECK                              [Batch: YPP-B2503-001] [↩]  │
│  HDPE Can 5L · Shift A · Machine BM-01 · Started: 09:12            │
├──────────────────┬──────────────┬──────────────┬────────────────────┤
│  PARAMETER       │  PERIOD 1    │  PERIOD 2    │  PERIOD 3          │
│                  │  09:14       │  10:31       │  11:45             │
│                  │  ■ 12m34s    │  ■ 08m12s    │  ▶ 00:03:21        │
├──────────────────┼──────────────┼──────────────┼────────────────────┤
│  — NUMERIC —     │              │              │                    │
│  Parison Wt (g)  │  [120] ✓    │  [118] ✓    │  [131] ✗           │
│  spec: 115–125   │              │              │  Action: [______]  │
│  Wall Th. Sh(mm) │  [2.1] ✓    │  [2.0] ✓    │  [2.2] ✓           │
│  spec: 1.8–2.4   │              │              │                    │
│  Height (mm)     │  [245] ✓    │  [244] ✓    │  [246] ✓           │
│  spec: 240–250   │              │              │                    │
│  OD (mm)         │  [98.2] ✓   │  [98.1] ✓   │  [98.5] ✓          │
│  spec: 97–100    │              │              │                    │
├──────────────────┼──────────────┼──────────────┼────────────────────┤
│  — PASS / FAIL — │              │              │                    │
│  Leak Test       │  [✓ Pass]   │  [✓ Pass]   │  [✗ Fail]          │
│                  │              │              │  Action: [______]  │
│  Cap Fitment     │  [✓ Pass]   │  [✓ Pass]   │  [✓ Pass]          │
│  Flash           │  [✓ Pass]   │  [✗ Fail]   │  [✓ Pass]          │
│                  │              │  Action:[██] │                    │
├──────────────────┴──────────────┴──────────────┴────────────────────┤
│                                          [+ Add Period]             │
│                                  [Submit & Close Session ▶]         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pages

### `ipc-matrix.html`
- Query params: `batch`, `shift`, `stage=IPC`
- Loads IPC parameters from QualityParams (stage = IPC)
- On submit: saves to IPC_Records, redirects to `ipc.html`

### `oqc-matrix.html`
- Query params: `batch`, `stage=OQC`
- Loads OQC parameters from QualityParams (stage = OQC)
- On submit: saves to OQC_Records, updates BatchTraceability.oqc_status, redirects to dispatch

### `cleaning-matrix.html`
- Query params: `machine`, `shift`, `stage=Cleaning`
- Loads Cleaning parameters from QualityParams (stage = Cleaning)
- On submit: saves to Cleaning_Records, redirects to maintenance

### Shared JS: `js/matrix.js`
Single reusable module handles:
- Period column management (add, start timer, stop timer)
- Cell rendering (numeric input with spec limits vs pass/fail toggle)
- Out-of-spec detection and action field injection
- Auto-save per period (saveMatrixPeriod)
- Session submit (saveMatrixSession)
- Timer display (HH:MM:SS counting up, duration on stop)

---

## Parameter Definitions (QualityParams Sheet)

Parameters are stored in the `QualityParams` sheet — not hardcoded. Seeded from INSPECTION_PLANS constant on first run.

**Schema:**
```
param_id | stage | product_id | parameter | unit | type | spec_min | spec_max | aql_level | sample_size | active
```

- `stage`: IPC / OQC / IQC / Cleaning
- `type`: `numeric` or `passfail`
- `spec_min` / `spec_max`: for numeric only — cell turns red if value outside range
- `product_id`: `ALL` or specific product (e.g., PRD001) — matrix loads ALL + product-specific
- `active`: Yes/No — allows disabling without deleting

**Seed data from INSPECTION_PLANS:**

IQC (5 params): MFI, Density, Bulk Density, Visual Inspection, CoA Verification  
IPC (10 params): Parison Weight, Wall Thickness ×3, Height, OD, Neck OD, Leak Test, Cap Fitment, Flash  
OQC (7 params): Weight AQL, Dimensional AQL, Leak AQL, Visual Result, Label AQL, Torque AQL, Carton Qty AQL  
Cleaning (add): Machine surface, Hopper, Die head, Cooling system, Floor area — all Pass/Fail

---

## Period State Machine

```
IDLE → [▶ pressed] → RUNNING → [▶ pressed] → SAVED
                                    ↓
                              validation gate:
                              all out-of-spec must have action taken
                              → if fail: show errors, stay RUNNING
                              → if pass: auto-save, show duration, SAVED
```

Each period stored in memory as:
```js
{
  period_no: 1,
  started_at: '2025-05-12T09:14:00',
  stopped_at: '2025-05-12T09:26:34',
  duration_sec: 754,
  values: {
    'IP006': { value: 120, status: 'ok' },
    'IP007': { value: 131, status: 'oos', action_taken: 'Adjusted parison program' },
    'IP015': { value: 'Fail', status: 'oos', action_taken: 'Cleaned die head' }
  },
  saved: true
}
```

---

## GAS Backend

### New Functions

| Function | Description |
|----------|-------------|
| `getQualityParams(stage, product_id)` | Returns active params for stage + product. Filters ALL + product-specific. |
| `saveMatrixPeriod(data)` | Saves a single period record. Writes to stage-appropriate sheet (IPC_Records / OQC_Records / Cleaning_Records). |
| `saveMatrixSession(data)` | Saves session summary: batch, stage, total periods, total duration, out-of-spec count, submitted_by, submitted_at. Writes to Matrix_Sessions sheet. |
| `seedQualityParams()` | Populates QualityParams sheet from INSPECTION_PLANS + cleaning params if empty. |

### Modified Functions

| Function | Change |
|----------|--------|
| `getIPCParams` | Now calls `getQualityParams('IPC', product_id)` |
| `getOQCParams` | Now calls `getQualityParams('OQC', product_id)` |
| `getIQCParams` | Now calls `getQualityParams('IQC', 'ALL')` |

### New Sheet: `Matrix_Sessions`
```
session_id | stage | batch_id | machine_id | shift | started_at | submitted_at | 
total_periods | total_duration_sec | oos_count | submitted_by | status
```

### New Sheet: `Cleaning_Records`
```
record_id | session_id | machine_id | shift | period_no | started_at | stopped_at | 
duration_sec | param_id | value | status | action_taken
```

---

## Calling Module Integration

### IPC page (`ipc.html`)
- Batch selected → "Start IPC Check" button appears
- Click → `window.location.href = 'ipc-matrix.html?batch=X&shift=A&stage=IPC'`
- On return: IPC records list refreshes automatically

### OQC (dispatch flow)
- Batch selected in dispatch → "Perform OQC" button
- Click → `window.location.href = 'oqc-matrix.html?batch=X&stage=OQC'`
- On submit: BatchTraceability.oqc_status updated → dispatcher can now dispatch

### Cleaning checklist (`maintenance.html`)
- Machine + shift selected → "Start Cleaning Check" button
- Click → `window.location.href = 'cleaning-matrix.html?machine=BM-01&shift=A&stage=Cleaning'`

---

## Production + Finished Goods Flow Fix

Separate from the matrix but part of this wave:

**Problem:** FG can only be added by closing a batch. No param logs = batch cannot close. No direct FG entry.

**Fix:** When closing a batch, the close panel includes:
- Actual qty produced (required)
- Rejection qty + reason
- Downtime (min)
- End time
- Notes
- **IPC check count** shown (read-only, informational) — must have ≥1 IPC session submitted for this batch

FG record created automatically on batch close — no separate FG entry UI needed. The matrix (IPC) is the gate.

---

## Seed Data Plan

`seedAll` / `seedMasters` to call `seedQualityParams()` which:
1. Checks if QualityParams sheet is empty
2. If empty: writes all 22 INSPECTION_PLANS rows + 5 cleaning params
3. Logs result

---

## Files

| File | Type | Description |
|------|------|-------------|
| `ipc-matrix.html` | New | IPC period matrix page |
| `oqc-matrix.html` | New | OQC period matrix page |
| `cleaning-matrix.html` | New | Cleaning checklist matrix page |
| `js/matrix.js` | New | Shared matrix component (timer, periods, cells, validation) |
| `gas/Code.gs` | Modified | getQualityParams, saveMatrixPeriod, saveMatrixSession, seedQualityParams |
| `ipc.html` | Modified | Add "Start IPC Check" button per batch row |
| `dispatch.html` | Modified | OQC button links to oqc-matrix.html |
| `maintenance.html` | Modified | Add "Start Cleaning Check" button |

---

## Out of Scope

- Editing submitted periods (locked after save)
- Multi-product parameter sets (ALL covers all products for now)
- Statistical process control (SPC) charts — future wave
- Barcode/QR scan to load batch — future wave
- IQC matrix (IQC is a one-time check per GRN lot, not period-based — keep existing flat form)
