// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');
const playerScoreEl = document.getElementById('player-score');
const opponentScoreEl = document.getElementById('opponent-score');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 8;
const PADDLE_SPEED = 6;

// Game state
let gameState = 'start'; // 'start', 'play', 'gameOver'
let playerScore = 0;
let opponentScore = 0;
const keys = {};

// Game objects
let ball, player, opponent;

function init() {
  canvas.width = 800;
  canvas.height = 600;

  player = {
    x: PADDLE_WIDTH * 2,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
  };

  opponent = {
    x: canvas.width - PADDLE_WIDTH * 3,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  };

  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_RADIUS,
    dx: 5,
    dy: 5,
  };

  playerScore = 0;
  opponentScore = 0;
  updateScore();
  messageEl.textContent = 'Press Enter to Start';
}

// Controls
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === 'Enter' && (gameState === 'start' || gameState === 'gameOver')) {
    gameState = 'play';
    messageEl.textContent = '';
    if (gameState === 'gameOver') {
      init();
    }
    resetBall();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});


function updatePlayer() {
  if (keys['ArrowUp'] || keys['w']) {
    player.y -= PADDLE_SPEED;
  }
  if (keys['ArrowDown'] || keys['s']) {
    player.y += PADDLE_SPEED;
  }

  // Keep paddle in bounds
  if (player.y < 0) {
    player.y = 0;
  }
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }
}

function updateOpponent() {
    // Simple AI: tries to follow the ball
    const opponentCenter = opponent.y + opponent.height / 2;
    if (opponentCenter < ball.y - 10) {
        opponent.y += PADDLE_SPEED * 0.85; // Slightly slower than player
    } else if (opponentCenter > ball.y + 10) {
        opponent.y -= PADDLE_SPEED * 0.85;
    }

    // Keep paddle in bounds
    if (opponent.y < 0) {
        opponent.y = 0;
    }
    if (opponent.y + opponent.height > canvas.height) {
        opponent.y = canvas.height - opponent.height;
    }
}


function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (top/bottom)
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  // Player
  if (
    ball.x - ball.radius < player.x + player.width &&
    ball.y > player.y &&
    ball.y < player.y + player.height
  ) {
    ball.dx *= -1;
    // Increase speed slightly
    ball.dx *= 1.05;
    ball.dy *= 1.05;
  }

  // Opponent
  if (
    ball.x + ball.radius > opponent.x &&
    ball.y > opponent.y &&
    ball.y < opponent.y + opponent.height
  ) {
    ball.dx *= -1;
     // Increase speed slightly
     ball.dx *= 1.05;
     ball.dy *= 1.05;
  }

  // Score
  if (ball.x - ball.radius < 0) {
    opponentScore++;
    updateScore();
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    playerScore++;
    updateScore();
    resetBall();
  }

  if (playerScore >= 5 || opponentScore >= 5) {
      gameState = 'gameOver';
      messageEl.textContent = `${playerScore >= 5 ? 'You Win!' : 'Game Over'}. Press Enter to Restart.`;
  }
}

function updateScore() {
  playerScoreEl.textContent = playerScore;
  opponentScoreEl.textContent = opponentScore;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = Math.random() > 0.5 ? 5 : -5;
  ball.dy = Math.random() * 6 - 3;
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  ctx.fillStyle = 'white';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
  
  // Draw center line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);


  // Draw ball
  if (gameState === 'play') {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
}

function gameLoop() {
  if (gameState === 'play') {
    updatePlayer();
    updateOpponent();
    updateBall();
  }
  
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
init();
gameLoop();
