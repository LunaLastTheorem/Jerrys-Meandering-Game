import { Scene } from "phaser";
import { EventBus } from "../../events/EventBus.js";

export class MultiplayerMode extends Scene {
    constructor() {
        super("MultiplayerMode");
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
    }

    createHomeButton() {
        const homeButton = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.25,
            "Back",
            {
                fontSize: 40,
                fontFamily: "grotesk-bold",
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

    createPvPButton() {
        const PvPButton = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.5,
            "Player VS Player",
            {
                fontSize: 40,
                fontFamily: "grotesk-bold",
                padding: { x: 14, y: 6 },
                backgroundColor: "#000000",
                color: "#FFFFFF"
            }
        )
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => this.startMultiplayerMode())
            .on("pointerover", () => PvPButton.setAlpha(0.5))
            .on("pointerout", () => PvPButton.setAlpha(1));
    }

    createAIButton() {
        const AIButton = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.75,
            "Player VS Machine",
            {
                fontSize: 40,
                fontFamily: "grotesk-bold",
                padding: { x: 14, y: 6 },
                backgroundColor: "#000000",
                color: "#FFFFFF"
            }
        )
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => this.startAIMultiplayerMode())
            .on("pointerover", () => AIButton.setAlpha(0.5))
            .on("pointerout", () => AIButton.setAlpha(1));
    }

    startMultiplayerMode() {
        const url = `http://127.0.0.1:5000/puzzle/multiplayer/10/10`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Puzzle ${levelIndex} not found`);
                }
                return response.json();
            })
            .then(puzzle => {
                this.scene.start("MultiplayerGrid", { puzzle });
            });
    }

    startAIMultiplayerMode() {
        const url = `http://127.0.0.1:5000/puzzle/multiplayer/10/10`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Puzzle ${levelIndex} not found`);
                }
                return response.json();
            })
            .then(puzzle => {
                this.scene.start("MultiplayerGrid", { puzzle, vsAI: true, aiColor: "red"});
            });
    }

    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        bg.setScale(4.0);

        this.cameras.main.setBounds(0, 0, 1500, 3800);

        this.createPvPButton();
        this.createAIButton();
        this.createHomeButton();

        EventBus.emit('current-scene-ready', this);

    }
}