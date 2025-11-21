export class GridManager {
    constructor(scene, puzzle) {
        this.scene = scene;
        this.puzzle = puzzle;
        console.log(this.puzzle)

        this.rows = puzzle.rows;
        this.cols = puzzle.cols;
        this.districtSize = puzzle.districtSize;
        this.gridSize = 300;

        this.cellSize = Math.min(
            this.gridSize / this.rows,
            this.gridSize / this.cols
        );

        this.offsetX = (scene.scale.width - this.cols * this.cellSize) / 2;
        this.offsetY = (scene.scale.height - this.rows * this.cellSize) / 2;

        this.cells = [];
        this.circles = [];

        this.buildGrid();
    }

    buildGrid() {
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            this.circles[row] = [];
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

        const cell = this.scene.add.rectangle(
            x, y, this.cellSize, this.cellSize, this.scene.white
        );

        const circle = this.scene.add.circle(
            x, y, this.cellSize / 2 - 4, color
        );

        cell.row = row;
        cell.col = col;
        cell.isBlue = isBlue;
        cell.fillColor = this.scene.white;
        cell.locked = false;

        cell.setInteractive();
        cell.on("pointerdown", () => this.scene.handleClickCell(cell));
        cell.on("pointerover", () => circle.setAlpha(0.5));
        cell.on("pointerout", () => circle.setAlpha(1));

        this.cells[row][col] = cell;
        this.circles[row][col] = circle;
    }

    colorCell(cell) {
        const color = cell.isBlue ? this.scene.lightBlue : this.scene.lightRed;
        cell.fillColor = color;
        cell.setFillStyle(color);
    }

    clearCell(cell) {
        cell.fillColor = this.scene.white;
        cell.setFillStyle(this.scene.white);
    }
}
