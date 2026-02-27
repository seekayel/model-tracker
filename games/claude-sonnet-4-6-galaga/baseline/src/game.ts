import type { Player, Bullet, Enemy, GameState } from './types';
import { InputManager } from './input';
import { buildFormation, generateDivePath, getPathPoint } from './formation';
import {
  drawPlayer, drawBee, drawButterfly, drawBoss,
  drawBullet, drawStar, drawExplosion, drawCaptureBeam
} from './sprites';

interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
}

interface Explosion {
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
}

const CANVAS_W = 480;
const CANVAS_H = 640;
const PLAYER_SPEED = 4;
const BULLET_SPEED = 8;
const ENEMY_BULLET_SPEED = 3;
const PLAYER_SHOOT_COOLDOWN = 18;
const SCORE_BEE = 50;
const SCORE_BUTTERFLY = 80;
const SCORE_BOSS = 150;
const FORMATION_DRIFT_SPEED = 0.4;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;

  private state: GameState = 'title';
  private score: number = 0;
  private highScore: number = 0;
  private wave: number = 1;
  private waveClearTimer: number = 0;

  private player!: Player;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private explosions: Explosion[] = [];
  private stars: Star[] = [];

  private formationDriftDir: number = 1;
  private formationDriftX: number = 0;
  private formationDriftMax: number = 30;

  private frameCount: number = 0;
  private lastTime: number = 0;
  private animFrameId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputManager();

    this.initStars();
    this.loop = this.loop.bind(this);
  }

  start(): void {
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private loop(time: number): void {
    const dt = Math.min((time - this.lastTime) / 16.67, 3);
    this.lastTime = time;
    this.frameCount++;

    this.update(dt);
    this.render();
    this.input.clearFrame();

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
        speed: 0.5 + Math.random() * 1.5,
        brightness: Math.random(),
      });
    }
  }

  private resetGame(): void {
    this.score = 0;
    this.wave = 1;
    this.formationDriftX = 0;
    this.formationDriftDir = 1;
    this.bullets = [];
    this.explosions = [];
    this.initPlayer();
    this.initWave();
  }

  private initPlayer(): void {
    this.player = {
      x: CANVAS_W / 2 - 14,
      y: CANVAS_H - 60,
      width: 28,
      height: 28,
      active: true,
      speed: PLAYER_SPEED,
      lives: 3,
      invincible: false,
      invincibleTimer: 0,
      shootCooldown: 0,
    };
  }

  private initWave(): void {
    this.enemies = buildFormation(CANVAS_W);
    this.bullets = this.bullets.filter(b => b.fromPlayer); // keep player bullets
    this.state = 'playing';
  }

  private update(dt: number): void {
    switch (this.state) {
      case 'title': this.updateTitle(); break;
      case 'playing': this.updatePlaying(dt); break;
      case 'wave_clear': this.updateWaveClear(dt); break;
      case 'game_over': this.updateGameOver(); break;
    }
  }

  private updateTitle(): void {
    if (this.input.wasPressed('Space') || this.input.wasPressed('Enter')) {
      this.resetGame();
    }
  }

  private updateGameOver(): void {
    if (this.input.wasPressed('Space') || this.input.wasPressed('Enter')) {
      this.state = 'title';
    }
  }

  private updateWaveClear(dt: number): void {
    this.waveClearTimer -= dt;
    this.updateStars(dt);
    this.updateExplosions();
    if (this.waveClearTimer <= 0) {
      this.wave++;
      this.initWave();
    }
  }

  private updatePlaying(dt: number): void {
    this.updateStars(dt);
    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateExplosions();
    this.checkCollisions();
    this.checkWaveEnd();
  }

  private updateStars(dt: number): void {
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > CANVAS_H) {
        star.y = 0;
        star.x = Math.random() * CANVAS_W;
      }
    }
  }

  private updatePlayer(dt: number): void {
    if (!this.player.active) return;

    if (this.player.invincible) {
      this.player.invincibleTimer -= dt;
      if (this.player.invincibleTimer <= 0) {
        this.player.invincible = false;
      }
    }

    if (this.player.shootCooldown > 0) {
      this.player.shootCooldown -= dt;
    }

    // Move
    if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) {
      this.player.x -= this.player.speed * dt;
    }
    if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) {
      this.player.x += this.player.speed * dt;
    }

    // Clamp
    this.player.x = Math.max(0, Math.min(CANVAS_W - this.player.width, this.player.x));

    // Shoot
    if ((this.input.isDown('Space') || this.input.isDown('KeyZ')) && this.player.shootCooldown <= 0) {
      this.shootPlayerBullet();
      this.player.shootCooldown = PLAYER_SHOOT_COOLDOWN;
    }
  }

  private shootPlayerBullet(): void {
    this.bullets.push({
      x: this.player.x + this.player.width / 2,
      y: this.player.y,
      width: 3,
      height: 8,
      active: true,
      vx: 0,
      vy: -BULLET_SPEED,
      fromPlayer: true,
    });
  }

  private updateBullets(dt: number): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      // Deactivate if off screen
      if (bullet.y < -20 || bullet.y > CANVAS_H + 20 || bullet.x < -20 || bullet.x > CANVAS_W + 20) {
        bullet.active = false;
      }
    }

    // Clean up
    this.bullets = this.bullets.filter(b => b.active);
  }

  private updateEnemies(dt: number): void {
    const activeEnemies = this.enemies.filter(e => e.active);

    // Formation drift
    this.formationDriftX += FORMATION_DRIFT_SPEED * this.formationDriftDir * dt;
    if (Math.abs(this.formationDriftX) > this.formationDriftMax) {
      this.formationDriftDir *= -1;
    }

    // Speed up when fewer enemies
    const speedMult = 1 + (1 - activeEnemies.length / 26) * 1.5;

    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.state === 'dead') continue;

      if (enemy.state === 'entering') {
        this.updateEnemyEntry(enemy, dt, speedMult);
      } else if (enemy.state === 'formation') {
        this.updateEnemyFormation(enemy, dt, speedMult);
      } else if (enemy.state === 'diving') {
        this.updateEnemyDive(enemy, dt, speedMult);
      }

      // Enemy shooting
      if (enemy.state === 'formation' || enemy.state === 'diving') {
        this.tryEnemyShoot(enemy, dt);
      }

      // Boss capture beam
      if (enemy.type === 'boss' && enemy.state === 'diving') {
        if (enemy.captureBeamActive) {
          enemy.captureBeamTimer = (enemy.captureBeamTimer || 0) + 1;
        }
      }
    }
  }

  private updateEnemyEntry(enemy: Enemy, dt: number, speedMult: number): void {
    const speed = enemy.entrySpeed * speedMult;
    enemy.entryProgress = Math.min(1, enemy.entryProgress + (speed / 200) * dt);

    const pos = getPathPoint(enemy.entryPath, enemy.entryProgress);
    enemy.x = pos.x - enemy.width / 2;
    enemy.y = pos.y - enemy.height / 2;

    if (enemy.entryProgress >= 1) {
      enemy.state = 'formation';
      enemy.x = enemy.formationX - enemy.width / 2;
      enemy.y = enemy.formationY - enemy.height / 2;
    }
  }

  private updateEnemyFormation(enemy: Enemy, dt: number, _speedMult: number): void {
    enemy.x = enemy.formationX - enemy.width / 2 + this.formationDriftX;
    enemy.y = enemy.formationY - enemy.height / 2;

    // Chance to dive
    const diveChance = (0.0003 + this.wave * 0.0001) * dt;
    const allEntered = this.enemies.filter(e => e.active).every(e => e.state !== 'entering');
    const numDiving = this.enemies.filter(e => e.active && e.state === 'diving').length;

    if (allEntered && numDiving < 2 && Math.random() < diveChance) {
      this.startDive(enemy);
    }
  }

  private startDive(enemy: Enemy): void {
    enemy.state = 'diving';
    const playerCX = this.player.active ? this.player.x + this.player.width / 2 : CANVAS_W / 2;
    enemy.divePathPoints = generateDivePath(enemy, playerCX, CANVAS_W, CANVAS_H);
    enemy.divePathProgress = 0;
    enemy.diveSpeed = 2.5 + this.wave * 0.2;

    if (enemy.type === 'boss' && Math.random() < 0.3) {
      enemy.captureBeamActive = true;
      enemy.captureBeamTimer = 0;
    }
  }

  private updateEnemyDive(enemy: Enemy, dt: number, _speedMult: number): void {
    const speed = enemy.diveSpeed;
    enemy.divePathProgress = Math.min(1, enemy.divePathProgress + (speed / 300) * dt);

    const pos = getPathPoint(enemy.divePathPoints, enemy.divePathProgress);
    enemy.x = pos.x - enemy.width / 2;
    enemy.y = pos.y - enemy.height / 2;

    if (enemy.divePathProgress >= 1) {
      // Reset to formation
      enemy.state = 'formation';
      enemy.captureBeamActive = false;
      enemy.x = enemy.formationX - enemy.width / 2 + this.formationDriftX;
      enemy.y = enemy.formationY - enemy.height / 2;
    }
  }

  private tryEnemyShoot(enemy: Enemy, dt: number): void {
    enemy.shootTimer -= dt;
    if (enemy.shootTimer <= 0) {
      const shootInterval = Math.max(30, 120 - this.wave * 5);
      enemy.shootTimer = shootInterval + Math.random() * 60;

      // Only shoot if player is below
      if (this.player.active && enemy.y < this.player.y) {
        const cx = enemy.x + enemy.width / 2;
        const cy = enemy.y + enemy.height;
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y;
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        this.bullets.push({
          x: cx,
          y: cy,
          width: 4,
          height: 6,
          active: true,
          vx: nx * ENEMY_BULLET_SPEED,
          vy: ny * ENEMY_BULLET_SPEED,
          fromPlayer: false,
        });
      }
    }
  }

  private updateExplosions(): void {
    for (const exp of this.explosions) {
      exp.frame++;
    }
    this.explosions = this.explosions.filter(e => e.frame < e.maxFrames);
  }

  private checkCollisions(): void {
    // Player bullets vs enemies
    for (const bullet of this.bullets) {
      if (!bullet.active || !bullet.fromPlayer) continue;

      for (const enemy of this.enemies) {
        if (!enemy.active || enemy.state === 'dead') continue;
        if (this.rectsOverlap(bullet, enemy)) {
          bullet.active = false;
          enemy.health--;

          if (enemy.health <= 0) {
            this.killEnemy(enemy);
          } else {
            // Boss hit flash - just darken briefly, tracked by health
          }
          break;
        }
      }
    }

    // Enemy bullets vs player
    if (this.player.active && !this.player.invincible) {
      for (const bullet of this.bullets) {
        if (!bullet.active || bullet.fromPlayer) continue;

        if (this.rectsOverlap(bullet, this.player)) {
          bullet.active = false;
          this.hitPlayer();
          break;
        }
      }
    }

    // Enemy collision with player (diving)
    if (this.player.active && !this.player.invincible) {
      for (const enemy of this.enemies) {
        if (!enemy.active || enemy.state !== 'diving') continue;
        if (this.rectsOverlap(enemy, this.player)) {
          this.killEnemy(enemy);
          this.hitPlayer();
        }
      }
    }
  }

  private rectsOverlap(a: { x: number; y: number; width: number; height: number },
                        b: { x: number; y: number; width: number; height: number }): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private killEnemy(enemy: Enemy): void {
    enemy.active = false;
    enemy.state = 'dead';
    enemy.captureBeamActive = false;

    const points = enemy.type === 'boss' ? SCORE_BOSS :
                   enemy.type === 'butterfly' ? SCORE_BUTTERFLY : SCORE_BEE;
    this.score += points;
    if (this.score > this.highScore) this.highScore = this.score;

    this.explosions.push({
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      frame: 0,
      maxFrames: 30,
    });
  }

  private hitPlayer(): void {
    this.player.lives--;
    this.explosions.push({
      x: this.player.x + this.player.width / 2,
      y: this.player.y + this.player.height / 2,
      frame: 0,
      maxFrames: 40,
    });

    if (this.player.lives <= 0) {
      this.player.active = false;
      setTimeout(() => {
        this.state = 'game_over';
      }, 1500);
    } else {
      this.player.invincible = true;
      this.player.invincibleTimer = 120;
    }
  }

  private checkWaveEnd(): void {
    const alive = this.enemies.filter(e => e.active);
    if (alive.length === 0) {
      this.state = 'wave_clear';
      this.waveClearTimer = 120;
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    this.renderStars();

    if (this.state === 'title') {
      this.renderTitle();
    } else if (this.state === 'game_over') {
      this.renderHUD();
      this.renderExplosions();
      this.renderGameOver();
    } else {
      this.renderGame();
    }
  }

  private renderStars(): void {
    for (const star of this.stars) {
      drawStar(this.ctx, star.x, star.y, star.brightness);
    }
  }

  private renderGame(): void {
    this.renderEnemies();
    this.renderBullets();
    if (this.player.active) {
      this.renderPlayer();
    }
    this.renderExplosions();
    this.renderHUD();
    if (this.state === 'wave_clear') {
      this.renderWaveClear();
    }
  }

  private renderPlayer(): void {
    const alpha = this.player.invincible ? (Math.floor(this.frameCount / 4) % 2 === 0 ? 0.3 : 1) : 1;
    drawPlayer(this.ctx, this.player.x, this.player.y, this.player.width, this.player.height, alpha);
  }

  private renderEnemies(): void {
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.state === 'dead') continue;

      // Draw capture beam
      if (enemy.captureBeamActive && enemy.captureBeamTimer !== undefined) {
        drawCaptureBeam(this.ctx, enemy.x + enemy.width / 2, enemy.y, enemy.height, enemy.captureBeamTimer);
      }

      const { x, y, width: w, height: h } = enemy;

      // Flash boss on first hit
      if (enemy.type === 'boss' && enemy.health === 1) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.7 + Math.sin(this.frameCount * 0.3) * 0.3;
      }

      switch (enemy.type) {
        case 'bee': drawBee(this.ctx, x, y, w, h); break;
        case 'butterfly': drawButterfly(this.ctx, x, y, w, h); break;
        case 'boss': drawBoss(this.ctx, x, y, w, h); break;
      }

      if (enemy.type === 'boss' && enemy.health === 1) {
        this.ctx.restore();
      }
    }
  }

  private renderBullets(): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;
      drawBullet(this.ctx, bullet.x, bullet.y, bullet.fromPlayer);
    }
  }

  private renderExplosions(): void {
    for (const exp of this.explosions) {
      drawExplosion(this.ctx, exp.x, exp.y, exp.frame, exp.maxFrames);
    }
  }

  private renderHUD(): void {
    const ctx = this.ctx;

    // Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score.toString().padStart(6, '0')}`, 10, 24);

    ctx.textAlign = 'center';
    ctx.fillText(`HI: ${this.highScore.toString().padStart(6, '0')}`, CANVAS_W / 2, 24);

    ctx.textAlign = 'right';
    ctx.fillText(`WAVE: ${this.wave}`, CANVAS_W - 10, 24);

    // Lives
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00FFFF';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('LIVES:', 10, CANVAS_H - 10);
    for (let i = 0; i < this.player.lives; i++) {
      drawPlayer(ctx, 62 + i * 24, CANVAS_H - 26, 18, 18, 1);
    }
  }

  private renderTitle(): void {
    const ctx = this.ctx;

    // Title
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GALAGA', CANVAS_W / 2, 200);

    ctx.fillStyle = '#FF8800';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText('CLONE', CANVAS_W / 2, 235);

    // Blinking prompt
    if (Math.floor(this.frameCount / 30) % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText('PRESS SPACE TO START', CANVAS_W / 2, 320);
    }

    // Controls
    ctx.fillStyle = '#888888';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillText('← → or A D  to move', CANVAS_W / 2, 400);
    ctx.fillText('SPACE or Z  to shoot', CANVAS_W / 2, 425);

    // Draw a small player ship
    drawPlayer(ctx, CANVAS_W / 2 - 14, 480, 28, 28);

    // Draw some demo enemies
    drawBee(ctx, CANVAS_W / 2 - 80, 500, 28, 24);
    drawButterfly(ctx, CANVAS_W / 2 - 20, 500, 28, 24);
    drawBoss(ctx, CANVAS_W / 2 + 40, 496, 32, 28);
  }

  private renderWaveClear(): void {
    const ctx = this.ctx;

    if (Math.floor(this.frameCount / 20) % 2 === 0) {
      ctx.fillStyle = '#00FF88';
      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`WAVE ${this.wave} CLEAR!`, CANVAS_W / 2, CANVAS_H / 2);
    }
  }

  private renderGameOver(): void {
    const ctx = this.ctx;

    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 30);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText(`FINAL SCORE: ${this.score}`, CANVAS_W / 2, CANVAS_H / 2 + 20);

    if (Math.floor(this.frameCount / 30) % 2 === 0) {
      ctx.fillStyle = '#FFFF00';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('PRESS SPACE TO CONTINUE', CANVAS_W / 2, CANVAS_H / 2 + 70);
    }
  }
}
