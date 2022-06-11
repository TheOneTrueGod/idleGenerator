import React, { useEffect, useState } from 'react';
import './App.css';

import styled from 'styled-components';
import { BoardCell, GameBoard } from './GameBoard/GameBoard';
import { BoardCellComponent } from './Components/BoardCellComponent';
import { BuildingSelector } from './Components/BuildingSelector';
import { TCellStructures } from './GameBoard/Structures/Structure';
import { HoverInfo } from './Components/HoverInfo';
import { GameData, Upgradeable, UpgradeNames } from './GameBoard/GameData';

const BoardRow = styled.div`
  display: flex;
`;

const GameBody = styled.div`
  display: flex;
  flex-direction: row;
`;

const ROWS = 40;
const COLS = 50;

function App() {
  const [tick, setTick] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<TCellStructures>('collector');
  const [hoveredCell, setHoveredCell] = useState<BoardCell | undefined>(undefined);
  const [gameBoard] = useState<GameBoard>(new GameBoard(ROWS, COLS));
  const [gameData] = useState<GameData>(new GameData());
  const [totalEnergy] = useState<Array<number>>([])
  const [averageEnergy, setAverageEnergy] = useState<number>(0);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      setTick((t) => t + 1);
    }, 100);

    return () => {
      clearInterval(gameInterval);
    };
  }, []);

  useEffect(() => {
    totalEnergy.unshift(0);
    gameBoard.playTick(tick, gameData);
    gameBoard.gameBoard.forEach((row) => {
      row.forEach((cell) => {
        totalEnergy[0] += cell.fluxAmount;
      });
    });
    if (totalEnergy.length > 40) {
      totalEnergy.pop();
    }
    if (totalEnergy.length > 0) {
      setAverageEnergy(totalEnergy.reduce((p, c) => c - p) / -totalEnergy.length);
    }
  }, [tick]);

  const onUpgradeClick = (buildingType: Upgradeable, upgradeName: UpgradeNames) => {
    gameData.buyUpgrade(buildingType, upgradeName);
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <div>
          Total Energy: { Math.round(totalEnergy[0]) } ({ (averageEnergy > 0) && "+"}{ Math.round(averageEnergy) }/t)
        </div>
        <div>
          Harvested: { Math.floor(gameData.playerEnergy) }
        </div>
        <GameBody>
          <HoverInfo cell={hoveredCell} />
          <div>
            { gameBoard.gameBoard.map((rowArr, row) => 
              <BoardRow key={row}>
                {
                  rowArr.map((cell, col) => {
                    return (
                      <BoardCellComponent
                        key={col}
                        boardCell={cell}
                        selectedBuilding={selectedBuilding}
                        gameBoard={gameBoard}
                        gameData={gameData}
                        onHover={() => {
                          setHoveredCell(gameBoard.get_at(row, col))
                        }} />
                    );
                  })
                }
              </BoardRow>
            )}
          </div>
        </GameBody>
        <BuildingSelector 
          gameData={gameData}
          selectedBuilding={selectedBuilding}
          setSelectedBuilding={setSelectedBuilding}
          onUpgradeClick={onUpgradeClick}
          />
      </header>
    </div>
  );
}

export default App;
