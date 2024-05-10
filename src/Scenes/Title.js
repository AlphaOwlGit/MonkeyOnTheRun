class Title extends Phaser.Scene {
    constructor() {
        super("title");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}, text: {}};   
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("monkey", "monkey.png");
        this.load.image("crocodile", "crocodile.png");
        this.load.image("ufo", "shipGreen_manned.png");
        this.load.image("crosshair", "crosshair_red_large.png");
        this.load.image("orbitlaser", "laserPink1.png");
        this.load.image("laserBlast", "laserPink_groundBurst.png");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.audio("hitGeneric", "impactBell_heavy_004.ogg");
        this.load.audio("UISound", "click3.ogg");

        this.bulletActive = false;
        this.playerSpeed = 5;
        this.bulletSpeed = 5;
    }

    create() {
        let my = this.my;

        my.sprite.monkey = this.add.sprite(game.config.width/2, game.config.height/2 - 40, "monkey");
        my.sprite.monkey.setScale(0.25);

        my.sprite.croc = this.add.sprite(game.config.width/2, game.config.height/4 - 75, "crocodile");
        my.sprite.croc.setScale(0.5);

        my.sprite.crosshair = this.add.sprite(game.config.width/2, 50, "crosshair");

        my.sprite.laser = this.add.sprite(-10, -10, "orbitlaser");
        my.sprite.laser.visible = false;

        this.anims.create({
            key: "laserDeathDemo",
            frames: [
                { key: "laserBlast" },
            ],
            frameRate: 60,
            repeat: 5,
            hideOnComplete: true
        });

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.crossLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.crossRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.nextScene = this.input.keyboard.addKey("C");
        this.startGame = this.input.keyboard.addKey("S");

        this.my.sprite.background = [];

        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 5; j++) {
                if (i % 3 == 1) {
                    my.sprite.background.push(this.add.sprite(
                        90 * i - 20, 100 * j + 500, "monkey").setScale(0.5));
                }
                else if (i % 3 == 2) {
                    my.sprite.background.push(this.add.sprite(
                        90 * i - 20, 100 * j + 500, "crocodile").setScale(0.5));
                }
                else if (i % 3 == 0) {
                    my.sprite.background.push(this.add.sprite(
                        90 * i - 20, 100 * j + 500, "ufo").setScale(0.5));
                }
            }
        }

        my.text.Title = this.add.bitmapText(config.width/4, 0, "rocketSquare", "Monkey On The Run");
        my.text.Start = this.add.bitmapText(config.width/5, config.height/2, "rocketSquare", "Press 'S' to start");
        my.text.Credits = this.add.bitmapText(config.width/10, config.height/2 + 50, "rocketSquare", "Press 'C' for Controls/Credits ");

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Title.js</h2><br>DEMO: Monkey On The Run.js</h2><br>A: move monkey left // D: move monkey right // Left Arrow: move crosshair left // Right Arrow: move crosshair right // Space: fire laser from crosshair // S: Start Game // C: Credits'
    }

    update() {
        let my = this.my;
        
        if (this.left.isDown) {
            if (my.sprite.monkey.x > (my.sprite.monkey.displayWidth/2)) {
                my.sprite.monkey.x -= this.playerSpeed;
            }
        }

        if (this.right.isDown) {
            if (my.sprite.monkey.x < (game.config.width - (my.sprite.monkey.displayWidth/2))) {
                my.sprite.monkey.x += this.playerSpeed;
            }
        }

        if (this.crossLeft.isDown) {
            if (my.sprite.crosshair.x > (my.sprite.crosshair.displayWidth/2)) {
                my.sprite.crosshair.x -= this.playerSpeed;
            }
        }

        if (this.crossRight.isDown) {
            if (my.sprite.crosshair.x < (game.config.width - (my.sprite.crosshair.displayWidth/2))) {
                my.sprite.crosshair.x += this.playerSpeed;
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if (!this.bulletActive) {
                this.bulletActive = true;
                my.sprite.laser.x = my.sprite.crosshair.x;
                my.sprite.laser.y = my.sprite.crosshair.y;
                my.sprite.laser.visible = true;
            }
        }

        if (this.collides(my.sprite.croc, my.sprite.laser)) {
            // start animation
            this.laserDeathDemo = this.add.sprite(my.sprite.croc.x, my.sprite.croc.y, "laserBlast").setScale(0.25).play("laserDeathDemo");
            // clear out bullet -- put y offscreen, will get reaped next update
            this.bulletActive = false;
            my.sprite.laser.y = -50;
            my.sprite.croc.visible = false;
            my.sprite.croc.x = -100;
            this.sound.play("hitGeneric", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            this.laserDeathDemo.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.my.sprite.croc.visible = true;
                this.my.sprite.croc.x = Math.random()*config.width;
            }, this);
        }

        // Now handle bullet movement, only if it is active
        if (this.bulletActive) {
            my.sprite.laser.y += this.bulletSpeed;
            // Is the bullet off the top of the screen?
            if (my.sprite.laser.y > 500) {
                // make it inactive and invisible
                this.bulletActive = false;
                my.sprite.laser.visible = false;
            }
        }

        for (let prop of my.sprite.background) {
            prop.x += 1;
            prop.y += 1;
            if (prop.x > config.width + 25) {
                prop.x = 0;
            }
            if (prop.y > config.height + 25) {
                prop.y = 500;
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.startGame)) {
            this.scene.start("galleryShooter");
            this.sound.play("UISound", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("controlCredits");
            this.sound.play("UISound", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}