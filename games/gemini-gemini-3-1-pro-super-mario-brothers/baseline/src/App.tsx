import React, { useState, useCallback, useMemo } from 'react';
import type { GameState } from './types';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameLoop } from './hooks/useGameLoop';
import Player from './components/Player';
import Level from './components/Level';
import HUD from './components/HUD';
import { generateLevel } from './game/level';
import * as C from './constants';

const getInitialGameState = (): GameState => ({
  player: {
    position: { x: 100, y: C.LEVEL_HEIGHT - C.TILE_SIZE * 4 - C.PLAYER_HEIGHT },
    velocity: { x: 0, y: 0 },
    isJumping: false,
    isDead: false,
  },
  enemies: [],
  score: 0,
  gameOver: false,
  level: generateLevel(),
  cameraOffset: 0,
  gameStarted: false,
});


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const keys = useKeyboard();

  const handleStart = () => {
    setGameState(prev => ({...prev, gameStarted: true}));
  }

  const handleRestart = () => {
    setGameState(getInitialGameState());
  };

  const gameLogic = useCallback((_deltaTime: number) => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    setGameState((prev) => {
      const { player } = prev;
      let newPlayer = { ...player };
      let newVelocity = { ...newPlayer.velocity };

      // Horizontal movement
      if (keys.ArrowLeft) {
        newVelocity.x = -C.PLAYER_SPEED;
      } else if (keys.ArrowRight) {
        newVelocity.x = C.PLAYER_SPEED;
      } else {
        newVelocity.x = 0;
      }

      // Jumping
      if (keys.ArrowUp && !newPlayer.isJumping) {
        newVelocity.y = -C.JUMP_FORCE;
        newPlayer.isJumping = true;
      }
      
      // Apply gravity
      newVelocity.y += C.GRAVITY;
      if (newVelocity.y > C.TERMINAL_VELOCITY) {
        newVelocity.y = C.TERMINAL_VELOCITY;
      }

      // Update position
      let newPosition = {
        x: newPlayer.position.x + newVelocity.x,
        y: newPlayer.position.y + newVelocity.y,
      };

      // Collision detection with level
      const playerLeft = Math.floor(newPosition.x / C.TILE_SIZE);
      const playerRight = Math.floor((newPosition.x + C.PLAYER_WIDTH) / C.TILE_SIZE);
      const playerTop = Math.floor(newPosition.y / C.TILE_SIZE);
      const playerBottom = Math.floor((newPosition.y + C.PLAYER_HEIGHT) / C.TILE_SIZE);

      for (let y = playerTop; y <= playerBottom; y++) {
        for (let x = playerLeft; x <= playerRight; x++) {
          if (x >= 0 && x < C.LEVEL_WIDTH_TILES && y >= 0 && y < C.LEVEL_HEIGHT_TILES) {
            const tile = prev.level[y][x];
            if (tile !== C.TILE_EMPTY) {
              const tileTop = y * C.TILE_SIZE;
              const tileLeft = x * C.TILE_SIZE;

              // Vertical collision
              if (newPosition.y + C.PLAYER_HEIGHT > tileTop && newPlayer.position.y + C.PLAYER_HEIGHT <= tileTop && newVelocity.y >= 0) {
                newPosition.y = tileTop - C.PLAYER_HEIGHT;
                newVelocity.y = 0;
                newPlayer.isJumping = false;
              }
              // Head collision
              if (newPosition.y < tileTop + C.TILE_SIZE && newPlayer.position.y >= tileTop + C.TILE_SIZE && newVelocity.y < 0) {
                newPosition.y = tileTop + C.TILE_SIZE;
                newVelocity.y = 0;
              }
              // Horizontal collision
              if (newPosition.x + C.PLAYER_WIDTH > tileLeft && newPlayer.position.x + C.PLAYER_WIDTH <= tileLeft && newVelocity.x > 0) {
                newPosition.x = tileLeft - C.PLAYER_WIDTH;
                newVelocity.x = 0;
              }
              if (newPosition.x < tileLeft + C.TILE_SIZE && newPlayer.position.x >= tileLeft + C.TILE_SIZE && newVelocity.x < 0) {
                newPosition.x = tileLeft + C.TILE_SIZE;
                newVelocity.x = 0;
              }
            }
          }
        }
      }

      // Prevent moving off the left edge of the screen
      if (newPosition.x < prev.cameraOffset) {
        newPosition.x = prev.cameraOffset;
      }
      
      // Update player state
      newPlayer.position = newPosition;
      newPlayer.velocity = newVelocity;
      
      // Camera follows player
      let newCameraOffset = prev.cameraOffset;
      const cameraFollowPoint = newCameraOffset + C.SCREEN_WIDTH / 2;
      if (newPlayer.position.x > cameraFollowPoint) {
          newCameraOffset = newPlayer.position.x - C.SCREEN_WIDTH / 2;
      }
      if (newCameraOffset < 0) newCameraOffset = 0;
      if (newCameraOffset > C.LEVEL_WIDTH - C.SCREEN_WIDTH) {
          newCameraOffset = C.LEVEL_WIDTH - C.SCREEN_WIDTH;
      }
      
      // Check for death
      let newGameOver = prev.gameOver;
      if (newPlayer.position.y > C.LEVEL_HEIGHT) {
        newPlayer.isDead = true;
        newGameOver = true;
      }

      return {
        ...prev,
        player: newPlayer,
        gameOver: newGameOver,
        cameraOffset: newCameraOffset,
      };
    });
  }, [keys, gameState.gameStarted, gameState.gameOver]);

  useGameLoop(gameLogic);
  
  const worldStyle = useMemo(() => ({
    transform: `translate3d(${-gameState.cameraOffset}px, 0, 0)`,
    width: C.LEVEL_WIDTH,
    height: C.LEVEL_HEIGHT
  }), [gameState.cameraOffset]);

  const containerStyle = useMemo(() => ({
    width: C.SCREEN_WIDTH,
    height: C.SCREEN_HEIGHT,
    transform: `scale(${window.innerHeight / C.SCREEN_HEIGHT})`,
    transformOrigin: 'top left'
  }), []);

  return (
    <div className="game-container" style={containerStyle}>
      <HUD 
        score={gameState.score}
        gameOver={gameState.gameOver}
        gameStarted={gameState.gameStarted}
        onRestart={handleRestart}
        onStart={handleStart}
      />
      <div className="game-world" style={worldStyle}>
        {gameState.gameStarted && (
            <>
                <Level level={gameState.level} cameraOffset={gameState.cameraOffset} />
                <Player player={gameState.player} />
            </>
        )}
      </div>
    </div>
  );
};

export default App;
