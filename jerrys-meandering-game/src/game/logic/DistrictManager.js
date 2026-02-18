import { EventBus } from "../events/EventBus.js";

/**
 * This class handles the game logic rules.
 * 
 * It receives a signal from the Grid Scene when a cell is clicked, and updates the Grid state accordingly.
 * It also emits different signals back to the Grid Scene when certain conditions on the board are met.
 */
export class DistrictManager {
    
    /**
     * The constructor initializes fields for this class and handles the cell:clicked signal
     * 
     * @param {GridModel} gridModel the game state object
     */
    constructor(gridModel) {
        this.gridModel = gridModel;
        this.selectedCells = [];
        this.districts = [];
        this.districtSize = gridModel.districtSize;

        EventBus.on("cell:clicked", this.handleClickCell, this);
    }

    /**
     * This method is called when the cell:clicked signal is sent from the EventBus. 
     * If the cell is locked, it clears the district in which the cell is located in.
     * If the cell is not contiguous with the other selected cells, it sends an ui:contiguous 
     * signal via the EventBus.
     * If the cell is the final cell selected for a district, it creates the district and locks the
     * cells within the district.
     * 
     * @param {integer} row the row index of the cell clicked
     * @param {integer} col the column index of the cell clicked
     */
    handleClickCell({row, col}) {
        const cell = this.gridModel.getCell(row, col);

        if (cell.locked) {
            const district = this.districts.find(d => d.cells.includes(cell));
            if (district) {
                for (const cell of district.cells) {
                    cell.locked = false;
                    cell.active = false;
                }
                EventBus.emit("district:clear", {cells: district.cells});
                this.districts = this.districts.filter(d => d !== district);
            }
            return;
        }

        if (this.selectedCells.length !== 0 && !this.isConnected(cell)) {
            EventBus.emit("ui:contiguous", {message: "Districts must be connected!"});
            return;
        }

        cell.active = !cell.active;
        EventBus.emit("cell:toggled", {
            row, col, active: cell.active, isBlue: cell.isBlue
        });

        if (!this.selectedCells.includes(cell)) {
            this.selectedCells.push(cell);
        } else {
            this.selectedCells = this.selectedCells.filter(c => c !== cell);
        }

        if (this.selectedCells.length === this.districtSize) {
            this.formDistrict(this.selectedCells);
            this.selectedCells = [];
        }
        console.log("Selected Cells:" + this.selectedCells.length);
    }

    /**
     * This is a helper method that checks for contiguity of selected cells.
     * 
     * @param {object} cell the cell object that was selected 
     * @returns true if the cell is contiguous, false otherwise.
     */
    isConnected(cell) {
        const dydx = [[0, 1], [1, 0], [-1, 0], [0, -1]]
        let newCells = []
        for (const dir of dydx) {
            newCells.push([cell.row + dir[0], cell.col + dir[1]])
        }

        for (const newCell of newCells) {
            for (const trueCell of this.selectedCells) {
                console.log(newCell[0], newCell[1], trueCell.row, trueCell.col);

                if (newCell[0] === trueCell.row && newCell[1] === trueCell.col) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * This method computes the winning color of the district and adds the district to
     * the list of districts. It also emits the district:formed signal.
     * 
     * @param {object} cells the list of cells in the district
     */
    formDistrict(cells) {
        let blue = 0, red = 0;
        
        for (const cell of cells) {
            cell.isBlue ? blue++ : red++;
            cell.locked = true;
        }

        let winningColor;
        if (blue === red) {
            winningColor = "tie";
        } else if (blue > red) {
            winningColor = "blue";
        } else {
            winningColor = "red";
        }

        const district = { cells, winningColor };
        this.districts.push(district);

        EventBus.emit("district:formed", district);
    }

    /**
     * This method determines the winning party (red, blue, tie) of the entire grid.
     * 
     * @returns a string with the winning color in all lowercase, or tie if there is no winner
     */
    computeWinner() {
        let blueWins = 0, redWins = 0, tie = 0;

        for (const district of this.districts) {
            let b = 0, r = 0;
            for (const cell of district.cells) {
                cell.isBlue ? b++ : r++;
            }
            if (b === r) {
                tie++;
            } else if (b > r) {
                blueWins++;
            } else {
                redWins++;
            }
        }

        if (blueWins === redWins) {
            return "tie";
        } else if (blueWins > redWins) {
            return "blue";
        } else {
            return "red";
        }
    }

    /**
     * This method destroys the cell:clicked event in the EventBus when a new Scene is loaded.
     */
    destroy() {
        EventBus.off("cell:clicked", this.handleClickCell);
    }

 }