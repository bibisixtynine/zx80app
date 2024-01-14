/////////
// gps //
/////////


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
  constructor() {
    super();

    this.currentPosition = { latitude: 0, longitude: 0 };
    this.previousPosition = null;
    this.scaleFactor = 10; // 1 mètre = 10 pixels
    this.trailOpacity = 0.5; // Opacité des traces
  }

  preload() {
    this.load.image('player', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/player.png?v=1702377267038');
  }

  create() {
    this.player = this.add.sprite(200, 200, 'player');
    this.trailGroup = this.add.group();

    // Mise à jour initiale de la position GPS
    this.updateGPSPosition();
  }

  updateGPSPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((position) => {
        this.currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.updatePlayerPosition();
      }, (error) => {
        displayConsoleMessage("Erreur GPS: ", error);
      }, { enableHighAccuracy: true });
    } else {
      displayConsoleMessage("Géolocalisation non disponible");
    }
  }

  updatePlayerPosition() {
    if (this.previousPosition) {
      const distanceX = (this.currentPosition.longitude - this.previousPosition.longitude) * this.scaleFactor;
      const distanceY = (this.currentPosition.latitude - this.previousPosition.latitude) * this.scaleFactor;

      this.player.x += distanceX;
      this.player.y += distanceY;

      // Ajout d'une trace
      const trail = this.add.sprite(this.player.x, this.player.y, 'player').setAlpha(this.trailOpacity);
      this.trailGroup.add(trail);
    }

    this.previousPosition = { ...this.currentPosition };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: Example,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "gameContainer",
  }
};

const game = new Phaser.Game(config);

