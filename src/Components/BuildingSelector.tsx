import React from 'react';

import styled from 'styled-components';
import { TCellStructures } from '../GameBoard/Structures/Structure';

const Container = styled.div`
    width: 100%;
    border-top: 1px solid black;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
`;

const BuildingContainer = styled.div`
    padding: 12px;
    height: 100%;
    cursor: pointer;
    box-sizing: border-box;
    width: 150px;
`;

export const BuildingSelector: React.FC<{ 
    selectedBuilding: TCellStructures,
    setSelectedBuilding: Function,
}> = ({ selectedBuilding, setSelectedBuilding }) => {
    const buildings: Array<TCellStructures> = ['well', 'absorber'];

    return (
        <Container>
            <Building
                key={"Board"}
                buildingType={"Board"}
            />
            { buildings.map((buildingName) => {
                return (
                    <Building
                        key={buildingName}
                        buildingType={buildingName}
                        selected={selectedBuilding === buildingName}
                        onClick={() => { setSelectedBuilding(buildingName) }}
                    />
                );
            })}
        </Container>
    );
}

const Building: React.FC<{
    buildingType: TCellStructures | "Board",
    selected?: Boolean,
    onClick?: Function,
}> = ({ buildingType, selected, onClick }) => {
    return (
        <BuildingContainer
            style={{
                border: selected ? '1px solid white' : '1px solid rgba(0, 0, 0, 0)'
            }}
            onClick={() => onClick && onClick()}
        >
            {buildingType}
            <BuildingUpgrade upgradeName="Rate" />
            <BuildingUpgrade upgradeName="Efficiency" />
        </BuildingContainer>
    );
}


const UpgradeContainer = styled.div`
    font-size: 14px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 4px 0px;
`;

const UpgradeButton = styled.div`
    border: 1px solid white;
    width: 1.5em;
    height: 1.5em;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const UpgradeValueButton = styled.div`
    margin-left: auto;
    margin-right: 8px;
`;

const BuildingUpgrade: React.FC<{
    upgradeName: string,
    onClick?: Function,
}> = ({ upgradeName, onClick }) => {
    return (
        <UpgradeContainer onClick={() => onClick && onClick()}>
            <div>{upgradeName}</div>
            <UpgradeValueButton>0.1</UpgradeValueButton>
            <UpgradeButton>+</UpgradeButton>
        </UpgradeContainer>
    );
}