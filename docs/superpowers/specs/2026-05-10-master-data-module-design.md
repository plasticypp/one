# YPP ERP — Module 2: Master Data Design Spec

**Date:** 2026-05-10
**Status:** Approved

---

## Goal

Build a Masters section accessible via a 5th bottom tab (director/QMR only) that allows viewing and editing of all 8 reference entities: Products, Customers, Suppliers, Equipment, Tooling, Spares, Personnel, and BOM. Pre-seed all sheets with real KB data + clearly-marked demo placeholders.

---

## Access Control

| Role | Masters Tab | Edit Forms |
|------|-------------|------------|
| director | ✅ visible | ✅ add / edit / deactivate |
| qmr | ✅ visible | ✅ Products, Equipment only |
| supervisor | ❌ hidden | ❌ |
| operator | ❌ hidden | ❌ |
| store | ❌ hidden | ❌ |
| hr | ❌ hidden | ❌ |

---

## Navigation

- `nav.js`: add 5th tab `{ id: 'masters', icon: '⚙️', labelKey: 'nav.masters', roles: ['director','qmr'] }`
- `app.html`: add `<div class="tab-content hidden" data-tab="masters">` — contains an iframe-less link to `masters.html`
- Tapping Masters tab navigates to `masters.html` (full page nav, not SPA within app.html — keeps app.html lean)
- `masters.html` has its own header + back button → returns to `app.html`

---

## masters.html Structure

```
masters.html
├── Header: "Master Data" + back button
├── Entity tab bar (horizontal scroll): Products | Customers | Suppliers | Equipment | Tooling | Spares | Personnel | BOM
├── Entity list panel (default view)
│   ├── Search/filter input
│   ├── Record rows (name + key detail + status badge)
│   └── FAB "+" button (director only)
└── Edit form panel (slides in on tap)
    ├── Back button → returns to list
    ├── All fields for entity
    ├── Save button
    └── Deactivate/Delete button (director only)
```

---

## Entity Definitions & Fields

### Products
| Field | Type | Notes |
|-------|------|-------|
| ProductID | text | auto: PRD001… |
| SKU | text | e.g. YPP-100-N |
| Name | text | e.g. 100ml HDPE Bottle |
| Capacity_ml | number | 100/200/1000/5000 |
| Material | text | HDPE |
| HSN | text | demo: 3923 |
| Weight_g | number | demo values |
| WallThickness_mm | number | demo values |
| NeckSize_mm | number | demo values |
| Status | select | Active/Inactive |

### Customers
| Field | Type | Notes |
|-------|------|-------|
| CustomerID | text | auto: CUS001… |
| Code | text | e.g. AP |
| Name | text | |
| GSTIN | text | demo |
| Address | textarea | demo |
| Contact | text | demo |
| Phone | text | demo |
| Email | text | demo |
| ApprovedSince | date | demo |
| SpecialNotes | textarea | from KB requirements |
| Active | checkbox | |

### Suppliers
| Field | Type | Notes |
|-------|------|-------|
| SupplierID | text | auto: SUP001… |
| Code | text | S001… |
| Name | text | |
| Category | select | RM/Packaging/Spare/Utility |
| GSTIN | text | demo |
| Address | textarea | demo |
| Contact | text | demo |
| Phone | text | demo |
| Email | text | demo |
| PaymentTerms | text | demo: Net 30 |
| LeadDays | number | demo |
| Approved | checkbox | |
| Active | checkbox | |

### Equipment
| Field | Type | Notes |
|-------|------|-------|
| EquipID | text | auto: EQ001… |
| Name | text | |
| Type | select | Machine/Instrument |
| Location | text | |
| SerialNo | text | demo |
| Commissioned | date | demo |
| CalibFreq | number | months |
| LastCalib | date | demo |
| NextCalib | date | demo |
| Status | select | Active/Under Maintenance/Inactive |

### Tooling
| Field | Type | Notes |
|-------|------|-------|
| ToolID | text | auto: TL001… |
| Name | text | |
| Type | text | Blow Mould |
| ProductID | select | dropdown from Products |
| MachineID | select | dropdown from Equipment (Machines only) |
| Cavities | number | |
| ShotCount | number | demo: 0 |
| Manufacturer | text | demo |
| Status | select | Active/Under Repair/Retired |

### Spares
| Field | Type | Notes |
|-------|------|-------|
| SpareID | text | auto: SP001… |
| Name | text | |
| SupplierID | select | dropdown from Suppliers |
| Unit | select | nos/set/kg/ltr |
| CurrentStock | number | demo: 0 |
| ReorderLevel | number | demo |
| LeadDays | number | demo |
| Location | text | demo: Store |

### Personnel
| Field | Type | Notes |
|-------|------|-------|
| PersonID | text | auto: P001… |
| Name | text | |
| Username | text | links to Users sheet |
| Role | select | director/qmr/supervisor/operator/store/hr |
| Department | text | |
| ReportsTo | text | |
| Phone | text | demo |
| Email | text | demo |
| DateJoined | date | demo |
| Qualification | text | demo |
| Active | checkbox | |

### BOM
| Field | Type | Notes |
|-------|------|-------|
| BOMID | text | auto: BOM001… |
| ProductID | select | dropdown from Products |
| MaterialID | text | e.g. HDPE Natural |
| MaterialType | select | RM/Masterbatch/Additive |
| Qty_kg | number | demo: 0.1 |
| Unit | text | kg |
| Remarks | text | demo |

---

## Data Architecture

### Seed Function
`seedMasterData()` in `Code.gs` — run once from Apps Script editor. Writes all 8 sheets with:
- Real data from KB where available
- Demo placeholders marked with `[DEMO]` prefix for easy find/replace
- Does NOT overwrite if sheet already has data rows (checks row count first)

### Apps Script Actions (new)

**doGet additions:**
- `getMasterList?entity=Products` → returns all rows for entity
- `getMasterDropdown?entity=Products` → returns id+name pairs for dropdowns

**doPost additions:**
- `saveMaster` → `{ entity, row }` → upsert by ID (insert if new ID, update if exists)
- `deactivateMaster` → `{ entity, id }` → sets Active/Status to Inactive

### Frontend Files
- `masters.html` — full page, entity tabs, list + slide-in form
- `js/masters.js` — entity configs, list render, form render, save/deactivate logic
- `css/masters.css` — horizontal entity tab bar, entity-specific form styles (extends style.css)
- `lang/en.json` + `lang/hi.json` — new keys for Masters UI strings

---

## UI Patterns

- **Entity tab bar:** horizontal scroll, pill-style active indicator, same font as bottom tab bar
- **List rows:** name (bold) + key detail (grey) + status badge (green Active / red Inactive)
- **FAB "+":** fixed bottom-right, YPP orange `#F57C00`, visible to director only
- **Edit form:** slides in from right (CSS transform), back arrow top-left, Save button bottom full-width
- **Deactivate:** red "Deactivate" text button below Save, director only, confirm before action
- **Demo fields:** no special UI marker — data is marked `[DEMO]` in the value itself so staff know to update

---

## Language Strings (new keys)

```
nav.masters, masters.title, masters.back,
masters.tab.products, masters.tab.customers, masters.tab.suppliers,
masters.tab.equipment, masters.tab.tooling, masters.tab.spares,
masters.tab.personnel, masters.tab.bom,
masters.add, masters.save, masters.deactivate, masters.confirm.deactivate,
masters.search, masters.status.active, masters.status.inactive,
masters.saved, masters.error.save
```

---

## Success Criteria

1. Director taps Masters tab → `masters.html` opens
2. Each entity tab loads its list from the sheet
3. Tap any record → edit form slides in with pre-filled values
4. Save updates the sheet row; back returns to list
5. FAB "+" opens blank form; Save inserts new row
6. Deactivate sets status to Inactive, row shows grey badge
7. QMR sees Masters tab but FAB and Deactivate are hidden except on Products and Equipment
8. All UI text switches EN↔HI correctly
9. Seed function populates all 8 sheets with real+demo data, does not overwrite existing rows
