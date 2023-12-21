if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(function (registration) {
      console.log("+-> (1) 😍 Service Worker registered", registration);

      // Écouter les mises à jour du service worker
      registration.addEventListener("updatefound", function () {
        let newWorker = registration.installing;
        newWorker.addEventListener("statechange", function () {
          switch (newWorker.state) {
            case "installed":
              if (navigator.serviceWorker.controller) {
                console.log(
                  "+-> (2) ✨ Nouvelle version du Service Worker disponible"
                );
                // Ici, vous pourriez notifier l'utilisateur ou rafraîchir automatiquement la page
              } else {
                console.log(
                  "+-> (2) 🎉 Service Worker installé pour la première fois"
                );
              }
              break;

            case "redundant":
              console.error(
                "!!! (-) 🆘 Le nouveau Service Worker a été rejeté"
              );
              break;
          }
        });
      });
    })
    .catch(function (error) {
      console.error(
        "!!! (-) 🆘 Service Worker registration failed",
        error
      );
    });
} else {
  console.warn("!!! (-) 🆘 Service Worker not supported in this browser");
}