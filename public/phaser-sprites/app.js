import {clear, print} from "https://qwark.glitch.me/toolbox.js"

//////////////////////////
//
// 🤩 PHASER
//


// 🚀 Import asynchrone de Phaser
asyncImport('https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js', main)

// 🌐 Fonction d'importation asynchrone
function asyncImport(url, func) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = func;
  document.head.appendChild(script);
}

// 🎮 Fonction principale
function main() {
    let blitter;
    let gravity = 0.5;
    let idx = 1;

    // 🌟 Classe principale de l'exemple Phaser
    class Example extends Phaser.Scene {
        constructor () {
            super();
        }

        // 📦 Pré-chargement des assets
        preload () {
            this.load.setBaseURL('https://labs.phaser.io');
            this.load.atlas('atlas', 'assets/tests/fruit/veg.png', 'assets/tests/fruit/veg.json');
            this.numbers = [];
            this.iter = 0;
        }

        // 🚀 Lancement des objets
        launch () {
            let frame = 'veg01';
            idx++;

            if (idx === 38) {
                idx = 1;
            }

            if (idx < 10) {
                frame = 'veg0' + idx.toString();
            } else {
                frame = 'veg' + idx.toString();
            }

            const bob = blitter.create(0, 0, frame);

            bob.data.vx = Math.random() * 10;
            bob.data.vy = Math.random() * 10;
            bob.data.bounce = 0.8 + (Math.random() * 0.3);
        }

        // 🔨 Création des objets et de la scène
        create () {
            for (var i = 0; i < 7; i++) {
                this.numbers.push(this.add.image(32 + i * 50, 742, 'atlas', '0'));
            }

            blitter = this.add.blitter(0, 0, 'atlas');

            for (var i = 0; i < 100; ++i) {
                this.launch();
            }

            this.updateDigits();
        }

        // 🔄 Mise à jour de la scène à chaque frame
        update () {
            if (this.input.activePointer.isDown) {
                for (var i = 0; i < 250; ++i) {
                    this.launch();
                }

                this.updateDigits();
            }

            for (var index = 0, length = blitter.children.list.length; index < length; ++index) {
                var bob = blitter.children.list[index];

                bob.data.vy += gravity;

                bob.y += bob.data.vy;
                bob.x += bob.data.vx;

                if (bob.x > 1024) {
                    bob.x = 1024;
                    bob.data.vx *= -bob.data.bounce;
                } else if (bob.x < 0) {
                    bob.x = 0;
                    bob.data.vx *= -bob.data.bounce;
                }

                if (bob.y > 684) {
                    bob.y = 684;
                    bob.data.vy *= -bob.data.bounce;
                }
            }
        }

        // 🎲 Mise à jour des chiffres à l'écran
        updateDigits () {
            const len = Phaser.Utils.String.Pad(blitter.children.list.length.toString(), 7, '0', 1);

            for (var i = 0; i < this.numbers.length; i++) {
                this.numbers[i].setFrame(len[i]);
            }
        }
    }

    // 📐 Configuration de Phaser
    const config = {
        type: Phaser.WEBGL,
        parent: 'phaser-example',
        scene: Example
    };
   
    // 🕹️ Création du jeu
    const game = new Phaser.Game(config);
}
