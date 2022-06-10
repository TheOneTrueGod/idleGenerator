import React from 'react';

import styled from 'styled-components';
import { TCellStructures } from './Structures/Structure';

const Container = styled.div`
    width: 100%;
    border-top: 1px solid black;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    min-height: 80px;
`;

const Building = styled.div`
    padding: 20px;
    height: 100%;
    cursor: pointer;
    box-sizing: border-box;
`;

export const BuildingSelector: React.FC<{ 
    selectedBuilding: TCellStructures,
    setSelectedBuilding: Function,
}> = ({ selectedBuilding, setSelectedBuilding }) => {
    const buildings: Array<TCellStructures> = ['well', 'absorber'];

    return (
        <Container>
            { buildings.map((buildingName) => {
                return (
                    <Building
                        key={buildingName} 
                        style={{
                            border: selectedBuilding === buildingName ? '1px solid white' : '1px solid rgba(0, 0, 0, 0)'
                        }}
                        onClick={() => { setSelectedBuilding(buildingName); }}
                    >
                        { buildingName }
                    </Building>
                );
            })}
        </Container>
    );
}