editMode(true);

// utilisateur
let g_username = "unknown user";

// app
let g_currentApp = { name: "", description: "", image: "", code: "" };
let g_isAppAlreadyLoadedFromLocalStorage = false;

/////////////////////////////////////////////////////////////
// Écoutez et afficher les messages provenant du service worker
//
// Nécessite un div du type :
//   <div id="console-messages"></div>
//
document.addEventListener("DOMContentLoaded", () => {
  navigator.serviceWorker.ready.then((registration) => {
    // RECEPTION des messages du Service Worker :
    navigator.serviceWorker.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "console-log") {
        if (window.debug) displayConsoleMessage(message.text);
      }
    });
    // Envoie un message "ready" au service worker :
    registration.active.postMessage({ type: "ready" });
  });
});
//
// Écoutez et afficher les messages provenant du service worker
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// displayConsoleMessage
//
function displayConsoleMessage(...args) {
  // Récupération de l'élément du DOM où les messages seront affichés
  const consoleMessagesDiv = document.getElementById("console-messages");

  // Création de l'élément qui contiendra le message
  const messageElement = document.createElement("div");

  // Conversion de tous les arguments en chaîne de caractères
  // et gestion des objets pour éviter [object Object]
  const message = args
    .map((arg) => {
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2); // Joli format pour les objets
        } catch (error) {
          return String(arg); // Fallback en cas d'erreur dans la conversion
        }
      }
      return String(arg); // Conversion en chaîne pour les types non-objets
    })
    .join(" "); // Séparation des arguments par un espace

  // Insertion du message dans l'élément
  messageElement.innerHTML = message.replace(/\n/g, "<br>");

  consoleMessagesDiv.style.right = "0px";

  // Ajout de l'élément au DOM
  consoleMessagesDiv.appendChild(messageElement);
}
//
// displayConsoleMessage
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// editor (cm6)
//
const g_view = cm6.createEditorView(
  undefined,
  document.getElementById("editor")
);

let g_options = {
  oneDark: true
};

const g_initialState = cm6.createEditorState(
  `
        ///////////////////////////////////////////////////////
        // CONNECTEZ-VOUS AVEC LA ROUE DENTÉE EN HAUT DROITE //
        ///////////////////////////////////////////////////////

        // Pour pouvoir utiliser toutes les fonctions de zx80.app,
        // vous devez vous identifier avec un compte replit.com

        // Utilisez le bouton ⚙️ en haut à droite pour créer un
        // compte replit (si besoin) et vous connecter !

        // zx80.app utilise le système d'authentification de replit.com,
        // qui est aussi son hébergeur, et l'endroit ou zx80.app est
        // construit.

        // Si vous voulez une petite démo, appuyer sur le bouton
        // </> en bas à gauche pour exécuter le code ci-dessous.
        // Revenez ensuite ici en appuyant à nouveau sur le bouton.


        // Bienvenue dans le monde des bâtisseurs d'App !



class Example extends Phaser.Scene {
  // 1) Chargement des assets
  preload() {
    this.load.image("sky", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/space3.png?v=1703078606075");
    this.load.image("logo", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/phaser3-logo.png?v=1703078601649");
    this.load.image("red", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/red.png?v=1703078593867");
  }

  // 2) Initialisation de la scène
  create() {
    this.background = this.add.image(0, 0, "sky").setOrigin(0.5, 0.5);
    this.resizeBackground();

    const particles = this.add.particles(0, 0, "red", {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
    });

    const logo = this.physics.add.image(400, 100, "logo");
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);
    logo.setScale(0.5); // Réduit la taille de 50%

    // Configuration initiale des limites du monde physique
    this.physics.world.bounds.width = window.innerWidth;
    this.physics.world.bounds.height = window.innerHeight;

    particles.startFollow(logo);

    // met à jour les tailles
    const gameContainer = document.getElementById("gameContainer");
    const scaleX = gameContainer.offsetWidth / this.background.width;
    const scaleY = gameContainer.offsetHeight / this.background.height;
    const scale = Math.max(scaleX, scaleY);

    this.background
      .setScale(scale)
      .setPosition(
        gameContainer.offsetWidth / 2,
        gameContainer.offsetHeight / 2
      );
    // Mise à jour des limites du monde physique
    this.physics.world.setBounds(
      0,
      0,
      gameContainer.offsetWidth,
      gameContainer.offsetHeight
    );

    // Forcez une mise à jour immédiate du monde physique
    this.physics.world.step(0);
  }

  resizeBackground() {
    const gameContainer = document.getElementById("gameContainer");
    const scaleX = gameContainer.offsetWidth / this.background.width;
    const scaleY = gameContainer.offsetHeight / this.background.height;
    const scale = Math.max(scaleX, scaleY);

    this.background
      .setScale(scale)
      .setPosition(
        gameContainer.offsetWidth / 2,
        gameContainer.offsetHeight / 2
      );
  }

  resizeScene() {
    // Mise à jour des limites du monde physique
    const gameContainer = document.getElementById("gameContainer");
    this.physics.world.setBounds(
      0,
      0,
      gameContainer.offsetWidth,
      gameContainer.offsetHeight
    );

    // Forcez une mise à jour immédiate du monde physique
    this.physics.world.step(0);
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // Largeur initiale basée sur la fenêtre du navigateur
  height: window.innerHeight, // Hauteur initiale basée sur la fenêtre du navigateur
  scene: Example,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      fixedStep: false,
      //fps: 60
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE, // Active le redimensionnement automatique
    parent: "gameContainer", // Optionnel: ID de l'élément conteneur du jeu
    width: "100%", // for android 7 moto g5
    height: "100%", // idem
  },
};

const game = new Phaser.Game(config);

let resizeTimer;

setTimeout(function () {
  handleResize();
}, 500);

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    //clear()
    //print(window.innerWidth, 'xxxx', window.innerHeight)
    //game.scale.resize(window.innerWidth, window.innerHeight)

    game.scene.scenes.forEach((scene) => {
      if (scene instanceof Example) {
        scene.resizeBackground();
        scene.resizeScene();
      }
    });
  }, 250);

  // Écouter les changements de taille et d'orientation
  window.addEventListener("resize", handleResize, false);
  window.addEventListener("orientationchange", handleResize, false);
}
        `,
  g_options
);

g_view.setState(g_initialState);
//
// editor (cm6)
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// resetEditorState - Réinitialise l'état de l'éditeur
//
function resetEditorState(newCode) {
  const newState = cm6.createEditorState(newCode, g_options);
  g_view.setState(newState);
}
//
// resetEditorState - Réinitialise l'état de l'éditeur
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// saveEditorState
//
function saveEditorState() {
  const editorState = g_view.state;
  const editorContent = editorState.doc.toString();
  //const editorHistory = editorState.toJSON().history;

  localStorage.setItem("editorContent", editorContent);
  //localStorage.setItem("editorHistory", JSON.stringify(editorHistory));

  const scrollPosition = window.scrollY;
  localStorage.setItem("editorScrollPosition", scrollPosition);
}
//
// saveEditorState
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// loadEditorState
//
function loadEditorState() {
  const savedContent = localStorage.getItem("editorContent");
  resetEditorState(savedContent);

  // Restaurer la position de défilement
  const savedScrollPosition = localStorage.getItem("editorScrollPosition");
  if (savedScrollPosition) {
    window.scrollTo(0, parseInt(savedScrollPosition));
  }
}
//
// loadEditorState
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// Gestion de la taille des fonts de l'éditeur, et stockage/restitution
//
document.addEventListener("DOMContentLoaded", () => {
  // Restituer la taille de la police de l'éditeur
  const savedFontSize = localStorage.getItem("editorFontSize");
  if (savedFontSize) {
    const editorElement = document.querySelector(".cm-editor .cm-content");
    editorElement.style.fontSize = `${savedFontSize}px`;
  }
});

function changeFontSize(delta) {
  const editorElement = document.querySelector(".cm-editor .cm-content");
  const currentSize = parseInt(window.getComputedStyle(editorElement).fontSize);
  const newSize = currentSize + delta;
  editorElement.style.fontSize = `${newSize}px`;

  // Enregistrer la nouvelle taille dans localStorage
  localStorage.setItem("editorFontSize", newSize);
}
//
// changeFontSize()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// window.onload()
//
function executeAppFromUrl(code) {
  editMode(false);
  Exec(code);
}
function extracteRunInstructionsFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const executeAppId = urlParams.get("key");
  if (executeAppId) {
    // Make a fetch request to the server to get the app code using the provided ID
    fetch(`/getPublishedApp/${executeAppId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load the app.");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.code) {
          executeAppFromUrl(data.code);
        } else {
          alert("No code to execute.");
        }
      })
      .catch((error) => {
        alert("Error loading app: " + error.message);
        console.error("Error loading app:", error);
      });
  }
}

// Fonction pour mettre à jour l'icône
function setUserIconConnectionState(isUserConnected) {
  const icon = document.getElementById("userIcon");
  if (isUserConnected) {
    // Utilisateur connecté
    icon.className = "fas fa-user-alt";
    icon.style.color = "#63E6BE";
  } else {
    // Utilisateur non connecté
    icon.className = "fas fa-user-alt-slash";
    icon.style.color = "#b92d2d";
  }
}

(async function () {
  try {
    const user = await getUserInfo();
    if (user) {
      setUserIconConnectionState(true);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des informations utilisateur : ",
      error,
    );
    //setUserIconConnectionState(false)
  }
})();

window.onload = function () {
  // L'url contient-elle un code à executer ?
  extracteRunInstructionsFromUrl();

  // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
  fetch("/getUsername")
    .then((response) => response.text())
    .then((username) => {
      if (username !== "not logged in") {
        setUserIconConnectionState(true);

        g_username = username;
        localStorage.setItem("username", g_username);

        const lastEditedApp = localStorage.getItem(
          "lastEditedApp-" + g_username,
        );
        if (lastEditedApp) {
          console.log(
            `EXIST -> window.onload: lasteditedapp = ${lastEditedApp}, user = ${g_username}`,
          );
          LoadApp(g_username, lastEditedApp); // Charger l'application sélectionnée
        } else {
          console.log(
            `NOT EXIST -> window.onload: lasteditedapp = ${lastEditedApp}, user = ${g_username}`,
          );
          LoadApp(g_username, "Docs"); // Charger l'application par défaut
        }
      } else {
        setUserIconConnectionState(false);
      }
    });
};
//
// window.onload()
/////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// publish(appDeveloper, appName) - Publish the application and provide a link for execution
//
function publish(appDeveloper, appName) {
  // Retrieve the current code from the editor
  const appCode = g_view.state.doc.toString();
  // Define the settings for the payload
  const payload = {
    developer: appDeveloper,
    name: appName,
    code: appCode,
  };
  // Make a fetch POST request to publish the app and save with a unique id in the database
  fetch("/publish", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.key) {
        // Construct the app execution URL with the returned unique key
        const executionUrl = `https://zx80.app?key=${encodeURIComponent(
          data.key,
        )}`;
        // Provide feedback to the user with the execution URL
        if (navigator.share) {
          navigator
            .share({
              title: appName,
              text: "Your app is published! Use this link to execute it:",
              url: executionUrl,
            })
            .then(() => console.log("Successful share"))
            .catch((error) => console.log("Error sharing:", error));
        } else {
          // Créez un élément de texte pour afficher le lien
          const linkTextElement = document.createElement("textarea");
          linkTextElement.value = executionUrl;
          linkTextElement.setAttribute("readonly", ""); // Rendre le champ en lecture seule pour empêcher l'édition accidentelle
          linkTextElement.style.position = "absolute";
          linkTextElement.style.left = "-9999px"; // Déplacez le champ en dehors de la vue de l'utilisateur

          // Ajoutez le champ de texte à la page
          document.body.appendChild(linkTextElement);
          // Sélectionnez le texte dans le champ de texte
          linkTextElement.select();
          // Copiez le texte sélectionné dans le presse-papiers
          document.execCommand("copy");
          // Supprimez le champ de texte de la page (il n'est plus nécessaire)
          document.body.removeChild(linkTextElement);
          // Affichez un message pour informer l'utilisateur que le lien a été copié
          alert(
            `Le lien "${executionUrl}" vers votre app <${g_currentApp.name}> a été copié dans le presse-papiers.`,
          );
        }
      } else {
        // Handle any errors or issues with publishing
        alert(`Failed to publish the app: ${data.message}`);
      }
    })
    .catch((error) => {
      console.error("Error publishing the app:", error);
      alert("An error occurred while publishing the app.");
    });
}
//
// publish(appDeveloper, appName) - Publish the application and provide a link for execution
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// newProjetct clicked
//
function newProject() {
  g_currentApp.name = prompt("New Project Name :", g_currentApp.name);
  if (g_currentApp.name) {
    console.log(" newProject, currentApp.name = ", g_currentApp.name);
    localStorage.setItem("lastEditedApp-" + g_username, g_currentApp.name); // Sauvegarder le nom de l'application sélectionnée
    console.log(
      "NEW PROJECT, STORAGE = ",
      localStorage.getItem("lastEditedApp-" + g_username),
    );
    Save();
  } else {
    console.log(" BUG newProject, currentApp.name = ", g_currentApp.name);
  }
}
//
// newProjetct clicked
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// LoadApp()
//
function LoadApp(username, appname) {
  fetch(
    `/loadApp?name=${encodeURIComponent(appname)}&user=${encodeURIComponent(
      username,
    )}`,
  )
    .then((response) => response.json())
    .then((appData) => {
      //si le chargement de la page provient d'un retour de run, alors on charge le code dans le localStorage
      // Créer un objet URLSearchParams à partir de la chaîne de requête actuelle
      const urlParams = new URLSearchParams(window.location.search);
      // Récupérer la valeur du paramètre 'param'
      const monParam = urlParams.get("param");
      console.log("##### param = ", monParam);
      if (monParam && !g_isAppAlreadyLoadedFromLocalStorage) {
        console.log("🕛 BACK TO STATE ! isAppAlreadyLoadedFromLocalStorage");
        loadEditorState();
        g_isAppAlreadyLoadedFromLocalStorage = true;
      } else {
        console.log("🤓 FIRST LOAD -? isAppAlreadyLoadedFromLocalStorage");
        // Réinitialisez l'état de l'éditeur avec le nouveau code
        resetEditorState(js_beautify(appData.code, { indent_size: 2, space_in_empty_paren: true }));
      }
      g_currentApp.name = appData.name;

      localStorage.setItem("lastEditedApp-" + username, g_currentApp.name);

      console.log("LOAD => currentApp.name = ", g_currentApp.name);
    })
    .catch((error) =>
      console.log(
        "erreur lors du chargement de l'app... êtes-vous connecté ?",
        error,
      ),
    );
}
//
// LoadApp()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// </> button pressed
//
function runButtonPressed() {
  if (editMode.mode) {
    // En venant du mode édition, exécuter le code
    saveEditorState();
    editMode(false);
    Exec(g_view.state.doc.toString());
  } else {
    // En  venant du mode exécution, recharger la page avec un contrôle sur le paramètre 'param'

    // Créez un objet URL à partir de l'URL actuelle
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);

    // Vérifiez si le paramètre 'param' est déjà présent
    if (!params.has("param")) {
      params.set("param", "1"); // Ajoutez 'param=1' si ce n'est pas déjà le cas
      url.search = params.toString(); // Mettez à jour la chaîne de requête
    }

    // Rechargez la page avec la nouvelle URL (si modifiée) ou l'URL actuelle
    window.location.href = url.toString();
  }
}
//
// </> button pressed
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// askai()
//
function askai() {
  const currentCode = g_view.state.doc.toString();

  fetch('/askai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: currentCode }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.code) {
        //const code = JSON.parse(data.code).code;
        resetEditorState(data.code);
        alert('Code updated with AI suggestions.');
      } else {
        alert('AI could not generate code.');
      }
    })
    .catch((error) => {
      console.error('Error asking AI:', error);
      alert('An error occurred while processing your request.');
    });
}
//
// askai()
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
// Exec()
//
function Exec(code) {
  document.getElementById("ui").style.display = "block";

  // run !
  const script = document.createElement("script");
  script.type = "module";
  script.id = "dynamic-module-script";
  script.textContent = code;

  window.onerror = function (message, source, lineno, colno, error) {
    console.error(
      "⛑️✋ERREUR:\n",
      message,
      "\nà:\n",
      source,
      "\nligne:",
      lineno,
      "colonne:",
      colno,
    );
    alert(
      `${message}
      ${source}
      ligne ${lineno} (colonne ${colno})`,
    );
  };

  document.body.appendChild(script); // go !
}
//
// Exec()()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// editMode()
//
function editMode(isEditMode) {
  editMode.mode = isEditMode;

  const elementsToHide = [
    document.getElementById("saveButton"),
    document.getElementById("zoomInButton"),
    document.getElementById("zoomOutButton"),
    document.getElementById("settingsButton"),
    document.getElementById("loadButton"),
    document.getElementById("linkButton"),
    document.getElementById("newProjectButton"),
  ];
  if (isEditMode) {
    elementsToHide.forEach((el) => el.classList.remove("hidden"));
    document.getElementById("toolbar").style.display = "flex";
    document.getElementById("safeSpaceAboveEditor").style.display = "block";
    document.getElementById("editor").style.display = "block";
    document.getElementById("safeSpaceUnderEditor").style.display = "block";
    document.getElementById("actionButton").style.top = "auto";
    document.getElementById("actionButton").style.right = "auto";
    document.getElementById("actionButton").style.bottom = "20px";
    document.getElementById("actionButton").style.left = "20px";
  } else {
    elementsToHide.forEach((el) => el.classList.add("hidden"));
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("safeSpaceAboveEditor").style.display = "none";
    document.getElementById("editor").style.display = "none";
    document.getElementById("safeSpaceUnderEditor").style.display = "none";
    document.getElementById("actionButton").style.bottom = "auto";
    document.getElementById("actionButton").style.left = "auto";
    document.getElementById("actionButton").style.top =
      "calc( env( safe-area-inset-top ) + 10px )";
    document.getElementById("actionButton").style.right = "10px";
  }
}
//
// editMode()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// Save()
//
function Save() {
  console.log("save currentApp.name =", g_currentApp.name);
  console.log(" -> username = ", g_username);
  localStorage.setItem("lastEditedApp-" + g_username, g_currentApp.name);
  console.log(
    "SAVE, STORAGE = ",
    localStorage.getItem("lastEditedApp-" + g_username),
  );

  const settings = {
    name: g_currentApp.name,
    code: g_view.state.doc.toString(),
    user: g_username,
  };
  fetch("/save", {
    method: "POST",
    body: JSON.stringify(settings),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      alert(data);
      console.log("Save... currentApp.name = " + g_currentApp.name);
      localStorage.setItem("lastEditedApp-" + g_username, g_currentApp.name); // Sauvegarder le nom de l'application sauvegardée
      console.log(
        "SAVE, STORAGE = ",
        localStorage.getItem("lastEditedApp-" + g_username),
      );
    })
    .catch((error) => console.log("Erreur lors de la sauvegarde: " + error));
}
//
// Save()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// displayStore()
//
function displayStore() {
  fetch(`/listApps?user=${encodeURIComponent(g_username)}`)
    .then((response) => response.json())
    .then((apps) => {
      // Cacher les boutons & cm6 en mode exécution
      editMode(false);
      // Cacher le bouton actionButton
      const actionButtonElement = document.getElementById("actionButton");
      if (actionButtonElement) actionButtonElement.style.display = "none";

      const container = document.getElementById("appsList-container");
      container.style.display = "grid";
      container.innerHTML = `<h1 style="color:green;">${g_username}'s Store</h1><br>`; // Nettoie le contenu actuel du conteneur.
      apps.forEach((app) => {
        // Crée un élément div pour chaque application.
        const appDiv = document.createElement("div");
        appDiv.className = "appButton";
        appDiv.style.cursor = "pointer"; // Ajoute un curseur de pointeur pour indiquer qu'il s'agit d'un élément cliquable.
        // Ajoute un écouteur d'événements pour gérer les clics sur le bouton de l'application.
        appDiv.addEventListener("click", () => {
          const container = document.getElementById("appsList-container");
          container.style.display = "none";
          editMode(true);
          // Afficher le bouton actionButton
          const actionButtonElement = document.getElementById("actionButton");
          if (actionButtonElement) actionButtonElement.style.display = "block";
          LoadApp(g_username, app); // Appelle la fonction loadApp avec le nom de l'application.
        });
        // Ajoute le nom de l'application au div.
        appDiv.innerText = app;
        appDiv.style.textAlign = "center";
        appDiv.style.color = "#20FF20";
        appDiv.style.fontFamily = "monospace";
        appDiv.style.fontSize = "14px";
        appDiv.style.lineHeight = "1.2";
        appDiv.style.width = "100%";
        // Ajoute le div de l'application au conteneur.
        container.appendChild(appDiv);
      });
    })
    .catch((error) =>
      console.log(
        "erreur lors de la récupération des applications... êtes-vous connecté ?",
        error,
      ),
    );
}
//
// displayStore()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// UI
//
document
  .getElementById("askai")
  .addEventListener("click", () => alert("not implemented yet"));
 // .addEventListener("click", () => askai());

document
  .getElementById("actionButton")
  .addEventListener("click", () => runButtonPressed());
document
  .getElementById("saveButton")
  .addEventListener("click", () => Save());
document
  .getElementById("zoomInButton")
  .addEventListener("click", () => changeFontSize(1));
document
  .getElementById("zoomOutButton")
  .addEventListener("click", () => changeFontSize(-1));
document
  .getElementById("loadButton")
  .addEventListener("click", () => displayStore());
document
  .getElementById("settingsButton")
  .addEventListener("click", () => LoginWithReplit());
document
  .getElementById("newProjectButton")
  .addEventListener("click", () => newProject());
document
  .getElementById("linkButton")
  .addEventListener("click", () => publish(g_username, g_currentApp.name));
//
// UI
/////////////////////////////////////////////////////////
