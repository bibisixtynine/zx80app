




/////////////////////////
// Tuto 3              //
//    Mosquitos killer //
/////////////////////////


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
    this.load.image('mosquito','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/mosquito.png?v=1703673719846')
    this.load.spritesheet('boom', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/kaboom.png?v=1703082254588', { frameWidth: 64, frameHeight: 64 });
    this.load.audio('explosion', ['https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/explosion.mp3?v=1703076948031']);

    this.nbMosquitos = 4
    this.nbMosquitosKilled = 0
    this.soundExplosion = null; // 💥 Son d'explosion pour l'ambiance !
  }

  // 2) Mise en place
  create() {
    this.anims.create({
        key: 'kaboom-boom',
        frames: this.anims.generateFrameNumbers('boom', { start: 0, end: 7 }),
        repeat: 0,
        frameRate: 16
    });
    this.boom = this.physics.add.sprite(100, 100, 'boom');
    this.boom.setScale(1);
    this.boom.setVisible(false);
    this.boom.on('animationcomplete', () => {
        this.boom.setVisible(false);
    });
    if (!this.soundExplosion) {
        this.soundExplosion = this.sound.add('explosion');
    }
    this.mosquitos = []
    for (let i=0; i<this.nbMosquitos; i++) {
        this.mosquitos[i] = this.add.sprite(0, 0, 'mosquito').setScale(0.1)
        this.mosquitos[i].x = Phaser.Math.Between(0,800)
        this.mosquitos[i].y = Phaser.Math.Between(0,600)
        this.mosquitos[i].setInteractive().on('pointerdown', ()=> {
            if (this.mosquitos[i].isDead) return
            this.createExplosion(this.mosquitos[i].x-12, this.mosquitos[i].y-5);
            this.soundExplosion.play();
            this.mosquitos[i].isDead = true
            setTimeout( ()=>{
                this.mosquitos[i].destroy()
                this.nbMosquitosKilled += 1
            }, 300 )
        })
    }
  }

  // 3) Animation... exécutée au moins 30 fois par seconde,
  //    autrement dit à 30Hz 😛
  update() {
    // 💫**** NOUVEAU ****🚀    
    this.mosquitos.forEach( (mosquito)=> {
      mosquito.x += Phaser.Math.Between(-5,5)
      mosquito.y += Phaser.Math.Between(-5,5)
      const mx = mosquito.x
      const my = mosquito.y
      if (mx>800) mosquito.x -= 800
      if (mx<0) mosquito.x += 800
      if (my>600) mosquito.y -= 600
      if (my<0) mosquito.y += 600  
    })

    if (this.nbMosquitosKilled == this.nbMosquitos) this.gameOver()
  }

  // 💣 Créer une explosion
  createExplosion(x, y) {
    // BOOM ! On montre une explosion ici.
    this.boom.setPosition(x, y);
    this.boom.setVisible(true);
    this.boom.play('kaboom-boom');
  }

  // 🎮 Game Over !
  gameOver() {
    // Affiche "Game Over" et comment recommencer.
    this.add.text(100, 300, '💫You killed all '+this.nbMosquitos+' mosquitos !🚀', { fontSize: '24px', fill: '#fff' });
    setTimeout( ()=> {
        this.nbMosquitosKilled = 0
        this.scene.restart() 
    }, 3000 );
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
    width: 800, 
    height: 600,
    scene: Example,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "gameContainer",
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
};

// 2) Lancement du Jeu 💫🤩🚀 !
const game = new Phaser.Game(config);
//
////////////////////////////////////////////



