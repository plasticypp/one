const Nav = (() => {
  const TABS = [
    { id: 'home',    icon: '🏠', labelKey: 'nav.home',    roles: ['director','qmr','supervisor','operator','store','hr'] },
    { id: 'work',    icon: '⚙️', labelKey: 'nav.work',    roles: ['director','qmr','supervisor','operator'] },
    { id: 'stock',   icon: '📦', labelKey: 'nav.stock',   roles: ['director','qmr','supervisor','store'] },
    { id: 'profile', icon: '👤', labelKey: 'nav.profile', roles: ['director','qmr','supervisor','operator','store','hr'] }
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
