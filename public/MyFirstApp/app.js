




////////////////
// MyFirstApp //
////////////////


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

// Variables pour l'animation
let angle = 0;
let time = 0;

function animateImage() {
    angle += 1; // Vitesse de rotation

    // Mise à jour de l'échelle en utilisant le sinus pour simuler un battement de cœur
    let scale = 0.9 + 0.1 * Math.sin(time);
    time += 0.1;

    image.style.transform = `rotate(${angle}deg) scale(${scale})`;

    requestAnimationFrame(animateImage); // Boucle de l'animation
}

// Commence l'animation
requestAnimationFrame(animateImage);
