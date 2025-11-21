import { Scene } from "phaser";
import { GridManager } from "../objects/GridManager";
import { DistrictManager } from "../objects/DistrictManager";

export class Grid extends Scene {
    constructor() {
        super("Grid");
    }

    preload() {
        this.initConstants();
    }

    create() {
        this.gridManager = new GridManager(this);
        this.districtManager = new DistrictManager(this, this.gridManager);

        this.buildTextUI();
        this.buildSubmitButton();
        this.buildHomeButton();
        this.buildLevelsButton();
    }

    initConstants() {
        this.white = 0xFFFFFF;
        this.lightBlue = 0xBDD5E7;
        this.lightRed = 0xFFA3A6;
        this.red = 0xE9141D;
        this.blue = 0x0015BC;
        this.textSize = 20;
        this.margin = 20;
    }

    handleClickCell(cell) {
        this.districtManager.handleClickCell(cell);
    }

    buildTextUI() {
        const numDistricts = (this.gridManager.rows * this.gridManager.cols) / (this.gridManager.districtSize);
        const colorToWin = "red";

        const topMargin = this.gridManager.offsetY / 2;

        this.add.text(
            this.scale.width / 2,
            topMargin,
            `Gerrymander ${numDistricts} districts each with ${this.gridManager.districtSize} constituents!`,
            this.textStyle("black")
        ).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            topMargin + this.textSize + 10,
            `Help ${colorToWin.toUpperCase()} win!`,
            this.textStyle(colorToWin === "blue" ? "#0015BC" : "#E9141D")
        ).setOrigin(0.5);
    }

    buildSubmitButton() {
        const buttonY = this.gridManager.offsetY + this.gridManager.rows * this.gridManager.cellSize + 50;
        const submitButton = this.add.text(
            this.scale.width / 2, 
            buttonY, 
            "SUBMIT", 
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
        .on("pointerdown", () => this.displayWon())
        .on("pointerover", () => submitButton.setAlpha(0.5))
        .on("pointerout", () => submitButton.setAlpha(1));
    }

    buildHomeButton() {
        const homeButton = this.add.text(
            this.scale.width * 0.45,
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

    buildLevelsButton() {
        const levelsButton = this.add.text(
            this.scale.width * 0.55,
            this.scale.height * 0.1,
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

    textStyle(color) {
        return {
            fontSize: this.textSize,
            fontFamily: "monospace",
            color,
            fontStyle: "bold"
        };
    }

    displayWon() {
        const result = this.districtManager.computeWinner();
        this.scene.start("Results", result);
    }
}