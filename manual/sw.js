const V = 'manual-v1';
const P = 'manual-'; // todas las apps comparten sitio: cada una solo limpia SUS versiones viejas
const FILES = ['./', './index.html', './icon-192.png', './img/camino-buscar.jpg', './img/camino-hoy.jpg', './img/camino-hoy-2.jpg', './img/camino-leer.jpg', './img/camino-lista.jpg', './img/camino-tarjeta.jpg', './img/camino-tarjeta-2.jpg', './img/camino-yo.jpg', './img/camino-yo-2.jpg', './img/editor-1.jpg', './img/editor-1b.jpg', './img/editor-capsula.jpg', './img/editor-fotos.jpg', './img/editor-lugar.jpg', './img/editor-miradas.jpg', './img/editor-miradas-2.jpg', './img/editor-plan.jpg', './img/editor-probamos.jpg', './img/editor-vista.jpg', './img/hub.jpg', './img/inicio.jpg', './img/inicio-2.jpg', './img/lector-capsula.jpg', './img/lector-final.jpg', './img/lector-fotos.jpg', './img/lector-lugar.jpg', './img/lector-miradas.jpg', './img/lector-portada.jpg', './img/lector-probamos.jpg', './img/libro.jpg', './img/nosotros-1.jpg', './img/nosotros-ajustes.jpg', './img/nosotros-ajustes-2.jpg', './img/nosotros-copias.jpg', './img/nosotros-guardar.jpg', './img/nosotros-insignias.jpg', './img/nosotros-juntos.jpg', './img/porvivir-1.jpg', './img/porvivir-2.jpg', './img/retos.jpg', './img/ruleta.jpg', './img/viaje-1.jpg', './img/viaje-2.jpg', './img/viaje-nuevo.jpg'];
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