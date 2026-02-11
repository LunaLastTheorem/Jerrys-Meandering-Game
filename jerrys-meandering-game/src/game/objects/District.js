export class District {

    constructor(scene, cells, winningColor, gridManager) {
        this.scene = scene;
        this.cells = cells;
        this.winningColor = winningColor;
        this.gridManager = gridManager
        this.locked = true;

        // may remove area and perimeter params later...might only need final metric and these don't need to be saved?
        this.area = this.computeArea();
        console.log("Area: " + this.area); // TEST
        this.perimeter = this.computePerimeter();
        console.log("Perimeter: " + this.perimeter) // TEST

        this.graphics = scene.add.graphics();
        this.fillCells();
        this.drawBorder();
    }

    fillCells() {
        for (const cell of this.cells) {
            cell.cellGraphic.setFillStyle(this.winningColor);
            cell.fillColor = this.winningColor;
            cell.locked = true;
        }
    }

    drawBorder() {
        const g = this.graphics;
        const cellSize = this.gridManager.cellSize;
        const cellSet = new Set(this.cells.map(c => `${c.row},${c.col}`));
        
        g.clear();
        g.lineStyle(3, 0x000000, 1);
        g.beginPath();

        for (const cell of this.cells) {
            const x = cell.cellGraphic.x - cellSize / 2;
            const y = cell.cellGraphic.y - cellSize / 2;

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
            cell.cellGraphic.setFillStyle(this.scene.white);
            cell.fillColor = this.scene.white;
            cell.locked = false;
        }
        this.graphics.clear();
    }

    computeArea() {
        return this.cells.length;
    }

    computePerimeter() {
        let perimeter = 0;
        const cellSet = new Set(this.cells.map(c => `${c.row},${c.col}`));

        for (const cell of this.cells) {
            const row = cell.row;
            const col = cell.col;
            const neighbors = [
                `${row+1},${col}`,
                `${row-1},${col}`,
                `${row},${col+1}`,
                `${row},${col-1}`
            ]

            for (const neighbor of neighbors) {
                if (!cellSet.has(neighbor)) {
                    perimeter += 1;
                }
            }
        }
        return perimeter;
    }
}