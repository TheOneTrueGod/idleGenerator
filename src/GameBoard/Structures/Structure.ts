import { BoardCell, GameBoard } from "../GameBoard";

export type TCellStructures =  'error' | 'well' | 'wall' | 'absorber' | 'fluxProducer';

export class Structure {
    type: TCellStructures = 'error';
    constructor() {}

    getType() {
        return this.type;
    }

    readyToDestroy(cell: BoardCell) {
        return false;
    }

    generateFlux(tick: number, gameBoard: GameBoard, cell: BoardCell) {}
    getIntegrity(cell: BoardCell): number { return 1; }
    canBeBuiltOver() { return true; }
    harvestEnergy(tick: number, cell: BoardCell, gameBoard: GameBoard): number { return 0; }
}

export class StructureWell extends Structure {
    type: TCellStructures = 'well';
    WELL_CAPACITY = 100;
    WELL_ABSORB = 0.1;
    WELL_EFFICIENCY = 0.1;

    readyToDestroy(cell: BoardCell): boolean {
        return cell.fluxAmount > this.WELL_CAPACITY;
    }

    getIntegrity(cell: BoardCell): number {
        return 1 - (cell.fluxAmount / this.WELL_CAPACITY);
    }

    harvestEnergy(tick: number, cell: BoardCell, gameBoard: GameBoard) {
        return cell.absorbEnergy(this.WELL_ABSORB) * this.WELL_EFFICIENCY;
    }
}

export class StructureAbsorber extends Structure {
    type: TCellStructures = 'absorber';

    ABSORBER_ABSORB = 0.1;
    ABSORBER_EFFICIENCY = 0.1;
    harvestEnergy(tick: number, cell: BoardCell, gameBoard: GameBoard) {
        let amountAbsorbed = 0;
        const neighbours = cell.getValidConnections([[-1, 0], [1, 0], [0, -1], [0, 1]], gameBoard);
            
        amountAbsorbed += cell.absorbEnergy(this.ABSORBER_ABSORB) * this.ABSORBER_EFFICIENCY;

        neighbours.forEach((targetCell) => {
            if (targetCell?.structure?.getType() === 'well') {
                amountAbsorbed += targetCell.absorbEnergy(this.ABSORBER_ABSORB) * this.ABSORBER_EFFICIENCY;
            }
        }) 
        return amountAbsorbed;
    }
}


export class StructureWall extends Structure {
    type: TCellStructures = 'wall';
    canBeBuiltOver() { return false; }
}

export class StructureFluxProducer extends Structure {
    type: TCellStructures = 'fluxProducer';

    generateFlux(tick: number, gameBoard: GameBoard, cell: BoardCell) {
        let range = { x1: cell.col - 2, x2: cell.col + 2, y1: cell.row - 2, y2: cell.row + 2 }
        if (tick % 5 === 1) {
            gameBoard.generateRandomImpact(100, range);
        }
        if (tick % 10 === 1 && Math.random() > 0.5) {
            gameBoard.generateRandomImpact(200, range);
        }
    }
    canBeBuiltOver() { return false; }
}

export const STRUCTURE_TYPE_TO_STRUCTURE: Record<TCellStructures, typeof Structure> = {
    'error': StructureWell,
    'well': StructureWell,
    'wall': StructureWall,
    'absorber': StructureAbsorber,
    'fluxProducer': StructureFluxProducer,
}