import { Scene } from "phaser";

export class MultiplayerResults extends Scene {
    constructor() {
        super("MultiplayerResults");
    }

    init(data) {
        this.message = data.message;
        this.color = data.color;
        this.evaluationData = data.evaluationData;
        this.gridModel = data.gridModel;
        this.districtManager = data.districtManager;
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

        // Title
        this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.08,
            "BATTLE ANALYSIS",
            {
                fontSize: 65,
                fontFamily: "grotesk-bold",
                color: "#000000"
            }
        ).setOrigin(0.5);

        this.buildWinnerBanner();
        this.buildHistogram();
        this.buildBattleStats();

        const buttonY = this.scale.height * 0.85;
        this.buildReplayButton(this.scale.width * 0.35, buttonY);
        this.buildHomeButton(this.scale.width * 0.65, buttonY);

        this.events.once("shutdown", () => {
            if (this.histogramImg) {
                this.histogramImg.remove();
            }
        });
        this.events.once("destroy", () => {
            if (this.histogramImg) {
                this.histogramImg.remove();
            }
        });
    }

    buildWinnerBanner() {
        const bannerY = this.scale.height * 0.18;
        const bannerHeight = 80;
        const bannerWidth = this.scale.width * 0.5;
        const bannerX = this.scale.width / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(this.color, 1);
        graphics.fillRoundedRect(
            bannerX - bannerWidth / 2,
            bannerY - bannerHeight / 2,
            bannerWidth,
            bannerHeight,
            15
        );

        this.add.text(
            bannerX,
            bannerY,
            this.message,
            {
                fontSize: 70,
                fontFamily: "grotesk-bold",
                color: "#FFFFFF",
                stroke: "#000000",
                strokeThickness: 3
            }
        ).setOrigin(0.5);
    }

    buildHistogram() {
        const histogramImage = this.evaluationData.histogram_image;

        if (!histogramImage) {
            console.warn("No histogram image data received");
            return;
        }

        try {
            // Create a DOM image element
            const img = document.createElement('img');
            img.src = 'data:image/png;base64,' + histogramImage;

            // Style the image
            img.style.position = "absolute";
            img.style.zIndex = '100';
            img.style.border = '2px solid black';
            img.style.objectFit = 'contain';

            const updateHistogramLayout = () => {
                // Get the size and position of the Phaser canvas in the browser
                const canvasBounds = this.game.canvas.getBoundingClientRect();
                const gameW = this.scale.width;
                const gameH = this.scale.height;

                // Calculate the scale ratio between the "logical" game size and "actual" canvas size
                const multiplier = canvasBounds.width / gameW;

                // Set the image width based on a percentage of the CURRENT canvas width
                const targetWidth = Math.min(gameW * 0.5, 1000);
                img.style.width = (targetWidth * multiplier) + "px";
                img.style.height = "auto";

                // Position it relative to the canvas's top-left corner
                const relativeX = gameW * 0.08;
                const relativeY = gameH * 0.25;

                img.style.left = (canvasBounds.left + (relativeX * multiplier)) + "px";
                img.style.top = (canvasBounds.top + (relativeY * multiplier)) + "px";
            };

            document.getElementById('game-container').appendChild(img);
            this.histogramImg = img;

            img.onload = updateHistogramLayout;

            this.scale.on("resize", updateHistogramLayout);
            window.addEventListener('scroll', updateHistogramLayout);

            const cleanup = () => {
                this.scale.off("resize", updateHistogramLayout);
                window.removeEventListener('scroll', updateHistogramLayout);
                if (img.parentNode) {
                    img.remove();
                }
            };

            this.events.once("shutdown", cleanup);
            this.events.once("destroy", cleanup);

        } catch (error) {
            console.error("Error displaying histogram:", error);
        }
    }

    buildBattleStats() {
        const stats = this.evaluationData;
        const cardWidth = this.scale.width * 0.25;
        const cardHeight = this.scale.height * 0.5;

        const x = this.scale.width * 0.6;
        const y = this.scale.height * 0.28;

        const districts = this.districtManager.districtModel.getDistricts();
        let blueDistricts = 0, redDistricts = 0;

        for (const district of districts) {
            let blueVotes = 0, redVotes = 0;
            for (const cell of district.cells) {
                if (cell.isBlue) {
                    blueVotes++;
                } else {
                    redVotes++;
                }
            }

            if (blueVotes > redVotes) {
                blueDistricts++;
            } else if (redVotes > blueVotes) {
                redDistricts++;
            }
        }

        // Stats card background
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x000000, 1);
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.strokeRoundedRect(x, y, cardWidth, cardHeight, 20);
        graphics.fillRoundedRect(x, y, cardWidth, cardHeight, 20);

        // Title
        this.add.text(
            x + cardWidth / 2,
            y + 40,
            "BATTLE SUMMARY",
            {
                fontSize: 50,
                fontFamily: "grotesk-bold",
                color: "#000000"
            }
        ).setOrigin(0.5);

        const tieDistricts = stats.num_districts - (blueDistricts + redDistricts);

        const statsText = [
            `Blue Player Won ${blueDistricts} Districts`,
            `Red Player Won ${redDistricts} Districts`,
            `There were ${tieDistricts} tied Districts`,
            ``,
            `Total Simulated Maps: ${stats.total_samples} samples`,
            ``,
            stats.fairness_statement
        ].join('\n');

        this.add.text(
            x + cardWidth / 2,
            y + 95,
            statsText,
            {
                fontSize: 34,
                fontFamily: "grotesk",
                color: "#000000",
                align: "center",
                lineSpacing: 9,
                wordWrap: {
                    width: cardWidth - 20
                }
            }
        ).setOrigin(0.5, 0);
    }

    buildReplayButton(x, y) {
        const btn = this.add.text(x, y, "REPLAY", {
            fontSize: 40,
            fontFamily: "grotesk-bold",
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
            fontSize: 40,
            fontFamily: "grotesk-bold",
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