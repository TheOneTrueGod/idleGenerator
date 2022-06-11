import React from 'react';

import styled from 'styled-components';
import { GameData, Upgradeable, UpgradeNames } from '../GameBoard/GameData';
import { TCellStructures } from '../GameBoard/Structures/Structure';

type OnUpgradeClick = (buildingType: Upgradeable, upgradeName: UpgradeNames) => void;

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
    gameData: GameData,
    onUpgradeClick: OnUpgradeClick,
}> = ({ selectedBuilding, setSelectedBuilding, gameData, onUpgradeClick }) => {
    const buildings: Array<Upgradeable> = ['collector', 'absorber'];

    return (
        <Container>
            <Building
                key={"board"}
                buildingType={"board"}
                gameData={gameData}
                onUpgradeClick={onUpgradeClick}
            />
            { buildings.map((buildingName) => {
                return (
                    <Building
                        key={buildingName}
                        buildingType={buildingName}
                        onUpgradeClick={onUpgradeClick}
                        gameData={gameData}
                        selected={selectedBuilding === buildingName}
                        onClick={() => { setSelectedBuilding(buildingName) }}
                    />
                );
            })}
        </Container>
    );
}

const Building: React.FC<{
    buildingType: Upgradeable,
    selected?: Boolean,
    onClick?: Function,
    gameData: GameData,
    onUpgradeClick: OnUpgradeClick,
}> = ({ onUpgradeClick, buildingType, selected, onClick, gameData }) => {
    const upgradeNames = gameData.getUpgradeNamesForBuilding(buildingType);
    return (
        <BuildingContainer
            style={{
                border: selected ? '1px solid white' : '1px solid rgba(0, 0, 0, 0)'
            }}
            onClick={() => onClick && onClick()}
        >
            {buildingType}
            {upgradeNames.map((upgradeName) => 
                <BuildingUpgrade
                    key={upgradeName}
                    gameData={gameData}
                    buildingName={buildingType}
                    upgradeName={upgradeName}
                    onClick={ () => onUpgradeClick(buildingType, upgradeName)}
                />
            )}
        </BuildingContainer>
    );
}


const UpgradeContainer = styled.div`
    font-size: 14px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 4px 0px;
    height: 1.5em;
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
    buildingName: Upgradeable,
    upgradeName: UpgradeNames,
    onClick?: Function,
    gameData: GameData,
}> = ({ buildingName, upgradeName, onClick, gameData }) => {
    const statValue = gameData.getBuildingStat(buildingName, upgradeName);

    const displayNames = {
        'harvestRate': 'Absorb',
        'efficiency': 'Efficiency',
        'capacity': 'Capacity'
    }

    const showUpgradeButton = !gameData.isAtMaxUpgradeLevel(buildingName, upgradeName);

    return (
        <UpgradeContainer>
            <div>{displayNames[upgradeName]}</div>
            <UpgradeValueButton>{statValue}</UpgradeValueButton>
            {showUpgradeButton && <UpgradeButton onClick={() => onClick && onClick()}>+</UpgradeButton>}
        </UpgradeContainer>
    );
}