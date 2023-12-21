



// 🚀 Bienvenue dans l'aventure spatiale ! 🌌


////////////////////////////////////////////////////////////
//                                                       //
// Scene Principale
//
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' }); // 🔑 On crée une nouvelle scène magique !
        
        // Ici, on va ajouter des tas de choses amusantes :
        this.player = null; // 🚀 Notre super vaisseau !
        this.aliens = null; // 👽 Des extraterrestres coquins !
        this.bullets = null; // 💥 Des balles pour les repousser !
        this.boom = null; // 💣 BOOM ! Quand les aliens explosent !
        this.score = 0; // 🏆 Compte tes points ici !
        this.bulletsFired = 0
        this.scoreText = null; // ✍️ Affiche ton score ici !
        this.joystick = null; // 🕹️ Ton manette super puissante !
        this.autoFire = false; // 🔫 Tir automatique ? Peut-être plus tard !
        this.waitBeforeNextFire = false; // ⏱ Attends un peu avant de tirer à nouveau !
        this.soundExplosion = null; // 💥 Son d'explosion pour l'ambiance !
        this.soundBlaster = null; // 🔊 Son de tir pour plus de fun !
    }

    // 📚 Précharge les images et sons pour notre jeu
    preload() {
        // Ici on charge des images super cool et des sons pour notre jeu !
        // Comme le fond de l'espace, notre vaisseau, les aliens, etc.
        this.load.image('background', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/nebula.jpg?v=1703079013307');
        this.load.image('player', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/x2kship.png?v=1703079018020');
        this.load.image('dragon', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/dragon.png?v=1702377252757');
        this.load.image('bullet', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/treasure.png?v=1702377271451');
        this.load.spritesheet('boom', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/kaboom.png?v=1703082254588', { frameWidth: 64, frameHeight: 64 });
        this.load.audio('explosion', ['https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/explosion.mp3?v=1703076948031']);
        this.load.audio('blaster', ['https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/blaster.mp3?v=1703106687829']);
        this.load.plugin('rexvirtualjoystickplugin', 'https://qwark.glitch.me/assets/MyProject/joystick.js', true);
    }

    // ⭐ Créer le jeu ici !
    create() {
        // On ajoute tout dans notre scène : le fond, le vaisseau, les aliens...
        // On prépare aussi les explosions et le score.
        this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.player = this.physics.add.sprite(320, 330, 'player').setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.player.angle -= 90;
        this.aliens = this.physics.add.group();
        this.createAliens();
        this.bullets = this.physics.add.group();
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
        this.scoreText = this.add.text(160, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        if (!this.soundExplosion) {
            this.soundExplosion = this.sound.add('explosion');
            this.soundBlaster = this.sound.add('blaster');
        }
        this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: 550,
            y: 300,
            radius: 50,
            base: this.add.circle(0, 0, 25, 0x888888),
            thumb: this.add.circle(0, 0, 12, 0xcccccc),
        })
        .on('update', this.joystickMoved, this);
    }

    // 🔄 Mise à jour du jeu à chaque instant (jusqu'à 60 fois par seconde, dit autrement 60Hz)
    update() {
        // Ici, on regarde si notre vaisseau touche un alien ou tire une balle.
        // Si oui, BOOM ! Sinon, on continue à jouer.
        if (!this.player.active) {
            return;
        }
        this.physics.overlap(this.bullets, this.aliens, this.bulletHitAlien, null, this);
        this.physics.overlap(this.player, this.aliens, this.playerHitAlien, null, this);
        if (this.autoFire) this.fireBullet();
    }

    // 🐉 Créer les aliens ici
    createAliens() {
        // On ajoute plein de dragons aliens pour plus de défi !
        for (let y = 1; y < 5; y++) {
            for (let x = 0; x < 10; x++) {
                const alien = this.aliens.create(x * 48, y * 50 + 20, 'dragon').setScale(0.5);
                alien.setCollideWorldBounds(true);
                alien.setBounce(1);
                alien.setVelocityX(Phaser.Math.Between(50, 150));
            }
        }
    }

    // 🔫 Fonction pour tirer des balles
    fireBullet() {
        // Si on peut tirer, on envoie une balle super rapide !
        if (!this.waitBeforeNextFire) {
            const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet').setScale(0.3);
            bullet.setVelocityY(-300);
            this.soundBlaster.play();
            this.waitBeforeNextFire = true;
            this.bulletsFired += 1
            this.scoreText.setText('Score: ' + (this.score - this.bulletsFired) );
            setTimeout(() => { this.waitBeforeNextFire = false }, 200);
        }
    }


    // 💥 Quand une balle touche un alien
    bulletHitAlien(bullet, alien) {
        // L'alien disparaît et on gagne des points !
        bullet.destroy();
        alien.destroy();
        this.createExplosion(alien.x, alien.y);
        this.soundExplosion.play();
        this.score += 10;
        this.scoreText.setText('Score: ' + (this.score - this.bulletsFired) );

        if (this.score>390) this.gameOver()
    }

     // 😵 Quand un alien touche notre vaisseau
    playerHitAlien(player, alien) {
        // Oh non ! Notre vaisseau est touché !
        // On fait une grosse explosion et c'est la fin de la partie.
        this.player.setActive(false).setVisible(false);
        this.createExplosion(this.player.x, this.player.y);
        this.gameOver();
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
        this.add.text(200, 150, '💫You killed all Dragons !🚀', { fontSize: '18px', fill: '#fff' });
        setTimeout( ()=> {
            this.score = 0
            this.bulletsFired = 0
            this.scene.restart()
        }, 3000 );
    }

    // 🕹️ Bouger avec la manette
    joystickMoved() {
        // Ici, on contrôle notre vaisseau avec la manette !
        if (this.joystick.forceX > 15) this.player.setVelocityX(200);
        else if (this.joystick.forceX < -15) this.player.setVelocityX(-200);
        else this.player.setVelocityX(0);

        if (this.joystick.forceY < -15) this.autoFire = true;
        else this.autoFire = false;
    }
}

// ⚙️ Configuration du jeu
const config = {
    // D'autres réglages techniques pour notre jeu...
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: MainScene,
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

// 🤓 position, style et contenu du bouton STOP
//  => permet de revenir au code depuis le jeu
let actionButton = document.getElementById('actionButton')
if (actionButton) {
    actionButton.style.color = "gray"
    actionButton.style.border = "solid gray 2px"
    actionButton.style.padding = "14px"
    actionButton.style.opacity = "0.5"
    actionButton.style.top = 'env(safe-area-inset-top)';
    actionButton.style.left = '0';
    actionButton.style.left = "0px"
    actionButton.style.margin = "0px"
    actionButton.style.bottom = ""
    actionButton.innerText = "STOP"
    actionButton.style.fontSize = "16px"
    actionButton.style.borderRadius = "50%"
    var width = actionButton.offsetWidth; // Récupère la largeur actuelle
    actionButton.style.height = width + 'px'; // Définit la hauteur égale à la largeur
}

// Et voilà, on lance le jeu ! 🎉
const game = new Phaser.Game(config);
