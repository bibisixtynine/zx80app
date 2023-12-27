



///////////////////////////
// Tuto 1                //
//  Dessiner un bonhomme //
//  au mileu de l'écran  //
///////////////////////////


// Un example de scène
class Example extends Phaser.Scene {
    
  // 1) Chargement des éléments de la scène
  preload() {
    this.load.image('player','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/player.png?v=1702377267038')
  }

  // 2) Initialisation de la scène
  create() {
    const centerX = this.sys.game.config.width/2
    const centerY = this.sys.game.config.height/2
    this.player = this.add.sprite(centerX, centerY, 'player')
  }

  // 3) Animation de la uuuuuscène
  update() {
  }

}

// Paramètres de Configuration technique
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

// Lancement du Jeu 💫🤩🚀
const game = new Phaser.Game(config);




