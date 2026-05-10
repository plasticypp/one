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
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...data })
    });
    return res.json();
  }

  return { init, get, post };
})();
