import { Scene } from "phaser";
import { GridManager } from "../objects/GridManager";
import { GridModel } from "../models/GridModel";
import { DistrictManager } from "../logic/DistrictManager";
import { EventBus } from "../events/EventBus.js";

export class Grid extends Scene {
    constructor() {
        super("Grid");
    }

    preload() {
        this.initConstants();
    }

    create(data) {
        this.gridModel = new GridModel(data.puzzle);
        this.gridManager = new GridManager(this, this.gridModel);
        this.districtManager = new DistrictManager(this.gridModel);

        EventBus.on("cell:toggled", this.onCellToggled, this);
        EventBus.on("district:formed", this.onDistrictFormed, this);
        EventBus.on("district:clear", this.onDistrictClear, this);
        EventBus.on("ui:contiguous", this.onAlertContiguous, this);

        this.buildTextUI();
        this.buildSubmitButton();
        this.buildHomeButton();
        this.buildLevelsButton();

        this.events.once("shutdown", this.cleanup, this);
        this.events.once("destroy", this.cleanup, this);
    }

    initConstants() {
        this.white = 0xFFFFFF;
        this.lightBlue = 0x7FBAE7FF;
        this.lightRed = 0xFFA3A6;
        this.red = 0xE9141D;
        this.blue = 0x0015BC;
        this.textSize = 20;
        this.margin = 20;
    }

    onCellToggled({ row, col, active, isBlue }) {
        let color = this.white;
        if (active) {
            if (isBlue) {
                color = this.lightBlue;
            } else {
                color = this.lightRed;
            }
        }

        this.gridManager.setCellColor(row, col, color);
    }

    onDistrictFormed(district) {
        let color = this.white;
        if (district.winningColor === "blue") {
            color = this.lightBlue;
        }
        if (district.winningColor === "red") {
            color = this.lightRed;
        }

        for (const cell of district.cells) {
            this.gridManager.setCellColor(cell.row, cell.col, color);
        }

        this.drawBorder(district.cells);
    }

    onDistrictClear({ cells }) {
        for (const cell of cells) {
            this.gridManager.clearCell(cell.row, cell.col);
        }
        this.gridManager.graphics.clear();
    }

    onAlertContiguous({ message }) {
        alert(message);
    }

    drawBorder(cells) {
        const g = this.gridManager.graphics;
        // g.setDepth(10); // Will make sure lines are drawn above the squares
        
        const cellSize = this.gridManager.cellSize;
        const cellSet = new Set(cells.map(c => `${c.row},${c.col}`));
        
        g.clear();
        g.lineStyle(3, 0x000000, 1);
        g.beginPath();

        for (const cell of cells) {
            const rect = this.gridManager.getGraphic(cell.row, cell.col);
            const x = rect.x - cellSize / 2;
            const y = rect.y - cellSize / 2;

            const top = `${cell.row - 1},${cell.col}`;
            const bottom = `${cell.row + 1},${cell.col}`;
            const left = `${cell.row},${cell.col - 1}`;
            const right = `${cell.row},${cell.col + 1}`;

            if (!cellSet.has(top)) {
                g.moveTo(x, y);
                g.lineTo(x + cellSize, y);
            }
            if (!cellSet.has(bottom)) {
                g.moveTo(x, y + cellSize);
                g.lineTo(x + cellSize, y + cellSize);
            }
            if (!cellSet.has(left)) {
                g.moveTo(x, y);
                g.lineTo(x, y + cellSize);
            }
            if (!cellSet.has(right)) {
                g.moveTo(x + cellSize, y);
                g.lineTo(x + cellSize, y + cellSize)
            }
        }
        g.strokePath();
    }

    buildTextUI() {
        const numDistricts = (this.gridModel.rows * this.gridModel.cols) / (this.gridModel.districtSize);
        const colorToWin = "blue";

        const topMargin = this.gridManager.offsetY / 2 + 50;

        this.add.text(
            this.scale.width / 2,
            topMargin,
            `Gerrymander ${numDistricts} districts each with ${this.gridModel.districtSize} constituents!`,
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
        const buttonY = this.gridManager.offsetY + this.gridModel.rows * this.gridManager.cellSize + 50;
        const submitButton = this.add.text(
            this.scale.width / 2, 
            buttonY + 50, 
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
            this.scale.height * 0.1 + 50,
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
            this.scale.height * 0.1 + 50,
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
        let color = this.white;
        if (result === "blue") {
            color = this.blue;
        }
        if (result === "red") {
            color = this.red;
        }

        this.scene.start("Results", { result, color });
    }

    cleanup() {
        this.districtManager.destroy();

        EventBus.off("cell:toggled", this.onCellToggled, this);
        EventBus.off("district:formed", this.onDistrictFormed, this);
        EventBus.off("district:clear", this.onDistrictClear, this);
        EventBus.off("ui:contiguous", this.onAlertContiguous, this);

    }
}