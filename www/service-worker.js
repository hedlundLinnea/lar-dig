// Höj versionen när filer ändras, så att alla får den nya cachen.
const CACHE = "barn-app-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./privacy.html",
  "./fonts/fredoka-latin.woff2",
  "./fonts/fredoka-latin-ext.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./sounds/lion.ogg",
  "./sounds/dog.ogg",
  "./sounds/cat.wav",
  "./sounds/pig.ogg",
  "./sounds/rooster.ogg",
  "./sounds/elephant.ogg",
  "./sounds/bear.mp3",
  "./sounds/horse.ogg",
  "./sounds/sheep.ogg"
];

self.addEventListener("install", (e) => {
  // cache: "reload" → hämta färskt från nätet, inte från webbläsarens HTTP-cache.
  // Misslyckas något installeras inte SW:n och nästa besök försöker igen
  // (bättre än en halvfylld cache som inte fungerar offline).
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ljud-element begär ofta byte-intervall (Range). Safari kräver ett 206-svar.
async function rangeResponse(request, response) {
  const buf = await response.arrayBuffer();
  const size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get("range") || "");
  let start = 0;
  let end = size - 1;
  if (m) {
    if (m[1] === "" && m[2] !== "") {
      start = Math.max(0, size - Number(m[2]));
    } else {
      start = Number(m[1] || 0);
      if (m[2] !== "") end = Math.min(Number(m[2]), size - 1);
    }
  }
  if (start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes"
    }
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // inga externa anrop görs

  // Sidladdning: servera appen från cachen (även med ?query), annars index.html offline
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match(req, { ignoreSearch: true })
        .then((cached) => cached || fetch(req))
        .catch(() => caches.match("./index.html"))
        .then((res) => res || Response.error())
    );
    return;
  }

  if (req.headers.has("range")) {
    e.respondWith(
      caches.match(req.url).then((cached) => (cached ? rangeResponse(req, cached) : fetch(req)))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    }).catch(() => Response.error())
  );
});
