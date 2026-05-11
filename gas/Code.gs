// ── Entry Points ────────────────────────────────────────────────────────────

// ── Calibration KB ───────────────────────────────────────────────────────────

const INSTRUMENTS_KB = [
  { id: 'INST001', name: 'Vernier Caliper',         location: 'QC Lab',       frequency_months: 6,  standard: 'IS 3651' },
  { id: 'INST002', name: 'Wall-Thickness Gauge',    location: 'Production',   frequency_months: 6,  standard: 'IS 7328' },
  { id: 'INST003', name: 'Weighing Scale (Lab)',    location: 'QC Lab',       frequency_months: 12, standard: 'IS 1435' },
  { id: 'INST004', name: 'Weighing Scale (Store)',  location: 'Stores',       frequency_months: 12, standard: 'IS 1435' },
  { id: 'INST005', name: 'Pressure Gauge',          location: 'Production',   frequency_months: 6,  standard: 'IS 3624' },
  { id: 'INST006', name: 'IR Temperature Gun',      location: 'Production',   frequency_months: 12, standard: 'IS 15614' },
  { id: 'INST007', name: 'Torque Tester',           location: 'QC Lab',       frequency_months: 12, standard: 'IS 7096' },
  { id: 'INST008', name: 'MFI Tester',              location: 'QC Lab',       frequency_months: 12, standard: 'IS 2530' }
];

// ── Wave 5 KB Constants ──────────────────────────────────────────────────────

const BREAKDOWN_CODES_KB = [
  { id: 'MECH',  label: 'Mechanical' },
  { id: 'ELEC',  label: 'Electrical' },
  { id: 'PNEUM', label: 'Pneumatic' },
  { id: 'HYD',   label: 'Hydraulic' },
  { id: 'OTHER', label: 'Other' }
];

const TRAINING_PLAN_KB = [
  { id: 'TR001', topic: 'ISO 9001:2015 / 14001:2015 / 45001:2018 Awareness', category: 'Quality',   frequency: 'On Joining' },
  { id: 'TR002', topic: 'New Employee Induction — Company Policy & QMS',       category: 'Process',   frequency: 'On Joining' },
  { id: 'TR003', topic: 'QMS Documentation, SOPs & Document Control',          category: 'Quality',   frequency: 'Annual'     },
  { id: 'TR004', topic: 'Internal Audit Techniques',                            category: 'Audit',     frequency: 'Annual'     },
  { id: 'TR005', topic: 'Machine Operation & Safety',                           category: 'Safety',    frequency: 'On Joining' },
  { id: 'TR006', topic: 'Quality Inspection Methods & Use of Instruments',      category: 'Quality',   frequency: 'Annual'     },
  { id: 'TR007', topic: 'Fire Safety & Emergency Evacuation',                   category: 'Safety',    frequency: 'Annual'     },
  { id: 'TR008', topic: 'Customer Focus & Complaint Handling',                  category: 'Customer',  frequency: 'Annual'     }
];

const KPIS_KB = [
  { id: 'KPI001', name: 'Rejection Rate',            category: 'Quality',   unit: '%',     target_label: '< 3%'   },
  { id: 'KPI002', name: 'Customer Complaint Rate',   category: 'Customer',  unit: 'count', target_label: '0/month' },
  { id: 'KPI003', name: 'On-Time Delivery Rate',     category: 'Delivery',  unit: '%',     target_label: '≥ 95%'  },
  { id: 'KPI004', name: 'First Pass Yield (FPY)',    category: 'Quality',   unit: '%',     target_label: '≥ 97%'  },
  { id: 'KPI005', name: 'Machine Downtime (MTBF)',   category: 'Equipment', unit: 'hrs',   target_label: '≥ 200h' },
  { id: 'KPI006', name: 'PM Compliance Rate',        category: 'Equipment', unit: '%',     target_label: '≥ 90%'  },
  { id: 'KPI007', name: 'Raw Material Yield',        category: 'Process',   unit: '%',     target_label: '≥ 98%'  },
  { id: 'KPI008', name: 'CAPA Closure Rate',         category: 'Quality',   unit: '%',     target_label: '≥ 80%'  }
];

// ── Wave 6 KB Constants ──────────────────────────────────────────────────────

const LEGAL_REGISTER_KB = [
  { id: 'LR001', act: 'The Factories Act, 1948',               category: 'Safety',      responsible: 'R007' },
  { id: 'LR002', act: 'Environment Protection Act, 1986',      category: 'Environment', responsible: 'R007' },
  { id: 'LR003', act: 'Hazardous Waste Management Rules',      category: 'Environment', responsible: 'R007' },
  { id: 'LR004', act: 'BIS Compulsory Registration (BIS CRS)', category: 'Product',     responsible: 'R002' },
  { id: 'LR005', act: 'Plastic Waste Management Rules, 2016',  category: 'Environment', responsible: 'R007' },
  { id: 'LR006', act: 'ISO 9001:2015 Certification',           category: 'Quality',     responsible: 'R002' },
  { id: 'LR007', act: 'Fire NOC (Local Fire Authority)',        category: 'Safety',      responsible: 'R007' },
  { id: 'LR008', act: 'ESIC / EPF Compliance',                 category: 'Labour',      responsible: 'R008' }
];

// ── Wave 4 KB Constants ──────────────────────────────────────────────────────

const SUPPLIERS_KB = [
  { id: 'S001', name: 'Primary HDPE Supplier', category: 'RM', items: ['HDPE Resin'] },
  { id: 'S002', name: 'Alternate HDPE Supplier', category: 'RM', items: ['HDPE Resin'] },
  { id: 'S003', name: 'Masterbatch Supplier', category: 'RM', items: ['Masterbatch'] },
  { id: 'S004', name: 'Carton Supplier', category: 'Packaging', items: ['Cartons'] },
  { id: 'S005', name: 'Label Supplier', category: 'Label', items: ['Labels'] }
];

const PACKAGING_SPECS_KB = [
  { product_id: 'PRD001', product_name: 'CAN-5L',    polybag_qty: 1,  marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] },
  { product_id: 'PRD002', product_name: 'BTL-1L',    polybag_qty: 6,  marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] },
  { product_id: 'PRD003', product_name: 'BTL-200ML', polybag_qty: 12, marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] },
  { product_id: 'PRD004', product_name: 'BTL-100ML', polybag_qty: 24, marking_fields: ['product_name','batch_no','qty','mfg_date','customer_name','net_weight'] }
];

const LABEL_SPECS_KB = [
  { product_id: 'PRD001', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] },
  { product_id: 'PRD002', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] },
  { product_id: 'PRD003', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] },
  { product_id: 'PRD004', batch_format: 'YPP-BYYMM-NNN', fields: ['product_name','capacity','material','batch_no','mfg_date','net_weight','manufacturer_name','manufacturer_address','gstin','customer_name','caution_marks'] }
];

const BOM_KB = [
  { product_id: 'PRD001', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.5  }] },
  { product_id: 'PRD002', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.12 }] },
  { product_id: 'PRD003', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.025 }] },
  { product_id: 'PRD004', rm_items: [{ material: 'HDPE Resin', supplier_id: 'S001', qty_per_unit_kg: 0.013 }] }
];

// ── Server-Side Validation ──────────────────────────────────────────────────

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
      return { valid: true, user: { id: data[i][idIdx], role: roleIdx !== -1 ? data[i][roleIdx] : '', name: nameIdx !== -1 ? data[i][nameIdx] : '' } };
    }
  }
  return { valid: false, error: 'User not found' };
}

function requireRole(params, allowedRoles) {
  var session = validateSession(params);
  if (!session.valid) return session.error;
  if (allowedRoles.indexOf(session.user.role) === -1) {
    return 'Access denied. Required role: ' + allowedRoles.join(' or ');
  }
  return null;
}

function validateFields(params, requiredFields) {
  var missing = [];
  requiredFields.forEach(function(f) {
    if (!params[f] || String(params[f]).trim() === '') missing.push(f);
  });
  return missing.length > 0 ? 'Missing required fields: ' + missing.join(', ') : null;
}

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

function doGet(e) {
  const action = e.parameter.action;
  try {
    // Read actions
    if (action === 'getUsers')          return respond(getUsers());
    if (action === 'getMasterList')     return respond(getMasterList(e.parameter.entity));
    if (action === 'getMasterDropdown') return respond(getMasterDropdown(e.parameter.entity));
    if (action === 'getGRNList')        return respond(getGRNList(e.parameter));
    if (action === 'getStockList')      return respond(getStockList());
    if (action === 'getLegalRegister')  return respond(getLegalRegister());
    if (action === 'getCapaList')       return respond(getCapaList(e.parameter));
    if (action === 'getBreakdownList')  return respond(getBreakdownList(e.parameter));
    if (action === 'getPMSchedule')     return respond(getPMSchedule());
    if (action === 'getBatchList')      return respond(getBatchList(e.parameter));
    if (action === 'getFinishedGoods')  return respond(getFinishedGoods());
    if (action === 'getQualityChecks')  return respond(getQualityChecks(e.parameter));
    if (action === 'getQualitySummary') return respond(getQualitySummary());
    if (action === 'getSOList')         return respond(getSOList(e.parameter));
    if (action === 'getDispatchList')   return respond(getDispatchList(e.parameter));
    if (action === 'getDashboardStats') return respond(getDashboardStats());

    // Write actions tunnelled via GET to avoid CORS preflight
    if (e.parameter.payload) {
      const data = JSON.parse(e.parameter.payload);
      if (action === 'login')            return respond(login(data));
      if (action === 'updateLanguage')   return respond(updateLanguage(data));
      if (action === 'saveMaster')       return respond(saveMaster(data));
      if (action === 'deactivateMaster') return respond(deactivateMaster(data));
      if (action === 'saveGRN')          return respond(saveGRN(data));
      if (action === 'saveCapa')         return respond(saveCapa(data));
      if (action === 'updateCapaStatus') return respond(updateCapaStatus(data));
      if (action === 'saveBreakdown')    return respond(saveBreakdown(data));
      if (action === 'resolveBreakdown') return respond(resolveBreakdown(data));
      if (action === 'saveBatch')        return respond(saveBatch(data));
      if (action === 'closeBatch')       return respond(closeBatch(data));
      if (action === 'saveQualityCheck') return respond(saveQualityCheck(data));
      if (action === 'saveNCR') return respond(saveNCR(data));
      if (action === 'saveQualityCheckSheet') return respond(saveQualityCheckSheet(data));
      if (action === 'saveSO')           return respond(saveSO(data));
      if (action === 'saveDispatch')     return respond(saveDispatch(data));
      if (action === 'updateRecord') {
        var updAuthErr = requireRole(data, ['director','qmr','supervisor']);
        if (updAuthErr) return respond({ success: false, error: updAuthErr });
        return respond(updateRecord(data));
      }
      if (action === 'deleteRecord') {
        var delAuthErr = requireRole(data, ['director','qmr','supervisor']);
        if (delAuthErr) return respond({ success: false, error: delAuthErr });
        return respond(deleteRecord(data));
      }
      if (action === 'completePM')            return respond(completePM(data));
      if (action === 'savePMTask')            return respond(savePMTask(data));
      if (action === 'deletePMTask')          return respond(deletePMTask(data));
      if (action === 'planBatchFromSO')       return respond(planBatchFromSO(data));
      if (action === 'saveReorderRequest')    return respond(saveReorderRequest(data));
      if (action === 'closeReorderRequest')   return respond(closeReorderRequest(data));
      if (action === 'saveLegalEntry')        return respond(saveLegalEntry(data));
      if (action === 'saveQualityParam')      return respond(saveQualityParam(data));
      if (action === 'saveTrainingLog')       return respond(saveTrainingLog(data));
      if (action === 'saveKPILog')            return respond(saveKPILog(data));
      if (action === 'saveCustomerComplaint') return respond(saveCustomerComplaint(data));
      if (action === 'closeCustomerComplaint')return respond(closeCustomerComplaint(data));
      if (action === 'saveCalibrationLog')    return respond(saveCalibrationLog(data));
    }

    if (action === 'getQualityParams') return respond(getQualityParams(e.parameter));
    if (action === 'getInspectionParams') return respond(getInspectionParams(e.parameter));
    if (action === 'getDefectCatalogue')  return respond(getDefectCatalogue());
    if (action === 'getNCRList') return respond(getNCRList(e.parameter));
    if (action === 'getBatchRecord')        return respond(getBatchRecord(e.parameter));
    if (action === 'getOQCBatchList')       return respond(getOQCBatchList());
    if (action === 'getRMStock')            return respond(getRMStock());
    if (action === 'getSuppliers')          return respond(getSuppliers());
    if (action === 'getMachineList')        return respond(getMachineList());
    if (action === 'getOperatorList')       return respond(getOperatorList());
    if (action === 'getPersonnelList')      return respond(getPersonnelList());
    if (action === 'getTrainingLog')        return respond(getTrainingLog(e.parameter));
    if (action === 'getKPILog')             return respond(getKPILog(e.parameter));
    if (action === 'getCustomerComplaints') return respond(getCustomerComplaints(e.parameter));
    if (action === 'getKPIsKB')            return respond({ success: true, data: KPIS_KB });
    if (action === 'getTrainingPlanKB')    return respond({ success: true, data: TRAINING_PLAN_KB });
    if (action === 'getCalibrationList')   return respond(getCalibrationList(e.parameter));
    if (action === 'getInstrumentsKB')     return respond({ success: true, data: INSTRUMENTS_KB });
    if (action === 'getReorderList')       return respond(getReorderList(e.parameter));
    if (action === 'getSOListForPlanning') return respond(getSOListForPlanning());

    return respond({ success: false, error: 'unknown_action' });
  } catch (err) {
    Logger.log(err.message);
    return respond({ success: false, error: 'internal_error' });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Auth ────────────────────────────────────────────────────────────────────

function getUsers() {
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  const users = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, name, username, , , , active] = rows[i];
    if (active === true || active === 'TRUE') {
      users.push({ id, name, username });
    }
  }
  return { success: true, data: users };
}

function login(data) {
  const { username, pin } = data;
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const [id, name, uname, pinHash, role, lang, active, failCount, lockUntil] = rows[i];
    if (uname !== username) continue;

    if (active !== true && active !== 'TRUE') {
      return { success: false, error: 'inactive' };
    }

    // Check lockout
    if (lockUntil && new Date() < new Date(lockUntil)) {
      return { success: false, error: 'locked' };
    }

    const row = i + 1; // 1-indexed sheet row
    const enteredHash = hashPin(pin);

    if (enteredHash === pinHash) {
      // Reset fail count
      sheet.getRange(row, 8).setValue(0); // FailCount col H
      sheet.getRange(row, 9).setValue(''); // LockUntil col I
      return { success: true, data: { id, name, username: uname, role, lang } };
    } else {
      const newFail = (Number(failCount) || 0) + 1;
      sheet.getRange(row, 8).setValue(newFail);
      if (newFail >= 3) {
        const lockTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        sheet.getRange(row, 9).setValue(lockTime);
        return { success: false, error: 'locked' };
      }
      return { success: false, error: 'wrong_pin' };
    }
  }

  return { success: false, error: 'user_not_found' };
}

function updateLanguage(data) {
  const { username, lang } = data;
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === username) {
      sheet.getRange(i + 1, 6).setValue(lang); // Language col F
      return { success: true };
    }
  }
  return { success: false, error: 'user_not_found' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// CacheService wrapper — 60s TTL for read-heavy endpoints
function _cacheGet(key) {
  try { const v = CacheService.getScriptCache().get(key); return v ? JSON.parse(v) : null; } catch(_) { return null; }
}
function _cachePut(key, data, ttl) {
  try { CacheService.getScriptCache().put(key, JSON.stringify(data), ttl || 60); } catch(_) {}
}
function _cacheDel(key) {
  try { CacheService.getScriptCache().remove(key); } catch(_) {}
}
function _cacheBustMaster(entity) {
  _cacheDel('mdd_' + entity);
  _cacheDel('mlist_' + entity);
}

const _TZ_ = Session.getScriptTimeZone();
function rowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    const v = row[i];
    obj[h] = (v instanceof Date) ? Utilities.formatDate(v, _TZ_, 'yyyy-MM-dd') : v;
  });
  return obj;
}
function rowsToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => rowToObj(headers, row));
}

// ── Master Data CRUD ─────────────────────────────────────────────────────────

const MASTER_ENTITIES = ['Products','Customers','Suppliers','Equipment','Tooling','Spares','Personnel','BOM','QualityParams'];

function assertValidEntity(entity) {
  if (!MASTER_ENTITIES.includes(entity)) throw new Error('invalid_entity');
}

function getMasterList(entity) {
  assertValidEntity(entity);
  const cacheKey = 'mlist_' + entity;
  const cached = _cacheGet(cacheKey);
  if (cached) return { success: true, data: cached };
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1).map(row => rowToObj(headers, row));
  _cachePut(cacheKey, data, 120);
  return { success: true, data };
}

function getMasterDropdown(entity) {
  assertValidEntity(entity);
  const cacheKey = 'mdd_' + entity;
  const cached = _cacheGet(cacheKey);
  if (cached) return { success: true, data: cached };
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const nameCol = headers.indexOf('Name') >= 0 ? headers.indexOf('Name') : 1;
  const data = rows.slice(1)
    .filter(row => row[0])
    .map(row => ({ id: row[0], name: row[nameCol] }));
  _cachePut(cacheKey, data, 120);
  return { success: true, data };
}

function saveMaster(data) {
  const { entity, row } = data;
  assertValidEntity(entity);
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idVal = row[headers[0]];

  const values = headers.map(h => row[h] !== undefined ? row[h] : '');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idVal)) {
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);
      _cacheBustMaster(entity);
      return { success: true };
    }
  }
  sheet.appendRow(values);
  _cacheBustMaster(entity);
  return { success: true };
}

function deactivateMaster(data) {
  const { entity, id } = data;
  assertValidEntity(entity);
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const statusCol = headers.indexOf('Status') >= 0 ? headers.indexOf('Status') : headers.indexOf('Active');
  if (statusCol < 0) return { success: false, error: 'no_status_col' };

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const isStatusField = headers[statusCol] === 'Status';
      sheet.getRange(i + 1, statusCol + 1).setValue(isStatusField ? 'Inactive' : false);
      _cacheBustMaster(entity);
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function updateRecord(data) {
  // data: { sheet, idCol, idVal, fields: { colName: value, ... } }
  const sheet = getSheet(data.sheet);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf(data.idCol);
  if (idIdx < 0) return { success: false, error: 'id_col_not_found: ' + data.idCol };
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(data.idVal)) {
      Object.entries(data.fields).forEach(([col, val]) => {
        const colIdx = headers.indexOf(col);
        if (colIdx >= 0) sheet.getRange(i+1, colIdx+1).setValue(val);
      });
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function deleteRecord(data) {
  // data: { sheet, idCol, idVal }
  // Sets Status → 'Deleted' or Active → false depending on which column exists
  const sheet = getSheet(data.sheet);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx     = headers.indexOf(data.idCol);
  const statusIdx = headers.indexOf('Status');
  const activeIdx = headers.indexOf('Active');
  if (idIdx < 0) return { success: false, error: 'id_col_not_found' };
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(data.idVal)) {
      if (statusIdx >= 0)      sheet.getRange(i+1, statusIdx+1).setValue('Deleted');
      else if (activeIdx >= 0) sheet.getRange(i+1, activeIdx+1).setValue(false);
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function getQualityParams(params) {
  const sheet = getSheet('QualityParams');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => rowToObj(headers, row))
    .filter(r => r.Active !== false && r.Active !== 'FALSE');
  if (params && params.product_id) {
    data = data.filter(r => String(r.ProductID) === String(params.product_id) || String(r.ProductID) === 'ALL');
  }
  if (params && params.stage) {
    data = data.filter(r => !r.Stage || r.Stage === params.stage);
  }
  // Normalise field names to match what the frontend expects
  return { success: true, data: data.map(r => ({
    id: r.ParamID, parameter: r.Parameter, unit: r.Unit,
    spec_min: r.SpecMin !== '' && r.SpecMin !== null ? Number(r.SpecMin) : null,
    spec_max: r.SpecMax !== '' && r.SpecMax !== null ? Number(r.SpecMax) : null,
    stage: r.Stage, product_id: r.ProductID, active: r.Active
  })) };
}

function saveQualityParam(data) {
  const sheet = getSheet('QualityParams');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  if (data.ParamID) {
    const idIdx = headers.indexOf('ParamID');
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(data.ParamID)) {
        const values = headers.map(h => data[h] !== undefined ? data[h] : rows[i][headers.indexOf(h)]);
        sheet.getRange(i+1, 1, 1, values.length).setValues([values]);
        return { success: true, param_id: data.ParamID };
      }
    }
  }
  const param_id = 'QP' + String(rows.length).padStart(3, '0');
  sheet.appendRow([
    param_id,
    data.ProductID || '',
    data.Parameter || '',
    data.Unit || '',
    Number(data.SpecMin) || 0,
    Number(data.SpecMax) || 0,
    true
  ]);
  return { success: true, param_id };
}

function completePM(data) {
  const sheet = getSheet('PM_Schedule');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx       = headers.indexOf('PMID');
  const lastDoneIdx = headers.indexOf('LastDone');
  const nextDueIdx  = headers.indexOf('NextDue');
  const statusIdx   = headers.indexOf('Status');
  const remarksIdx  = headers.indexOf('Remarks');
  const freqIdx     = headers.indexOf('Frequency');
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(data.pm_id)) {
      const freq = Number(rows[i][freqIdx]) || 7;
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + freq);
      if (lastDoneIdx >= 0) sheet.getRange(i+1, lastDoneIdx+1).setValue(today);
      if (nextDueIdx  >= 0) sheet.getRange(i+1, nextDueIdx+1).setValue(nextDue.toISOString().slice(0,10));
      if (statusIdx   >= 0) sheet.getRange(i+1, statusIdx+1).setValue('Scheduled');
      if (remarksIdx  >= 0) sheet.getRange(i+1, remarksIdx+1).setValue(data.remarks || '');
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

// ── PM Task CRUD ─────────────────────────────────────────────────────────────

function savePMTask(data) {
  var authError = requireRole(data, ['director','supervisor']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['equip_id','task_type','frequency_days']);
  if (fieldError) return { success: false, error: fieldError };

  const PM_HEADERS = ['PMID','EquipID','TaskType','Frequency','LastDone','NextDue','AssignedTo','Status','Remarks'];
  const sheet = ensureSheet('PM_Schedule', PM_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().slice(0, 10);
  const freq = Number(data.frequency_days) || 7;
  const lastDone = data.last_done || '';
  const nextDue = lastDone
    ? (() => { const d = new Date(lastDone); d.setDate(d.getDate() + freq); return d.toISOString().slice(0, 10); })()
    : (() => { const d = new Date(); d.setDate(d.getDate() + freq); return d.toISOString().slice(0, 10); })();

  if (data.pm_id) {
    // Update existing
    const headers = rows[0];
    const idIdx = headers.indexOf('PMID');
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(data.pm_id)) {
        const set = (col, val) => { const idx = headers.indexOf(col); if (idx >= 0) sheet.getRange(i+1, idx+1).setValue(val); };
        set('EquipID', data.equip_id);
        set('TaskType', data.task_type);
        set('Frequency', freq);
        set('LastDone', lastDone);
        set('NextDue', nextDue);
        set('AssignedTo', data.assigned_to || '');
        set('Remarks', data.remarks || '');
        return { success: true, pm_id: data.pm_id };
      }
    }
    return { success: false, error: 'not_found' };
  }

  const pmId = 'PM' + String(rows.length).padStart(3, '0');
  sheet.appendRow([pmId, data.equip_id, data.task_type, freq, lastDone, nextDue, data.assigned_to || '', 'Scheduled', data.remarks || '']);
  return { success: true, pm_id: pmId };
}

function deletePMTask(data) {
  var authError = requireRole(data, ['director','supervisor']);
  if (authError) return { success: false, error: authError };
  const sheet = getSheet('PM_Schedule');
  const rows = sheet.getDataRange().getValues();
  const idIdx = rows[0].indexOf('PMID');
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(data.pm_id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

// ── SO → Batch Planning ───────────────────────────────────────────────────────

function getSOListForPlanning() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const soSheet = ss.getSheetByName('SalesOrders');
  if (!soSheet) return { success: true, data: [] };
  const rows = soSheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1)
    .map(r => rowToObj(headers, r))
    .filter(r => r.status !== 'Dispatched');
  return { success: true, data };
}

function planBatchFromSO(data) {
  var authError = requireRole(data, ['director','supervisor']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['so_id','product_id','planned_qty','machine_id']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('BatchOrders');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const batchId = 'BO' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);

  sheet.appendRow([
    batchId,
    data.date || today,
    data.product_id,
    Number(data.planned_qty),
    '',
    data.machine_id,
    data.operator_id || '',
    'Planned',
    data.start_time || '',
    data.so_id
  ]);

  // Link back: write batch_id into SO row
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const soSheet = ss.getSheetByName('SalesOrders');
  if (soSheet) {
    const soRows = soSheet.getDataRange().getValues();
    const soHeaders = soRows[0];
    const soIdIdx = soHeaders.indexOf('so_id');
    const batchColIdx = soHeaders.indexOf('batch_id');
    if (batchColIdx >= 0) {
      for (let i = 1; i < soRows.length; i++) {
        if (String(soRows[i][soIdIdx]) === String(data.so_id)) {
          soSheet.getRange(i + 1, batchColIdx + 1).setValue(batchId);
          break;
        }
      }
    }
  }

  return { success: true, batch_id: batchId };
}

// ── Reorder Requests ──────────────────────────────────────────────────────────

function getReorderList(params) {
  const RR_HEADERS = ['rr_id','date','material','supplier_id','requested_qty','status','notes','created_by','created_at'];
  const sheet = ensureSheet('ReorderRequests', RR_HEADERS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params && params.status && params.status !== 'all') {
    data = data.filter(r => r.status === params.status);
  }
  return { success: true, data };
}

function saveReorderRequest(data) {
  var authError = requireRole(data, ['director','supervisor','store_dispatch','store']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['material','requested_qty']);
  if (fieldError) return { success: false, error: fieldError };

  const RR_HEADERS = ['rr_id','date','material','supplier_id','requested_qty','status','notes','created_by','created_at'];
  const sheet = ensureSheet('ReorderRequests', RR_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const rrId = 'RR' + String(rows.length).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);

  sheet.appendRow([
    rrId,
    data.date || today,
    data.material,
    data.supplier_id || '',
    Number(data.requested_qty),
    'Open',
    data.notes || '',
    data.userId || '',
    new Date().toISOString()
  ]);
  return { success: true, rr_id: rrId };
}

function closeReorderRequest(data) {
  var authError = requireRole(data, ['director','supervisor','store_dispatch','store']);
  if (authError) return { success: false, error: authError };
  const sheet = getSheet('ReorderRequests');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('rr_id');
  const statusIdx = headers.indexOf('status');
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(data.rr_id)) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(data.status || 'Ordered');
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function saveLegalEntry(data) {
  const sheet = getSheet('Legal_Register');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  if (data.LegalID) {
    const idIdx = headers.indexOf('LegalID');
    if (idIdx >= 0) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][idIdx]) === String(data.LegalID)) {
          const values = headers.map(h => data[h] !== undefined ? data[h] : rows[i][headers.indexOf(h)]);
          sheet.getRange(i+1, 1, 1, values.length).setValues([values]);
          return { success: true };
        }
      }
    }
  }
  // Use skeleton headers: LegalID, Act, Requirement, Applicability, ComplianceStatus, LastReview, NextReview, Remarks
  const legal_id = 'LR' + String(rows.length).padStart(3, '0');
  const isNewSchema = headers.indexOf('LegalID') >= 0;
  if (isNewSchema) {
    sheet.appendRow([
      legal_id,
      data.Act || '',
      data.Requirement || '',
      data.Applicability || '',
      data.ComplianceStatus || 'Pending',
      data.LastReview || '',
      data.NextReview || '',
      data.Remarks || ''
    ]);
  } else {
    // Legacy 6-col schema: reg_id, regulation, applicability, due_date, status, last_reviewed
    sheet.appendRow([
      legal_id,
      data.Act || data.regulation || '',
      data.Applicability || data.applicability || '',
      data.NextReview || data.due_date || '',
      data.ComplianceStatus || data.status || 'Pending',
      data.LastReview || data.last_reviewed || ''
    ]);
  }
  return { success: true, legal_id };
}

// ── Inventory ────────────────────────────────────────────────────────────────

function getGRNList(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('RMStock');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params.supplier_id) {
    data = data.filter(r => String(r.supplier_id) === String(params.supplier_id));
  }
  return { success: true, data };
}

function saveGRN(data) {
  var authError = requireRole(data, ['director','supervisor','store_dispatch','store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['supplier_id','material','qty_kg','date']);
  if (fieldError) return { success: false, error: fieldError };

  const RM_HEADERS = ['date','grn_id','supplier_id','material','lot_no','qty_kg'];
  const sheet = ensureSheet('RMStock', RM_HEADERS);
  const rows = sheet.getDataRange().getValues();

  const lotNo = data.lot_no || '';
  const dupLot = lotNo && rows.slice(1).some(r => String(r[4]) === String(lotNo));

  const rowCount = rows.length;
  const today = new Date().toISOString().slice(0, 10);
  const mm = today.slice(2, 4) + today.slice(5, 7);
  const grnId = 'GRN-' + mm + '-' + String(rowCount).padStart(3, '0');

  sheet.appendRow([
    data.date || today,
    grnId,
    data.supplier_id,
    data.material,
    lotNo,
    Number(data.qty_kg)
  ]);

  return { success: true, grn_id: grnId, warning: dupLot ? 'duplicate_lot_no' : null };
}

function updateStock(materialId, materialName, unit, qty) {
  const sheet = getSheet('Stock');
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(materialId)) {
      const currentQty = Number(rows[i][3]) || 0;
      sheet.getRange(i + 1, 4).setValue(currentQty + qty); // current_qty col D
      sheet.getRange(i + 1, 6).setValue(today);             // last_updated col F
      return;
    }
  }
  // Not found — append new row
  sheet.appendRow([materialId, materialName || materialId, unit || '', qty, 0, today]);
}

function getStockList() {
  const sheet = getSheet('Stock');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = rowToObj(headers, row);
    obj.reorder_low = Number(obj.current_qty) <= Number(obj.reorder_level);
    return obj;
  });
  return { success: true, data };
}


// -- Maintenance ---------------------------------------------------------------

function getBreakdownList(params) {
  const sheet = getSheet('Breakdown_Log');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    return rowToObj(headers, row);
  });
  if (params.status && params.status !== 'all') {
    data = data.filter(r => r.Status === params.status);
  }
  return { success: true, data };
}

function saveBreakdown(data) {
  var authError = requireRole(data, ['director','supervisor','operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['machine_id','description','breakdown_code']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('Breakdown_Log');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const breakdownId = 'BD' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    breakdownId,
    data.machine_id,
    data.date || today,
    data.reported_by,
    data.description,
    data.breakdown_code,
    '',
    '',
    '',
    '',
    '',
    'Open'
  ]);
  return { success: true, breakdown_id: breakdownId };
}

function resolveBreakdown(data) {
  var authError = requireRole(data, ['director','supervisor']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['breakdown_id','resolution']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('Breakdown_Log');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx        = headers.indexOf('BreakdownID');
  const actionIdx    = headers.indexOf('ActionTaken');
  const fixedIdx     = headers.indexOf('FixedAt');
  const downtimeIdx  = headers.indexOf('Downtime_min');
  const spareIdx     = headers.indexOf('SpareUsed');
  const statusIdx    = headers.indexOf('Status');
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(data.breakdown_id)) {
      if (actionIdx  >= 0) sheet.getRange(i+1, actionIdx+1).setValue(data.resolution || '');
      if (fixedIdx   >= 0) sheet.getRange(i+1, fixedIdx+1).setValue(data.fixed_date || today);
      if (downtimeIdx>= 0) sheet.getRange(i+1, downtimeIdx+1).setValue(Number(data.downtime_min) || 0);
      if (spareIdx   >= 0) sheet.getRange(i+1, spareIdx+1).setValue(data.spare_used || '');
      if (statusIdx  >= 0) sheet.getRange(i+1, statusIdx+1).setValue('Closed');
      var sparesIndex = headers.indexOf('spares_used');
      if (sparesIndex !== -1) sheet.getRange(i+1, sparesIndex+1).setValue(data.spares_used || '');
      var downtimeIndex = headers.indexOf('downtime_hrs');
      if (downtimeIndex !== -1) sheet.getRange(i+1, downtimeIndex+1).setValue(Number(data.downtime_hrs) || 0);
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function getPMSchedule() {
  const sheet = getSheet('PM_Schedule');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const today = new Date();
  const data = rows.slice(1).map(row => {
    const obj = rowToObj(headers, row);
    const nextDue = obj.NextDue ? new Date(obj.NextDue) : null;
    obj.overdue = nextDue && nextDue < today;
    return obj;
  });
  return { success: true, data };
}

function seedMaintenanceData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, rows) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) { Logger.log('Sheet not found: ' + sheetName); return; }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  safeWrite('Breakdown_Log', [
    ['BD001','EQ001',fmt(addDays(today,-15)),'ramesh','Parison not forming correctly','MECH','Worn die head insert','Replaced die head insert 28mm',fmt(addDays(today,-14)),480,'SP009','Closed'],
    ['BD002','EQ003',fmt(addDays(today,-8)),'ramesh','Hydraulic pressure fluctuating','HYD','Seal kit failure','Replaced hydraulic seal kit',fmt(addDays(today,-7)),240,'SP005','Closed'],
    ['BD003','EQ002',fmt(today),'suresh','Heater band not heating','ELEC','','','','','','Open']
  ]);

  safeWrite('PM_Schedule', [
    ['PM001','EQ001','Hydraulic oil check',7,fmt(addDays(today,-3)),fmt(addDays(today,4)),'ramesh','Scheduled',''],
    ['PM002','EQ002','Die head cleaning',7,fmt(addDays(today,-10)),fmt(addDays(today,-3)),'ramesh','Scheduled','Overdue'],
    ['PM003','EQ003','Pneumatic line lubrication',7,fmt(addDays(today,-2)),fmt(addDays(today,5)),'ramesh','Scheduled',''],
    ['PM004','EQ004','V-belt tension check',7,fmt(addDays(today,-6)),fmt(addDays(today,1)),'ramesh','Scheduled','']
  ]);

  Logger.log('seedMaintenanceData complete.');
}

// ── Production ───────────────────────────────────────────────────────────────

function getBatchList(params) {
  const sheet = getSheet('BatchOrders');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    return rowToObj(headers, row);
  });
  if (params.status && params.status !== 'all') {
    data = data.filter(r => (r.Status || r.status) === params.status);
  }
  return { success: true, data };
}

function saveBatch(data) {
  var authError = requireRole(data, ['director','supervisor','operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['product_id','machine_id','planned_qty','batch_date']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('BatchOrders');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const batchId = 'BO' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    batchId,
    data.date || today,
    data.product_id,
    data.planned_qty,
    '',
    data.machine_id,
    data.operator_id || '',
    'Planned',
    data.start_time || '',
    ''
  ]);
  return { success: true, batch_id: batchId };
}

function closeBatch(data) {
  var authError = requireRole(data, ['director','supervisor','operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['batch_id','actual_qty']);
  if (fieldError) return { success: false, error: fieldError };

  const actualQty = Number(data.actual_qty);
  if (!Number.isFinite(actualQty) || actualQty <= 0) return { success: false, error: 'invalid_qty' };
  const sheet = getSheet('BatchOrders');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.batch_id)) {
      if (rows[i][7] === 'Closed') return { success: false, error: 'already_closed' };
      // Quality gate: block if NG rate > 20%
      const qcSheet = getSheet('QualityChecks');
      const qcRows = qcSheet.getDataRange().getValues();
      if (qcRows.length > 1) {
        const qcHeaders = qcRows[0];
        const batchIdx = qcHeaders.indexOf('batch_id');
        const resultIdx = qcHeaders.indexOf('result');
        const batchChecks = qcRows.slice(1).filter(r => String(r[batchIdx]) === String(data.batch_id));
        if (batchChecks.length > 0) {
          const ngCount = batchChecks.filter(r => r[resultIdx] === 'NG').length;
          const ngRate = ngCount / batchChecks.length;
          if (ngRate > 0.20 && data.override !== 'true') {
            return { success: false, error: 'quality_gate', ng_rate: Math.round(ngRate * 100), ng_count: ngCount, total: batchChecks.length };
          }
        }
      }
      sheet.getRange(i + 1, 5).setValue(actualQty);
      sheet.getRange(i + 1, 8).setValue('Closed');
      sheet.getRange(i + 1, 10).setValue(new Date().toISOString());
      const productId = rows[i][2];
      deductBOMStock(productId, actualQty);
      addFinishedGoods(data.batch_id, productId, actualQty);
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function deductBOMStock(product_id, qty) {
  const bomSheet = getSheet('BOM');
  const bomRows = bomSheet.getDataRange().getValues();
  const stockSheet = getSheet('Stock');
  const stockRows = stockSheet.getDataRange().getValues();
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 1; i < bomRows.length; i++) {
    if (String(bomRows[i][1]) !== String(product_id)) continue;
    const materialId = bomRows[i][2];
    const qtyPerUnit = Number(bomRows[i][4]) || 0;
    const deduct = qtyPerUnit * qty;

    for (let j = 1; j < stockRows.length; j++) {
      if (String(stockRows[j][0]) === String(materialId)) {
        const current = Number(stockRows[j][3]) || 0;
        stockSheet.getRange(j + 1, 4).setValue(Math.max(0, current - deduct));
        stockSheet.getRange(j + 1, 6).setValue(today);
        break;
      }
    }
  }
}

function addFinishedGoods(batch_id, product_id, qty) {
  const sheet = getSheet('FinishedGoods');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const fgId = 'FG' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([fgId, batch_id, product_id, qty, 'nos', today, 'Available']);
}

function getFinishedGoods() {
  const sheet = getSheet('FinishedGoods');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    return rowToObj(headers, row);
  });
  return { success: true, data };
}

function seedProductionData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  safeWrite('BatchOrders',
    ['batch_id','date','product_id','planned_qty','actual_qty','machine_id','operator_id','status','start_time','end_time'],
    [
      ['BO001', fmt(addDays(today,-10)), 'PRD001', 5000, 4850, 'EQ001', 'suresh', 'Closed', addDays(today,-10).toISOString(), addDays(today,-9).toISOString()],
      ['BO002', fmt(addDays(today,-5)),  'PRD002', 3000, 2980, 'EQ002', 'suresh', 'Closed', addDays(today,-5).toISOString(),  addDays(today,-4).toISOString()],
      ['BO003', fmt(today),              'PRD003', 2000, '',   'EQ003', 'suresh', 'Planned', today.toISOString(), '']
    ]
  );

  safeWrite('FinishedGoods',
    ['fg_id','batch_id','product_id','qty','unit','produced_date','status'],
    [
      ['FG001', 'BO001', 'PRD001', 4850, 'nos', fmt(addDays(today,-9)), 'Available'],
      ['FG002', 'BO002', 'PRD002', 2980, 'nos', fmt(addDays(today,-4)), 'Available']
    ]
  );

  Logger.log('seedProductionData complete.');
}

// ── KB Constants ─────────────────────────────────────────────────────────────

const INSPECTION_PLANS = [
  { id:'IP001', stage:'IQC', product_id:'ALL', parameter:'MFI (Melt Flow Index)',            unit:'g/10 min', spec_min:0.2,  spec_max:1.2,  aql_level:null,       sample_size:'Per lot — COA document' },
  { id:'IP002', stage:'IQC', product_id:'ALL', parameter:'Density',                          unit:'g/cm³',    spec_min:0.940,spec_max:0.965,aql_level:null,       sample_size:'Per lot — COA document' },
  { id:'IP003', stage:'IQC', product_id:'ALL', parameter:'Colour / Appearance',              unit:'Visual',   spec_min:null, spec_max:null,  aql_level:null,       sample_size:'Per lot — COA document' },
  { id:'IP004', stage:'IQC', product_id:'ALL', parameter:'Moisture Content',                 unit:'%',        spec_min:null, spec_max:0.05,  aql_level:null,       sample_size:'Per lot — COA document' },
  { id:'IP005', stage:'IQC', product_id:'ALL', parameter:'Contamination / Foreign Material', unit:'Visual',   spec_min:null, spec_max:null,  aql_level:null,       sample_size:'Per lot — COA document' },
  { id:'IP006', stage:'IPC', product_id:'ALL', parameter:'Parison Weight',                   unit:'g',        spec_min:null, spec_max:null,  aql_level:'AQL 1.5',  sample_size:'5 per hour' },
  { id:'IP007', stage:'IPC', product_id:'ALL', parameter:'Wall Thickness',                   unit:'mm',       spec_min:0.8,  spec_max:2.0,  aql_level:'AQL 1.5',  sample_size:'5 per hour' },
  { id:'IP008', stage:'IPC', product_id:'ALL', parameter:'Container Weight',                 unit:'g',        spec_min:null, spec_max:null,  aql_level:'AQL 1.5',  sample_size:'5 per hour' },
  { id:'IP009', stage:'IPC', product_id:'ALL', parameter:'Neck/Thread Dimensions',           unit:'mm',       spec_min:null, spec_max:null,  aql_level:'AQL 1.5',  sample_size:'5 per hour' },
  { id:'IP010', stage:'IPC', product_id:'ALL', parameter:'Visual Defects',                   unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 2.5',  sample_size:'10 per hour' },
  { id:'IP011', stage:'IPC', product_id:'ALL', parameter:'Leak Test',                        unit:'Pass/Fail',spec_min:null, spec_max:null,  aql_level:'AQL 0.65', sample_size:'5 per hour' },
  { id:'IP012', stage:'IPC', product_id:'ALL', parameter:'Flash Trimming Check',             unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 2.5',  sample_size:'5 per hour' },
  { id:'IP013', stage:'IPC', product_id:'ALL', parameter:'Label Application',                unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 2.5',  sample_size:'5 per hour' },
  { id:'IP014', stage:'OQC', product_id:'ALL', parameter:'Final Visual Inspection',          unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 2.5',  sample_size:'Per batch AQL table' },
  { id:'IP015', stage:'OQC', product_id:'ALL', parameter:'Dimensional Check (Critical)',     unit:'mm',       spec_min:null, spec_max:null,  aql_level:'AQL 1.5',  sample_size:'Per batch AQL table' },
  { id:'IP016', stage:'OQC', product_id:'ALL', parameter:'Weight Check',                     unit:'g',        spec_min:null, spec_max:null,  aql_level:'AQL 1.5',  sample_size:'Per batch AQL table' },
  { id:'IP017', stage:'OQC', product_id:'ALL', parameter:'Leak / Pressure Test',             unit:'Pass/Fail',spec_min:null, spec_max:null,  aql_level:'AQL 0.65', sample_size:'Per batch AQL table' },
  { id:'IP018', stage:'OQC', product_id:'ALL', parameter:'Label / Print Quality',            unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 2.5',  sample_size:'Per batch AQL table' },
  { id:'IP019', stage:'OQC', product_id:'ALL', parameter:'Packaging Integrity',              unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 2.5',  sample_size:'Per batch AQL table' },
  { id:'IP020', stage:'OQC', product_id:'ALL', parameter:'Batch / Label Traceability',       unit:'Visual',   spec_min:null, spec_max:null,  aql_level:'AQL 4.0',  sample_size:'Per batch AQL table' },
  { id:'IP021', stage:'IPC', product_id:'ALL', parameter:'Mould Temperature',                unit:'°C',       spec_min:160,  spec_max:220,  aql_level:null,       sample_size:'Per shift' },
  { id:'IP022', stage:'IPC', product_id:'ALL', parameter:'Cycle Time',                       unit:'sec',      spec_min:null, spec_max:null,  aql_level:null,       sample_size:'Per hour' }
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

function saveNCR(data) {
  var authError = requireRole(data, ['director','qmr','supervisor','quality_inspector']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['batch_id','defect_type','qty_affected','disposition']);
  if (fieldError) return { success: false, error: fieldError };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var ncrSheet = ss.getSheetByName('NCR_Log');
  if (!ncrSheet) {
    ncrSheet = ss.insertSheet('NCR_Log');
    const hdrs = ['ncr_id','date','batch_id','stage','defect_type','severity','qty_affected','disposition','detected_by','remarks','status','capa_required','capa_trigger_reason','created_by','created_at'];
    ncrSheet.getRange(1,1,1,hdrs.length).setValues([hdrs]);
    ncrSheet.setFrozenRows(1);
  }

  const now = new Date();
  const yymm = String(now.getFullYear()).slice(2) + String(now.getMonth()+1).padStart(2,'0');
  const allRows = ncrSheet.getDataRange().getValues();
  const monthPrefix = 'YPP-NCR-' + yymm + '-';
  const monthCount = allRows.slice(1).filter(r => String(r[0]).startsWith(monthPrefix)).length;
  const ncrId = monthPrefix + String(monthCount + 1).padStart(3,'0');

  const today = now.toISOString().slice(0,10);
  const severity = data.severity || '';

  var capaRequired = false;
  var capaTriggerReason = '';
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
  return { success: true, data: data };
}

// ── Quality / IPQC ───────────────────────────────────────────────────────────

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
  const specMin = (data.spec_min !== null && data.spec_min !== '' && data.spec_min !== undefined) ? Number(data.spec_min) : null;
  const specMax = (data.spec_max !== null && data.spec_max !== '' && data.spec_max !== undefined) ? Number(data.spec_max) : null;
  const actual  = Number(data.actual_value);
  const result  = (specMin === null && specMax === null) ? 'OK'
                : (actual >= (specMin ?? -Infinity) && actual <= (specMax ?? Infinity)) ? 'OK' : 'NG';
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
  upsertBatchTraceability({
    batch_no:        data.batch_id,
    product_id:      data.product_id || '',
    production_date: data.check_date || today,
    shift:           data.shift || '',
    machine_id:      data.machine_id || '',
    mould_id:        data.mould_id || '',
    rm_lot_no:       data.rm_lot_no || '',
    stage:           stage,
    result:          result
  });
  return { success: true, check_id: checkId, result };
}

function saveQualityCheckSheet(data) {
  var authError = requireRole(data, ['director','qmr','supervisor','operator']);
  if (authError) return { success: false, error: authError };
  if (!data.batch_id || !data.stage || !Array.isArray(data.rows) || data.rows.length === 0) {
    return { success: false, error: 'missing_fields' };
  }
  const sheet = getSheet('QualityChecks');
  const existingRows = sheet.getDataRange().getValues();
  let rowCount = existingRows.length;
  const today = data.check_date || new Date().toISOString().slice(0, 10);
  const stage = data.stage;
  const savedIds = [];
  let overallResult = 'OK';
  data.rows.forEach(row => {
    const specMin = (row.spec_min !== null && row.spec_min !== '' && row.spec_min !== undefined) ? Number(row.spec_min) : null;
    const specMax = (row.spec_max !== null && row.spec_max !== '' && row.spec_max !== undefined) ? Number(row.spec_max) : null;
    const actual  = row.actual_value !== '' && row.actual_value !== null ? Number(row.actual_value) : null;
    let result = row.result || 'OK';
    if (actual !== null) {
      result = (specMin === null && specMax === null) ? 'OK'
             : (actual >= (specMin ?? -Infinity) && actual <= (specMax ?? Infinity)) ? 'OK' : 'NG';
    }
    if (result === 'NG') overallResult = 'NG';
    rowCount++;
    const checkId = 'QC' + String(rowCount).padStart(3, '0');
    sheet.appendRow([checkId, data.batch_id, today, data.inspector_id || '', row.parameter, specMin, specMax, actual, result, row.remarks || '', stage]);
    savedIds.push(checkId);
  });
  upsertBatchTraceability({ batch_no: data.batch_id, product_id: data.product_id || '', production_date: today, stage, result: overallResult });
  return { success: true, check_ids: savedIds, overall_result: overallResult };
}

function upsertBatchTraceability(data) {
  const BT_HEADERS = ['batch_no','product_id','production_date','shift','machine_id','mould_id','rm_lot_no','oqc_status','dispatch_id','created_at'];
  const sheet = ensureSheet('BatchTraceability', BT_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const batchNoIdx = headers.indexOf('batch_no');
  const oqcIdx     = headers.indexOf('oqc_status');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][batchNoIdx]) === String(data.batch_no)) {
      if (data.stage === 'OQC' && data.result) {
        sheet.getRange(i + 1, oqcIdx + 1).setValue(data.result);
      }
      return;
    }
  }

  sheet.appendRow([
    data.batch_no,
    data.product_id || '',
    data.production_date || new Date().toISOString().slice(0, 10),
    data.shift || '',
    data.machine_id || '',
    data.mould_id || '',
    data.rm_lot_no || '',
    data.stage === 'OQC' ? (data.result || '') : '',
    '',
    new Date().toISOString()
  ]);
}

function getBatchRecord(params) {
  const batchNo = params.batch_no;
  if (!batchNo) return { success: false, error: 'batch_no required' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const btSheet = ss.getSheetByName('BatchTraceability');
  if (!btSheet) return { success: false, error: 'not_found' };
  const btRows = btSheet.getDataRange().getValues();
  const btHeaders = btRows[0];
  let batch = null;
  for (let i = 1; i < btRows.length; i++) {
    const obj = rowToObj(btHeaders, btRows[i]);
    if (String(obj.batch_no) === String(batchNo)) { batch = obj; break; }
  }
  if (!batch) return { success: false, error: 'not_found' };

  const qcSheet = ss.getSheetByName('QualityChecks');
  let qcData = [];
  if (qcSheet) {
    const qcRows = qcSheet.getDataRange().getValues();
    const qcHeaders = qcRows[0];
    qcData = qcRows.slice(1)
      .map(r => rowToObj(qcHeaders, r))
      .filter(r => String(r.batch_id) === String(batchNo));
  }

  const dispSheet = ss.getSheetByName('Dispatch');
  let dispData = null;
  if (dispSheet && batch.dispatch_id) {
    const dispRows = dispSheet.getDataRange().getValues();
    const dispHeaders = dispRows[0];
    for (let i = 1; i < dispRows.length; i++) {
      const obj = rowToObj(dispHeaders, dispRows[i]);
      if (String(obj.dispatch_id) === String(batch.dispatch_id)) { dispData = obj; break; }
    }
  }

  return { success: true, data: { batch, quality_checks: qcData, dispatch: dispData } };
}

function getOQCBatchList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('BatchTraceability');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1)
    .map(r => rowToObj(headers, r))
    .filter(r => r.oqc_status === 'OK' && !r.dispatch_id);
  return { success: true, data };
}

function getRMStock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const rmSheet = ss.getSheetByName('RMStock');
  const received = {};
  if (rmSheet) {
    const rows = rmSheet.getDataRange().getValues();
    const headers = rows[0];
    rows.slice(1).forEach(r => {
      const obj = rowToObj(headers, r);
      const mat = obj.material || '';
      received[mat] = (received[mat] || 0) + (Number(obj.qty_kg) || 0);
    });
  }

  const btSheet = ss.getSheetByName('BatchTraceability');
  const consumed = {};
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHeaders = btRows[0];
    btRows.slice(1).forEach(r => {
      const obj = rowToObj(btHeaders, r);
      const bom = BOM_KB.find(b => b.product_id === obj.product_id);
      if (!bom) return;
      bom.rm_items.forEach(item => {
        consumed[item.material] = (consumed[item.material] || 0) + item.qty_per_unit_kg;
      });
    });
  }

  const allMaterials = new Set([...Object.keys(received), ...Object.keys(consumed)]);
  const data = Array.from(allMaterials).map(mat => ({
    material:    mat,
    received_kg: received[mat] || 0,
    consumed_kg: consumed[mat] || 0,
    stock_kg:    (received[mat] || 0) - (consumed[mat] || 0),
    low_stock:   ((received[mat] || 0) - (consumed[mat] || 0)) < 100
  }));

  return { success: true, data };
}

function getSuppliers() {
  const sheet = getSheet('Suppliers');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: SUPPLIERS_KB }; // fallback to KB if sheet empty
  const headers = rows[0];
  const data = rows.slice(1)
    .filter(r => r[0] && String(r[headers.indexOf('Active')] ?? 'TRUE').toUpperCase() !== 'FALSE')
    .map(r => {
      const obj = rowToObj(headers, r);
      return { id: obj.SupplierID, name: obj.Name, category: obj.Category || '' };
    });
  return { success: true, data: data.length ? data : SUPPLIERS_KB };
}

function getMachineList() {
  const res = getMasterDropdown('Equipment');
  if (!res.success) return res;
  const sheet = getSheet('Equipment');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const typeIdx = headers.indexOf('Type');
  const statusIdx = headers.indexOf('Status');
  const data = rows.slice(1)
    .filter(r => r[0] && (typeIdx < 0 || r[typeIdx] === 'Machine') && (statusIdx < 0 || r[statusIdx] !== 'Inactive'))
    .map(r => ({ id: r[0], name: r[headers.indexOf('Name') >= 0 ? headers.indexOf('Name') : 1] }));
  return { success: true, data };
}

function getOperatorList() {
  const sheet = getSheet('Personnel');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const roleIdx = headers.indexOf('Role');
  const activeIdx = headers.indexOf('Active');
  const data = rows.slice(1)
    .filter(r => {
      if (!r[0]) return false;
      if (activeIdx >= 0 && String(r[activeIdx]).toUpperCase() === 'FALSE') return false;
      if (roleIdx >= 0) {
        const role = String(r[roleIdx]).toLowerCase();
        return ['operator','supervisor','director','qmr','store'].includes(role);
      }
      return true;
    })
    .map(r => ({ id: r[0], name: r[headers.indexOf('Name') >= 0 ? headers.indexOf('Name') : 1], role: roleIdx >= 0 ? r[roleIdx] : '' }));
  return { success: true, data };
}

function getQualitySummary() {
  const sheet = getSheet('QualityChecks');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const map = {};
  rows.slice(1).forEach(row => {
    const obj = rowToObj(headers, row);
    const bid = obj.batch_id;
    if (!map[bid]) map[bid] = { batch_id: bid, total: 0, ok: 0, ng: 0 };
    map[bid].total++;
    if (obj.result === 'OK') map[bid].ok++;
    else map[bid].ng++;
  });
  const data = Object.values(map).map(r => {
    r.pass_rate = r.total > 0 ? Math.round((r.ok / r.total) * 100) : 0;
    return r;
  });
  return { success: true, data };
}

function seedQualityData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'QualityChecks';
  const headers = ['check_id','batch_id','check_date','inspector_id','parameter','spec_min','spec_max','actual_value','result','remarks','stage'];

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  const existing = sheet.getDataRange().getValues();
  if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }

  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const rows = [
    ['QC001','BO001',fmt(addDays(today,-9)),'pradhan','Wall Thickness',1.0,1.4,1.2,'OK','Within spec'],
    ['QC002','BO001',fmt(addDays(today,-9)),'pradhan','Weight',18,20,17.5,'NG','Below spec min'],
    ['QC003','BO001',fmt(addDays(today,-9)),'pradhan','Leak Test',0,0,0,'OK','No leak'],
    ['QC004','BO002',fmt(addDays(today,-4)),'pradhan','Wall Thickness',1.2,1.6,1.35,'OK',''],
    ['QC005','BO002',fmt(addDays(today,-4)),'pradhan','MFI',0.3,0.5,0.42,'OK','']
  ];
  rows.forEach(row => sheet.appendRow(row));
  Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
}

// ── Calibration ──────────────────────────────────────────────────────────────

function getCalibrationList(params) {
  var authErr = requireRole(params, ['director','qmr','supervisor']);
  if (authErr) return { success: false, error: authErr };
  var sheet = ensureSheet('Calibration_Log', ['inst_id','inst_name','calibration_date','due_date','result','certificate_no','done_by','remarks']);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };
  var hdrs = rows[0];
  return {
    success: true,
    data: rows.slice(1).map(function(r) {
      var obj = {};
      hdrs.forEach(function(h, i) { obj[h] = r[i]; });
      return obj;
    })
  };
}

function saveCalibrationLog(data) {
  var authErr = requireRole(data, ['director','qmr']);
  if (authErr) return { success: false, error: authErr };
  var fieldErr = validateFields(data, ['inst_id','inst_name','calibration_date','result','done_by']);
  if (fieldErr) return { success: false, error: fieldErr };

  var inst = INSTRUMENTS_KB.find(function(i) { return i.id === data.inst_id; });
  var calDate = new Date(data.calibration_date);
  var dueDate = new Date(calDate);
  dueDate.setMonth(dueDate.getMonth() + (inst ? inst.frequency_months : 12));
  var dueDateStr = Utilities.formatDate(dueDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var sheet = ensureSheet('Calibration_Log', ['inst_id','inst_name','calibration_date','due_date','result','certificate_no','done_by','remarks']);
  sheet.appendRow([
    data.inst_id,
    data.inst_name,
    data.calibration_date,
    dueDateStr,
    data.result,
    data.certificate_no || '',
    data.done_by,
    data.remarks || ''
  ]);
  _cacheInvalidate('dashboard_stats');
  return { success: true };
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function getDashboardStats() {
  const cached = _cacheGet('dashboard_stats');
  if (cached) return { success: true, data: cached };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function sheetRows(name) {
    const s = ss.getSheetByName(name);
    return s ? s.getDataRange().getValues() : [[]];
  }

  const grnRows   = sheetRows('GRN');
  const openGRNs  = grnRows.slice(1).filter(r => r[9] && r[9] !== 'Closed').length;

  const batchRows    = sheetRows('BatchOrders');
  const activeBatches = batchRows.slice(1).filter(r => r[7] === 'Planned' || r[7] === 'InProgress').length;

  const bdRows        = sheetRows('Breakdown_Log');
  const bdHeaders     = bdRows[0] || [];
  const bdStatusIdx   = bdHeaders.indexOf('Status') >= 0 ? bdHeaders.indexOf('Status') : 11;
  const openBreakdowns = bdRows.slice(1).filter(r => r[bdStatusIdx] === 'Open').length;

  const capaRows    = sheetRows('CAPA_Register');
  const capaHeaders = capaRows[0] || [];
  const capaStatusIdx = capaHeaders.indexOf('Status') >= 0 ? capaHeaders.indexOf('Status') : (capaHeaders.indexOf('status') >= 0 ? capaHeaders.indexOf('status') : 7);
  const openCapas   = capaRows.slice(1).filter(r => (r[capaStatusIdx] === 'Open')).length;

  const lrRows    = sheetRows('Legal_Register');
  const lrHeaders = lrRows[0] || [];
  const lrStatusIdx = lrHeaders.indexOf('ComplianceStatus') >= 0 ? lrHeaders.indexOf('ComplianceStatus') : (lrHeaders.indexOf('status') >= 0 ? lrHeaders.indexOf('status') : 4);
  const lrDueIdx  = lrHeaders.indexOf('NextReview') >= 0 ? lrHeaders.indexOf('NextReview') : (lrHeaders.indexOf('due_date') >= 0 ? lrHeaders.indexOf('due_date') : 3);
  const overdueCompliance = lrRows.slice(1).filter(r => {
    const status = r[lrStatusIdx];
    const due = r[lrDueIdx] ? new Date(r[lrDueIdx]) : null;
    return status !== 'Compliant' && due && due < today;
  }).length;

  // Low-stock materials
  const stockRows  = sheetRows('Stock');
  const stockHdrs  = stockRows[0] || [];
  const qtyIdx     = stockHdrs.indexOf('current_qty') >= 0 ? stockHdrs.indexOf('current_qty') : 3;
  const rlIdx      = stockHdrs.indexOf('reorder_level') >= 0 ? stockHdrs.indexOf('reorder_level') : 4;
  const lowStockCount = stockRows.slice(1).filter(r => Number(r[qtyIdx]) <= Number(r[rlIdx]) && r[0]).length;

  // Overdue PMs
  const pmRows    = sheetRows('PM_Schedule');
  const pmHdrs    = pmRows[0] || [];
  const pmDueIdx  = pmHdrs.indexOf('NextDue') >= 0 ? pmHdrs.indexOf('NextDue') : 5;
  const overduePMs = pmRows.slice(1).filter(r => {
    const d = r[pmDueIdx] ? new Date(r[pmDueIdx]) : null;
    return d && d < today;
  }).length;

  const ccRows = sheetRows('Customer_Complaints');
  const ccHdrs = ccRows[0] || [];
  const ccStatusIdx = ccHdrs.indexOf('Status') >= 0 ? ccHdrs.indexOf('Status') : 9;
  const openComplaints = ccRows.slice(1).filter(r => r[ccStatusIdx] === 'Open').length;

  const calRows = sheetRows('Calibration_Log');
  const calHdrs = calRows[0] || [];
  const calDueIdx = calHdrs.indexOf('due_date') >= 0 ? calHdrs.indexOf('due_date') : 3;
  const overdueCalibrations = calRows.slice(1).filter(r => {
    const d = r[calDueIdx] ? new Date(r[calDueIdx]) : null;
    return d && d < today;
  }).length;

  const data = { openGRNs, activeBatches, openBreakdowns, openCapas, overdueCompliance, overdueCalibrations, lowStockCount, overduePMs, openComplaints };
  _cachePut('dashboard_stats', data, 30);
  return { success: true, data };
}

// ── Utilities ────────────────────────────────────────────────────────────────

function hashPin(pin) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    pin,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function ensureSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

// ── One-Time Setup ───────────────────────────────────────────────────────────

// Run once from Apps Script editor to hash and store initial PINs.
function setupPins(pins) {
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  pins.forEach(({ username, pin }) => {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === username) {
        sheet.getRange(i + 1, 4).setValue(hashPin(pin)); // PINHash col D
        break;
      }
    }
  });
  Logger.log('PINs set up successfully.');
}

// Run once from Apps Script editor to build all 30 sheet tabs with header rows.
function createWorkbookSkeleton() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const SHEETS = {
    // Foundation
    'Users':            ['UserID','Name','Username','PINHash','Role','Language','Active','FailCount','LockUntil'],
    'Config':           ['Key','Value','UpdatedAt'],
    // Master Data
    'Products':         ['ProductID','SKU','Name','Capacity_ml','Material','HSN','Weight_g','WallThickness_mm','NeckSize_mm','Status'],
    'Customers':        ['CustomerID','Code','Name','GSTIN','Address','Contact','Phone','Email','ApprovedSince','SpecialNotes','Active'],
    'Suppliers':        ['SupplierID','Code','Name','Category','GSTIN','Address','Contact','Phone','Email','PaymentTerms','LeadDays','Approved','Active'],
    'Equipment':        ['EquipID','Name','Type','Location','SerialNo','Commissioned','CalibFreq','LastCalib','NextCalib','Status'],
    'Tooling':          ['ToolID','Name','Type','ProductID','MachineID','Cavities','ShotCount','Manufacturer','Status'],
    'Spares':           ['SpareID','Name','SupplierID','Unit','CurrentStock','ReorderLevel','LeadDays','Location'],
    'Personnel':        ['PersonID','Name','Username','Role','Department','ReportsTo','Phone','Email','DateJoined','Qualification','Active'],
    'BOM':              ['BOMID','ProductID','MaterialID','MaterialType','Qty_kg','Unit','RemarkS'],
    // Inventory
    'RM_Stock':         ['StockID','MaterialID','SupplierID','LotNo','ReceivedDate','Qty_kg','UsedQty_kg','BalanceQty_kg','IQCRef','Location','Status'],
    'FG_Stock':         ['StockID','ProductID','BatchNo','MfgDate','QtyPcs','ReservedQty','AvailableQty','OQCRef','Location','Status'],
    'GRN_Log':          ['GRNID','GRNDate','SupplierID','MaterialID','LotNo','InvoiceNo','QtyReceived_kg','IQCStatus','Remarks'],
    'Material_Issues':  ['IssueID','IssueDate','WorkOrderID','MaterialID','LotNo','QtyIssued_kg','IssuedBy','Remarks'],
    // Production
    'Work_Orders':      ['WOID','WODate','ProductID','MachineID','MouldID','TargetQty','Shift','OperatorID','SupervisorID','Status','StartTime','EndTime'],
    'Production_Log':   ['LogID','WOID','BatchNo','LogTime','Zone1Temp','Zone2Temp','BlowPressure_bar','CycleTime_sec','ParissonWeight_g','Operator','Remarks'],
    'Batch_Register':   ['BatchNo','ProductID','WOID','MachineID','MouldID','OperatorID','SupervisorID','ProdDate','Shift','QtyProduced','QtyRejected','QtyPassed','RMBatchNos','Status','IQCRef','IPCRef','OQCRef','DispatchRef'],
    // Quality
    'IQC_Records':      ['IQCID','GRNID','MaterialID','LotNo','InspDate','InspectorID','MFI_Result','Density_Result','Visual_Result','COA_OK','LotLabel_OK','Decision','Remarks'],
    'IPC_Records':      ['IPCID','WOID','BatchNo','InspTime','InspectorID','Weight_g','WallThk_Shoulder','WallThk_Body','WallThk_Base','LeakTest','Height_mm','OD_mm','NeckOD_mm','CapFit','Decision','Remarks'],
    'OQC_Records':      ['OQCID','BatchNo','InspDate','InspectorID','WeightAQL','DimAQL','LeakAQL','VisualResult','LabelAQL','TorqueAQL','CartonQtyAQL','Decision','SampleSize','Remarks'],
    'Defect_Log':       ['DefectID','BatchNo','WOID','DefectCode','DefectName','Severity','QtyAffected','DetectedAt','OperatorID','InspectorID','RootCause','Action','Remarks'],
    'NCR_Register':     ['NCRID','NCRDate','Source','BatchNo','DefectDescription','Severity','RaisedBy','AssignedTo','Status','ClosedDate','CAPARef'],
    // Dispatch
    'Orders':           ['OrderID','OrderDate','CustomerID','ProductID','QtyOrdered','RequiredDate','PONumber','Status','Remarks'],
    'Dispatch_Log':     ['DispatchID','DispatchDate','OrderID','BatchNo','CustomerID','ProductID','QtyDispatched','ChallanNo','VehicleNo','Remarks'],
    'Challans':         ['ChallanNo','ChallanDate','CustomerID','OrderID','ProductID','QtyDispatched','BatchNos','GrossWt_kg','NetWt_kg','Status'],
    // Maintenance
    'PM_Schedule':      ['PMID','EquipID','TaskType','Frequency','LastDone','NextDue','AssignedTo','Status','Remarks'],
    'Breakdown_Log':    ['BreakdownID','EquipID','ReportedAt','ReportedBy','Symptom','BreakdownCode','RootCause','ActionTaken','FixedAt','Downtime_min','SpareUsed','Status'],
    'Spare_Consumption':['ConsumID','BreakdownID','PMID','SpareID','QtyUsed','Date','TechnicianID','Remarks'],
    // Compliance
    'CAPA_Register':    ['CAPAID','CAPADate','Source','NCRRef','ProblemDesc','RootCause','CorrectiveAction','PreventiveAction','ResponsibleID','TargetDate','Status','ClosedDate','Effectiveness'],
    'Calibration_Log':  ['CalibID','EquipID','CalibDate','Agency','CertNo','Result','NextDue','CertFile','Remarks'],
    'Training_Log':     ['TrainingID','Date','Topic','TrainerID','Participants','Method','EvalScore','Status','Remarks'],
    'Legal_Register':   ['LegalID','Act','Requirement','Applicability','ComplianceStatus','LastReview','NextReview','Remarks'],
    'KPI_Log':          ['LogID','LogDate','KPICode','KPIName','Value','Unit','Target','Period','RecordedBy'],
    'Customer_Complaints': ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','Status','RootCause','CorrectiveAction','ClosedDate','ClosedBy','Remarks'],
    '_Meta':            ['Key','Value'],
    'QualityParams':    ['ParamID','ProductID','Stage','Parameter','Unit','SpecMin','SpecMax','Active']
  };

  Object.entries(SHEETS).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    if (name === '_Meta') sheet.hideSheet();
  });

  const meta = ss.getSheetByName('_Meta');
  meta.getRange(2, 1, 2, 2).setValues([
    ['version', '1.0.0'],
    ['created', new Date().toISOString()]
  ]);

  Logger.log('Workbook skeleton created: ' + Object.keys(SHEETS).length + ' sheets.');
}

// ── Seed Data ────────────────────────────────────────────────────────────────




function seedInventoryData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  safeWrite('GRN',
    ['grn_id','date','supplier_id','material_id','qty_received','unit','rate','invoice_no','received_by','status'],
    [
      ['GRN001','2025-01-10','SUP001','MAT001',500,'kg',95,'INV-RIL-001','mahesh','Received'],
      ['GRN002','2025-01-18','SUP001','MAT002',50,'kg',1200,'INV-RIL-002','mahesh','Received'],
      ['GRN003','2025-02-05','SUP002','MAT001',300,'kg',93,'INV-GAIL-001','mahesh','Received']
    ]
  );

  safeWrite('Stock',
    ['material_id','material_name','unit','current_qty','reorder_level','last_updated'],
    [
      ['MAT001','HDPE Natural','kg',800,200,'2025-02-05'],
      ['MAT002','Colorant Black','kg',50,20,'2025-01-18'],
      ['MAT003','Colorant Blue','kg',0,20,'2025-01-01'],
      ['MAT004','Labels (100ml)','nos',5000,2000,'2025-01-15']
    ]
  );

  Logger.log('seedInventoryData complete.');
}

// ── Compliance ───────────────────────────────────────────────────────────────

function getLegalRegister() {
  const sheet = getSheet('Legal_Register');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data = rows.slice(1).map(row => {
    const obj = rowToObj(headers, row);
    const due = obj.NextReview ? new Date(obj.NextReview) : (obj.due_date ? new Date(obj.due_date) : null);
    obj.overdue = due && due < today && obj.ComplianceStatus !== 'Compliant' && obj.status !== 'Compliant';
    obj.due_date = obj.NextReview || obj.due_date; // normalise for frontend
    obj.status = obj.ComplianceStatus || obj.status;
    return obj;
  });
  return { success: true, data };
}

function getCapaList(params) {
  const sheet = getSheet('CAPA_Register');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    return rowToObj(headers, row);
  });
  if (params && params.status && params.status !== 'all') {
    data = data.filter(r => (r.Status || r.status) === params.status);
  }
  return { success: true, data };
}

function saveCapa(data) {
  var authError = requireRole(data, ['director','qmr']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['source','description','target_date']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('CAPA_Register');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const capa_id = 'CAPA' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);
  // Support both old 8-col schema and new 13-col skeleton schema
  const is13col = headers.length >= 13;
  if (is13col) {
    sheet.appendRow([
      capa_id,
      today,
      data.source || '',
      data.ncr_ref || '',
      data.description || '',
      data.root_cause || '',
      data.corrective_action || data.action || '',
      data.preventive_action || '',
      data.responsible_id || '',
      data.target_date || '',
      'Open',
      '',
      ''
    ]);
  } else {
    sheet.appendRow([
      capa_id,
      today,
      data.source || '',
      data.description || '',
      data.root_cause || '',
      data.corrective_action || data.action || '',
      data.target_date || '',
      'Open'
    ]);
  }
  return { success: true, capa_id };
}

function updateCapaStatus(data) {
  var authError = requireRole(data, ['director','qmr']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['capa_id','status']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('CAPA_Register');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx         = headers.indexOf('CAPAID') >= 0 ? headers.indexOf('CAPAID') : headers.indexOf('capa_id');
  const statusIdx     = headers.indexOf('Status') >= 0 ? headers.indexOf('Status') : headers.indexOf('status');
  const closedDateIdx = headers.indexOf('ClosedDate');
  const effectIdx     = headers.indexOf('Effectiveness');
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx >= 0 ? idIdx : 0]) === String(data.capa_id)) {
      if (statusIdx >= 0) sheet.getRange(i+1, statusIdx+1).setValue(data.status);
      else sheet.getRange(i+1, 8).setValue(data.status);
      if (data.status === 'Closed') {
        if (closedDateIdx >= 0) sheet.getRange(i+1, closedDateIdx+1).setValue(today);
        if (effectIdx >= 0)     sheet.getRange(i+1, effectIdx+1).setValue(data.effectiveness || '');
      }
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

function seedComplianceData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  safeWrite('Legal_Register',
    ['reg_id','regulation','applicability','due_date','status','last_reviewed'],
    [
      ['LR001','ISO 9001:2015','Certification','2026-03-31','Compliant','2025-03-31'],
      ['LR002','Factories Act 1948','Compliance','2026-01-31','Due Soon','2025-01-31'],
      ['LR003','PCB Consent to Operate','Environmental','2026-06-30','Compliant','2025-06-30'],
      ['LR004','BIS License (IS 7518)','Product','2026-04-30','Due Soon','2025-04-30'],
      ['LR005','Fire NOC','Safety','2026-02-28','Compliant','2025-02-28']
    ]
  );

  safeWrite('CAPA_Register',
    ['capa_id','date','source','description','root_cause','action','target_date','status'],
    [
      ['CAPA0001','2025-01-10','Customer Complaint','Leakage reported in 1L bottles from batch B2501','Insufficient blow pressure causing thin base wall','Increased blow pressure to 7.5 bar; re-inspected batch','2025-02-10','Closed'],
      ['CAPA0002','2025-02-15','Internal Audit','IQC records not filled within 24h of GRN','No defined SLA in procedure','Updated IQC procedure with 24h SLA; trained inspectors','2025-03-15','Closed'],
      ['CAPA0003','2025-04-20','Quality NG','OQC rejection rate >3% on 200ml bottles','Mould wear causing flash','Mould TL002 sent for repair; interim 100% visual inspection','2025-05-20','Open']
    ]
  );

  Logger.log('seedComplianceData complete.');
}

// ── Dispatch / Sales Orders ───────────────────────────────────────────────────

function getSOList(params) {
  const sheet = getSheet('SalesOrders');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    return rowToObj(headers, row);
  });
  if (params.status && params.status !== 'all') {
    data = data.filter(r => (r.Status || r.status) === params.status);
  }
  return { success: true, data };
}

function saveSO(data) {
  var authError = requireRole(data, ['director','store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['customer_id','product_id','qty_ordered','date']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = getSheet('SalesOrders');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const so_id = 'SO' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    so_id,
    data.date || today,
    data.customer_id,
    data.product_id,
    data.qty_ordered,
    0,
    'Pending',
    data.invoice_no || ''
  ]);
  return { success: true, so_id };
}

function saveDispatch(data) {
  var authError = requireRole(data, ['director','supervisor','store_dispatch','store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['so_id','qty','batch_no']);
  if (fieldError) return { success: false, error: fieldError };

  const qty = Number(data.qty);
  if (!Number.isFinite(qty) || qty <= 0) return { success: false, error: 'invalid_qty' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Enforce OQC clearance via BatchTraceability
  const btSheet = ss.getSheetByName('BatchTraceability');
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHeaders = btRows[0];
    const batchRow = btRows.slice(1).map(r => rowToObj(btHeaders, r))
      .find(r => String(r.batch_no) === String(data.batch_no));
    if (!batchRow) return { success: false, error: 'batch_not_found' };
    if (batchRow.oqc_status !== 'OK') return { success: false, error: 'batch_not_oqc_cleared' };
    if (batchRow.dispatch_id) return { success: false, error: 'batch_already_dispatched' };
  }

  // Check available FG stock before writing anything
  const fgSheet = ss.getSheetByName('FinishedGoods');
  if (fgSheet) {
    const fgRows = fgSheet.getDataRange().getValues();
    const totalAvailable = fgRows.slice(1)
      .filter(r => String(r[2]) === String(data.product_id) && r[6] === 'Available')
      .reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
    if (totalAvailable < qty) return { success: false, error: 'insufficient_stock' };
  }

  const label_url = 'https://plasticypp.github.io/one/batch.html?batch=' + encodeURIComponent(data.batch_no);
  const DISP_HEADERS = ['dispatch_id','so_id','dispatch_date','qty','vehicle_no','driver_name','dispatched_by','batch_no','polybag_qty','label_url'];
  const dispSheet = ensureSheet('Dispatch', DISP_HEADERS);
  const dispRows = dispSheet.getDataRange().getValues();
  const rowCount = dispRows.length;
  const dispatch_id = 'DIS' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  dispSheet.appendRow([
    dispatch_id,
    data.so_id,
    data.dispatch_date || today,
    qty,
    data.vehicle_no || '',
    data.driver_name || '',
    data.dispatched_by || '',
    data.batch_no,
    Number(data.polybag_qty) || 0,
    label_url
  ]);

  // Write dispatch_id back to BatchTraceability
  if (btSheet) {
    const btRows2 = btSheet.getDataRange().getValues();
    const btHeaders2 = btRows2[0];
    const dispIdIdx = btHeaders2.indexOf('dispatch_id');
    const batchNoIdx = btHeaders2.indexOf('batch_no');
    for (let i = 1; i < btRows2.length; i++) {
      if (String(btRows2[i][batchNoIdx]) === String(data.batch_no)) {
        btSheet.getRange(i + 1, dispIdIdx + 1).setValue(dispatch_id);
        break;
      }
    }
  }

  const soSheet = ss.getSheetByName('SalesOrders');
  if (soSheet) {
    const soRows = soSheet.getDataRange().getValues();
    for (let i = 1; i < soRows.length; i++) {
      if (String(soRows[i][0]) === String(data.so_id)) {
        const qtyOrdered    = Number(soRows[i][4]) || 0;
        const qtyDispatched = (Number(soRows[i][5]) || 0) + qty;
        soSheet.getRange(i + 1, 6).setValue(qtyDispatched);
        soSheet.getRange(i + 1, 7).setValue(qtyDispatched >= qtyOrdered ? 'Dispatched' : 'Partial');
        break;
      }
    }
  }

  const fgSheet2 = ss.getSheetByName('FinishedGoods');
  if (fgSheet2) {
    const fgRows2 = fgSheet2.getDataRange().getValues();
    let remaining = qty;
    for (let i = 1; i < fgRows2.length && remaining > 0; i++) {
      if (String(fgRows2[i][2]) === String(data.product_id) && fgRows2[i][6] === 'Available') {
        const available = Number(fgRows2[i][3]) || 0;
        if (available <= remaining) {
          fgSheet2.getRange(i + 1, 4).setValue(0);
          fgSheet2.getRange(i + 1, 7).setValue('Depleted');
          remaining -= available;
        } else {
          fgSheet2.getRange(i + 1, 4).setValue(available - remaining);
          remaining = 0;
        }
      }
    }
  }

  return { success: true, dispatch_id, label_url };
}

function getDispatchList(params) {
  const sheet = getSheet('Dispatch');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    return rowToObj(headers, row);
  });
  if (params.so_id) {
    data = data.filter(r => String(r.so_id) === String(params.so_id));
  }
  return { success: true, data };
}

function seedDispatchData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  safeWrite('SalesOrders',
    ['so_id','date','customer_id','product_id','qty_ordered','qty_dispatched','status','invoice_no'],
    [
      ['SO001', fmt(addDays(today,-10)), 'CUS001', 'PRD001', 1000, 1000, 'Dispatched', 'INV-SO-001'],
      ['SO002', fmt(addDays(today,-3)),  'CUS002', 'PRD002', 500,  0,    'Pending',    'INV-SO-002']
    ]
  );

  safeWrite('Dispatch',
    ['dispatch_id','so_id','dispatch_date','qty','vehicle_no','driver_name','dispatched_by'],
    [
      ['DIS001', 'SO001', fmt(addDays(today,-8)), 1000, 'MH04-AB-1234', 'Ramesh Driver', 'mahesh']
    ]
  );

  Logger.log('seedDispatchData complete.');
}

// ── Wave 5+6 Seed Data ────────────────────────────────────────────────────────

function seedPeopleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function safeWrite(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { Logger.log(sheetName + ': already has data, skipping.'); return; }
    rows.forEach(row => sheet.appendRow(row));
    Logger.log(sheetName + ': seeded ' + rows.length + ' rows.');
  }

  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  safeWrite('Training_Log',
    ['TrainingID','Date','Topic','TrainerID','Participants','Method','EvalScore','Status','Remarks'],
    [
      ['TR0001', fmt(addDays(today,-60)), 'ISO 9001:2015 Awareness',            'PL Pradhan',    'All staff (8)', 'Classroom', 82, 'Completed', 'Annual refresher'],
      ['TR0002', fmt(addDays(today,-30)), 'Machine Operation & Safety',          'Tarun Mishra',  'Operators (4)', 'On-the-Job', 90, 'Completed', 'New operator batch'],
      ['TR0003', fmt(addDays(today,-7)),  'Fire Safety & Emergency Evacuation',  'External-HSE',  'All staff (8)', 'Classroom', 78, 'Completed', 'Annual drill']
    ]
  );

  safeWrite('KPI_Log',
    ['LogID','LogDate','KPICode','KPIName','Value','Unit','Target','Period','RecordedBy'],
    [
      ['KL0001', fmt(addDays(today,-60)), 'KPI001', 'Rejection Rate',          2.1, '%',     '< 3%',    '2025-03', 'qmr'],
      ['KL0002', fmt(addDays(today,-60)), 'KPI003', 'On-Time Delivery Rate',   96,  '%',     '≥ 95%',   '2025-03', 'director'],
      ['KL0003', fmt(addDays(today,-30)), 'KPI001', 'Rejection Rate',          1.8, '%',     '< 3%',    '2025-04', 'qmr'],
      ['KL0004', fmt(addDays(today,-30)), 'KPI002', 'Customer Complaint Rate', 1,   'count', '0/month', '2025-04', 'qmr'],
      ['KL0005', fmt(addDays(today,-30)), 'KPI003', 'On-Time Delivery Rate',   98,  '%',     '≥ 95%',   '2025-04', 'director'],
      ['KL0006', fmt(addDays(today,-5)),  'KPI001', 'Rejection Rate',          2.4, '%',     '< 3%',    '2025-05', 'qmr'],
      ['KL0007', fmt(addDays(today,-5)),  'KPI006', 'PM Compliance Rate',      88,  '%',     '≥ 90%',   '2025-05', 'supervisor']
    ]
  );

  safeWrite('Customer_Complaints',
    ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','Status','RootCause','CorrectiveAction','ClosedDate','ClosedBy','Remarks'],
    [
      ['YPP-CC-2503-001', fmt(addDays(today,-45)), 'CUS001', 'Rajesh Kumar',  'YPP-B2503-001', 'PRD002', 'Leakage',     '1L bottles leaking at base seam from batch B2503-001', 'High',   'Closed', 'Insufficient blow pressure causing thin base wall', 'Increased blow pressure to 7.5 bar; 100% inspection of remaining stock', fmt(addDays(today,-40)), 'qmr', 'CAPA raised'],
      ['YPP-CC-2504-001', fmt(addDays(today,-10)), 'CUS002', 'Priya Sharma',  '',              'PRD001', 'Short Supply', '5L cans delivered short by 20 units against PO', 'Medium', 'Open',   '', '', '', '', 'Under investigation']
    ]
  );

  Logger.log('seedPeopleData complete.');
}

// ── Wave 5: People & Training ─────────────────────────────────────────────────

function getPersonnelList() {
  const sheet = getSheet('Personnel');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const data = rows.slice(1)
    .map(row => rowToObj(headers, row))
    .filter(r => r.Active !== false && String(r.Active).toLowerCase() !== 'false');
  return { success: true, data };
}

function getTrainingLog(params) {
  const sheet = getSheet('Training_Log');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => rowToObj(headers, row));
  if (params && params.status && params.status !== 'all') {
    data = data.filter(r => (r.Status || '') === params.status);
  }
  return { success: true, data };
}

function saveTrainingLog(data) {
  var authError = requireRole(data, ['director','qmr','supervisor']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['topic','date','trainer_id']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('Training_Log', ['TrainingID','Date','Topic','TrainerID','Participants','Method','EvalScore','Status','Remarks']);
  const rows = sheet.getDataRange().getValues();
  const training_id = 'TR' + String(rows.length).padStart(4, '0');
  sheet.appendRow([
    training_id,
    data.date,
    data.topic,
    data.trainer_id,
    data.participants || '',
    data.method || '',
    data.eval_score || '',
    data.status || 'Completed',
    data.remarks || ''
  ]);
  return { success: true, training_id };
}

// ── Wave 5+6: KPI Log ─────────────────────────────────────────────────────────

function getKPILog(params) {
  const sheet = ensureSheet('KPI_Log', ['LogID','LogDate','KPICode','KPIName','Value','Unit','Target','Period','RecordedBy']);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => rowToObj(headers, row));
  if (params && params.kpi_code) {
    data = data.filter(r => r.KPICode === params.kpi_code);
  }
  if (params && params.period) {
    data = data.filter(r => (r.Period || '').startsWith(params.period));
  }
  return { success: true, data };
}

function saveKPILog(data) {
  var authError = requireRole(data, ['director','qmr','supervisor']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['kpi_code','value','period']);
  if (fieldError) return { success: false, error: fieldError };

  const kpiDef = KPIS_KB.find(k => k.id === data.kpi_code) || {};
  const sheet = ensureSheet('KPI_Log', ['LogID','LogDate','KPICode','KPIName','Value','Unit','Target','Period','RecordedBy']);
  const rows = sheet.getDataRange().getValues();
  const log_id = 'KL' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    log_id,
    today,
    data.kpi_code,
    kpiDef.name || data.kpi_name || '',
    Number(data.value),
    kpiDef.unit || data.unit || '',
    kpiDef.target_label || data.target || '',
    data.period,
    data.userId || ''
  ]);
  return { success: true, log_id };
}

// ── Wave 6: Customer Complaints ───────────────────────────────────────────────

function getCustomerComplaints(params) {
  const sheet = ensureSheet('Customer_Complaints', ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','Status','RootCause','CorrectiveAction','ClosedDate','ClosedBy','Remarks']);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => rowToObj(headers, row));
  if (params && params.status && params.status !== 'all') {
    data = data.filter(r => (r.Status || '') === params.status);
  }
  return { success: true, data };
}

function saveCustomerComplaint(data) {
  var authError = requireRole(data, ['director','qmr','supervisor']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['customer_id','description','complaint_type']);
  if (fieldError) return { success: false, error: fieldError };

  const CC_HEADERS = ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','Status','RootCause','CorrectiveAction','ClosedDate','ClosedBy','Remarks'];
  const sheet = ensureSheet('Customer_Complaints', CC_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const seq = String(rows.length).padStart(3, '0');
  const complaint_no = 'YPP-CC-' + yy + mm + '-' + seq;
  sheet.appendRow([
    complaint_no,
    today.toISOString().slice(0, 10),
    data.customer_id,
    data.contact_person || '',
    data.batch_no_ref || '',
    data.product_id || '',
    data.complaint_type,
    data.description,
    data.severity || 'Medium',
    'Open',
    '',
    '',
    '',
    '',
    data.remarks || ''
  ]);
  return { success: true, complaint_no };
}

function closeCustomerComplaint(data) {
  var authError = requireRole(data, ['director','qmr']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['complaint_no']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('Customer_Complaints', ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','Status','RootCause','CorrectiveAction','ClosedDate','ClosedBy','Remarks']);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const noIdx     = headers.indexOf('ComplaintNo');
  const statusIdx = headers.indexOf('Status');
  const rcIdx     = headers.indexOf('RootCause');
  const caIdx     = headers.indexOf('CorrectiveAction');
  const cdIdx     = headers.indexOf('ClosedDate');
  const cbIdx     = headers.indexOf('ClosedBy');
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][noIdx]) === String(data.complaint_no)) {
      if (statusIdx >= 0) sheet.getRange(i+1, statusIdx+1).setValue('Closed');
      if (rcIdx     >= 0) sheet.getRange(i+1, rcIdx+1).setValue(data.root_cause || '');
      if (caIdx     >= 0) sheet.getRange(i+1, caIdx+1).setValue(data.corrective_action || '');
      if (cdIdx     >= 0) sheet.getRange(i+1, cdIdx+1).setValue(today);
      if (cbIdx     >= 0) sheet.getRange(i+1, cbIdx+1).setValue(data.userId || '');
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}
