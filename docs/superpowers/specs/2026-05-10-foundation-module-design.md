# YPP ERP — Foundation Module Design
**Date:** 2026-05-10  
**Module:** 01 — Foundation (App Shell, Auth, Navigation, Sheets Skeleton)  
**Status:** Approved by user

---

## 1. Overview

Build the deployable shell of the YPP ERP system for M/s Yash Poly Plast, Navi Mumbai. This module delivers:
- Login with PIN-based authentication
- Role-based home screen (6 roles)
- Bilingual EN/HI toggle (per-user preference)
- Mobile-first bottom tab navigation
- Full Google Sheets workbook skeleton (28 tabs, all modules)
- Apps Script backend (login handler, doGet/doPost)

No module-specific UI is built in this phase. All subsequent modules slot into the established shell.

---

## 2. Architecture

```
GitHub Pages (static frontend)        Google Apps Script (backend)
──────────────────────────────        ────────────────────────────
index.html  — login screen            doGet(e)  — read requests
app.html    — main app shell          doPost(e) — write requests
config.json — Apps Script URL         login()   — PIN verify + role return
js/api.js   — all fetch() calls  ←──► Utilities.computeDigest() — PIN hash
js/auth.js  — session management
js/nav.js   — routing + tab bar       Google Sheets (1 workbook: "YPP-ERP")
js/lang.js  — bilingual toggle        ─────────────────────────────────────
js/app.js   — home tiles              28 tabs (header rows only at this stage)
lang/en.json
lang/hi.json
css/style.css
```

**Key constraints:**
- No JS framework, no build step — plain HTML/CSS/JS only
- `api.js` is the sole file that reads `config.json` for the Apps Script URL
- Session stored in `sessionStorage` (auto-clears on browser/tab close)
- Session expires after 8 hours (one shift)

---

## 3. Authentication

### Flow
1. User opens `index.html` — sees login screen
2. Username selected from dropdown (populated from `Users` sheet via Apps Script)
3. User enters 4–6 digit PIN
4. `api.js` sends `{action: "login", username, pin}` to Apps Script via POST
5. Apps Script computes SHA-256 of entered PIN, compares to stored hash in Users sheet
6. On match: returns `{success: true, role, lang, name}`
7. Frontend stores `{username, role, lang, name, loginTime}` in `sessionStorage`
8. App redirects to `app.html`, loads home screen filtered by role

### Error handling
- Wrong PIN: "गलत PIN है। फिर कोशिश करें।" / "Incorrect PIN. Please try again."
- User not found: "उपयोगकर्ता नहीं मिला।" / "User not found."
- 3 consecutive failures: 5-minute lockout (tracked in Users sheet, `FailCount` + `LockUntil` columns)

### Users Sheet Schema
| Column | Field | Notes |
|--------|-------|-------|
| A | UserID | P001, P002… |
| B | Name | Full name |
| C | Username | Login handle (e.g., tarun, pradhan) |
| D | PINHash | SHA-256 of PIN |
| E | Role | director / qmr / supervisor / operator / store / hr |
| F | Language | en / hi |
| G | Active | TRUE / FALSE |
| H | FailCount | Reset to 0 on successful login |
| I | LockUntil | Timestamp; blank if not locked |

### PIN Security
- PINs hashed with `Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pin)` in Apps Script
- Plain-text PINs never written to Sheets at any point
- Initial PIN setup: Admin runs a one-time Apps Script function to hash and store PINs

---

## 4. Navigation

### Bottom Tab Bar (all screens)
```
┌─────────────────────────────────────┐
│  YPP ERP              🌐 EN|HI  👤  │
│                                     │
│         [Module content area]       │
│                                     │
│                                     │
├──────┬──────┬──────┬────────────────┤
│ 🏠   │ ⚙️   │ 📦   │ 👤            │
│ Home │ Work │ Stock│ Profile        │
└──────┴──────┴──────┴────────────────┘
```

### Tab Visibility by Role
| Tab | Director | QMR | Supervisor | Operator | Store | HR |
|-----|:--------:|:---:|:----------:|:--------:|:-----:|:--:|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Work (Production/Quality) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Stock (Inventory/Dispatch) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Home Screen Tiles by Role
| Role | Tiles shown |
|------|-------------|
| Director | KPI summary, Production status, Dispatch pending, CAPA open |
| QMR | Quality alerts, Calibration due, NCR open, CAPA open |
| Supervisor | Active work orders, Machine status, Today's production |
| Operator | Start batch, Log parameters, Record defect, My batches |
| Store | GRN pending, RM stock alerts, Dispatch pending |
| HR | Training due, Personnel records |

---

## 5. Bilingual Toggle

- Language toggle (🌐 EN|HI) appears in top-right header on all screens
- Switching language: `lang.js` replaces all `data-i18n` attribute values from the active language JSON
- Language preference saved back to Users sheet (`Language` column) via Apps Script POST
- Login screen detects browser locale (`navigator.language`): defaults to `hi` if `hi` or `mr`, else `en`
- All strings (labels, placeholders, errors, button text, tab names) defined in:
  - `lang/en.json` — English
  - `lang/hi.json` — Simple spoken Hindi (not formal/bureaucratic)

### String key convention
```json
// en.json
{
  "login.title": "Yash Poly Plast ERP",
  "login.username": "Select User",
  "login.pin": "Enter PIN",
  "login.btn": "Login",
  "login.error.pin": "Incorrect PIN. Please try again.",
  "nav.home": "Home",
  "nav.work": "Work",
  "nav.stock": "Stock",
  "nav.profile": "Profile"
}
```

---

## 6. Google Sheets Workbook Skeleton

**Workbook name:** `YPP-ERP`  
**All tabs created with frozen header row only. No data rows in Module 1.**

### Tab List (28 tabs)

**Foundation (2)**
- `Users` — auth, roles, language preference
- `Config` — app-level settings (version, feature flags)

**Master Data (8)**
- `Products` — SKU master (PRD001–PRD004)
- `Customers` — C001–C003 and future
- `Suppliers` — S001–S007 and future
- `Equipment` — EQ001–EQ012
- `Tooling` — TL001–TL004
- `Spares` — SP001–SP010 and future
- `Personnel` — P001–P002 and future
- `BOM` — Bill of Materials per product

**Inventory (4)**
- `RM_Stock` — current raw material stock
- `FG_Stock` — current finished goods stock
- `GRN_Log` — goods receipt notes
- `Material_Issues` — RM issued to production

**Production (3)**
- `Work_Orders` — production orders
- `Production_Log` — shift-level parameter logs
- `Batch_Register` — master batch record (format: YPP-BYYMM-NNN)

**Quality (5)**
- `IQC_Records` — incoming quality control
- `IPC_Records` — in-process control
- `OQC_Records` — outgoing quality control
- `Defect_Log` — defect entries linked to batches
- `NCR_Register` — non-conformance reports

**Dispatch (3)**
- `Orders` — customer orders
- `Dispatch_Log` — dispatch records
- `Challans` — delivery challan register

**Maintenance (3)**
- `PM_Schedule` — preventive maintenance schedule
- `Breakdown_Log` — breakdown/corrective maintenance
- `Spare_Consumption` — spares used per maintenance event

**Compliance (4) + Meta (1)**
- `CAPA_Register` — corrective & preventive actions
- `Calibration_Log` — instrument calibration records
- `Training_Log` — staff training records
- `Legal_Register` — regulatory compliance tracker
- `KPI_Log` — daily/weekly KPI snapshots
- `_Meta` — hidden tab; sheet version, last modified timestamp

---

## 7. File Structure

```
ypp-erp/                          ← GitHub Pages root
├── index.html                    — login screen
├── app.html                      — main app shell (post-login)
├── config.json                   — { "apiUrl": "<Apps Script URL>", "version": "1.0.0" }
├── css/
│   └── style.css                 — mobile-first, single stylesheet; CSS variables for theme
├── js/
│   ├── api.js                    — all fetch() to Apps Script; reads config.json
│   ├── auth.js                   — login, logout, session read/write, expiry check
│   ├── nav.js                    — bottom tab bar render, routing, role-based tab visibility
│   ├── lang.js                   — load lang JSON, apply data-i18n, toggle handler
│   └── app.js                    — home screen tiles, role-based tile rendering
├── lang/
│   ├── en.json                   — all English UI strings
│   └── hi.json                   — all Hindi UI strings (simple spoken Hindi)
├── modules/                      — empty; future modules add subfolders here
└── gas/
    └── Code.gs                   — Apps Script: doGet, doPost, login, setupPins (one-time)
```

---

## 8. Apps Script (Code.gs) — Scope for Module 1

Functions implemented in this module:

| Function | Purpose |
|----------|---------|
| `doGet(e)` | Route read actions: `getUsers` (for login dropdown) |
| `doPost(e)` | Route write actions: `login`, `updateLanguage` |
| `login(data)` | Verify PIN hash, check lockout, return role/lang/name |
| `updateLanguage(data)` | Save language preference to Users sheet |
| `hashPin(pin)` | SHA-256 hash utility |
| `setupPins(pins)` | One-time admin function to initialize hashed PINs |
| `createWorkbookSkeleton()` | One-time function to create all 28 tabs with headers |

All functions return `{success: bool, data: {}, error: ""}` JSON envelope.

---

## 9. Mobile-First UI Principles

- Base font size: 16px minimum (no squinting)
- Touch targets: minimum 44×44px (Apple HIG standard)
- Color scheme: Clean white + YPP brand blue (#1565C0) + accent orange (#F57C00)
- No horizontal scroll on any screen
- Tested viewport: 360px wide (Android) and 768px (tablet)
- Inputs: full-width, large tap area, numeric keyboard for PIN (`inputmode="numeric"`)
- Loading states: spinner overlay during all API calls (prevents double-tap)

---

## 10. Out of Scope (This Module)

- Any module-specific data entry screens
- Reporting or KPI calculations
- Offline/PWA support
- Push notifications
- File attachments or image upload
- GST invoice generation
- Email/WhatsApp alerts

---

## 11. Data Gaps to Resolve Before Go-Live

From KB review — these must be filled before Module 2 begins:
- Product weights, wall thickness specs, HSN codes
- Actual supplier names, GSTIN, contact details
- Equipment serial numbers and commissioning dates
- Full personnel roster with roles confirmed
- Process parameter targets (temperatures, pressures, cycle times)
- KPI targets for all 13 metrics

*(See `kb/CLIENT_DATA_NEEDED.md` for full list)*

---

## 12. Success Criteria for Module 1

- [ ] User can open app on mobile browser, log in with PIN, reach home screen
- [ ] Wrong PIN shows error in correct language; lockout triggers after 3 failures
- [ ] Language toggle switches all UI text instantly; preference persists on next login
- [ ] Role-appropriate tabs and home tiles render correctly for all 6 roles
- [ ] Session expires after 8 hours; user returned to login screen
- [ ] All 28 Sheets tabs created with correct header rows
- [ ] Apps Script deployed as web app (Execute as: Me, Access: Anyone)
- [ ] `config.json` updated with live Apps Script URL; app functional end-to-end
