const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game State
const STATE_START = 0;
const STATE_PLAYING = 1;
const STATE_GAME_OVER = 2;
let gameState = STATE_START;

const paddleWidth = 15;
const paddleHeight = 100;
const ballSize = 15;

const player = {
    x: 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#fff',
    score: 0,
    dy: 0,
    speed: 8
};

const ai = {
    x: canvas.width - 30 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#fff',
    score: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    speed: 7,
    dx: 7,
    dy: 7,
    color: '#fff'
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false
};

let winner = '';
const maxScore = 5;

// Listeners
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
    
    if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === STATE_START) {
            gameState = STATE_PLAYING;
            resetBall();
        } else if (gameState === STATE_GAME_OVER) {
            gameState = STATE_PLAYING;
            player.score = 0;
            ai.score = 0;
            resetBall();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
}

function update() {
    if (gameState !== STATE_PLAYING) return;

    // Player Movement
    if (keys.ArrowUp || keys.w) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown || keys.s) {
        player.y += player.speed;
    }

    // Player bounds
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // AI Movement (simple tracking)
    const aiCenter = ai.y + ai.height / 2;
    if (aiCenter < ball.y - 10) {
        ai.y += ai.speed;
    } else if (aiCenter > ball.y + 10) {
        ai.y -= ai.speed;
    }

    // AI bounds
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball top/bottom collision
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy *= -1;
        // Keep ball inside bounds to prevent sticking
        ball.y = ball.y <= 0 ? 0 : canvas.height - ball.size;
    }

    // Ball paddle collision
    let hitPaddle = null;
    let dxMultiplier = 1;
    if (ball.dx < 0 && ball.x <= player.x + player.width && ball.x + ball.size >= player.x && ball.y + ball.size >= player.y && ball.y <= player.y + player.height) {
        hitPaddle = player;
        dxMultiplier = 1; // move right
    } else if (ball.dx > 0 && ball.x + ball.size >= ai.x && ball.x <= ai.x + ai.width && ball.y + ball.size >= ai.y && ball.y <= ai.y + ai.height) {
        hitPaddle = ai;
        dxMultiplier = -1; // move left
    }

    if (hitPaddle) {
        // Calculate hit position to change angle
        let collidePoint = (ball.y + (ball.size / 2)) - (hitPaddle.y + (hitPaddle.height / 2));
        collidePoint = collidePoint / (hitPaddle.height / 2);
        
        // Prevent angle from getting too extreme
        let angleRad = (Math.PI / 4) * collidePoint;
        
        // Increase speed slightly
        ball.speed += 0.5;
        
        ball.dx = dxMultiplier * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        
        // Ensure ball moves away from paddle to prevent multiple hits
        if (hitPaddle === player) {
            ball.x = player.x + player.width;
        } else {
            ball.x = ai.x - ball.size;
        }
    }

    // Scoring
    if (ball.x < 0) {
        ai.score++;
        checkWin();
        if (gameState === STATE_PLAYING) resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        player.score++;
        checkWin();
        if (gameState === STATE_PLAYING) resetBall();
    }
}

function checkWin() {
    if (player.score >= maxScore) {
        winner = 'Player';
        gameState = STATE_GAME_OVER;
    } else if (ai.score >= maxScore) {
        winner = 'AI';
        gameState = STATE_GAME_OVER;
    }
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawText(text, x, y, size = '40px') {
    ctx.fillStyle = '#fff';
    ctx.font = `${size} "Courier New", Courier, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 40) {
        drawRect(canvas.width / 2 - 2, i + 10, 4, 20, '#fff');
    }
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    if (gameState === STATE_START) {
        drawText('PONG', canvas.width / 2, canvas.height / 2 - 50, '80px');
        drawText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 + 30, '20px');
        drawText('Controls: W/S or Up/Down Arrows', canvas.width / 2, canvas.height / 2 + 70, '16px');
        return;
    }

    // Draw Net
    drawNet();

    // Draw Scores
    drawText(player.score, canvas.width / 4, 60);
    drawText(ai.score, 3 * canvas.width / 4, 60);

    // Draw Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Draw Ball
    drawRect(ball.x, ball.y, ball.size, ball.size, ball.color);

    if (gameState === STATE_GAME_OVER) {
        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40, '60px');
        drawText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2 + 20, '30px');
        drawText('Press SPACE to Restart', canvas.width / 2, canvas.height / 2 + 70, '20px');
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start loop
requestAnimationFrame(loop);