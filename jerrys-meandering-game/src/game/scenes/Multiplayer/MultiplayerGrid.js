import { Scene } from "phaser";
import { GridManager } from "../../objects/GridManager.js";
import { GridModel } from "../../models/GridModel.js";
import { DistrictModel } from "../../models/DistrictModel.js";
import { MultiplayerDistrictManager } from "../../logic/MultiplayerDistrictManager.js";
import { EventBus } from "../../events/EventBus.js";
import { PuzzleSubmissionService } from "../../services/PuzzleSubmissionService.js";

export class MultiplayerGrid extends Scene {
    constructor() {
        super("MultiplayerGrid");
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
        this.currentLevelIndex = data.puzzle.index;
        this.puzzleId = data.id ?? 0;
        this.isInfiniteMode = data.isInfinityMode ?? false;
        this.gridModel = new GridModel(data.puzzle);
        this.districtModel = new DistrictModel();
        this.gridManager = new GridManager(this, this.gridModel);
        this.districtManager = new MultiplayerDistrictManager(this.gridModel, this.districtModel);
        this.submissionService = new PuzzleSubmissionService();
        this.activeDistricts = []; // Track all active districts for border management
        this.level = data.level;

        this.currentTurn = "blue";
        this.turnLocked = false;

        this.permLocked = new Set()

        EventBus.on("cell:toggled", this.onCellToggled, this);
        EventBus.on("district:formed", this.onDistrictFormed, this);
        EventBus.on("district:clear", this.onDistrictClear, this);
        EventBus.on("ui:contiguous", this.onAlertContiguous, this);

        this.buildTextUI();
        this.buildTurnIndicator();

        this.buildLockButton();
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
        this.textSize = 40;
        this.margin = 20;
    }

    /**
     * Builds the turn indicator text shown between the title and the grid.
     * Updated every time switchTurn() is called.
     */
    buildTurnIndicator() {
        const topMargin = this.gridManager.offsetY / 2 + 25;

        this.turnText = this.add.text(
            this.scale.width / 2,
            topMargin + this.textSize * 2 + 5,
            this.getTurnLabel(),
            this.turnTextStyle()
        ).setOrigin(0.5);
    }

    getTurnLabel() {
        return `🔵 BLUE'S TURN — Draw a district`;
    }

    turnTextStyle() {
        const isBlue = this.currentTurn === "blue";
        return {
            fontSize: this.textSize + 2,
            fontFamily: "grotesk-bold",
            color: isBlue ? "#0015BC" : "#E9141D",
            backgroundColor: isBlue ? "#D6E8FB" : "#FADADD",
            padding: { x: 12, y: 6 }
        };
    }

    validTurn() {
        if (this.districtManager.selectedCells.length < this.gridModel.districtSize) {
            alert("Finish your current district before switching!");
            return false;
        }

        if (!this.hasNoSolitaryIslands()) {
            alert("This district would strand cells that can't form a valid region!")
            return false
        }

        return true;
    }

    hasNoSolitaryIslands() {
        const freeCells = [];
        const lockedSet = this.districtManager.permanentlySelectedCells
        const currentSelection = new Set(
            this.districtManager.selectedCells.map(c => `${c.row},${c.col}`)
        );

        for (let r = 0; r < this.gridModel.rows; r++) {
            for (let c = 0; c < this.gridModel.cols; c++) {
                const key = `${r},${c}`;
                if (!lockedSet.has(key) && !currentSelection.has(key)) {
                    freeCells.push({ row: r, col: c });
                }
            }
        }

        const freeSet = new Set(freeCells.map(c => `${c.row},${c.col}`));
        const visited = new Set();

        for (const cell of freeCells) {
            const startKey = `${cell.row},${cell.col}`;
            if (visited.has(startKey)) continue;

            const component = [];
            const queue = [cell];
            visited.add(startKey);

            while (queue.length) {
                const { row, col } = queue.shift();
                component.push({ row, col });
                for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                    const key = `${row + dr},${col + dc}`;
                    if (freeSet.has(key) && !visited.has(key)) {
                        visited.add(key);
                        queue.push({ row: row + dr, col: col + dc });
                    }
                }
            }

            if (component.length % this.gridModel.districtSize !== 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Switches the active turn and refreshes the indicator label.
     * Sets turnLocked briefly so rapid clicks don't bleed across turns.
     */
    switchTurn() {
        if (!this.validTurn()) {
            return
        }

        this.districtManager.lockSelection()

        this.currentTurn = this.currentTurn === "blue" ? "red" : "blue";
        const isBlue = this.currentTurn === "blue";

        this.turnText.setText(
            `${isBlue ? "🔵 BLUE" : "🔴 RED"}'S TURN — Draw a district`
        );
        this.turnText.setStyle(this.turnTextStyle());

        this.turnLocked = true;
        this.time.delayedCall(400, () => { this.turnLocked = false; });
    }

    buildLockButton() {
        const buttonY = this.gridManager.offsetY + this.gridModel.rows * this.gridManager.cellSize + 50;
        const submitButton = this.add.text(
            this.scale.width / 2,
            buttonY + 10,
            "Switch Turn",
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
            .on("pointerdown", () => this.switchTurn())
            .on("pointerover", () => submitButton.setAlpha(0.5))
            .on("pointerout", () => submitButton.setAlpha(1));
    }

    /**
     * Guards cell interaction by current turn.
     * If turnLocked is true (mid-transition) the click is silently ignored.
     */
    onCellToggled({ row, col, active, isBlue }) {
        if (this.turnLocked) return;
        if (this.districtManager.selectedCells.length === this.gridModel.districtSize) return;

        let color = this.white;
        if (active) {
            color = isBlue ? this.lightBlue : this.lightRed;
        }
        this.gridManager.setCellColor(row, col, color);
    }

    /**
     * When a district is formed, color it, track it, then switch turns.
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

        this.activeDistricts.push(district);
        this.redrawAllBorders();
    }

    onDistrictClear({ cells }) {
        for (const cell of cells) {
            this.gridManager.clearCell(cell.row, cell.col);
        }

        // Find and remove the district from tracking list
        this.activeDistricts = this.activeDistricts.filter(d => {
            const cellSet = new Set(d.cells.map(c => `${c.row},${c.col}`));
            const clearCellSet = new Set(cells.map(c => `${c.row},${c.col}`));
            return !Array.from(cellSet).every(cell => clearCellSet.has(cell));
        });

        this.gridManager.graphics.clear();
        this.redrawAllBorders();
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

    redrawAllBorders() {
        const g = this.gridManager.graphics;
        g.setDepth(10); // Ensure lines are drawn above the squares
        g.clear();
        g.lineStyle(3, 0x000000, 1);
        g.beginPath();
        for (const district of this.activeDistricts) {
            this.drawBorderLines(g, district.cells);
        }
        g.strokePath();
    }

    /**
     * Helper method for redrawAllBorders that draws the border lines for a single district.
     * This method draws lines on all edges of a district's cells that are not adjacent to another
     * cell in the same district, creating a complete border around the district perimeter.
     * 
     * @param {object} graphics The Phaser graphics object to draw the border on
     * @param {array} cells An array of cell objects representing the district. Each cell has
     * row and col properties indicating its position in the grid.
     */
    drawBorderLines(graphics, cells) {
        const cellSize = this.gridManager.cellSize;
        const cellSet = new Set(cells.map(c => `${c.row},${c.col}`));

        for (const cell of cells) {
            const rect = this.gridManager.getGraphic(cell.row, cell.col);
            const x = rect.x - cellSize / 2;
            const y = rect.y - cellSize / 2;

            const top = `${cell.row - 1},${cell.col}`;
            const bottom = `${cell.row + 1},${cell.col}`;
            const left = `${cell.row},${cell.col - 1}`;
            const right = `${cell.row},${cell.col + 1}`;

            if (!cellSet.has(top)) {
                graphics.moveTo(x, y);
                graphics.lineTo(x + cellSize, y);
            }
            if (!cellSet.has(bottom)) {
                graphics.moveTo(x, y + cellSize);
                graphics.lineTo(x + cellSize, y + cellSize);
            }
            if (!cellSet.has(left)) {
                graphics.moveTo(x, y);
                graphics.lineTo(x, y + cellSize);
            }
            if (!cellSet.has(right)) {
                graphics.moveTo(x + cellSize, y);
                graphics.lineTo(x + cellSize, y + cellSize);
            }
        }
    }

    /**
     * This method adds the text that displays the players goal to the UI.
     */
    buildTextUI() {
        const numDistricts = (this.gridModel.rows * this.gridModel.cols) / (this.gridModel.districtSize);
        const topMargin = this.gridManager.offsetY / 2 + 55;

        this.add.text(
            this.scale.width / 2,
            topMargin,
            `Gerrymander ${numDistricts} districts each with ${this.gridModel.districtSize} constituents!`,
            this.textStyle("black")
        ).setOrigin(0.5);
    }

    /**
     * This method creates the submit button, and sets the button to call the displayWon() method when clicked.
     */
    buildSubmitButton() {
        const buttonY = this.gridManager.offsetY + this.gridModel.rows * this.gridManager.cellSize + 50;
        this.submitButton = this.add.text(
            this.scale.width / 2,
            buttonY + 75,
            "SUBMIT",
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
            .on("pointerdown", () => this.displayWon())
            .on("pointerover", () => this.submitButton.setAlpha(0.5))
            .on("pointerout", () => this.submitButton.setAlpha(1));
    }

    /**
     * This method creates the Home button. When selected, it starts the HomePage scene.
     */
    buildHomeButton() {
        const homeButton = this.add.text(
            this.scale.width * 0.45,
            this.scale.height * 0.1 + 40,
            "HOME",
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

    /**
     * This method creates the Levels button. When selected, it starts the Levels scene.
     */
    buildLevelsButton() {
        const levelsButton = this.add.text(
            this.scale.width * 0.55,
            this.scale.height * 0.1 + 40,
            "LEVELS",
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
            .on("pointerdown", () => this.scene.start("Levels"))
            .on("pointerover", () => levelsButton.setAlpha(0.5))
            .on("pointerout", () => levelsButton.setAlpha(1));
    }

    textStyle(color) {
        return {
            fontSize: this.textSize,
            fontFamily: "grotesk-bold",
            color
        };
    }

    findWinner() {
        // Compute winner for display purposes
        const winner = this.districtManager.computeWinner();
        let color = 0x808080;
        let message = "It's a Tie!";

        if (winner === "blue") {
            message = "Blue Wins!";
            color = this.blue;
        } else if (winner === "red") {
            message = "Red Wins!";
            color = this.red;
        }

        return { message, color, winner };
    }

    /**
     * This method is called when the user selects the submit button. It validates the puzzle,
     * submits it to the backend API via the PuzzleSubmissionService, and starts the Results scene
     * with the computed metrics.
     * 
     * @returns {Promise<void>}
     */
    async displayWon() {
        // Validate that all districts are filled
        if (this.districtManager.districtModel.getDistrictCount() !== this.gridModel.totalDistricts) {
            alert(`Please fill all ${this.gridModel.totalDistricts} districts!`);
            return;
        }
        try {
            const payload = this.formatDistrictsForAPI();

            // Show loading message
            if (this.submitButton) {
                this.submitButton.setText("EVALUATING...");
                this.submitButton.disableInteractive();
            }

            // Evaluate map via service
            const {message, color, winner }= this.findWinner();
            const evaluationData = await this.submissionService.evaluateMap(payload);

            // Start Results scene with metrics
            this.scene.start("MultiplayerResults", {
                evaluationData: evaluationData,
                gridModel: this.gridModel,
                districtManager: this.districtManager,
                message: message,
                color: color,
                winner: winner
            });

        } catch (error) {
            console.error("Error evaluating map:", error);
            alert("Error evaluating map. Please check the console.");

            // Re-enable submit button on error
            if (this.submitButton) {
                this.submitButton.setText("SUBMIT");
                this.submitButton.setInteractive();
            }
        }
    }

    /**
     * Helper method to format districts into the API payload format.
     * 
     * @returns {object} Formatted payload for the API
     */
    formatDistrictsForAPI() {
        const districts = this.districtManager.districtModel.getDistricts();
        const formattedDistricts = [];

        // Format districts with cell coordinates
        for (let i = 0; i < districts.length; i++) {
            const district = districts[i];
            const cells = district.cells.map(cell => [cell.row, cell.col]);

            formattedDistricts.push({
                id: i,
                cells: cells
            });
        }

        // Reconstruct grid from cell data
        const grid = [];
        for (let r = 0; r < this.gridModel.rows; r++) {
            grid[r] = [];
            for (let c = 0; c < this.gridModel.cols; c++) {
                const cell = this.gridModel.getCell(r, c);
                grid[r][c] = cell.isBlue ? "b" : "r";
            }
        }

        const { winner } = this.findWinner();

        let winnerCode = "b";
        if (winner === "red") {
            winnerCode = "r";
        } else if (winner === "tie") {
            winnerCode = "b";
        }

        return {
            grid: grid, // 2D array of cell colors
            rows: this.gridModel.rows,
            cols: this.gridModel.cols,
            winner: winnerCode,
            districts: formattedDistricts
        };
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