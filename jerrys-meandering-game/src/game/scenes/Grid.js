import { Scene } from "phaser";
import { GridManager } from "../objects/GridManager";
import { GridModel } from "../models/GridModel";
import { DistrictManager } from "../logic/DistrictManager";
import { EventBus } from "../events/EventBus.js";

/**
 * This class is a Phaser Scene object that creates what the main game mode displays.
 * 
 * It initializes the GridModel, the GridManager, and the DistrictManager. It also creates the
 * event listeners with the EventBus which receive the signals when a cell is clicked, and updates 
 * accordingly.
 */
export class Grid extends Scene {
    constructor() {
        super("Grid");
    }

    preload() {
        this.initConstants();
    }

    /**
     * This method creates the Grid Scene and initializes the GridManager, GridModel, and DistrictManager.
     * It calls various helper methods to display the text and buttons. Once the scene is closed, it
     * destroys the events from the EventBus.
     * 
     * @param {object} data An object that has a puzzle object. Each puzzle object has an index, rows, cols, and districtSize.
     */
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

    /**
     * Helper method to initialize Color hex codes that are frequently used, the text size, and the margin size.
     */
    initConstants() {
        this.white = 0xFFFFFF;
        this.lightBlue = 0x7FBAE7FF;
        this.lightRed = 0xFFA3A6;
        this.red = 0xE9141D;
        this.blue = 0x0015BC;
        this.textSize = 20;
        this.margin = 20;
    }

    /**
     * This method is called when the user clicks on a cell on the grid. It calls the setCellColor()
     * method in gridManager to change the color of the cell to red or blue, depending on the color
     * of the circle. 
     * 
     * @param {integer} row the row number of the cell clicked
     * @param {integer} col the column number of the cell clicked
     * @param {boolean} active True if the cell is active (already been clicked), False otherwise
     * @param {boolean} isBlue True if the cell circle is blue, False if it is red
     */
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

    /**
     * This method is called when a district has been formed. It visually changes the color of the cells
     * to the winningColor and draws a border around them to help the district stand out.
     * 
     * @param {object} district Has two objects cells and winningColor. cells is a list of cells that
     * are in a District which each have attributes r (the row number), c (the col number), isBlue (True if
     * cell is blue, false if red), active (true if selected, false otherwise), and locked (true if in a 
     * district, false otherwise). winningColor is the color that won the district.
     */
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

    /**
     * This method is called when a district is cleared. It visually resets the color of the cell
     * to white using the GridManager.
     * 
     * @param {object} cells This is the list of cells in a district that need to be cleared. 
     */
    onDistrictClear({ cells }) {
        for (const cell of cells) {
            this.gridManager.clearCell(cell.row, cell.col);
        }
        this.gridManager.graphics.clear();
    }

    /**
     * This method is called when the user tries to select a cell that isn't contiguous to the other cells
     * they have selected. It sends an alert to the UI.
     * 
     * @param {object} message This is the alert message that gets sent to the user if they violate contiguity.
     */
    onAlertContiguous({ message }) {
        alert(message);
    }

    /**
     * This is a helper method to onDistrictFormed. It uses the GridManager's graphics object to draw
     * a border around a district. 
     * 
     * @param {object} cells This is the list of cells to draw the border around. Each cell has a row,
     * column.
     */
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

    /**
     * This method adds the text that displays the players goal to the UI.
     */
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

    /**
     * This method creates the submit button, and sets the button to call the displayWon() method when clicked.
     */
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

    /**
     * This method creates the Home button. When selected, it starts the HomePage scene.
     */
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

    /**
     * This method creates the Levels button. When selected, it starts the Levels scene.
     */
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

    /**
     * This method is called when the user selects the submit button. It calls the computeWinner() method
     * in the DistrictManager and starts the Results page with the winner and it's color. 
     */
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

    /**
     * This method is called when the Grid scene is left. It destroys the events that were created.
     * This is done to ensure that if the Grid scene is reloaded, there are not duplicate events.
     */
    cleanup() {
        this.districtManager.destroy();

        EventBus.off("cell:toggled", this.onCellToggled, this);
        EventBus.off("district:formed", this.onDistrictFormed, this);
        EventBus.off("district:clear", this.onDistrictClear, this);
        EventBus.off("ui:contiguous", this.onAlertContiguous, this);

    }
}