const version = "7"

const CACHE_NAME = "qwarky-v" + version;

const urlsToCache = [
  // Ajoutez ici les URLs initiales à mettre en cache si nécessaire
  "/index.html",
  //"/toolbox.js",
  "https://qwark.glitch.me/toolbox.js",
  "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/icon-computer-512.png?v=1700841061555",
  "https://cdn.glitch.global/7a1a98ee-e506-4952-9e03-e1100cc9f492/icon.png?v=1694288507540",
  "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"
];

console.log('👀' + version +' - sw chargé -> mis en place de la gestion des évenements...');

// 1) install : Met en cache les URLs initiales.
self.addEventListener("install", (event) => {
  console.log('👀' + version +' - install -> mise en cache des urls initiales');
  console.log('👀' + version +' -> ',urlsToCache.join(', '))
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2) activate : Supprime les anciennes versions du cache.
self.addEventListener("activate", (event) => {
  console.log('👀' + version +' - activate -> mise à jour du cache...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log('👀' + version + ` - fetch -> Requête interceptée pour : ${event.request.url}`);

  event.respondWith(
    fetch(event.request.clone())
      .then((response) => {
        // Si la réponse du réseau est valide, la mettre en cache.
        if (response && response.status === 200 && response.type === "basic") {
          console.log('👀' + version + ` -> Mise à jour du fichier dans le cache : ${event.request.url}`);
          // Cloner la réponse avant de la mettre en cache.
          let responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.error('👀' + version + ` -> Erreur lors de la mise en cache : ${event.request.url}. Erreur : ${error}`);
            });

          return response;
        }

        // Si la réponse n'est pas valide, on utilise le cache.
        return response;
      })
      .catch(() => {
        console.log('👀' + version + ` -> Utilisation du cache suite à une erreur réseau pour : ${event.request.url}`);
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            } else {
              // Si la ressource n'est pas dans le cache, on renvoie une erreur.
              throw Error('👀' + version + ` -> La ressource n'est pas en cache et la requête réseau a échoué pour : ${event.request.url}`);
            }
          });
      })
  );
});






/*
// sw.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("qwark-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/toolbox.js",
        "https://cdn.glitch.global/7a1a98ee-e506-4952-9e03-e1100cc9f492/icon.png?v=1694288507540",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
*/