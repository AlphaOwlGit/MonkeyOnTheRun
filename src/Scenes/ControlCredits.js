class ControlCredits extends Phaser.Scene {
    constructor() {
        super("controlCredits");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}, text: {}};     
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("monkey", "monkey.png");
        this.load.image("crocodile", "crocoile.png");
        this.load.image("ufo", "shipGreen_manned.png");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.audio("UISound", "click3.ogg");
    }

    create() {
        let my = this.my;
        
        this.nextScene = this.input.keyboard.addKey("T");

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

        my.text.Title = this.add.bitmapText(200, 0, "rocketSquare", "Controls: ");

        my.text.AText = this.add.bitmapText(50, 100, "rocketSquare", "A: Move Monkey Left");
        my.text.DText = this.add.bitmapText(50, 125, "rocketSquare", "D: Move Monkey Right");
        my.text.LeftArrowText = this.add.bitmapText(50, 150, "rocketSquare", "Left Arrow: Move Crosshair Left");
        my.text.RightArrowText = this.add.bitmapText(50, 175, "rocketSquare", "Right Arrow: Move Right Right");
        my.text.SpaceText = this.add.bitmapText(50, 200, "rocketSquare", "Space: Fire");
        my.text.StartText = this.add.bitmapText(50, 225, "rocketSquare", "S: Start Game (Title Screen Only)");
        my.text.RText = this.add.bitmapText(50, 250, "rocketSquare", "R: Restart (Endgame Only)");
        my.text.CText = this.add.bitmapText(50, 275, "rocketSquare", "C: Credits (Title Screen Only)");

        my.text.Rules = this.add.bitmapText(50, 350, "rocketSquare", "Rules:");
        my.text.Rules1 = this.add.bitmapText(50, 375, "rocketSquare", "Kill all the crocodiles");
        my.text.Rules2 = this.add.bitmapText(50, 400, "rocketSquare", "Before they kill you or");
        my.text.Rules3 = this.add.bitmapText(50, 425, "rocketSquare", "reach the bottom. Use");
        my.text.Rules4 = this.add.bitmapText(50, 450, "rocketSquare", "your laser at the top of the");
        my.text.Rules5 = this.add.bitmapText(50, 475, "rocketSquare", "screen to kill your foes. Avoid");
        my.text.Rules6 = this.add.bitmapText(50, 500, "rocketSquare", "getting hit by their sneeze,");
        my.text.Rules7 = this.add.bitmapText(50, 525, "rocketSquare", "the UFO, or even your laser.");
        my.text.Rules8 = this.add.bitmapText(50, 550, "rocketSquare", "You lose once you lose all your");
        my.text.Rules9 = this.add.bitmapText(50, 575, "rocketSquare", "hearts or once the crocs reach");
        my.text.Rules9 = this.add.bitmapText(50, 600, "rocketSquare", "the bottom.");

        my.text.Credit = this.add.bitmapText(50, 650, "rocketSquare", "Credits");
        my.text.Credit = this.add.bitmapText(50, 675, "rocketSquare", "Created by Garrett Yu");
        my.text.Credit2 = this.add.bitmapText(50, 700, "rocketSquare", "Created for CMPM 120");
        my.text.Credit3 = this.add.bitmapText(50, 725, "rocketSquare", "Thanks to Kenny's Assets");



        my.text.Return = this.add.bitmapText(50, 800, "rocketSquare", "Press 'T' for Title Screen");

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>ControlCredits.js</h2><br>T: Return to Title Screen'
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

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("title");
            this.sound.play("UISound", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }
    }
}