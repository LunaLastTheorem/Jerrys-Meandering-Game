class AIAgent {
    constructor(color, regionSize, regions, grid) {
        this.color = color
        this.regions = regions
        this.myColorsRemaining = 0
        this.regionSize = regionSize
        this.grid = grid
    }

    myTurn(grid) {
        this.evaluateGrid()
        if (this.myColorsRemaining < grid[0].length * grid.length) {
            if (canPackOpponent(grid)) {
                return
            }
        }
        if (canCrackOpponent(grid)) {
            return
        }
        randomRegion()
    }

    createsLonelyIslands(grid, region) {
        // from the already drawn regions, if we are to draw 'region', does it create any impossible squares? 
        return false
    }

    canPackOpponent(grid) {
        for (cell of grid) {
            if (cell.color != this.color) {
                // find packable district with dfs
                if (this.createsLonelyIslands()) {
                    continue
                }
                else {
                    // send district drawn
                    return true
                }
            }
        }

        return false
    }

    canCrackOpponent() {
        // dfs but we ensure the minim amount ceil(region size / 2)
        return true
    }

    randomRegion() {
        // find cell that has not been drawn and draw while move randomly
    }

    evaluateGrid(grid) {
        let myCount = 0
        for (cell of grid) {
            if (cell.locked) {
                continue
            }
            if (cell.isBlue && this.color == 'b') {
                myCount++
            }
            else if (!cell.isBlue && this.color == 'r') {
                myCount++
            }
        }
        this.myColorsRemaining = myCount
    }
}