const App = (() => {
  const ROLE_TILES = {
    director:   ['kpi','production','dispatch','capa'],
    qmr:        ['quality','calibration','ncr','capa'],
    supervisor: ['workorders','machines','today'],
    operator:   ['startbatch','logparams','defect','mybatches'],
    store:      ['grn','rmstock','dispatch'],
    hr:         ['training','personnel']
  };

  const TILE_CONFIG = {
    kpi:         { icon: '📊', labelKey: 'home.tile.kpi' },
    production:  { icon: '🏭', labelKey: 'home.tile.production' },
    dispatch:    { icon: '🚚', labelKey: 'home.tile.dispatch' },
    capa:        { icon: '🔧', labelKey: 'home.tile.capa' },
    quality:     { icon: '✅', labelKey: 'home.tile.quality' },
    calibration: { icon: '🔬', labelKey: 'home.tile.calibration' },
    ncr:         { icon: '⚠️', labelKey: 'home.tile.ncr' },
    workorders:  { icon: '📋', labelKey: 'home.tile.workorders' },
    machines:    { icon: '⚙️', labelKey: 'home.tile.machines' },
    today:       { icon: '📈', labelKey: 'home.tile.today' },
    startbatch:  { icon: '▶️', labelKey: 'home.tile.startbatch' },
    logparams:   { icon: '📝', labelKey: 'home.tile.logparams' },
    defect:      { icon: '🔴', labelKey: 'home.tile.defect' },
    mybatches:   { icon: '📦', labelKey: 'home.tile.mybatches' },
    grn:         { icon: '📥', labelKey: 'home.tile.grn' },
    rmstock:     { icon: '🗄️', labelKey: 'home.tile.rmstock' },
    training:    { icon: '🎓', labelKey: 'home.tile.training' },
    personnel:   { icon: '👥', labelKey: 'home.tile.personnel' }
  };

  // Maps tile id → stat key returned by getDashboardStats
  const TILE_STAT = {
    grn:        'openGRNs',
    production: 'activeBatches',
    mybatches:  'activeBatches',
    capa:       'openCapas',
    machines:   'openBreakdowns',
    kpi:        'overdueCompliance'
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
      btn.innerHTML = `<span class="tile-icon">${cfg.icon}</span><span class="tile-label" data-i18n="${cfg.labelKey}">${Lang.t(cfg.labelKey)}</span>`;
      btn.addEventListener('click', () => handleTile(id));
      grid.appendChild(btn);
    });
    loadDashboardStats();
  }

  async function loadDashboardStats() {
    try {
      const res = await Api.get('getDashboardStats');
      if (!res || !res.success) return;
      const stats = res.data;
      document.querySelectorAll('#home-tiles .tile').forEach(btn => {
        const id = btn.dataset.tileId;
        const statKey = TILE_STAT[id];
        if (!statKey) return;
        const count = stats[statKey];
        if (count == null) return;
        // remove existing badge if re-rendered
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

  function handleTile(tileId) {
    alert(Lang.t('coming.soon'));
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
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    if (nameEl) nameEl.textContent = session.name;
    if (roleEl) roleEl.textContent = session.role;
  }

  function setupHeader(session) {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;
    langBtn.textContent = Lang.getCurrent().toUpperCase();
    langBtn.addEventListener('click', async () => {
      const next = Lang.getCurrent() === 'en' ? 'hi' : 'en';
      await Lang.toggle(next, updateLangPreference);
      langBtn.textContent = next.toUpperCase();
      Nav.render(session.role);
      renderHome(session.role);
      renderProfile(session);
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);
  }

  return { init };
})();
