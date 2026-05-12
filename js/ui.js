const UI = (() => {
  function showSpinner(show) {
    const el = document.getElementById('spinner');
    if (el) el.classList.toggle('hidden', !show);
  }

  function showToast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' toast-' + type : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  return { showSpinner, showToast };
})();
