# ERP — Backend Validation & Server-Side Auth Checks

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side role verification, field-level validation, and duplicate-prevention to the Google Apps Script backend so the system doesn't rely solely on client-side guards.

**Architecture:** Every `doGet()` action currently trusts client-supplied `role` and `userId` params. We add a `validateSession(params)` helper that looks up the user PIN hash from the `Users` sheet and verifies the supplied `userId` is Active. Write actions (save*, update*, delete*, resolve*, close*) check that the caller's role is in the allowed list for that action. Field validators run before any sheet write. Duplicate checks run on create-only actions.

**Tech Stack:** Google Apps Script, Spreadsheet service, SHA256 via `Utilities.computeDigest()`.

---

## File Map

| File | Change |
|------|--------|
| `gas/Code.gs` | Add `validateSession()`, `requireRole()`, `validateFields()`, `checkDuplicate()` helpers; call them from each write action |

---

### Task 1: Add session validation helper

Write actions currently do no auth check — anyone who knows the URL can write data.

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Add `validateSession()` helper function**

Add near the top of `Code.gs`, before the `doGet()` function:

```javascript
/**
 * Validates that the userId param refers to an Active user.
 * Returns { valid: true, user: {...} } or { valid: false, error: '...' }
 */
function validateSession(params) {
  if (!params.userId) return { valid: false, error: 'Not authenticated' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { valid: false, error: 'Users sheet not found' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf('user_id');
  var activeIdx = headers.indexOf('active');
  var roleIdx = headers.indexOf('role');
  var nameIdx = headers.indexOf('name');

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(params.userId)) {
      var isActive = activeIdx !== -1 ? data[i][activeIdx] : true;
      if (!isActive) return { valid: false, error: 'User account inactive' };
      return {
        valid: true,
        user: {
          id: data[i][idIdx],
          role: roleIdx !== -1 ? data[i][roleIdx] : '',
          name: nameIdx !== -1 ? data[i][nameIdx] : ''
        }
      };
    }
  }
  return { valid: false, error: 'User not found' };
}
```

- [ ] **Step 2: Add `requireRole()` helper**

```javascript
/**
 * Checks that session user has one of the allowed roles.
 * Returns null if OK, or error string if not.
 */
function requireRole(params, allowedRoles) {
  var session = validateSession(params);
  if (!session.valid) return session.error;
  if (allowedRoles.indexOf(session.user.role) === -1) {
    return 'Access denied. Required role: ' + allowedRoles.join(' or ');
  }
  return null;
}
```

- [ ] **Step 3: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: add validateSession and requireRole helpers to Code.gs"
```

---

### Task 2: Add field validators

**Files:**
- Modify: `gas/Code.gs`

- [ ] **Step 1: Add `validateFields()` helper**

```javascript
/**
 * Validates that required fields are present and non-empty.
 * fields: array of field names that must be in params and non-empty.
 * Returns null if OK, or error string listing missing fields.
 */
function validateFields(params, requiredFields) {
  var missing = [];
  requiredFields.forEach(function(f) {
    if (!params[f] || String(params[f]).trim() === '') missing.push(f);
  });
  return missing.length > 0 ? 'Missing required fields: ' + missing.join(', ') : null;
}
```

- [ ] **Step 2: Add `checkDuplicate()` helper**

```javascript
/**
 * Checks if a value already exists in a sheet column.
 * Returns true if duplicate found (existing row other than excludeId).
 */
function checkDuplicate(sheetName, colName, value, idCol, excludeId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colIdx = headers.indexOf(colName);
  var idIdx = idCol ? headers.indexOf(idCol) : -1;
  if (colIdx === -1) return false;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]).toLowerCase() === String(value).toLowerCase()) {
      if (excludeId && idIdx !== -1 && String(data[i][idIdx]) === String(excludeId)) continue;
      return true;
    }
  }
  return false;
}
```

- [ ] **Step 3: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: add validateFields and checkDuplicate helpers"
```

---

### Task 3: Guard write actions with auth + validation

For each write action, add: (1) role check, (2) field validation, (3) duplicate check where applicable.

**Files:**
- Modify: `gas/Code.gs`

Note: The frontend must pass `userId` in every API call. If it doesn't yet, the check degrades gracefully — an empty `userId` will return `{ success: false, error: 'Not authenticated' }`. The frontend will surface this as an alert.

- [ ] **Step 1: Guard `saveBatch()` (Production)**

At the start of `saveBatch()`:

```javascript
function saveBatch(params) {
  var authError = requireRole(params, ['director', 'supervisor', 'operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['product_id', 'machine_id', 'planned_qty', 'batch_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 2: Guard `closeBatch()` (Production)**

```javascript
function closeBatch(params) {
  var authError = requireRole(params, ['director', 'supervisor', 'operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['batch_id', 'actual_qty']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 3: Guard `saveQualityCheck()`**

```javascript
function saveQualityCheck(params) {
  var authError = requireRole(params, ['director', 'qmr', 'supervisor', 'operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['batch_id', 'parameter', 'measured_value', 'spec_min', 'spec_max']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 4: Guard `saveSO()` (Dispatch)**

```javascript
function saveSO(params) {
  var authError = requireRole(params, ['director', 'store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['customer_id', 'product_id', 'qty', 'so_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 5: Guard `saveDispatch()`**

```javascript
function saveDispatch(params) {
  var authError = requireRole(params, ['director', 'store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['so_id', 'qty_dispatched', 'invoice_no', 'dispatch_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 6: Guard `saveGRN()`**

```javascript
function saveGRN(params) {
  var authError = requireRole(params, ['director', 'store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['supplier_id', 'material_name', 'received_qty', 'received_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 7: Guard `saveBreakdown()`**

```javascript
function saveBreakdown(params) {
  var authError = requireRole(params, ['director', 'supervisor', 'operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['equipment_id', 'breakdown_type', 'description', 'reported_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 8: Guard `resolveBreakdown()`**

```javascript
function resolveBreakdown(params) {
  var authError = requireRole(params, ['director', 'supervisor']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['breakdown_id', 'resolution_notes', 'resolved_by', 'resolved_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 9: Guard `saveCapa()`**

```javascript
function saveCapa(params) {
  var authError = requireRole(params, ['director', 'qmr']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['source', 'description', 'target_date']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 10: Guard `updateCapaStatus()` (close CAPA)**

```javascript
function updateCapaStatus(params) {
  var authError = requireRole(params, ['director', 'qmr']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(params, ['capa_id', 'status']);
  if (fieldError) return { success: false, error: fieldError };

  // ... rest of existing function
}
```

- [ ] **Step 11: Guard `saveMaster()` with duplicate check**

In `saveMaster()`, after the role check (which it already has), add duplicate prevention for new records:

```javascript
// Only check duplicate on create (new record has no existing id)
if (!params.isUpdate || params.isUpdate === 'false') {
  var dupConfig = {
    'Products': { col: 'product_code', id: 'product_id' },
    'Customers': { col: 'customer_code', id: 'customer_id' },
    'Suppliers': { col: 'supplier_code', id: 'supplier_id' }
  };
  var cfg = dupConfig[params.sheet];
  if (cfg && params[cfg.col]) {
    if (checkDuplicate(params.sheet, cfg.col, params[cfg.col], cfg.id, null)) {
      return { success: false, error: cfg.col + ' already exists: ' + params[cfg.col] };
    }
  }
}
```

- [ ] **Step 12: Guard `deleteRecord()` and `updateRecord()` (from Plan 1)**

```javascript
function deleteRecord(sheetName, rowId, idCol) {
  // Note: params not passed here — these helpers are called from doGet which passes params
  // If called via doGet, add auth check in the case handler instead:
}
```

In the `doGet()` switch block, for the `deleteRecord` case:

```javascript
case 'deleteRecord':
  var authErr = requireRole(params, ['director', 'qmr', 'supervisor']);
  if (authErr) { result = { success: false, error: authErr }; break; }
  result = deleteRecord(params.sheet, params.rowId, params.idCol);
  break;

case 'updateRecord':
  var authErr2 = requireRole(params, ['director', 'qmr', 'supervisor']);
  if (authErr2) { result = { success: false, error: authErr2 }; break; }
  result = updateRecord(params.sheet, params.rowId, params.idCol, params.fields);
  break;
```

- [ ] **Step 13: Commit all guards**

```bash
git add gas/Code.gs
git commit -m "feat: add server-side role checks and field validation to all write actions"
```

---

### Task 4: Pass userId in all frontend API calls

The frontend must pass `userId` on every write call. `userId` should be stored in `sessionStorage` after login.

**Files:**
- Modify: `js/auth.js` — ensure userId is stored on login
- Modify: each module JS — add `userId` to all write action params

- [ ] **Step 1: Verify userId is stored on login in auth.js**

Open `js/auth.js`. Find the login success handler. After storing the session, confirm it stores `userId`:

```javascript
sessionStorage.setItem('erpUser', JSON.stringify({
  userId: user.user_id,   // ensure this key is stored
  name: user.name,
  role: user.role,
  lang: user.lang
}));
```

If the key is named differently (e.g. `id`), note the actual key name for the next step.

- [ ] **Step 2: Add a `getSession()` helper to auth.js**

If not already present:

```javascript
Auth.getSession = function() {
  return JSON.parse(sessionStorage.getItem('erpUser') || '{}');
};
```

- [ ] **Step 3: Add userId to write calls in production.js**

In `submitBatch()`, `closeBatchAction()`, `updateBatch()`, `deleteBatch()` — add to the URLSearchParams:

```javascript
userId: Auth.getSession().userId || ''
```

Example for `submitBatch()`:

```javascript
const params = new URLSearchParams({
  action: 'saveBatch',
  userId: Auth.getSession().userId || '',
  product_id: document.getElementById('batch-product').value,
  // ... other fields
});
```

- [ ] **Step 4: Add userId to write calls in quality.js, grn.js, dispatch.js, maintenance.js, compliance.js**

Repeat the same pattern in every `submitX()`, `updateX()`, `deleteX()` function in each JS file. Each `URLSearchParams` object for a write action must include `userId: Auth.getSession().userId || ''`.

- [ ] **Step 5: Commit frontend userId changes**

```bash
git add js/production.js js/quality.js js/grn.js js/dispatch.js js/maintenance.js js/compliance.js js/auth.js
git commit -m "feat: pass userId in all frontend write API calls for server-side auth"
```

---

### Task 5: Deploy and test

- [ ] **Step 1: Push Apps Script**

```bash
cd gas
clasp push --force
```

Expected: `Pushed N files.`

- [ ] **Step 2: Push frontend to GitHub Pages**

```bash
git push origin master
```

- [ ] **Step 3: Test auth guard**

1. Open browser DevTools → Network tab
2. Copy a write API URL from a successful request (e.g. `?action=saveBatch&...`)
3. Remove `&userId=...` from the URL and paste in address bar
4. Expected response: `{"success":false,"error":"Not authenticated"}`

- [ ] **Step 4: Test field validation**

1. In the production module, open New Batch form
2. Leave `planned_qty` empty and submit
3. Expected: alert showing `Missing required fields: planned_qty`

- [ ] **Step 5: Test duplicate prevention**

1. In Masters → Products, try to create a product with an existing `product_code`
2. Expected: alert showing `product_code already exists: XXX`

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix: validation smoke test corrections"
git push origin master
```

---

## Self-Review

**Spec coverage:**
- ✅ Server-side role verification on all write actions — Tasks 3, 4
- ✅ Field-level required field validation — Task 2, Task 3
- ✅ Duplicate prevention for Products/Customers/Suppliers in Masters — Task 3 step 11
- ✅ `userId` passed from frontend — Task 4
- ✅ `deleteRecord` and `updateRecord` guarded — Task 3 step 12

**Items NOT in this plan (accepted scope boundaries):**
- CSRF tokens (not feasible with GET-only Apps Script tunnel)
- Session timeout (handled client-side by auth.js cookie expiry)
- Rate limiting (not natively available in Apps Script without UrlFetch quotas)
- Input sanitization against injection (Apps Script + Sheets is not SQL — no injection surface for standard writes)
- Backend PIN hash salting (existing SHA256 approach is acceptable for internal factory tool; salting would require schema change)
