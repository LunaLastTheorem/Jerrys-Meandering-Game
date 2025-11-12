export class District {

    constructor(scene, cells, winningColor) {
        this.scene = scene;
        this.cells = cells;
        this.winningColor = winningColor;
        this.graphics = this.scene.add.graphics();
        this.locked = true;

        this.fillCells();
        this.drawBorder();
    }

    fillCells() {
        for (const cell of this.cells) {
            cell.setFillStyle(this.winningColor);
            cell.fillColor = this.winningColor;
            cell.locked = true;
        }
    }

    drawBorder() {
        const g = this.graphics;
        const cellSize = this.scene.cellSize;
        const cellSet = new Set(this.cells.map(c => `${c.row},${c.col}`));

        g.clear();
        g.lineStyle(3, 0x000000, 1);
        g.beginPath();

        for (const cell of this.cells) {
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
                g.lineTo(x + cellSize, y + cellSize)
            }
        }
        g.strokePath();
    }

    clear() {
        for (const cell of this.cells) {
            cell.setFillStyle(this.scene.white);
            cell.fillColor = this.scene.white;
            cell.locked = false;
        }
        this.graphics.clear();
    }
}