import { Scene } from "phaser";
import { EventBus } from "../events/EventBus";

export class Tutorial extends Scene {
    constructor() {
        super("Tutorial");
    }

    preload() {
        this.load.image('board', 'assets/gameboard.png');
        this.load.image('ins', 'assets/instructions.png');
        this.load.image('dot', 'assets/dot.png');
        this.load.image('dist', 'assets/district.png');
        this.load.image('comp', 'assets/complete.png');
    }

    create() {
        const { width, height } = this.scale;

        let back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');
        back.setScale(2.0);

        this.add.text(width / 2, height * .2, "TUTORIAL", {
            fontSize: "70px",
            fontFamily: "monospace",
            color: "#ffffff"
        }).setOrigin(0.5);

        const slide1 = [
            this.add.text(width / 2, height * .75, "First choose a game mode!", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff"
            }).setOrigin(0.5),
    
            this.add.image(width / 2, height / 2 - 150, 'playButton').setScale(0.35),
            this.add.image(width / 2, height / 2, 'unlimitedButton').setScale(0.35),
            this.add.image(width / 2, height / 2 + 150, 'multiButton').setScale(0.35)
        ];

        const slide2 = [
            this.add.text(width / 2, height * .75, "After you have selected the mode/level you'd like to play, you will be directed to the game board.", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: width * 0.8 }
            }).setOrigin(0.5),

            this.add.image(width / 2, height / 2 - 40, 'board').setScale(0.35),
        ];

        const slide3 = [
            this.add.text(width / 2, height * .75, "Your task: Create districts of the instructed size out of the dots to make your color win.", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: width * 0.8 }
            }).setOrigin(0.5),

            this.add.image(width / 2, height / 2 - 50, 'ins'),
        ];

        const slide4 = [
            this.add.text(width / 2, height * .75, "How to play: Begin by selecting a dot and clicking on it. To deselect a dot press it a second time.", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: width * 0.8 }
            }).setOrigin(0.5),

            this.add.image(width / 2, height / 2 - 50, 'dot').setScale(0.4),
        ];

        const slide5 = [
            this.add.text(width / 2, height * .75, "Making a district: Select the dots that you would like to combine into a district. Districts are made up of contiguous dots, meaning that they must all connect.", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: width * 0.8 }
            }).setOrigin(0.5),

            this.add.image(width / 2, height / 2 - 50, 'dist').setScale(0.4),
        ];

        const slide6 = [
            this.add.text(width / 2, height * .75, "Completing the puzzle: The puzzle can be submitted after all the dots have been placed into their own district.", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: width * 0.8 }
            }).setOrigin(0.5),

            this.add.image(width / 2, height / 2 - 50, 'comp').setScale(0.4),
        ];

        const slide7 = [
            this.add.text(width / 2, height * .75, "Your Turn!", {
                fontSize: "42px",
                fontFamily: "monospace",
                color: "#ffffff"
            }).setOrigin(0.5),
        ];

        this.slides = [slide1, slide2, slide3, slide4, slide5, slide6, slide7];
        this.currentSlide = 0;

        this.slides.forEach((slide, index) => {
        slide.forEach(obj => obj.setVisible(index === 0));
        });

        const nextButton = this.add.text(width / 2 + 175, height * .9, "NEXT", {
            fontSize: "48px",
            fontFamily: "monospace",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        nextButton.on('pointerover', () => {
            nextButton.setAlpha(0.5);
        });
        nextButton.on('pointerout', () => {
            nextButton.setAlpha(1.0);
        });
        nextButton.on('pointerdown', () => {
            this.nextSlide();
        });

        const prevButton = this.add.text(width / 2 - 175, height * .9, "PREVIOUS", {
            fontSize: "48px",
            fontFamily: "monospace",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setName('prevButton');

        prevButton.on('pointerover', () => {
            prevButton.setAlpha(0.5);
        });
        prevButton.on('pointerout', () => {
            prevButton.setAlpha(1.0);
        });
        prevButton.on('pointerdown', () => {
            this.prevSlide();
        });

        prevButton.setVisible(false);

        this.createHomeButton();

    }

    nextSlide() {
        this.slides[this.currentSlide].forEach(obj => obj.setVisible(false));

        this.currentSlide = (this.currentSlide + 1) % this.slides.length;

        this.updatePrevButtonVisibility();
    
        this.slides[this.currentSlide].forEach(obj => obj.setVisible(true));
    }

    prevSlide() {
        this.slides[this.currentSlide].forEach(obj => obj.setVisible(false));

        this.currentSlide = (this.currentSlide - 1) % this.slides.length;

        this.updatePrevButtonVisibility();

        this.slides[this.currentSlide].forEach(obj => obj.setVisible(true));
    }

    updatePrevButtonVisibility() {
        const prevButton = this.children.getByName('prevButton');
        if (this.currentSlide === 0) {
            prevButton.setVisible(false);
        } else {
            prevButton.setVisible(true);
        }
    }

    createHomeButton() {
        const homeButton = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.1,
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
}