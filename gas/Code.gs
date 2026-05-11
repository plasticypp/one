// ── Entry Points ────────────────────────────────────────────────────────────

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
      if (action === 'saveSO')           return respond(saveSO(data));
      if (action === 'saveDispatch')     return respond(saveDispatch(data));
    }

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

// ── Master Data CRUD ─────────────────────────────────────────────────────────

const MASTER_ENTITIES = ['Products','Customers','Suppliers','Equipment','Tooling','Spares','Personnel','BOM'];

function assertValidEntity(entity) {
  if (!MASTER_ENTITIES.includes(entity)) throw new Error('invalid_entity');
}

function getMasterList(entity) {
  assertValidEntity(entity);
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

function getMasterDropdown(entity) {
  assertValidEntity(entity);
  const sheet = getSheet(entity);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const nameCol = headers.indexOf('Name') >= 0 ? headers.indexOf('Name') : 1;
  const data = rows.slice(1)
    .filter(row => row[0])
    .map(row => ({ id: row[0], name: row[nameCol] }));
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
      return { success: true };
    }
  }
  sheet.appendRow(values);
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
      return { success: true };
    }
  }
  return { success: false, error: 'not_found' };
}

// ── Inventory ────────────────────────────────────────────────────────────────

function getGRNList(params) {
  const sheet = getSheet('GRN');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (params.supplier_id) {
    data = data.filter(r => String(r.supplier_id) === String(params.supplier_id));
  }
  return { success: true, data };
}

function saveGRN(data) {
  const sheet = getSheet('GRN');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length; // includes header
  const grnId = 'GRN' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);

  sheet.appendRow([
    grnId,
    data.date || today,
    data.supplier_id,
    data.material_id,
    data.qty_received,
    data.unit,
    data.rate,
    data.invoice_no,
    data.received_by,
    'Received'
  ]);

  updateStock(data.material_id, data.material_name, data.unit, Number(data.qty_received));
  return { success: true, grn_id: grnId };
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
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
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
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (params.status && params.status !== 'all') {
    data = data.filter(r => r.Status === params.status);
  }
  return { success: true, data };
}

function saveBreakdown(data) {
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
  const sheet = getSheet('Breakdown_Log');
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.breakdown_id)) {
      sheet.getRange(i + 1, 12).setValue('Closed');
      sheet.getRange(i + 1, 9).setValue(today);
      sheet.getRange(i + 1, 8).setValue(data.resolution);
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
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
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
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (params.status && params.status !== 'all') {
    data = data.filter(r => r.status === params.status);
  }
  return { success: true, data };
}

function saveBatch(data) {
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
  const actualQty = Number(data.actual_qty);
  if (!Number.isFinite(actualQty) || actualQty <= 0) return { success: false, error: 'invalid_qty' };
  const sheet = getSheet('BatchOrders');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.batch_id)) {
      if (rows[i][7] === 'Closed') return { success: false, error: 'already_closed' };
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
    const materialName = bomRows[i][2];
    const qtyPerUnit = Number(bomRows[i][4]) || 0;
    const deduct = qtyPerUnit * qty;

    for (let j = 1; j < stockRows.length; j++) {
      if (String(stockRows[j][1]) === String(materialName)) {
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
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
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

// ── Quality / IPQC ───────────────────────────────────────────────────────────

function getQualityChecks(params) {
  const sheet = getSheet('QualityChecks');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (params.batch_id) {
    data = data.filter(r => String(r.batch_id) === String(params.batch_id));
  }
  return { success: true, data };
}

function saveQualityCheck(data) {
  const sheet = getSheet('QualityChecks');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const checkId = 'QC' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  const specMin = Number(data.spec_min) || 0;
  const specMax = Number(data.spec_max) || 0;
  const actual  = Number(data.actual_value);
  const result  = (actual >= specMin && actual <= specMax) ? 'OK' : 'NG';
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
    data.remarks || ''
  ]);
  return { success: true, check_id: checkId };
}

function getQualitySummary() {
  const sheet = getSheet('QualityChecks');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const map = {};
  rows.slice(1).forEach(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
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
  const headers = ['check_id','batch_id','check_date','inspector_id','parameter','spec_min','spec_max','actual_value','result','remarks'];

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

// ── Dashboard ────────────────────────────────────────────────────────────────

function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // openGRNs: GRN sheet, status (col J, index 9) !== 'Closed'
  const grnRows = getSheet('GRN').getDataRange().getValues();
  const openGRNs = grnRows.slice(1).filter(r => r[9] && r[9] !== 'Closed').length;

  // activeBatches: BatchOrders sheet, status (col H, index 7) === 'Planned'
  const batchRows = getSheet('BatchOrders').getDataRange().getValues();
  const activeBatches = batchRows.slice(1).filter(r => r[7] === 'Planned').length;

  // openBreakdowns: Breakdown_Log sheet, status (col G, index 6) === 'Open'
  const bdRows = getSheet('Breakdown_Log').getDataRange().getValues();
  const openBreakdowns = bdRows.slice(1).filter(r => r[6] === 'Open').length;

  // openCapas: CAPA sheet, status (col H, index 7) === 'Open'
  const capaRows = getSheet('CAPA').getDataRange().getValues();
  const openCapas = capaRows.slice(1).filter(r => r[7] === 'Open').length;

  // overdueCompliance: LegalRegister, status (col E, index 4) !== 'Compliant' AND due_date (col D, index 3) < today
  const lrRows = getSheet('LegalRegister').getDataRange().getValues();
  const overdueCompliance = lrRows.slice(1).filter(r => {
    const status = r[4];
    const due = r[3] ? new Date(r[3]) : null;
    return status !== 'Compliant' && due && due < today;
  }).length;

  return { success: true, data: { openGRNs, activeBatches, openBreakdowns, openCapas, overdueCompliance } };
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
    '_Meta':            ['Key','Value']
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
  const sheet = getSheet('LegalRegister');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    const due = obj.due_date ? new Date(obj.due_date) : null;
    obj.overdue = due && due < today && obj.status !== 'Compliant';
    return obj;
  });
  return { success: true, data };
}

function getCapaList(params) {
  const sheet = getSheet('CAPA');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (params && params.status && params.status !== 'all') {
    data = data.filter(r => r.status === params.status);
  }
  return { success: true, data };
}

function saveCapa(data) {
  const sheet = getSheet('CAPA');
  const rows = sheet.getDataRange().getValues();
  const rowCount = rows.length;
  const capa_id = 'CAPA' + String(rowCount).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    capa_id,
    today,
    data.source || '',
    data.description || '',
    data.root_cause || '',
    data.action || '',
    data.target_date || '',
    'Open'
  ]);
  return { success: true, capa_id };
}

function updateCapaStatus(data) {
  const sheet = getSheet('CAPA');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.capa_id)) {
      sheet.getRange(i + 1, 8).setValue(data.status);
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

  safeWrite('LegalRegister',
    ['reg_id','regulation','applicability','due_date','status','last_reviewed'],
    [
      ['LR001','ISO 9001:2015','Certification','2026-03-31','Compliant','2025-03-31'],
      ['LR002','Factories Act 1948','Compliance','2026-01-31','Due Soon','2025-01-31'],
      ['LR003','PCB Consent to Operate','Environmental','2026-06-30','Compliant','2025-06-30'],
      ['LR004','BIS License (IS 7518)','Product','2026-04-30','Due Soon','2025-04-30'],
      ['LR005','Fire NOC','Safety','2026-02-28','Compliant','2025-02-28']
    ]
  );

  safeWrite('CAPA',
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
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (params.status && params.status !== 'all') {
    data = data.filter(r => r.status === params.status);
  }
  return { success: true, data };
}

function saveSO(data) {
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
  const qty = Number(data.qty);
  if (!Number.isFinite(qty) || qty <= 0) return { success: false, error: 'invalid_qty' };

  // Check available FG stock before writing anything
  const fgSheet = getSheet('FinishedGoods');
  const fgRows = fgSheet.getDataRange().getValues();
  const totalAvailable = fgRows.slice(1)
    .filter(r => String(r[2]) === String(data.product_id) && r[6] === 'Available')
    .reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
  if (totalAvailable < qty) return { success: false, error: 'insufficient_stock' };

  const dispSheet = getSheet('Dispatch');
  const dispRows = dispSheet.getDataRange().getValues();
  const rowCount = dispRows.length;
  const dispatch_id = 'DIS' + String(rowCount).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  dispSheet.appendRow([
    dispatch_id,
    data.so_id,
    data.dispatch_date || today,
    data.qty,
    data.vehicle_no || '',
    data.driver_name || '',
    data.dispatched_by || ''
  ]);

  const soSheet = getSheet('SalesOrders');
  const soRows = soSheet.getDataRange().getValues();
  for (let i = 1; i < soRows.length; i++) {
    if (String(soRows[i][0]) === String(data.so_id)) {
      const qtyOrdered    = Number(soRows[i][4]) || 0;
      const qtyDispatched = (Number(soRows[i][5]) || 0) + Number(data.qty);
      soSheet.getRange(i + 1, 6).setValue(qtyDispatched);
      const newStatus = qtyDispatched >= qtyOrdered ? 'Dispatched' : 'Partial';
      soSheet.getRange(i + 1, 7).setValue(newStatus);
      break;
    }
  }

  let remaining = Number(data.qty);
  for (let i = 1; i < fgRows.length && remaining > 0; i++) {
    if (String(fgRows[i][2]) === String(data.product_id) && fgRows[i][6] === 'Available') {
      const available = Number(fgRows[i][3]) || 0;
      if (available <= remaining) {
        fgSheet.getRange(i + 1, 4).setValue(0);
        fgSheet.getRange(i + 1, 7).setValue('Depleted');
        remaining -= available;
      } else {
        fgSheet.getRange(i + 1, 4).setValue(available - remaining);
        remaining = 0;
      }
    }
  }

  return { success: true, dispatch_id };
}

function getDispatchList(params) {
  const sheet = getSheet('Dispatch');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };
  const headers = rows[0];
  let data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
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
