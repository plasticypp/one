# Wave 4 Design Spec — Stock + Dispatch + Batch Traceability
**Date:** 2026-05-11
**Status:** Approved

---

## Overview

Wave 4 wires batch traceability as the operational spine of the YPP ERP. Every production batch gets a `BatchTraceability` record that links RM receipt (GRN) → quality checks (IQC/IPC/OQC, Wave 3) → dispatch. The dispatch flow enforces OQC clearance before a batch can leave, and generates a QR-coded label encoding a public URL. `batch.html` is a public, no-auth page customers can scan to view batch info.

KB files consumed: `bom.json`, `suppliers.json`, `packaging_specs.json`, `label_specs.json`, `batch_traceability.json`.

---

## Architecture & Data Flow

```
GRN (RM receipt)
    → appends to RMStock sheet (date, grn_id, supplier_id, material, lot_no, qty_kg)

QualityChecks (IQC/IPC/OQC — Wave 3)
    → saveQualityCheck auto-upserts BatchTraceability row on first batch_no seen
    → updates oqc_status when stage=OQC

BatchTraceability sheet (spine)
    → read by dispatch: only OQC_passed batches available for selection
    → read by batch.html: public view of full thread

DispatchLog (existing)
    → updated: now carries batch_no + polybag_qty + label_url per dispatch line

batch.html (public, no auth)
    → reads BatchTraceability + QualityChecks + DispatchLog by batch_no
    → renders QR code client-side (qrcode.js CDN)
```

---

## GAS Endpoints

### New endpoints
| Function | Description |
|---|---|
| `getBatchRecord(batch_no)` | Full thread for one batch: RM lot, quality results, dispatch info |
| `getBatchList(status)` | List batches filtered by status (e.g. `OQC_passed`, `dispatched`) |
| `getRMStock()` | Current stock per material: sum(GRN qty_kg from RMStock) − sum(BOM qty_per_unit_kg × batch count per product from BatchTraceability) |

### Modified endpoints
| Function | Change |
|---|---|
| `saveQualityCheck` | Auto-upsert `BatchTraceability` row; update `oqc_status` on OQC stage |
| `saveGRN` | Wire to real `RMStock` sheet (was stub); populate from `SUPPLIERS` KB const |
| `getGRNList` | Wire to `RMStock` sheet reads |
| `recordDispatch` | Add `batch_no`, `polybag_qty`, `label_url` fields to dispatch row |

### KB constants hardcoded in Code.gs
- `SUPPLIERS` — id, name, category, items_supplied (for GRN supplier dropdown)
- `PACKAGING_SPECS` — product_id → polybag_qty, marking_fields (polybag only this wave)
- `LABEL_SPECS` — product_id → fields_required, batch_format, QR URL template

---

## Sheet Schema

### RMStock (auto-created on first saveGRN)
| Column | Type | Notes |
|---|---|---|
| date | string | YYYY-MM-DD |
| grn_id | string | GRN-YYMM-NNN |
| supplier_id | string | ref suppliers.json |
| material | string | e.g. "HDPE Resin" |
| lot_no | string | supplier lot number |
| qty_kg | number | received quantity |

### BatchTraceability (auto-created on first saveQualityCheck with new batch_no)
| Column | Type | Notes |
|---|---|---|
| batch_no | string | YPP-BYYMM-NNN (primary key) |
| product_id | string | ref products.json |
| production_date | string | YYYY-MM-DD |
| shift | string | A or B |
| machine_id | string | blow moulding machine |
| mould_id | string | tooling used |
| rm_lot_no | string | linked GRN lot |
| oqc_status | string | null / OK / NG |
| dispatch_id | string | null until dispatched |
| created_at | string | ISO timestamp |

---

## Pages & JS Modules

### New: `batch.html` + `js/batch.js`
- Public page, no auth required
- URL pattern: `batch.html?batch=YPP-B2503-001`
- Reads `getBatchRecord(batch_no)` on load
- Displays: product name, production date, shift, machine, OQC result, dispatch date + customer
- Renders QR code client-side using qrcode.js (CDN, same pattern as existing CDN usage)
- Shows "Batch not found" message if batch_no unknown
- Print-friendly layout (CSS `@media print`)

### Modified: `js/grn.js`
- Wire `saveGRN` and `getGRNList` to real GAS endpoints (currently stubs)
- Populate supplier dropdown from `SUPPLIERS` KB const via `getSuppliers()` endpoint
- Stock Levels tab: call `getRMStock()`, render table with material / current stock / low-stock flag (< 100 kg threshold highlighted)

### Modified: `js/dispatch.js`
- Replace free-text batch_no field with batch selection panel
- Panel fetches `getBatchList('OQC_passed')` and shows: batch_no, product, production date, qty available
- Add polybag qty input field to dispatch form
- On dispatch confirm: compute `label_url = https://plasticypp.github.io/one/batch.html?batch=<batch_no>`; pass to `recordDispatch`
- After successful dispatch: open print-ready QR label in new tab via `window.open(labelPrintUrl)`
- QR label print page: minimal HTML with qrcode.js rendering the label_url, product name, batch_no, date — printed via `window.print()`

---

## QR Label

**URL encoded:** `https://plasticypp.github.io/one/batch.html?batch=YPP-B2503-001`

**Label fields displayed alongside QR:**
- Product name
- Batch no
- Mfg date
- Polybag qty
- Manufacturer name (Yash Poly Pack)

**Print method:** `window.print()` on a minimal print-only page opened in a new tab. No external print service.

---

## Packaging (Wave 4 scope)
- Polybag only (carton config deferred)
- `polybag_qty` captured at dispatch time
- `PACKAGING_SPECS` KB const provides `marking_fields` reference only this wave

---

## Roles & Access

| Action | Roles |
|---|---|
| Create GRN | store_dispatch, supervisor, director |
| View stock levels | all roles |
| Select batch for dispatch | store_dispatch, supervisor, director |
| Record dispatch + print QR label | store_dispatch, supervisor, director |
| View `batch.html` | public (no auth) |

---

## Error States

| Condition | Behaviour |
|---|---|
| Batch selected with `oqc_status ≠ OK` | Dispatch blocked; toast: "Batch not OQC cleared" |
| Batch already fully dispatched | Dispatch blocked; toast: "Batch already dispatched" |
| `batch.html` with unknown batch_no | Shows "Batch not found" — no error thrown |
| GRN with duplicate lot_no | Warning toast; save proceeds (split deliveries allowed) |

---

## Out of Scope (Wave 4)
- Carton config / pallet layout (packaging_specs deferred)
- BOM cost calculation (total_rm_cost_per_unit)
- Supplier approval workflow
- Customer complaints (Wave 6)
