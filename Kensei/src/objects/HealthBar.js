import { ctx } from "../engine/Canvas.js";

class HealthBar {
  constructor(x, y, width = 200, height = 20, maxHealth = 100, color = "red") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = "gray";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const healthWidth = (this.currentHealth / this.maxHealth) * this.width;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, healthWidth, this.height);
  }

  decrease(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  reset() {
    this.currentHealth = this.maxHealth;
  }
}

export default HealthBar;
