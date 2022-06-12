import { BoardCell, GameBoard } from "../GameBoard";
import { GameData } from "../GameData";

export type TCellStructures =  'error' | 'collector' | 'wall' | 'absorber' | 'fluxProducer';

interface IStructure {
    type: TCellStructures;
    getType: () => TCellStructures;
    readyToDestroy: (cell: BoardCell) => Boolean;
    generateFlux: (tick: number, gameBoard: GameBoard, cell: BoardCell) => void;
    getIntegrity: (cell: BoardCell) => number;
    canBeBuiltOver: () => Boolean;
    harvestEnergy: (tick: number, cell: BoardCell, gameBoard: GameBoard, gameData: GameData) => number;
}

export class Structure implements IStructure {
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
    harvestEnergy(tick: number, cell: BoardCell, gameBoard: GameBoard, gameData: GameData): number { return 0; }
}

export class StructureError extends Structure implements IStructure {
    constructor() { throw new Error('THIS SHOULD NEVER BE INITIALIZED'); super(); }
}

export class StructureWell extends Structure {
    type: TCellStructures = 'collector';
    static WELL_CAPACITY = 100;

    readyToDestroy(cell: BoardCell): boolean {
        return false;
        return cell.fluxAmount > StructureWell.WELL_CAPACITY;
    }

    getIntegrity(cell: BoardCell): number {
        return 1;
        return 1 - (cell.fluxAmount / StructureWell.WELL_CAPACITY);
    }

    harvestEnergy(tick: number, cell: BoardCell, gameBoard: GameBoard, gameData: GameData) {
        const wellAbsorb = gameData.getBuildingStat('collector', 'harvestRate');
        const wellEfficiency = gameData.getBuildingStat('collector', 'efficiency');
        return cell.absorbEnergy(wellAbsorb) * wellEfficiency;
    }
}

export class StructureAbsorber extends Structure {
    type: TCellStructures = 'absorber';

    harvestEnergy(tick: number, cell: BoardCell, gameBoard: GameBoard, gameData: GameData) {
        const absorbAmount = gameData.getBuildingStat('absorber', 'harvestRate');
        const absorbEfficiency = gameData.getBuildingStat('absorber', 'efficiency');

        let amountAbsorbed = 0;
        const neighbours = cell.getValidConnections([[-1, 0], [1, 0], [0, -1], [0, 1]], gameBoard);
            
        amountAbsorbed += cell.absorbEnergy(absorbAmount) * absorbEfficiency;

        neighbours.forEach((targetCell) => {
            if (targetCell?.structure?.getType() === 'collector') {
                amountAbsorbed += targetCell.absorbEnergy(absorbAmount) * absorbEfficiency;
            }
        }) 
        return amountAbsorbed;
    }
}


export class StructureWall extends Structure {
    type: TCellStructures = 'wall';
    canBeBuiltOver() { return false; }
}

export type FluxProducerShapes = 
    // Hits the board randomly
    'bombard' |
    // Sprays around it
    'fountain';

export class StructureFluxProducer extends Structure {
    type: TCellStructures = 'fluxProducer';
    shape: FluxProducerShapes;
    fluxPerTick: number;

    constructor(shape: FluxProducerShapes, fluxPerTick: number) {
        super();
        this.shape = shape;
        this.fluxPerTick = fluxPerTick;
    }

    generateFlux(tick: number, gameBoard: GameBoard, cell: BoardCell) {
        switch (this.shape) {
            case 'bombard':
                let range = { x1: cell.col - 2, x2: cell.col + 2, y1: cell.row - 2, y2: cell.row + 2 }
                if (tick % 5 === 1) {
                    gameBoard.generateRandomImpact(this.fluxPerTick * 5);
                }
                /*if (tick % 10 === 1 && Math.random() > 0.5) {
                    gameBoard.generateRandomImpact(200);
                }*/
        }
    }
    canBeBuiltOver() { return false; }
}

export const STRUCTURE_TYPE_TO_STRUCTURE: Record<TCellStructures, typeof Structure | typeof StructureFluxProducer> = {
    'error': StructureError,
    'collector': StructureWell,
    'wall': StructureWall,
    'absorber': StructureAbsorber,
    'fluxProducer': StructureFluxProducer,
}