import {
  CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILE, STATE, ROWS,
} from './constants.js';
import { isEnter, clearKey, clearAll } from './input.js';
import { createLevel, isBreakable, isQuestion, getBlockContents, getEnemySpawns } from './level.js';
import { createPlayer, updatePlayer, damagePlayer } from './player.js';
import { createEnemy, updateEnemy, stompEnemy, checkShellHit } from './enemies.js';
import {
  createItem, createCoinPopup, createBrickParticle, createScorePopup,
  updateItem, collectItem, updateParticles, updateScorePopups,
} from './items.js';
import { aabb } from './physics.js';
import {
  playCoinSound, playStompSound, playBumpSound, playBreakSound,
  playDeathSound, playFlagpoleSound, playGameOverSound,
} from './sound.js';

export function createGame() {
  const level = createLevel();
  const blockContents = getBlockContents();
  const enemySpawns = getEnemySpawns();

  const player = createPlayer(3 * TILE_SIZE, 11 * TILE_SIZE);

  const camera = { x: 0, y: 0 };

  const enemies = [];
  const items = [];
  const coinPopups = [];
  const particles = [];
  const scorePopups = [];

  return {
    state: STATE.TITLE,
    level,
    player,
    camera,
    enemies,
    items,
    coinPopups,
    particles,
    scorePopups,
    blockContents,
    enemySpawns,
    timer: 400,
    deathTimer: 0,
    levelCompleteTimer: 0,
    flagY: 2 * TILE_SIZE,
    flagSliding: false,
    spawnedEnemyCols: new Set(),
  };
}

export function updateGame(game) {
  switch (game.state) {
    case STATE.TITLE:
      updateTitle(game);
      break;
    case STATE.PLAYING:
      updatePlaying(game);
      break;
    case STATE.DYING:
      updateDying(game);
      break;
    case STATE.GAME_OVER:
      updateGameOver(game);
      break;
    case STATE.WIN:
    case STATE.LEVEL_COMPLETE:
      updateWin(game);
      break;
  }
}

function updateTitle(game) {
  if (isEnter()) {
    clearKey('Enter');
    game.state = STATE.PLAYING;
    resetLevel(game);
  }
}

function resetLevel(game) {
  const level = createLevel();
  game.level = level;
  game.blockContents = getBlockContents();
  game.enemySpawns = getEnemySpawns();
  game.player.x = 3 * TILE_SIZE;
  game.player.y = 11 * TILE_SIZE;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.dead = false;
  game.player.onGround = false;
  game.player.animFrame = 0;
  game.player.direction = 1;
  game.player.fireballs = [];
  game.camera.x = 0;
  game.enemies = [];
  game.items = [];
  game.coinPopups = [];
  game.particles = [];
  game.scorePopups = [];
  game.timer = 400;
  game.flagY = 2 * TILE_SIZE;
  game.flagSliding = false;
  game.spawnedEnemyCols = new Set();
}

function updatePlaying(game) {
  const { player, level, camera, enemies, items, coinPopups, particles, scorePopups } = game;

  // Update timer
  game.timer -= 1 / 60;
  if (game.timer <= 0) {
    game.timer = 0;
    player.dead = true;
    player.vy = -12;
    playDeathSound();
    game.state = STATE.DYING;
    game.deathTimer = 120;
    return;
  }

  // Update player
  const hits = updatePlayer(player, level.tiles, camera);

  // Handle block hits from below
  if (hits && hits.hitY && hits.hitY.side === 'top') {
    handleBlockHit(game, hits.hitY.col, hits.hitY.row);
  }

  // Update camera - follow player
  const targetCamX = player.x - CANVAS_WIDTH / 3;
  if (targetCamX > camera.x) {
    camera.x = targetCamX;
  }
  // Clamp camera
  if (camera.x < 0) camera.x = 0;
  const maxCam = level.width * TILE_SIZE - CANVAS_WIDTH;
  if (camera.x > maxCam) camera.x = maxCam;

  // Spawn enemies when they come into view
  spawnEnemies(game);

  // Update enemies
  for (const enemy of enemies) {
    updateEnemy(enemy, level.tiles);

    // Shell hitting other enemies
    if (enemy.type === 'koopa' && enemy.shell && enemy.shellMoving) {
      checkShellHit(enemy, enemies);
    }
  }

  // Player-enemy collision
  for (const enemy of enemies) {
    if (!enemy.active || enemy.squished) continue;

    if (aabb(player, enemy)) {
      // Star power kills enemies
      if (player.starPower) {
        enemy.active = false;
        player.score += 200;
        scorePopups.push(createScorePopup(enemy.x, enemy.y, 200));
        continue;
      }

      // Check if stomping from above
      const playerBottom = player.y + player.h;
      const enemyTop = enemy.y;
      const isFalling = player.vy > 0;
      const isAbove = playerBottom - enemyTop < 20;

      if (isFalling && isAbove) {
        stompEnemy(enemy, player);
        playStompSound();
        scorePopups.push(createScorePopup(enemy.x, enemy.y, 100));
      } else {
        // Koopa shell that's stationary can be kicked
        if (enemy.type === 'koopa' && enemy.shell && !enemy.shellMoving) {
          enemy.shellMoving = true;
          enemy.vx = player.x < enemy.x ? 8 : -8;
          player.score += 400;
        } else {
          // Take damage
          const died = damagePlayer(player);
          if (died) {
            playDeathSound();
            game.state = STATE.DYING;
            game.deathTimer = 120;
            return;
          }
        }
      }
    }
  }

  // Fireball-enemy collision
  for (const fb of player.fireballs) {
    for (const enemy of enemies) {
      if (!enemy.active || enemy.squished) continue;
      if (aabb(fb, enemy)) {
        enemy.active = false;
        fb.active = false;
        player.score += 200;
        scorePopups.push(createScorePopup(enemy.x, enemy.y, 200));
        playStompSound();
      }
    }
  }

  // Update items
  for (const item of items) {
    updateItem(item, level.tiles);
    collectItem(item, player);
  }

  // Update coin popups
  for (let i = coinPopups.length - 1; i >= 0; i--) {
    const coin = coinPopups[i];
    coin.y += coin.vy;
    coin.vy += 0.4;
    coin.timer--;
    if (coin.timer <= 0) {
      coinPopups.splice(i, 1);
    }
  }

  // Update particles
  updateParticles(particles);
  updateScorePopups(scorePopups);

  // Check if player fell
  if (player.dead) {
    playDeathSound();
    game.state = STATE.DYING;
    game.deathTimer = 120;
    return;
  }

  // Check flag pole collision
  if (!game.flagSliding) {
    const flagCol = 198;
    const flagX = flagCol * TILE_SIZE;
    if (player.x + player.w >= flagX && player.x <= flagX + TILE_SIZE) {
      if (player.y > 2 * TILE_SIZE) {
        game.flagSliding = true;
        game.levelCompleteTimer = 180;
        player.vx = 0;
        player.vy = 0;

        // Score based on height
        const flagRow = Math.floor(player.y / TILE_SIZE);
        const heightBonus = Math.max(0, (12 - flagRow)) * 500;
        player.score += heightBonus;
        scorePopups.push(createScorePopup(flagX, player.y, heightBonus));

        playFlagpoleSound();
        game.state = STATE.LEVEL_COMPLETE;
      }
    }
  }
}

function updateDying(game) {
  game.deathTimer--;

  // Animate player flying up then falling
  if (game.deathTimer > 90) {
    game.player.vy = -8;
  }
  game.player.y += game.player.vy;
  game.player.vy += 0.5;

  if (game.deathTimer <= 0) {
    game.player.lives--;
    if (game.player.lives <= 0) {
      game.state = STATE.GAME_OVER;
      playGameOverSound();
    } else {
      // Reset level keeping score and lives
      const lives = game.player.lives;
      const score = game.player.score;
      const coins = game.player.coins;
      resetLevel(game);
      game.player.lives = lives;
      game.player.score = score;
      game.player.coins = coins;
      game.player.big = false;
      game.player.hasFireFlower = false;
      game.player.h = 42;
      game.state = STATE.PLAYING;
    }
  }
}

function updateGameOver(game) {
  if (isEnter()) {
    clearKey('Enter');
    Object.assign(game, createGame());
    game.state = STATE.TITLE;
  }
}

function updateWin(game) {
  game.levelCompleteTimer--;

  // Slide flag down
  const maxFlagY = 12 * TILE_SIZE;
  if (game.flagY < maxFlagY) {
    game.flagY += 4;
  }

  // Move Mario to the right toward castle
  if (game.levelCompleteTimer < 120) {
    game.player.x += 2;
    game.player.vx = 2;
    game.player.animFrame = (Math.floor(game.levelCompleteTimer / 6)) % 3;
    game.player.direction = 1;

    // Apply gravity so Mario walks on ground
    game.player.vy += 0.5;
    if (game.player.vy > 8) game.player.vy = 8;
    game.player.y += game.player.vy;

    // Simple ground check
    const groundY = 13 * TILE_SIZE - game.player.h;
    if (game.player.y >= groundY) {
      game.player.y = groundY;
      game.player.vy = 0;
    }
  }

  // Timer bonus
  if (game.levelCompleteTimer < 60 && game.timer > 0) {
    const timeBonus = Math.min(game.timer, 5);
    game.timer -= timeBonus;
    game.player.score += timeBonus * 50;
  }

  if (game.levelCompleteTimer <= -60) {
    game.state = STATE.WIN;
  }

  if (game.state === STATE.WIN && isEnter()) {
    clearKey('Enter');
    Object.assign(game, createGame());
    game.state = STATE.TITLE;
  }
}

function handleBlockHit(game, col, row) {
  const { level, player, items, coinPopups, particles, scorePopups } = game;
  const tileType = level.tiles[col][row];

  if (isQuestion(tileType)) {
    // Turn into used block
    level.tiles[col][row] = TILE.QUESTION_USED;

    const contentKey = `${col},${row}`;
    const content = game.blockContents[contentKey] || 'coin';

    if (content === 'coin') {
      player.coins++;
      player.score += 200;
      playCoinSound();
      coinPopups.push(createCoinPopup(col * TILE_SIZE + 3, row * TILE_SIZE));
      scorePopups.push(createScorePopup(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE - 10, 200));
    } else if (content === 'mushroom') {
      if (player.big) {
        items.push(createItem(col, row, 'fireflower'));
      } else {
        items.push(createItem(col, row, 'mushroom'));
      }
    } else if (content === 'fireflower') {
      if (player.big) {
        items.push(createItem(col, row, 'fireflower'));
      } else {
        items.push(createItem(col, row, 'mushroom'));
      }
    } else if (content === 'star') {
      items.push(createItem(col, row, 'star'));
    }

    playBumpSound();
  } else if (isBreakable(tileType)) {
    if (player.big) {
      // Break the brick
      level.tiles[col][row] = TILE.EMPTY;
      playBreakSound();
      player.score += 50;

      // Create brick particles
      const bx = col * TILE_SIZE;
      const by = row * TILE_SIZE;
      particles.push(createBrickParticle(bx, by));
      particles.push(createBrickParticle(bx + TILE_SIZE / 2, by));
      particles.push(createBrickParticle(bx, by + TILE_SIZE / 2));
      particles.push(createBrickParticle(bx + TILE_SIZE / 2, by + TILE_SIZE / 2));
    } else {
      // Just bump it
      playBumpSound();
    }
  }

  // Check for enemies standing on the hit block
  for (const enemy of game.enemies) {
    if (!enemy.active) continue;
    const enemyCol = Math.floor((enemy.x + enemy.w / 2) / TILE_SIZE);
    const enemyRow = Math.floor(enemy.y / TILE_SIZE);
    if (enemyCol === col && enemyRow === row - 1) {
      enemy.active = false;
      enemy.vy = -6;
      player.score += 100;
    }
  }
}

function spawnEnemies(game) {
  const { camera, enemySpawns, enemies, spawnedEnemyCols } = game;
  const spawnThreshold = camera.x + CANVAS_WIDTH + TILE_SIZE * 2;

  for (const spawn of enemySpawns) {
    const [col, row, type] = spawn;
    const key = `${col},${row}`;
    if (spawnedEnemyCols.has(key)) continue;

    const enemyX = col * TILE_SIZE;
    if (enemyX < spawnThreshold) {
      enemies.push(createEnemy(col, row, type));
      spawnedEnemyCols.add(key);
    }
  }
}
