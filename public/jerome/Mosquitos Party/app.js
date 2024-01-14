/////////////////////
// Mosquitos Party //
/////////////////////

////////////////////////////////////////////
//
// Construisons une scène nommée "Example"
//
//  -> Phaser est le nom de la boîte à
//     outils (bào) qui va être utilisée
//
//  -> Phaser.Scene est la partie de la
//     bào qui contient des modèles de base
//     de construction de la structure
//     d'une scène... de quoi lui donner
//     la vie étape par étape !
//
class Example extends Phaser.Scene {
  // 1) Chargement des éléments
  preload() {
    this.load.image(
      "mosquito",
      "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/mosquito.png?v=1703673719846"
    );
    this.load.spritesheet(
      "boom",
      "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/kaboom.png?v=1703082254588",
      { frameWidth: 64, frameHeight: 64 }
    );
    this.load.audio("explosion", [
      "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/explosion.mp3?v=1703076948031",
    ]);
    this.load.audio("mosquito", [
      "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/mosquito-22808.mp3?v=1703709898648",
    ]);

    this.nbMosquitos = 42;
    this.nbMosquitosKilled = 0;
    this.scaleFactor = 0.3;

    this.angle = 0;
    this.angleSpeed = 0.01;
    this.speed = 1;
  }

  // 2) Mise en place
  create() {
    if (!this.soundExplosion) {
      console.log("☠️ create again");
      this.soundExplosion = this.sound.add("explosion");

      this.mosquitoSound = this.sound.add("mosquito");
      this.mosquitoSound.play({
        loop: true,
      });

      this.anims.create({
        key: "kaboom-boom",
        frames: this.anims.generateFrameNumbers("boom", { start: 0, end: 7 }),
        repeat: 0,
        frameRate: 16,
      });
    }

    this.boom = this.physics.add.sprite(100, 100, "boom");
    this.boom.setScale(1);
    this.boom.setVisible(false);
    this.boom.on("animationcomplete", () => {
      this.boom.setVisible(false);
    });

    this.mosquitos = [];

    let maxWidth = gameContainer.offsetWidth;
    let maxHeight = gameContainer.offsetHeight;

    for (let i = 0; i < this.nbMosquitos; i++) {
      this.mosquitos[i] = this.add.sprite(0, 0, "mosquito").setScale(0.1);
      this.mosquitos[i].x = Phaser.Math.Between(0, maxWidth);
      this.mosquitos[i].y = Phaser.Math.Between(0, maxHeight);
      this.mosquitos[i].setInteractive().on("pointerdown", () => {
        if (this.mosquitos[i].isDead) return;
        this.createExplosion(this.mosquitos[i].x - 12, this.mosquitos[i].y - 5);
        this.soundExplosion.play();
        this.mosquitos[i].isDead = true;
        setTimeout(() => {
          this.mosquitos[i].destroy();
          this.nbMosquitosKilled += 1;
        }, 300);
      });
    }
  }

  // 3) Animation... exécutée au moins 30 fois par seconde,
  //    autrement dit à 30Hz 😛
  update() {
    this.angle += this.angleSpeed;
    let maxWidth = gameContainer.offsetWidth;
    let maxHeight = gameContainer.offsetHeight;
    this.mosquitos.forEach((mosquito) => {
      mosquito.x +=
        Phaser.Math.Between(-5, 5) + Math.cos(this.angle) * this.speed;
      mosquito.y +=
        Phaser.Math.Between(-5, 5) + Math.sin(this.angle) * this.speed;
      mosquito.setScale((0.08 + Math.random() / 7) * this.scaleFactor);
      const mx = mosquito.x;
      const my = mosquito.y;
      if (mx > maxWidth) mosquito.x -= maxWidth;
      if (mx < 0) mosquito.x += maxWidth;
      if (my > maxHeight) mosquito.y -= maxHeight;
      if (my < 0) mosquito.y += maxHeight;
    });

    if (this.nbMosquitosKilled == this.nbMosquitos) this.gameOver();
  }

  // 💣 Créer une explosion
  createExplosion(x, y) {
    // BOOM ! On montre une explosion ici.
    this.boom.setPosition(x, y);
    this.boom.setVisible(true);
    this.boom.play("kaboom-boom");
  }

  // 🎮 Game Over !
  gameOver() {
    // Affiche "Game Over" et comment recommencer.
    let centerX = this.cameras.main.width / 2;
    let centerY = this.cameras.main.height / 2;

    let gameOverText = this.add.text(
      centerX,
      centerY,
      this.nbMosquitos + " mosquitos 💥",
      { fontSize: "24px", fill: "#fff" }
    );
    gameOverText.setOrigin(0.5, 0.5); // Centre le texte par rapport à son point d'ancrage

    this.mosquitoSound.pause();
    this.scene.pause();
    setTimeout(() => {
      this.nbMosquitosKilled = 0;
      this.mosquitoSound.play();
      this.scene.restart();
    }, 3000);
  }
}
// Example
////////////////////////////////////////////


////////////////////////////////////////////
//
// Lancement du jeu !
//
// 1) Paramètres de Configuration :
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // Largeur initiale basée sur la fenêtre du navigateur
  height: window.innerHeight, // Hauteur initiale basée sur la fenêtre du navigateur
  scene: Example,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE, // Active le redimensionnement automatique
    autoCentre: Phaser.Scale.CENTER,
    parent: "gameContainer", // Optionnel: ID de l'élément conteneur du jeu
    width: "100%",
    height: "100%",
  },
};
// 2) Lancement du Jeu 💫🤩🚀 !
const game = new Phaser.Game(config);
//
////////////////////////////////////////////





