import { EventBus } from "../events/EventBus.js";

/**
 * This class manages what the grid looks like in the Grid Scene.
 * 
 * It draws the grid, changes the cell color, and clears the cell color.
 * It also emits a signal to the Grid Scene when a cell is clicked. This triggers
 * a UI update.
 */
export class GridManager {

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

    buildGrid() {
        for (let row = 0; row < this.gridModel.rows; row++) {
            for (let col = 0; col < this.gridModel.cols; col++) {
                this.createCell(row, col);
            }
        }
    }

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

    getGraphic(row, col) {
        return this.graphicsMap.get(`${row},${col}`);
    }

    setCellColor(row, col, color) {
        this.getGraphic(row, col).setFillStyle(color);
    }

    clearCell(row, col) {
        this.getGraphic(row, col).setFillStyle(this.scene.white);
    }
}
