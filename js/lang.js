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
