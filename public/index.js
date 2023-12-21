// Variable pour suivre le mode actuel
let isEditMode = true;
setEditMode(true);

// utilisateur
let username = localStorage.getItem("username") || "";

// app
let currentApp = { name: "", description: "", image: "", code: "" };
let isAppAlreadyLoadedFromLocalStorage = false;


/////////////////////////////////////////////////////////////
// Écoutez les messages provenant du service worker
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
// Écoutez les messages provenant du service worker
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

/////////////////////////////////////////////////////////
// changeFontSize()
//
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
// DOMContentLoaded Event
//
document.addEventListener("DOMContentLoaded", () => {
  // Restituer la taille de la police de l'éditeur
  const savedFontSize = localStorage.getItem("editorFontSize");
  if (savedFontSize) {
    const editorElement = document.querySelector(".cm-editor .cm-content");
    editorElement.style.fontSize = `${savedFontSize}px`;
  }
});
//
// DOMContentLoaded Event
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// displayConsoleMessage()
//
function displayConsoleMessage(text) {
  const consoleMessagesDiv = document.getElementById("console-messages");
  const messageElement = document.createElement("div");
  // Utilisez innerHTML au lieu de textContent
  messageElement.innerHTML = text.replace(/\n/g, "<br>");
  consoleMessagesDiv.appendChild(messageElement);
}
//
// displayConsoleMessage()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// updateAppList()
//
function updateAppList(apps) {
  const appList = document.getElementById("appList");
  apps.forEach((app) => {
    const option = document.createElement("option");
    option.value = app.name;
    option.textContent = app.name;
    appList.appendChild(option);
  });
}
//
// updateAppList()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// usernameDisplay clicked
//
document
  .getElementById("usernameDisplay")
  .addEventListener("click", function () {
    username = prompt(
      "Please enter your username:",
      document.getElementById("username").textContent
    );
    if (username) {
      document.getElementById("username").textContent = username;
      localStorage.setItem("username", username);

      // Supposons que vous ayez une fonction saveUsername pour enregistrer le nom d'utilisateur
      // saveUsername(username);
    }
  });
//
// usernameDisplay clicked
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// LoadAppList()
//
function LoadAppList() {
  //return
  fetch("/listApps")
    .then((response) => response.json())
    .then((apps) => {
      const appList = document.getElementById("appList");
      appList.innerHTML = ""; // Nettoyer la liste avant de la remplir
      apps.forEach((app) => {
        const option = document.createElement("option");
        option.value = app;
        option.textContent = app;
        appList.appendChild(option);
      });
      appList.addEventListener("change", function () {
        LoadApp();
        localStorage.setItem("lastEditedApp", appList.value); // Sauvegarder le nom de l'application sélectionnée
      });
      // Sélectionner l'application qui était en cours d'édition lors du rechargement de la page
      const lastEditedApp = localStorage.getItem("lastEditedApp");
      if (lastEditedApp) {
        appList.value = lastEditedApp;
        LoadApp(); // Charger l'application sélectionnée
      } else {
        LoadApp(); // Charger l'application par défaut
      }
    })
    .catch((error) => alert("Erreur lors du chargement de la liste: " + error));
}
//
// LoadAppList()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// LoadApp()
//
function LoadApp() {
  const selectedApp = document.getElementById("appList").value;
  fetch(`/loadApp?name=${encodeURIComponent(selectedApp)}`)
    .then((response) => response.json())
    .then((appData) => {
      //si le chargement de la page provient d'un retour de run, alors on charge le code dans le localStorage
      // Créer un objet URLSearchParams à partir de la chaîne de requête actuelle
      const urlParams = new URLSearchParams(window.location.search);
      // Récupérer la valeur du paramètre 'param'
      const monParam = urlParams.get("param");
      console.log("##### param = ", monParam);
      if (monParam && !isAppAlreadyLoadedFromLocalStorage) {
        let code = localStorage.getItem("storedBeforeRun");
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
        isAppAlreadyLoadedFromLocalStorage = true;
      } else {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: appData.code,
          },
        });
      }
      currentApp.name = appData.name;
    })
    .catch((error) => alert("Erreur lors du chargement de l'app: " + error));
}
//
// LoadApp()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// window.onload()
//
// Appelez LoadAppList au chargement de la page ou à un moment approprié
window.onload = function () {
  // Reste du code onload
  LoadAppList();

  // Si un nom d'utilisateur est déjà enregistré, affichez-le
  if (username) {
    document.getElementById("username").textContent = username;
  }
};
//
// window.onload()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// runButtonPressed()
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

    //this.textContent = "Run";
    isEditMode = true;
    setEditMode(true);
  }
}
//
// runButtonPressed()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// Exec()
//
function Exec(uiId, codeId) {
  document.getElementById("ui").style.display = "block";
  let code = view.state.doc.toString();
  localStorage.setItem("storedBeforeRun", code);

  // Enregistrer la position de défilement
  const scrollPosition = window.scrollY;
  localStorage.setItem("scrollPosition", scrollPosition);

  // Cacher les boutons en mode exécution
  setEditMode(false);

  // run !
  const script = document.createElement("script");
  script.type = "module";
  script.id = "dynamic-module-script";
  script.textContent = code;

  // Ajouter le nouveau script au body
  document.body.appendChild(script);
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
    document.getElementById("appList"),
    document.getElementById("usernameDisplay"),
    document.getElementById("runButton"),
    document.getElementById("toolbar"),
  ];
  if (isEditMode) {
    elementsToHide.forEach((el) => el.classList.remove("hidden"));
    document.getElementById("actionButton").textContent = "Run";
  } else {
    elementsToHide.forEach((el) => el.classList.add("hidden"));
    document.getElementById("actionButton").textContent = "Back";
  }
}
//
// setEditMode()
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
// Save()
//
function Save() {
  console.log("save ", currentApp.name);
  console.log(" -> username = ", username);

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
      LoadAppList();
      localStorage.setItem("lastEditedApp", currentApp.name); // Sauvegarder le nom de l'application sauvegardée
    })
    .catch((error) => alert("Erreur lors de la sauvegarde: " + error));
}
//
// Save()
/////////////////////////////////////////////////////////

document
  .getElementById("actionButton")
  .addEventListener("click", runButtonPressed);
document
  .getElementById("runButton")
  .addEventListener("click", runButtonPressed);
document.getElementById("saveButton").addEventListener("click", Save);
document
  .getElementById("zoomInButton")
  .addEventListener("click", () => changeFontSize(1));
document
  .getElementById("zoomOutButton")
  .addEventListener("click", () => changeFontSize(-1));
