import { ctx, canvas } from "../engine/Canvas.js";

class FightTimer {
  constructor(duration = 99) {
    this.duration = duration;
    this.remaining = duration;
    this.lastTick = Date.now();
  }

  update() {
    const now = Date.now();
    if (now - this.lastTick >= 1000) {
      this.remaining = Math.max(0, this.remaining - 1);
      this.lastTick = now;
    }
  }

  draw() {
    const timerText = ` ${this.remaining} `;
    ctx.font = "48px 'Orbitron', sans-serif";
    ctx.fillStyle = "#f1c40f";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    const textWidth = ctx.measureText(timerText).width;
    const x = canvas.width / 2 - textWidth / 2;
    const y = 50;

    // Efeito Shadow
    ctx.strokeText(timerText, x, y);
    ctx.fillText(timerText, x, y);
  }

  reset() {
    this.remaining = this.duration;
    this.lastTick = Date.now();
  }
}

export default FightTimer;
