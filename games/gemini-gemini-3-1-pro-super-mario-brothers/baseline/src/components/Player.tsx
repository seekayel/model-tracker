import React from 'react';
import type { PlayerState } from '../types';
import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants';

type PlayerProps = {
  player: PlayerState;
};

const Player: React.FC<PlayerProps> = ({ player }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: player.position.x,
    top: player.position.y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: 'red',
    border: '1px solid black'
  };

  return <div style={style}></div>;
};

export default Player;
