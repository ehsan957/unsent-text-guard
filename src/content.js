// Unsent Text Guard: content script
// Warns before leaving a page only when the user has typed text that wasn't sent.
// Text that the page itself put in a field (value attribute, textarea content,
// or anything set by the site's JavaScript) is never counted.
(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  const host = location.hostname;
  const settings = { minChars: 20, disabledSites: [] };

  // element -> the text it contained just before the user's first keystroke
  const baselines = new Map();

  api.storage.sync.get({ minChars: 20, disabledSites: [] }).then((s) => Object.assign(settings, s));
  api.storage.onChanged.addListener((changes) => {
    for (const key in changes) if (key in settings) settings[key] = changes[key].newValue;
  });

  const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'email', 'url', 'tel']);

  // Returns the field the user is typing into, or null if it isn't a guarded field
  function fieldFrom(node) {
    if (!(node instanceof Element)) node = node && node.parentElement;
    if (!node) return null;
    if (node.tagName === 'TEXTAREA') return node;
    if (node.tagName === 'INPUT') return TEXT_INPUT_TYPES.has((node.getAttribute('type') || '').toLowerCase()) ? node : null;
    if (node.isContentEditable) {
      // climb to the editing host so the whole editor is one field
      while (node.parentElement && node.parentElement.isContentEditable) node = node.parentElement;
      return node;
    }
    return null;
  }

  const textOf = (el) => ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.innerText) || '';

  // Number of non-space characters the user added compared with the baseline
  function typedChars(before, after) {
    if (before === after) return 0;
    let p = 0;
    const max = Math.min(before.length, after.length);
    while (p < max && before[p] === after[p]) p++;
    let s = 0;
    while (s < max - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
    return after.slice(p, after.length - s).replace(/\s/g, '').length;
  }

  // Only real keystrokes, pastes, dictation etc. (trusted beforeinput events).
  // Browser autofill and values set by the page's scripts don't fire this event.
  document.addEventListener('beforeinput', (e) => {
    if (!e.isTrusted) return;
    const el = fieldFrom(e.composedPath()[0]);
    if (el && !baselines.has(el)) baselines.set(el, textOf(el));
  }, true);

  // A submitted form counts as sent
  document.addEventListener('submit', (e) => {
    const form = e.target;
    for (const el of baselines.keys()) {
      if (form.contains(el) || (el.form && el.form === form)) baselines.set(el, textOf(el));
    }
  }, true);

  function unsentFields() {
    const list = [];
    for (const [el, before] of baselines) {
      if (!el.isConnected) { baselines.delete(el); continue; }   // box was removed (e.g. message sent)
      if (el.getClientRects().length === 0) continue;             // hidden right now
      if (typedChars(before, textOf(el)) >= settings.minChars) list.push(el);
    }
    return list;
  }

  const guardOn = () => !settings.disabledSites.includes(host);

  window.addEventListener('beforeunload', (e) => {
    if (guardOn() && unsentFields().length > 0) {
      e.preventDefault();
      e.returnValue = '';   // shows the browser's own "Leave page?" dialog
    }
  }, true);

  // Status for the toolbar popup (top frame only)
  if (window === window.top) {
    api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === 'status') {
        sendResponse({ host, unsent: unsentFields().length, enabled: guardOn() });
      }
    });
  }
})();
