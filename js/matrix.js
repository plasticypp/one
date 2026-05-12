const Matrix = (() => {
  let params = [];         // [{param_id, parameter, unit, type, spec_min, spec_max}]
  let periods = [];        // [{period_no, started_at, stopped_at, duration_sec, values:{}, saved}]
  let timerInterval = null;
  let timerEl = null;
  let config = {};         // {stage, batch, shift, machine, product_id}
  let onSubmit = null;     // callback after session submitted

  // ── Init ────────────────────────────────────────────────────────────────────

  async function init(cfg, submitCallback) {
    config = cfg;
    onSubmit = submitCallback;
    await Api.init();
    const res = await Api.get('getQualityParams', { stage: cfg.stage, product_id: cfg.product_id || 'ALL' });
    params = (res.success && res.data) ? res.data : [];
    if (!params.length) {
      document.getElementById('matrix-area').innerHTML = '<p style="padding:20px;color:#c62828;">No parameters found for stage: ' + cfg.stage + '. Run seedQualityParams() in GAS first.</p>';
      return;
    }
    renderTable();
    document.getElementById('btn-add-period').addEventListener('click', startPeriod);
    document.getElementById('btn-submit-session').addEventListener('click', submitSession);
  }

  // ── Table rendering ─────────────────────────────────────────────────────────

  function renderTable() {
    const area = document.getElementById('matrix-area');
    const table = document.createElement('table');
    table.className = 'matrix-table';
    table.id = 'matrix-table';

    // Header row
    const thead = table.createTHead();
    const hrow = thead.insertRow();
    hrow.insertCell().innerHTML = '<th class="param-col">Parameter</th>';
    periods.forEach((p, i) => hrow.appendChild(makePeriodHeader(p, i)));
    const addTh = document.createElement('th');
    addTh.className = 'add-col';
    addTh.id = 'th-add';
    addTh.innerHTML = timerInterval !== null ? '<span id="running-timer" style="font-size:11px;color:#EA580C;"></span>' : '';
    hrow.appendChild(addTh);
    thead.innerHTML = '';
    thead.appendChild(hrow);

    // Numeric section
    const numParams = params.filter(p => p.type === 'numeric');
    const pfParams  = params.filter(p => p.type === 'passfail');
    const tbody = table.createTBody();

    if (numParams.length) {
      const secRow = tbody.insertRow();
      const secTd = secRow.insertCell();
      secTd.colSpan = periods.length + 2;
      secTd.className = 'section-label';
      secTd.textContent = '— Numeric Parameters —';
      numParams.forEach(p => tbody.appendChild(makeParamRow(p)));
    }
    if (pfParams.length) {
      const secRow = tbody.insertRow();
      const secTd = secRow.insertCell();
      secTd.colSpan = periods.length + 2;
      secTd.className = 'section-label';
      secTd.textContent = '— Pass / Fail —';
      pfParams.forEach(p => tbody.appendChild(makeParamRow(p)));
    }

    area.innerHTML = '';
    area.appendChild(table);

    // Re-attach timer display if running
    if (timerInterval !== null) {
      timerEl = document.getElementById('running-timer');
    }
  }

  function makePeriodHeader(p, idx) {
    const th = document.createElement('th');
    th.className = 'period-col';
    const start = p.started_at ? p.started_at.slice(11, 16) : '';
    const dur = p.duration_sec ? formatDur(p.duration_sec) : '';
    const statusIcon = p.saved ? '■' : '▶';
    th.innerHTML = `<div class="period-no">Period ${p.period_no}</div>
      <div class="period-time">${start}</div>
      ${dur ? `<div class="period-dur">${statusIcon} ${dur}</div>` : ''}`;
    return th;
  }

  function makeParamRow(p) {
    const tr = document.createElement('tr');
    tr.dataset.paramId = p.param_id;

    // Label cell
    const labelTd = tr.insertCell();
    labelTd.className = 'param-label';
    labelTd.innerHTML = `<div class="param-name">${esc(p.parameter)}</div>${p.unit ? `<div class="param-unit">${esc(p.unit)}</div>` : ''}${p.type === 'numeric' && (p.spec_min !== '' || p.spec_max !== '') ? `<div class="param-spec">${p.spec_min}–${p.spec_max}</div>` : ''}`;

    // Period cells
    periods.forEach((period, pIdx) => {
      tr.appendChild(makeCell(p, period, pIdx));
    });

    // Empty trailing cell
    const emptyTd = tr.insertCell();
    emptyTd.className = 'add-col';
    return tr;
  }

  function makeCell(param, period, periodIdx) {
    const td = document.createElement('td');
    td.className = 'matrix-cell';
    td.dataset.paramId = param.param_id;
    td.dataset.periodIdx = periodIdx;
    const saved = period.saved;
    const val = period.values[param.param_id];

    if (param.type === 'numeric') {
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = 'cell-input';
      input.disabled = saved;
      if (val) {
        input.value = val.value;
        td.classList.add(val.status === 'oos' ? 'cell-oos' : 'cell-ok');
      }
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        const oos = isNaN(v) ? false : isOutOfSpec(param, v);
        td.classList.toggle('cell-oos', oos);
        td.classList.toggle('cell-ok', !isNaN(v) && !oos);
        // Show/hide action field
        let actionWrap = td.querySelector('.action-wrap');
        if (oos) {
          if (!actionWrap) {
            actionWrap = makeActionField(param.param_id, periodIdx);
            td.appendChild(actionWrap);
          }
        } else {
          if (actionWrap) actionWrap.remove();
        }
        // Save into period
        period.values[param.param_id] = { value: v, status: oos ? 'oos' : 'ok', action_taken: '' };
      });
      td.appendChild(input);
      // Action field if already oos
      if (val && val.status === 'oos') {
        const af = makeActionField(param.param_id, periodIdx);
        if (val.action_taken) af.querySelector('input').value = val.action_taken;
        td.appendChild(af);
      }
    } else {
      // Pass/Fail toggle
      const btn = document.createElement('button');
      btn.className = 'pf-btn' + (val ? (val.value === 'Fail' ? ' pf-fail' : ' pf-pass') : '');
      btn.textContent = val ? val.value : '—';
      btn.disabled = saved;
      btn.addEventListener('click', () => {
        const cur = btn.textContent;
        const next = cur === 'Pass' ? 'Fail' : 'Pass';
        btn.textContent = next;
        btn.className = 'pf-btn ' + (next === 'Fail' ? 'pf-fail' : 'pf-pass');
        const isOos = next === 'Fail';
        td.classList.toggle('cell-oos', isOos);
        td.classList.toggle('cell-ok', !isOos);
        period.values[param.param_id] = { value: next, status: isOos ? 'oos' : 'ok', action_taken: '' };
        let actionWrap = td.querySelector('.action-wrap');
        if (isOos) {
          if (!actionWrap) { actionWrap = makeActionField(param.param_id, periodIdx); td.appendChild(actionWrap); }
        } else { if (actionWrap) actionWrap.remove(); }
      });
      td.appendChild(btn);
      if (val && val.status === 'oos') {
        const af = makeActionField(param.param_id, periodIdx);
        if (val.action_taken) af.querySelector('input').value = val.action_taken;
        td.appendChild(af);
      }
    }
    return td;
  }

  function makeActionField(paramId, periodIdx) {
    const wrap = document.createElement('div');
    wrap.className = 'action-wrap';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Action taken…';
    input.className = 'action-input';
    input.addEventListener('input', () => {
      const period = periods[periodIdx];
      if (period && period.values[paramId]) {
        period.values[paramId].action_taken = input.value;
      }
    });
    wrap.appendChild(input);
    return wrap;
  }

  // ── Period management ────────────────────────────────────────────────────────

  function startPeriod() {
    if (timerInterval !== null) {
      // Stop current period
      stopPeriod();
      return;
    }
    const period = {
      period_no: periods.length + 1,
      started_at: new Date().toISOString(),
      stopped_at: null,
      duration_sec: 0,
      values: {},
      saved: false
    };
    periods.push(period);
    renderTable();

    const startMs = Date.now();
    timerEl = document.getElementById('running-timer');
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      period.duration_sec = elapsed;
      if (timerEl) timerEl.textContent = formatDur(elapsed, true);
    }, 1000);

    document.getElementById('btn-add-period').textContent = '■ Stop Period';
  }

  async function stopPeriod() {
    if (timerInterval === null) return;
    clearInterval(timerInterval);
    timerInterval = null;

    const period = periods[periods.length - 1];
    period.stopped_at = new Date().toISOString();

    // Validate: all oos cells must have action_taken
    const oosWithoutAction = [];
    params.forEach(p => {
      const v = period.values[p.param_id];
      if (v && v.status === 'oos' && !v.action_taken) {
        oosWithoutAction.push(p.parameter);
      }
    });
    if (oosWithoutAction.length) {
      alert('Fill "Action Taken" for out-of-spec parameters:\n' + oosWithoutAction.join(', '));
      // restart timer
      const startMs = Date.now() - period.duration_sec * 1000;
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000);
        period.duration_sec = elapsed;
        if (timerEl) timerEl.textContent = formatDur(elapsed, true);
      }, 1000);
      return;
    }

    // Auto-save period
    try {
      UI.showSpinner(true);
      const payload = {
        ...config,
        period_no: period.period_no,
        started_at: period.started_at,
        stopped_at: period.stopped_at,
        duration_sec: period.duration_sec,
        values: JSON.stringify(period.values),
        userId: Auth.get().id
      };
      const res = await Api.post('saveMatrixPeriod', payload);
      if (res.success) {
        period.saved = true;
        UI.showToast('Period ' + period.period_no + ' saved');
      } else {
        UI.showToast('Save failed: ' + (res.error || 'unknown'), 'error');
      }
    } catch (e) {
      UI.showToast('Save error', 'error');
    } finally {
      UI.showSpinner(false);
    }

    document.getElementById('btn-add-period').textContent = '▶ Start Period';
    renderTable();
  }

  async function submitSession() {
    if (timerInterval !== null) { UI.showToast('Stop the current period first'); return; }
    if (!periods.length) { UI.showToast('No periods recorded'); return; }
    const unsaved = periods.some(p => !p.saved);
    if (unsaved) { UI.showToast('Some periods have not been saved'); return; }

    const totalDur = periods.reduce((s, p) => s + (p.duration_sec || 0), 0);
    const oosCount = periods.reduce((s, p) => {
      return s + Object.values(p.values).filter(v => v.status === 'oos').length;
    }, 0);

    if (!confirm(`Submit session?\n${periods.length} period(s) · ${formatDur(totalDur)} · ${oosCount} out-of-spec`)) return;

    try {
      UI.showSpinner(true);
      const res = await Api.post('saveMatrixSession', {
        ...config,
        total_periods: periods.length,
        total_duration_sec: totalDur,
        oos_count: oosCount,
        submitted_at: new Date().toISOString(),
        userId: Auth.get().id
      });
      if (res.success) {
        UI.showToast('Session submitted!');
        setTimeout(() => { if (onSubmit) onSubmit(); else history.back(); }, 1200);
      } else {
        UI.showToast('Submit failed: ' + (res.error || 'unknown'), 'error');
      }
    } catch (e) {
      UI.showToast('Submit error', 'error');
    } finally {
      UI.showSpinner(false);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function isOutOfSpec(param, value) {
    const min = param.spec_min !== '' && param.spec_min !== null ? Number(param.spec_min) : null;
    const max = param.spec_max !== '' && param.spec_max !== null ? Number(param.spec_max) : null;
    if (min !== null && value < min) return true;
    if (max !== null && value > max) return true;
    return false;
  }

  function formatDur(sec, asTimer) {
    if (asTimer) {
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      return (h ? String(h).padStart(2,'0') + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + 'm ' + s + 's';
  }

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  return { init };
})();
