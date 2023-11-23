
//////////////////////////
//
// 🤩 phaser-basic
//

import {clear, print} from "https://qwark.glitch.me/toolbox.js"

print('👀<center><h1><orange>Hellooo<yellow> World!</h1>')


// Include the Phaser library from the CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js';
script.onload = initializeGame;
document.head.appendChild(script);


function initializeGame() {
    class Example extends Phaser.Scene {
        preload() {
            this.load.setBaseURL('https://labs.phaser.io');
            this.load.image('sky', 'assets/skies/space3.png');
            this.load.image('logo', 'assets/sprites/phaser3-logo.png');
            this.load.image('red', 'assets/particles/red.png');
        }

        create() {
            this.add.image(400, 300, 'sky');

            const particles = this.add.particles(0, 0, 'red', {
                speed: 100,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            });

            const logo = this.physics.add.image(400, 100, 'logo');

            logo.setVelocity(100, 200);
            logo.setBounce(1, 1);
            logo.setCollideWorldBounds(true);

            particles.startFollow(logo);
        }
    }

    const config = {
        type: Phaser.AUTO,
        width: 1400,
        height: 200,
        scene: Example,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        }
    };

    const game = new Phaser.Game(config);
}
