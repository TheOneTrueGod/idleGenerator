import React, { useEffect, useState } from 'react';
import './App.css';

import styled from 'styled-components';
import { GameBoard } from './GameBoard/GameBoard';
import { BoardCellComponent } from './GameBoard/BoardCellComponent';

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
  gameBoard.endTick(tick);
  if (tick % 5 === 1) {
    let tRow = Math.floor(Math.random() * ROWS);
    let tCol = Math.floor(Math.random() * COLS);
    gameBoard.gameBoard[tRow][tCol].value = 100;
  }
}

function App() {
  const [tick, setTick] = useState(0);

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
          { gameBoard.gameBoard.map((rowArr, row) => 
            <BoardRow key={row}>
              {
                rowArr.map((cell, col) => {
                  return (
                    <BoardCellComponent
                      key={col}
                      boardCell={cell}
                      gameBoard={gameBoard} />
                  );
                })
              }
            </BoardRow>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
