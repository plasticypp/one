# Dispatch Module Redesign — YPP ERP
**Date:** 2026-05-12  
**Status:** Approved for implementation  
**Stack:** Vanilla JS + Google Apps Script + GitHub Pages

---

## Context

YPP (Yash Poly Plast, Navi Mumbai) is an HDPE blow-moulding factory operating a mixed make-to-order / make-to-stock model. The existing dispatch module has the following critical flaws:

- Dispatcher creates Sales Orders (wrong role — should be director/store)
- No visibility of available finished goods batches alongside pending orders
- FG stock depletion deducts from first-available batch, not the selected one (data corruption)
- OQC status maintained in two places (BatchTraceability + OQC_Records), reconciled at dispatch time
- Dispatch log is read-only with no reprint capability
- No dispatch challan document

This spec defines a full redesign of `dispatch.html` and `js/dispatch.js` with matching GAS backend changes.

---

## Real Factory Flow (Mixed Model)

```
Customer sends PO
  → Director/Store creates Sales Order (NOT dispatcher)
  → Dispatcher opens dispatch module
  → Sees pending SOs on left, available FG batches on right
  → Selects SO → matching batches highlight on right
  → Selects batch → dispatch strip slides up
  → Fills qty / vehicle / driver / date
  → Confirms → challan prints → FG stock depleted from that batch
```

---

## Screen Layout

Single screen, no navigation between forms. Two-column layout with a sliding bottom strip.

```
┌─────────────────────────────────────────────────────────────┐
│  DISPATCH                                    [EN] [↩ App]   │
├──────────────────────┬──────────────────────────────────────┤
│  LEFT PANEL          │  RIGHT PANEL                         │
│  [Orders] [Log]      │  All OQC-cleared undispatched batches│
│                      │  Filter: [Product ▾] [Search]        │
│  Filter: [Status ▾]  │                                      │
│  ──────────────────  │  ┌──────────────────────────────┐   │
│  SO001 · Alchemist   │  │ YPP-B2503-001                │   │
│  HDPE Can 5L         │  │ HDPE Can 5L · 4850 pcs       │   │
│  Remaining: 1000 pcs │  │ OQC ✓ · 12d ago · BM-01      │   │
│  Age: 3d  [SELECTED] │  │ Prod: 2025-05-01             │   │
│                      │  └──────────────────────────────┘   │
│  SO002 · Sun Pack    │                                      │
│  HDPE Bottle 1L      │  ┌──────────────────────────────┐   │
│  Remaining: 500 pcs  │  │ YPP-B2504-001  [SELECTED]    │   │
│  Age: 1d             │  │ HDPE Bottle 1L · 2980 pcs    │   │
│                      │  │ OQC ✓ · 5d ago · BM-02       │   │
│                      │  │ Prod: 2025-05-07             │   │
│                      │  └──────────────────────────────┘   │
├──────────────────────┴──────────────────────────────────────┤
│  DISPATCH STRIP  (slides up when SO + batch both selected)  │
│  SO001 · Alchemist Chemicals · HDPE Can 5L                  │
│  Batch: YPP-B2503-001 · Available: 4850 pcs                 │
│                                                             │
│  Dispatch Qty* [______]  Date* [__________]                 │
│  Vehicle       [______]  Driver [_________]  Invoice [____] │
│                                                             │
│                                       [Confirm Dispatch ▶]  │
└─────────────────────────────────────────────────────────────┘
```

### Left Panel — Orders Tab

- Lists SOs with status `Pending` or `Partial`, sorted oldest first
- Each row shows: SO ID, customer name, product name, qty remaining, age in days
- Clicking a row selects it (highlighted); right panel dims non-matching batches, matching ones glow green
- Clicking again deselects; right panel returns to full view
- Filter dropdown: All / Pending / Partial
- No "New SO" button — SO creation is not dispatcher's role

### Left Panel — Log Tab

- Dispatch history table: Dispatch ID, date, SO, customer, product, batch no, qty, vehicle
- Each row: "Reprint Challan" button → opens `challan.html?id=DISxxx` in new tab
- Filter: date range (from/to) and customer dropdown

### Right Panel — FG Batches

- Always shows all OQC-cleared, undispatched batches across all products
- When an SO is selected: batches matching that product are highlighted (green border), others dimmed (50% opacity) but still visible and selectable
- Each batch card shows:
  - Batch no (bold)
  - Product name
  - Qty available (pcs)
  - OQC ✓ badge
  - Age: X days since production date
  - Production date
  - Machine ID
- Clicking a card selects it (blue border); if an SO is already selected, dispatch strip slides up
- Filter: product dropdown (all products or specific), search by batch no
- Empty state: "No OQC-cleared batches available. Check production module."

### Bottom Strip — Dispatch Action

- Hidden by default; slides up (`transform: translateY`) when BOTH an SO and a batch are selected
- Pre-filled read-only: SO ID, customer name, product name, batch no, available qty
- Dispatcher fills:
  - **Dispatch Qty*** — number, max = min(SO remaining, batch available qty)
  - **Dispatch Date*** — date picker, defaults to today
  - **Vehicle / LR No** — free text, optional
  - **Driver Name** — free text, optional
  - **Invoice No** — free text, optional
- Validation before submit:
  - Qty > 0 and ≤ available
  - Date not empty
  - Batch OQC status = OK (enforced server-side)
- On confirm:
  1. POST to GAS `saveDispatch`
  2. Success → toast "Dispatched — DIS001" → `challan.html?id=DIS001` opens in new tab
  3. SO row updates qty remaining; if fully dispatched, SO removed from left panel
  4. Batch card removed from right panel (now dispatched)
  5. Strip slides back down; selections cleared

---

## Challan Page (`challan.html`)

Standalone page, query param `?id=DISxxx`. Calls `getChallan` GAS endpoint.

**Content:**
- YPP letterhead (company name, address, GSTIN)
- Dispatch Challan heading + Dispatch ID + date
- Customer: name, address, GSTIN
- Table: Product, Batch No, Qty Dispatched, Unit
- Vehicle No, Driver Name, LR No
- Invoice No (if present)
- Authorised By (name of logged-in user)
- Auto-calls `window.print()` on load
- Print CSS: hides all buttons, full-width layout

---

## GAS Backend Changes

### New / Modified Functions

| Function | Type | Description |
|----------|------|-------------|
| `getFGBatches` | New | Returns all OQC-cleared undispatched batches. Joins product name from Products sheet. Fields: batch_no, product_id, product_name, qty, production_date, machine_id, oqc_status, age_days |
| `getSOList` | Modified | Default filter = Pending+Partial. Add `qty_remaining` computed field (qty_ordered - qty_dispatched). Join customer_name from Customers sheet. |
| `saveDispatch` | Modified | Fix FG depletion: deduct from the specific batch_id passed in, not first-available. Single OQC source: check BatchTraceability.oqc_status only (OQC_Records is audit trail, not gate). |
| `getDispatchLog` | Modified | Join customer_name + product_name. Return vehicle_no, driver_name. |
| `getChallan` | New | Returns full challan data for a dispatch ID: SO, customer (name+address+GSTIN), product, batch, qty, vehicle, driver, invoice, dispatched_by name. |

### FG Depletion Fix (Critical)

Current code deducts from first-available FG row for the product. New behaviour:

```
saveDispatch receives: { batch_no, product_id, qty, ... }
→ Find FG row where batch_id = batch_no AND product_id matches AND status = 'Available'
→ If not found: return { error: 'batch_not_in_fg_stock' }
→ If found but qty < dispatch qty: return { error: 'insufficient_stock' }
→ Deduct from that specific row only
→ If row qty reaches 0: set status = 'Depleted'
→ If row qty > 0: update qty in place (partial dispatch of batch)
```

### OQC Source Consolidation

Remove dual-source OQC check from `saveDispatch`. Single rule:
- `BatchTraceability.oqc_status === 'OK'` → allow dispatch
- Anything else → block (director override checkbox still available for edge cases)
- `OQC_Records` sheet remains as audit trail only; `saveOQC` continues to write there AND update BatchTraceability

---

## Data Flow

```
GAS Sheets:
  SalesOrders      → getSOList       → Left panel (Orders tab)
  BatchTraceability → getFGBatches   → Right panel (FG cards)
  Products         → join for names  → both panels
  Customers        → join for names  → left panel + strip + challan
  Dispatch         → saveDispatch    → creates row
                   → getDispatchLog  → Left panel (Log tab)
                   → getChallan      → challan.html
  FinishedGoods    → saveDispatch    → deducts specific batch qty
```

---

## Files Changed

| File | Change |
|------|--------|
| `dispatch.html` | Full rewrite — two-column layout, batch cards, dispatch strip, log tab |
| `js/dispatch.js` | Full rewrite — new state machine (selectedSO, selectedBatch), strip logic, log tab |
| `gas/Code.gs` | Add getFGBatches, getChallan; modify getSOList, saveDispatch, getDispatchLog |
| `challan.html` | New file — print-optimised challan page |

---

## What Is NOT Changing

- OQC inspection form (saveOQC, OQC panel) — already works, keep as-is
- Plan Batch panel — keep for make-to-order flow (SO → trigger production plan)
- Auth / session / role system
- All other modules (production, quality, GRN, etc.)

---

## Out of Scope

- SO creation UI — handled in a future Sales module
- Vehicle master data — free text for now
- EDI / PO import from customers
- Multi-batch dispatch (one SO, multiple batches in one transaction) — future wave
