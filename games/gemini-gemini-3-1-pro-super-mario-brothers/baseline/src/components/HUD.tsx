import React from 'react';

type HUDProps = {
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
  onRestart: () => void;
  onStart: () => void;
};

const HUD: React.FC<HUDProps> = ({ score, gameOver, gameStarted, onRestart, onStart }) => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '24px',
    fontFamily: `'Press Start 2P', cursive`,
    color: 'white',
    textShadow: '2px 2px 4px #000000',
  };

  const centerMessageStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 20,
  };

  const buttonStyle: React.CSSProperties = {
    fontFamily: `'Press Start 2P', cursive`,
    fontSize: '20px',
    padding: '10px 20px',
    marginTop: '20px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '2px solid black',
  }

  if (!gameStarted) {
    return (
        <div style={centerMessageStyle}>
            <h1>Super Jumper</h1>
            <p>Arrow keys to move and jump.</p>
            <button style={buttonStyle} onClick={onStart}>Start Game</button>
        </div>
    );
  }

  return (
    <div>
      <div style={containerStyle}>
        <span>Score: {score}</span>
        <span>Lives: 3</span>
      </div>
      {gameOver && (
        <div style={centerMessageStyle}>
          <h2>Game Over</h2>
          <button style={buttonStyle} onClick={onRestart}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default HUD;
