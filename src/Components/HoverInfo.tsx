import React from 'react';

import styled from 'styled-components';
import { BoardCell } from '../GameBoard/GameBoard';

const Container = styled.div`
    width: 200px;
    border-right: 1px solid black;
    margin-right: 20px;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    text-align: left;
`;

export const HoverInfo: React.FC<{ 
    cell: BoardCell | undefined,
}> = ({ cell }) => {

    return (
        <Container>
            <div>Energy: {cell && Math.floor(cell.fluxAmount)}</div>
            <div>Structure: {cell && cell.structure?.getType()}</div>
        </Container>
    );
}