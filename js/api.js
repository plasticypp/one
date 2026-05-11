const Api = (() => {
  // URL inlined — no config.json round-trip on every page load.
  // Falls back to window.YPP_API_URL if set, then to the hardcoded value.
  const API_URL = (typeof YPP_API_URL !== 'undefined' && YPP_API_URL)
    || 'https://script.google.com/macros/s/AKfycbz4yJwKiVd2r10KDEH2-Xg2BoWNmYanyYmmp5v978tLp7P-qL-IuRzT-oqcccQmMoSU/exec';

  // localStorage cache for getMasterDropdown — 1-hour TTL
  const CACHE_TTL = 60 * 60 * 1000;

  function _cacheKey(entity) { return 'ypp_mdd_' + entity; }

  function _getCached(entity) {
    try {
      const raw = localStorage.getItem(_cacheKey(entity));
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(_cacheKey(entity)); return null; }
      return data;
    } catch (_) { return null; }
  }

  function _setCache(entity, data) {
    try { localStorage.setItem(_cacheKey(entity), JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
  }

  function bustMasterCache(entity) {
    try { localStorage.removeItem(_cacheKey(entity)); } catch (_) {}
  }

  function bustAllMasterCache() {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('ypp_mdd_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (_) {}
  }

  async function init() {
    // no-op — URL already set; kept for call-site compatibility
  }

  async function get(action, params = {}) {
    // Serve getMasterDropdown from localStorage cache when available
    if (action === 'getMasterDropdown' && params.entity) {
      const cached = _getCached(params.entity);
      if (cached) return { success: true, data: cached };
    }

    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    const json = await res.json();

    if (action === 'getMasterDropdown' && params.entity && json.success) {
      _setCache(params.entity, json.data);
    }
    return json;
  }

  async function post(action, data = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('payload', JSON.stringify(data));
    const res = await fetch(url.toString());
    return res.json();
  }

  return { init, get, post, bustMasterCache, bustAllMasterCache };
})();
