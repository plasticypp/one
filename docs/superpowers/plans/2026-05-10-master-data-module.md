# Master Data Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Masters section — 5th nav tab, `masters.html` with 8 entity tabs, list + slide-in edit forms, seed data for all 8 sheets, Apps Script CRUD backend.

**Architecture:** New standalone page `masters.html` navigated to from the Masters bottom tab. Entity config-driven — one JS config object per entity drives list rendering, form rendering, and save logic. Apps Script gets `getMasterList`, `getMasterDropdown`, `saveMaster`, `deactivateMaster` actions. Seed function populates all 8 sheets once.

**Tech Stack:** Vanilla HTML5/CSS3/ES6, Google Apps Script (V8), Google Sheets.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `masters.html` | Create | Entity tab bar, list panel, slide-in form panel |
| `js/masters.js` | Create | Entity configs, list render, form render, save/deactivate |
| `css/masters.css` | Create | Horizontal entity tabs, form slide-in animation |
| `lang/en.json` | Modify | Add Masters UI strings |
| `lang/hi.json` | Modify | Add Hindi Masters UI strings |
| `js/nav.js` | Modify | Add Masters tab (roles: director, qmr) |
| `app.html` | Modify | Add Masters tab-content div with link to masters.html |
| `gas/Code.gs` | Modify | Add getMasterList, getMasterDropdown, saveMaster, deactivateMaster, seedMasterData |

---

## Task 1: Language Strings

**Files:**
- Modify: `lang/en.json`
- Modify: `lang/hi.json`

- [ ] **Step 1: Add Masters keys to `lang/en.json`**

Open `lang/en.json` and add these keys before the closing `}`:

```json
  "nav.masters": "Masters",
  "masters.title": "Master Data",
  "masters.back": "← Back",
  "masters.tab.products": "Products",
  "masters.tab.customers": "Customers",
  "masters.tab.suppliers": "Suppliers",
  "masters.tab.equipment": "Equipment",
  "masters.tab.tooling": "Tooling",
  "masters.tab.spares": "Spares",
  "masters.tab.personnel": "Personnel",
  "masters.tab.bom": "BOM",
  "masters.add": "+ Add New",
  "masters.save": "Save",
  "masters.deactivate": "Deactivate",
  "masters.confirm.deactivate": "Deactivate this record?",
  "masters.search": "Search…",
  "masters.status.active": "Active",
  "masters.status.inactive": "Inactive",
  "masters.saved": "Saved successfully.",
  "masters.error.save": "Save failed. Try again."
```

- [ ] **Step 2: Add Masters keys to `lang/hi.json`**

Open `lang/hi.json` and add these keys before the closing `}`:

```json
  "nav.masters": "मास्टर",
  "masters.title": "मास्टर डेटा",
  "masters.back": "← वापस",
  "masters.tab.products": "प्रोडक्ट",
  "masters.tab.customers": "कस्टमर",
  "masters.tab.suppliers": "सप्लायर",
  "masters.tab.equipment": "उपकरण",
  "masters.tab.tooling": "टूलिंग",
  "masters.tab.spares": "स्पेयर",
  "masters.tab.personnel": "स्टाफ",
  "masters.tab.bom": "BOM",
  "masters.add": "+ नया जोड़ें",
  "masters.save": "सेव करें",
  "masters.deactivate": "बंद करें",
  "masters.confirm.deactivate": "यह रिकॉर्ड बंद करें?",
  "masters.search": "खोजें…",
  "masters.status.active": "चालू",
  "masters.status.inactive": "बंद",
  "masters.saved": "सेव हो गया।",
  "masters.error.save": "सेव नहीं हुआ। फिर कोशिश करें।"
```

- [ ] **Step 3: Commit**

```bash
git add lang/en.json lang/hi.json
git commit -m "feat: add Masters language strings EN+HI"
```

---

## Task 2: Update Nav & App Shell

**Files:**
- Modify: `js/nav.js`
- Modify: `app.html`

- [ ] **Step 1: Add Masters tab to `js/nav.js`**

In `js/nav.js`, find the TABS array and add the Masters entry:

```javascript
const TABS = [
  { id: 'home',    icon: '🏠', labelKey: 'nav.home',    roles: ['director','qmr','supervisor','operator','store','hr'] },
  { id: 'work',    icon: '⚙️', labelKey: 'nav.work',    roles: ['director','qmr','supervisor','operator'] },
  { id: 'stock',   icon: '📦', labelKey: 'nav.stock',   roles: ['director','qmr','supervisor','store'] },
  { id: 'profile', icon: '👤', labelKey: 'nav.profile', roles: ['director','qmr','supervisor','operator','store','hr'] },
  { id: 'masters', icon: '🗂️', labelKey: 'nav.masters', roles: ['director','qmr'] }
];
```

- [ ] **Step 2: Handle Masters tab navigation in `js/nav.js`**

In the `switchTab` function, add a redirect for the masters tab:

```javascript
function switchTab(tabId, role) {
  if (tabId === 'masters') {
    window.location.href = 'masters.html';
    return;
  }
  activeTab = tabId;
  document.querySelectorAll('.tab-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', c.getAttribute('data-tab') !== tabId);
  });
}
```

- [ ] **Step 3: Add Masters tab-content placeholder in `app.html`**

In `app.html`, after the Profile tab-content div, add:

```html
<!-- Masters Tab (navigates to masters.html) -->
<div class="tab-content hidden" data-tab="masters"></div>
```

- [ ] **Step 4: Commit**

```bash
git add js/nav.js app.html
git commit -m "feat: add Masters tab to nav — redirects to masters.html"
```

---

## Task 3: `css/masters.css`

**Files:**
- Create: `css/masters.css`

- [ ] **Step 1: Create `css/masters.css`**

```css
/* ── Entity Tab Bar ── */
.entity-tabs {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 12px 16px 0;
  background: var(--white);
  border-bottom: 1px solid var(--grey-border);
  scrollbar-width: none;
}
.entity-tabs::-webkit-scrollbar { display: none; }
.entity-tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: var(--grey-bg);
  color: var(--grey-text);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.entity-tab.active {
  background: var(--blue);
  color: var(--white);
}

/* ── List Panel ── */
.list-panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  background: var(--grey-bg);
  transition: transform 0.25s ease;
}
.list-panel.slide-out { transform: translateX(-100%); }

.search-bar {
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--grey-border);
}
.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--grey-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-family: var(--font);
  background: var(--grey-bg);
}
.search-input:focus { outline: 2px solid var(--blue); }

.record-list { padding: 8px 0; }
.record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--grey-border);
  cursor: pointer;
  gap: 8px;
}
.record-row:active { background: var(--grey-bg); }
.record-main { flex: 1; min-width: 0; }
.record-name { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.record-detail { font-size: 0.8rem; color: var(--grey-text); margin-top: 2px; }
.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}
.status-badge.active { background: #E8F5E9; color: var(--success); }
.status-badge.inactive { background: #FFEBEE; color: var(--danger); }

/* ── FAB ── */
.fab {
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--orange);
  color: var(--white);
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.fab.hidden { display: none; }

/* ── Edit Form Panel ── */
.form-panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  background: var(--grey-bg);
  transform: translateX(100%);
  transition: transform 0.25s ease;
  z-index: 10;
}
.form-panel.slide-in { transform: translateX(0); }

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--grey-border);
  position: sticky;
  top: 0;
  z-index: 5;
}
.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--blue);
  cursor: pointer;
  font-family: var(--font);
  padding: 4px 0;
}
.form-title { font-weight: 700; font-size: 1rem; }

.form-body { padding: 16px; }
.field-group { margin-bottom: 16px; }
.field-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 5px;
}
.field-group input,
.field-group select,
.field-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--grey-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-family: var(--font);
  background: var(--white);
  min-height: var(--touch-min);
}
.field-group textarea { min-height: 72px; resize: vertical; }
.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus { outline: 2px solid var(--blue); }

.form-actions { padding: 16px; display: flex; flex-direction: column; gap: 10px; padding-bottom: 32px; }
.btn-deactivate {
  width: 100%;
  background: none;
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: var(--radius);
  padding: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font);
  min-height: var(--touch-min);
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #323232;
  color: var(--white);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.88rem;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 200;
  white-space: nowrap;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── Content Area for masters.html ── */
.masters-content {
  position: relative;
  height: calc(100vh - var(--header-height) - 49px); /* header + entity tabs */
  overflow: hidden;
  margin-top: calc(var(--header-height) + 49px);
}
```

- [ ] **Step 2: Commit**

```bash
git add css/masters.css
git commit -m "feat: masters stylesheet — entity tabs, list rows, slide-in form"
```

---

## Task 4: `gas/Code.gs` — Master Data Backend

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Add getMasterList and getMasterDropdown to doGet**

In `doGet`, add two new actions before the final `return respond`:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getUsers')         return respond(getUsers());
    if (action === 'getMasterList')    return respond(getMasterList(e.parameter.entity));
    if (action === 'getMasterDropdown') return respond(getMasterDropdown(e.parameter.entity));
    return respond({ success: false, error: 'unknown_action' });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}
```

- [ ] **Step 2: Add saveMaster and deactivateMaster to doPost**

In `doPost`, add two new actions:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  try {
    if (action === 'login')            return respond(login(data));
    if (action === 'updateLanguage')   return respond(updateLanguage(data));
    if (action === 'saveMaster')       return respond(saveMaster(data));
    if (action === 'deactivateMaster') return respond(deactivateMaster(data));
    return respond({ success: false, error: 'unknown_action' });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}
```

- [ ] **Step 3: Add getMasterList function**

Add after the `updateLanguage` function:

```javascript
function getMasterList(entity) {
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  return { success: true, data };
}
```

- [ ] **Step 4: Add getMasterDropdown function**

```javascript
function getMasterDropdown(entity) {
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const idCol = 0;
  // Use Name col if present, else second col
  const nameCol = headers.indexOf('Name') >= 0 ? headers.indexOf('Name') : 1;
  const data = rows.slice(1)
    .filter(row => row[idCol])
    .map(row => ({ id: row[idCol], name: row[nameCol] }));
  return { success: true, data };
}
```

- [ ] **Step 5: Add saveMaster function**

```javascript
function saveMaster(data) {
  const { entity, row } = data;
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idCol = 0;
  const idVal = row[headers[0]];

  // Build values array in header order
  const values = headers.map(h => row[h] !== undefined ? row[h] : '');

  // Find existing row
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idCol]) === String(idVal)) {
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);
      return { success: true };
    }
  }
  // New row
  sheet.appendRow(values);
  return { success: true };
}
```

- [ ] **Step 6: Add deactivateMaster function**

```javascript
function deactivateMaster(data) {
  const { entity, id } = data;
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idCol = 0;
  const statusCol = headers.indexOf('Status') >= 0 ? headers.indexOf('Status') : headers.indexOf('Active');
  if (statusCol < 0) return { success: false, error: 'no_status_col' };

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idCol]) === String(id)) {
      const isStatusField = headers[statusCol] === 'Status';
      sheet.getRange(i + 1, statusCol + 1).setValue(isStatusField ? 'Inactive' : false);
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}
```

- [ ] **Step 7: Add seedMasterData function**

Add at the end of Code.gs:

```javascript
function seedMasterData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, rows) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) { Logger.log('Sheet not found: ' + sheetName); return; }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  safeWrite('Products', [
    ['PRD001','YPP-100-N','100ml HDPE Bottle Natural',100,'HDPE','3923','[DEMO]18','[DEMO]1.2','[DEMO]28','Active'],
    ['PRD002','YPP-200-N','200ml HDPE Bottle Natural',200,'HDPE','3923','[DEMO]30','[DEMO]1.4','[DEMO]28','Active'],
    ['PRD003','YPP-1L-N','1L HDPE Bottle Natural',1000,'HDPE','3923','[DEMO]90','[DEMO]2.0','[DEMO]38','Active'],
    ['PRD004','YPP-5L-N','5L HDPE Can Natural',5000,'HDPE','3923','[DEMO]320','[DEMO]2.5','[DEMO]50','Active']
  ]);

  safeWrite('Customers', [
    ['CUS001','AP','Arabian Petroleum Lubricants India Ltd','[DEMO]27AAAAA0000A1Z5','[DEMO]Plot No. 1, MIDC, Navi Mumbai','[DEMO]Mr. Rajesh Kumar','[DEMO]9800000001','[DEMO]ap@arabianpetroleum.com','2022-01-01','Wall thickness tolerance ±0.2mm; label on neck','TRUE'],
    ['CUS002','AI','Apar Industries Ltd','[DEMO]27BBBBB0000B1Z5','[DEMO]Plot No. 2, MIDC, Navi Mumbai','[DEMO]Mr. Suresh Patel','[DEMO]9800000002','[DEMO]apar@apar.com','2021-06-01','No special requirements','TRUE'],
    ['CUS003','EX','Exsan Industries','[DEMO]27CCCCC0000C1Z5','[DEMO]Plot No. 3, MIDC, Navi Mumbai','[DEMO]Mr. Dinesh Shah','[DEMO]9800000003','[DEMO]exsan@exsan.com','2023-03-01','Delivery in 5L cans only','TRUE']
  ]);

  safeWrite('Suppliers', [
    ['SUP001','S001','Reliance Industries Ltd','RM','[DEMO]27DDDDD0000D1Z5','[DEMO]Reliance Corporate Park, Navi Mumbai','[DEMO]Mr. Anil Sharma','[DEMO]9800000010','[DEMO]reliance@ril.com','[DEMO]Net 30',7,true,'2020-01-01','Primary HDPE supplier'],
    ['SUP002','S002','GAIL (India) Ltd','RM','[DEMO]27EEEEE0000E1Z5','[DEMO]GAIL Bhawan, Delhi','[DEMO]Mr. Vijay Singh','[DEMO]9800000011','[DEMO]gail@gail.com','[DEMO]Net 30',10,true,'2020-01-01','Alternate HDPE supplier'],
    ['SUP003','S003','Haldia Petrochemicals Ltd','RM','[DEMO]27FFFFF0000F1Z5','[DEMO]Haldia, West Bengal','[DEMO]Mr. Subhash Roy','[DEMO]9800000012','[DEMO]haldia@hpl.com','[DEMO]Net 45',14,true,'2021-01-01','Alternate HDPE'],
    ['SUP004','S004','Penn Engineering','Spare','[DEMO]27GGGGG0000G1Z5','[DEMO]Ambernath MIDC','[DEMO]Mr. Rakesh Gupta','[DEMO]9800000013','[DEMO]penn@penn.com','[DEMO]Cash',7,true,'2020-06-01','Spare parts supplier'],
    ['SUP005','S005','Uflex Ltd','Packaging','[DEMO]27HHHHH0000H1Z5','[DEMO]Noida, UP','[DEMO]Mr. Ashish Jain','[DEMO]9800000014','[DEMO]uflex@uflex.com','[DEMO]Net 30',10,true,'2022-01-01','Label supplier — pre-press approval required'],
    ['SUP006','S006','Smurfit Kappa India','Packaging','[DEMO]27IIIII0000I1Z5','[DEMO]Bhiwandi, Thane','[DEMO]Mr. Deepak More','[DEMO]9800000015','[DEMO]smurfit@smurfit.com','[DEMO]Net 30',7,true,'2022-06-01','Carton supplier'],
    ['SUP007','S007','Mahalaxmi Gases','Utility','[DEMO]27JJJJJ0000J1Z5','[DEMO]Taloja MIDC, Navi Mumbai','[DEMO]Mr. Mahesh Patil','[DEMO]9800000016','[DEMO]mahalaxmi@mg.com','[DEMO]Monthly',3,true,'2020-01-01','Compressed air, nitrogen']
  ]);

  safeWrite('Equipment', [
    ['EQ001','Blow Moulding Machine 1','Machine','Production Floor','[DEMO]BM-SN-001','[DEMO]2018-01-01',0,null,null,'Active'],
    ['EQ002','Blow Moulding Machine 2','Machine','Production Floor','[DEMO]BM-SN-002','[DEMO]2018-06-01',0,null,null,'Active'],
    ['EQ003','Blow Moulding Machine 3','Machine','Production Floor','[DEMO]BM-SN-003','[DEMO]2019-01-01',0,null,null,'Active'],
    ['EQ004','Blow Moulding Machine 4','Machine','Production Floor','[DEMO]BM-SN-004','[DEMO]2020-01-01',0,null,null,'Active'],
    ['EQ005','Weighing Scale (Production)','Instrument','Production Floor','[DEMO]WS-SN-001','[DEMO]2020-01-01',12,'[DEMO]2025-01-01','[DEMO]2026-01-01','Active'],
    ['EQ006','Weighing Scale (Store)','Instrument','Store','[DEMO]WS-SN-002','[DEMO]2020-01-01',12,'[DEMO]2025-01-01','[DEMO]2026-01-01','Active'],
    ['EQ007','Wall Thickness Gauge','Instrument','QC Lab','[DEMO]WT-SN-001','[DEMO]2021-01-01',12,'[DEMO]2025-06-01','[DEMO]2026-06-01','Active'],
    ['EQ008','Leak Test Rig','Instrument','QC Lab','[DEMO]LT-SN-001','[DEMO]2021-01-01',12,'[DEMO]2025-06-01','[DEMO]2026-06-01','Active'],
    ['EQ009','Vernier Caliper 1','Instrument','QC Lab','[DEMO]VC-SN-001','[DEMO]2020-01-01',6,'[DEMO]2025-12-01','[DEMO]2026-06-01','Active'],
    ['EQ010','Vernier Caliper 2','Instrument','QC Lab','[DEMO]VC-SN-002','[DEMO]2020-01-01',6,'[DEMO]2025-12-01','[DEMO]2026-06-01','Active'],
    ['EQ011','MFI Tester','Instrument','QC Lab','[DEMO]MFI-SN-001','[DEMO]2022-01-01',12,'[DEMO]2025-01-01','[DEMO]2026-01-01','Active'],
    ['EQ012','Torque Tester','Instrument','QC Lab','[DEMO]TQ-SN-001','[DEMO]2022-01-01',12,'[DEMO]2025-01-01','[DEMO]2026-01-01','Active']
  ]);

  safeWrite('Tooling', [
    ['TL001','Mould 100ml','Blow Mould','PRD001','EQ001',1,'[DEMO]Sunrise Moulds','[DEMO]SM-SN-001',0,'Active'],
    ['TL002','Mould 200ml','Blow Mould','PRD002','EQ002',1,'[DEMO]Sunrise Moulds','[DEMO]SM-SN-002',0,'Active'],
    ['TL003','Mould 1L','Blow Mould','PRD003','EQ003',1,'[DEMO]Sunrise Moulds','[DEMO]SM-SN-003',0,'Active'],
    ['TL004','Mould 5L','Blow Mould','PRD004','EQ004',1,'[DEMO]Sunrise Moulds','[DEMO]SM-SN-004',0,'Active']
  ]);

  safeWrite('Spares', [
    ['SP001','Hydraulic Oil Filter','SUP004','nos',0,2,7,'Store Rack A1'],
    ['SP002','Heater Band 30mm','SUP004','nos',0,4,5,'Store Rack A2'],
    ['SP003','Heater Band 40mm','SUP004','nos',0,4,5,'Store Rack A2'],
    ['SP004','Solenoid Valve','SUP004','nos',0,2,10,'Store Rack B1'],
    ['SP005','Hydraulic Seal Kit','SUP004','set',0,2,14,'Store Rack B2'],
    ['SP006','V-Belt A-Type','SUP004','nos',0,4,5,'Store Rack C1'],
    ['SP007','V-Belt B-Type','SUP004','nos',0,4,5,'Store Rack C1'],
    ['SP008','Limit Switch','SUP004','nos',0,2,7,'Store Rack D1'],
    ['SP009','Parison Die 28mm','SUP004','nos',0,1,21,'Store Rack D2'],
    ['SP010','Air Cylinder Seal','SUP004','set',0,2,10,'Store Rack E1']
  ]);

  safeWrite('Personnel', [
    ['P001','Tarun Mishra','tarun','director','Management','','[DEMO]9800000020','[DEMO]tarun@ypp.com','[DEMO]2015-01-01','[DEMO]MBA','TRUE'],
    ['P002','PL Pradhan','pradhan','qmr','Quality','tarun','[DEMO]9800000021','[DEMO]pradhan@ypp.com','[DEMO]2016-06-01','[DEMO]B.Tech','TRUE'],
    ['P003','[DEMO] Ramesh Supervisor','ramesh','supervisor','Production','tarun','[DEMO]9800000022','[DEMO]ramesh@ypp.com','[DEMO]2018-01-01','[DEMO]Diploma','TRUE'],
    ['P004','[DEMO] Suresh Operator','suresh','operator','Production','ramesh','[DEMO]9800000023','[DEMO]suresh@ypp.com','[DEMO]2019-01-01','[DEMO]ITI','TRUE'],
    ['P005','[DEMO] Mahesh Storekeeper','mahesh','store','Store','tarun','[DEMO]9800000024','[DEMO]mahesh@ypp.com','[DEMO]2020-01-01','[DEMO]HSC','TRUE']
  ]);

  safeWrite('BOM', [
    ['BOM001','PRD001','HDPE Natural','RM','[DEMO]0.018','kg','Primary resin'],
    ['BOM002','PRD002','HDPE Natural','RM','[DEMO]0.030','kg','Primary resin'],
    ['BOM003','PRD003','HDPE Natural','RM','[DEMO]0.090','kg','Primary resin'],
    ['BOM004','PRD004','HDPE Natural','RM','[DEMO]0.320','kg','Primary resin']
  ]);

  Logger.log('seedMasterData complete.');
}
```

- [ ] **Step 8: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: Apps Script master data CRUD + seedMasterData"
```

---

## Task 5: `js/masters.js`

**Files:**
- Create: `js/masters.js`

- [ ] **Step 1: Create `js/masters.js`**

```javascript
const Masters = (() => {

  // ── Entity Configurations ─────────────────────────────────────────────────

  const ENTITIES = [
    {
      id: 'Products',
      labelKey: 'masters.tab.products',
      idField: 'ProductID',
      nameField: 'Name',
      detailField: 'Capacity_ml',
      statusField: 'Status',
      canEdit: ['director','qmr'],
      fields: [
        { key: 'ProductID',       label: 'Product ID',       type: 'text',   readonly: true },
        { key: 'SKU',             label: 'SKU',              type: 'text' },
        { key: 'Name',            label: 'Name',             type: 'text' },
        { key: 'Capacity_ml',     label: 'Capacity (ml)',    type: 'number' },
        { key: 'Material',        label: 'Material',         type: 'text' },
        { key: 'HSN',             label: 'HSN Code',         type: 'text' },
        { key: 'Weight_g',        label: 'Weight (g)',       type: 'number' },
        { key: 'WallThickness_mm',label: 'Wall Thickness (mm)', type: 'number' },
        { key: 'NeckSize_mm',     label: 'Neck Size (mm)',   type: 'number' },
        { key: 'Status',          label: 'Status',           type: 'select', options: ['Active','Inactive'] }
      ]
    },
    {
      id: 'Customers',
      labelKey: 'masters.tab.customers',
      idField: 'CustomerID',
      nameField: 'Name',
      detailField: 'Code',
      statusField: 'Active',
      canEdit: ['director'],
      fields: [
        { key: 'CustomerID',    label: 'Customer ID',    type: 'text', readonly: true },
        { key: 'Code',          label: 'Code',           type: 'text' },
        { key: 'Name',          label: 'Name',           type: 'text' },
        { key: 'GSTIN',         label: 'GSTIN',          type: 'text' },
        { key: 'Address',       label: 'Address',        type: 'textarea' },
        { key: 'Contact',       label: 'Contact Person', type: 'text' },
        { key: 'Phone',         label: 'Phone',          type: 'tel' },
        { key: 'Email',         label: 'Email',          type: 'email' },
        { key: 'ApprovedSince', label: 'Approved Since', type: 'date' },
        { key: 'SpecialNotes',  label: 'Special Notes',  type: 'textarea' },
        { key: 'Active',        label: 'Active',         type: 'select', options: ['TRUE','FALSE'] }
      ]
    },
    {
      id: 'Suppliers',
      labelKey: 'masters.tab.suppliers',
      idField: 'SupplierID',
      nameField: 'Name',
      detailField: 'Category',
      statusField: 'Active',
      canEdit: ['director'],
      fields: [
        { key: 'SupplierID',    label: 'Supplier ID',    type: 'text', readonly: true },
        { key: 'Code',          label: 'Code',           type: 'text' },
        { key: 'Name',          label: 'Name',           type: 'text' },
        { key: 'Category',      label: 'Category',       type: 'select', options: ['RM','Packaging','Spare','Utility'] },
        { key: 'GSTIN',         label: 'GSTIN',          type: 'text' },
        { key: 'Address',       label: 'Address',        type: 'textarea' },
        { key: 'Contact',       label: 'Contact Person', type: 'text' },
        { key: 'Phone',         label: 'Phone',          type: 'tel' },
        { key: 'Email',         label: 'Email',          type: 'email' },
        { key: 'PaymentTerms',  label: 'Payment Terms',  type: 'text' },
        { key: 'LeadDays',      label: 'Lead Days',      type: 'number' },
        { key: 'Approved',      label: 'Approved',       type: 'select', options: ['true','false'] },
        { key: 'Active',        label: 'Active',         type: 'select', options: ['TRUE','FALSE'] }
      ]
    },
    {
      id: 'Equipment',
      labelKey: 'masters.tab.equipment',
      idField: 'EquipID',
      nameField: 'Name',
      detailField: 'Type',
      statusField: 'Status',
      canEdit: ['director','qmr'],
      fields: [
        { key: 'EquipID',      label: 'Equip ID',          type: 'text', readonly: true },
        { key: 'Name',         label: 'Name',              type: 'text' },
        { key: 'Type',         label: 'Type',              type: 'select', options: ['Machine','Instrument'] },
        { key: 'Location',     label: 'Location',          type: 'text' },
        { key: 'SerialNo',     label: 'Serial No',         type: 'text' },
        { key: 'Commissioned', label: 'Commissioned',      type: 'date' },
        { key: 'CalibFreq',    label: 'Calib Freq (months)', type: 'number' },
        { key: 'LastCalib',    label: 'Last Calibration',  type: 'date' },
        { key: 'NextCalib',    label: 'Next Calibration',  type: 'date' },
        { key: 'Status',       label: 'Status',            type: 'select', options: ['Active','Under Maintenance','Inactive'] }
      ]
    },
    {
      id: 'Tooling',
      labelKey: 'masters.tab.tooling',
      idField: 'ToolID',
      nameField: 'Name',
      detailField: 'Type',
      statusField: 'Status',
      canEdit: ['director'],
      fields: [
        { key: 'ToolID',       label: 'Tool ID',      type: 'text', readonly: true },
        { key: 'Name',         label: 'Name',         type: 'text' },
        { key: 'Type',         label: 'Type',         type: 'text' },
        { key: 'ProductID',    label: 'Product',      type: 'dropdown', entity: 'Products' },
        { key: 'MachineID',    label: 'Machine',      type: 'dropdown', entity: 'Equipment' },
        { key: 'Cavities',     label: 'Cavities',     type: 'number' },
        { key: 'ShotCount',    label: 'Shot Count',   type: 'number' },
        { key: 'Manufacturer', label: 'Manufacturer', type: 'text' },
        { key: 'Status',       label: 'Status',       type: 'select', options: ['Active','Under Repair','Retired'] }
      ]
    },
    {
      id: 'Spares',
      labelKey: 'masters.tab.spares',
      idField: 'SpareID',
      nameField: 'Name',
      detailField: 'Unit',
      statusField: null,
      canEdit: ['director'],
      fields: [
        { key: 'SpareID',      label: 'Spare ID',      type: 'text', readonly: true },
        { key: 'Name',         label: 'Name',          type: 'text' },
        { key: 'SupplierID',   label: 'Supplier',      type: 'dropdown', entity: 'Suppliers' },
        { key: 'Unit',         label: 'Unit',          type: 'select', options: ['nos','set','kg','ltr'] },
        { key: 'CurrentStock', label: 'Current Stock', type: 'number' },
        { key: 'ReorderLevel', label: 'Reorder Level', type: 'number' },
        { key: 'LeadDays',     label: 'Lead Days',     type: 'number' },
        { key: 'Location',     label: 'Location',      type: 'text' }
      ]
    },
    {
      id: 'Personnel',
      labelKey: 'masters.tab.personnel',
      idField: 'PersonID',
      nameField: 'Name',
      detailField: 'Role',
      statusField: 'Active',
      canEdit: ['director'],
      fields: [
        { key: 'PersonID',     label: 'Person ID',    type: 'text', readonly: true },
        { key: 'Name',         label: 'Name',         type: 'text' },
        { key: 'Username',     label: 'Username',     type: 'text' },
        { key: 'Role',         label: 'Role',         type: 'select', options: ['director','qmr','supervisor','operator','store','hr'] },
        { key: 'Department',   label: 'Department',   type: 'text' },
        { key: 'ReportsTo',    label: 'Reports To',   type: 'text' },
        { key: 'Phone',        label: 'Phone',        type: 'tel' },
        { key: 'Email',        label: 'Email',        type: 'email' },
        { key: 'DateJoined',   label: 'Date Joined',  type: 'date' },
        { key: 'Qualification',label: 'Qualification',type: 'text' },
        { key: 'Active',       label: 'Active',       type: 'select', options: ['TRUE','FALSE'] }
      ]
    },
    {
      id: 'BOM',
      labelKey: 'masters.tab.bom',
      idField: 'BOMID',
      nameField: 'MaterialID',
      detailField: 'ProductID',
      statusField: null,
      canEdit: ['director','qmr'],
      fields: [
        { key: 'BOMID',        label: 'BOM ID',       type: 'text', readonly: true },
        { key: 'ProductID',    label: 'Product',      type: 'dropdown', entity: 'Products' },
        { key: 'MaterialID',   label: 'Material',     type: 'text' },
        { key: 'MaterialType', label: 'Material Type',type: 'select', options: ['RM','Masterbatch','Additive'] },
        { key: 'Qty_kg',       label: 'Qty (kg)',     type: 'number' },
        { key: 'Unit',         label: 'Unit',         type: 'text' },
        { key: 'RemarkS',      label: 'Remarks',      type: 'text' }
      ]
    }
  ];

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;
  let activeEntity = null;
  let records = [];
  let dropdownCache = {};
  let editingRecord = null;

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }
    await Lang.init(session.lang);

    renderEntityTabs();
    setupHeader();
    await switchEntity(ENTITIES[0]);
  }

  // ── Entity Tabs ───────────────────────────────────────────────────────────

  function renderEntityTabs() {
    const bar = document.getElementById('entity-tabs');
    bar.innerHTML = '';
    ENTITIES.forEach(entity => {
      const btn = document.createElement('button');
      btn.className = 'entity-tab' + (entity === activeEntity ? ' active' : '');
      btn.textContent = Lang.t(entity.labelKey);
      btn.addEventListener('click', () => switchEntity(entity));
      bar.appendChild(btn);
    });
  }

  async function switchEntity(entity) {
    activeEntity = entity;
    renderEntityTabs();
    showSpinner(true);
    try {
      const res = await Api.get('getMasterList', { entity: entity.id });
      records = res.success ? res.data : [];
      renderList();
    } finally {
      showSpinner(false);
    }
    updateFAB();
  }

  // ── List ──────────────────────────────────────────────────────────────────

  function renderList(filter = '') {
    const list = document.getElementById('record-list');
    list.innerHTML = '';
    const filtered = filter
      ? records.filter(r => String(r[activeEntity.nameField] || '').toLowerCase().includes(filter.toLowerCase()))
      : records;

    if (filtered.length === 0) {
      list.innerHTML = '<div style="padding:24px 16px;color:#757575;text-align:center;">No records</div>';
      return;
    }

    filtered.forEach(record => {
      const row = document.createElement('div');
      row.className = 'record-row';
      const statusVal = activeEntity.statusField ? record[activeEntity.statusField] : 'Active';
      const isActive = statusVal === 'Active' || statusVal === 'TRUE' || statusVal === true;
      row.innerHTML = `
        <div class="record-main">
          <div class="record-name">${record[activeEntity.nameField] || '—'}</div>
          <div class="record-detail">${record[activeEntity.detailField] || ''}</div>
        </div>
        ${activeEntity.statusField ? `<span class="status-badge ${isActive ? 'active' : 'inactive'}">${isActive ? Lang.t('masters.status.active') : Lang.t('masters.status.inactive')}</span>` : ''}
      `;
      row.addEventListener('click', () => openForm(record));
      list.appendChild(row);
    });
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  async function openForm(record) {
    editingRecord = record ? { ...record } : {};
    const isNew = !record;
    const canEdit = activeEntity.canEdit.includes(session.role);

    // Pre-load dropdowns needed
    const dropdownFields = activeEntity.fields.filter(f => f.type === 'dropdown');
    for (const f of dropdownFields) {
      if (!dropdownCache[f.entity]) {
        const res = await Api.get('getMasterDropdown', { entity: f.entity });
        dropdownCache[f.entity] = res.success ? res.data : [];
      }
    }

    const formBody = document.getElementById('form-body');
    formBody.innerHTML = '';

    activeEntity.fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'field-group';
      const label = document.createElement('label');
      label.textContent = field.label;
      group.appendChild(label);

      let input;
      if (field.readonly && !isNew) {
        input = document.createElement('input');
        input.type = 'text';
        input.value = editingRecord[field.key] || '';
        input.disabled = true;
      } else if (field.type === 'select') {
        input = document.createElement('select');
        field.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          if (String(editingRecord[field.key]) === opt) o.selected = true;
          input.appendChild(o);
        });
        if (!canEdit) input.disabled = true;
      } else if (field.type === 'dropdown') {
        input = document.createElement('select');
        const blank = document.createElement('option');
        blank.value = '';
        blank.textContent = '— select —';
        input.appendChild(blank);
        (dropdownCache[f.entity] || []);
        const opts = dropdownCache[field.entity] || [];
        opts.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.id;
          o.textContent = opt.name;
          if (String(editingRecord[field.key]) === String(opt.id)) o.selected = true;
          input.appendChild(o);
        });
        if (!canEdit) input.disabled = true;
      } else if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.value = editingRecord[field.key] || '';
        if (!canEdit) input.disabled = true;
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        input.value = editingRecord[field.key] || '';
        if (!canEdit) input.disabled = true;
      }

      input.dataset.key = field.key;
      group.appendChild(input);
      formBody.appendChild(group);
    });

    // Actions
    const actions = document.getElementById('form-actions');
    actions.innerHTML = '';
    if (canEdit) {
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn-primary';
      saveBtn.textContent = Lang.t('masters.save');
      saveBtn.addEventListener('click', saveForm);
      actions.appendChild(saveBtn);

      if (!isNew && activeEntity.statusField) {
        const deactBtn = document.createElement('button');
        deactBtn.className = 'btn-deactivate';
        deactBtn.textContent = Lang.t('masters.deactivate');
        deactBtn.addEventListener('click', deactivateRecord);
        if (session.role !== 'director') deactBtn.style.display = 'none';
        actions.appendChild(deactBtn);
      }
    }

    document.getElementById('form-title').textContent = isNew ? Lang.t('masters.add') : (editingRecord[activeEntity.nameField] || '');
    slideFormIn();
  }

  async function saveForm() {
    const inputs = document.querySelectorAll('#form-body [data-key]');
    inputs.forEach(input => {
      editingRecord[input.dataset.key] = input.value;
    });

    // Auto-generate ID for new records
    const idField = activeEntity.idField;
    if (!editingRecord[idField]) {
      const prefix = idField.replace('ID','').toUpperCase().slice(0,3);
      editingRecord[idField] = prefix + String(Date.now()).slice(-4);
    }

    showSpinner(true);
    try {
      const res = await Api.post('saveMaster', { entity: activeEntity.id, row: editingRecord });
      if (res.success) {
        showToast(Lang.t('masters.saved'));
        const res2 = await Api.get('getMasterList', { entity: activeEntity.id });
        records = res2.success ? res2.data : records;
        renderList();
        slideFormOut();
      } else {
        showToast(Lang.t('masters.error.save'));
      }
    } finally {
      showSpinner(false);
    }
  }

  async function deactivateRecord() {
    if (!confirm(Lang.t('masters.confirm.deactivate'))) return;
    showSpinner(true);
    try {
      const res = await Api.post('deactivateMaster', { entity: activeEntity.id, id: editingRecord[activeEntity.idField] });
      if (res.success) {
        showToast(Lang.t('masters.saved'));
        const res2 = await Api.get('getMasterList', { entity: activeEntity.id });
        records = res2.success ? res2.data : records;
        renderList();
        slideFormOut();
      } else {
        showToast(Lang.t('masters.error.save'));
      }
    } finally {
      showSpinner(false);
    }
  }

  // ── Slide Transitions ─────────────────────────────────────────────────────

  function slideFormIn() {
    document.getElementById('list-panel').classList.add('slide-out');
    document.getElementById('form-panel').classList.add('slide-in');
  }

  function slideFormOut() {
    document.getElementById('list-panel').classList.remove('slide-out');
    document.getElementById('form-panel').classList.remove('slide-in');
    editingRecord = null;
  }

  // ── Header & FAB ─────────────────────────────────────────────────────────

  function setupHeader() {
    document.getElementById('back-to-app').addEventListener('click', () => {
      window.location.href = 'app.html';
    });
    document.getElementById('form-back').addEventListener('click', slideFormOut);
    document.getElementById('fab').addEventListener('click', () => openForm(null));
    document.getElementById('search-input').addEventListener('input', e => renderList(e.target.value));
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, null);
      langBtn.textContent = next.toUpperCase();
      renderEntityTabs();
      renderList();
    });
  }

  function updateFAB() {
    const fab = document.getElementById('fab');
    fab.classList.toggle('hidden', !activeEntity.canEdit.includes(session.role));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function showSpinner(show) {
    document.getElementById('spinner').classList.toggle('hidden', !show);
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  return { init };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/masters.js
git commit -m "feat: masters.js — entity configs, list render, form render, save/deactivate"
```

---

## Task 6: `masters.html`

**Files:**
- Create: `masters.html`

- [ ] **Step 1: Create `masters.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1565C0">
  <title>YPP ERP — Master Data</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/masters.css">
</head>
<body>

  <!-- Header -->
  <header class="header">
    <div style="display:flex;align-items:center;gap:10px;">
      <button class="back-btn" id="back-to-app" style="color:#fff;font-size:1.1rem;">←</button>
      <span class="header-title" data-i18n="masters.title">Master Data</span>
    </div>
    <div class="header-actions">
      <button class="lang-toggle" id="lang-toggle">EN</button>
    </div>
  </header>

  <!-- Entity Tab Bar -->
  <div class="entity-tabs" id="entity-tabs"></div>

  <!-- Content Area -->
  <div class="masters-content">

    <!-- List Panel -->
    <div class="list-panel" id="list-panel">
      <div class="search-bar">
        <input class="search-input" id="search-input" type="text" placeholder="Search…" data-i18n-placeholder="masters.search">
      </div>
      <div class="record-list" id="record-list"></div>
    </div>

    <!-- Form Panel -->
    <div class="form-panel" id="form-panel">
      <div class="form-header">
        <button class="back-btn" id="form-back" data-i18n="masters.back">← Back</button>
        <span class="form-title" id="form-title"></span>
      </div>
      <div class="form-body" id="form-body"></div>
      <div class="form-actions" id="form-actions"></div>
    </div>

  </div>

  <!-- FAB -->
  <button class="fab hidden" id="fab">+</button>

  <!-- Spinner -->
  <div class="spinner-overlay hidden" id="spinner">
    <div class="spinner"></div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script src="js/api.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/lang.js"></script>
  <script src="js/masters.js"></script>
  <script>
    (async () => {
      await Api.init();
      await Masters.init();
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add masters.html
git commit -m "feat: masters.html — entity tabs, list panel, slide-in form"
```

---

## Task 7: Seed Data & Final Commit

- [ ] **Step 1: Paste updated `gas/Code.gs` into Apps Script editor**
  - Open your Apps Script project for YPP-ERP
  - Replace the entire contents with the updated `gas/Code.gs`
  - Save and deploy a new version (Deploy → Manage deployments → Edit → New version → Deploy)

- [ ] **Step 2: Run `seedMasterData`**
  - In Apps Script editor, select function `seedMasterData`
  - Click Run
  - Check execution log — should show all 8 sheets seeded
  - Open the Google Sheet and verify each tab has data rows

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: master data module complete — 8 entities, seed data, CRUD backend"
```

---

## Self-Review

### Spec Coverage
- [x] 5th Masters tab, director+QMR only → Task 2
- [x] Tab navigates to masters.html → Task 2
- [x] 8 entity tabs with horizontal scroll → Task 6
- [x] List with search, name+detail+status badge → Task 5
- [x] Slide-in edit form on tap → Tasks 3, 5, 6
- [x] FAB for new record, director only → Tasks 3, 5, 6
- [x] Save upserts sheet row → Tasks 4, 5
- [x] Deactivate sets status → Tasks 4, 5
- [x] QMR can edit Products+Equipment only → Task 5 (canEdit config)
- [x] Dropdown fields from linked sheets → Tasks 4, 5
- [x] Seed data for all 8 entities → Task 4
- [x] [DEMO] markers on placeholder data → Task 4
- [x] EN/HI language strings → Task 1
- [x] Lang toggle works on masters.html → Tasks 1, 5, 6
