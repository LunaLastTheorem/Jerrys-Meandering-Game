import { Scene } from "phaser";
import { EventBus } from '../EventBus';
import myData from "../../maps/map1.json";
import { District } from "../objects/District";


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
        this.districts = [];
    }

    create() {
        const gridSize = 300;
        const rows = myData.rows;
        const cols = myData.cols;
        this.districtSize = myData.district_size;
        const cellSize = Math.min(gridSize / rows, gridSize / cols);
        this.cellSize = cellSize;
        console.log(cellSize);

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
                cell.locked = false;
                circle.fillColor = color;

                cell.setInteractive();

                cell.row = row;
                cell.col = col;
                circle.row = row;
                circle.col = col;

                cell.on('pointerover', () => {
                    circle.setAlpha(0.5);
                });
                cell.on('pointerout', () => {
                    circle.setAlpha(1);
                });

                cell.on("pointerdown", () => {
                    this.handleClickCell(cell, circle);
                });

                this.circles[row][col] = circle;
                this.cells[row][col] = cell;

            }
        }

        EventBus.emit('current-scene-ready', this);
    }

    handleClickCell(cell) {
        if (cell.locked) {
            const district = this.districts.find(d => d.cells.includes(cell));
            if (district) {
                this.clearDistrict(district);
            }
            return;
        }

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

        const winningColor = blueCount > redCount ? this.lightblue : this.lightred;

        for (const cell of cells) {
            cell.locked = true;
        }

        const district = new District(this, cells, winningColor);
        this.districts.push(district);
    }

    clearDistrict(district) {
        district.clear();

        const remainingDistricts = [];
        for (const d of this.districts) {
            if (d !== district) {
                remainingDistricts.push(d);
            }
        }
        this.districts = remainingDistricts;

        console.log("Cleared Districts");
    }
}