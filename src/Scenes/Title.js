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

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.audio("UISound", "click3.ogg");
    }

    create() {
        let my = this.my;

        this.nextScene = this.input.keyboard.addKey("C");
        this.startGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.my.sprite.background = [];

        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 10; j++) {
                if (i % 3 == 1) {
                    my.sprite.background.push(this.add.sprite(
                        90 * i - 20, 100 * j - 50, "monkey").setScale(0.5));
                }
                else if (i % 3 == 2) {
                    my.sprite.background.push(this.add.sprite(
                        90 * i - 20, 100 * j - 50, "crocodile").setScale(0.5));
                }
                else if (i % 3 == 0) {
                    my.sprite.background.push(this.add.sprite(
                        90 * i - 20, 100 * j - 50, "ufo").setScale(0.50));
                }
            }
        }

        my.text.Title = this.add.bitmapText(config.width/4, 0, "rocketSquare", "Monkey On The Run");
        my.text.Start = this.add.bitmapText(config.width/5, config.height/2, "rocketSquare", "Press 'Space' to start");
        my.text.Credits = this.add.bitmapText(config.width/10, config.height/2 + 50, "rocketSquare", "Press 'C' for Controls/Credits ");

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Title.js</h2><br>Space: Start Game // C: Credits'
    }

    update() {
        let my = this.my;
        
        for (let prop of my.sprite.background) {
            prop.x += 1;
            prop.y += 1;
            if (prop.x > config.width + 25) {
                prop.x = 0;
            }
            if (prop.y > config.height + 25) {
                prop.y = 0;
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
}