
/**
 * This class represents the Grid state. It has the following fields:
 * rows - the number of rows in the puzzle
 * cols - the number of columns in the puzzle
 * districtSize - the size that the district should be
 * cells - an object that contains:
 *         r (row index), 
 *         c (column index), 
 *         isBlue (true if circle is blue, false if red), 
 *         locked (true if cell is in district, 
 *         false if not), 
 *         and active (true if cell is selected, false if not)
 */
export class GridModel {

    /**
     * The constructor initializes all fields of the class based on the puzzle object.
     * 
     * @param {object} puzzle 
     */
    constructor(puzzle) {
        this.rows = puzzle.rows;
        this.cols = puzzle.cols;
        this.districtSize = puzzle.districtSize;
        this.whoWins = puzzle.whoWins
        this.totalDistricts = (this.rows * this.cols) / this.districtSize;

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

    /**
     * This method gets the cell object at the specified row and column.
     * 
     * @param {integer} r the row index of the desired cell
     * @param {integer} c the column index of the desired cell
     * @returns the cell object
     */
    getCell(r, c) {
        return this.cells[r][c];
    }

}