export class UI {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d')!;
    }
  
    drawScore(player1Score: number, player2Score: number) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '40px "Courier New", Courier, monospace';
      this.ctx.fillText(player1Score.toString(), this.canvas.width / 4, 50);
      this.ctx.fillText(player2Score.toString(), (this.canvas.width / 4) * 3, 50);

      // Draw dashed line
      this.ctx.beginPath();
      this.ctx.setLineDash([10, 10]);
      this.ctx.moveTo(this.canvas.width / 2, 0);
      this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
      this.ctx.strokeStyle = '#fff';
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  
    drawStartMessage() {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px "Courier New", Courier, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Press Enter to Start', this.canvas.width / 2, this.canvas.height / 2);
    }
  
    drawEndMessage(winner: string) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '40px "Courier New", Courier, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${winner} wins!`, this.canvas.width / 2, this.canvas.height / 2 - 40);
      this.ctx.font = '20px "Courier New", Courier, monospace';
      this.ctx.fillText('Press Enter to Restart', this.canvas.width / 2, this.canvas.height / 2);
    }
  }
  