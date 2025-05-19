import { ctx, canvas } from "../engine/Canvas.js";

class FightTimer {
  constructor(duration = 90) {
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
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Time: ${this.remaining}`, canvas.width / 2 - 40, 50);
  }

  reset() {
    this.remaining = this.duration;
    this.lastTick = Date.now();
  }
}

export default FightTimer;
