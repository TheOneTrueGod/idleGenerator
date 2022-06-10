import { Structure, StructureFluxProducer, StructureWall, TCellStructures } from "./Structures/Structure";

const DECAY = 0.01;

export class BoardCell {
    fluxAmount: number;
    oldValue: number;
    row: number;
    col: number;

    structure?: Structure;
    constructor(fluxAmount: number, row: number, col: number) {
        this.fluxAmount = fluxAmount;
        this.oldValue = 0;
        this.row = row;
        this.col = col;
        this.structure = undefined;
    }

    canBeBuiltOn() {
        return !this.structure || this.structure?.canBeBuiltOver();
    }

    buildStructure(struct: Structure) {
        this.structure = struct;
    }

    destroyStructure() {
        this.structure = undefined;
    }

    startTick(tick: number) {
        this.oldValue = this.fluxAmount;
        this.fluxAmount = 0;
    }

    // When given a source Cell, determines how much of an energy share to take from it.
    getPullAmount(sourceCell: BoardCell) {
        if (sourceCell.structure?.getType() === 'wall' || this.structure?.getType() === 'wall') {
            return 0;
        }
        
        if (sourceCell.structure?.getType() === 'well') {
            if (this.structure?.getType() === 'well') {
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
        const totalPull = validConnections.reduce((prevAmount, targetCell) => {
            if (!targetCell) { return prevAmount }
            return prevAmount + targetCell?.getPullAmount(this)
        }, 0);
        if (totalPull === 0) {
            return;
        }

        let amountGivenAway = 0;
        validConnections.forEach((targetCell) => {
            if (!targetCell) { return; }
            const pullAmount = targetCell.getPullAmount(this);
            let pctTransfer = pullAmount / totalPull
            targetCell.fluxAmount += this.oldValue * pctTransfer;
            amountGivenAway += this.oldValue * pctTransfer;
        })
    }

    getValidConnections(connections: Array<Array<number>>, gameBoard: GameBoard) {
        return connections.map((offset) => {
            return [this.row + offset[0], this.col + offset[1]];
        }).filter((target) => {
            return gameBoard.in_bounds(target[0], target[1]) && gameBoard.get_at(target[0], target[1])?.structure?.getType() !== 'wall';
        }).map((target) => {
            return gameBoard.get_at(target[0], target[1]);
        });
    }

    absorbEnergy(amount: number) {
        const amountAbsorbed = Math.min(this.fluxAmount, amount);
        this.fluxAmount = Math.max(this.fluxAmount - amount, 0)
        return amountAbsorbed;
    }

    harvestEnergy(tick: number, gameBoard: GameBoard) {
        if (!this.structure) { return 0; }
        return this.structure.harvestEnergy(tick, this, gameBoard);
    }

    getBuildingIntegrity() {
        return this.structure ? this.structure.getIntegrity(this) : 1;
    }

    endTick(tick: number) {
        
        const ABSORBER_CAPACITY = 1;
        this.oldValue = 0;
        if (this.structure?.readyToDestroy(this)) {
            this.destroyStructure();
        } else {
            this.fluxAmount = Math.max(this.fluxAmount - DECAY, 0)
        }
    }

    generateFlux(tick: number, gameBoard: GameBoard) {
        this.structure && this.structure.generateFlux(tick, gameBoard, this);
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

        // Initial Build
        this.gameBoard[2][2].buildStructure(new StructureFluxProducer());
        this.gameBoard[this.rows - 3][2].buildStructure(new StructureFluxProducer());
        for (let col = 0; col < this.cols - 5; col ++) {
            this.gameBoard[5][col].buildStructure(new StructureWall());
            this.gameBoard[34][col].buildStructure(new StructureWall());
        }
    }

    playTick(tick: number) {
        this.generateFlux(tick);
        this.startTick(tick);
        this.doTick(tick);
        this.harvestEnergy(tick);
        this.endTick(tick);
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

    generateFlux(tick: number) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                cell.generateFlux(tick, this);
            });
        })
    }

    harvestEnergy(tick: number) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                this.energyHarvested += cell.harvestEnergy(tick, this);
            });
        })
    }

    get_color(row: number, col: number) {
        if (this.gameBoard[row][col].structure?.getType() === 'wall') {
            return '#000000';
        }
        // @ts-ignore
        const value = this.get_at(row, col).fluxAmount;
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
        if (this.gameBoard[row][col].structure?.getType() === 'wall') {
            return '-';
        }
        return Math.min(Math.floor(this.gameBoard[row][col].fluxAmount), 9);
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

    generateRandomImpact(value: number, range?: { x1: number, y1: number, x2: number, y2: number}) {
        let tRow = 0;
        let tCol = 0;
        if (range) {
            let x1 = Math.max(Math.floor(range.x1), 0);
            let x2 = Math.min(Math.floor(range.x2), this.cols);
            let y1 = Math.max(Math.floor(range.y1), 0);
            let y2 = Math.min(Math.floor(range.y2), this.rows);
            tCol = x1 + Math.floor(Math.random() * (x2 - x1));
            tRow = y1 + Math.floor(Math.random() * (y2 - y1));
        } else {
            tRow = Math.floor(Math.random() * this.rows);
            tCol = Math.floor(Math.random() * this.cols);
        }
        this.gameBoard[tRow][tCol].fluxAmount = value;
    }
}