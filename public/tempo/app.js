




/////////////////////////////
// Phaser 3 - Tutoriel 01  //
//     Oliver's Quest      //
/////////////////////////////

import {addDiv,print,clear} from './toolbox.js'


print(`<pre><bold><center><orange>
 OOO  L     III V   V EEEEE RRRR       QQQ  U   U EEEEE SSSS TTTTT
O   O L      I  V   V E     R   R     Q   Q U   U E     S      T  
O   O L      I  V   V EEE   RRRR      Q   Q U   U EEE    SSS   T  
O   O L      I   V V  E     R  R      Q  QQ U   U E         S  T  
 OOO  LLLLL III   V   EEEEE R   R      QQQQ  UUU  EEEEE SSSS   T  

        <purple>The Extraordinary Quest of Sir Oliver is loading... 
</pre>`)


run(main)

//////////
// main //
//////////

function main() {

    ////////////////////////////////////////////////////////////
    //                                                       //
    // GameScene
    // 🎮 Scène principale du jeu
    class GameScene extends Phaser.Scene {
        
        /////////////////////////////////////////////////////
        // 
        // 🏗️ Initialisation des paramètres
        //
        constructor () {
            super()

            this.playerSpeed = 1.5 // Vitesse du joueur
            this.enemySpeed = 2 // Vitesse de l'ennemi
            this.enemyMaxY = 280 // Position Y maximale pour l'ennemi
            this.enemyMinY = 80 // Position Y minimale pour l'ennemi
        }

        
        /////////////////////////////////////////////////////
        //
        // 📦 Chargement des ressources (images, sons, etc.)
        //
        preload () {
            // Chargement des images
            this.load.image('background','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/background.png?v=1702377244670')
            this.load.image('dragon','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/dragon.png?v=1702377252757')
            this.load.image('player','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/player.png?v=1702377267038')
            this.load.image('treasure','https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/treasure.png?v=1702377271451')
        
            // Chargement des sons
            this.load.audio('left', [
                'https://labs.phaser.io/assets/audio/Rossini - William Tell Overture (8 Bits Version)/left.ogg',
                'https://labs.phaser.io/assets/audio/Rossini - William Tell Overture (8 Bits Version)/left.mp3'
            ]);
            this.load.audio('right', [
                'https://labs.phaser.io/assets/audio/Rossini - William Tell Overture (8 Bits Version)/right.ogg',
                'https://labs.phaser.io/assets/audio/Rossini - William Tell Overture (8 Bits Version)/right.mp3'
            ]);

            this.load.audio('explosion', [
                'https://labs.phaser.io/assets/audio/SoundEffects/explosion.mp3'
            ]);
        }

        
        /////////////////////////////////////////////////////
        //
        // 🛠️ Création des objets et Camera
        //
        create () {
            // Arrière-plan
            let bg = this.add.sprite(0,0,'background')
            bg.setOrigin(0,0)

            // Joueur
            this.player = this.add.sprite(40, this.sys.game.config.height/2, 'player')
            this.player.setScale(0.5)
            this.isPlayerAlive = true

            // Trésor
            this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height/2, 'treasure')
            this.treasure.setScale(0.6)

            // Groupe de Dragons gardiens du trésor
            this.enemies = this.add.group({
                key:'dragon',
                repeat: 5,
                setXY: {
                    x: 110,
                    y: 100,
                    stepX: 80,
                    stepY: 20
                }
            })
            Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5)

            // Définir la vitesse des Dragons
            Phaser.Actions.Call(this.enemies.getChildren(), (enemy) => {
                enemy.speed = Math.random()*2 + 1
            }, this)

            // sons
            if (!this.soundLeft) {
                this.soundLeft = this.sound.add('left');
                this.soundLeft.play({
                    loop: true
                });
        
                this.soundRight = this.sound.add('right');
                this.soundRight.play({
                    loop: true
                });

                this.soundExplosion = this.sound.add('explosion');
            }
            
            // Réinitialiser les effets de la caméra
            this.cameras.main.resetFX()

            // efface le titre après 7s
            setTimeout( ()=> clear(), 7000)
        }

        
        /////////////////////////////////////////////////////
        //
        // 🔄 Mise à jour de la scène à chaque rendu d'image
        //
        update () {
            // Continuer uniquement si le joueur est vivant
            if (!this.isPlayerAlive) return
            
            // Mouvement du joueur
            if (this.input.activePointer.isDown) {
                this.player.x += this.playerSpeed
            }

            // Collision joueur-trésor
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.treasure.getBounds())) {
                this.gameOver()
            }

            // Mouvement des dragons
            let enemies = this.enemies.getChildren()
            let numEnemies = enemies.length

            for (let i=0; i<numEnemies; i++) {
                // Déplacer les ennemis
                enemies[i].y += enemies[i].speed

                // Inverser le mouvement aux bords
                if (enemies[i].y >= this.enemyMaxY && enemies[i].speed>0) {
                    enemies[i].speed *= -1
                } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed <0) {
                    enemies[i].speed *= -1
                }

                // Collision dragon-joueur
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
                    this.soundExplosion.play();
                    this.gameOver()
                    break
                }
            }
        }

        /////////////////////////////////////////////////////
        //
        // 🔄 Fin du jeu
        //
        gameOver() {
            // Marquer le joueur comme mort
            this.isPlayerAlive = false
            
            // Secouer la caméra
            this.cameras.main.shake(500)

            // Fondu de la caméra
            this.time.delayedCall(250, ()=> {
                this.cameras.main.fade(250)
            }, [], this)

            // Redémarrer le jeu
            this.time.delayedCall(500, ()=> {
                this.scene.restart()
            }, [], this)
        }
            
    }
    //   
    // GameScene
    //                                                       //
    ////////////////////////////////////////////////////////////

    
    const config = {
        type: Phaser.AUTO,
        width: 640, 
        height: 360,
        scene: GameScene,
        scale: {
          parent: "gameContainer", // Optionnel : ID de l'élément conteneur du jeu
        }
    };
  
    // 🕹️ Création du jeu
    const game = new Phaser.Game(config);
    console.log(game)

} // fin main


///////////////
// demarrage //
///////////////

function run(mainFunction) {
  // Création de l'espace de jeu Phaser
  addDiv('<div id="gameContainer" style="width:100%; height:100%"></div>');

  // 🚀 Importation synchrone de la librairie Phaser
  syncImport('https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js', mainFunction)

  // 🌐 Fonction d'importation asynchrone
  function syncImport(url, func) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = func;
    document.head.appendChild(script);
  }
}


