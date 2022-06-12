import { BoardCell, GameBoard } from "./GameBoard";
import { STRUCTURE_TYPE_TO_STRUCTURE, TCellStructures } from "./Structures/Structure";

export type UpgradeNames = 'harvestRate'| 'efficiency' | 'capacity' | 'numOwned';

export type Upgradeable = 'absorber' | 'collector' | 'board';

export const UpgradeValues: { [k in Upgradeable]?: {[k2 in UpgradeNames]?: Array<number> }} = {
    'absorber': { 
        'numOwned': [5],
        'harvestRate': [0.2, 0.4, 0.6, 0.8, 1],
        'efficiency': [0.1, 0.15, 0.2, 0.25, 0.3]
    },
    'collector': { 
        'numOwned': [5],
        'harvestRate': [0.1, 1, 10],
        'efficiency': [0.1, 0.15, 0.2, 0.25, 0.3],
        'capacity': [10]
    },
    'board': {
        'numOwned': [1],
        'harvestRate': [0, 0.01, 0.02, 0.04, 0.1],
        'efficiency': [0.01]
    }
}

const STRUCTURE_TO_UPGRADEABLE: Record<TCellStructures, Upgradeable | undefined> = {
    'collector': 'collector',
    'absorber': 'absorber',
    'wall': undefined,
    'fluxProducer': undefined,
    'error': undefined
}

export class GameData {
    playerEnergy: number = 10;
    playerUpgrades: { [k in Upgradeable]?: {[k2 in UpgradeNames]?: number }} = {};
    buildingsPlaced: { [k in Upgradeable]?: number } = { 'board': 1 };
    gameBoards: Array<GameBoard> = [];
    constructor() {

    }

    addEnergy(tick: number, amount: number) {
        if (amount < 0) { throw new Error("Can't add negative energy"); }
        this.playerEnergy += amount;
    }

    spendEnergy(amount: number) {
        if (amount > this.playerEnergy) {
            console.error("Can't spend energy you don't have.");
            return false;
        }
        this.playerEnergy -= amount;
        return true;
    }

    // Buildings
    private touchPlayerBuilding(buildingType: Upgradeable) {
        if (!this.buildingsPlaced[buildingType]) {
            this.buildingsPlaced[buildingType] = 0;
        }
    }

    getBuildingsPlaced(buildingType: Upgradeable) {
        this.touchPlayerBuilding(buildingType);
        return this.buildingsPlaced[buildingType];
    }

    buildStructure(boardCell: BoardCell, buildingType: TCellStructures) {
        const selectedBuildingClass = STRUCTURE_TYPE_TO_STRUCTURE[buildingType];
        const upgradeable = STRUCTURE_TO_UPGRADEABLE[buildingType];
        if (upgradeable) {
            this.touchPlayerBuilding(upgradeable);
            this.buildingsPlaced[upgradeable]! += 1;
        }
        // @ts-ignore -- This shouldn't happen.  Players can't build flux spawners
        boardCell.buildStructure(new selectedBuildingClass());
    }

    destroyStructure(boardCell: BoardCell) {
        if (boardCell.structure) {
            const upgradeable = STRUCTURE_TO_UPGRADEABLE[boardCell.structure.getType()];
            if (upgradeable) {
                if (!this.buildingsPlaced[upgradeable]) {
                    throw new Error("How did we destroy a structure we never placed?");
                }
                this.buildingsPlaced[upgradeable]! -= 1;
            }
            //this.buildingsPlaced
            boardCell.destroyStructure();
        }
    }

    canPlaceStructure(buildingType: TCellStructures) {
        const upgradeable = STRUCTURE_TO_UPGRADEABLE[buildingType];
        if (upgradeable) {
            this.touchPlayerBuilding(upgradeable);
            return this.buildingsPlaced[upgradeable]! < this.getBuildingStat(upgradeable, 'numOwned');
        }
        return true;
    }

    // Upgrades
    getUpgradeNamesForBuilding(buildingType: Upgradeable): Array<UpgradeNames> {
        if (!UpgradeValues[buildingType]) {
            throw new Error(`Can't get upgrade names for building type '${buildingType}'`);
        }
        // @ts-ignore
        return Object.keys(UpgradeValues[buildingType]!);
    }

    getUpgradeLevel(buildingType: Upgradeable, upgradeName: UpgradeNames): number {
        if (!this.isValidUpgrade(buildingType, upgradeName)) {
            throw new Error(`No upgrades of name '${upgradeName}' defined for building type '${buildingType}'`);
        }

        this.touchPlayerUpgrade(buildingType, upgradeName);
        return this.playerUpgrades[buildingType]![upgradeName]!;
    }

    getUpgradeCost(buildingType: Upgradeable, upgradeName: UpgradeNames, level?: number): number {
        if (level === undefined) {
            level = this.getUpgradeLevel(buildingType, upgradeName) + 1;
        }
        return Math.pow(10, level);
    }

    isAtMaxUpgradeLevel(buildingType: Upgradeable, upgradeName: UpgradeNames) {
        if (!this.isValidUpgrade(buildingType, upgradeName)) {
            throw new Error(`No upgrades of name '${upgradeName}' defined for building type '${buildingType}'`);
        }
        return this.getUpgradeLevel(buildingType, upgradeName) >= UpgradeValues[buildingType]![upgradeName]!.length - 1;
    }

    private isValidUpgrade(buildingType: Upgradeable, upgradeName: UpgradeNames) {
        if (!UpgradeValues[buildingType]) {
            return false;
        }

        // we just checked for it
        const buildingUpgradeValues = UpgradeValues[buildingType]!;
        
        if (!buildingUpgradeValues[upgradeName]) {
            return false;
        }
        return true;
    }

    private touchPlayerUpgrade(buildingType: Upgradeable, upgradeName: UpgradeNames) {
        if (!this.playerUpgrades[buildingType]) {
            this.playerUpgrades[buildingType] = {};
        }
        if (!this.playerUpgrades[buildingType]![upgradeName]) {
            this.playerUpgrades[buildingType]![upgradeName] = 0;
        }
    }

    buyUpgrade(buildingType: Upgradeable, upgradeName: UpgradeNames) {
        if (!this.spendEnergy(this.getUpgradeCost(buildingType, upgradeName))) {
            return;
        }
        this.touchPlayerUpgrade(buildingType, upgradeName);
        this.playerUpgrades[buildingType]![upgradeName]! += 1;
    }

    getBuildingStat(buildingType: Upgradeable, upgradeName: UpgradeNames): number {
        // Todo;  memoize this.

        const upgradeLevel = this.getUpgradeLevel(buildingType, upgradeName);
        const buildingUpgradeValues = UpgradeValues[buildingType]![upgradeName]!;
        
        if (upgradeLevel < 0 || upgradeLevel >= buildingUpgradeValues.length) {
            throw new Error(`Error trying to get upgrade value for building type '${buildingType}', upgradeName '${upgradeName}.  Upgrade level '${upgradeLevel} is invalid.`)
        }

        const upgradeValue = buildingUpgradeValues[upgradeLevel];
        return upgradeValue;
    }
}