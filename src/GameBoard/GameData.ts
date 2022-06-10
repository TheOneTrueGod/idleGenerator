import { GameBoard } from "./GameBoard";
import { TCellStructures } from "./Structures/Structure";

export type UpgradeNames = 'harvestRate'| 'efficiency';

export class GameData {
    playerEnergy: number = 10;
    //playerUpgrades: Map<Partial<TCellStructures>, Map<UpgradeNames, number>> = [];
    gameBoards: Array<GameBoard> = [];
    constructor() {

    }

    addEnergy(tick: number, amount: number) {
        if (amount < 0) { throw new Error("Can't add negative energy"); }
        this.playerEnergy += amount;
    }

    spendEnergy(amount: number) {
        if (amount > this.playerEnergy) {
            throw new Error("Can't spend energy you don't have.");
        }
        this.playerEnergy -= amount;
    }

    getUpgradeLevel(board: GameBoard, buildingType: TCellStructures | 'Board', upgradeName: UpgradeNames) {
        return 1;
    }

    getUpgradeCost(board: GameBoard, buildingType: TCellStructures | 'Board', upgradeName: UpgradeNames, level: number) {
        return Math.pow(10, level);
    }

    buyUpgrade(board: GameBoard, buildingType: TCellStructures | 'Board', upgradeName: UpgradeNames) {

    }
}