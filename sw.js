/* Pokéhub : fonctionne hors-ligne. Changez VERSION à chaque mise à jour de l'application. */
const VERSION = "pokehub-v2";
const ART = "pokehub-art";
const SHELL = ["./", "./index.html", "./sprites.webp", "./sprites-shiny.webp", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== ART).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {                       // application : cache d'abord
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(ch => ch.put(req, c)); return r; })));
  } else if (/\.(png|webp)$/.test(url.pathname)) {            // illustrations officielles : gardées une fois vues
    e.respondWith(caches.open(ART).then(ch => ch.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) ch.put(req, r.clone()); return r; }).catch(() => hit))));
  }
});
