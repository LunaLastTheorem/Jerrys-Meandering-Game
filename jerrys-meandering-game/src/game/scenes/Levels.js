import { Scene } from "phaser";
import { EventBus } from '../EventBus';

export class Levels extends Scene {
    constructor() {
        super("Levels");
    }

    preload() {
        this.load.image('bg', 'assets/map.png');
        this.load.image('levelbutton', 'assets/gerrymander.png');
    }

    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        bg.setScale(2.5);
        this.createLevelButtons();

        EventBus.emit('current-scene-ready', this);
    }

    createLevelButtons() {
        const levels = 9;
        let xOff = 700;
        let yOff = 300;
        const buttonSpacing = 250;

        for(let i = 1; i <= levels; i++) {
            let button = this.add.image(xOff, yOff, 'levelbutton');
            button.setScale(0.2);
            button.setTint(0xF6E8B1);
            button.setInteractive();
            this.add.text(xOff, yOff, i, { fontSize: '45px', fill: '#302' }).setOrigin(0.5);

            button.on('pointerover', () => {
                button.setAlpha(0.5);
            });
            button.on('pointerout', () => {
                button.setAlpha(1.0);
            });

            button.on('pointerdown', () => {
                this.scene.start("Grid");
            });

            xOff += buttonSpacing;

            if (i % 3 === 0) {
                xOff = 700;
                yOff += buttonSpacing;
            }
        }
    }

}