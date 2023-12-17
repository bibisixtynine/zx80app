




//////////////////////
// phaser-myproject //
//////////////////////


class Example extends Phaser.Scene {
  // 1) Chargement des assets
  preload() {
    this.load.setBaseURL("https://labs.phaser.io");
    this.load.image("sky", "assets/skies/space3.png");
    this.load.image("logo", "assets/sprites/phaser3-logo.png");
    this.load.image("red", "assets/particles/red.png");
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
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE, // Active le redimensionnement automatique
    parent: "gameContainer", // Optionnel: ID de l'élément conteneur du jeu
    width: "200%", // for android 7 moto g5
    height: "200%", // idem
  },
};

const game = new Phaser.Game(config);

let resizeTimer;

setTimeout(function () {
  handleResize()
}, 500);

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {

    game.scene.scenes.forEach((scene) => {
      if (scene instanceof Example) {
        scene.resizeBackground();
        scene.resizeScene();
      }
    });
  }, 250);
}

// Écouter les changements de taille et d'orientation
window.addEventListener("resize", handleResize, false);
window.addEventListener("orientationchange", handleResize, false);

