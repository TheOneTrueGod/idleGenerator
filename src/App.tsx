import React, { useEffect, useState } from 'react';
import './App.css';

import styled from 'styled-components';

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
const PASSIVE_DECAY = 0.01;

const get_color = (gameBoard: Array<Array<number>>, row: number, col: number) => {
  const value = get_display(gameBoard, row, col);
  if (value === 0) {
    return `#000000`;
  } else if (0 <= value && value < 2 ) {
    return `#006600`;
  } else if (2 <= value && value < 4 ) {
    return `#009900`;
  } else if (4 <= value && value < 6 ) {
    return `#00BB00`;
  } else if (value >= 6) {
    return '#00FF00'
  }
  return `#FFFFFF`;
}

const get_display = (gameBoard: Array<Array<number>>, row: number, col: number) => {
  return Math.min(Math.floor(gameBoard[row][col]), 9);
}

const in_bounds = (gameBoard: Array<Array<number>>, row: number, col: number) => {
  if (0 <= row && row < gameBoard.length) {
    if (0 <= col && col < gameBoard[row].length) {
      return true;
    }
  }
  return false;
};

const get_at = (gameBoard: Array<Array<number>>, row: number, col: number) => {
  if (in_bounds(gameBoard, row, col)) {
    return gameBoard[row][col];
  }
  return 0;
};

let gameBoard: Array<Array<number>> = [];

for (let row = 0; row < ROWS; row ++) {
  gameBoard.push([]);
  for (let col = 0; col < COLS; col ++) {
    gameBoard[row].push(0);
  }
}

const gameTick = (tick: number) => {
  const oldGameBoard = gameBoard;
  gameBoard = [];

  for (let row = 0; row < ROWS; row ++) {
    gameBoard.push([]);
    for (let col = 0; col < COLS; col ++) {
      const connections = [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0]];
      let totalNeighbours = 0;
      let newVal = connections.reduce(
        (prevVal: number, currVal) => {
          const tRow = currVal[0] + row;
          const tCol = currVal[1] + col;
          if (in_bounds(oldGameBoard, tRow, tCol)) {
            totalNeighbours += 1;
          }
          return prevVal + get_at(oldGameBoard, tRow, tCol)
        },
        0
      );
      if (totalNeighbours > 0) {
        newVal = newVal / totalNeighbours;
      }
      //newVal = Math.max(Math.min(9, newVal - 0.5), 0);
      newVal = Math.max(newVal - PASSIVE_DECAY, 0);
      gameBoard[row].push(newVal);
    }
  }
  
  if (tick % 5 === 1) {
    let tRow = Math.floor(Math.random() * ROWS);
    let tCol = Math.floor(Math.random() * COLS);
    gameBoard[tRow][tCol] = 100;
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
  gameBoard.forEach((row) => {
    row.forEach((cell) => {
      totalEnergy += cell;
    })
  })
  
  return (
    <div className="App">
      <header className="App-header">
        <div>
          Total Energy: { Math.floor(totalEnergy) }
        </div>
        <div>
          { gameBoard.map((rowArr, row) => 
            <BoardRow key={row}>
              {
                rowArr.map((cell, col) => {
                  return (
                    <BoardCell
                      key={col} style={{
                      color: get_color(gameBoard, row, col)
                    }}>
                      {get_display(gameBoard, row, col)}
                  </BoardCell>
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
