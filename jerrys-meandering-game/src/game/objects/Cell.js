export class Cell {

    constructor(row, col, isBlue, locked, fillColor, cellGraphic) {
        this.row = row;
        this.col = col;
        this.isBlue = isBlue;
        this.locked = locked;
        this.fillColor = fillColor;
        this.cellGraphic = cellGraphic;
    }

}