import { EventBus } from "../events/EventBus.js";

/**
 * This class manages what the grid looks like in the Grid Scene.
 * 
 * It draws the grid, changes the cell color, and clears the cell color.
 * It also emits a signal to the Grid Scene when a cell is clicked. This triggers
 * a UI update.
 */
export class GridManager {

    /**
     * The constructor initializes the variables for this class including the graphics object that is used to
     * draw the grid on the scene, and the Map that contains each cells object.
     * 
     * @param {Scene} scene This is the Scene object for the Grid
     * @param {GridModel} gridModel This is the object that represents the game state
     */
    constructor(scene, gridModel) {
        this.scene = scene;
        this.gridModel = gridModel;
        this.graphics = scene.add.graphics();

        this.gridSize = 300; // TODO: Dont hardcode
        this.cellSize = Math.min(
            this.gridSize / gridModel.rows,
            this.gridSize / gridModel.cols
        );

        this.offsetX = (scene.scale.width - gridModel.cols * this.cellSize) / 2;
        this.offsetY = (scene.scale.height - gridModel.rows * this.cellSize) / 2;

        this.graphicsMap = new Map();
        this.buildGrid();
    }

    /**
     * This method iterates through the rows and cols of the GridModel and visually builds
     * the grid. It uses the createCell helper method.
     */
    buildGrid() {
        for (let row = 0; row < this.gridModel.rows; row++) {
            for (let col = 0; col < this.gridModel.cols; col++) {
                this.createCell(row, col);
            }
        }
    }

    /**
     * This method creates the Rectangle and Circle Phaser objects that are displayed in the scene.
     * 
     * @param {integer} row 
     * @param {integer} col 
     */
    createCell(row, col) {
        const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
        const y = this.offsetY + row * this.cellSize + this.cellSize / 2;
        const color = this.gridModel.getCell(row, col).isBlue ? this.scene.blue : this.scene.red;

        const rect = this.scene.add.rectangle(x, y, this.cellSize, this.cellSize, this.scene.white);
        rect.setInteractive();

        const circle = this.scene.add.circle(x, y, this.cellSize / 2 - 4, color);

        rect.on("pointerdown", () => {
            EventBus.emit("cell:clicked", { row, col });
        });
        rect.on("pointerover", () => circle.setAlpha(0.5));
        rect.on("pointerout", () => circle.setAlpha(1));

        this.graphicsMap.set(`${row},${col}`, rect);
    }

    /**
     * This method gets the rectangle object on the grid at the specified row and column.
     * 
     * @param {integer} row the row of the cell to retrieve
     * @param {integer} col the column of the cell to retrieve
     * @returns the rectangle object
     */
    getGraphic(row, col) {
        return this.graphicsMap.get(`${row},${col}`);
    }

    /**
     * This method changes the color of a cell on the UI to the specified color.
     * 
     * @param {integer} row the row of the cell to fill
     * @param {integer} col the column of the cell to fill
     * @param {object} color the hex code of the color to fill
     */
    setCellColor(row, col, color) {
        this.getGraphic(row, col).setFillStyle(color);
    }

    /**
     * This method resets the color of a cell on the UI to white.
     * 
     * @param {integer} row the row of the cell to clear
     * @param {integer} col the column of the cell to clear
     */
    clearCell(row, col) {
        this.getGraphic(row, col).setFillStyle(this.scene.white);
    }
}
