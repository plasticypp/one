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
  { id: 'KPI001', name: 'Rejection Rate',            category: 'Quality',   unit: '%',     target_label: '< 3%',    target_value: 3,   target_operator: 'lte' },
  { id: 'KPI002', name: 'Customer Complaint Rate',   category: 'Customer',  unit: 'count', target_label: '0/month', target_value: 0,   target_operator: 'lte' },
  { id: 'KPI003', name: 'On-Time Delivery Rate',     category: 'Delivery',  unit: '%',     target_label: '≥ 95%',   target_value: 95,  target_operator: 'gte' },
  { id: 'KPI004', name: 'First Pass Yield (FPY)',    category: 'Quality',   unit: '%',     target_label: '≥ 97%',   target_value: 97,  target_operator: 'gte' },
  { id: 'KPI005', name: 'Machine Downtime (MTBF)',   category: 'Equipment', unit: 'hrs',   target_label: '≥ 200h',  target_value: 200, target_operator: 'gte' },
  { id: 'KPI006', name: 'PM Compliance Rate',        category: 'Equipment', unit: '%',     target_label: '≥ 90%',   target_value: 90,  target_operator: 'gte' },
  { id: 'KPI007', name: 'Raw Material Yield',        category: 'Process',   unit: '%',     target_label: '≥ 98%',   target_value: 98,  target_operator: 'gte' },
  { id: 'KPI008', name: 'CAPA Closure Rate',         category: 'Quality',   unit: '%',     target_label: '≥ 80%',   target_value: 80,  target_operator: 'gte' }
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
  var headers = data[0].map(function(h) { return String(h).toLowerCase(); });
  var idIdx     = headers.indexOf('userid') !== -1 ? headers.indexOf('userid') : headers.indexOf('user_id');
  var activeIdx = headers.indexOf('active');
  var roleIdx   = headers.indexOf('role');
  var nameIdx   = headers.indexOf('name');
  if (idIdx === -1) return { valid: false, error: 'Users sheet missing ID column' };
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
    if (action === 'seedAll')           return respond(seedAll());

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
      if (action === 'saveProductionLog')     return respond(saveProductionLog(data));
      if (action === 'saveIQCResult')         return respond(saveIQCResult(data));
      if (action === 'saveLegalEntry')        return respond(saveLegalEntry(data));
      if (action === 'saveQualityParam')      return respond(saveQualityParam(data));
      if (action === 'saveTrainingLog')       return respond(saveTrainingLog(data));
      if (action === 'saveKPILog')            return respond(saveKPILog(data));
      if (action === 'saveCustomerComplaint') return respond(saveCustomerComplaint(data));
      if (action === 'closeCustomerComplaint')return respond(closeCustomerComplaint(data));
      if (action === 'saveCalibrationLog')    return respond(saveCalibrationLog(data));
      if (action === 'saveIPC')               return respond(saveIPC(data));
      if (action === 'saveFQC')               return respond(saveFQC(data));
      if (action === 'saveOQC')               return respond(saveOQC(data));
    }

    if (action === 'getQualityParams') return respond(getQualityParams(e.parameter));
    if (action === 'getInspectionParams') return respond(getInspectionParams(e.parameter));
    if (action === 'getDefectCatalogue')  return respond(getDefectCatalogue());
    if (action === 'getNCRList') return respond(getNCRList(e.parameter));
    if (action === 'getBatchRecord')        return respond(getBatchRecord(e.parameter));
    if (action === 'getOQCBatchList')       return respond(getOQCBatchList());
    if (action === 'getRMStock')            return respond(getRMStock());
    if (action === 'getMaterialList')       return respond(getMaterialList());
    if (action === 'getSuppliers')          return respond(getSuppliers());
    if (action === 'getBOMByProduct')       return respond(getBOMByProduct(e.parameter));
    if (action === 'getPackagingSpec')      return respond(getPackagingSpec(e.parameter));
    if (action === 'getMachineList')        return respond(getMachineList());
    if (action === 'getOperatorList')       return respond(getOperatorList());
    if (action === 'getPersonnelList')      return respond(getPersonnelList());
    if (action === 'savePersonnel')         return respond(savePersonnel(data));
    if (action === 'getTrainingLog')        return respond(getTrainingLog(e.parameter));
    if (action === 'getKPILog')             return respond(getKPILog(e.parameter));
    if (action === 'getCustomerComplaints') return respond(getCustomerComplaints(e.parameter));
    if (action === 'getKPIsKB')            return respond({ success: true, data: KPIS_KB });
    if (action === 'getBreakdownCodesKB')  return respond({ success: true, data: BREAKDOWN_CODES_KB });
    if (action === 'getTrainingPlanKB')    return respond({ success: true, data: TRAINING_PLAN_KB });
    if (action === 'getCalibrationList')   return respond(getCalibrationList(e.parameter));
    if (action === 'getInstrumentsKB')     return respond({ success: true, data: INSTRUMENTS_KB });
    if (action === 'getReorderList')              return respond(getReorderList(e.parameter));
    if (action === 'getSOListForPlanning')        return respond(getSOListForPlanning());
    if (action === 'getProductionLog')            return respond(getProductionLog(e.parameter));
    if (action === 'getBatchTraceabilitySearch')  return respond(getBatchTraceabilitySearch(e.parameter));
    if (action === 'getIQCList')                  return respond(getIQCList(e.parameter));
    if (action === 'getIPCList')                  return respond(getIPCList(e.parameter));
    if (action === 'getFQCList')                  return respond(getFQCList(e.parameter));
    if (action === 'getSupplierScorecard')        return respond(getSupplierScorecard());

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

const MASTER_ENTITIES = ['Products','Customers','Suppliers','Equipment','Tooling','Spares','Personnel','BOM','QualityParams','Materials'];

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
  const idCol = headers[0];
  const idVal = row[idCol];

  const values = headers.map(h => row[h] !== undefined ? row[h] : '');

  // Check for duplicate by ID (new records only)
  const isNew = !rows.slice(1).some(r => String(r[0]) === String(idVal));
  if (isNew && idVal) {
    const nameCol = headers.find(h => h === 'Name' || h === 'name');
    if (nameCol && row[nameCol]) {
      if (checkDuplicate(entity, nameCol, row[nameCol], idCol, idVal)) {
        return { success: false, error: 'duplicate_name' };
      }
    }
  }

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
      const oldValues = {};
      Object.entries(data.fields).forEach(([col, val]) => {
        const colIdx = headers.indexOf(col);
        if (colIdx >= 0) {
          oldValues[col] = rows[i][colIdx];
          sheet.getRange(i+1, colIdx+1).setValue(val);
        }
      });
      // Write audit trail for GRN qty edits
      if (data.sheet === 'RMStock') {
        const auditSheet = ensureSheet('GRN_AuditLog', ['timestamp','grn_id','field','old_value','new_value','changed_by']);
        const now = new Date().toISOString();
        Object.entries(data.fields).forEach(([col, val]) => {
          auditSheet.appendRow([now, data.idVal, col, oldValues[col] !== undefined ? oldValues[col] : '', val, data.userId || '']);
        });
      }
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

  // Block SO delete if any dispatch has been made against it
  if (data.sheet === 'SalesOrders' && data.idCol === 'so_id') {
    try {
      const dispSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dispatch') || SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DispatchLog');
      if (dispSheet) {
        const dRows = dispSheet.getDataRange().getValues();
        const dHdrs = dRows[0];
        const dSoIdx = dHdrs.indexOf('so_id');
        const dQtyIdx = dHdrs.indexOf('qty_dispatched');
        if (dSoIdx >= 0) {
          const dispatched = dRows.slice(1)
            .filter(r => String(r[dSoIdx]) === String(data.idVal))
            .reduce((sum, r) => sum + (Number(r[dQtyIdx]) || 0), 0);
          if (dispatched > 0) return { success: false, error: 'so_has_dispatches:' + dispatched };
        }
      }
    } catch(e) {}
  }

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

  // Seed BatchTraceability so dispatch gate can find this batch
  upsertBatchTraceability({ batch_no: batchId, product_id: data.product_id, production_date: data.date || today, machine_id: data.machine_id });

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

  // Approved supplier gate — check Suppliers sheet, fall back to KB
  const suppSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Suppliers');
  let approvedIds = SUPPLIERS_KB.map(s => s.id);
  if (suppSheet) {
    const suppRows = suppSheet.getDataRange().getValues();
    if (suppRows.length > 1) {
      approvedIds = suppRows.slice(1).filter(r => r[0]).map(r => String(r[0]));
    }
  }
  if (!approvedIds.includes(String(data.supplier_id))) {
    return { success: false, error: 'unapproved_supplier' };
  }

  const RM_HEADERS = ['date','grn_id','supplier_id','material','lot_no','qty_kg','iqc_status'];
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
    Number(data.qty_kg),
    'Pending'
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

      // Push PM next-due date forward by the downtime to avoid false-overdue flags
      const downtimeMin = Number(data.downtime_min) || Number(data.downtime_hrs) * 60 || 0;
      const machineIdx = headers.indexOf('MachineID') >= 0 ? headers.indexOf('MachineID') : headers.indexOf('machine_id');
      const machineId = machineIdx >= 0 ? String(rows[i][machineIdx]) : '';
      if (machineId && downtimeMin > 0) {
        try {
          const pmSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PM_Schedule');
          if (pmSheet) {
            const pmRows = pmSheet.getDataRange().getValues();
            const pmHdrs = pmRows[0];
            const pmMachIdx = pmHdrs.indexOf('MachineID') >= 0 ? pmHdrs.indexOf('MachineID') : pmHdrs.indexOf('machine_id');
            const pmDueIdx  = pmHdrs.indexOf('NextDue');
            if (pmMachIdx >= 0 && pmDueIdx >= 0) {
              pmRows.slice(1).forEach(function(pmRow, ri) {
                if (String(pmRow[pmMachIdx]) === machineId && pmRow[pmDueIdx]) {
                  const due = new Date(pmRow[pmDueIdx]);
                  due.setMinutes(due.getMinutes() + downtimeMin);
                  pmSheet.getRange(ri + 2, pmDueIdx + 1).setValue(Utilities.formatDate(due, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
                }
              });
            }
          }
        } catch(e) {}
      }

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

  const BATCH_HEADERS = ['batch_id','date','product_id','planned_qty','actual_qty','machine_id','operator_id','status','start_time','end_time','shift','rm_lot','rejections','rejection_reason','downtime_min','downtime_reason'];
  const sheet = ensureSheet('BatchOrders', BATCH_HEADERS);
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
    '',
    data.shift || 'A',
    data.rm_lot || ''
  ]);

  // Seed BatchTraceability so dispatch gate can find this batch
  upsertBatchTraceability({ batch_no: batchId, product_id: data.product_id, production_date: data.batch_date || today, machine_id: data.machine_id });

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
      // IQC gate: if a RM lot is linked, ensure it has passed IQC before close
      if (data.override !== 'true') {
        const btSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('BatchTraceability');
        if (btSheet) {
          const btRows = btSheet.getDataRange().getValues();
          const btHdrs = btRows[0];
          const btBatchIdx = btHdrs.indexOf('batch_no');
          const btLotIdx   = btHdrs.indexOf('rm_lot_no');
          const btRow = btBatchIdx >= 0 ? btRows.slice(1).find(r => String(r[btBatchIdx]) === String(data.batch_id)) : null;
          if (btRow && btLotIdx >= 0 && btRow[btLotIdx]) {
            const lotNos = String(btRow[btLotIdx]).split(',').map(s => s.trim()).filter(Boolean);
            const rmSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RMStock');
            if (rmSheet && lotNos.length > 0) {
              const rmRows = rmSheet.getDataRange().getValues();
              const rmHdrs = rmRows[0];
              const rmLotIdx = rmHdrs.indexOf('lot_no');
              const rmIqcIdx = rmHdrs.indexOf('iqc_status');
              if (rmLotIdx >= 0 && rmIqcIdx >= 0) {
                const failedLot = lotNos.find(lot => {
                  const rmRow = rmRows.slice(1).find(r => String(r[rmLotIdx]) === lot);
                  return rmRow && rmRow[rmIqcIdx] !== 'Passed';
                });
                if (failedLot) return { success: false, error: 'iqc_not_passed', lot_no: failedLot };
              }
            }
          }
        }
      }

      // Param-log gate: warn if no param logs exist (director can override)
      if (data.override !== 'true') {
        const plSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Production_Log');
        if (plSheet) {
          const plRows = plSheet.getDataRange().getValues();
          if (plRows.length > 1) {
            const plHeaders = plRows[0];
            const plBatchIdx = plHeaders.indexOf('batch_id');
            const hasLogs = plBatchIdx >= 0 && plRows.slice(1).some(r => String(r[plBatchIdx]) === String(data.batch_id));
            if (!hasLogs) return { success: false, error: 'no_param_logs' };
          }
        }
      }
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
      // Write rejection and downtime — find columns by header name so schema changes don't break this
      const hdrRow = rows[0];
      const setCol = (colName, val) => {
        const idx = hdrRow.indexOf(colName);
        if (idx >= 0) sheet.getRange(i + 1, idx + 1).setValue(val);
      };
      setCol('rejections', Number(data.rejections) || 0);
      setCol('rejection_reason', data.rejection_reason || '');
      setCol('downtime_min', Number(data.downtime_min) || 0);
      setCol('downtime_reason', data.downtime_reason || '');
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
  var authError = requireRole(data, ['director','qmr','supervisor','operator']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['batch_id','defect_type','qty_affected','disposition']);
  if (fieldError) return { success: false, error: fieldError };

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Validate qty_affected does not exceed batch actual_qty
  const batchSheet = ss.getSheetByName('BatchOrders');
  if (batchSheet) {
    const bRows = batchSheet.getDataRange().getValues();
    const bHdrs = bRows[0];
    const bIdIdx = bHdrs.indexOf('batch_id');
    const bQtyIdx = bHdrs.indexOf('actual_qty');
    if (bIdIdx >= 0 && bQtyIdx >= 0) {
      const bRow = bRows.slice(1).find(r => String(r[bIdIdx]) === String(data.batch_id));
      if (bRow && bRow[bQtyIdx]) {
        const actualQty = Number(bRow[bQtyIdx]);
        if (actualQty > 0 && Number(data.qty_affected) > actualQty) {
          return { success: false, error: 'qty_affected_exceeds_batch: max ' + actualQty };
        }
      }
    }
  }
  var ncrSheet = ss.getSheetByName('NCR_Log');
  if (!ncrSheet) {
    ncrSheet = ss.insertSheet('NCR_Log');
    const hdrs = ['ncr_id','date','batch_id','stage','department','source_nc','defect_type','severity','qty_affected','disposition','detected_by','remarks','status','capa_required','capa_trigger_reason','capa_id','created_by','created_at'];
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
  } else if (data.disposition === 'CAPA') {
    capaRequired = true;
    capaTriggerReason = 'Disposition set to CAPA by inspector';
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
    data.department || '',
    data.source_nc || '',
    data.defect_type,
    severity,
    Number(data.qty_affected),
    data.disposition,
    data.detected_by || '',
    data.remarks || '',
    'Open',
    capaRequired,
    capaTriggerReason,
    '',           // capa_id — back-filled below if CAPA auto-created
    data.userId || '',
    today
  ]);

  // Auto-create CAPA when triggered
  let capaId = null;
  if (capaRequired) {
    try {
      const capaSheet = getSheet('CAPA_Register');
      const capaRows = capaSheet.getDataRange().getValues();
      const capaHeaders = capaRows[0];
      const capaIdColIdx = capaHeaders.indexOf('capa_id');
      let maxCapaNum = 0;
      if (capaIdColIdx >= 0) {
        for (let i = 1; i < capaRows.length; i++) {
          const m = String(capaRows[i][capaIdColIdx]).match(/CAPA(\d+)/);
          if (m) maxCapaNum = Math.max(maxCapaNum, parseInt(m[1], 10));
        }
      } else {
        maxCapaNum = capaRows.length - 1;
      }
      capaId = 'CAPA' + String(maxCapaNum + 1).padStart(4, '0');
      const is13col = capaHeaders.length >= 13;
      if (is13col) {
        capaSheet.appendRow([capaId, today, 'NCR', ncrId, data.remarks || data.defect_type || '', '', '', '', data.userId || '', '', 'Open', '', '']);
      } else {
        capaSheet.appendRow([capaId, today, 'NCR', data.remarks || data.defect_type || '', '', '', '', 'Open']);
      }
      // Write capa_id back to NCR row
      const ncrAllRows = ncrSheet.getDataRange().getValues();
      const ncrIdIdx2 = ncrAllRows[0].indexOf('ncr_id');
      const capaIdNcrIdx = ncrAllRows[0].indexOf('capa_id');
      if (capaIdNcrIdx >= 0) {
        for (let i = 1; i < ncrAllRows.length; i++) {
          if (String(ncrAllRows[i][ncrIdIdx2]) === String(ncrId)) {
            ncrSheet.getRange(i + 1, capaIdNcrIdx + 1).setValue(capaId);
            break;
          }
        }
      }
    } catch(e) { Logger.log('CAPA auto-create failed: ' + e.message); }
  }

  return { success: true, ncr_id: ncrId, capa_required: capaRequired, capa_trigger_reason: capaTriggerReason, capa_id: capaId };
}

function setupNCRLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('NCR_Log');
  if (sheet) { Logger.log('NCR_Log already exists'); return; }
  sheet = ss.insertSheet('NCR_Log');
  const hdrs = ['ncr_id','date','batch_id','stage','department','source_nc','defect_type','severity','qty_affected','disposition','detected_by','remarks','status','capa_required','capa_trigger_reason','capa_id','created_by','created_at'];
  sheet.getRange(1,1,1,hdrs.length).setValues([hdrs]);
  sheet.setFrozenRows(1);
  Logger.log('NCR_Log sheet created');
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

  // Mirror OQC result to OQC_Records sheet for AQL traceability
  if (stage === 'OQC') {
    const oqcSheet = ensureSheet('OQC_Records', ['oqc_id','batch_no','product_id','check_date','inspector_id','overall_result','remarks']);
    const oqcRows = oqcSheet.getDataRange().getValues();
    const oqcId = 'OQC' + String(oqcRows.length).padStart(4, '0');
    oqcSheet.appendRow([oqcId, data.batch_id, data.product_id || '', today, data.inspector_id || '', overallResult, data.remarks || '']);
  }

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
  const batches = rows.slice(1).map(r => rowToObj(headers, r));

  // Build set of OQC-cleared batch numbers from OQC_Records sheet
  const oqcCleared = new Set();
  const oqcSheet = ss.getSheetByName('OQC_Records');
  if (oqcSheet) {
    const oqcRows = oqcSheet.getDataRange().getValues();
    const oqcHeaders = oqcRows[0];
    const batchNoIdx = oqcHeaders.indexOf('BatchNo');
    const decisionIdx = oqcHeaders.indexOf('Decision');
    oqcRows.slice(1).forEach(r => {
      if (String(r[decisionIdx]).toUpperCase() === 'OK') oqcCleared.add(String(r[batchNoIdx]));
    });
  }

  const data = batches.filter(r =>
    !r.dispatch_id && (r.oqc_status === 'OK' || oqcCleared.has(String(r.batch_no)))
  );
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

function getMaterialList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Materials');
  if (!sheet || sheet.getLastRow() < 2) {
    // Auto-create sheet with headers if missing
    if (!sheet) {
      sheet = ss.insertSheet('Materials');
      sheet.getRange(1,1,1,4).setValues([['material_id','name','unit','active']]);
      sheet.setFrozenRows(1);
    }
    return { success: true, data: [] };
  }
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const activeIdx = headers.indexOf('active');
  const nameIdx   = headers.indexOf('name');
  const idIdx     = headers.indexOf('material_id');
  return {
    success: true,
    data: rows.slice(1)
      .filter(r => r[idIdx] && (activeIdx < 0 || String(r[activeIdx]).toUpperCase() !== 'FALSE'))
      .map(r => ({ id: r[idIdx], name: r[nameIdx] || r[idIdx] }))
  };
}

function setupMaterials() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName('Materials')) { Logger.log('Materials sheet already exists'); return; }
  const sheet = ss.insertSheet('Materials');
  sheet.getRange(1,1,1,4).setValues([['material_id','name','unit','active']]);
  sheet.setFrozenRows(1);
  Logger.log('Materials sheet created — add rows: material_id, name (e.g. HDPE Resin), unit (kg), active (TRUE)');
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

function getBOMByProduct(params) {
  const productId = params && params.product_id;
  const spec = BOM_KB.find(b => b.product_id === productId);
  if (!spec) return { success: false, error: 'product_not_in_bom' };
  return { success: true, data: spec };
}

function getPackagingSpec(params) {
  const productId = params && params.product_id;
  const spec = PACKAGING_SPECS_KB.find(p => p.product_id === productId);
  if (!spec) return { success: false, error: 'product_not_in_packaging_specs' };
  return { success: true, data: spec };
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
    .filter(r => r[0] && (typeIdx < 0 || !r[typeIdx] || String(r[typeIdx]).toLowerCase().includes('machine')) && (statusIdx < 0 || String(r[statusIdx]).toLowerCase() !== 'inactive'))
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
  var sheet = ensureSheet('Calibration_Log', ['calib_id','inst_id','inst_name','calibration_date','due_date','result','certificate_no','agency','done_by','remarks']);
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

  var CAL_HEADERS = ['calib_id','inst_id','inst_name','make_model','serial_no','range_capacity','location','calibration_date','due_date','calibration_method','as_found','adjustments_made','as_left','oot_flag','result','certificate_no','agency','done_by','remarks'];
  var sheet = ensureSheet('Calibration_Log', CAL_HEADERS);
  var existingRows = sheet.getDataRange().getValues();
  var calibId = 'CAL' + String(existingRows.length).padStart(4, '0');
  sheet.appendRow([
    calibId,
    data.inst_id,
    data.inst_name,
    data.make_model || '',
    data.serial_no || '',
    data.range_capacity || '',
    data.location || '',
    data.calibration_date,
    dueDateStr,
    data.calibration_method || '',
    data.as_found || '',
    data.adjustments_made || 'None',
    data.as_left || '',
    data.oot_flag || 'No',
    data.result,
    data.certificate_no || '',
    data.agency || '',
    data.done_by,
    data.remarks || ''
  ]);

  // On calibration failure, write a quality alert flag so QMR is aware instrument is suspect
  if (data.result === 'Fail') {
    const flagSheet = ensureSheet('Quality_Alerts', ['timestamp','source','ref_id','description','status','raised_by']);
    flagSheet.appendRow([
      new Date().toISOString(),
      'Calibration',
      data.inst_id,
      'Instrument ' + data.inst_name + ' failed calibration on ' + data.calibration_date + ' — results suspect until recalibrated',
      'Open',
      data.done_by || data.userId || ''
    ]);
  }

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

  const grnRows   = sheetRows('RMStock');
  const grnHeaders = grnRows[0] || [];
  const grnIqcIdx = grnHeaders.indexOf('iqc_status');
  const openGRNs  = grnRows.slice(1).filter(r => grnIqcIdx >= 0 ? r[grnIqcIdx] === 'Pending' : r.some(c => c !== '')).length;

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

  // Pending IQC — GRN rows where iqc_status is blank or 'Pending'
  const grnHdrs = grnRows[0] || [];
  const iqcStatusIdx = grnHdrs.indexOf('iqc_status');
  const pendingIQC = iqcStatusIdx >= 0
    ? grnRows.slice(1).filter(r => r[0] && (!r[iqcStatusIdx] || r[iqcStatusIdx] === 'Pending')).length
    : 0;

  const data = { openGRNs, activeBatches, openBreakdowns, openCapas, overdueCompliance, overdueCalibrations, lowStockCount, overduePMs, openComplaints, pendingIQC };
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

// Run once from Apps Script editor to fully reset Users sheet with correct PIN hashes.
// Default PIN for all users: 1234
function resetUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Users');
  if (!sheet) {
    sheet = ss.insertSheet('Users');
  } else {
    sheet.clearContents();
  }
  const headers = ['UserID','Name','Username','PINHash','Role','Language','Active','FailCount','LockUntil'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

  const pin1234 = hashPin('1234');
  const users = [
    ['P001','Tushar Patil',  'director',  pin1234,'director',  'en',true,0,''],
    ['P002','PL Pradhan',    'qmr',       pin1234,'qmr',       'en',true,0,''],
    ['P003','Mahesh Sawant', 'supervisor',pin1234,'supervisor','en',true,0,''],
    ['P004','Suresh Kamble', 'operator',  pin1234,'operator',  'en',true,0,''],
    ['P005','Anjali Desai',  'store',     pin1234,'store',     'en',true,0,''],
    ['P006','Ramesh More',   'operator2', pin1234,'operator',  'en',true,0,'']
  ];
  users.forEach(r => sheet.appendRow(r));
  Logger.log('Users sheet reset — ' + users.length + ' users written with PIN 1234');
  return { success: true, count: users.length };
}

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
    'Production_Log':   ['log_id','batch_id','log_time','zone1_temp','zone2_temp','blow_pressure_bar','cycle_time_sec','parison_weight_g','operator_id','remarks'],
    'Batch_Register':   ['BatchNo','ProductID','WOID','MachineID','MouldID','OperatorID','SupervisorID','ProdDate','Shift','QtyProduced','QtyRejected','QtyPassed','RMBatchNos','Status','IQCRef','IPCRef','OQCRef','DispatchRef'],
    // Quality
    'IQC_Records':      ['iqc_id','grn_id','lot_no','material','supplier_id','insp_date','inspector_id','mfi_result','density_result','visual_result','coa_ok','decision','remarks','released_by','released_at'],
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
    'Calibration_Log':  ['calib_id','inst_id','inst_name','calibration_date','due_date','result','certificate_no','agency','done_by','remarks'],
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

  // Validate responsible_id against Personnel — warn only, don't block (legacy free-text support)
  let responsibleWarn = false;
  if (data.responsible_id) {
    const pSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Personnel');
    if (pSheet) {
      const pRows = pSheet.getDataRange().getValues();
      const pHdrs = pRows[0];
      const pIdIdx = pHdrs.indexOf('PersonID') >= 0 ? pHdrs.indexOf('PersonID') : pHdrs.indexOf('person_id');
      if (pIdIdx >= 0) {
        const found = pRows.slice(1).some(r => String(r[pIdIdx]) === String(data.responsible_id));
        if (!found) responsibleWarn = true;
      }
    }
  }

  const CAPA_HEADERS = ['capa_id','date','source','ncr_ref','description','containment_action','root_cause','root_cause_statement','corrective_action','preventive_action','responsible_id','target_date','verification_method','verification_date','lessons_learned','status','closed_date','effectiveness'];
  const sheet = ensureSheet('CAPA_Register', CAPA_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const capa_id = 'CAPA' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    capa_id,
    today,
    data.source || '',
    data.ncr_ref || '',
    data.description || '',
    data.containment_action || '',
    data.root_cause || '',
    data.root_cause_statement || '',
    data.corrective_action || data.action || '',
    data.preventive_action || '',
    data.responsible_id || '',
    data.target_date || '',
    data.verification_method || '',
    data.verification_date || '',
    data.lessons_learned || '',
    'Open',
    '',
    ''
  ]);
  return { success: true, capa_id, responsible_warn: responsibleWarn };
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
  const sheet = ensureSheet('SalesOrders', ['so_id','date','customer_id','product_id','qty_ordered','qty_dispatched','status','invoice_no']);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).filter(row => row[0]).map(row => rowToObj(headers, row));
  if (params.status && params.status !== 'all') {
    data = data.filter(r => r.status === params.status);
  }
  return { success: true, data };
}

function saveSO(data) {
  var authError = requireRole(data, ['director','supervisor','store']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['customer_id','product_id','qty_ordered','date']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('SalesOrders', ['so_id','date','customer_id','product_id','qty_ordered','qty_dispatched','status','invoice_no']);
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

  // Enforce OQC clearance — check BatchTraceability first, fall back to OQC_Records sheet
  const btSheet = ss.getSheetByName('BatchTraceability');
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHeaders = btRows[0];
    const batchRow = btRows.slice(1).map(r => rowToObj(btHeaders, r))
      .find(r => String(r.batch_no) === String(data.batch_no));
    if (batchRow && batchRow.dispatch_id) return { success: false, error: 'batch_already_dispatched' };
    if (batchRow && batchRow.oqc_status === 'OK') {
      // cleared in BatchTraceability — proceed
    } else {
      // Check OQC_Records as fallback
      const oqcSheet = ss.getSheetByName('OQC_Records');
      let oqcCleared = false;
      if (oqcSheet) {
        const oqcRows = oqcSheet.getDataRange().getValues();
        const oqcHeaders = oqcRows[0];
        const batchNoIdx = oqcHeaders.indexOf('BatchNo');
        const decisionIdx = oqcHeaders.indexOf('Decision');
        oqcCleared = oqcRows.slice(1).some(r =>
          String(r[batchNoIdx]) === String(data.batch_no) && String(r[decisionIdx]).toUpperCase() === 'OK'
        );
        // Back-fill oqc_status in BatchTraceability if found
        if (oqcCleared && batchRow) {
          const oqcStatusIdx = btHeaders.indexOf('oqc_status');
          if (oqcStatusIdx >= 0) {
            const btAllRows = btSheet.getDataRange().getValues();
            const batchNoColIdx = btHeaders.indexOf('batch_no');
            for (let i = 1; i < btAllRows.length; i++) {
              if (String(btAllRows[i][batchNoColIdx]) === String(data.batch_no)) {
                btSheet.getRange(i + 1, oqcStatusIdx + 1).setValue('OK');
                break;
              }
            }
          }
        }
      }
      if (!oqcCleared) {
        // Director can override with explicit flag
        if (data.override === 'true') {
          var roleCheck = requireRole(data, ['director']);
          if (roleCheck) return { success: false, error: 'batch_not_oqc_cleared' };
          // override allowed — proceed with warning in response
        } else {
          if (!batchRow) return { success: false, error: 'batch_not_found' };
          return { success: false, error: 'batch_not_oqc_cleared' };
        }
      }
    }
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

function savePersonnel(data) {
  var authError = requireRole(data, ['director','hr']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['name','role','department']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('Personnel', ['PersonID','Name','Username','Role','Department','ReportsTo','Phone','Email','DateJoined','Qualification','Active']);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('PersonID');

  if (data.PersonID) {
    // Update existing
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(data.PersonID)) {
        const nameIdx  = headers.indexOf('Name');
        const roleIdx  = headers.indexOf('Role');
        const deptIdx  = headers.indexOf('Department');
        const phoneIdx = headers.indexOf('Phone');
        const qualIdx  = headers.indexOf('Qualification');
        if (nameIdx  >= 0) sheet.getRange(i+1, nameIdx+1).setValue(data.name);
        if (roleIdx  >= 0) sheet.getRange(i+1, roleIdx+1).setValue(data.role);
        if (deptIdx  >= 0) sheet.getRange(i+1, deptIdx+1).setValue(data.department);
        if (phoneIdx >= 0) sheet.getRange(i+1, phoneIdx+1).setValue(data.phone || '');
        if (qualIdx  >= 0) sheet.getRange(i+1, qualIdx+1).setValue(data.qualification || '');
        return { success: true, person_id: data.PersonID };
      }
    }
  }

  // New record
  const nextId = 'P' + String(rows.length).padStart(3, '0');
  sheet.appendRow([
    nextId,
    data.name,
    data.username || '',
    data.role,
    data.department,
    data.reports_to || '',
    data.phone || '',
    data.email || '',
    data.date_joined || new Date().toISOString().slice(0,10),
    data.qualification || '',
    true
  ]);
  return { success: true, person_id: nextId };
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

  const CC_HEADERS = ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','InvoiceRef','AckSent','Status','RootCause','Investigation','CorrectiveAction','ResponseDate','ResponseSummary','CustomerAcceptance','ClosedDate','ClosedBy','Remarks'];
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
    data.invoice_ref || '',
    data.ack_sent || 'No',
    'Open',
    '', '', '', '', '', '', '', '',
    data.remarks || ''
  ]);
  return { success: true, complaint_no };
}

function closeCustomerComplaint(data) {
  var authError = requireRole(data, ['director','qmr']);
  if (authError) return { success: false, error: authError };

  var fieldError = validateFields(data, ['complaint_no']);
  if (fieldError) return { success: false, error: fieldError };

  const CC_CLOSE_HEADERS = ['ComplaintNo','DateReceived','CustomerID','ContactPerson','BatchNoRef','ProductID','ComplaintType','Description','Severity','InvoiceRef','AckSent','Status','RootCause','Investigation','CorrectiveAction','ResponseDate','ResponseSummary','CustomerAcceptance','ClosedDate','ClosedBy','Remarks'];
  const sheet = ensureSheet('Customer_Complaints', CC_CLOSE_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const noIdx            = headers.indexOf('ComplaintNo');
  const statusIdx        = headers.indexOf('Status');
  const rcIdx            = headers.indexOf('RootCause');
  const investIdx        = headers.indexOf('Investigation');
  const caIdx            = headers.indexOf('CorrectiveAction');
  const respDateIdx      = headers.indexOf('ResponseDate');
  const respSummaryIdx   = headers.indexOf('ResponseSummary');
  const custAcceptIdx    = headers.indexOf('CustomerAcceptance');
  const cdIdx            = headers.indexOf('ClosedDate');
  const cbIdx            = headers.indexOf('ClosedBy');
  const today = new Date().toISOString().slice(0, 10);
  const sevIdx = headers.indexOf('Severity');
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][noIdx]) === String(data.complaint_no)) {
      if (statusIdx      >= 0) sheet.getRange(i+1, statusIdx+1).setValue('Closed');
      if (rcIdx          >= 0) sheet.getRange(i+1, rcIdx+1).setValue(data.root_cause || '');
      if (investIdx      >= 0) sheet.getRange(i+1, investIdx+1).setValue(data.investigation || '');
      if (caIdx          >= 0) sheet.getRange(i+1, caIdx+1).setValue(data.corrective_action || '');
      if (respDateIdx    >= 0) sheet.getRange(i+1, respDateIdx+1).setValue(data.response_date || '');
      if (respSummaryIdx >= 0) sheet.getRange(i+1, respSummaryIdx+1).setValue(data.response_summary || '');
      if (custAcceptIdx  >= 0) sheet.getRange(i+1, custAcceptIdx+1).setValue(data.customer_acceptance || '');
      if (cdIdx          >= 0) sheet.getRange(i+1, cdIdx+1).setValue(today);
      if (cbIdx          >= 0) sheet.getRange(i+1, cbIdx+1).setValue(data.userId || '');

      // Auto-create CAPA for Critical complaints
      let capaId = null;
      const severity = sevIdx >= 0 ? rows[i][sevIdx] : '';
      if (severity === 'Critical' || data.create_capa === 'true') {
        try {
          const capaRes = saveCapa({
            source: 'Customer Complaint',
            ncr_ref: data.complaint_no,
            description: data.root_cause || 'Customer complaint: ' + data.complaint_no,
            root_cause: data.root_cause || '',
            corrective_action: data.corrective_action || '',
            target_date: data.target_date || '',
            responsible_id: data.responsible_id || '',
            userId: data.userId,
            role: data.role
          });
          if (capaRes && capaRes.success) capaId = capaRes.capa_id;
        } catch(e) { Logger.log('CAPA auto-create for complaint failed: ' + e.message); }
      }

      return { success: true, capa_id: capaId };
    }
  }
  return { success: false, error: 'not_found' };
}

// ── Production Parameters Log ─────────────────────────────────────────────────

const PROD_LOG_HEADERS = ['log_id','batch_id','log_time','zone1_temp','zone2_temp','blow_pressure_bar','cycle_time_sec','parison_weight_g','operator_id','remarks'];

function saveProductionLog(data) {
  var authError = requireRole(data, ['director','supervisor','operator']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['batch_id']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('Production_Log', PROD_LOG_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const logId = 'PL' + String(rows.length).padStart(4, '0');
  const now = new Date().toISOString();
  sheet.appendRow([
    logId,
    data.batch_id,
    data.log_time || now,
    Number(data.zone1_temp) || '',
    Number(data.zone2_temp) || '',
    Number(data.blow_pressure_bar) || '',
    Number(data.cycle_time_sec) || '',
    Number(data.parison_weight_g) || '',
    data.operator_id || data.userId || '',
    data.remarks || ''
  ]);
  return { success: true, log_id: logId };
}

function getProductionLog(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Production_Log');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params && params.batch_id) data = data.filter(r => String(r.batch_id) === String(params.batch_id));
  return { success: true, data };
}

// ── Batch Traceability Search ─────────────────────────────────────────────────

function getBatchTraceabilitySearch(params) {
  requireRole(params, ['director','qmr','supervisor','operator','store']);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const q = (params.q || '').toLowerCase().trim();

  // Resolve batch_no from various entry points
  let batchNo = params.batch_no || '';

  if (!batchNo && q) {
    // Try to find batch by lot_no in RMStock
    const rmSheet = ss.getSheetByName('RMStock');
    if (rmSheet) {
      const rmRows = rmSheet.getDataRange().getValues();
      const rmHdrs = rmRows[0];
      const lotIdx = rmHdrs.indexOf('lot_no');
      const batchIdxRM = rmHdrs.indexOf('batch_id');
      for (let i = 1; i < rmRows.length; i++) {
        if (lotIdx >= 0 && String(rmRows[i][lotIdx]).toLowerCase().includes(q)) {
          if (batchIdxRM >= 0 && rmRows[i][batchIdxRM]) batchNo = rmRows[i][batchIdxRM];
          break;
        }
      }
    }
    if (!batchNo) batchNo = q.toUpperCase();
  }

  if (!batchNo) return { success: false, error: 'batch_no or q required' };

  // BatchOrders
  const boSheet = ss.getSheetByName('BatchOrders');
  let batchOrder = null;
  if (boSheet) {
    const boRows = boSheet.getDataRange().getValues();
    const boHdrs = boRows[0];
    for (let i = 1; i < boRows.length; i++) {
      if (String(boRows[i][0]).toUpperCase() === batchNo.toUpperCase()) {
        batchOrder = rowToObj(boHdrs, boRows[i]);
        break;
      }
    }
  }

  // BatchTraceability
  const btSheet = ss.getSheetByName('BatchTraceability');
  let traceability = null;
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHdrs = btRows[0];
    for (let i = 1; i < btRows.length; i++) {
      if (String(btRows[i][0]).toUpperCase() === batchNo.toUpperCase()) {
        traceability = rowToObj(btHdrs, btRows[i]);
        break;
      }
    }
  }

  // GRN/RMStock — RM lot used
  const rmSheet = ss.getSheetByName('RMStock');
  let rmLots = [];
  if (rmSheet && traceability && traceability.rm_lot_no) {
    const rmRows = rmSheet.getDataRange().getValues();
    const rmHdrs = rmRows[0];
    const lotNos = String(traceability.rm_lot_no).split(',').map(s => s.trim());
    rmLots = rmRows.slice(1)
      .map(r => rowToObj(rmHdrs, r))
      .filter(r => lotNos.includes(String(r.lot_no)));
  }

  // Quality checks
  const qcSheet = ss.getSheetByName('QualityChecks');
  let qualityChecks = [];
  if (qcSheet) {
    const qcRows = qcSheet.getDataRange().getValues();
    const qcHdrs = qcRows[0];
    qualityChecks = qcRows.slice(1)
      .map(r => rowToObj(qcHdrs, r))
      .filter(r => String(r.batch_id).toUpperCase() === batchNo.toUpperCase());
  }

  // NCRs
  const ncrSheet = ss.getSheetByName('NCR_Log');
  let ncrs = [];
  if (ncrSheet) {
    const ncrRows = ncrSheet.getDataRange().getValues();
    const ncrHdrs = ncrRows[0];
    ncrs = ncrRows.slice(1)
      .map(r => rowToObj(ncrHdrs, r))
      .filter(r => String(r.batch_id).toUpperCase() === batchNo.toUpperCase());
  }

  // Production log
  const plSheet = ss.getSheetByName('Production_Log');
  let prodLog = [];
  if (plSheet) {
    const plRows = plSheet.getDataRange().getValues();
    const plHdrs = plRows[0];
    prodLog = plRows.slice(1)
      .map(r => rowToObj(plHdrs, r))
      .filter(r => String(r.batch_id).toUpperCase() === batchNo.toUpperCase());
  }

  // Dispatch
  const dispSheet = ss.getSheetByName('Dispatch');
  let dispatch = null;
  if (dispSheet && traceability && traceability.dispatch_id) {
    const dispRows = dispSheet.getDataRange().getValues();
    const dispHdrs = dispRows[0];
    for (let i = 1; i < dispRows.length; i++) {
      if (String(dispRows[i][0]) === String(traceability.dispatch_id)) {
        dispatch = rowToObj(dispHdrs, dispRows[i]);
        break;
      }
    }
  }

  if (!batchOrder && !traceability) return { success: false, error: 'not_found' };

  return { success: true, data: { batch_no: batchNo, batch_order: batchOrder, traceability, rm_lots: rmLots, quality_checks: qualityChecks, ncrs, prod_log: prodLog, dispatch: dispatch ? [dispatch] : [] } };
}

// ── IQC Hold / Release ────────────────────────────────────────────────────────

const IQC_HEADERS = ['iqc_id','grn_id','lot_no','material','supplier_id','invoice_no','grade_type','bag_count','bag_condition','labelling_ok','contamination','colour_match','insp_date','inspector_id','mfi_result','density_result','bulk_density','visual_result','coa_ok','decision','remarks','released_by','released_at'];

function saveIQCResult(data) {
  var authError = requireRole(data, ['director','qmr','supervisor']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['grn_id','lot_no','decision']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('IQC_Records', IQC_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const iqcId = 'IQC' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  // Check if record exists for this grn_id
  const headers = rows[0];
  const grnIdx = headers.indexOf('grn_id');
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][grnIdx]) === String(data.grn_id)) {
      // Update existing
      const set = (col, val) => { const idx = headers.indexOf(col); if (idx >= 0) sheet.getRange(i+1, idx+1).setValue(val); };
      set('invoice_no', data.invoice_no || '');
      set('grade_type', data.grade_type || '');
      set('bag_count', data.bag_count || '');
      set('bag_condition', data.bag_condition || '');
      set('labelling_ok', data.labelling_ok || '');
      set('contamination', data.contamination || '');
      set('colour_match', data.colour_match || '');
      set('mfi_result', data.mfi_result || '');
      set('density_result', data.density_result || '');
      set('bulk_density', data.bulk_density || '');
      set('visual_result', data.visual_result || '');
      set('coa_ok', data.coa_ok || '');
      set('decision', data.decision);
      set('remarks', data.remarks || '');
      set('inspector_id', data.inspector_id || data.userId || '');
      set('insp_date', today);
      // Update RMStock lot status
      _updateRMStockIQCStatus(data.lot_no, data.decision);
      return { success: true, iqc_id: rows[i][0] };
    }
  }

  sheet.appendRow([
    iqcId, data.grn_id, data.lot_no, data.material || '', data.supplier_id || '',
    data.invoice_no || '', data.grade_type || '', data.bag_count || '', data.bag_condition || '',
    data.labelling_ok || '', data.contamination || '', data.colour_match || '',
    today, data.inspector_id || data.userId || '', data.mfi_result || '', data.density_result || '',
    data.bulk_density || '', data.visual_result || '', data.coa_ok || '', data.decision, data.remarks || '', '', ''
  ]);
  _updateRMStockIQCStatus(data.lot_no, data.decision);
  return { success: true, iqc_id: iqcId };
}

function _updateRMStockIQCStatus(lotNo, decision) {
  // Sets a status field on RMStock row if it exists
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('RMStock');
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const lotIdx    = headers.indexOf('lot_no');
  const statusIdx = headers.indexOf('iqc_status');
  if (lotIdx < 0) return;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][lotIdx]) === String(lotNo)) {
      if (statusIdx >= 0) sheet.getRange(i+1, statusIdx+1).setValue(decision);
      return;
    }
  }
}

function getIQCList(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('IQC_Records');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params && params.decision) data = data.filter(r => r.decision === params.decision);
  return { success: true, data };
}

// ── IPC — In-Process Check ────────────────────────────────────────────────────

const IPC_HEADERS = ['ipc_id','date','shift','batch_id','product_id','machine_id','mould_no','check_type','sample_size','wt_s1','wt_s2','wt_s3','wt_s4','wt_s5','tare_wt','wt_0','wt_45','wt_90','wt_135','wt_180','wt_225','wt_270','wt_315','wall_thick','height','diameter','neck_dia','flash','sink_marks','colour','contamination','short_shot','warpage','base_pinch','thread','surface','leak_s1','leak_s2','cap_fitment','result','checked_by','remarks','created_at'];

function saveIPC(data) {
  var authError = requireRole(data, ['director','qmr','supervisor','operator']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['batch_id','result','checked_by']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('IPC_Records', IPC_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const ipcId = 'IPC' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  // Look up product_id from batch
  let productId = data.product_id || '';
  if (!productId) {
    const bSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('BatchOrders');
    if (bSheet) {
      const bRows = bSheet.getDataRange().getValues();
      const bHdrs = bRows[0];
      const bIdIdx = bHdrs.indexOf('batch_id');
      const bPIdx  = bHdrs.indexOf('product_id');
      if (bIdIdx >= 0 && bPIdx >= 0) {
        const bRow = bRows.slice(1).find(r => String(r[bIdIdx]) === String(data.batch_id));
        if (bRow) productId = bRow[bPIdx];
      }
    }
  }

  sheet.appendRow([
    ipcId, data.date || today, data.shift || 'A', data.batch_id, productId, data.machine_id || '',
    data.mould_no || '', data.check_type || '', data.sample_size || '',
    data.wt_s1 || '', data.wt_s2 || '', data.wt_s3 || '', data.wt_s4 || '', data.wt_s5 || '',
    data.tare_wt || '',
    data.wt_0 || '', data.wt_45 || '', data.wt_90 || '', data.wt_135 || '',
    data.wt_180 || '', data.wt_225 || '', data.wt_270 || '', data.wt_315 || '',
    data.wall_thick || '', data.height || '', data.diameter || '', data.neck_dia || '',
    data.flash || '', data.sink_marks || '', data.colour || '', data.contamination || '',
    data.short_shot || '', data.warpage || '', data.base_pinch || '', data.thread || '',
    data.surface || '', data.leak_s1 || '', data.leak_s2 || '', data.cap_fitment || '',
    data.result, data.checked_by, data.remarks || '', today
  ]);
  return { success: true, ipc_id: ipcId };
}

function getIPCList(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('IPC_Records');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params && params.batch_id) data = data.filter(r => r.batch_id === params.batch_id);
  return { success: true, data };
}

// ── FQC — Final Quality Check & Release ──────────────────────────────────────

const FQC_HEADERS = ['fqc_id','date','batch_id','product_id','customer','total_qty','aql_level','sample_size','height','diameter','neck_dia','wall_thick','capacity','flash','contamination','colour_finish','labelling','packaging','leak_test','drop_base','drop_side','drop_test','top_load','brim_u1','brim_u2','brim_result','torque_test','mfi_check','nc_units','result','inspector_id','released_by','remarks','created_at'];

function saveFQC(data) {
  var authError = requireRole(data, ['director','qmr','supervisor']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['batch_id','result','inspector_id']);
  if (fieldError) return { success: false, error: fieldError };

  const sheet = ensureSheet('FQC_Records', FQC_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const fqcId = 'FQC' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  let productId = data.product_id || '';
  if (!productId) {
    const bSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('BatchOrders');
    if (bSheet) {
      const bRows = bSheet.getDataRange().getValues();
      const bHdrs = bRows[0];
      const bIdIdx = bHdrs.indexOf('batch_id');
      const bPIdx  = bHdrs.indexOf('product_id');
      if (bIdIdx >= 0 && bPIdx >= 0) {
        const bRow = bRows.slice(1).find(r => String(r[bIdIdx]) === String(data.batch_id));
        if (bRow) productId = bRow[bPIdx];
      }
    }
  }

  sheet.appendRow([
    fqcId, data.date || today, data.batch_id, productId, data.customer || '',
    Number(data.total_qty) || 0, data.aql_level || 'AQL 2.5', data.sample_size || '',
    data.height || '', data.diameter || '', data.neck_dia || '', data.wall_thick || '', data.capacity || '',
    data.flash || '', data.contamination || '', data.colour_finish || '', data.labelling || '',
    data.packaging || '', data.leak_test || '', data.drop_base || '', data.drop_side || '',
    data.drop_test || '', data.top_load || '', data.brim_u1 || '', data.brim_u2 || '',
    data.brim_result || '', data.torque_test || '', data.mfi_check || '',
    Number(data.nc_units) || 0, data.result, data.inspector_id, data.released_by || '',
    data.remarks || '', today
  ]);

  return { success: true, fqc_id: fqcId };
}

function saveOQC(data) {
  var authError = requireRole(data, ['director','qmr','supervisor']);
  if (authError) return { success: false, error: authError };
  var fieldError = validateFields(data, ['batch_no','inspector_id','decision']);
  if (fieldError) return { success: false, error: fieldError };

  const OQC_HDR = ['OQCID','BatchNo','InspDate','InspectorID',
    'SampleSize','VisualResult','visual_defects',
    'dim_height_ok','dim_od_ok','dim_neck_ok',
    'leak_test','drop_test','cap_fitment',
    'aql_defects_found','aql_pass',
    'hold_reason','Decision','Remarks','SavedAt'];
  const sheet = ensureSheet('OQC_Records', OQC_HDR);
  const rows  = sheet.getDataRange().getValues();
  const oqcId = 'OQC' + String(rows.length).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  sheet.appendRow([
    oqcId, data.batch_no, data.insp_date || today, data.inspector_id,
    Number(data.sample_size) || 0, data.visual_result || '',
    data.visual_defects || '',
    data.dim_height_ok || '', data.dim_od_ok || '', data.dim_neck_ok || '',
    data.leak_test || '', data.drop_test || '', data.cap_fitment || '',
    Number(data.aql_defects_found) || 0, data.aql_pass || '',
    data.hold_reason || '', data.decision, data.remarks || '', today
  ]);

  // Update BatchTraceability oqc_status
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const btSheet = ss.getSheetByName('BatchTraceability');
  if (btSheet) {
    const btRows = btSheet.getDataRange().getValues();
    const btHdrs = btRows[0];
    const batchNoIdx  = btHdrs.indexOf('batch_no');
    const oqcStatusIdx = btHdrs.indexOf('oqc_status');
    if (batchNoIdx >= 0 && oqcStatusIdx >= 0) {
      for (let i = 1; i < btRows.length; i++) {
        if (String(btRows[i][batchNoIdx]) === String(data.batch_no)) {
          btSheet.getRange(i + 1, oqcStatusIdx + 1).setValue(data.decision === 'OK' ? 'OK' : 'HOLD');
          break;
        }
      }
    }
  }

  return { success: true, oqc_id: oqcId, decision: data.decision };
}

function getFQCList(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FQC_Records');
  if (!sheet) return { success: true, data: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(r => rowToObj(headers, r));
  if (params && params.result) data = data.filter(r => r.result === params.result);
  return { success: true, data };
}

// ── Supplier Scorecard ────────────────────────────────────────────────────────

function getSupplierScorecard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // GRNs per supplier
  const rmSheet = ss.getSheetByName('RMStock');
  const grnBySupplier = {};
  if (rmSheet) {
    const rows = rmSheet.getDataRange().getValues();
    const hdrs = rows[0];
    rows.slice(1).forEach(r => {
      const obj = rowToObj(hdrs, r);
      const sid = obj.supplier_id || '';
      if (!sid) return;
      if (!grnBySupplier[sid]) grnBySupplier[sid] = { grn_count: 0, rejected: 0, total_kg: 0 };
      grnBySupplier[sid].grn_count++;
      grnBySupplier[sid].total_kg += Number(obj.qty_kg) || 0;
      if (obj.iqc_status === 'Reject') grnBySupplier[sid].rejected++;
    });
  }

  // NCRs sourced from suppliers (stage=IQC)
  const ncrSheet = ss.getSheetByName('NCR_Log');
  const ncrByBatch = {};
  if (ncrSheet) {
    const rows = ncrSheet.getDataRange().getValues();
    const hdrs = rows[0];
    rows.slice(1).forEach(r => {
      const obj = rowToObj(hdrs, r);
      if (obj.stage === 'IQC') {
        // We can't directly link NCR→supplier; track by count
        ncrByBatch[obj.batch_id] = (ncrByBatch[obj.batch_id] || 0) + 1;
      }
    });
  }

  // Supplier master
  const suppSheet = ss.getSheetByName('Suppliers');
  const suppMap = {};
  if (suppSheet) {
    const rows = suppSheet.getDataRange().getValues();
    const hdrs = rows[0];
    rows.slice(1).forEach(r => {
      const obj = rowToObj(hdrs, r);
      suppMap[obj.SupplierID] = obj.Name || obj.SupplierID;
    });
  }

  const data = Object.entries(grnBySupplier).map(([sid, s]) => {
    const acceptRate = s.grn_count > 0 ? Math.round(((s.grn_count - s.rejected) / s.grn_count) * 100) : 100;
    return {
      supplier_id:   sid,
      supplier_name: suppMap[sid] || sid,
      grn_count:     s.grn_count,
      rejected:      s.rejected,
      total_kg:      s.total_kg,
      accept_rate:   acceptRate
    };
  });

  return { success: true, data };
}

// ── Full PM Schedule Seed ─────────────────────────────────────────────────────

const MAINTENANCE_PLAN_KB = [
  // Hydraulic system
  { task: 'Hydraulic oil level check',          equip: 'EQ001', freq: 7  },
  { task: 'Hydraulic oil change',               equip: 'EQ001', freq: 180 },
  { task: 'Hydraulic filter replacement',       equip: 'EQ001', freq: 90  },
  { task: 'Hydraulic hose inspection',          equip: 'EQ001', freq: 30  },
  { task: 'Hydraulic pressure calibration',     equip: 'EQ001', freq: 90  },
  // Pneumatic system
  { task: 'Pneumatic line lubrication',         equip: 'EQ002', freq: 7  },
  { task: 'Air filter/dryer clean',             equip: 'EQ002', freq: 14  },
  { task: 'Blow pressure gauge check',          equip: 'EQ002', freq: 30  },
  { task: 'Pneumatic cylinder seal check',      equip: 'EQ002', freq: 90  },
  // Extrusion & die head
  { task: 'Die head cleaning',                  equip: 'EQ001', freq: 7  },
  { task: 'Parison head temperature check',     equip: 'EQ001', freq: 7  },
  { task: 'Extruder screw & barrel inspection', equip: 'EQ001', freq: 180 },
  { task: 'Heater band continuity check',       equip: 'EQ001', freq: 30  },
  { task: 'Thermocouple calibration check',     equip: 'EQ001', freq: 90  },
  // Mould & clamping
  { task: 'Mould cooling water flow check',     equip: 'EQ003', freq: 7  },
  { task: 'Mould parting surface cleaning',     equip: 'EQ003', freq: 14  },
  { task: 'Clamp force verification',           equip: 'EQ003', freq: 30  },
  { task: 'Mould guide pin lubrication',        equip: 'EQ003', freq: 30  },
  { task: 'Mould cavity dimensional check',     equip: 'EQ003', freq: 180 },
  // Drive & electrical
  { task: 'V-belt tension check',               equip: 'EQ004', freq: 7  },
  { task: 'V-belt replacement',                 equip: 'EQ004', freq: 365 },
  { task: 'Motor bearing lubrication',          equip: 'EQ004', freq: 90  },
  { task: 'Electrical panel dust blow-out',     equip: 'EQ004', freq: 30  },
  { task: 'Drive coupling check',               equip: 'EQ004', freq: 30  },
  // General machine
  { task: 'Machine external cleaning',          equip: 'EQ001', freq: 7  },
  { task: 'Lubrication of moving parts',        equip: 'EQ001', freq: 14  },
  { task: 'Safety guard & interlock check',     equip: 'EQ001', freq: 30  },
  { task: 'Emergency stop test',                equip: 'EQ001', freq: 30  },
  { task: 'Oil leak check (all systems)',       equip: 'EQ001', freq: 7  },
  // Conveyors & handling
  { task: 'Conveyor belt tension check',        equip: 'EQ005', freq: 14  },
  { task: 'Conveyor roller lubrication',        equip: 'EQ005', freq: 30  },
  // Chillers & cooling
  { task: 'Chiller water level check',          equip: 'EQ006', freq: 7  },
  { task: 'Chiller condenser cleaning',         equip: 'EQ006', freq: 90  },
  { task: 'Cooling tower cleaning',             equip: 'EQ006', freq: 30  },
  // Air compressor
  { task: 'Compressor oil level check',         equip: 'EQ007', freq: 7  },
  { task: 'Compressor air filter cleaning',     equip: 'EQ007', freq: 14  },
  { task: 'Compressor safety valve test',       equip: 'EQ007', freq: 90  },
  { task: 'Compressor belt check',              equip: 'EQ007', freq: 30  },
  // Tooling/instruments
  { task: 'Wall thickness gauge calibration',   equip: 'EQ008', freq: 180 },
  { task: 'Weighing scale calibration',         equip: 'EQ008', freq: 90  },
  { task: 'Vernier caliper calibration',        equip: 'EQ008', freq: 180 },
  { task: 'Pressure gauge calibration',         equip: 'EQ008', freq: 180 },
  // Safety
  { task: 'Fire extinguisher inspection',       equip: 'EQ009', freq: 30  },
  { task: 'First aid kit restocking check',     equip: 'EQ009', freq: 30  }
];

function seedFullPMSchedule() {
  const sheet = ensureSheet('PM_Schedule', ['PMID','EquipID','TaskType','Frequency','LastDone','NextDue','AssignedTo','Status','Remarks']);
  const existing = sheet.getDataRange().getValues();
  if (existing.length > 1) {
    Logger.log('PM_Schedule: already has data (' + (existing.length - 1) + ' rows), skipping full seed.');
    return { seeded: 0, skipped: existing.length - 1 };
  }
  const today = new Date();
  let count = 0;
  MAINTENANCE_PLAN_KB.forEach((t, idx) => {
    const pmId = 'PM' + String(idx + 1).padStart(3, '0');
    const nextDue = new Date(today);
    nextDue.setDate(nextDue.getDate() + t.freq);
    sheet.appendRow([pmId, t.equip, t.task, t.freq, '', nextDue.toISOString().slice(0, 10), '', 'Scheduled', '']);
    count++;
  });
  Logger.log('PM_Schedule: seeded ' + count + ' tasks.');
  return { seeded: count };
}

function _cacheInvalidate(key) {
  _cacheDel(key);
}

// ── Master + Demo Data Seeding ────────────────────────────────────────────────

function seedMasters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = [];

  function safeWrite(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    const existing = sheet.getDataRange().getValues();
    if (existing.length > 1) { log.push(sheetName + ': skipped (' + (existing.length-1) + ' rows exist)'); return; }
    rows.forEach(r => sheet.appendRow(r));
    log.push(sheetName + ': seeded ' + rows.length + ' rows');
  }

  // Users sheet — seed with hashed PINs (default PIN: 1234 for all)
  (function() {
    const usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) return;
    const existing = usersSheet.getDataRange().getValues();
    if (existing.length > 1) { log.push('Users: skipped (' + (existing.length-1) + ' rows exist)'); return; }
    const pin1234 = hashPin('1234');
    const usersData = [
      ['P001','Tushar Patil',  'director',  pin1234, 'director',   'en', true, 0, ''],
      ['P002','PL Pradhan',    'qmr',       pin1234, 'qmr',        'en', true, 0, ''],
      ['P003','Mahesh Sawant', 'supervisor',pin1234, 'supervisor', 'en', true, 0, ''],
      ['P004','Suresh Kamble', 'operator',  pin1234, 'operator',   'en', true, 0, ''],
      ['P005','Anjali Desai',  'store',     pin1234, 'store',      'en', true, 0, ''],
      ['P006','Ramesh More',   'operator2', pin1234, 'operator',   'en', true, 0, '']
    ];
    usersData.forEach(r => usersSheet.appendRow(r));
    log.push('Users: seeded ' + usersData.length + ' rows');
  })();

  safeWrite('Products',
    ['ProductID','SKU','Name','Capacity_ml','Material','HSN','Weight_g','WallThickness_mm','NeckSize_mm','Status'],
    [
      ['PRD001','YPP-CAN-5L',  'HDPE Can 5L',    5000, 'HDPE', '3923', 280, 2.2, 38, 'Active'],
      ['PRD002','YPP-BTL-1L',  'HDPE Bottle 1L', 1000, 'HDPE', '3923', 68,  2.0, 28, 'Active'],
      ['PRD003','YPP-BTL-200', 'HDPE Bottle 200ml', 200, 'HDPE', '3923', 22, 1.8, 24, 'Active'],
      ['PRD004','YPP-BTL-100', 'HDPE Bottle 100ml', 100, 'HDPE', '3923', 14, 1.6, 20, 'Active']
    ]
  );

  safeWrite('Customers',
    ['CustomerID','Code','Name','GSTIN','Address','Contact','Phone','Email','ApprovedSince','SpecialNotes','Active'],
    [
      ['CUS001','ALCHEM', 'Alchemist Chemicals Pvt Ltd', '27AABCA1234A1Z5', 'Turbhe MIDC, Navi Mumbai', 'Rajesh Kumar',   '9820001111', 'rajesh@alchem.in',    '2023-01-01', '', 'Yes'],
      ['CUS002','SUNPACK','Sun Packaging Ltd',           '27BBCCS5678B2Z6', 'Taloja MIDC, Navi Mumbai',  'Priya Sharma',   '9820002222', 'priya@sunpack.co.in', '2023-06-01', '', 'Yes'],
      ['CUS003','MAHALAB','Maharashtra Lab Supplies',    '27CCCML9012C3Z7', 'Turbhe, Navi Mumbai',       'Sunil Patil',    '9820003333', 'sunil@mahalab.in',    '2024-01-01', '', 'Yes']
    ]
  );

  safeWrite('Suppliers',
    ['SupplierID','Code','Name','Category','GSTIN','Contact','Phone','Email','ApprovedStatus'],
    [
      ['SUP001','RIL',  'Reliance Industries Ltd',    'RM',        '27AAACR0541A1Z7', 'Sales Dept',   '02267891234', 'hdpe@ril.com',   'Approved'],
      ['SUP002','GAIL', 'GAIL (India) Ltd',            'RM',        '27AABCG1234B1Z5', 'Sales Dept',   '01126164000', 'hdpe@gail.in',   'Approved'],
      ['SUP003','MBCOL','Mumbai Colorants Pvt Ltd',    'MB',        '27AABCM5678C2Z3', 'Ramesh Shah',  '9820004444', 'mb@mbcol.in',   'Approved'],
      ['SUP004','CTNS', 'Navi Mumbai Cartons',          'Packaging', '27AABCN9012D3Z1', 'Vijay More',   '9820005555', 'ctns@nm.in',    'Approved']
    ]
  );

  safeWrite('Materials',
    ['material_id','name','unit','type','active'],
    [
      ['MAT001','HDPE Natural (RIL M60)',    'kg',  'RM', 'Yes'],
      ['MAT002','HDPE Black MB',             'kg',  'MB', 'Yes'],
      ['MAT003','HDPE Blue MB',              'kg',  'MB', 'Yes'],
      ['MAT004','Cartons (5L Can, 6-pack)',  'nos', 'Pkg','Yes'],
      ['MAT005','Cartons (1L Bottle, 12-pk)','nos', 'Pkg','Yes'],
      ['MAT006','Labels (5L)',               'nos', 'Pkg','Yes'],
      ['MAT007','Labels (1L)',               'nos', 'Pkg','Yes'],
      ['MAT008','Cap 38mm',                  'nos', 'Pkg','Yes'],
      ['MAT009','Cap 28mm',                  'nos', 'Pkg','Yes']
    ]
  );

  safeWrite('Equipment',
    ['EquipID','Name','Type','Location','SerialNo','Commissioned','CalibFreq','LastCalib','NextCalib','Status'],
    [
      ['EQ001','Blow Moulding Machine 1','machine','Production Floor','BM-001','2020-01-01','annual','2024-01-01','2025-01-01','Active'],
      ['EQ002','Blow Moulding Machine 2','machine','Production Floor','BM-002','2021-06-01','annual','2024-06-01','2025-06-01','Active'],
      ['EQ003','Blow Moulding Machine 3','machine','Production Floor','BM-003','2022-03-01','annual','2024-03-01','2025-03-01','Active'],
      ['EQ004','Air Compressor',         'utility','Utility Room',    'AC-001','2020-01-01','6-monthly','2024-06-01','2024-12-01','Active'],
      ['EQ005','Chiller Unit',           'utility','Utility Room',    'CH-001','2020-01-01','annual','2024-01-01','2025-01-01','Active']
    ]
  );

  safeWrite('Personnel',
    ['PersonID','Name','Username','Role','Department','ReportsTo','Phone','Email','DateJoined','Qualification','Active'],
    [
      ['P001','Tushar Patil',    'director',  'director',   'Management',  '',     '9820010001','tushar@ypp.in',   '2018-01-01','B.Com','Yes'],
      ['P002','PL Pradhan',      'qmr',       'qmr',        'Quality',     'P001', '9820010002','plp@ypp.in',      '2019-03-01','B.Sc (Chem)','Yes'],
      ['P003','Mahesh Sawant',   'supervisor','supervisor',  'Production',  'P001', '9820010003','mahesh@ypp.in',   '2019-06-01','Diploma Mech','Yes'],
      ['P004','Suresh Kamble',   'operator',  'operator',   'Production',  'P003', '9820010004','suresh@ypp.in',   '2020-01-01','ITI Fitter','Yes'],
      ['P005','Anjali Desai',    'store',     'store',      'Stores',      'P001', '9820010005','anjali@ypp.in',   '2021-06-01','B.Com','Yes'],
      ['P006','Ramesh More',     'operator',  'operator2',  'Production',  'P003', '9820010006','ramesh@ypp.in',   '2022-01-01','ITI Turner','Yes']
    ]
  );

  safeWrite('BOM',
    ['BOMID','ProductID','MaterialID','MaterialType','Qty_kg','Unit','RemarkS'],
    [
      ['BOM001','PRD001','MAT001','RM',   0.280,'kg','HDPE natural for 5L can'],
      ['BOM002','PRD001','MAT002','MB',   0.005,'kg','Black MB @ 2%'],
      ['BOM003','PRD002','MAT001','RM',   0.068,'kg','HDPE natural for 1L bottle'],
      ['BOM004','PRD002','MAT003','MB',   0.001,'kg','Blue MB @ 2%'],
      ['BOM005','PRD003','MAT001','RM',   0.022,'kg','HDPE natural for 200ml'],
      ['BOM006','PRD004','MAT001','RM',   0.014,'kg','HDPE natural for 100ml']
    ]
  );

  safeWrite('RMStock',
    ['StockID','MaterialID','SupplierID','LotNo','ReceivedDate','Qty_kg','UsedQty_kg','BalanceQty_kg','IQCRef','Location','Status'],
    [
      ['RMS001','MAT001','SUP001','LOT-RIL-2503','2025-03-10',500,120,380,'IQC001','Store A','Released'],
      ['RMS002','MAT001','SUP002','LOT-GAIL-2504','2025-04-05',300,0,300,'IQC002','Store A','Released'],
      ['RMS003','MAT002','SUP003','LOT-MB-2503','2025-03-10',50,5,45,'IQC003','Store B','Released']
    ]
  );

  safeWrite('BatchTraceability',
    ['batch_no','product_id','production_date','machine_id','operator_id','planned_qty','actual_qty','rm_lot','oqc_status','dispatch_id'],
    [
      ['YPP-B2503-001','PRD002','2025-03-15','EQ001','operator','3000',2980,'LOT-RIL-2503','OK','DIS001'],
      ['YPP-B2504-001','PRD001','2025-04-10','EQ002','operator','5000',4850,'LOT-RIL-2503','OK',''],
      ['YPP-B2505-001','PRD003','2025-05-01','EQ003','operator','2000',1980,'LOT-GAIL-2504','OK','']
    ]
  );

  // Also run existing seed functions (they are safe — skip if data exists)
  try { seedMaintenanceData(); } catch(e) { log.push('seedMaintenance error: ' + e.message); }
  try { seedProductionData();  } catch(e) { log.push('seedProduction error: ' + e.message);  }
  try { seedInventoryData();   } catch(e) { log.push('seedInventory error: ' + e.message);   }
  try { seedDispatchData();    } catch(e) { log.push('seedDispatch error: ' + e.message);    }
  try { seedPeopleData();      } catch(e) { log.push('seedPeople error: ' + e.message);      }
  try { seedComplianceData();  } catch(e) { log.push('seedCompliance error: ' + e.message);  }
  try { seedQualityData();     } catch(e) { log.push('seedQuality error: ' + e.message);     }
  try { seedFullPMSchedule();  } catch(e) { log.push('seedPM error: ' + e.message);          }

  // Invalidate all dropdown/list caches so fresh data is served immediately
  try { CacheService.getScriptCache().removeAll(['mdd_Products','mdd_Customers','mdd_Suppliers','mdd_Equipment','mdd_Personnel','mdd_Materials','mlist_Products','mlist_Customers','mlist_Suppliers','mlist_Equipment','mlist_Personnel','mlist_Materials']); } catch(e) {}

  return { success: true, log };
}

function seedAll() {
  return seedMasters();
}

// ── Schema Migration (run once from Apps Script editor) ──────────────────────

/**
 * Inserts missing columns into NCR_Log and IQC_Records sheets so that
 * existing rows align with the new headers used by saveNCR / saveIQCResult.
 *
 * Safe to run multiple times — skips columns that already exist.
 */
function migrateSchemas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = [];

  // ── NCR_Log: target 18-col schema ──────────────────────────────────────────
  const NCR_TARGET = ['ncr_id','date','batch_id','stage','department','source_nc','defect_type','severity','qty_affected','disposition','detected_by','remarks','status','capa_required','capa_trigger_reason','capa_id','created_by','created_at'];
  results.push(_migrateSheet(ss, 'NCR_Log', NCR_TARGET));

  // ── IQC_Records: target 23-col schema ──────────────────────────────────────
  const IQC_TARGET = ['iqc_id','grn_id','lot_no','material','supplier_id','invoice_no','grade_type','bag_count','bag_condition','labelling_ok','contamination','colour_match','insp_date','inspector_id','mfi_result','density_result','bulk_density','visual_result','coa_ok','decision','remarks','released_by','released_at'];
  results.push(_migrateSheet(ss, 'IQC_Records', IQC_TARGET));

  // ── CAPA_Register: target 18-col schema ────────────────────────────────────
  const CAPA_TARGET = ['capa_id','date','source','ncr_ref','description','containment_action','root_cause','root_cause_statement','corrective_action','preventive_action','responsible_id','target_date','verification_method','verification_date','lessons_learned','status','closed_date','effectiveness'];
  results.push(_migrateSheet(ss, 'CAPA_Register', CAPA_TARGET));

  results.forEach(r => Logger.log(r));
  return results;
}

function _migrateSheet(ss, sheetName, targetHeaders) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return sheetName + ': sheet not found — skipped';

  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const added = [];

  targetHeaders.forEach((col, targetIdx) => {
    const existingIdx = currentHeaders.indexOf(col);
    if (existingIdx !== -1) return; // already present

    // Insert at position targetIdx+1 (1-based), shifting right
    const insertAt = targetIdx + 1;
    sheet.insertColumnBefore(insertAt);
    sheet.getRange(1, insertAt).setValue(col);
    // Keep currentHeaders in sync for subsequent iterations
    currentHeaders.splice(targetIdx, 0, col);
    added.push(col + ' @col' + insertAt);
  });

  if (added.length === 0) return sheetName + ': already up-to-date';
  return sheetName + ': inserted ' + added.length + ' column(s) — ' + added.join(', ');
}
