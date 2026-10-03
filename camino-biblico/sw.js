const V = 'camino-v2';
const P = 'camino-'; // las dos apps comparten sitio: cada una solo limpia SUS versiones viejas
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(P) && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// La pagina: busca la version nueva (maximo 2.5 s); si no hay internet o va lenta, abre la guardada.
const fresh = req => fetch(req, { cache: 'no-cache' }).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)).catch(() => {}); } return res; });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const page = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (page) {
    e.respondWith((async () => {
      const saved = (await caches.match(req)) || (await caches.match('./index.html'));
      const net = fresh(req);
      try { e.waitUntil(net.catch(() => {})); } catch (err) {}
      if (!saved) return net;
      try { return await Promise.race([net, new Promise((_, no) => setTimeout(no, 2500))]); } catch (err) { return saved; }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});