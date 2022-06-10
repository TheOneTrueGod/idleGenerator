import React, { useEffect, useState } from 'react';
import './App.css';

import styled from 'styled-components';
import { BoardCell, GameBoard } from './GameBoard/GameBoard';
import { BoardCellComponent } from './GameBoard/BoardCellComponent';
import { BuildingSelector } from './GameBoard/BuildingSelector';
import { TCellStructures } from './GameBoard/Structures/Structure';
import { HoverInfo } from './Components/HoverInfo';

const BoardRow = styled.div`
  display: flex;
`;

const GameBody = styled.div`
  display: flex;
  flex-direction: row;
`;

const ROWS = 40;
const COLS = 50;

let gameBoard: GameBoard = new GameBoard(ROWS, COLS);

function App() {
  const [tick, setTick] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<TCellStructures>('well');
  const [hoveredCell, setHoveredCell] = useState<BoardCell | undefined>(undefined);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      setTick((t) => t + 1);
    }, 100);

    return () => {
      clearInterval(gameInterval);
    };
  }, []);

  useEffect(() => {
    gameBoard.playTick(tick);
  }, [tick]);

  let totalEnergy = 0;
  gameBoard.gameBoard.forEach((row) => {
    row.forEach((cell) => {
      totalEnergy += cell.fluxAmount;
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
        <BuildingSelector selectedBuilding={selectedBuilding} setSelectedBuilding={setSelectedBuilding} />
      </header>
    </div>
  );
}

export default App;
