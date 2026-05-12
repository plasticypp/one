const App = (() => {
  const ROLE_TILES = {
    director:   ['kpi','production','dispatch','capa','complaints','traceability'],
    qmr:        ['quality','calibration','ncr','capa','complaints','traceability'],
    supervisor: ['workorders','machines','today','traceability'],
    operator:   ['startbatch','logparams','defect','mybatches'],
    store:      ['grn','rmstock','dispatch'],
    hr:         ['training','personnel']
  };

  // SVG icons (Lucide-style, 24x24, stroke-based)
  const SVG = {
    kpi:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    production:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
    dispatch:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    capa:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    quality:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    calibration: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    ncr:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    workorders:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    machines:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
    today:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    startbatch:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    logparams:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    defect:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    mybatches:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    grn:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    rmstock:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    training:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    personnel:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    complaints:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    maintenance:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    traceability: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    compliance:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    masters:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
  };

  const TILE_CONFIG = {
    kpi:         { labelKey: 'home.tile.kpi' },
    production:  { labelKey: 'home.tile.production' },
    dispatch:    { labelKey: 'home.tile.dispatch' },
    capa:        { labelKey: 'home.tile.capa' },
    quality:     { labelKey: 'home.tile.quality' },
    calibration: { labelKey: 'home.tile.calibration' },
    ncr:         { labelKey: 'home.tile.ncr' },
    workorders:  { labelKey: 'home.tile.workorders' },
    machines:    { labelKey: 'home.tile.machines' },
    today:       { labelKey: 'home.tile.today' },
    startbatch:  { labelKey: 'home.tile.startbatch' },
    logparams:   { labelKey: 'home.tile.logparams' },
    defect:      { labelKey: 'home.tile.defect' },
    mybatches:   { labelKey: 'home.tile.mybatches' },
    grn:         { labelKey: 'home.tile.grn' },
    rmstock:     { labelKey: 'home.tile.rmstock' },
    training:    { labelKey: 'home.tile.training' },
    personnel:   { labelKey: 'home.tile.personnel' },
    complaints:   { labelKey: 'home.tile.complaints' },
    traceability: { labelKey: 'home.tile.traceability' }
  };

  // Maps tile id → stat key returned by getDashboardStats
  const TILE_STAT = {
    grn:         'openGRNs',
    production:  'activeBatches',
    mybatches:   'activeBatches',
    workorders:  'activeBatches',
    startbatch:  'activeBatches',
    capa:        'openCapas',
    ncr:         'openCapas',
    complaints:  'openComplaints',
    machines:    'openBreakdowns',
    kpi:         'overdueCompliance',
    calibration: 'overdueCalibrations',
    rmstock:     'lowStockCount',
    today:       'overduePMs'
  };

  const ROLE_STATS = {
    director:   [
      { key: 'activeBatches',     label: 'Active Batches',     mod: 'neutral' },
      { key: 'openBreakdowns',    label: 'Open Breakdowns',    mod: d => d > 0 ? 'error'  : 'ok' },
      { key: 'openCapas',         label: 'Open CAPAs',         mod: d => d > 0 ? 'warn'   : 'ok' },
      { key: 'overdueCompliance', label: 'Overdue Compliance', mod: d => d > 0 ? 'error'  : 'ok' },
      { key: 'lowStockCount',     label: 'Low Stock',          mod: d => d > 0 ? 'warn'   : 'ok' },
      { key: 'overduePMs',        label: 'Overdue PMs',        mod: d => d > 0 ? 'warn'   : 'ok' },
      { key: 'openComplaints',    label: 'Complaints',         mod: d => d > 0 ? 'error'  : 'ok' },
    ],
    qmr: [
      { key: 'openCapas',            label: 'Open CAPAs',        mod: d => d > 0 ? 'warn'  : 'ok' },
      { key: 'overdueCompliance',    label: 'Overdue Compliance', mod: d => d > 0 ? 'error' : 'ok' },
      { key: 'overdueCalibrations',  label: 'Overdue Calib.',    mod: d => d > 0 ? 'warn'  : 'ok' },
      { key: 'openComplaints',       label: 'Complaints',        mod: d => d > 0 ? 'error' : 'ok' },
    ],
    supervisor: [
      { key: 'activeBatches',  label: 'Active Batches', mod: 'neutral' },
      { key: 'openBreakdowns', label: 'Breakdowns',     mod: d => d > 0 ? 'error' : 'ok' },
      { key: 'overduePMs',     label: 'Overdue PMs',    mod: d => d > 0 ? 'warn'  : 'ok' },
    ],
    operator: [
      { key: 'activeBatches', label: 'Active Batches', mod: 'neutral' },
    ],
    store: [
      { key: 'openGRNs',      label: 'Open GRNs',  mod: d => d > 0 ? 'warn' : 'ok' },
      { key: 'lowStockCount', label: 'Low Stock',   mod: d => d > 0 ? 'warn' : 'ok' },
    ],
    hr: [],
  };

  function renderHome(role) {
    const grid = document.getElementById('home-tiles');
    if (!grid) return;
    const tileIds = ROLE_TILES[role] || [];
    grid.innerHTML = '';
    tileIds.forEach(id => {
      const cfg = TILE_CONFIG[id];
      if (!cfg) return;
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.dataset.tileId = id;
      btn.innerHTML = `<span class="tile-icon-wrap"><span class="tile-icon">${SVG[id] || SVG.kpi}</span></span><span class="tile-label" data-i18n="${cfg.labelKey}">${Lang.t(cfg.labelKey)}</span>`;
      btn.addEventListener('click', () => handleTile(id));
      grid.appendChild(btn);
    });
    loadDashboardStats(role);
  }

  async function loadDashboardStats(role) {
    try {
      const res = await Api.get('getDashboardStats');
      if (!res || !res.success) return;
      const stats = res.data;

      // Stat strip
      const statsEl = document.getElementById('home-stats');
      const defs = ROLE_STATS[role] || [];
      if (statsEl && defs.length) {
        statsEl.innerHTML = defs
          .filter(({ key }) => stats[key] != null)
          .map(({ key, label, mod }) => {
            const val = stats[key];
            const m = typeof mod === 'function' ? mod(val) : mod;
            return `<div class="home-stat-chip home-stat-chip--${m}">
              <span class="home-stat-chip-value">${val}</span>
              <span class="home-stat-chip-label">${label}</span>
            </div>`;
          }).join('');
      }

      // Tile badges
      document.querySelectorAll('#home-tiles .tile').forEach(btn => {
        const id = btn.dataset.tileId;
        const statKey = TILE_STAT[id];
        if (!statKey) return;
        const count = stats[statKey];
        if (count == null) return;
        const existing = btn.querySelector('.tile-badge');
        if (existing) existing.remove();
        if (count > 0) {
          const badge = document.createElement('span');
          badge.className = 'tile-badge';
          badge.textContent = count;
          btn.appendChild(badge);
        }
      });
    } catch (_) {}
  }

  const TILE_ROUTES = {
    grn:         'grn.html',
    rmstock:     'grn.html',
    production:  'production.html',
    startbatch:  'production.html?view=new',
    mybatches:   'production.html?view=mine',
    workorders:  'production.html?view=plan',
    today:       'production.html?view=today',
    logparams:   'production.html?view=params',
    quality:     'quality.html',
    ncr:         'ncr.html',
    defect:      'ncr.html',
    dispatch:    'dispatch.html',
    machines:    'maintenance.html',
    capa:        'compliance.html',
    calibration: 'calibration.html',
    kpi:         'kpi.html',
    training:    'people.html',
    personnel:   'people.html',
    complaints:   'complaints.html',
    traceability: 'traceability.html'
  };

  // All modules accessible from the drawer (role-independent visibility for director)
  const ALL_MODULES = [
    { id: 'production',  label: 'Production',   href: 'production.html' },
    { id: 'quality',     label: 'Quality',       href: 'quality.html' },
    { id: 'dispatch',    label: 'Dispatch',      href: 'dispatch.html' },
    { id: 'grn',         label: 'Inventory / GRN', href: 'grn.html' },
    { id: 'maintenance', label: 'Maintenance',   href: 'maintenance.html' },
    { id: 'compliance',  label: 'Compliance',    href: 'compliance.html' },
    { id: 'calibration', label: 'Calibration',   href: 'calibration.html' },
    { id: 'ncr',         label: 'NCR / Defects', href: 'ncr.html' },
    { id: 'kpi',         label: 'KPI Dashboard',        href: 'kpi.html' },
    { id: 'personnel',   label: 'People & Training',    href: 'people.html' },
    { id: 'complaints',  label: 'Customer Complaints',  href: 'complaints.html' },
    { id: 'masters',     label: 'Masters',              href: 'masters.html' },
  ];

  function handleTile(tileId) {
    const route = TILE_ROUTES[tileId];
    if (route) window.location.href = route;
  }

  function openDrawer() {
    let drawer = document.getElementById('modules-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'modules-drawer';
      drawer.className = 'modules-drawer';
      drawer.innerHTML = `
        <div class="drawer-overlay"></div>
        <div class="drawer-panel">
          <div class="drawer-header">
            <span class="drawer-title">All Modules</span>
            <button class="drawer-close" id="drawer-close-btn">✕</button>
          </div>
          <nav class="drawer-nav">
            ${ALL_MODULES.map(m => `
              <a class="drawer-item" href="${m.href}">
                <span class="drawer-item-icon">${SVG[m.id] || SVG.kpi}</span>
                <span>${m.label}</span>
              </a>`).join('')}
          </nav>
        </div>`;
      document.body.appendChild(drawer);
      drawer.querySelector('.drawer-overlay').addEventListener('click', closeDrawer);
      drawer.querySelector('#drawer-close-btn').addEventListener('click', closeDrawer);
    }
    requestAnimationFrame(() => drawer.classList.add('open'));
  }

  function closeDrawer() {
    const drawer = document.getElementById('modules-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  async function updateLangPreference(langCode) {
    const session = Auth.get();
    if (!session) return;
    await Api.post('updateLanguage', { username: session.username, lang: langCode });
  }

  async function init() {
    const session = Auth.get();
    if (!session) { Auth.requireLogin(); return; }

    await Lang.init(session.lang);
    Nav.init(session.role);
    renderHome(session.role);
    renderProfile(session);
    setupHeader(session);
  }

  function renderProfile(session) {
    const nameEl   = document.getElementById('profile-name');
    const roleEl   = document.getElementById('profile-role');
    const avatarEl = document.getElementById('profile-avatar');
    if (nameEl)   nameEl.textContent   = session.name;
    if (roleEl)   roleEl.textContent   = session.role;
    if (avatarEl) avatarEl.textContent = (session.name || '?')[0].toUpperCase();
  }

  function setupHeader(session) {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = Lang.getCurrent().toUpperCase();
      langBtn.addEventListener('click', async () => {
        const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
        await Lang.toggle(next, updateLangPreference);
        langBtn.textContent = next.toUpperCase();
        Nav.render(session.role);
        renderHome(session.role);
        renderProfile(session);
      });
    }

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) menuBtn.addEventListener('click', openDrawer);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);
  }

  return { init };
})();
