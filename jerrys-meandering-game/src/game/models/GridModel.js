
/**
 * This class represents the Grid state.
 */
export class GridModel {

    constructor(puzzle) {
        this.rows = puzzle.rows;
        this.cols = puzzle.cols;
        this.districtSize = puzzle.districtSize;

        this.cells = [];

        for (let r = 0; r < this.rows; r++) {
            this.cells[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.cells[r][c] = {
                    row: r,
                    col: c,
                    isBlue: puzzle.grid[r][c] === "b",
                    locked: false,
                    active: false
                };
            }
        }
    }

    getCell(r, c) {
        return this.cells[r][c];
    }

}