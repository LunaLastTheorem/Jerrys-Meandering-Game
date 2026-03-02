import { Scene } from "phaser";
import { EventBus } from '../events/EventBus';

export class HomePage extends Scene {
    constructor() {
        super("HomePage");
    }

    preload() {
        this.load.image('background', 'assets/title.png');
        this.load.image('playButton', 'assets/start.png');
        this.load.image('unlimitedButton', 'assets/unlimited.png');
    }

    create() {
        let back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        back.setScale(2.0);

        const playButton = this.add.image(this.cameras.main.centerX, 800, 'playButton');
        playButton.setInteractive();
        playButton.setScale(0.4);

        playButton.on('pointerover', () => {
            playButton.setAlpha(0.5);
        });
        playButton.on('pointerout', () => {
            playButton.setAlpha(1.0);
        });

        playButton.on('pointerdown', () => {
            this.scene.start("Levels");
        });

        const infinityMode = this.add.image(this.cameras.main.centerX, 950, 'unlimitedButton') // PLaCE HOLDER FOR INFINITY MODE
        infinityMode.setInteractive()
        infinityMode.setScale(0.4)

        infinityMode.on('pointerover', () => {
            infinityMode.setAlpha(0.5);
        });
        infinityMode.on('pointerout', () => {
            infinityMode.setAlpha(1.0);
        });
        
        infinityMode.on('pointerdown', () => {
            this.scene.start("InfinityMode")
        })

        EventBus.emit('current-scene-ready', this);
    }
}