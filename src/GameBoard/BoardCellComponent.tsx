import React, { useEffect, useState } from 'react';
import { BoardCell, GameBoard } from './GameBoard';

import styled from 'styled-components';

const Container = styled.div`
  width: 1em;
  height: 1em;
  font-size: 12px;
`;

export const BoardCellComponent: React.FC<{ boardCell: BoardCell, gameBoard: GameBoard }> = 
    ({ boardCell, gameBoard }) => {
        return (
            <Container style={{
                color: gameBoard.get_color(boardCell.row, boardCell.col)
            }}>
                {gameBoard.get_display(boardCell.row, boardCell.col)}
            </Container>
        );
    }