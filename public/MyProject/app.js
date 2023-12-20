




const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
      mode: Phaser.DOM.RESIZE,
      parent: "gameContainer",
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
      },
    },
};

const game = new Phaser.Game(config);

let player;
let aliens;
let bullets;
let boom;
let score = 0;
let scoreText;
let leftButton;
let rightButton;
let fireButton;

console.log("hello world")

function preload() {
    this.load.image('background', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/background.png?v=1702377244670');
    this.load.image('player', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/player.png?v=1702377267038');
    this.load.image('dragon', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/dragon.png?v=1702377252757');
    this.load.image('bullet', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/treasure.png?v=1702377271451');
    this.load.spritesheet('boom', 'https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/kaboom.png?v=1703082254588', { frameWidth: 64, frameHeight: 64 });
}

function create() {
    this.add.sprite(0, 0, 'background').setOrigin(0, 0);

    player = this.physics.add.sprite(320, 330, 'player').setScale(0.5);
    player.setCollideWorldBounds(true);

    aliens = this.physics.add.group();
    createAliens();

    bullets = this.physics.add.group();

    this.anims.create({
      key: 'kaboom-boom',
      frames: this.anims.generateFrameNumbers('boom', {
        start: 0,
        end: 7
      }),
      repeat: 0,
      frameRate: 16
    });

    // Create our explosion sprite and hide it initially
    boom = this.physics.add.sprite(100, 100, 'boom');
    boom.setScale(1);
    boom.setVisible(false);

    // Set it to hide when the explosion finishes
    boom.on('animationcomplete', () => {
      boom.setVisible(false);
    })

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    leftButton = this.add.sprite(50, 300, 'player').setInteractive();
    rightButton = this.add.sprite(590, 300, 'player').setInteractive();
    fireButton = this.add.sprite(320, 300, 'player').setInteractive();

    leftButton.on('pointerdown', () => player.setVelocityX(-200));
    leftButton.on('pointerup', () => player.setVelocityX(0));
    leftButton.on('pointerout', () => player.setVelocityX(0));

    rightButton.on('pointerdown', () => player.setVelocityX(200));
    rightButton.on('pointerup', () => player.setVelocityX(0));
    rightButton.on('pointerout', () => player.setVelocityX(0));

    fireButton.on('pointerdown', fireBullet);
}

function update() {
    if (!player.active) {
        return;
    }

    player.setVelocityX(0);

    this.physics.overlap(bullets, aliens, bulletHitAlien, null, this);
    this.physics.overlap(player, aliens, playerHitAlien, null, this);
}

// ... autres fonctions (createAliens, fireBullet, bulletHitAlien, etc.) ...
function createAliens() {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 10; x++) {
            const alien = aliens.create(x * 48, y * 50, 'dragon').setScale(0.5);
            alien.setCollideWorldBounds(true);
            alien.setBounce(1);
            alien.setVelocityX(Phaser.Math.Between(50, 150));
        }
    }
}

function fireBullet() {
    
    const bullet = bullets.create(player.x, player.y, 'bullet').setScale(0.3);
    bullet.setVelocityY(-300);
}

function bulletHitAlien(bullet, alien) {
    bullet.destroy();
    alien.destroy();
    createExplosion(alien.x, alien.y);
    score += 10;
    scoreText.setText('Score: ' + score);
}

function playerHitAlien(player, alien) {
    player.setActive(false).setVisible(false);
    createExplosion(player.x, player.y);
    gameOver();
}

function createExplosion(x, y) {
    
    // Only detonate once
    //if (!this.exploded) {      
      // Position the explosion where the alien was and play it
      boom.setPosition(x, y);
      boom.setVisible(true);
      boom.play('kaboom-boom');
    
      // Flip our toggle
    //}
}

function gameOver() {
    this.add.text(200, 150, 'Game Over', { fontSize: '48px', fill: '#fff' });
    this.add.text(220, 200, 'Press R to Restart', { fontSize: '24px', fill: '#fff' });
    this.input.keyboard.on('keydown-R', () => {
        this.scene.restart();
    });
}