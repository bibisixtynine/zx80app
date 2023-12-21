




///////////////////////
//  phaser-myproject //
///////////////////////

// Démo d'effets spéciaux
// Cliquer/toucher pour tirer

///////////////////////////////////////////////////////////////////////////
//                                                                      //
// 👾 Bullet, pièce de lego représentant un projectile
//
class Bullet extends Phaser.GameObjects.Image
{
    speed; // 💨 Vitesse du projectile
    flame; // 🔥 Flamme du projectile

    constructor(scene, x, y) {
        super(scene, x, y, "bullet");
        this.speed = Phaser.Math.GetSpeed(450, 1); // 💫 Configuration de la vitesse du projectile
        this.postFX.addBloom(0xffffff, 1, 1, 2, 1.2); // ✨ Effet de lumière époustouflant
        this.name = "bullet"; // 💥 Nom du projectile, parce que même les balles ont des noms
    }

    // 🔫 Fonction pour tirer un projectile
    fire(x, y)
    {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
    }

    // 💥 Fonction pour détruire le projectile
    destroyBullet()
    {
        if (this.flame === undefined) {
            // 🔥 Créez des particules pour représenter la flamme
            this.flame = this.scene.add.particles(this.x, this.y, 'flares',
                {
                    frame: 'white',
                    color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
                    colorEase: 'quad.out',
                    lifespan: 500,
                    scale: { start: 0.70, end: 0, ease: 'sine.out' },
                    speed: 200,
                    advance: 500,
                    frequency: 50,
                    blendMode: 'ADD',
                    duration: 1000,
                });
                this.flame.setDepth(1);
            this.flame.once("complete", () => {
                this.flame.destroy();
            });
        }

        // Planification de la destruction du projectile avec un compte à rebours de 50 millisecondes
        this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                this.setActive(false);
                this.setVisible(false);
                this.destroy();
            }
        });
    }

    // 🔄 Fonction de mise à jour du projectile
    update(time, delta)
    {
        this.x += this.speed * delta;

        // 🌌 Vérification de la sortie du projectile de l'écran spatial
        if (this.x > this.scene.sys.canvas.width) {
            this.setActive(false);
            this.setVisible(false);
            this.destroy();
        }
    }
}
//
// 👾 Bullet
//                                                        
///////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////
//                                                                      //
// 👽 MainScene, pièce de lego principale représentant le jeu spatial !
//
class MainScene extends Phaser.Scene
{
    ship;
    bullets;
    fired;

    constructor() {
        super({key: 'MainScene'});
        this.fired = false; // 🔥 État du tir initialisé à faux, car même les lasers ont besoin d'une pause
    }

    init() {
        this.cameras.main.fadeIn(800); // 📷 Effet de fondu en entrée pour éviter de brusquer les joueurs
    }

    preload() {
        // Préchargement des images pour un voyage interstellaire en douceur
        this.load.image("bullet", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/bullet6.png?v=1703079024121");
        this.load.image("ship", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/x2kship.png?v=1703079018020");
        this.load.image("bg", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/nebula.jpg?v=1703079013307");
        this.load.image("planet", "https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/blue-planet.png?v=1703079006670");
        this.load.atlas('flares', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/flares.png?v=1703078993457', 'https://qwark.glitch.me/assets/phaser-myproject/flares.json');
    }

    create() {
        // 🌌 Création d'un arrière-plan interstellaire, car même les jeux ont besoin de décor
        const bg = this.add.image(0, 0, "bg")
            .setOrigin(0, 0)
            .setTint(0x333333);

        // 🪐 Création d'une planète lointaine, c'est toujours sympa d'avoir une vue
        const planet = this.physics.add.image(this.sys.scale.width - 100, this.sys.scale.height / 2, "planet")
            .setScale(.2);
        planet.flipX = true;

        // 🔄 Animation de rotation de la planète pour égayer l'espace
        this.tweens.add({
            targets: planet,
            duration: 5000000,
            rotation: 360,
            repeat: -1
        });

        // 🌟 Ajout d'un effet de lumière éblouissant à la planète
        const planetFX = planet.postFX.addBloom(0xffffff, 1, 1, 0, 1.2);

        // 🚀 Préparez votre vaisseau spatial pour l'aventure !
        this.ship = this.add.image(100, this.sys.scale.height / 2, 'ship')
            .setDepth(2);

        // 🌠 Création d'un groupe de projectiles pour protéger l'univers
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true,
        });

        // 🎆 Animation de l'effet de lumière de la planète pour ajouter du piquant à l'espace
        const planetFXTween = this.tweens.add({
            targets: planetFX,
            blurStrength: 2,
            yoyo: true,
            duration: 100,
            paused: true,
            onComplete: () => {
                planetFXTween.restart();
                planetFXTween.pause();
            }
        });

        // 💥 Détection de collision entre les projectiles et la planète, car même les astéroïdes ont besoin d'être gérés
        this.physics.add.overlap(this.bullets, planet, (planet, bullet) => {
            bullet.destroyBullet();
            if (!planetFXTween.isPlaying()) {
                planetFXTween.restart();
                planetFXTween.play();
            }
        });
    }

    update() {
        // 👆 Vérification si le bouton de tir est enfoncé et si le tir précédent est terminé
        if (this.input.activePointer.isDown && !this.fired) {
            const bullet = this.bullets.get();
            if (bullet) {
                bullet.fire(this.ship.x, this.ship.y);
                this.fired = true; // 🚀 Mise à jour de l'état du tir
            }
            setTimeout(() => this.fired = false, 250); // ⏰ Réinitialisation de l'état du tir après 250 millisecondes
        }
    }
}
//
// 👽 MainScene
//                                                        
///////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////
//                                                                      //
// 🎮 Configuration et lancement du jeu spatial
//
const config = {
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
            gravity: { y: 0 }, // 🪐 La gravité n'a pas de place ici
        },
    },
};

// 💫 Initialisation du jeu
const game = new Phaser.Game(config);
//                                                                      
// 🎮 Configuration et lancement
//
///////////////////////////////////////////////////////////////////////////



