// Variable pour suivre le mode actuel
let isEditMode = true;
setEditMode(true);

// utilisateur
let username = localStorage.getItem("username");
if (!username) newUsername();

// app
let currentApp = { name: "", description: "", image: "", code: "" };
let isAppAlreadyLoadedFromLocalStorage = false;


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
const view = cm6.createEditorView(undefined, document.getElementById("editor"));

let options = {
  oneDark: true,
};

const initialState = cm6.createEditorState(
  `
        ////////////////////
        // LOADING  QWARK //
        ////////////////////

        `,
  options
);

view.setState(initialState);
//
// editor (cm6)
/////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////
// resetEditorState - Réinitialise l'état de l'éditeur
//
function resetEditorState(newCode) {
  const newState = cm6.createEditorState(newCode, options);
  view.setState(newState);
}
//
// resetEditorState - Réinitialise l'état de l'éditeur
/////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////
// saveEditorState
//
function saveEditorState() {
  const editorState = view.state;
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
  resetEditorState(savedContent)
  
  /*
  const savedHistory = JSON.parse(localStorage.getItem("editorHistory"));

  const newState = cm6.createEditorState(savedContent, {
    ...options,
    extensions: [
      // Ajoutez vos autres extensions ici
      cm6.history({ preserveItems: true }), // Active l'historique
    ],
  });

  // Appliquez l'historique sauvegardé
  if (savedHistory) {
    const transaction = newState.update({
      effects: cm6.setHistory.of(savedHistory),
    });
    view.update([transaction]);
  }

  view.setState(newState);
  */
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
window.onload = function () {
  // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
  const lastEditedApp = localStorage.getItem("lastEditedApp-" + username);
  console.log("lasteditedapp = ", lastEditedApp);
  if (lastEditedApp) {
    LoadApp(lastEditedApp); // Charger l'application sélectionnée
  } else {
    LoadApp("Docs"); // Charger l'application par défaut
  }
};
//
// window.onload()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// Settings clicked
//
function askUsername() {
  username = prompt("Change de Dossier Perso :", username);
  if (username) {
    localStorage.setItem("username", username);
    // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
    const lastEditedApp = localStorage.getItem("lastEditedApp-" + username);
    console.log("lasteditedapp = ", lastEditedApp);
    if (lastEditedApp) {
      LoadApp(lastEditedApp); // Charger l'application sélectionnée
    } else {
      LoadApp("Docs"); // Charger l'application par défaut
    }
  }
}

function newUsername() {
  username = "";
  username = prompt(
    "Choisissez votre identifiant unique (par exemple votre prenom suivi d'un code à 4 chiffres, sans aucun espace) :",
    username
  );
  if (username) {
    localStorage.setItem("username", username);
    // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
    const lastEditedApp = localStorage.getItem("lastEditedApp-" + username);
    console.log("lasteditedapp = ", lastEditedApp);
    if (lastEditedApp) {
      LoadApp(lastEditedApp); // Charger l'application sélectionnée
    } else {
      LoadApp("Docs"); // Charger l'application par défaut
    }
  } else window.location.reload(true);
}
//
// Settings clicked
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// link clicked
//
function displayAppLink() {
  // Obtenez l'URL de la page courante sans les paramètres
  const currentPageURL = `${window.location.origin}${window.location.pathname}`;

  // Obtenez le nom d'utilisateur
  const username = localStorage.getItem("username");

  // Assurez-vous que l'utilisateur a sélectionné une application valide
  if (currentApp.name) {
    // Créez l'URL du lien en remplaçant les espaces par "%20"
    const appLinkURL =
      `${currentPageURL}${username}/${currentApp.name}`.replace(/ /g, "%20");

    // Créez un élément de texte pour afficher le lien
    const linkTextElement = document.createElement("textarea");
    linkTextElement.value = appLinkURL;
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
      `Le lien vers <${currentApp.name}> a été copié dans le presse-papiers.`
    );
  } else {
    // Si aucune application n'est sélectionnée, affichez un message d'erreur
    alert("Veuillez sélectionner une application avant de générer le lien.");
  }
}
//
// link clicked
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// newProjetct clicked
//
function newProject() {
  currentApp.name = prompt("New Project Name :", currentApp.name);
  if (currentApp.name) {
    console.log(" newProject, currentApp.name = ", currentApp.name);
    localStorage.setItem("lastEditedApp-" + username, currentApp.name); // Sauvegarder le nom de l'application sélectionnée
    console.log(
      "NEW PROJECT, STORAGE = ",
      localStorage.getItem("lastEditedApp-" + username)
    );
    Save();
  } else {
    console.log(" BUG newProject, currentApp.name = ", currentApp.name);
  }
}
//
// usernameDisplay clicked
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// LoadApp()
//
function LoadApp(selectedApp) {
  fetch(
    `/loadApp?name=${encodeURIComponent(selectedApp)}&user=${encodeURIComponent(
      username
    )}`
  )
    .then((response) => response.json())
    .then((appData) => {
      //si le chargement de la page provient d'un retour de run, alors on charge le code dans le localStorage
      // Créer un objet URLSearchParams à partir de la chaîne de requête actuelle
      const urlParams = new URLSearchParams(window.location.search);
      // Récupérer la valeur du paramètre 'param'
      const monParam = urlParams.get("param");
      console.log("##### param = ", monParam);
      if (monParam && !isAppAlreadyLoadedFromLocalStorage) {
        /*let code = localStorage.getItem("storedBeforeRun");
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: code,
          },
        });
        // Restaurer la position de défilement
        const savedScrollPosition = localStorage.getItem("scrollPosition");
        if (savedScrollPosition) {
          window.scrollTo(0, parseInt(savedScrollPosition));
        }
        */
        console.log("🕛 BACK TO STATE ! isAppAlreadyLoadedFromLocalStorage")
        loadEditorState()
        isAppAlreadyLoadedFromLocalStorage = true;
      } else {
        console.log("🤓 FIRST LOAD -? isAppAlreadyLoadedFromLocalStorage")
        // Réinitialisez l'état de l'éditeur avec le nouveau code
        resetEditorState(appData.code);
      }
      currentApp.name = appData.name;
      localStorage.setItem("lastEditedApp-" + username, currentApp.name);

      console.log("LOAD => currentApp.name = ", currentApp.name);
    })
    .catch((error) => alert("Erreur lors du chargement de l'app: " + error));
}
//
// LoadApp()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// </> button pressed
//
function runButtonPressed() {
  if (isEditMode) {
    // En mode édition, exécuter le code
    Exec("ui", "code");
    //this.textContent = "Back";
    isEditMode = false;
  } else {
    // En mode exécution, recharger la page avec un contrôle sur le paramètre 'param'

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

    isEditMode = true;
    setEditMode(true);
  }
}
//
// </> button pressed
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// Exec()
//
function Exec(uiId, codeId) {
  document.getElementById("ui").style.display = "block";
  console.log("🕛👍 SAVE STATE !")
  saveEditorState()

  // Cacher les boutons en mode exécution
  setEditMode(false);

  // run !
  let code = view.state.doc.toString();
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
      colno
    );
    alert(
      `${message}
      ${source}
      ligne ${lineno} (colonne ${colno})`
    );
  };

  document.body.appendChild(script);   // go !
}
//
// Exec()()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// setEditMode()
//
function setEditMode(isEditMode) {
  const elementsToHide = [
    document.getElementById("saveButton"),
    document.getElementById("zoomInButton"),
    document.getElementById("zoomOutButton"),
    document.getElementById("settingsButton"),
    document.getElementById("loadButton"),
    document.getElementById("linkButton"),
    document.getElementById("newProjectButton"),
    document.getElementById("toolbar"),
  ];
  if (isEditMode) {
    elementsToHide.forEach((el) => el.classList.remove("hidden"));
  } else {
    elementsToHide.forEach((el) => el.classList.add("hidden"));
  }
}
//
// setEditMode()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// Save()
//
function Save() {
  console.log("save currentApp.name =", currentApp.name);
  console.log(" -> username = ", username);
  localStorage.setItem("lastEditedApp-" + username, currentApp.name);
  console.log(
    "SAVE, STORAGE = ",
    localStorage.getItem("lastEditedApp-" + username)
  );

  const settings = {
    name: currentApp.name,
    image: currentApp.image,
    description: currentApp.description,
    code: view.state.doc.toString(),
    user: username,
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
      console.log("Save... currentApp.name = " + currentApp.name);
      localStorage.setItem("lastEditedApp-" + username, currentApp.name); // Sauvegarder le nom de l'application sauvegardée
      console.log(
        "SAVE, STORAGE = ",
        localStorage.getItem("lastEditedApp-" + username)
      );
    })
    .catch((error) => alert("Erreur lors de la sauvegarde: " + error));
}
//
// Save()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// displayStore()
//
function displayStore() {
  fetch(`/listApps?user=${encodeURIComponent(username)}`)
    .then((response) => response.json())
    .then((apps) => {
      // Cacher les boutons & cm6 en mode exécution
      setEditMode(false);
      // Cacher l'editeur
      const editorElement = document.getElementById("editor");
      if (editorElement) editorElement.style.display = 'none';
      // Cacher le bouton actionButton
      const actionButtonElement = document.getElementById("actionButton");
      if (actionButtonElement) actionButtonElement.style.display = 'none';

      const container = document.querySelector(".appsList-container"); // Assurez-vous que cette classe correspond à votre conteneur HTML.
      container.innerHTML = `<h1 style="color:green;">${username}'s Store</h1><br>`; // Nettoie le contenu actuel du conteneur.
      apps.forEach((app) => {
        // Crée un élément div pour chaque application.
        const appDiv = document.createElement("div");
        appDiv.className = "appButton";
        appDiv.style.cursor = "pointer"; // Ajoute un curseur de pointeur pour indiquer qu'il s'agit d'un élément cliquable.
        // Ajoute un écouteur d'événements pour gérer les clics sur le bouton de l'application.
        appDiv.addEventListener("click", () => {
          container.innerHTML = ""; // Nettoie le contenu actuel du conteneur.
          setEditMode(true);
          // Afficher l'editeur
          const editorElement = document.getElementById("editor");
          if (editorElement) editorElement.style.display = 'block';
          // Afficher le bouton actionButton
          const actionButtonElement = document.getElementById("actionButton");
          if (actionButtonElement) actionButtonElement.style.display = 'block';
          LoadApp(app); // Appelle la fonction loadApp avec le nom de l'application.
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
    .catch((error) => alert("Erreur lors du chargement de la liste: " + error));
}
//
// displayStore()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// UI
//
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
  .addEventListener("click", () => askUsername());
document
  .getElementById("newProjectButton")
  .addEventListener("click", () => newProject());
document
  .getElementById("linkButton")
  .addEventListener("click", () => displayAppLink());
//
// UI
/////////////////////////////////////////////////////////
