import { Scene } from "phaser";

export class ResultsScene extends Scene {
    constructor() {
        super("ResultsScene");
    }

    init(data) {
        this.evaluationData = data.evaluationData;
        this.gridModel = data.gridModel;
        this.level = data.level;
        this.isInfinityMode = data.isInfinityMode;
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
    }

    create() {
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        bg.setScale(4.0);

        // Title
        this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.15,
            "GERRYMANDERING ANALYSIS",
            {
                fontSize: 65,
                fontFamily: "monospace",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // Build histogram
        this.buildHistogram();

        // Build summary stats
        this.buildSummaryStats();

        // Navigation buttons
        const buttonY = this.scale.height * 0.85;
        this.buildReplayButton(this.scale.width * 0.35, buttonY);
        this.buildHomeButton(this.scale.width * 0.5, buttonY);
        if (!this.isInfinityMode) {
            this.buildLevelsButton(this.scale.width * 0.65, buttonY);
        } else {
            this.buildNextPuzzleButton(this.scale.width * 0.65, buttonY);
        }

        // Cleanup on scene shutdown
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

    buildHistogram() {
        const histogramImage = this.evaluationData.histogram_image;
    
        if (!histogramImage) {
            console.error("No histogram image data received");
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
                const w = this.scale.width;
                const h = this.scale.height;

                img.style.width = Math.min(w * 0.7, 700) + "px";
                img.style.height = "auto";

                img.style.left = (w * 0.08) + "px";
                img.style.top = (h * 0.15) + "px";
            };

            updateHistogramLayout();
    
            // Add to page
            document.getElementById('game-container').appendChild(img);
            
            // Store reference for cleanup
            this.histogramImg = img;

            this.scale.on("resize", updateHistogramLayout);

            this.events.once("shutdown", () => {
                this.scale.off("resize", updateHistogramLayout);
                img.remove();
            });

            this.events.once("destroy", () => {
                this.scale.off("resize", updateHistogramLayout);
                img.remove();
            });
            
        } catch (error) {
            console.error("Error displaying histogram:", error);
        }
    }

    buildSummaryStats() {
        const stats = this.evaluationData;
        const cardWidth = this.scale.width * 0.25;
        const cardHeight = this.scale.height * 0.5;

        const x = this.scale.width * 0.65;
        const y = this.scale.height * 0.25;

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
            "SUMMARY",
            {
                fontSize: 50,
                fontFamily: "monospace",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // Stats text
        const statsText = [
            `Your Map: ${stats.submitted_seats} seats`,
            `Median: ${stats.medians} seats`,
            `Mean: ${stats.mean.toFixed(1)} seats`,
            `Range: ${stats.min}-${stats.max} seats`,
            ``,
            `Democrats favored: ${Math.round(stats.dem_favorable_pct)}%`,
            `Republicans favored: ${Math.round(stats.rep_favorable_pct)}%`,
            `Tied: ${Math.round(stats.tied_pct)}%`,
            ``,
            `Samples: ${stats.total_samples}`,
            `Vote Share: ${Math.round((stats.submitted_vote_share * 100))}%`
        ].join('\n');

        this.add.text(
            x + cardWidth / 2,
            y + 90,
            statsText,
            {
                fontSize: 24,
                fontFamily: "monospace",
                color: "#000000",
                align: "center",
                lineSpacing: 9
            }
        ).setOrigin(0.5, 0);
    }

    buildNextPuzzleButton(x, y) {
        let cols = this.gridModel.cols
        let rows = this.gridModel.rows
        let newLevel = this.level + 1
        if (newLevel % 3 === 0){
            if(cols < rows){
                cols++
            }else{
                rows++
            }
        }
        const nextButton = this.add.text(x, y, "NEXT", {
            fontSize: 24,
            fontFamily: "monospace",
            padding: { x: 12, y: 6 },
            backgroundColor: "#000000",
            color: "#FFFFFF"
        })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                nextButton.setAlpha(0.5);
                nextButton.disableInteractive();

                fetch(`http://127.0.0.1:5000/puzzle/${rows}/${cols}`)
                    .then(res => {
                        if (!res.ok) throw new Error("Failed to fetch next puzzle");
                        return res.json();
                    })
                    .then(puzzle => {
                        this.scene.start("Grid", { puzzle, isInfinityMode: true, level: newLevel });
                    })
                    .catch(err => {
                        console.error(err);
                        nextButton.setAlpha(1);
                        nextButton.setInteractive();
                        alert("Could not load next puzzle. Please try again.");
                    });
            })
            .on("pointerover", () => nextButton.setAlpha(0.5))
            .on("pointerout", () => nextButton.setAlpha(1));
    }


    buildHomeButton(x, y) {
        const homeButton = this.add.text(
            x,
            y,
            "HOME",
            {
                fontSize: 24,
                fontFamily: "monospace",
                padding: { x: 12, y: 6 },
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
                fontSize: 24,
                fontFamily: "monospace",
                padding: { x: 12, y: 6 },
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
        const replayButton = this.add.text(
            x,
            y,
            "REPLAY",
            {
                fontSize: 24,
                fontFamily: "monospace",
                padding: { x: 12, y: 6 },
                backgroundColor: "#000000",
                color: "#FFFFFF"
            }
        )
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                replayButton.setAlpha(0.5);
                replayButton.disableInteractive();
                this.scene.start("Grid");

                })
            .on("pointerover", () => replayButton.setAlpha(0.5))
            .on("pointerout", () => replayButton.setAlpha(1));
    }

}