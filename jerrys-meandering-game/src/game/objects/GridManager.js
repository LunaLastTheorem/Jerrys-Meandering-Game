import { Cell } from "./Cell.js";

// Draws each Circle and Square cell that are on the Grid
// Contains list of Cell objects that are on the grid
// Colors the cell and clears as necessary

export class GridManager {

    constructor(scene, puzzle) {
        this.scene = scene; // Grid Scene
        this.puzzle = puzzle;
        this.rows = puzzle.rows;
        this.cols = puzzle.cols;
        this.districtSize = puzzle.districtSize;
        this.gridSize = 300; // TODO: Dont hardcode

        this.cellSize = Math.min(
            this.gridSize / this.rows,
            this.gridSize / this.cols
        );

        this.offsetX = (scene.scale.width - this.cols * this.cellSize) / 2;
        this.offsetY = (scene.scale.height - this.rows * this.cellSize) / 2;

        this.cellList = []; // List of Cell objects

        this.buildGrid();
    }

    buildGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.createCell(row, col);
            }
        }
    }

    createCell(row, col) {
        const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
        const y = this.offsetY + row * this.cellSize + this.cellSize / 2;

        const isBlue = this.puzzle.grid[row][col] === "b";
        const color = isBlue ? this.scene.blue : this.scene.red;

        const cellGraphic = this.scene.add.rectangle(
            x, y, this.cellSize, this.cellSize, this.scene.white
        );

        const circleGraphic = this.scene.add.circle(
            x, y, this.cellSize / 2 - 4, color
        );

        const cell = new Cell(row, col, isBlue, false, cellGraphic.fillColor, cellGraphic); // make more readable
        this.cellList.push(cell);

        cellGraphic.setInteractive();
        cellGraphic.on("pointerdown", () => this.scene.handleClickCell(cell));
        cellGraphic.on("pointerover", () => circleGraphic.setAlpha(0.5));
        cellGraphic.on("pointerout", () => circleGraphic.setAlpha(1));
    }

    colorCell(cell) {
        const color = cell.isBlue ? this.scene.lightBlue : this.scene.lightRed;
        cell.fillColor = color;
        cell.cellGraphic.setFillStyle(color);
    }

    clearCell(cell) {
        cell.fillColor = this.scene.white;
        cell.cellGraphic.setFillStyle(this.scene.white);
    }
}
