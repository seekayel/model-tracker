const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 600;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// Game State
let gameState = 'START'; // START, PLAYING, GAME_OVER, VICTORY
let score = 0;
let lives = 3;

// Input
const keys = { ArrowLeft: false, ArrowRight: false, Space: false, a: false, d: false };

window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  if (e.code === 'Space') {
      keys.Space = true;
      e.preventDefault();
      if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
          startGame();
      } else if (gameState === 'PLAYING') {
          playerShoot();
      }
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Entities
let player;
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let stars = [];
let explosions = [];

function initStars() {
    stars = [];
    for(let i=0; i<100; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            speed: Math.random() * 2 + 0.5,
            size: Math.random() * 2
        });
    }
}

function startGame() {
    score = 0;
    lives = 3;
    gameState = 'PLAYING';
    player = { x: WIDTH/2 - 20, y: HEIGHT - 60, width: 40, height: 40, speed: 5, cooldown: 0 };
    playerBullets = [];
    enemyBullets = [];
    explosions = [];
    initEnemies();
    initStars();
}

function initEnemies() {
    enemies = [];
    const rows = 4;
    const cols = 10;
    const spacingX = 60;
    const spacingY = 50;
    const offsetX = (WIDTH - (cols * spacingX)) / 2 + 20;
    const offsetY = 50;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enemies.push({
                x: offsetX + c * spacingX,
                y: offsetY + r * spacingY,
                width: 30,
                height: 30,
                type: r < 2 ? 'boss' : 'minion',
                state: 'grid',
                swoopTargetX: 0,
                swoopTargetY: 0,
                swoopProgress: 0,
                startX: offsetX + c * spacingX,
                startY: offsetY + r * spacingY
            });
        }
    }
    enemyDirection = 1;
    enemySpeed = 1;
}

let enemyDirection = 1;
let enemySpeed = 1;
let swoopTimer = 0;

function playerShoot() {
    if (player.cooldown <= 0) {
        playerBullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 15, speed: 10 });
        player.cooldown = 15;
    }
}

function update() {
    if (gameState !== 'PLAYING') return;

    // Background Stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > HEIGHT) {
            star.y = 0;
            star.x = Math.random() * WIDTH;
        }
    });

    // Player Movement
    if (keys.ArrowLeft || keys.a) player.x -= player.speed;
    if (keys.ArrowRight || keys.d) player.x += player.speed;
    
    // Bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;

    if (player.cooldown > 0) player.cooldown--;

    // Bullets update
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        b.y -= b.speed;
        if (b.y < -20) playerBullets.splice(i, 1);
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i];
        b.y += b.speed;
        if (b.y > HEIGHT + 20) enemyBullets.splice(i, 1);
        
        // Player-EnemyBullet Collision
        if (checkCollision(b, player)) {
            enemyBullets.splice(i, 1);
            playerHit();
        }
    }

    // Enemies update
    let moveDown = false;
    let maxRight = 0;
    let maxLeft = WIDTH;
    
    enemies.forEach(e => {
        if (e.state === 'grid') {
            if (e.x + e.width > maxRight) maxRight = e.x + e.width;
            if (e.x < maxLeft) maxLeft = e.x;
        }
    });

    if (maxRight >= WIDTH - 20) {
        enemyDirection = -1;
        moveDown = true;
    } else if (maxLeft <= 20) {
        enemyDirection = 1;
        moveDown = true;
    }

    enemies.forEach(e => {
        if (e.state === 'grid') {
            e.x += enemySpeed * enemyDirection;
            if (moveDown) e.y += 20;
            e.startX = e.x;
            e.startY = e.y;
        } else if (e.state === 'swoop') {
            e.y += 4;
            e.x += Math.sin(e.y / 50) * 3;
            
            if (Math.random() < 0.01) {
                enemyBullets.push({ x: e.x + e.width/2, y: e.y + e.height, width: 4, height: 10, speed: 5 });
            }

            if (e.y > HEIGHT) {
                e.y = -50;
                e.state = 'returning';
            }
        } else if (e.state === 'returning') {
            let dx = e.startX - e.x;
            let dy = e.startY - e.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 5) {
                e.state = 'grid';
                e.x = e.startX;
                e.y = e.startY;
            } else {
                e.x += (dx / dist) * 4;
                e.y += (dy / dist) * 4;
            }
        }
    });

    // Swoop logic
    swoopTimer++;
    if (swoopTimer > 120) { // every ~2 seconds
        let gridEnemies = enemies.filter(e => e.state === 'grid');
        if (gridEnemies.length > 0) {
            let randEnemy = gridEnemies[Math.floor(Math.random() * gridEnemies.length)];
            randEnemy.state = 'swoop';
        }
        swoopTimer = 0;
    }

    // Collisions PlayerBullets -> Enemies
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let pb = playerBullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (checkCollision(pb, e)) {
                explosions.push({x: e.x + e.width/2, y: e.y + e.height/2, timer: 15});
                enemies.splice(j, 1);
                hit = true;
                score += (e.type === 'boss' ? 100 : 50);
                break;
            }
        }
        if (hit) {
            playerBullets.splice(i, 1);
        }
    }

    // Collisions Player -> Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if (checkCollision(player, e)) {
            explosions.push({x: player.x + player.width/2, y: player.y + player.height/2, timer: 20});
            explosions.push({x: e.x + e.width/2, y: e.y + e.height/2, timer: 20});
            enemies.splice(i, 1);
            playerHit();
        }
    }

    // Explosions update
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].timer--;
        if (explosions[i].timer <= 0) {
            explosions.splice(i, 1);
        }
    }

    if (enemies.length === 0) {
        gameState = 'VICTORY';
    }
}

function playerHit() {
    lives--;
    if (lives <= 0) {
        gameState = 'GAME_OVER';
    } else {
        player.x = WIDTH / 2 - 20;
    }
}

function checkCollision(r1, r2) {
    return (r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y);
}

function draw() {
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    if (gameState === 'START') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GALAGA CLONE', WIDTH/2, HEIGHT/2 - 50);
        ctx.font = '20px monospace';
        ctx.fillText('Press SPACE to Start', WIDTH/2, HEIGHT/2 + 20);
        ctx.fillText('Move: Arrow Keys or A/D | Shoot: Space', WIDTH/2, HEIGHT/2 + 60);
        return;
    }

    if (gameState !== 'GAME_OVER') {
        // Player Ship
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.lineTo(player.x + player.width/2, player.y + player.height - 10);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.fill();
    }

    // Enemies
    enemies.forEach(e => {
        ctx.fillStyle = e.type === 'boss' ? '#ff00ff' : '#ff0000';
        ctx.beginPath();
        ctx.moveTo(e.x + e.width/2, e.y + e.height);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.lineTo(e.x, e.y);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 5, e.y + 5, 5, 5);
        ctx.fillRect(e.x + e.width - 10, e.y + 5, 5, 5);
    });

    // Bullets
    ctx.fillStyle = '#ffff00';
    playerBullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    ctx.fillStyle = '#ff8800';
    enemyBullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Explosions
    explosions.forEach(ex => {
        ctx.fillStyle = `rgba(255, 165, 0, ${ex.timer / 20})`;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, (20 - ex.timer) * 1.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // UI
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${lives}`, WIDTH - 20, 30);

    if (gameState === 'GAME_OVER') {
        ctx.fillStyle = '#fff';
        ctx.font = '50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', WIDTH/2, HEIGHT/2);
        ctx.font = '20px monospace';
        ctx.fillText('Press SPACE to Restart', WIDTH/2, HEIGHT/2 + 40);
    } else if (gameState === 'VICTORY') {
        ctx.fillStyle = '#fff';
        ctx.font = '50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', WIDTH/2, HEIGHT/2);
        ctx.font = '20px monospace';
        ctx.fillText('Press SPACE to Play Again', WIDTH/2, HEIGHT/2 + 40);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initStars();
loop();
