import React, { useEffect, useState } from 'react';
import { BoardCell, GameBoard, TCellStructures } from './GameBoard';

import styled from 'styled-components';

const Container = styled.div`
  width: 1em;
  height: 1em;
  font-size: 12px;
  padding: 1px;
  cursor: pointer;
  position: relative;
`;

const DisplayContainer = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
`;

const WellContainer = styled(DisplayContainer)`
    background: white;
`;

const AbsorberContainer = styled(DisplayContainer)`
    background: white;
    border-radius: 50%;
`;

export const BoardCellComponent: React.FC<{ boardCell: BoardCell, gameBoard: GameBoard, selectedBuilding: TCellStructures }> = 
    ({ boardCell, gameBoard, selectedBuilding }) => {

        function handleClick() {
            if (boardCell.structure === selectedBuilding) {
                boardCell.buildStructure('none');
            } else {
                boardCell.buildStructure(selectedBuilding);
            }
        }

        const integ = boardCell.getBuildingIntegrity();

        return (
            <Container 
                style={{
                    color: gameBoard.get_color(boardCell.row, boardCell.col),
                    //border: boardCell.structure === 'well' ? '1px solid white' : '1px solid #00000000',
                    //background: backgroundColor,
                    borderRadius: '4px',
                }}
                onClick={() => handleClick()}
            >
                { boardCell.structure === 'well' && <WellContainer style={{
                    background: `hsla(360, 100%, ${ integ * 50 + 50}%, 1)`
                }} /> }
                { boardCell.structure === 'absorber' && <AbsorberContainer /> }
                <DisplayContainer>{ gameBoard.get_display(boardCell.row, boardCell.col) }</DisplayContainer>
            </Container>
        );
    }