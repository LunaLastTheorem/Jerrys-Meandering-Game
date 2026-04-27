import { Scene } from "phaser";

export class Loading extends Scene {
    constructor() {
        super("Loading");
    }

    init(data) {
        this.levelIndex = data.levelIndex;
    }

    create() {
        const { width, height } = this.scale;

        let back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        back.setScale(2.0);

        this.add.text(width / 2, height * 0.2, "Loading Level...", {
            fontSize: "52px",
            fontFamily: "grotesk-bold",
            color: "#000000"
        }).setOrigin(0.5);

        const barWidth = width * 0.75;
        const barHeight = 35;

        this.barBg = this.add.rectangle(width / 2, height * 0.6, barWidth, barHeight, 0x222222);

        this.progressBar = this.add.rectangle(
            width / 2 - barWidth / 2,
            height * 0.6,
            0,
            barHeight,
            0xffffff
        ).setOrigin(0, 0.5);

        this.percentText = this.add.text(width / 2, height * 0.65, "0%", {
            fontSize: "44px",
            fontFamily: "grotesk",
            color: "#000000"
        }).setOrigin(0.5);

        this.facts = [
            "Alabama: A federal court ruled in 2023 that the state's congressional map likely violated the Voting Rights Act by diluting Black voting power; a second majority-Black district was ordered and implemented for 2024.",
            
            "North Carolina: After a 2023 state supreme court shift, prior rulings against partisan gerrymandering were overturned, allowing a new Republican-favored congressional map.",
            
            "New York: A Democratic-drawn map was struck down in 2022 as an unconstitutional partisan gerrymander, leading to a court-drawn replacement, with ongoing efforts to redraw again.",
            
            "Wisconsin: Legislative maps strongly favor Republicans despite close statewide vote totals; the issue remains heavily litigated after a 2023 court shift.",
            
            "Texas: Multiple lawsuits challenge maps for alleged racial and partisan gerrymandering, especially in rapidly growing urban areas.",
            
            "Florida: A 2022 map backed by Governor Ron DeSantis eliminated a majority-Black district and is still being challenged in court.",
            
            "Ohio: The state supreme court ruled maps unconstitutional multiple times, but elections still proceeded under disputed maps due to delays.",
            
            "Georgia: A federal court in 2023 found maps diluted Black voting power and ordered additional majority-Black districts.",
            
            "Pennsylvania: In 2018, the state supreme court struck down a Republican-drawn map as a partisan gerrymander and replaced it with a court-drawn version.",
            
            "Michigan: Uses an independent redistricting commission created in 2018 to reduce partisan gerrymandering, though maps still face legal challenges.",
            
            "Illinois: Democrats drew congressional maps widely criticized as aggressive partisan gerrymanders to maximize advantage.",
            
            "Maryland: A Democratic gerrymander was struck down in 2022, forcing a less partisan redraw.",
            
            "Louisiana: Courts ruled the state likely violated the Voting Rights Act by having only one majority-Black district; a second district was added.",
            
            "Arizona: Uses an independent redistricting commission, though maps still face lawsuits over fairness and representation.",
            
            "Virginia: A bipartisan commission failed in 2021, so the state supreme court drew the legislative maps now in use."
        ]

        this.factText = this.add.text(width / 2, height * 0.75, "", {
            fontSize: "50px",
            fontFamily: "grotesk",
            color: "#000000",
            align: "center",
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);

        this.rotateFacts();
        this.loadLevel();
    }

    rotateFacts() {
        this.factText.setText(
            this.facts[Math.floor(Math.random() * this.facts.length)]
        );  
    }

    loadLevel() {
        const url = `http://127.0.0.1:5000/puzzle/${this.levelIndex}`;

        const MIN_LOAD_TIME = 1500;
        const startTime = Date.now();

        let progress = 0;

        const progressTimer = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (progress < 0.9) {
                    progress += 0.02;
                    this.updateProgress(progress);
                }
            }
        });

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Level not found");
                return res.json();
            })
            .then(puzzle => {
                const elapsed = Date.now() - startTime;
                const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsed);

                progressTimer.remove(false);

                this.updateProgress(1);

                this.time.delayedCall(remainingTime, () => {
                    this.showContinueButton(puzzle);
                });
            })
            .catch(err => {
                console.error(err);
            });
    }

    updateProgress(value) {
        const barWidth = this.barBg.width;

        this.progressBar.width = barWidth * value;
        this.percentText.setText(Math.floor(value * 100) + "%");
    }

    showContinueButton(puzzle) {
        const { width, height } = this.scale;

        const nextButton = this.add.text(width / 2, height * 0.85, "CONTINUE", {
            fontSize: "48px",
            fontFamily: "grotesk-bold",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        nextButton.on("pointerover", () => {
            nextButton.setAlpha(0.5);
        });

        nextButton.on("pointerout", () => {
            nextButton.setAlpha(1.0);
        });

        nextButton.on("pointerdown", () => {
            this.cameras.main.fadeOut(300);

            this.time.delayedCall(300, () => {
                this.scene.start("Grid", { puzzle });
            });
        });
    }
}