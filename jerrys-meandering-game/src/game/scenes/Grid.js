import { Scene } from "phaser";
import { EventBus } from '../EventBus';
import myData from "../../maps/map1.json"

export class Grid extends Scene {
    constructor() {
        super("Grid");
    }

    preload() {
        this.white = 0xFFFFFF;
        this.lightblue = 0x8091F5;
        this.lightred = 0xF48A8D;
        this.red = 0xE9141D;
        this.blue = 0x0015BC;
    }

    create() {

        const rows = myData.rows;
        const cols = myData.cols;
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
                const currColor = myData.grid[row][col]
                const color = colors[currColor === "r" ? 0 : 1];

                const cell = this.add.rectangle(x, y, cellSize, cellSize, this.white);
                const circle = this.add.circle(x, y, cellSize / 2 - 2, color);

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

    handleClickCell(cell, circle) {
        console.log(`Clicked cell at row ${cell.row}, col ${cell.col}`);

        // const isWhite = cell.currentStroke === 0xffffff;
        // const newStroke = isWhite ? 0x000000 : 0xffffff;
        // cell.currentStroke = newStroke;
        // cell.setStrokeStyle(3, newStroke);

        if (cell.fillColor === this.lightblue || cell.fillColor === this.lightred) {
            cell.setFillStyle(this.white);
            cell.fillColor = this.white;
        } else if (circle.fillColor === this.red) {
            cell.setFillStyle(this.lightred);
            cell.fillColor = this.lightred;
        } else {
            cell.setFillStyle(this.lightblue);
            cell.fillColor = this.lightblue;
        }

        EventBus.emit('grid-cell-clicked', { row: cell.row, col: cell.col });
    }
}