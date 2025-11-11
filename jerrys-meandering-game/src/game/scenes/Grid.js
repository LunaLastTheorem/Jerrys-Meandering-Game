import { Scene } from "phaser";
import { EventBus } from '../EventBus';
import myData from "../../maps/map1.json"

export class Grid extends Scene {
    constructor() {
        super("Grid");
    }

    preload() {
        this.dist_val = 0
        this.white = 0xFFFFFF;
        this.lightblue = 0xBDD5E7;
        this.lightred = 0xFFA3A6;
        this.red = 0xE9141D;
        this.blue = 0x0015BC;
        this.selectedCells = [];
    }

    create() {

        const rows = myData.rows;
        const cols = myData.cols;
        this.districtSize = myData.district_size;
        const cellSize = 64;

        const offsetX = (this.scale.width - cols * cellSize) / 2;
        const offsetY = (this.scale.height - rows * cellSize) / 2;

        this.circles = [];
        this.cells = [];

        for (let row = 0; row < rows; row++) {
            this.circles[row] = [];
            this.cells[row] = [];

            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;

                const colors = [this.red, this.blue];
                const color = colors[myData.grid[row][col] === "r" ? 0 : 1];

                const cell = this.add.rectangle(x, y, cellSize, cellSize, this.white);
                const circle = this.add.circle(x, y, cellSize / 2 - 4, color);

                cell.isBlue = myData.grid[row][col] === "b"
                cell.fillColor = this.white;
                circle.fillColor = color;

                cell.setInteractive();
                circle.setInteractive();

                cell.row = row;
                cell.col = col;
                circle.row = row;
                circle.col = col;

                circle.on('pointerover', () => {
                    circle.setAlpha(0.5);
                });
                circle.on('pointerout', () => {
                    circle.setAlpha(1);
                });

                circle.on("pointerdown", () => {
                    this.handleClickCell(cell, circle);
                });

                this.circles[row][col] = circle;
                this.cells[row][col] = cell;

            }
        }

        EventBus.emit('current-scene-ready', this);
    }

    handleClickCell(cell) {
        console.log(`Clicked ${cell.isBlue ? "blue" : "red"} cell at row ${cell.row}, col ${cell.col}`);

        const isActive = cell.fillColor === this.lightblue || cell.fillColor === this.lightred;

        if (isActive) {
            this.clearCell(cell);
        } else {
            this.colorCell(cell);
        }

        if (!this.selectedCells.includes(cell)) {
            this.selectedCells.push(cell);
        }

        if (this.selectedCells.length === this.districtSize) {
            this.formDistrict(this.selectedCells);
            this.selectedCells = [];
        }

        console.log(`curr status: ${this.dist_val}`)
        
        if (this.dist_val > 0) {
            console.log("Blue is winning");
        } else if (this.dist_val < 0) {
            console.log("Red is winning");
        }
        else {
            console.log("It's a tie");
        }

        EventBus.emit('grid-cell-clicked', { row: cell.row, col: cell.col });
    }

    clearCell(cell) {
        const isBlueCell = cell.isBlue;

        if (isBlueCell) {
            this.dist_val--;
        } else {
            this.dist_val++;
        }
        cell.setFillStyle(this.white);
        cell.fillColor = this.white;
    }

    colorCell(cell) {
        const isBlueCell = cell.isBlue;

        if (isBlueCell) {
            this.dist_val++;
            cell.setFillStyle(this.lightblue);
            cell.fillColor = this.lightblue;
        } else {
            this.dist_val--;
            cell.setFillStyle(this.lightred);
            cell.fillColor = this.lightred;
        }
    }

    formDistrict(cells) {
        let blueCount = 0;
        let redCount = 0;

        for (const cell of cells) {
            if (cell.fillColor === this.lightblue) {
                blueCount++;
            } else {
                redCount++;
            }
        }

        let winningColor;
        if (blueCount > redCount) {
            winningColor = this.lightblue;
        } else {
            winningColor = this.lightred;
        }

        this.drawDistrictBorder(cells, winningColor);

    }

    drawDistrictBorder(cells, winningColor) {
        const g = this.add.graphics();
        g.lineStyle(3, 0x000000, 1);

        const cellSize = 64;
        const cellSet = new Set(cells.map(c => `${c.row},${c.col}`));

        for (const cell of cells) {
            const x = cell.x - cellSize / 2;
            const y = cell.y - cellSize / 2;

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
                g.lineTo(x + cellSize, y + cellSize);
            }
        }

        for (const cell of cells) {
            cell.setFillStyle(winningColor);
            cell.fillColor = winningColor;
        }
        g.strokePath();
    }
}