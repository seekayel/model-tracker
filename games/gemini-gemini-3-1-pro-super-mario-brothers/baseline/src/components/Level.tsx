import React from 'react';
import {
  TILE_SIZE,
  TILE_GROUND,
  TILE_BRICK,
  TILE_QUESTION,
  TILE_SOLID,
  TILE_PIPE_TOP_LEFT,
  TILE_PIPE_TOP_RIGHT,
  TILE_PIPE_LEFT,
  TILE_PIPE_RIGHT,
  SCREEN_WIDTH_TILES,
} from '../constants';

type LevelProps = {
  level: number[][];
  cameraOffset: number;
};

const getTileColor = (tile: number): string => {
  switch (tile) {
    case TILE_GROUND:
      return '#E79A47'; // Brown for ground
    case TILE_BRICK:
      return '#B97A57'; // Reddish-brown for brick
    case TILE_QUESTION:
      return '#FFD700'; // Gold for question mark blocks
    case TILE_SOLID:
      return '#A0A0A0'; // Grey for solid blocks
    case TILE_PIPE_TOP_LEFT:
    case TILE_PIPE_TOP_RIGHT:
    case TILE_PIPE_LEFT:
    case TILE_PIPE_RIGHT:
      return '#00A800'; // Green for pipes
    default:
      return 'transparent';
  }
};

const Level: React.FC<LevelProps> = ({ level, cameraOffset }) => {
  const startCol = Math.floor(cameraOffset / TILE_SIZE);
  const endCol = startCol + SCREEN_WIDTH_TILES + 2;

  const tilesToRender = [];

  for (let row = 0; row < level.length; row++) {
    for (let col = startCol; col < endCol; col++) {
      if (col < 0 || col >= level[0].length) continue;
      const tile = level[row][col];
      if (tile === 0) continue;

      tilesToRender.push(
        <div
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            left: col * TILE_SIZE,
            top: row * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundColor: getTileColor(tile),
            border: tile !== 0 ? '1px solid black' : 'none',
            boxSizing: 'border-box',
          }}
        >
          {tile === TILE_QUESTION ? '?' : ''}
        </div>
      );
    }
  }

  return <>{tilesToRender}</>;
};

export default Level;
