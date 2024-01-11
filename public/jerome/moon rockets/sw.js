const version = "😜jerome/moon rockets😜"

const CACHE_NAME = "🐘" + version;

// variables de mise en tampon pour les emmissions de message vers la page HTML tant que celle-ci n'est pas ready
const messageBuffer = [];
let isReady = false;

// URL à mettre en cache initiallement
const urlsToCache = [
  "/jerome/moon rockets/",
  "/jerome/moon rockets/index.html",
  "/jerome/moon rockets/manifest.json",  
  "/jerome/moon rockets/app.js",
  "/jerome/moon rockets/app.json",  
  "/jerome/moon rockets/sw.js",
  "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/application-512.png?v=1700949025274",
  "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/application-192.png?v=1700949019501",
  "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"
];

postMessageToClients(' ###############################################################');
postMessageToClients(' # SW LOADED # -> mis en place de la gestion des évenements... #');
postMessageToClients(' ###############################################################');

// 1) install : Met en cache les URLs initiales.
self.addEventListener("install", (event) => {
  
  postMessageToClients(' 📩 INSTALL -> mise en cache des urls initiales\n' + version + ' ' + urlsToCache.join('\n' + version + ' '))
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});


// 2) activate : Supprime les anciennes versions du cache.
self.addEventListener('activate', event => {
    postMessageToClients(' 📩 ACTIVATE -> mise à jour du cache...');
    event.waitUntil(
        self.clients.claim() // Prend le contrôle immédiatement
        .then(() => {
            return caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.filter(cacheName => {
                        return cacheName !== CACHE_NAME;
                    }).map(cacheName => {
                        return caches.delete(cacheName);
                    })
                );
            });
        })
    );
});


// 3) FETCH : interception des requetes 
self.addEventListener("fetch", (event) => {
  postMessageToClients(` 📩 FETCH -> Requête interceptée pour : ${event.request.url}`);
  event.respondWith(
    fetch(event.request.clone())
      .then((response) => {
        // Si la réponse du réseau est valide, la mettre en cache.
        if (response && response.status === 200 && response.type === "basic") {
          postMessageToClients(` -> Mise à jour du fichier dans le cache : ${event.request.url}`);
          // Cloner la réponse avant de la mettre en cache.
          let responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              postMessageToClients(` -> ###ERROR### lors de la mise en cache : ${event.request.url}. Erreur : ${error}`);
            });
          return response;
        }
        // Si la réponse n'est pas valide, on utilise le cache.
        return response;
      })
      .catch(() => {
        postMessageToClients(` -> Utilisation du cache suite à une erreur réseau pour : ${event.request.url}`);
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            } else {
              // Si la ressource n'est pas dans le cache, on renvoie une erreur.
              let message = ` -> La ressource n'est pas en cache et la requête réseau a échoué pour : ${event.request.url}`
              throw Error(message);
              postMessageToClients(message)
            }
          });
      })
  );
});


// 4) RECEPTION des messages de la page HTML
self.addEventListener("message", (event) => {
  const message = event.data;
  if (message.type === "console-log" && isReady) {
    postMessageToClients(message.text);
  } else if (message.type === "ready") {
    isReady = true;
    // Envoyez les messages tamponnés
    while (messageBuffer.length > 0) {
      const bufferedMessage = messageBuffer.shift();
      postMessageToClients(bufferedMessage);
    }
  }
});

// 5) EMMISSION des messages vers la page HTML
function postMessageToClients(text) {
  // Vérifiez si le service worker est prêt
  console.log(version + text)
  if (isReady) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "console-log",
          text: version + text,
        });
      });
    });
  } else {
    // Si le service worker n'est pas prêt, tamponnez le message
    messageBuffer.push(text);    
  }
}
