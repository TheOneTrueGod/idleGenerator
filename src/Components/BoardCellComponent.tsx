import React from 'react';
import { BoardCell, GameBoard } from '../GameBoard/GameBoard';

import styled from 'styled-components';
import { STRUCTURE_TYPE_TO_STRUCTURE, TCellStructures } from '../GameBoard/Structures/Structure';
import { GameData } from '../GameBoard/GameData';

const Container = styled.div`
  width: 1em;
  height: 1em;
  font-size: 12px;
  padding: 1px;
  cursor: pointer;
  position: relative;
  user-select: none;
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

export const BoardCellComponent: React.FC<{ boardCell: BoardCell, gameBoard: GameBoard, gameData: GameData, selectedBuilding: TCellStructures, onHover: Function }> = 
    ({ boardCell, gameBoard, gameData, selectedBuilding, onHover }) => {

        function handleClick() {
            if (boardCell.canBeBuiltOn()) {
                if (boardCell.structure?.getType() === selectedBuilding) {
                    gameData.destroyStructure(boardCell);
                } else if (gameData.canPlaceStructure(selectedBuilding)) {
                    gameData.buildStructure(boardCell, selectedBuilding);
                }
            }
        }

        const integ = boardCell.getBuildingIntegrity();

        return (
            <Container 
                onMouseOver={(ev) => { onHover(); }}
                style={{
                    color: gameBoard.get_color(boardCell.row, boardCell.col),
                    //border: boardCell.structure === 'collector' ? '1px solid white' : '1px solid #00000000',
                    //background: backgroundColor,
                    borderRadius: '4px',
                }}
                onClick={() => handleClick()}
            >
                { boardCell.structure?.getType() === 'collector' && <WellContainer style={{
                    background: `hsla(360, 100%, ${ integ * 50 + 50}%, 1)`
                }} /> }
                { boardCell.structure?.getType() === 'absorber' && <AbsorberContainer /> }
                <DisplayContainer>{ gameBoard.get_display(boardCell.row, boardCell.col) }</DisplayContainer>
            </Container>
        );
    }