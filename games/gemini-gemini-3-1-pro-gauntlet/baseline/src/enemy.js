class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        // AI: move towards player
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance > 1) { // prevent jitter
            this.x += (dx / distance) * this.speed * (deltaTime/16); // Normalize and apply speed
            this.y += (dy / distance) * this.speed * (deltaTime/16);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export class Ghost extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 30;
        this.height = 30;
        this.speed = 1.5;
        this.color = 'white';
        this.scoreValue = 10;
    }
}

export class Demon extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 35;
        this.height = 35;
        this.speed = 1;
        this.color = 'red';
        this.scoreValue = 15;
    }
}
