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
