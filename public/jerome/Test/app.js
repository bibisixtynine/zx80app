




//////////
// Test //
//////////


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
    this.load.image('rocket','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/rocket.png?v=1703892370250')
    this.engineForce = 50
  }

  // 2) Mise en place
  create() {
    this.game.renderer.roundPixels = false;

    const vw = gameContainer.offsetWidth
    const vh = gameContainer.offsetHeight
    this.rocket = this.physics.add.sprite(vw/2, vh/2, 'rocket')
    this.rocket.body.setBounce(0.5); // Définit la restitution (rebond) de la fusée

    // Création du sol en tant qu'objet statique
    this.ground = this.add.rectangle(vw / 2, vh - 25, vw, 50, 0xff0000);
    this.physics.add.existing(this.ground, true); // 'true' rend l'objet statique

    // Activation de la collision entre la fusée et le sol
    this.physics.add.collider(this.rocket, this.ground);

    // moteur
    // Gestionnaire d'événements pour le début de la touche/clic
    this.input.on('pointerdown', () => this.rocket.body.setAccelerationY(-this.engineForce), this);
    // Gestionnaire d'événements pour la fin de la touche/clic
    this.input.on('pointerup', () => this.rocket.body.setAccelerationY(0), this);
  }



  // 3) Animation !
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
    
    width: window.innerWidth, // Largeur initiale basée sur la fenêtre du navigateur
    height: window.innerHeight, // Hauteur initiale basée sur la fenêtre du navigateur

    scene: Example,

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 10},
            fixedStep: false,
            fps: 60
        },
    },
    fps: {
        target: 60,
        forceSetTimeOut: true // Utilisez cette option si vous rencontrez des problèmes avec le rafraîchissement
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // Active le redimensionnement automatique
        autoCentre : Phaser.Scale.CENTER,
        parent: "gameContainer", // Optionnel: ID de l'élément conteneur du jeu
        width: "100%", 
       height: "100%",
    },
};
// 2) Lancement du Jeu 💫🤩🚀 !
const game = new Phaser.Game(config);
//
////////////////////////////////////////////
