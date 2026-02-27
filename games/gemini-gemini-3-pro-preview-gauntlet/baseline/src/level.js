export class Level {
    constructor(levelNum, viewW, viewH) {
        this.levelNum = levelNum;
        this.tileSize = 40;
        this.cols = 30 + levelNum * 5;
        this.rows = 30 + levelNum * 5;
        this.map = new Array(this.cols * this.rows).fill(1);
        
        this.spawnPoint = { x: 0, y: 0 };
        this.exitPoint = { x: 0, y: 0 };
        this.spawners = [];
        this.items = [];
        
        this.generate();
    }
    
    getIndex(c, r) {
        return r * this.cols + c;
    }

    generate() {
        // Simple drunkard walk algorithm
        let c = Math.floor(this.cols / 2);
        let r = Math.floor(this.rows / 2);
        
        this.spawnPoint = { x: c * this.tileSize + 20, y: r * this.tileSize + 20 };
        
        let floorCount = 0;
        const targetFloor = Math.floor(this.cols * this.rows * 0.4);
        
        while (floorCount < targetFloor) {
            if (this.map[this.getIndex(c, r)] === 1) {
                this.map[this.getIndex(c, r)] = 0;
                floorCount++;
                
                // Randomly spawn stuff
                if (floorCount > 10 && Math.random() < 0.02) {
                    this.spawners.push({
                        x: c * this.tileSize + 20,
                        y: r * this.tileSize + 20,
                        type: Math.random() < 0.5 ? 'grunt_spawner' : 'ghost_spawner'
                    });
                } else if (floorCount > 10 && Math.random() < 0.01) {
                    this.items.push({
                        x: c * this.tileSize + 20,
                        y: r * this.tileSize + 20,
                        type: 'food'
                    });
                } else if (floorCount > 10 && Math.random() < 0.01) {
                    this.items.push({
                        x: c * this.tileSize + 20,
                        y: r * this.tileSize + 20,
                        type: 'treasure'
                    });
                }
            }
            
            const dir = Math.floor(Math.random() * 4);
            if (dir === 0 && r > 2) r--;
            else if (dir === 1 && r < this.rows - 3) r++;
            else if (dir === 2 && c > 2) c--;
            else if (dir === 3 && c < this.cols - 3) c++;
        }
        
        this.exitPoint = { x: c * this.tileSize + 20, y: r * this.tileSize + 20 };
        this.map[this.getIndex(c, r)] = 3; 
        
        for (let i = 0; i < 5 + this.levelNum; i++) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                attempts++;
                let kc = Math.floor(Math.random() * this.cols);
                let kr = Math.floor(Math.random() * this.rows);
                if (this.map[this.getIndex(kc, kr)] === 0) {
                    this.items.push({
                        x: kc * this.tileSize + 20,
                        y: kr * this.tileSize + 20,
                        type: 'key'
                    });
                    placed = true;
                }
            }
        }
        
        for (let r = 2; r < this.rows - 2; r++) {
            for (let c = 2; c < this.cols - 2; c++) {
                if (this.map[this.getIndex(c, r)] === 0) {
                    if (this.map[this.getIndex(c, r-1)] === 1 && this.map[this.getIndex(c, r+1)] === 1 &&
                        this.map[this.getIndex(c-1, r)] === 0 && this.map[this.getIndex(c+1, r)] === 0) {
                        if (Math.random() < 0.1) this.map[this.getIndex(c, r)] = 2;
                    }
                    else if (this.map[this.getIndex(c-1, r)] === 1 && this.map[this.getIndex(c+1, r)] === 1 &&
                             this.map[this.getIndex(c, r-1)] === 0 && this.map[this.getIndex(c, r+1)] === 0) {
                        if (Math.random() < 0.1) this.map[this.getIndex(c, r)] = 2;
                    }
                }
            }
        }
    }

    isSolid(x, y, radius, entity = null) {
        const checkPoints = [
            {cx: x - radius, cy: y - radius},
            {cx: x + radius, cy: y - radius},
            {cx: x - radius, cy: y + radius},
            {cx: x + radius, cy: y + radius}
        ];
        
        for (let pt of checkPoints) {
            const c = Math.floor(pt.cx / this.tileSize);
            const r = Math.floor(pt.cy / this.tileSize);
            
            if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return true;
            
            const tile = this.map[this.getIndex(c, r)];
            if (tile === 1) return true;
            if (tile === 2) {
                if (entity && entity.keys !== undefined) {
                    if (entity.keys > 0) {
                        entity.keys--;
                        this.map[this.getIndex(c, r)] = 0; 
                        return false; 
                    } else {
                        return true;
                    }
                }
                return true;
            }
        }
        return false;
    }

    checkExit(player) {
        const c = Math.floor(player.x / this.tileSize);
        const r = Math.floor(player.y / this.tileSize);
        return this.map[this.getIndex(c, r)] === 3;
    }

    draw(ctx, cameraX, cameraY, viewW, viewH) {
        const startC = Math.max(0, Math.floor(cameraX / this.tileSize));
        const endC = Math.min(this.cols, Math.ceil((cameraX + viewW) / this.tileSize));
        const startR = Math.max(0, Math.floor(cameraY / this.tileSize));
        const endR = Math.min(this.rows, Math.ceil((cameraY + viewH) / this.tileSize));

        for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
                const tile = this.map[this.getIndex(c, r)];
                if (tile === 1) {
                    ctx.fillStyle = '#444';
                    ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                    ctx.strokeStyle = '#222';
                    ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 2) {
                    ctx.fillStyle = '#852';
                    ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                    ctx.strokeStyle = '#531';
                    ctx.beginPath();
                    ctx.moveTo(c * this.tileSize, r * this.tileSize);
                    ctx.lineTo(c * this.tileSize + this.tileSize, r * this.tileSize + this.tileSize);
                    ctx.moveTo(c * this.tileSize + this.tileSize, r * this.tileSize);
                    ctx.lineTo(c * this.tileSize, r * this.tileSize + this.tileSize);
                    ctx.stroke();
                } else if (tile === 3) {
                    ctx.fillStyle = '#a2a';
                    ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px monospace';
                    ctx.fillText('EXIT', c * this.tileSize + 8, r * this.tileSize + 25);
                }
            }
        }
    }
}
