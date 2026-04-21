import { Scene } from "phaser";

export class MultiplayerResults extends Scene {
    constructor() {
        super("MultiplayerResults");
    }

    init(data) {
        this.message = data.message;
        this.color = data.color;
    }

    preload() {
        this.load.image("bg", "assets/background.png");
    }

    create() {
        const bg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "bg"
        );
        bg.setScale(4.0);

        this.buildWinnerText();

        const buttonY = this.scale.height * 0.75;

        this.buildReplayButton(this.scale.width * 0.4, buttonY);
        this.buildHomeButton(this.scale.width * 0.5, buttonY);
    }

    buildWinnerText() {
        const colorHex = Phaser.Display.Color.IntegerToColor(this.color).rgba;

        this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.4,
            this.message,
            {
                fontSize: 80,
                fontFamily: "monospace",
                color: colorHex,
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 6
            }
        ).setOrigin(0.5);
    }

    buildReplayButton(x, y) {
        const btn = this.add.text(x, y, "REPLAY", {
            fontSize: 30,
            fontFamily: "monospace",
            padding: { x: 14, y: 6 },
            backgroundColor: "#000000",
            color: "#FFFFFF"
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => {
            this.scene.start("MultiplayerMode");
        })
        .on("pointerover", () => btn.setAlpha(0.5))
        .on("pointerout", () => btn.setAlpha(1));
    }

    buildHomeButton(x, y) {
        const btn = this.add.text(x, y, "HOME", {
            fontSize: 30,
            fontFamily: "monospace",
            padding: { x: 14, y: 6 },
            backgroundColor: "#000000",
            color: "#FFFFFF"
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => this.scene.start("HomePage"))
        .on("pointerover", () => btn.setAlpha(0.5))
        .on("pointerout", () => btn.setAlpha(1));
    }
}