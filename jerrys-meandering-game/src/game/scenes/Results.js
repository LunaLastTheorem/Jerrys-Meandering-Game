import { Scene } from "phaser";

export class Results extends Scene {
    constructor() {
        super("Results");
    }

    init(data) {
        this.message = data.message;
        this.color = data.color;
        this.infinityModeFlag = data.infinityModeFlag
        console.log(this.infinityModeFlag)
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
    }

    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        bg.setScale(4.0);
        this.buildResultsMessage();
        const card = this.buildStatsCard();

        const buttonY = card.y + card.height + 50;
        this.buildReplayButton(this.scale.width * 0.40, buttonY);
        this.buildHomeButton(this.scale.width * 0.5, buttonY);

        if (!this.infinityModeFlag) {
            this.buildLevelsButton(this.scale.width * 0.60, buttonY);
        }
        else {
            // TODO next Level button
        }
    }

    buildResultsMessage() {
        this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.35,
            this.message,
            {
                fontSize: 60,
                fontFamily: "monospace",
                color: Phaser.Display.Color.IntegerToColor(this.color).rgba,
                fontStyle: "bold"
            }
        )
            .setOrigin(0.5);
    }

    buildStatsCard() {
        const cardWidth = this.scale.width / 5;
        const cardHeight = this.scale.height / 4;

        const x = (this.scale.width - cardWidth) / 2;
        const y = this.scale.height * 0.35 + 50;

        const graphics = this.add.graphics();
        graphics.lineStyle(8, 0x000000, 1);
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.strokeRoundedRect(x, y, cardWidth, cardHeight, 20);
        graphics.fillRoundedRect(x, y, cardWidth, cardHeight, 20);

        this.add.text(
            x + cardWidth / 2,
            y + 50,
            "RESULTS",
            {
                fontSize: 35,
                fontFamily: "monospace",
                color: "#000000",
                align: "center",
                fontStyle: "bold"
            }
        )
            .setOrigin(0.5);

        const statsText = "Moves: 12\n Time: 30sec\n Stars: ***"
        this.add.text(
            x + cardWidth / 2,
            y + cardHeight / 2,
            statsText,
            {
                fontSize: 25,
                fontFamily: "monospace",
                color: "#000000",
                align: "center",
            }
        )
            .setOrigin(0.5);

        return { x, y, width: cardWidth, height: cardHeight };
    }

    buildHomeButton(x, y) {
        const homeButton = this.add.text(
            x,
            y,
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

    buildLevelsButton(x, y) {
        const levelsButton = this.add.text(
            x,
            y,
            "LEVELS",
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
            .on("pointerdown", () => this.scene.start("Levels"))
            .on("pointerover", () => levelsButton.setAlpha(0.5))
            .on("pointerout", () => levelsButton.setAlpha(1));
    }

    buildReplayButton(x, y) {
        const levelsButton = this.add.text(
            x,
            y,
            "REPLAY",
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
            .on("pointerdown", () => this.scene.start("Grid"))
            .on("pointerover", () => levelsButton.setAlpha(0.5))
            .on("pointerout", () => levelsButton.setAlpha(1));
    }

}