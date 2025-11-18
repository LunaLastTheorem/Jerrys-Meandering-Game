import { Scene } from "phaser";
import { EventBus } from '../EventBus';

export class HomePage extends Scene {
    constructor() {
        super("HomePage");
    }

    preload() {
        this.load.image('background', 'assets/gametitle.png');
        this.load.image('playButton', 'assets/startbutton.png');
    }

    create() {
        let back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        back.setScale(1.6);

        const playButton = this.add.image(this.cameras.main.centerX, 800, 'playButton');
        playButton.setInteractive();
        playButton.setScale(0.5);

        playButton.on('pointerover', () => {
            playButton.setAlpha(0.5);
        });
        playButton.on('pointerout', () => {
            playButton.setAlpha(1.0);
        });

        playButton.on('pointerdown', () => {
            this.scene.start("Levels");
        });

        EventBus.emit('current-scene-ready', this);
    }
}