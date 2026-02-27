import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { GameState, Position } from './game/types';
import { createInitialState, moveUnit, foundCity, endTurn, changeCityBuild } from './game/engine';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const startGame = () => {
    setGameState(createInitialState());
    setSelectedPos(null);
  };

  const handleTileClick = (x: number, y: number) => {
    if (!gameState || gameState.gameOver || gameState.players[gameState.currentPlayerIndex].type !== 'human') return;

    const clickedPos = { x, y };
    
    // If we have a selected unit and click an adjacent tile, try to move
    if (selectedPos) {
        const selectedUnit = gameState.units.find(u => u.pos.x === selectedPos.x && u.pos.y === selectedPos.y && u.playerId === gameState.players[gameState.currentPlayerIndex].id);
        
        if (selectedUnit && selectedUnit.movement > 0) {
            const dist = Math.abs(selectedPos.x - x) + Math.abs(selectedPos.y - y);
            if (dist === 1) {
                setGameState(moveUnit(gameState, selectedUnit.id, clickedPos));
                setSelectedPos(clickedPos); // Keep selection on unit if it moved
                return;
            }
        }
    }
    
    // Otherwise just select the tile
    setSelectedPos(clickedPos);
  };

  const handleKeyDown = useCallback((e: globalThis.KeyboardEvent) => {
      if (!gameState || !selectedPos) return;

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.type !== 'human') return;

      const selectedUnit = gameState.units.find(u => u.pos.x === selectedPos.x && u.pos.y === selectedPos.y && u.playerId === currentPlayer.id);
      
      let dx = 0; let dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
      else if (e.key === 'f' && selectedUnit?.type === 'settler') {
          setGameState(foundCity(gameState, selectedUnit.id));
          return;
      } else if (e.key === ' ') {
          setGameState(endTurn(gameState));
          return;
      }

      if (dx !== 0 || dy !== 0) {
          if (!selectedUnit) {
              // Move cursor
              const targetPos = { x: selectedPos.x + dx, y: selectedPos.y + dy };
              if (targetPos.x >= 0 && targetPos.x < gameState.width && targetPos.y >= 0 && targetPos.y < gameState.height) {
                  setSelectedPos(targetPos);
              }
              return;
          }

          const targetPos = { x: selectedPos.x + dx, y: selectedPos.y + dy };
          const newState = moveUnit(gameState, selectedUnit.id, targetPos);
          if (newState !== gameState) {
             setGameState(newState);
             setSelectedPos(targetPos);
          }
      }
  }, [gameState, selectedPos]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!gameState) {
    return (
      <div className="start-screen">
        <h1>CIV CLONE</h1>
        <button className="start-btn" onClick={startGame}>Start Game</button>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const selectedUnit = selectedPos ? gameState.units.find(u => u.pos.x === selectedPos.x && u.pos.y === selectedPos.y) : null;
  const selectedCity = selectedPos ? gameState.cities.find(c => c.pos.x === selectedPos.x && c.pos.y === selectedPos.y) : null;

  return (
    <div className="app-container">
      {gameState.gameOver && (
          <div className="start-screen">
              <h1>Game Over</h1>
              <h2>{gameState.winner === 'p1' ? 'You Win!' : 'You Lose!'}</h2>
              <button className="start-btn" onClick={startGame}>Play Again</button>
          </div>
      )}
      <div className="header">
        <div>Turn: {gameState.turn} | Player: <span style={{color: currentPlayer.color}}>{currentPlayer.id}</span></div>
        <button onClick={() => setGameState(endTurn(gameState))}>End Turn (Space)</button>
      </div>
      
      <div className="main-content">
        <div className="game-board-container">
          <div 
            className="game-board" 
            style={{ 
                gridTemplateColumns: `repeat(${gameState.width}, 40px)`,
                gridTemplateRows: `repeat(${gameState.height}, 40px)`
            }}
          >
            {gameState.tiles.map((row, y) => 
              row.map((tile, x) => {
                const isSelected = selectedPos?.x === x && selectedPos?.y === y;
                const unit = gameState.units.find(u => u.pos.x === x && u.pos.y === y);
                const city = gameState.cities.find(c => c.pos.x === x && c.pos.y === y);
                
                return (
                  <div 
                    key={`${x}-${y}`} 
                    className={`tile ${tile.terrain} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTileClick(x, y)}
                  >
                    {city && (
                        <div className="city" style={{ borderColor: gameState.players.find(p=>p.id===city.playerId)?.color }}>
                            🏛️
                        </div>
                    )}
                    {unit && (
                        <div className="unit" style={{ backgroundColor: gameState.players.find(p=>p.id===unit.playerId)?.color }}>
                            {unit.type === 'settler' ? 'S' : 'W'}
                        </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="sidebar">
          <h2>Info</h2>
          {selectedPos && (
             <div>Selected: ({selectedPos.x}, {selectedPos.y})</div>
          )}
          
          {selectedUnit && (
              <div style={{marginTop: '20px'}}>
                  <h3>Unit: {selectedUnit.type}</h3>
                  <div>Owner: {selectedUnit.playerId}</div>
                  <div>HP: {selectedUnit.hp}</div>
                  <div>Moves: {selectedUnit.movement}/{selectedUnit.maxMovement}</div>
                  
                  {selectedUnit.playerId === currentPlayer.id && selectedUnit.type === 'settler' && (
                      <button className="action-btn" style={{marginTop: '10px'}} onClick={() => setGameState(foundCity(gameState, selectedUnit.id))}>
                          Found City (F)
                      </button>
                  )}
              </div>
          )}

          {selectedCity && (
              <div style={{marginTop: '20px'}}>
                  <h3>City: {selectedCity.name}</h3>
                  <div>Owner: {selectedCity.playerId}</div>
                  <div>Pop: {selectedCity.population}</div>
                  <div>Prod: {selectedCity.production}</div>
                  <div>Building: {selectedCity.currentBuild || 'None'}</div>
                  
                  {selectedCity.playerId === currentPlayer.id && (
                      <div style={{marginTop: '10px'}}>
                          <h4>Change Build:</h4>
                          <button className="action-btn" onClick={() => setGameState(changeCityBuild(gameState, selectedCity.id, 'warrior'))}>
                              Warrior (30)
                          </button>
                          <button className="action-btn" onClick={() => setGameState(changeCityBuild(gameState, selectedCity.id, 'settler'))}>
                              Settler (50)
                          </button>
                      </div>
                  )}
              </div>
          )}
          
          <div style={{marginTop: 'auto', paddingTop: '20px'}}>
            <p>Controls:</p>
            <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9em'}}>
              <li>Click tile to select</li>
              <li>Click adjacent to move</li>
              <li>WASD/Arrows to move</li>
              <li>F to Found City</li>
              <li>Space to End Turn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;