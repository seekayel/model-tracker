export class Input {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    isDown(code) {
        return !!this.keys[code];
    }
    
    getMovement() {
        let dx = 0;
        let dy = 0;
        if (this.isDown('KeyW')) dy -= 1;
        if (this.isDown('KeyS')) dy += 1;
        if (this.isDown('KeyA')) dx -= 1;
        if (this.isDown('KeyD')) dx += 1;
        
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        return { dx, dy };
    }
    
    getShooting() {
        let dx = 0;
        let dy = 0;
        if (this.isDown('ArrowUp')) dy -= 1;
        if (this.isDown('ArrowDown')) dy += 1;
        if (this.isDown('ArrowLeft')) dx -= 1;
        if (this.isDown('ArrowRight')) dx += 1;
        
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        return { dx, dy };
    }
}
