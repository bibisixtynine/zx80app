




///////////////////////////
// Tuto 1                //
//  Dessiner un bonhomme //
//  au mileu de l'écran  //
///////////////////////////


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
    this.load.image('player','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/player.png?v=1702377267038')
  }

  // 2) Mise en place
  create() {
    const centerX = this.sys.game.config.width/2
    const centerY = this.sys.game.config.height/2
    this.player = this.add.sprite(centerX, centerY, 'player')
  }

  // 3) Animation
  update() {
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
    width: 640, 
    height: 360,
    scene: Example,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "gameContainer",
    }
};

// 2) Lancement du Jeu 💫🤩🚀 !
const game = new Phaser.Game(config);
//
////////////////////////////////////////////
