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
    // Border
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#222";
    ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);

    // Background
    const bgGradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
    bgGradient.addColorStop(0, "#333");
    bgGradient.addColorStop(1, "#111");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Health gradient
    const healthWidth = (this.currentHealth / this.maxHealth) * this.width;

    // Custom gradient logic
    let healthGradient;
    if (this.color === "p1") {
      // Player 1: orange → yellow (left to right)
      healthGradient = ctx.createLinearGradient(this.x, this.y, this.x + healthWidth, this.y);
      healthGradient.addColorStop(0, "#ff6600"); // orange
      healthGradient.addColorStop(1, "#ffff00"); // yellow
    } else if (this.color === "p2") {
      // Player 2: yellow → orange (right to left)
      healthGradient = ctx.createLinearGradient(this.x + healthWidth, this.y, this.x, this.y);
      healthGradient.addColorStop(0, "#ff6600"); // yellow
      healthGradient.addColorStop(1, "#ffff00"); // orange
    } else {
      // fallback: solid color
      healthGradient = this.color;
    }

    ctx.fillStyle = healthGradient;
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
