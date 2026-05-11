# ERP — Navigation Cleanup & Broken Dashboard Tiles

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all broken dashboard tiles (Calibration, NCR, Workorders, Today, Logparams, Defect, Mybatches), standardize sub-tab label i18n across all modules, and ensure consistent tab-switching and back-button navigation everywhere.

**Architecture:** Broken tiles currently route to existing pages (production.html, quality.html) but those pages have no sub-views for the role-specific workflow the tile implies. Fix strategy: operator tiles (Startbatch, Logparams, Defect, Mybatches) deep-link into production.html and quality.html with a URL param (`?view=newbatch`, `?view=logparams` etc.) that the page JS reads on load to auto-navigate to the right tab/form. Calibration, NCR, and Workorders tiles get minimal stub pages or redirect to the most relevant existing page with a clear "coming soon" state. Sub-tab labels get `data-i18n` attributes and corresponding keys in `lang/en.json` and `lang/hi.json`.

**Tech Stack:** Vanilla JS ES6, URL `searchParams`, existing `data-i18n` / lang system, existing tab-switching pattern.

---

## File Map

| File | Change |
|------|--------|
| `js/app.js` | Fix tile hrefs to pass `?view=` params; fix stat badge wiring for all roles |
| `production.html` | Add `data-i18n` to sub-tab labels; read `?view` param on load |
| `js/production.js` | On load: check `?view` param and auto-navigate to correct tab/form |
| `quality.html` | Add `data-i18n` to sub-tab labels; read `?view` param on load |
| `js/quality.js` | On load: check `?view` param and auto-navigate |
| `dispatch.html` | Add `data-i18n` to sub-tab labels |
| `maintenance.html` | Add `data-i18n` to sub-tab labels |
| `compliance.html` | Add `data-i18n` to sub-tab labels |
| `grn.html` | Add `data-i18n` to sub-tab labels |
| `lang/en.json` | Add sub-tab label keys for all modules |
| `lang/hi.json` | Add Hindi translations for all sub-tab label keys |
| `calibration.html` | New stub page — Equipment Calibration (coming soon + basic list) |
| `ncr.html` | New stub page — NCR Log (coming soon + basic list) |

---

### Task 1: Fix tile navigation in app.js

**Files:**
- Modify: `js/app.js`

The tile config array (around line 35–50) defines each tile's route. Several tiles route to the right page but need `?view=` params so the destination page knows which mode to start in.

- [ ] **Step 1: Read the tile config in app.js**

Open `js/app.js`. Find the `TILES` or tile config array. Note the structure of each tile object — it will have `id`, `label`, `icon`, `route`, and optionally `badge`.

- [ ] **Step 2: Update tile routes with view params**

Replace each broken tile's route with the correct deep-link:

```javascript
// BEFORE (example — match actual object structure):
{ id: 'startbatch', label: 'Start Batch', icon: '▶', route: 'production.html', badge: null }
{ id: 'logparams', label: 'Log Params', icon: '📋', route: 'production.html', badge: null }
{ id: 'defect', label: 'Log Defect', icon: '⚠', route: 'quality.html', badge: null }
{ id: 'mybatches', label: 'My Batches', icon: '📦', route: 'production.html', badge: 'mybatches' }
{ id: 'workorders', label: 'Work Orders', icon: '🗒', route: 'production.html', badge: null }
{ id: 'today', label: "Today's Plan", icon: '📅', route: 'production.html', badge: null }
{ id: 'calibration', label: 'Calibration', icon: '⚙', route: 'compliance.html', badge: null }
{ id: 'ncr', label: 'NCR', icon: '🚫', route: 'quality.html', badge: null }

// AFTER:
{ id: 'startbatch', label: 'Start Batch', icon: '▶', route: 'production.html?view=newbatch', badge: null }
{ id: 'logparams', label: 'Log Params', icon: '📋', route: 'production.html?view=logparams', badge: null }
{ id: 'defect', label: 'Log Defect', icon: '⚠', route: 'quality.html?view=newcheck', badge: null }
{ id: 'mybatches', label: 'My Batches', icon: '📦', route: 'production.html?view=mybatches', badge: 'mybatches' }
{ id: 'workorders', label: 'Work Orders', icon: '🗒', route: 'production.html?view=batches', badge: null }
{ id: 'today', label: "Today's Plan", icon: '📅', route: 'production.html?view=today', badge: null }
{ id: 'calibration', label: 'Calibration', icon: '⚙', route: 'calibration.html', badge: null }
{ id: 'ncr', label: 'NCR', icon: '🚫', route: 'ncr.html', badge: null }
```

Apply the exact changes matching the actual object structure in the file.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "fix: update broken tile routes with view params and stub pages"
```

---

### Task 2: production.js — Read `?view` param on load

**Files:**
- Modify: `js/production.js`

- [ ] **Step 1: Add view-param handler at end of page init**

Find the `DOMContentLoaded` block or the main init function in `production.js`. At the very end (after tabs are set up and data loaded), add:

```javascript
// Handle deep-link view params from dashboard tiles
const viewParam = new URLSearchParams(window.location.search).get('view');
if (viewParam === 'newbatch') {
  // Open the new batch form immediately
  setTimeout(() => openNewBatchForm(), 300);
} else if (viewParam === 'logparams') {
  // Switch to Finished Goods tab (closest proxy until a dedicated params log tab exists)
  switchTab('finished-goods');
} else if (viewParam === 'mybatches') {
  // Filter batch list to current user's batches
  switchTab('batches');
  setTimeout(() => {
    const user = JSON.parse(sessionStorage.getItem('erpUser') || '{}');
    if (user.name) {
      filterBatchesByOperator(user.name);
    }
  }, 500);
} else if (viewParam === 'today') {
  // Filter to today's batches
  switchTab('batches');
  setTimeout(() => filterBatchesToday(), 500);
} else if (viewParam === 'batches') {
  switchTab('batches');
}
```

- [ ] **Step 2: Write `filterBatchesByOperator()` helper**

```javascript
function filterBatchesByOperator(operatorName) {
  const rows = document.querySelectorAll('#batch-table tbody tr');
  rows.forEach(row => {
    const operatorCell = row.cells[3]; // adjust index to match operator column position
    if (operatorCell) {
      row.style.display = operatorCell.textContent.trim() === operatorName ? '' : 'none';
    }
  });
}
```

- [ ] **Step 3: Write `filterBatchesToday()` helper**

```javascript
function filterBatchesToday() {
  const today = new Date().toISOString().split('T')[0];
  const rows = document.querySelectorAll('#batch-table tbody tr');
  rows.forEach(row => {
    const dateCell = row.cells[4]; // adjust index to match date column position
    if (dateCell) {
      row.style.display = dateCell.textContent.trim() === today ? '' : 'none';
    }
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add js/production.js
git commit -m "feat: handle ?view= deep-link params in production module"
```

---

### Task 3: quality.js — Read `?view` param on load

**Files:**
- Modify: `js/quality.js`

- [ ] **Step 1: Add view-param handler at end of quality.js init**

```javascript
const viewParam = new URLSearchParams(window.location.search).get('view');
if (viewParam === 'newcheck') {
  setTimeout(() => openNewCheckForm(), 300);
}
```

- [ ] **Step 2: Commit**

```bash
git add js/quality.js
git commit -m "feat: handle ?view=newcheck deep-link in quality module"
```

---

### Task 4: Sub-tab i18n — Add `data-i18n` to all module tab labels

**Files:**
- Modify: `production.html`, `quality.html`, `dispatch.html`, `maintenance.html`, `compliance.html`, `grn.html`

For each page, find the sub-tab buttons in the HTML. They currently have hardcoded English text. Add `data-i18n="tabs.xxx"` attribute and the matching key in both JSON files.

- [ ] **Step 1: production.html — add data-i18n to sub-tabs**

Find the sub-tab buttons (look for `<button` elements with tab switching behavior, text like "Batch Orders", "Finished Goods"). Change to:

```html
<button ... data-i18n="tabs.batchOrders">Batch Orders</button>
<button ... data-i18n="tabs.finishedGoods">Finished Goods</button>
```

- [ ] **Step 2: quality.html — add data-i18n to sub-tabs**

```html
<button ... data-i18n="tabs.summary">Summary</button>
<button ... data-i18n="tabs.checkLog">Check Log</button>
```

- [ ] **Step 3: dispatch.html — add data-i18n to sub-tabs**

```html
<button ... data-i18n="tabs.salesOrders">Sales Orders</button>
<button ... data-i18n="tabs.dispatchLog">Dispatch Log</button>
```

- [ ] **Step 4: maintenance.html — add data-i18n to sub-tabs**

```html
<button ... data-i18n="tabs.breakdowns">Breakdowns</button>
<button ... data-i18n="tabs.pmSchedule">PM Schedule</button>
```

- [ ] **Step 5: compliance.html — add data-i18n to sub-tabs**

```html
<button ... data-i18n="tabs.legalRegister">Legal Register</button>
<button ... data-i18n="tabs.capaLog">CAPA Log</button>
```

- [ ] **Step 6: grn.html — add data-i18n to sub-tabs**

```html
<button ... data-i18n="tabs.grnHistory">GRN History</button>
<button ... data-i18n="tabs.stockLevels">Stock Levels</button>
```

- [ ] **Step 7: Commit HTML changes**

```bash
git add production.html quality.html dispatch.html maintenance.html compliance.html grn.html
git commit -m "feat: add data-i18n attributes to all module sub-tab labels"
```

---

### Task 5: Add sub-tab i18n keys to lang JSON files

**Files:**
- Modify: `lang/en.json`, `lang/hi.json`

- [ ] **Step 1: Add `tabs` section to en.json**

Open `lang/en.json`. Find the end of the JSON object (before the closing `}`). Add a `"tabs"` key:

```json
"tabs": {
  "batchOrders": "Batch Orders",
  "finishedGoods": "Finished Goods",
  "summary": "Summary",
  "checkLog": "Check Log",
  "salesOrders": "Sales Orders",
  "dispatchLog": "Dispatch Log",
  "breakdowns": "Breakdowns",
  "pmSchedule": "PM Schedule",
  "legalRegister": "Legal Register",
  "capaLog": "CAPA Log",
  "grnHistory": "GRN History",
  "stockLevels": "Stock Levels"
}
```

- [ ] **Step 2: Add `tabs` section to hi.json**

Open `lang/hi.json`. Add:

```json
"tabs": {
  "batchOrders": "बैच ऑर्डर",
  "finishedGoods": "तैयार माल",
  "summary": "सारांश",
  "checkLog": "जांच लॉग",
  "salesOrders": "बिक्री आदेश",
  "dispatchLog": "डिस्पैच लॉग",
  "breakdowns": "खराबियां",
  "pmSchedule": "PM शेड्यूल",
  "legalRegister": "कानूनी रजिस्टर",
  "capaLog": "CAPA लॉग",
  "grnHistory": "GRN इतिहास",
  "stockLevels": "स्टॉक स्तर"
}
```

- [ ] **Step 3: Commit JSON files**

```bash
git add lang/en.json lang/hi.json
git commit -m "feat: add sub-tab label i18n keys to en/hi lang files"
```

---

### Task 6: Create calibration.html stub page

**Files:**
- Create: `calibration.html`

- [ ] **Step 1: Create calibration.html**

Copy the structure from `maintenance.html` as a template. Replace content with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#EA580C">
  <title>Calibration — YPP ERP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="module-header">
    <button class="back-btn" onclick="history.back()" aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <span class="module-title" data-i18n="page.calibration">Calibration</span>
  </header>

  <div id="main-content" class="main-content">
    <div class="empty-msg" style="padding:2rem;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:1rem;">⚙️</div>
      <h3 style="color:var(--primary);margin-bottom:0.5rem;">Calibration Module</h3>
      <p style="color:#6b7280;">Equipment calibration tracking is coming soon.<br>Records will appear here once implemented.</p>
      <p style="margin-top:1.5rem;font-size:0.85rem;color:#9ca3af;">Contact your QMR to log calibration records manually in the Calibration_Records sheet for now.</p>
    </div>
  </div>

  <script src="js/auth.js"></script>
  <script src="js/lang.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof Auth !== 'undefined') Auth.requireLogin();
      if (typeof Lang !== 'undefined') Lang.apply();
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Add calibration i18n key to lang files**

In `lang/en.json`, inside `"page"` object:

```json
"calibration": "Calibration"
```

In `lang/hi.json`, inside `"page"` object:

```json
"calibration": "अंशांकन"
```

- [ ] **Step 3: Commit**

```bash
git add calibration.html lang/en.json lang/hi.json
git commit -m "feat: add calibration stub page with coming-soon state"
```

---

### Task 7: Create ncr.html stub page

**Files:**
- Create: `ncr.html`

- [ ] **Step 1: Create ncr.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#EA580C">
  <title>NCR Log — YPP ERP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="module-header">
    <button class="back-btn" onclick="history.back()" aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <span class="module-title" data-i18n="page.ncr">NCR Log</span>
  </header>

  <div id="main-content" class="main-content">
    <div class="empty-msg" style="padding:2rem;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:1rem;">🚫</div>
      <h3 style="color:var(--primary);margin-bottom:0.5rem;">Non-Conformance Reports</h3>
      <p style="color:#6b7280;">NCR logging is coming soon.<br>For now, log non-conformances via the CAPA module.</p>
      <a href="compliance.html" class="btn btn-primary" style="margin-top:1.5rem;display:inline-block;text-decoration:none;">Go to CAPA Log</a>
    </div>
  </div>

  <script src="js/auth.js"></script>
  <script src="js/lang.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof Auth !== 'undefined') Auth.requireLogin();
      if (typeof Lang !== 'undefined') Lang.apply();
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Add ncr i18n key to lang files**

In `lang/en.json`, inside `"page"` object:

```json
"ncr": "NCR Log"
```

In `lang/hi.json`, inside `"page"` object:

```json
"ncr": "NCR लॉग"
```

- [ ] **Step 3: Commit**

```bash
git add ncr.html lang/en.json lang/hi.json
git commit -m "feat: add NCR stub page with redirect to CAPA"
```

---

### Task 8: Push and verify navigation

- [ ] **Step 1: Push all changes**

```bash
git push origin master
```

- [ ] **Step 2: Verify tile navigation (as director)**

1. Open app.html, log in as director
2. Click each tile — verify no 404s, each module opens
3. Check that Calibration → calibration.html stub appears
4. Check that NCR → ncr.html stub with CAPA link appears

- [ ] **Step 3: Verify operator tile deep-links**

1. Log in as operator role
2. Click "Start Batch" → verify production.html opens and New Batch form slides in immediately
3. Click "Log Defect" → verify quality.html opens and New Check form slides in immediately

- [ ] **Step 4: Verify lang toggle on sub-tab labels**

1. On any module page, toggle EN↔HI
2. Verify sub-tab buttons (Batch Orders / बैच ऑर्डर, etc.) update correctly

- [ ] **Step 5: Final commit for any fixes**

```bash
git add -A
git commit -m "fix: navigation smoke test corrections"
git push origin master
```
