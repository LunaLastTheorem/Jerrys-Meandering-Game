import { Scene } from "phaser";
import { EventBus } from '../events/EventBus';

export class Levels extends Scene {
    constructor() {
        super("Levels");
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
        this.load.spritesheet('map', 'assets/states.png', { frameWidth: 283, frameHeight: 282 });
    }

    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        bg.setScale(4.0);

        this.cameras.main.setBounds(0, 0, 1500, 3900);
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            this.cameras.main.scrollY += deltaY;
        }, this);

        this.createLevelButtons();
        this.createHomeButton();

        EventBus.emit('current-scene-ready', this);
    }

    createHomeButton() {
        const homeButton = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.15,
            "HOME",
            {
                fontSize: 30,
                fontFamily: "monospace",
                padding: { x: 14, y: 6 },
                backgroundColor: "#000000",
                color: "#FFFFFF"
            }
        )
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => this.scene.start("HomePage"))
            .on("pointerover", () => homeButton.setAlpha(0.5))
            .on("pointerout", () => homeButton.setAlpha(1));
    }

    createLevelButtons() {
        const levels = 49;
        let xOff = 450;
        let yOff = 400;
        const buttonSpacingX = 250;
        const buttonSpacingY = 350;

        for (let i = 0; i <= levels; i++) {
            let button = this.add.sprite(xOff, yOff, 'map', i);
            button.levelIndex = i;

            button.setTint(0xffffff);
            button.setScale(0.9);
            button.setInteractive();
            let text = this.add.text(xOff - 100, yOff - 175, "Level " + (i + 1), { fontSize: '40px', fill: '#fff' }).setFontFamily("monospace");

            button.on('pointerover', () => {
                button.setAlpha(0.5);
                text.setAlpha(0.5);
            });
            button.on('pointerout', () => {
                button.setAlpha(1.0);
                text.setAlpha(1.0);
            });

            button.on('pointerdown', () => {
                this.startLevel(button.levelIndex);
            });

            xOff += buttonSpacingX;

            if ((i + 1) % 5 === 0) {
                xOff = 450;
                yOff += buttonSpacingY;
            }
        }
    }

    startLevel(levelIndex) {
        const url = `http://127.0.0.1:5000/puzzle/${levelIndex}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Puzzle ${levelIndex} not found`);
                }
                return response.json();
            })
            .then(puzzle => {
                this.scene.start("Grid", { puzzle });
            });
    }

}