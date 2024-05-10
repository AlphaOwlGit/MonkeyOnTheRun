class GalleryShooter extends Phaser.Scene {
    constructor() {
        super("galleryShooter");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}, text: {}};   
        
        this.myScore = 0;
        this.highScore = 0;
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("monkey", "monkey.png");
        this.load.image("heart", "heart.png");
        this.load.image("orbitlaser", "laserPink1.png");
        this.load.image("crosshair", "crosshair_red_large.png");

        // enemies
        this.load.image("crocodile", "crocodile.png");
        this.load.image("ship", "shipGreen_manned.png");

        // For animation
        this.load.image("laserBlast", "laserPink_groundBurst.png");

        this.load.image("alienLaser", "laserBeige2.png");
        this.load.image("ufoCapture", "laserBeige3.png");
        this.load.image("crocProjectile", "cloud1.png");

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        this.load.audio("hitGeneric", "impactBell_heavy_004.ogg");
        this.load.audio("hitMonkey", "impactBell_heavy_002.ogg");
        this.load.audio("hitAlien", "impactBell_heavy_000.ogg");
        this.load.audio("UISound", "click3.ogg");
    }

    init_game() {
        let my = this.my;
        
        this.bulletActive = false;
        this.spitActive = false;
        this.myScore = 0;
        this.my.sprite.hp = [];
        this.heartCount = 3;
        this.my.sprite.mobs = [];
        this.mobCount = 40;
        this.ufoCounter = 0;
        this.ufoType = 'resting';
        this.alienTimer = 180;
        this.spitCounter = 0;

        this.updateScore();

        my.text.endGame.visible = false;
        my.text.restart.visible = false;
        my.text.myScore.visible = false;
        my.text.highScore.visible = false;
        my.text.Title.visible = false;
        this.restart = false;

        for (let i = 1; i <= this.mobCount / 5; i++) {
            for (let j = 1; j <= this.mobCount / 8; j++) {
                my.sprite.mobs.push(this.add.sprite(
                    90 * i - 20, 50 + 80 * j, "crocodile").setScale(0.5));
            }
        }

        my.sprite.hp = [];

        for (let i = 0; i < this.heartCount; i++) {
            my.sprite.hp.push(this.add.sprite(
                190 + (35 * i), 20, "heart")
            );
        }
    }

    create() {
        let my = this.my;

        // Put score on screen
        my.text.score = this.add.bitmapText(500, 0, "rocketSquare", "Score: " + this.myScore);
        my.text.health = this.add.bitmapText(10, 0, "rocketSquare", "Health: ");

        my.text.endGame = this.add.bitmapText(config.width/5, config.height/4, "rocketSquare", "You Lose!");
        my.text.restart = this.add.bitmapText(config.width/5, config.height/4 + 150, "rocketSquare", "Press 'R' to restart");
        my.text.myScore = this.add.bitmapText(config.width/5, config.height/4 + 50, "rocketSquare", "Score: " + this.myScore);
        my.text.highScore = this.add.bitmapText(config.width/5, config.height/4 + 100, "rocketSquare", "High Score: " + this.highScore);
        my.text.Title = this.add.bitmapText(config.width/5, config.height/4 + 200, "rocketSquare", "Press 'T' for Title Screen");

        this.init_game();

        my.sprite.monkey = this.add.sprite(game.config.width/2, game.config.height - 40, "monkey");
        my.sprite.monkey.setScale(0.25);

        my.sprite.crosshair = this.add.sprite(game.config.width/2, 50, "crosshair");

        // Create the "bullet" offscreen and make it invisible to start
        my.sprite.laser = this.add.sprite(-10, -10, "orbitlaser");
        my.sprite.laser.visible = false;

        my.sprite.spit = this.add.sprite(-10, -10, "crocProjectile");
        my.sprite.spit.visible = false;

        my.sprite.ufo = this.add.sprite(-10, 750, "ship");
        my.sprite.ufo.visible = false;
        my.sprite.ufobeam = this.add.sprite(-10, 875, "alienLaser");
        my.sprite.ufobeam.visible = false;
        my.sprite.ufoCapture = this.add.sprite(my.sprite.monkey.x, my.sprite.monkey.y, "ufoCapture");
        my.sprite.ufoCapture.visible = false;
        
        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses

        // Create laserDeath animation
        this.anims.create({
            key: "laserDeath",
            frames: [
                { key: "laserBlast" },
            ],
            frameRate: 60,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.crossLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.crossRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.RKey = this.input.keyboard.addKey("R");
        this.TKey = this.input.keyboard.addKey("T");

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 8;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Monkey On The Run.js</h2><br>A: move monkey left // D: move monkey right // Left Arrow: move crosshair left // Right Arrow: move crosshair right // Space: fire laser from crosshair // T: Title // R: Restart'
    }

    update() {
        let my = this.my;

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.monkey.x > (my.sprite.monkey.displayWidth/2)) {
                my.sprite.monkey.x -= this.playerSpeed;
                my.sprite.ufoCapture.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.monkey.x < (game.config.width - (my.sprite.monkey.displayWidth/2))) {
                my.sprite.monkey.x += this.playerSpeed;
                my.sprite.ufoCapture.x += this.playerSpeed;
            }
        }

        // Moving crosshair left
        if (this.crossLeft.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.crosshair.x > (my.sprite.crosshair.displayWidth/2)) {
                my.sprite.crosshair.x -= this.playerSpeed;
            }
        }

        // Moving crosshair right
        if (this.crossRight.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.crosshair.x < (game.config.width - (my.sprite.crosshair.displayWidth/2))) {
                my.sprite.crosshair.x += this.playerSpeed;
            }
        }
        
            // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Only start the bullet if it's not currently active
            if (!this.bulletActive) {
                // Set the active flag to true
                this.bulletActive = true;
                // Set the position of the bullet to be the location of the player
                // Offset by the height of the sprite, so the "bullet" comes out of
                // the top of the player avatar, not the middle.
                my.sprite.laser.x = my.sprite.crosshair.x;
                my.sprite.laser.y = my.sprite.crosshair.y;
                my.sprite.laser.visible = true;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            // Only start the bullet if it's not currently active
            if (this.restart) {
                this.init_game();
                my.sprite.monkey.visible = true;
                my.sprite.monkey.x = config.width/2;
                my.sprite.ufo.y = 750;
                my.sprite.ufobeam.y = 875;
                my.sprite.crosshair.x = config.width/2;
                my.text.health.visible = true;
                my.text.score.visible = true;
                my.text.endGame.visible = false;
                my.text.myScore.visible = false;
                my.text.highScore.visible = false;
                my.text.restart.visible = false;
                my.text.Title.visible = false;
                this.sound.play("UISound", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.TKey)) {
            this.sound.play("UISound", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            this.scene.start("title");
        }

        // Now handle bullet movement, only if it is active
        if (this.bulletActive) {
            my.sprite.laser.y += this.bulletSpeed;
            // Is the bullet off the top of the screen?
            if (my.sprite.laser.y > 1000) {
                // make it inactive and invisible
                this.bulletActive = false;
                my.sprite.laser.visible = false;
            }
        }

        // Now handle bullet movement, only if it is active
        if (this.spitActive) {
            my.sprite.spit.y += this.bulletSpeed;
            // Is the bullet off the top of the screen?
            if (my.sprite.spit.y > 1000) {
                // make it inactive and invisible
                this.spitActive = false;
                my.sprite.spit.visible = false;
            }
        }

        this.mobMove();

        // Check for collision with the croc
        for (let croc of my.sprite.mobs) {
            if (this.collides(croc, my.sprite.laser)) {
                // start animation
                this.laserDeath = this.add.sprite(croc.x, croc.y, "laserBlast").setScale(0.25).play("laserDeath");
                // clear out bullet -- put y offscreen, will get reaped next update
                this.bulletActive = false;
                my.sprite.laser.y = -50;
                croc.visible = false;
                croc.x = -100;
                // Update score
                this.mobCount--;
                this.myScore += 100;
                this.updateScore();
                // Play sound
                this.sound.play("hitGeneric", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
            }

            if (croc.y > 1000) {
                // make it inactive and invisible
                this.heartCount = 0;
                this.updateHealth();
            }
        }

        this.spitCounter++;
        if (this.spitCounter % 60 == 0) {
            let x = Math.floor(Math.random() * this.mobCount);
            this.spitActive = true;
            my.sprite.spit.visible = true;
            my.sprite.spit.x = my.sprite.mobs[x].x;
            my.sprite.spit.y = my.sprite.mobs[x].y;
        }

        if (this.collides(my.sprite.ufo, my.sprite.laser)) {
            this.laserDeath = this.add.sprite(my.sprite.ufo.x, my.sprite.ufo.y, "laserBlast").setScale(0.25).play("laserDeath");
            // clear out bullet -- put y offscreen, will get reaped next update
            this.bulletActive = false;
            my.sprite.laser.y = -50;
            my.sprite.ufo.visible = false;
            my.sprite.ufo.x = -100;
            // Update score
            this.myScore += 200;
            this.updateScore();
            this.alienTimer = 300;
            // Play sound
            this.sound.play("hitAlien", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }

        if (this.collides(my.sprite.monkey, my.sprite.spit)) {
            // clear out bullet -- put y offscreen, will get reaped next update
            this.spitActive = false;
            my.sprite.spit.y = -100;
            // Update score
            this.heartCount--;
            this.updateHealth();
            // Play sound
            this.sound.play("hitMonkey", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            // Have new hippo appear after end of animation
        }

        if (this.collides(my.sprite.monkey, my.sprite.laser)) {
            // clear out bullet -- put y offscreen, will get reaped next update
            this.bulletActive = false;
            my.sprite.laser.y = -50;
            // Update score
            this.heartCount--;
            this.updateHealth();
            // Play sound
            this.sound.play("hitMonkey", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            // Have new hippo appear after end of animation
        }

        if (this.collides(my.sprite.monkey, my.sprite.ufobeam)) {
            // clear out bullet -- put y offscreen, will get reaped next update
            my.sprite.ufobeam.x = -100;
            my.sprite.ufoCapture.visible = true;
            // Update score
            this.heartCount--;
            this.updateHealth();
            // Play sound
            this.sound.play("hitMonkey", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            // Have new hippo appear after end of animation
        }

        this.ufoCounter++;
        if (this.ufoCounter % this.alienTimer == 0) {
            switch (this.ufoType) {
                case "resting":
                    this.alienTimer = 180;
                    this.ufoType = "charging";
                    my.sprite.ufo.visible = true;
                    my.sprite.ufo.x = Math.random()*config.width;
                    break;
                case "charging":
                    this.ufoType = "attacking";
                    my.sprite.ufobeam.x = my.sprite.ufo.x;
                    my.sprite.ufobeam.visible = true;
                    break;
                case "attacking":
                    this.ufoType = "resting";
                    my.sprite.ufo.visible = false;
                    my.sprite.ufo.x = -100;
                    my.sprite.ufobeam.visible = false;
                    my.sprite.ufobeam.x = -100;
                    my.sprite.ufoCapture.visible = false;
                    this.ufoCounter = 0;
                    break;
            }
        }

        //End Condition
        if (this.heartCount == 0 || this.mobCount == 0) {
            my.sprite.mobs.visible = false;
            for (let croc of my.sprite.mobs) {
                croc.x = -100;
            }
            my.sprite.monkey.visible = false;
            my.sprite.monkey.x = 1000;
            my.sprite.ufo.y = -1000;
            my.sprite.ufobeam.y = -100;
            my.sprite.ufoCapture.x = -1000;
            my.sprite.crosshair.x = -1000;
            my.text.health.visible = false;
            my.text.score.visible = false;
            if (this.mobCount == 0) {
                my.text.endGame.setText("You Win!");
            }
            else {
                my.text.endGame.setText("You Lose!");
            }
            this.checkHighScore();
            my.text.endGame.visible = true;
            my.text.myScore.visible = true;
            my.text.highScore.visible = true;
            my.text.restart.visible = true;
            my.text.Title.visible = true;
            this.restart = true;
        }
    }

    checkHighScore() {
        let my = this.my;
        
        my.text.myScore.setText("Score " + this.myScore);
        if (this.highScore < this.myScore) {
            this.highScore = this.myScore;
        }
        my.text.highScore.setText("High Score: " + this.highScore);
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateHealth() {
        let my = this.my;
        my.sprite.hp[this.heartCount].visible = false;        
    }

    mobMove() {
        let my = this.my;
        
        for (let croc of my.sprite.mobs) {
            croc.y += .20;
        }
    }

}

         