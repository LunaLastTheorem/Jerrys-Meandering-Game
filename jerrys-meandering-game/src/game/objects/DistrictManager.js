import { District } from "../objects/District";

export class DistrictManager {
    constructor(scene, gridManager) {
        this.scene = scene;
        this.grid = gridManager;

        this.selectedCells = [];
        this.districts = [];
        this.districtSize = this.grid.districtSize;
    }

    handleClickCell(cell) {
        if (cell.locked) {
            const district = this.districts.find(d => d.cells.includes(cell));
            if (district) {
                this.clearDistrict(district);
            }
            return;
        }
        console.log(cell)

        if (this.selectedCells.length != 0 && !this.isConnected(cell, this.selectedCells)) {
            return;
        }

        const isActive = cell.fillColor === this.scene.lightBlue || cell.fillColor === this.scene.lightRed;
        isActive ? this.grid.clearCell(cell) : this.grid.colorCell(cell);

        if (!this.selectedCells.includes(cell)) {
            this.selectedCells.push(cell);
        }

        if (this.selectedCells.length === this.districtSize) {
            this.formDistrict(this.selectedCells);
            this.selectedCells = [];
        }
    }

    isConnected(cell, selectedCells) {
        const dydx = [[0, 1], [1, 0], [-1, 0], [0, -1]]
        let newCells = []
        for (const dir of dydx) {
            newCells.push([cell.row + dir[0], cell.col + dir[1]])
        }
        console.log(newCells)

        for (const newCell of newCells) {
            for (const trueCell of selectedCells) {
                console.log(newCell[0], newCell[1], trueCell.row, trueCell.col);

                if (newCell[0] === trueCell.row && newCell[1] === trueCell.col) {
                    return true
                }
            }
        }
        return false
    }

    formDistrict(cells) {
        let blueCount = 0;
        let redCount = 0;

        for (const cell of cells) {
            if (cell.fillColor === this.scene.lightBlue) {
                blueCount++;
            } else {
                redCount++;
            }
        }

        const winningColor = blueCount > redCount ? this.scene.lightBlue : this.scene.lightRed;

        for (const cell of cells) {
            cell.locked = true;
        }

        const district = new District(this.scene, cells, winningColor, this.grid);
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

    computeWinner() {
        let blueWins = 0;
        let redWins = 0;

        for (const district of this.districts) {
            let b = 0;
            let r = 0;

            for (const cell of district.cells) {
                if (cell.isBlue) {
                    b++;
                } else {
                    r++;
                }
            }

            if (b > r) {
                blueWins++;
            } else {
                redWins++;
            }
        }

        if (blueWins > redWins) {
            return { message: "BLUE WINS!", color: this.scene.blue };
        } else if (redWins > blueWins) {
            return { message: "RED WINS!", color: this.scene.red };
        } else {
            return { message: "IT'S A TIE!", color: 0x000000 };
        }
    }

}