const api = globalThis.browser ?? globalThis.chrome;
const statusBox = document.getElementById('status');
const siteRow = document.getElementById('site-row');
const siteBox = document.getElementById('site');
const hostEl = document.getElementById('host');
const minInput = document.getElementById('min');

let currentHost = null;

async function init() {
  const s = await api.storage.sync.get({ minChars: 20, disabledSites: [] });
  minInput.value = s.minChars;

  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  let info = null;
  try { info = await api.tabs.sendMessage(tab.id, { type: 'status' }, { frameId: 0 }); } catch (_) {}

  if (!info) {
    statusBox.textContent = 'This page can\u2019t be guarded (browser pages and extension stores are protected). If you just installed the extension, reload the page.';
    return;
  }

  currentHost = info.host;
  hostEl.textContent = info.host;
  siteBox.checked = info.enabled;
  siteRow.hidden = false;
  showStatus(info);
}

function setStatus(bold, rest) {
  const b = document.createElement('b');
  b.textContent = bold;
  statusBox.replaceChildren(b, document.createTextNode(rest));
}

function showStatus(info) {
  statusBox.className = 'status';
  if (!info.enabled) {
    statusBox.textContent = 'Guard is off for this site.';
  } else if (info.unsent > 0) {
    statusBox.classList.add('warn');
    setStatus(`${info.unsent} text box${info.unsent > 1 ? 'es have' : ' has'} unsent text.`, ' You\u2019ll be asked before leaving this page.');
  } else {
    statusBox.classList.add('ok');
    setStatus('Guarding this page.', ' Nothing unsent right now.');
  }
}

siteBox.addEventListener('change', async () => {
  const { disabledSites } = await api.storage.sync.get({ disabledSites: [] });
  const list = disabledSites.filter((h) => h !== currentHost);
  if (!siteBox.checked) list.push(currentHost);
  await api.storage.sync.set({ disabledSites: list });
  setTimeout(init, 50);
});

minInput.addEventListener('change', () => {
  const n = Math.max(1, Math.min(1000, parseInt(minInput.value, 10) || 20));
  minInput.value = n;
  api.storage.sync.set({ minChars: n });
});

init();
