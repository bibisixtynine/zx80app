




//////////////////
// phaser-sound //
//////////////////


// 🎲 Lancer Phaser avec une fonction anonyme
// 🎭 Classe de scène pour notre jeu Phaser
class Example extends Phaser.Scene {
    // 📦 Méthode pour charger des ressources avant le jeu
    preload() {
        this.load.image('title', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/catastrophi.png?v=1703080414518');
        this.load.spritesheet('button', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/flixel-button.png?v=1703080317855', { frameWidth: 80, frameHeight: 20 });
        this.load.bitmapFont('nokia', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/nokia16black.png?v=1703080310329', 'https://qwark.glitch.me/assets/phaser-sound/nokia16black.xml');
        this.load.audioSprite('sfx', 'https://qwark.glitch.me/assets/phaser-sound/fx_mixdown.json', ['https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/fx_mixdown.ogg?v=1703080305830', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/fx_mixdown.mp3?v=1703080298380']);
    }

    // 🎬 Méthode pour créer la scène initiale du jeu
    create() {
        this.add.image(400, 300, 'title');
        const spritemap = this.cache.json.get('sfx').spritemap;
        let i = 0;
        for (const spriteName in spritemap) {
            if (!spritemap.hasOwnProperty(spriteName)) {
                continue;
            }

            // 🖼️ Créer des boutons avec des noms de sprite
            this.makeButton.call(this, spriteName, 100,  22+ i * 30);
            i++;
        }

        // 🖱️ Gérer les événements de survol et de clic sur les boutons
        this.input.on('gameobjectover', (pointer, button) => {
            this.setButtonFrame(button, 0);
        });
        this.input.on('gameobjectout', (pointer, button) => {
            this.setButtonFrame(button, 1);
        });
        this.input.on('gameobjectdown', function (pointer, button) {
            this.sound.playAudioSprite('sfx', button.name);
            this.setButtonFrame(button, 2);
        }, this);
        this.input.on('gameobjectup', (pointer, button) => {
            this.setButtonFrame(button, 0);
        });
    }

    // 🖌️ Méthode pour créer un bouton
    makeButton(name, x, y) {
        const button = this.add.image(x, y, 'button', 1).setInteractive();
        button.name = name;
        button.setScale(2, 1.5);

        // Ajout de texte sur le bouton
        const text = this.add.bitmapText(x - 40, y - 8, 'nokia', name, 16);
        text.x += (button.width - text.width) / 2;
    }

    // 🔧 Méthode pour définir le cadre d'un bouton
    setButtonFrame(button, frame) {
        button.frame = button.scene.textures.getFrame('button', frame);
    }
}

// 📐 Configuration du jeu Phaser
const config = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    scene: Example,
    scale: {
        mode: Phaser.DOM.RESIZE, // Active le redimensionnement automatique
        parent: "gameContainer", // Optionnel: ID de l'élément conteneur du jeu
        width: "100%", // for android 7 moto g5
        height: "100%", // idem
    },
    pixelArt: true
};

// 🕹️ Création d'une nouvelle instance de jeu
const game = new Phaser.Game(config);

