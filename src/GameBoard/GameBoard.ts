const DECAY = 0.01;

export type TCellStructures =  'none' | 'well' | 'absorber';

export class BoardCell {
    value: number;
    oldValue: number;
    row: number;
    col: number;

    structure: TCellStructures;
    constructor(value: number, row: number, col: number) {
        this.value = value;
        this.oldValue = 0;
        this.row = row;
        this.col = col;
        this.structure = 'none';
    }

    buildStructure(struct: TCellStructures) {
        this.structure = struct;
    }

    startTick(tick: number) {
        this.oldValue = this.value;
        this.value = 0;
    }

    // When given a source Cell, determines how much of an energy share to take from it.
    getPullAmount(sourceCell: BoardCell) {
        if (sourceCell.structure === 'well') {
            if (this.structure === 'well') {
                return 100;
            }
            return 0;
        }
        return 10;
    }

    doTick(tick: number, gameBoard: GameBoard) {
        const connections = [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1], [0, 0]];
        const validConnections = this.getValidConnections(connections, gameBoard);

        // We are our own neighbour
        const numNeighbours = validConnections.length;

        const totalPull = validConnections.reduce((prevAmount, targetCell) => {
            if (!targetCell) { return prevAmount }
            return prevAmount + targetCell?.getPullAmount(this)
        }, 0);

        let amountGivenAway = 0;
        validConnections.forEach((targetCell) => {
            if (!targetCell) { return; }
            const pullAmount = targetCell.getPullAmount(this);
            let pctTransfer = pullAmount / totalPull
            targetCell.value += this.oldValue * pctTransfer;
            amountGivenAway += this.oldValue * pctTransfer;
        })
    }

    getValidConnections(connections: Array<Array<number>>, gameBoard: GameBoard) {
        return connections.map((offset) => {
            return [this.row + offset[0], this.col + offset[1]];
        }).filter((target) => {
            return gameBoard.in_bounds(target[0], target[1])
        }).map((target) => {
            return gameBoard.get_at(target[0], target[1]);
        });
    }

    absorbEnergy(amount: number) {
        const amountAbsorbed = Math.min(this.value, amount);
        this.value = Math.max(this.value - amount, 0)
        return amountAbsorbed;
    }

    harvestEnergy(tick: number, gameBoard: GameBoard) {
        const ABSORBER_ABSORB = 0.1;
        const ABSORBER_EFFICIENCY = 0.1;

        const WELL_ABSORB = 0.1;
        const WELL_EFFICIENCY = 0.1;

        let amountAbsorbed = 0;
        if (this.structure === 'well') {
            amountAbsorbed += this.absorbEnergy(WELL_ABSORB) * WELL_EFFICIENCY;
        } else if (this.structure === 'absorber') {
            const neighbours = this.getValidConnections([[-1, 0], [1, 0], [0, -1], [0, 1]], gameBoard);
            
            amountAbsorbed += this.absorbEnergy(ABSORBER_ABSORB);

            neighbours.forEach((targetCell) => {
                if (targetCell?.structure === 'well') {
                    amountAbsorbed += targetCell.absorbEnergy(ABSORBER_ABSORB) * ABSORBER_EFFICIENCY;
                }
            }) 
        }
        return amountAbsorbed;
    }

    getBuildingIntegrity() {
        if (this.structure === 'none') { return 1; }
        if (this.structure === 'absorber') { return 1; }
        if (this.structure === 'well') {
            return 1 - (this.value / this.WELL_CAPACITY);
        }
        return 1;
    }

    WELL_CAPACITY = 100;
    endTick(tick: number) {
        
        const ABSORBER_CAPACITY = 1;
        this.oldValue = 0;
        if (this.structure === 'well') {
            if (this.value >= this.WELL_CAPACITY) {
                this.structure = 'none';
            }
        } else if (this.structure === 'absorber') {
            if (this.value >= ABSORBER_CAPACITY) {
                this.structure = 'none';
            }
        } else {
            this.value = Math.max(this.value - DECAY, 0)
        }
    }
}

export class GameBoard {
    gameBoard: Array<Array<BoardCell>> = [];
    rows: number;
    cols: number;
    energyHarvested: number = 0;
    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        for (let row = 0; row < rows; row ++) {
            this.gameBoard.push([]);
            for (let col = 0; col < cols; col ++) {
              this.gameBoard[row].push(new BoardCell(0, row, col));
            }
          }
    }

    startTick(tick: number) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                cell.startTick(tick);
            });
        })
    }

    doTick(tick: number) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                cell.doTick(tick, this);
            });
        })
    }

    endTick(tick: number) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                cell.endTick(tick);
            });
        })
    }

    harvestEnergy(tick: number, gameBoard: GameBoard) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                this.energyHarvested += cell.harvestEnergy(tick, gameBoard);
            });
        })
    }

    get_color(row: number, col: number) {
        // @ts-ignore
        const value = this.get_at(row, col).value;
        if (value < 1) {
            return `#000000`;
        } else if (value < 2 ) {
            return `#006600`;
        } else if (value < 4 ) {
            return `#009900`;
        } else if (value < 6 ) {
            return `#00BB00`;
        } else if (value < 20) {
            return '#00FF00'
        } else if (value < 100) {
            return '#55FF55'
        } else {
            return `#FFFFFF`;
        }
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
            return this.gameBoard[row][col];
        }
        return undefined;
    };

    generateRandomImpact(value: number) {
        let tRow = Math.floor(Math.random() * this.rows);
        let tCol = Math.floor(Math.random() * this.cols);
        this.gameBoard[tRow][tCol].value = value;
    }
}