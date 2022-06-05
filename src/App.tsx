import React, { useEffect, useState } from 'react';
import './App.css';

import styled from 'styled-components';
import { GameBoard, TCellStructures } from './GameBoard/GameBoard';
import { BoardCellComponent } from './GameBoard/BoardCellComponent';
import { BuildingSelector } from './GameBoard/BuildingSelector';

const BoardRow = styled.div`
  display: flex;
`;

const BoardCell = styled.div`
  width: 1em;
  height: 1em;
  font-size: 12px;
`;

const ROWS = 40;
const COLS = 50;

let gameBoard: GameBoard = new GameBoard(ROWS, COLS);;

const gameTick = (tick: number) => {
  gameBoard.startTick(tick);
  gameBoard.doTick(tick);
  gameBoard.harvestEnergy(tick, gameBoard);
  gameBoard.endTick(tick);
  if (tick % 5 === 1) {
    gameBoard.generateRandomImpact(100);
  }
  if (tick % 10 === 1 && Math.random() > 0.5) {
    gameBoard.generateRandomImpact(200);
  }
  if (tick % 40 === 1 && Math.random() > 0.9) {
    gameBoard.generateRandomImpact(1000);
  }
}

function App() {
  const [tick, setTick] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<TCellStructures>('well');

  useEffect(() => {
    const gameInterval = setInterval(() => {
      setTick((t) => t + 1);
    }, 100);

    return () => {
      clearInterval(gameInterval);
    };
  }, []);

  useEffect(() => {
    gameTick(tick);
  }, [tick]);

  let totalEnergy = 0;
  gameBoard.gameBoard.forEach((row) => {
    row.forEach((cell) => {
      totalEnergy += cell.value;
    })
  })
  
  return (
    <div className="App">
      <header className="App-header">
        <div>
          Total Energy: { Math.floor(totalEnergy) }
        </div>
        <div>
          Harvested: { Math.floor(gameBoard.energyHarvested) }
        </div>
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
                      gameBoard={gameBoard} />
                  );
                })
              }
            </BoardRow>
          )}
        </div>
        <BuildingSelector selectedBuilding={selectedBuilding} setSelectedBuilding={setSelectedBuilding} />
      </header>
    </div>
  );
}

export default App;
