# YPP ERP — Foundation Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the deployable app shell for YPP ERP — PIN login, role-based navigation, bilingual EN/HI toggle, and Google Sheets workbook skeleton with Apps Script backend.

**Architecture:** Static HTML/CSS/JS frontend on GitHub Pages calls a single Google Apps Script web app URL stored in `config.json`. Apps Script handles all reads (doGet) and writes (doPost) to a single Google Sheets workbook "YPP-ERP" with 30 tabs covering all future modules.

**Tech Stack:** Vanilla HTML5/CSS3/ES6 (no framework, no build step), Google Apps Script (V8 runtime), Google Sheets API (via Apps Script), GitHub Pages hosting.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html` | Create | Login screen UI |
| `app.html` | Create | Main app shell post-login |
| `config.json` | Create | Apps Script URL + app version |
| `css/style.css` | Create | Mobile-first stylesheet, CSS variables, tab bar |
| `js/api.js` | Create | All fetch() calls to Apps Script; reads config.json |
| `js/auth.js` | Create | Login, logout, session read/write, 8h expiry check |
| `js/nav.js` | Create | Bottom tab bar render, routing, role-based visibility |
| `js/lang.js` | Create | Load lang JSON, apply data-i18n, toggle handler |
| `js/app.js` | Create | Home screen tiles, role-based tile rendering |
| `lang/en.json` | Create | All English UI strings |
| `lang/hi.json` | Create | All Hindi UI strings (simple spoken Hindi) |
| `modules/.gitkeep` | Create | Placeholder for future modules |
| `gas/Code.gs` | Create | Apps Script: doGet, doPost, login, hashPin, setupPins, createWorkbookSkeleton |

---

## Task 1: Project Scaffold & Config

**Files:**
- Create: `config.json`
- Create: `modules/.gitkeep`
- Create: `.gitignore`

- [ ] **Step 1: Create the repo directory structure**

```bash
mkdir -p ypp-erp/css ypp-erp/js ypp-erp/lang ypp-erp/modules ypp-erp/gas ypp-erp/docs
touch ypp-erp/modules/.gitkeep
```

- [ ] **Step 2: Create `config.json`**

```json
{
  "apiUrl": "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
  "version": "1.0.0",
  "appName": "YPP ERP",
  "sessionHours": 8
}
```

- [ ] **Step 3: Create `.gitignore`**

```
.DS_Store
Thumbs.db
*.log
```

- [ ] **Step 4: Initialize git and commit**

```bash
cd ypp-erp
git init
git add .
git commit -m "chore: project scaffold and config"
```

---

## Task 2: Language Files

**Files:**
- Create: `lang/en.json`
- Create: `lang/hi.json`

- [ ] **Step 1: Create `lang/en.json`**

```json
{
  "app.name": "Yash Poly Plast ERP",
  "login.title": "Yash Poly Plast",
  "login.subtitle": "ERP System",
  "login.username.label": "Select User",
  "login.username.placeholder": "Choose your name",
  "login.pin.label": "Enter PIN",
  "login.pin.placeholder": "4–6 digit PIN",
  "login.btn": "Login",
  "login.error.pin": "Incorrect PIN. Please try again.",
  "login.error.user": "User not found.",
  "login.error.locked": "Too many attempts. Try again in 5 minutes.",
  "login.error.inactive": "Your account is inactive. Contact admin.",
  "login.error.network": "Network error. Check your connection.",
  "nav.home": "Home",
  "nav.work": "Work",
  "nav.stock": "Stock",
  "nav.profile": "Profile",
  "home.tile.kpi": "KPI Summary",
  "home.tile.production": "Production Status",
  "home.tile.dispatch": "Dispatch Pending",
  "home.tile.capa": "CAPA Open",
  "home.tile.quality": "Quality Alerts",
  "home.tile.calibration": "Calibration Due",
  "home.tile.ncr": "NCR Open",
  "home.tile.workorders": "Active Work Orders",
  "home.tile.machines": "Machine Status",
  "home.tile.today": "Today's Production",
  "home.tile.startbatch": "Start Batch",
  "home.tile.logparams": "Log Parameters",
  "home.tile.defect": "Record Defect",
  "home.tile.mybatches": "My Batches",
  "home.tile.grn": "GRN Pending",
  "home.tile.rmstock": "RM Stock Alerts",
  "home.tile.training": "Training Due",
  "home.tile.personnel": "Personnel Records",
  "profile.title": "My Profile",
  "profile.role": "Role",
  "profile.language": "Language",
  "profile.logout": "Logout",
  "lang.en": "EN",
  "lang.hi": "HI",
  "loading": "Loading…",
  "error.session": "Session expired. Please login again.",
  "coming.soon": "Coming soon"
}
```

- [ ] **Step 2: Create `lang/hi.json`** (simple spoken Hindi — not formal)

```json
{
  "app.name": "यश पॉली प्लास्ट ERP",
  "login.title": "यश पॉली प्लास्ट",
  "login.subtitle": "ERP सिस्टम",
  "login.username.label": "यूज़र चुनें",
  "login.username.placeholder": "अपना नाम चुनें",
  "login.pin.label": "PIN डालें",
  "login.pin.placeholder": "4–6 अंक का PIN",
  "login.btn": "लॉगिन",
  "login.error.pin": "गलत PIN है। फिर कोशिश करें।",
  "login.error.user": "यूज़र नहीं मिला।",
  "login.error.locked": "बहुत बार गलत PIN। 5 मिनट बाद कोशिश करें।",
  "login.error.inactive": "अकाउंट बंद है। एडमिन से बात करें।",
  "login.error.network": "नेटवर्क की दिक्कत है। कनेक्शन चेक करें।",
  "nav.home": "होम",
  "nav.work": "काम",
  "nav.stock": "स्टॉक",
  "nav.profile": "प्रोफ़ाइल",
  "home.tile.kpi": "KPI सारांश",
  "home.tile.production": "प्रोडक्शन स्टेटस",
  "home.tile.dispatch": "डिस्पैच बाकी",
  "home.tile.capa": "CAPA खुले",
  "home.tile.quality": "क्वालिटी अलर्ट",
  "home.tile.calibration": "कैलिब्रेशन बाकी",
  "home.tile.ncr": "NCR खुले",
  "home.tile.workorders": "चालू वर्क ऑर्डर",
  "home.tile.machines": "मशीन स्टेटस",
  "home.tile.today": "आज का प्रोडक्शन",
  "home.tile.startbatch": "बैच शुरू करें",
  "home.tile.logparams": "पैरामीटर दर्ज करें",
  "home.tile.defect": "डिफेक्ट दर्ज करें",
  "home.tile.mybatches": "मेरे बैच",
  "home.tile.grn": "GRN बाकी",
  "home.tile.rmstock": "RM स्टॉक अलर्ट",
  "home.tile.training": "ट्रेनिंग बाकी",
  "home.tile.personnel": "स्टाफ रिकॉर्ड",
  "profile.title": "मेरी प्रोफ़ाइल",
  "profile.role": "रोल",
  "profile.language": "भाषा",
  "profile.logout": "लॉगआउट",
  "lang.en": "EN",
  "lang.hi": "HI",
  "loading": "लोड हो रहा है…",
  "error.session": "सेशन खत्म हो गया। फिर से लॉगिन करें।",
  "coming.soon": "जल्द आएगा"
}
```

- [ ] **Step 3: Commit**

```bash
git add lang/
git commit -m "feat: add EN and HI language string files"
```

---

## Task 3: CSS — Mobile-First Stylesheet

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: Create `css/style.css`**

```css
/* ── CSS Variables ── */
:root {
  --blue: #1565C0;
  --blue-light: #1976D2;
  --orange: #F57C00;
  --white: #FFFFFF;
  --grey-bg: #F5F5F5;
  --grey-border: #E0E0E0;
  --grey-text: #757575;
  --danger: #D32F2F;
  --success: #388E3C;
  --font: 'Segoe UI', Arial, sans-serif;
  --tab-height: 60px;
  --header-height: 56px;
  --touch-min: 44px;
  --radius: 8px;
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; }
body {
  font-family: var(--font);
  background: var(--grey-bg);
  color: #212121;
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

/* ── Header ── */
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--header-height);
  background: var(--blue);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  max-width: 600px;
  margin: 0 auto;
}
.header-title { font-size: 1.1rem; font-weight: 600; }
.header-actions { display: flex; align-items: center; gap: 12px; }

/* ── Lang Toggle ── */
.lang-toggle {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: var(--white);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  min-height: var(--touch-min);
  min-width: var(--touch-min);
}
.lang-toggle:active { background: rgba(255,255,255,0.35); }

/* ── Content Area ── */
.content {
  margin-top: var(--header-height);
  margin-bottom: var(--tab-height);
  padding: 16px;
  min-height: calc(100vh - var(--header-height) - var(--tab-height));
}

/* ── Bottom Tab Bar ── */
.tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: var(--tab-height);
  background: var(--white);
  border-top: 1px solid var(--grey-border);
  display: flex;
  z-index: 100;
  max-width: 600px;
  margin: 0 auto;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--grey-text);
  font-size: 0.7rem;
  min-height: var(--tab-height);
  transition: color 0.15s;
}
.tab-item.active { color: var(--blue); }
.tab-item .tab-icon { font-size: 1.4rem; line-height: 1; }
.tab-item.hidden { display: none; }

/* ── Home Tiles Grid ── */
.tiles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.tile {
  background: var(--white);
  border-radius: var(--radius);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  min-height: 90px;
  border: none;
  text-align: left;
  transition: box-shadow 0.15s;
}
.tile:active { box-shadow: 0 0 0 2px var(--blue); }
.tile-icon { font-size: 1.6rem; }
.tile-label { font-size: 0.85rem; font-weight: 600; color: #424242; }

/* ── Login Screen ── */
.login-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--blue);
}
.login-logo {
  color: var(--white);
  text-align: center;
  margin-bottom: 32px;
}
.login-logo h1 { font-size: 1.5rem; font-weight: 700; }
.login-logo p { font-size: 1rem; opacity: 0.85; margin-top: 4px; }
.login-card {
  background: var(--white);
  border-radius: 12px;
  padding: 28px 20px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 6px;
}
.form-group select,
.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--grey-border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: var(--font);
  background: var(--white);
  min-height: var(--touch-min);
  appearance: none;
}
.form-group select:focus,
.form-group input:focus {
  outline: 2px solid var(--blue);
  border-color: var(--blue);
}
.btn-primary {
  width: 100%;
  background: var(--blue);
  color: var(--white);
  border: none;
  border-radius: var(--radius);
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: var(--touch-min);
  font-family: var(--font);
  transition: background 0.15s;
}
.btn-primary:active { background: var(--blue-light); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.login-lang {
  text-align: right;
  margin-bottom: 20px;
}
.error-msg {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 8px;
  min-height: 20px;
}

/* ── Profile Screen ── */
.profile-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.profile-name { font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; }
.profile-meta { font-size: 0.9rem; color: var(--grey-text); }
.btn-danger {
  width: 100%;
  background: var(--danger);
  color: var(--white);
  border: none;
  border-radius: var(--radius);
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: var(--touch-min);
  font-family: var(--font);
  margin-top: 16px;
}

/* ── Spinner Overlay ── */
.spinner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.spinner-overlay.hidden { display: none; }
.spinner {
  width: 48px; height: 48px;
  border: 5px solid rgba(255,255,255,0.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Coming Soon Placeholder ── */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--grey-text);
  font-size: 1rem;
  gap: 12px;
}
.coming-soon-icon { font-size: 3rem; }

/* ── Utility ── */
.hidden { display: none !important; }
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: mobile-first stylesheet with CSS variables"
```

---

## Task 4: `js/lang.js` — Bilingual Toggle

**Files:**
- Create: `js/lang.js`

- [ ] **Step 1: Create `js/lang.js`**

```javascript
const Lang = (() => {
  let strings = {};
  let current = 'en';

  async function load(langCode) {
    const res = await fetch(`lang/${langCode}.json`);
    strings = await res.json();
    current = langCode;
    apply();
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
          el.placeholder = strings[key];
        } else {
          el.textContent = strings[key];
        }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (strings[key]) el.placeholder = strings[key];
    });
  }

  function t(key) {
    return strings[key] || key;
  }

  function getCurrent() {
    return current;
  }

  async function toggle(newLang, saveCallback) {
    await load(newLang);
    if (saveCallback) saveCallback(newLang);
  }

  async function init(langCode) {
    const lang = langCode || detectBrowserLang();
    await load(lang);
    return lang;
  }

  function detectBrowserLang() {
    const nav = navigator.language || 'en';
    return (nav.startsWith('hi') || nav.startsWith('mr')) ? 'hi' : 'en';
  }

  return { init, load, apply, t, getCurrent, toggle };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/lang.js
git commit -m "feat: bilingual lang module with data-i18n apply"
```

---

## Task 5: `js/api.js` — Backend Communication

**Files:**
- Create: `js/api.js`

- [ ] **Step 1: Create `js/api.js`**

```javascript
const Api = (() => {
  let apiUrl = '';

  async function init() {
    const res = await fetch('config.json');
    const cfg = await res.json();
    apiUrl = cfg.apiUrl;
  }

  async function get(action, params = {}) {
    const url = new URL(apiUrl);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return res.json();
  }

  async function post(action, data = {}) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });
    return res.json();
  }

  return { init, get, post };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/api.js
git commit -m "feat: api module — all backend calls via api.js"
```

---

## Task 6: `js/auth.js` — Session & Login Logic

**Files:**
- Create: `js/auth.js`

- [ ] **Step 1: Create `js/auth.js`**

```javascript
const Auth = (() => {
  const SESSION_KEY = 'ypp_session';
  const SESSION_HOURS = 8;

  function save(userData) {
    const session = {
      ...userData,
      loginTime: Date.now()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function get() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const ageHours = (Date.now() - session.loginTime) / 3600000;
    if (ageHours > SESSION_HOURS) {
      clear();
      return null;
    }
    return session;
  }

  function clear() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return get() !== null;
  }

  function requireLogin() {
    if (!isLoggedIn()) {
      window.location.href = 'index.html';
    }
  }

  async function login(username, pin) {
    const result = await Api.post('login', { username, pin });
    if (result.success) {
      save(result.data);
    }
    return result;
  }

  function logout() {
    clear();
    window.location.href = 'index.html';
  }

  return { login, logout, get, isLoggedIn, requireLogin };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/auth.js
git commit -m "feat: auth module — session management, 8h expiry"
```

---

## Task 7: `js/nav.js` — Tab Bar & Routing

**Files:**
- Create: `js/nav.js`

- [ ] **Step 1: Create `js/nav.js`**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add js/nav.js
git commit -m "feat: nav module — role-based bottom tab bar"
```

---

## Task 8: `js/app.js` — Home Screen Tiles

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create `js/app.js`**

```javascript
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
      btn.innerHTML = `<span class="tile-icon">${cfg.icon}</span><span class="tile-label" data-i18n="${cfg.labelKey}">${Lang.t(cfg.labelKey)}</span>`;
      btn.addEventListener('click', () => handleTile(id));
      grid.appendChild(btn);
    });
  }

  function handleTile(tileId) {
    // Future modules will register handlers here
    // For now, show coming soon
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
```

- [ ] **Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat: app module — role-based home tiles, lang toggle wiring"
```

---

## Task 9: `index.html` — Login Screen

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1565C0">
  <title>YPP ERP — Login</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="login-screen">
    <div class="login-logo">
      <h1 data-i18n="login.title">Yash Poly Plast</h1>
      <p data-i18n="login.subtitle">ERP System</p>
    </div>

    <div class="login-card">
      <div class="login-lang">
        <button class="lang-toggle" id="lang-toggle-login">EN</button>
      </div>

      <div class="form-group">
        <label data-i18n="login.username.label">Select User</label>
        <select id="username" aria-label="Select user">
          <option value="" data-i18n-placeholder="login.username.placeholder">Choose your name</option>
        </select>
      </div>

      <div class="form-group">
        <label data-i18n="login.pin.label">Enter PIN</label>
        <input
          type="password"
          id="pin"
          inputmode="numeric"
          maxlength="6"
          autocomplete="current-password"
          data-i18n-placeholder="login.pin.placeholder"
          placeholder="4–6 digit PIN"
        >
      </div>

      <div class="error-msg" id="error-msg" role="alert"></div>

      <button class="btn-primary" id="login-btn" data-i18n="login.btn">Login</button>
    </div>
  </div>

  <div class="spinner-overlay hidden" id="spinner">
    <div class="spinner"></div>
  </div>

  <script src="js/api.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/lang.js"></script>
  <script>
    (async () => {
      await Api.init();

      // Detect language from browser
      const browserLang = (navigator.language || 'en').startsWith('hi') || (navigator.language || '').startsWith('mr') ? 'hi' : 'en';
      await Lang.init(browserLang);

      // Lang toggle on login screen
      const langBtn = document.getElementById('lang-toggle-login');
      langBtn.textContent = browserLang.toUpperCase();
      let currentLang = browserLang;
      langBtn.addEventListener('click', async () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        await Lang.load(currentLang);
        langBtn.textContent = currentLang.toUpperCase();
      });

      // Load users for dropdown
      const spinner = document.getElementById('spinner');
      spinner.classList.remove('hidden');
      try {
        const res = await Api.get('getUsers');
        if (res.success) {
          const select = document.getElementById('username');
          res.data.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.username;
            opt.textContent = u.name;
            select.appendChild(opt);
          });
        }
      } catch (e) {
        document.getElementById('error-msg').textContent = Lang.t('login.error.network');
      } finally {
        spinner.classList.add('hidden');
      }

      // Login button
      document.getElementById('login-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const pin = document.getElementById('pin').value;
        const errorEl = document.getElementById('error-msg');
        errorEl.textContent = '';

        if (!username || !pin) return;

        spinner.classList.remove('hidden');
        document.getElementById('login-btn').disabled = true;

        try {
          const result = await Auth.login(username, pin);
          if (result.success) {
            window.location.href = 'app.html';
          } else {
            const errKey = {
              'wrong_pin': 'login.error.pin',
              'user_not_found': 'login.error.user',
              'locked': 'login.error.locked',
              'inactive': 'login.error.inactive'
            }[result.error] || 'login.error.pin';
            errorEl.textContent = Lang.t(errKey);
          }
        } catch (e) {
          errorEl.textContent = Lang.t('login.error.network');
        } finally {
          spinner.classList.add('hidden');
          document.getElementById('login-btn').disabled = false;
        }
      });

      // Allow Enter key to submit
      document.getElementById('pin').addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('login-btn').click();
      });
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: login screen — user dropdown, PIN entry, error handling"
```

---

## Task 10: `app.html` — Main App Shell

**Files:**
- Create: `app.html`

- [ ] **Step 1: Create `app.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1565C0">
  <title>YPP ERP</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Header -->
  <header class="header">
    <span class="header-title" data-i18n="app.name">YPP ERP</span>
    <div class="header-actions">
      <button class="lang-toggle" id="lang-toggle">EN</button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="content">

    <!-- Home Tab -->
    <div class="tab-content" data-tab="home">
      <div class="tiles-grid" id="home-tiles"></div>
    </div>

    <!-- Work Tab -->
    <div class="tab-content hidden" data-tab="work">
      <div class="coming-soon">
        <span class="coming-soon-icon">⚙️</span>
        <span data-i18n="coming.soon">Coming soon</span>
      </div>
    </div>

    <!-- Stock Tab -->
    <div class="tab-content hidden" data-tab="stock">
      <div class="coming-soon">
        <span class="coming-soon-icon">📦</span>
        <span data-i18n="coming.soon">Coming soon</span>
      </div>
    </div>

    <!-- Profile Tab -->
    <div class="tab-content hidden" data-tab="profile">
      <div class="profile-card">
        <div class="profile-name" id="profile-name"></div>
        <div class="profile-meta" id="profile-role"></div>
      </div>
      <button class="btn-danger" id="logout-btn" data-i18n="profile.logout">Logout</button>
    </div>

  </main>

  <!-- Bottom Tab Bar -->
  <nav class="tab-bar" id="tab-bar"></nav>

  <!-- Spinner -->
  <div class="spinner-overlay hidden" id="spinner">
    <div class="spinner"></div>
  </div>

  <script src="js/api.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/lang.js"></script>
  <script src="js/nav.js"></script>
  <script src="js/app.js"></script>
  <script>
    (async () => {
      const spinner = document.getElementById('spinner');
      spinner.classList.remove('hidden');
      try {
        await Api.init();
        await App.init();
      } finally {
        spinner.classList.add('hidden');
      }
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add app.html
git commit -m "feat: main app shell — header, tab content areas, tab bar mount"
```

---

## Task 11: `gas/Code.gs` — Apps Script Backend

**Files:**
- Create: `gas/Code.gs`

> **Note:** This file is developed locally for reference, but must be pasted into the Google Apps Script editor (script.google.com) and deployed as a web app. It cannot be deployed via git directly.

- [ ] **Step 1: Create `gas/Code.gs`**

```javascript
// ── Entry Points ────────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getUsers') return respond(getUsers());
    return respond({ success: false, error: 'unknown_action' });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  try {
    if (action === 'login')          return respond(login(data));
    if (action === 'updateLanguage') return respond(updateLanguage(data));
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
// pins = [{ username: 'tarun', pin: '1234' }, ...]
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
    // Write headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Freeze header row
    sheet.setFrozenRows(1);
    // Bold headers
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    // Hide _Meta sheet
    if (name === '_Meta') sheet.hideSheet();
  });

  // Write meta
  const meta = ss.getSheetByName('_Meta');
  meta.getRange(2, 1, 2, 2).setValues([
    ['version', '1.0.0'],
    ['created', new Date().toISOString()]
  ]);

  Logger.log('Workbook skeleton created: ' + Object.keys(SHEETS).length + ' sheets.');
}
```

- [ ] **Step 2: Commit**

```bash
git add gas/Code.gs
git commit -m "feat: Apps Script backend — login, getUsers, updateLanguage, skeleton builder"
```

---

## Task 12: Deploy Apps Script & Wire Up

> This task is manual — done in the browser. Follow these steps exactly.

- [ ] **Step 1: Create the Google Sheet**
  1. Go to [sheets.google.com](https://sheets.google.com) — create a new blank spreadsheet
  2. Name it: `YPP-ERP`
  3. Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

- [ ] **Step 2: Open Apps Script editor**
  1. In the sheet: Extensions → Apps Script
  2. Delete all default code
  3. Paste the entire contents of `gas/Code.gs`
  4. Click Save (Ctrl+S), name the project: `YPP-ERP`

- [ ] **Step 3: Run `createWorkbookSkeleton`**
  1. In the editor, select function: `createWorkbookSkeleton`
  2. Click Run — authorize when prompted (allow access to Sheets)
  3. Check execution log: should say "Workbook skeleton created: 30 sheets."
  4. Switch to the Spreadsheet — verify all tabs are present with frozen headers

- [ ] **Step 4: Add initial Users data manually**
  In the `Users` sheet, add rows for known staff (leave PINHash blank for now):
  ```
  P001 | Tarun Mishra  | tarun   |  | director | hi | TRUE | 0 |
  P002 | PL Pradhan    | pradhan |  | qmr      | hi | TRUE | 0 |
  ```

- [ ] **Step 5: Run `setupPins` to hash PINs**
  In Apps Script editor, add this temporary call at the bottom, run it once, then delete it:
  ```javascript
  function initPins() {
    setupPins([
      { username: 'tarun',   pin: '1234' },
      { username: 'pradhan', pin: '5678' }
    ]);
  }
  ```
  Select `initPins`, click Run. Check `Users` sheet — column D should now have SHA-256 hashes. Delete `initPins`.

- [ ] **Step 6: Deploy as Web App**
  1. Click Deploy → New deployment
  2. Type: Web app
  3. Execute as: **Me**
  4. Who has access: **Anyone**
  5. Click Deploy — copy the Web App URL

- [ ] **Step 7: Update `config.json`**
  Replace `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE` with the copied URL:
  ```json
  {
    "apiUrl": "https://script.google.com/macros/s/XXXXXXXXXX/exec",
    "version": "1.0.0",
    "appName": "YPP ERP",
    "sessionHours": 8
  }
  ```

- [ ] **Step 8: Commit config**

```bash
git add config.json
git commit -m "chore: wire up Apps Script URL in config.json"
```

---

## Task 13: Deploy to GitHub Pages

- [ ] **Step 1: Create GitHub repository**
  1. Go to github.com → New repository
  2. Name: `ypp-erp`
  3. Visibility: Private (recommended for business data)
  4. Do NOT initialize with README

- [ ] **Step 2: Push local repo**

```bash
git remote add origin https://github.com/YOUR_USERNAME/ypp-erp.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Enable GitHub Pages**
  1. Repository → Settings → Pages
  2. Source: Deploy from branch
  3. Branch: `main` / `/ (root)`
  4. Save — note the published URL (e.g., `https://your-username.github.io/ypp-erp/`)

- [ ] **Step 4: Verify end-to-end**
  1. Open the GitHub Pages URL on a mobile browser
  2. Login screen should load in Hindi (if device locale is hi/mr) or English
  3. Select "Tarun Mishra", enter PIN `1234` — should reach home screen
  4. Verify tiles match Director role
  5. Tap 🌐 toggle — all text should switch to Hindi instantly
  6. Logout — returns to login screen
  7. Test wrong PIN 3 times — verify lockout message appears

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: foundation module complete and deployed"
git push
```

---

## Self-Review Checklist

### Spec Coverage
- [x] Login with PIN-based auth → Tasks 6, 9, 11, 12
- [x] Role-based home screen (6 roles) → Tasks 7, 8
- [x] Bilingual EN/HI toggle (per-user preference) → Tasks 2, 4, 8
- [x] Mobile-first bottom tab navigation → Tasks 3, 7
- [x] Full Google Sheets workbook skeleton → Task 11 (`createWorkbookSkeleton`)
- [x] Apps Script backend (doGet/doPost) → Task 11
- [x] Session expires after 8 hours → Task 6
- [x] PIN lockout after 3 failures → Task 11 (`login`)
- [x] SHA-256 PIN hashing → Task 11 (`hashPin`, `setupPins`)
- [x] Language saved per user → Tasks 8, 11 (`updateLanguage`)
- [x] GitHub Pages deployment → Task 13
- [x] config.json URL pattern → Tasks 1, 5, 12

### Success Criteria Mapping
| Criterion | Task |
|-----------|------|
| Open on mobile, login, reach home | 9, 10, 12, 13 |
| Wrong PIN error in correct lang | 9, 11 |
| Lockout after 3 failures | 11 |
| Lang toggle switches all text instantly | 4, 8 |
| Lang preference persists on next login | 8, 11 |
| Role tabs and tiles correct for all 6 roles | 7, 8 |
| Session expires 8h | 6 |
| All sheet tabs created | 11, 12 |
| Apps Script deployed | 12 |
| config.json wired | 12 |
