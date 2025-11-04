import { Scene } from "phaser";
import { EventBus } from '../EventBus';
import myData from "../../maps/map1.json"

export class Grid extends Scene {
    constructor() {
        super("Grid");
    }

    preload() {
        this.dist_val = 0
    }

    create() {
        const red = 0xE9141D;
        const blue = 0x0015BC;
        const rows = myData.rows;
        const cols = myData.cols;
        const cellSize = 64;

        const offsetX = (this.scale.width - cols * cellSize) / 2;
        const offsetY = (this.scale.height - rows * cellSize) / 2;

        this.grid = [];

        for (let row = 0; row < rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;

                const colors = [red, blue];
                const color = colors[myData.grid[row][col] === "r" ? 0 : 1];

                const cell = this.add.circle(x, y, cellSize / 2, color);
                cell.isBlue = myData.grid[row][col] === "r"
                cell.setStrokeStyle(3, 0xffffff);
                cell.currentStroke = 0xffffff;
                cell.setInteractive();

                cell.row = row;
                cell.col = col;

                cell.on('pointerover', () => {
                    cell.setAlpha(0.5);
                });
                cell.on('pointerout', () => {
                    cell.setAlpha(1);
                });

                cell.on("pointerdown", () => {
                    this.handleClickCell(cell);
                });

                this.grid[row][col] = cell;

            }
        }

        EventBus.emit('current-scene-ready', this);
    }

    handleClickCell(cell) {
        console.log(`Clicked ${cell.isBlue ? "blue" : "red"} cell at row ${cell.row}, col ${cell.col}`);

        if (cell.isBlue) {
            this.dist_val--;
        } else {
            this.dist_val++;
        }

        const isWhite = cell.currentStroke === 0xffffff;
        const newStroke = isWhite ? 0x000000 : 0xffffff;
        cell.currentStroke = newStroke;
        cell.setStrokeStyle(3, newStroke);

        console.log(`curr status: ${this.dist_val}`)
        console.log(`${this.dist_val > 0 ? "blue is winning" : "red is winning"}`)

        EventBus.emit('grid-cell-clicked', { row: cell.row, col: cell.col });
    }
}