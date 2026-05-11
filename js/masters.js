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
        { key: 'EquipID',      label: 'Equip ID',            type: 'text', readonly: true },
        { key: 'Name',         label: 'Name',                type: 'text' },
        { key: 'Type',         label: 'Type',                type: 'select', options: ['Machine','Instrument'] },
        { key: 'Location',     label: 'Location',            type: 'text' },
        { key: 'SerialNo',     label: 'Serial No',           type: 'text' },
        { key: 'Commissioned', label: 'Commissioned',        type: 'date' },
        { key: 'CalibFreq',    label: 'Calib Freq (months)', type: 'number' },
        { key: 'LastCalib',    label: 'Last Calibration',    type: 'date' },
        { key: 'NextCalib',    label: 'Next Calibration',    type: 'date' },
        { key: 'Status',       label: 'Status',              type: 'select', options: ['Active','Under Maintenance','Inactive'] }
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
        { key: 'PersonID',      label: 'Person ID',    type: 'text', readonly: true },
        { key: 'Name',          label: 'Name',         type: 'text' },
        { key: 'Username',      label: 'Username',     type: 'text' },
        { key: 'Role',          label: 'Role',         type: 'select', options: ['director','qmr','supervisor','operator','store','hr'] },
        { key: 'Department',    label: 'Department',   type: 'text' },
        { key: 'ReportsTo',     label: 'Reports To',   type: 'text' },
        { key: 'Phone',         label: 'Phone',        type: 'tel' },
        { key: 'Email',         label: 'Email',        type: 'email' },
        { key: 'DateJoined',    label: 'Date Joined',  type: 'date' },
        { key: 'Qualification', label: 'Qualification',type: 'text' },
        { key: 'Active',        label: 'Active',       type: 'select', options: ['TRUE','FALSE'] }
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
      list.innerHTML = '<div class="empty-msg">No records</div>';
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
