




// Cible le div avec l'ID 'ui'
const uiDiv = document.getElementById('ui');

// Crée un élément img
const image = document.createElement('img');
image.src = 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/macherie.png?v=1702241829637';
image.style.width = '100%'; // Remplit le div
image.style.height = '100%';
image.style.objectFit = 'contain'; // Empêche la déformation de l'image
image.style.position = 'absolute';
image.style.transformOrigin = 'center';

// Ajoute l'image au div
uiDiv.appendChild(image);

// Fonction pour animer la rotation
let angle = 0;
function rotateImage() {
    angle += 1; // Ajustez cette valeur pour changer la vitesse de rotation
    image.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(rotateImage); // Boucle de l'animation
}

// Commence la rotation
rotateImage();