const Nav = (() => {
  // Lucide-style inline SVG icons (24x24 viewBox, stroke-based)
  const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    masters: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    grn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" transform="rotate(180 12 12)"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    maintenance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    compliance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    production: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
    quality: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    dispatch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  };

  const TABS = [
    { id: 'home',        labelKey: 'nav.home',        roles: ['director','qmr','supervisor','operator','store','hr'] },
    { id: 'profile',     labelKey: 'nav.profile',     roles: ['director','qmr','supervisor','operator','store','hr'] },
    { id: 'masters',     labelKey: 'nav.masters',     roles: ['director','qmr'] },
    { id: 'grn',         labelKey: 'nav.grn',         roles: ['director','qmr','store'] },
    { id: 'maintenance', labelKey: 'nav.maintenance', roles: ['director','qmr','supervisor'] },
    { id: 'compliance',  labelKey: 'nav.compliance',  roles: ['director','qmr'] },
    { id: 'production',  labelKey: 'nav.production',  roles: ['director','qmr','supervisor','operator'] },
    { id: 'quality',     labelKey: 'nav.quality',     roles: ['director','qmr','supervisor'] },
    { id: 'dispatch',    labelKey: 'nav.dispatch',    roles: ['director','qmr','supervisor','store'] }
  ];

  let activeTab = 'home';

  function render(role) {
    const bar = document.getElementById('tab-bar');
    if (!bar) return;
    bar.innerHTML = '';
    TABS.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'tab-item' + (tab.id === activeTab ? ' active' : '');
      btn.setAttribute('data-tab', tab.id);
      if (!tab.roles.includes(role)) btn.classList.add('hidden');
      const svg = ICONS[tab.id] || ICONS.home;
      btn.innerHTML = `<span class="tab-icon">${svg}</span><span data-i18n="${tab.labelKey}">${Lang.t(tab.labelKey)}</span>`;
      btn.addEventListener('click', () => switchTab(tab.id, role));
      bar.appendChild(btn);
    });
  }

  function switchTab(tabId, role) {
    if (tabId === 'masters')     { window.location.href = 'masters.html';     return; }
    if (tabId === 'grn')         { window.location.href = 'grn.html';         return; }
    if (tabId === 'maintenance') { window.location.href = 'maintenance.html'; return; }
    if (tabId === 'compliance')  { window.location.href = 'compliance.html';  return; }
    if (tabId === 'production')  { window.location.href = 'production.html';  return; }
    if (tabId === 'quality')     { window.location.href = 'quality.html';     return; }
    if (tabId === 'dispatch')    { window.location.href = 'dispatch.html';    return; }
    activeTab = tabId;
    document.querySelectorAll('.tab-item').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('hidden', c.getAttribute('data-tab') !== tabId);
    });
  }

  function init(role) {
    render(role);
    switchTab('home', role);
  }

  return { init, switchTab, render };
})();
