class BoardCell {
    value: number;
    oldValue: number;
    constructor(value: number) {
        this.value = value;
        this.oldValue = 0;
    }
}

export class GameBoard {
    gameBoard: Array<Array<BoardCell>> = [];
    rows: number;
    cols: number;
    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        for (let row = 0; row < rows; row ++) {
            this.gameBoard.push([]);
            for (let col = 0; col < cols; col ++) {
              this.gameBoard[row].push(new BoardCell(0));
            }
          }
    }

    startTick(tick: number) {

    }

    get_color(row: number, col: number) {
        const value = this.get_display(row, col);
        if (value === 0) {
        return `#000000`;
        } else if (0 <= value && value < 2 ) {
        return `#006600`;
        } else if (2 <= value && value < 4 ) {
        return `#009900`;
        } else if (4 <= value && value < 6 ) {
        return `#00BB00`;
        } else if (value >= 6) {
        return '#00FF00'
        }
        return `#FFFFFF`;
    }
  
    get_display(row: number, col: number) {
        return Math.min(Math.floor(this.gameBoard[row][col].value), 9);
    }
  
    in_bounds(row: number, col: number) {
        if (0 <= row && row < this.gameBoard.length) {
            if (0 <= col && col < this.gameBoard[row].length) {
                return true;
            }
        }
        return false;
    };
  
    get_at(row: number, col: number) {
        if (this.in_bounds(row, col)) {
            return this.gameBoard[row][col].value;
        }
        return 0;
    };
}