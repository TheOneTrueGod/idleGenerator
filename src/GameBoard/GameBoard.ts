import { GameData } from "./GameData";
import { Structure, StructureFluxProducer, StructureWall, StructureWell, TCellStructures } from "./Structures/Structure";

export class BoardCell {
    fluxAmount: number;
    oldFlux: number;
    row: number;
    col: number;

    structure?: Structure;
    constructor(fluxAmount: number, row: number, col: number) {
        this.fluxAmount = fluxAmount;
        this.oldFlux = 0;
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
        this.oldFlux = this.fluxAmount;
        this.fluxAmount = 0;
    }

    // When given a source Cell, determines how much of an energy share to take from it.
    getPullAmount(sourceCell: BoardCell, gameData: GameData) {
        const DEFAULT_PULL = 10;
        if (sourceCell === this) {
            return DEFAULT_PULL;
        }
        if (sourceCell.structure?.getType() === 'wall' || this.structure?.getType() === 'wall') {
            return 0;
        }

        // If we're a collector, we want to pull (unless we're past our capacity)
        if (this.structure?.getType() === 'collector') {
            if (this.oldFlux < gameData.getBuildingStat('collector', 'capacity')) {
                return DEFAULT_PULL;
            }
            return 0;
        }
        
        // If they're a collector, we only want to pull if we're a collector, or if they're past their capacity
        if (sourceCell.structure?.getType() === 'collector') {
            if (this.structure?.getType() === 'collector') {
                return DEFAULT_PULL;
            }
            return 0;
        }
        
        return 10;
    }

    doTick(tick: number, gameBoard: GameBoard, gameData: GameData) {
        const connections = [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1], [0, 0]];
        const validConnections = this.getValidConnections(connections, gameBoard);

        // We are our own neighbour
        const totalPull = validConnections.reduce((prevAmount, targetCell) => {
            if (!targetCell) { return prevAmount }
            return prevAmount + targetCell?.getPullAmount(this, gameData)
        }, 0);
        if (totalPull === 0) {
            return;
        }

        let amountGivenAway = 0;
        validConnections.forEach((targetCell) => {
            if (!targetCell) { return; }
            const pullAmount = targetCell.getPullAmount(this, gameData);
            let pctTransfer = pullAmount / totalPull
            targetCell.fluxAmount += this.oldFlux * pctTransfer;
            amountGivenAway += this.oldFlux * pctTransfer;
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

    harvestEnergy(tick: number, gameBoard: GameBoard, gameData: GameData) {
        if (!this.structure) { 
            return this.absorbEnergy(gameData.getBuildingStat('board', 'harvestRate')) * gameData.getBuildingStat('board', 'efficiency');
        }
        return this.structure.harvestEnergy(tick, this, gameBoard, gameData);
    }

    getBuildingIntegrity() {
        return this.structure ? this.structure.getIntegrity(this) : 1;
    }

    endTick(tick: number) {
        this.oldFlux = 0;
        if (this.structure?.readyToDestroy(this)) {
            this.destroyStructure();
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
        this.gameBoard[2][2].buildStructure(new StructureFluxProducer('bombard', 10));
        //this.gameBoard[this.rows - 3][2].buildStructure(new StructureFluxProducer());
        //for (let col = 0; col < this.cols - 5; col ++) {
        //    this.gameBoard[5][col].buildStructure(new StructureWall());
        //    this.gameBoard[34][col].buildStructure(new StructureWall());
       // }
    }

    playTick(tick: number, gameData: GameData) {
        this.generateFlux(tick);
        this.startTick(tick);
        this.doTick(tick, gameData);
        const energyHarvested = this.harvestEnergy(tick, gameData);
        this.endTick(tick);

        gameData.addEnergy(tick, energyHarvested);
    }

    startTick(tick: number) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                cell.startTick(tick);
            });
        })
    }

    doTick(tick: number, gameData: GameData) {
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                cell.doTick(tick, this, gameData);
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

    harvestEnergy(tick: number, gameData: GameData) {
        let energyHarvested = 0;
        this.gameBoard.forEach((rowArr, row) => {
            rowArr.forEach((cell, col) => {
                energyHarvested += cell.harvestEnergy(tick, this, gameData);
            });
        });
        return energyHarvested;
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
            return ' ';
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
        this.gameBoard[tRow][tCol].fluxAmount += value;
    }
}