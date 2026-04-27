import { Scene } from "phaser";
import { EventBus } from '../events/EventBus';

export class HomePage extends Scene {
    constructor() {
        super("HomePage");
    }

    preload() {
        this.load.image('background', 'assets/gamehome.png');
        this.load.image('bg', 'assets/border.png');
        this.load.image('gecko', 'assets/gecko.png');
        this.load.image('playButton', 'assets/startb.png');
        this.load.image('unlimitedButton', 'assets/unlimitedb.png');
        this.load.image('multiButton', 'assets/multib.png');
        this.load.font('grotesk', 'assets/fonts/recent-grotesk-regular.otf', 'opentype');
        this.load.font('grotesk-bold', 'assets/fonts/recent-grotesk-bold.otf', 'opentype');
    }

    create() {
        const { width, height } = this.scale;
        let back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 40, 'background');
        back.setScale(0.28);

        this.add.text(width / 2, height * .1, "JERRYS MEANDERING GAME", {
            fontSize: "80px",
            fontFamily: "grotesk-bold",
            color: "#000000"
        }).setOrigin(0.5);

        this.add.image(width / 2, height * .32, 'gecko').setScale(0.35);

        const playButton = this.add.image(this.cameras.main.centerX, 825, 'playButton');
        playButton.setInteractive();
        playButton.setScale(0.25);

        playButton.on('pointerover', () => {
            playButton.setAlpha(0.5);
        });
        playButton.on('pointerout', () => {
            playButton.setAlpha(1.0);
        });

        playButton.on('pointerdown', () => {
            this.scene.start("Levels");
        });

        const infinityMode = this.add.image(this.cameras.main.centerX - 105, 950, 'unlimitedButton')
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
        
        const multiplayerMode = this.add.image(this.cameras.main.centerX + 115, 950, 'multiButton')
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
        tutorialButton.fillStyle(0x1E439B, 1);
        tutorialButton.fillCircle(this.cameras.main.centerX + 180, 825, 30);

        const touchSensor = new Phaser.Geom.Circle(this.cameras.main.centerX + 180, 825, 30);
        tutorialButton.setInteractive(touchSensor, Phaser.Geom.Circle.Contains);

        const symbol = this.add.text(this.cameras.main.centerX + 180, 825, "?", {
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

        const borderDiv = document.createElement('div');
        borderDiv.style.position = 'fixed';
        borderDiv.style.top = '0';
        borderDiv.style.left = '0';
        borderDiv.style.width = '100vw';
        borderDiv.style.height = '100vh';
        borderDiv.style.border = '15px solid transparent';
        borderDiv.style.pointerEvents = 'none';
        borderDiv.style.boxSizing = 'border-box';
        borderDiv.style.zIndex = '9999';
        borderDiv.style.borderImage = 'linear-gradient(to right, blue, red, blue) 1';
        document.body.appendChild(borderDiv);

        const style = document.createElement('style');
        style.textContent = `
        @keyframes gradientShift {
            0% { border-image: linear-gradient(to right, blue, red, blue) 1; }
            50% { border-image: linear-gradient(to right, red, blue, red) 1; }
            100% { border-image: linear-gradient(to right, blue, red, blue) 1; }
        }
        .dynamic-border {
            animation: gradientShift 5s linear infinite;
        }
        `;
        document.head.appendChild(style);
        borderDiv.classList.add('dynamic-border');

        this.events.on('shutdown', () => {
            if (borderDiv) {
                borderDiv.classList.remove('dynamic-border');
                borderDiv.style.borderImage = 'linear-gradient(to right, blue, red, blue) 1';
            }
        });

        EventBus.emit('current-scene-ready', this);
    }
}