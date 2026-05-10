// ── Entry Points ────────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getUsers')          return respond(getUsers());
    if (action === 'getMasterList')     return respond(getMasterList(e.parameter.entity));
    if (action === 'getMasterDropdown') return respond(getMasterDropdown(e.parameter.entity));
    return respond({ success: false, error: 'unknown_action' });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

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

function getMasterDropdown(entity) {
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
