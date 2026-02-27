import { Block, Enemy } from './entities.js';
import { TILE_SIZE, CANVAS_HEIGHT } from './constants.js';

export function loadLevel() {
    const blocks = [];
    const enemies = [];
    
    // Ground
    for (let i = 0; i < 150; i++) {
        // Create gaps
        if (i > 15 && i < 18) continue;
        if (i > 35 && i < 40) continue;
        if (i > 70 && i < 75) continue;
        if (i > 100 && i < 105) continue;
        
        blocks.push(new Block(i * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE));
        blocks.push(new Block(i * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 2)); // Double deep ground
    }

    // Platforms
    blocks.push(new Block(10 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 4));
    blocks.push(new Block(11 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 4));
    blocks.push(new Block(12 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 4));

    blocks.push(new Block(22 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));
    blocks.push(new Block(23 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));

    blocks.push(new Block(28 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 4));
    blocks.push(new Block(29 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 4));
    
    // More platforms
    blocks.push(new Block(45 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));
    blocks.push(new Block(46 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));
    blocks.push(new Block(47 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));

    // Stairs
    for(let i=0; i<5; i++){
        for(let j=0; j<=i; j++) {
            blocks.push(new Block((60 + i) * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * (3 + j)));
        }
    }
    
    for(let i=0; i<5; i++){
        for(let j=0; j<=i; j++) {
            blocks.push(new Block((85 + i) * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * (3 + j)));
        }
    }

    // Flag pole block
    const goalBlockX = 120;
    blocks.push(new Block(goalBlockX * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    blocks.push(new Block(goalBlockX * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 4));
    blocks.push(new Block(goalBlockX * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));
    blocks.push(new Block(goalBlockX * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 6));
    blocks.push(new Block(goalBlockX * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 7));

    // Enemies
    enemies.push(new Enemy(12 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 5));
    enemies.push(new Enemy(25 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    enemies.push(new Enemy(32 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    enemies.push(new Enemy(48 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    enemies.push(new Enemy(55 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    enemies.push(new Enemy(68 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    enemies.push(new Enemy(80 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));
    enemies.push(new Enemy(90 * TILE_SIZE, CANVAS_HEIGHT - TILE_SIZE * 3));

    return { blocks, enemies, goalX: goalBlockX * TILE_SIZE };
}