import { EventBus } from "../events/EventBus.js";

export class DistrictManager {

    constructor(gridModel) {
        this.gridModel = gridModel;
        this.selectedCells = [];
        this.districts = [];
        this.districtSize = gridModel.districtSize;

        EventBus.on("cell:clicked", this.handleClickCell, this);
    }

    handleClickCell({ row, col }) {
        const cell = this.gridModel.getCell(row, col);

        if (cell.locked) {
            const district = this.districts.find(d => d.cells.includes(cell));
            if (district) {
                for (const cell of district.cells) {
                    cell.locked = false;
                    cell.active = false;
                }
                EventBus.emit("district:clear", { cells: district.cells });
                this.districts = this.districts.filter(d => d !== district);
            }
            return;
        }

        if (this.selectedCells.length !== 0 && !this.isConnected(cell) && !this.selectedCells.includes(cell)) {
            EventBus.emit("ui:contiguous", { message: "Districts must be connected!" });
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

    destroy() {
        EventBus.off("cell:clicked", this.handleClickCell);
    }

}