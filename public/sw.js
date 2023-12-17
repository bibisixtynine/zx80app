const version = "💖"

const CACHE_NAME = "qwarky-v" + version;

// variables de mise en tampon pour les emmissions de message vers la page HTML tant que celle-ci n'est pas ready
const messageBuffer = [];
let isReady = false;

// URL à mettre en cache initiallement
const urlsToCache = [
  "/",
  "/index.html",
  "/sw.js",
  "https://qwark.glitch.me/cm6.bundle.min.js",
  "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/icon-computer-512.png?v=1700841061555",
  "https://cdn.glitch.global/7a1a98ee-e506-4952-9e03-e1100cc9f492/icon.png?v=1694288507540",
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
  // Créer un nouvel objet URL à partir de l'URL de la requête
  let url = new URL(event.request.url);

  // Utiliser URLSearchParams pour manipuler les paramètres de l'URL
  let params = new URLSearchParams(url.search);

  // Vérifier si le paramètre 'param' est présent et le supprimer
  if (params.has('param')) {
    params.delete('param');
    // Reconstruire l'URL sans le paramètre 'param'
    url.search = params.toString();
  }

  // Utiliser l'URL modifiée pour la correspondance de cache
  const urlToMatch = url.href;

  postMessageToClients(` 📩 FETCH -> Requête interceptée pour : ${urlToMatch}`);

  // Vérifie si la requête est de type POST
  if (event.request.method === 'POST') {
    // Pour les requêtes POST, simplement récupérer la réponse du réseau
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request.clone())
      .then((response) => {
        // Si la réponse du réseau est valide, la mettre en cache.
        if (response && response.status === 200 && response.type === "basic") {
          postMessageToClients(` -> Mise à jour du fichier dans le cache : ${urlToMatch}`);
          // Cloner la réponse avant de la mettre en cache.
          let responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(urlToMatch, responseToCache);
            })
            .catch((error) => {
              postMessageToClients(` -> ###ERROR### lors de la mise en cache : ${urlToMatch}. Erreur : ${error}`);
            });
          return response;
        }
        // Si la réponse n'est pas valide, on utilise le cache.
        return response;
      })
      .catch(() => {
        postMessageToClients(` -> Utilisation du cache suite à une erreur réseau pour : ${urlToMatch}`);
        // Utilise basePath pour la correspondance de cache
        return caches.match(urlToMatch)
          .then((response) => {
            if (response) {
              return response;
            } else {
              // Si la ressource n'est pas dans le cache, on renvoie une erreur.
              let message = ` -> La ressource n'est pas en cache et la requête réseau a échoué pour : ${urlToMatch}`
              postMessageToClients(message)
              throw Error(message);
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
