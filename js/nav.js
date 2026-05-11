const Nav = (() => {
  const TABS = [
    { id: 'home',    icon: '🏠', labelKey: 'nav.home',    roles: ['director','qmr','supervisor','operator','store','hr'] },
    { id: 'work',    icon: '⚙️', labelKey: 'nav.work',    roles: ['director','qmr','supervisor','operator'] },
    { id: 'stock',   icon: '📦', labelKey: 'nav.stock',   roles: ['director','qmr','supervisor','store'] },
    { id: 'profile', icon: '👤', labelKey: 'nav.profile', roles: ['director','qmr','supervisor','operator','store','hr'] },
    { id: 'masters',     icon: '🗂️', labelKey: 'nav.masters',     roles: ['director','qmr'] },
    { id: 'grn',         icon: '📥', labelKey: 'nav.grn',         roles: ['director','qmr','store'] },
    { id: 'maintenance', icon: '🔧', labelKey: 'nav.maintenance', roles: ['director','qmr','supervisor'] },
    { id: 'compliance',  icon: '📋', labelKey: 'nav.compliance',  roles: ['director','qmr'] },
    { id: 'production',  icon: '🏭', labelKey: 'nav.production',  roles: ['director','qmr','supervisor','operator'] },
    { id: 'quality',     icon: '✅', labelKey: 'nav.quality',     roles: ['director','qmr','supervisor'] },
    { id: 'dispatch',    icon: '🚚', labelKey: 'nav.dispatch',    roles: ['director','qmr','supervisor','store'] }
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
      btn.innerHTML = `<span class="tab-icon">${tab.icon}</span><span data-i18n="${tab.labelKey}">${Lang.t(tab.labelKey)}</span>`;
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
