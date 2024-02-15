// Variable pour suivre le mode actuel
let g_isEditMode = true;
switchUI(g_isEditMode);

// utilisateur
let g_username = localStorage.getItem("username");
if (!g_username) newUsername();

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
const g_view = cm6.createEditorView(undefined, document.getElementById("editor"));

let g_options = {
  oneDark: true,
};

const g_initialState = cm6.createEditorState(
  `
        ////////////////////
        // LOADING  QWARK //
        ////////////////////

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
  const lastEditedApp = localStorage.getItem("lastEditedApp-" + g_username);
  if (lastEditedApp) {
    console.log(`EXIST -> window.onload: lasteditedapp = ${lastEditedApp}, user = ${g_username}` );
    LoadApp(g_username, lastEditedApp); // Charger l'application sélectionnée
  } else {
    console.log(`NOT EXIST -> window.onload: lasteditedapp = ${lastEditedApp}, user = ${g_username}` );
    LoadApp(g_username, "Docs"); // Charger l'application par défaut
  }
};
//
// window.onload()
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// Settings clicked
//
function askUsername() {
  const newUsername = prompt("Change de Dossier Perso :", g_username);
  if (newUsername) {
    g_username = newUsername;
    localStorage.setItem("username", g_username);
    // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
    const lastEditedApp = localStorage.getItem("lastEditedApp-" + g_username);
    console.log("lasteditedapp = ", lastEditedApp);
    if (lastEditedApp) {
      LoadApp(g_username, lastEditedApp); // Charger l'application sélectionnée
    } else {
      LoadApp(g_username, "Docs"); // Charger l'application par défaut
    }
  }
}

function newUsername() {
  g_username = "";
  g_username = prompt(
    "Choisissez votre identifiant unique (par exemple votre prenom suivi d'un code à 4 chiffres, sans aucun espace) :",
    g_username
  );
  if (g_username) {
    localStorage.setItem("username", g_username);
    // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
    const lastEditedApp = localStorage.getItem("lastEditedApp-" + g_username);
    console.log("lasteditedapp = ", lastEditedApp);
    if (lastEditedApp) {
      LoadApp(g_username, lastEditedApp); // Charger l'application sélectionnée
    } else {
      LoadApp(g_username, "Docs"); // Charger l'application par défaut
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
  /*
  // Obtenez l'URL de la page courante sans les paramètres
  const currentPageURL = `${window.location.origin}/`//${window.location.pathname}`;

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
  }*/
  alert("temporairement indisponible");

}
//
// link clicked
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
      localStorage.getItem("lastEditedApp-" + g_username)
    );
    Save();
  } else {
    console.log(" BUG newProject, currentApp.name = ", g_currentApp.name);
  }
}
//
// usernameDisplay clicked
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
// LoadApp()
//
function LoadApp(username,selectedApp) {
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
      if (monParam && !g_isAppAlreadyLoadedFromLocalStorage) {
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
        g_isAppAlreadyLoadedFromLocalStorage = true;
      } else {
        console.log("🤓 FIRST LOAD -? isAppAlreadyLoadedFromLocalStorage")
        // Réinitialisez l'état de l'éditeur avec le nouveau code
        resetEditorState(appData.code);
      }
      g_currentApp.name = appData.name;
  
      localStorage.setItem("lastEditedApp-" + username, g_currentApp.name);

      console.log("LOAD => currentApp.name = ", g_currentApp.name);
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
  if (g_isEditMode) {
    // En venant du mode édition, exécuter le code
    Exec();
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
// Exec()
//
function Exec() {
  document.getElementById("ui").style.display = "block";
  console.log("🕛👍 SAVE STATE !")
  saveEditorState()

  // Cacher les boutons en mode exécution
  g_isEditMode = false;
  switchUI(g_isEditMode);

  // run !
  let code = g_view.state.doc.toString();
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
// switchUI()
//
function switchUI(isEditMode) {
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
    document.getElementById("toolbar").style.display = "flex"
    document.getElementById("safeSpaceAboveEditor").style.display = "block"
    document.getElementById("editor").style.display = "block"
    document.getElementById("safeSpaceUnderEditor").style.display = "block"
    document.getElementById("actionButton").style.top = "auto"
    document.getElementById("actionButton").style.right = "auto"
    document.getElementById("actionButton").style.bottom = "20px"
    document.getElementById("actionButton").style.left = "20px"
  
  } else {
    elementsToHide.forEach((el) => el.classList.add("hidden"));
    document.getElementById("toolbar").style.display = "none"
    document.getElementById("safeSpaceAboveEditor").style.display = "none"
    document.getElementById("editor").style.display = "none"
    document.getElementById("safeSpaceUnderEditor").style.display = "none"
    document.getElementById("actionButton").style.bottom = "auto"
    document.getElementById("actionButton").style.left = "auto"
    document.getElementById("actionButton").style.top = "calc( env( safe-area-inset-top ) + 10px )"
    document.getElementById("actionButton").style.right = "10px"
  }
}
//
// switchUI()
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
    localStorage.getItem("lastEditedApp-" + g_username)
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
        localStorage.getItem("lastEditedApp-" + g_username)
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
  fetch(`/listApps?user=${encodeURIComponent(g_username)}`)
    .then((response) => response.json())
    .then((apps) => {
      // Cacher les boutons & cm6 en mode exécution
      g_isEditMode = false
      switchUI(g_isEditMode);
      // Cacher le bouton actionButton
      const actionButtonElement = document.getElementById("actionButton");
      if (actionButtonElement) actionButtonElement.style.display = 'none';

      const container = document.getElementById("appsList-container"); 
      container.style.display = "grid"
      container.innerHTML = `<h1 style="color:green;">${g_username}'s Store</h1><br>`; // Nettoie le contenu actuel du conteneur.
      apps.forEach((app) => {
        // Crée un élément div pour chaque application.
        const appDiv = document.createElement("div");
        appDiv.className = "appButton";
        appDiv.style.cursor = "pointer"; // Ajoute un curseur de pointeur pour indiquer qu'il s'agit d'un élément cliquable.
        // Ajoute un écouteur d'événements pour gérer les clics sur le bouton de l'application.
        appDiv.addEventListener("click", () => {
          const container = document.getElementById("appsList-container"); 
          container.style.display = "none"
          g_isEditMode = true
          switchUI(true);
          // Afficher le bouton actionButton
          const actionButtonElement = document.getElementById("actionButton");
          if (actionButtonElement) actionButtonElement.style.display = 'block';
          LoadApp(g_username,app); // Appelle la fonction loadApp avec le nom de l'application.
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
