import { Scene } from "phaser";
import { EventBus } from '../events/EventBus';

export class HomePage extends Scene {
    constructor() {
        super("HomePage");
    }

    preload() {
        this.load.image('background', 'assets/title.png');
        this.load.image('bg', 'assets/background.png');
        this.load.image('playButton', 'assets/start.png');
        this.load.image('unlimitedButton', 'assets/unlimited.png');
        this.load.image('multiButton', 'assets/multi.png');
    }

    create() {
        let back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        back.setScale(2.0);

        const playButton = this.add.image(this.cameras.main.centerX, 825, 'playButton');
        playButton.setInteractive();
        playButton.setScale(0.35);

        playButton.on('pointerover', () => {
            playButton.setAlpha(0.5);
        });
        playButton.on('pointerout', () => {
            playButton.setAlpha(1.0);
        });

        playButton.on('pointerdown', () => {
            this.scene.start("Levels");
        });

        const infinityMode = this.add.image(this.cameras.main.centerX - 175, 975, 'unlimitedButton')
        infinityMode.setInteractive()
        infinityMode.setScale(0.35)

        infinityMode.on('pointerover', () => {
            infinityMode.setAlpha(0.5);
        });
        infinityMode.on('pointerout', () => {
            infinityMode.setAlpha(1.0);
        });

        infinityMode.on('pointerdown', () => {
            this.scene.start("InfinityMode")
        })
        
        const multiplayerMode = this.add.image(this.cameras.main.centerX + 175, 975, 'multiButton')
        multiplayerMode.setInteractive()
        multiplayerMode.setScale(0.35)
        
        multiplayerMode.on('pointerover', () => {
            multiplayerMode.setAlpha(0.5);
        });
        multiplayerMode.on('pointerout', () => {
            multiplayerMode.setAlpha(1.0);
        });
        
        multiplayerMode.on('pointerdown', () => {
            this.scene.start("MultiplayerMode")
        })

        const tutorialButton = this.add.graphics()
        tutorialButton.fillStyle(0x002387, 1);
        tutorialButton.fillCircle(this.cameras.main.centerX + 195, 825, 30);

        const touchSensor = new Phaser.Geom.Circle(this.cameras.main.centerX + 195, 825, 30);
        tutorialButton.setInteractive(touchSensor, Phaser.Geom.Circle.Contains);

        const symbol = this.add.text(this.cameras.main.centerX + 195, 825, "?", {
            fontSize: '40px',
            color: '#ffffff',
            fontStyle: "bold"
        }).setOrigin(0.5);

        tutorialButton.on('pointerover', () => {
            tutorialButton.setAlpha(0.5);
            symbol.setAlpha(0.5);
        });
        tutorialButton.on('pointerout', () => {
            tutorialButton.setAlpha(1.0);
            symbol.setAlpha(1.0);
        });
        tutorialButton.on('pointerdown', () => {
            this.scene.start("Tutorial");
        });

        EventBus.emit('current-scene-ready', this);
    }
}