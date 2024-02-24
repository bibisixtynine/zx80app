// NOT IMPLEMENTED YET ... THESE FUNCTIONS ARE NOT USED IN THE CURRENT VERSION OF zx80.app,
// THEY ARE JUST HERE TO BE USED IN THE FUTURE.



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
        // LOADING  zx80.app //
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