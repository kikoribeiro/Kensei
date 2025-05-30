import { ctx, canvas } from "../engine/Canvas.js";

class StatusBar {
  constructor() {
    // Simple health bar properties
    this.maxHealth = 100;
    this.player1Health = 100;
    this.player2Health = 100;

    // Timer properties
    this.timer = 99;
    this.frameCounter = 0;

    // JSON assets
    this.hudData = null;
    this.hudImage = null;
    this.hudLoaded = false;

    this.loadHUD();
  }

  async loadHUD() {
    try {
      const response = await fetch("./assets/images/hud.json");
      this.hudData = await response.json();

      this.hudImage = new Image();
      this.hudImage.onload = () => {
        this.hudLoaded = true;
        console.log("HUD loaded successfully");
      };
      this.hudImage.src = "./assets/images/hud.png";
    } catch (error) {
      console.error("Failed to load HUD:", error);
      this.hudLoaded = false;
    }
  }

  draw() {
    // Player 1 health bar (left side) - BIGGER
    this.drawHealthBar(50, 80, this.player1Health, "#ff3300", "RYU");

    // Player 2 health bar (right side) - BIGGER
    this.drawHealthBar(
      canvas.width - 450,
      80,
      this.player2Health,
      "#0066ff",
      "ENEMY"
    );

    // Draw timer in the center
    this.drawTimer();

    // DEBUG: Show health values (moved down)
    ctx.fillStyle = "#ffff00";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`P1: ${this.player1Health}`, 10, 150);
    ctx.fillText(`P2: ${this.player2Health}`, 10, 165);
  }

  drawHealthBar(x, y, health, color, playerName) {
    const width = 400; // BIGGER width (was 300)
    const height = 35; // BIGGER height (was 20)
    const borderWidth = 4; // Thicker border

    // ARCADE STYLE BACKGROUND with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#222222");
    gradient.addColorStop(1, "#111111");

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // HEALTH FILL with arcade gradient
    const healthWidth = (health / this.maxHealth) * width;
    const healthGradient = ctx.createLinearGradient(x, y, x, y + height);

    if (health > 60) {
      // Green gradient for high health
      healthGradient.addColorStop(0, "#44ff44");
      healthGradient.addColorStop(1, "#22cc22");
    } else if (health > 30) {
      // Yellow gradient for medium health
      healthGradient.addColorStop(0, "#ffff44");
      healthGradient.addColorStop(1, "#cccc22");
    } else {
      // Red gradient for low health
      healthGradient.addColorStop(0, "#ff4444");
      healthGradient.addColorStop(1, "#cc2222");
    }

    ctx.fillStyle = healthGradient;
    ctx.fillRect(x, y, healthWidth, height);

    // ARCADE SHINE EFFECT on top
    const shineGradient = ctx.createLinearGradient(x, y, x, y + height / 3);
    shineGradient.addColorStop(0, "rgba(255,255,255,0.4)");
    shineGradient.addColorStop(1, "rgba(255,255,255,0.0)");
    ctx.fillStyle = shineGradient;
    ctx.fillRect(x, y, healthWidth, height / 3);

    // THICK ARCADE BORDER
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(
      x - borderWidth / 2,
      y - borderWidth / 2,
      width + borderWidth,
      height + borderWidth
    );

    // INNER BORDER for depth
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

    // PLAYER NAME ABOVE HEALTH BAR - ARCADE STYLE
    ctx.save();
    ctx.font = "bold 20px Arial"; // Bigger font
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    if (playerName === "RYU") {
      ctx.textAlign = "left";
      ctx.fillText(playerName, x, y - 10);
    } else {
      ctx.textAlign = "right";
      ctx.fillText(playerName, x + width, y - 10);
    }
    ctx.restore();

    // HEALTH PERCENTAGE TEXT
    ctx.save();
  }

  drawTimer() {
    const timerX = canvas.width / 2;
    const timerY = 50; // Moved up since health bars are lower

    if (this.hudLoaded && this.hudData && this.hudImage) {
      // Use JSON sprites for numbers (with scaling)
      this.drawNumberSprites(this.timer, timerX, timerY, 3); // Even BIGGER scale
    } else {
      // Fallback to regular text (bigger font)
      ctx.save();
      ctx.font = "bold 72px Arial"; // BIGGER font
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.textAlign = "center";

      // Stroke first, then fill for arcade look
      ctx.strokeText(this.timer.toString().padStart(2, "0"), timerX, timerY);
      ctx.fillText(this.timer.toString().padStart(2, "0"), timerX, timerY);
      ctx.restore();
    }
  }

  drawNumberSprites(number, x, y, scale = 3) {
    // BIGGER default scale
    const numberStr = number.toString().padStart(2, "0");
    const frames = this.hudData.frames;

    let totalWidth = 0;
    for (let i = 0; i < numberStr.length; i++) {
      const digit = numberStr[i];
      const frameKey = `${digit}.png`;
      if (frames[frameKey]) {
        totalWidth += frames[frameKey].frame.w * scale;
        if (i < numberStr.length - 1) totalWidth += 10 * scale; // BIGGER spacing
      }
    }

    let currentX = x - totalWidth / 2;

    for (let i = 0; i < numberStr.length; i++) {
      const digit = numberStr[i];
      const frameKey = `${digit}.png`;

      if (frames[frameKey]) {
        const frame = frames[frameKey].frame;

        ctx.drawImage(
          this.hudImage,
          frame.x,
          frame.y,
          frame.w,
          frame.h,
          currentX,
          y,
          frame.w * scale, // Scale the width
          frame.h * scale // Scale the height
        );

        currentX += frame.w * scale + 10 * scale; // BIGGER spacing
      }
    }
  }

  // FIX: Update this method to properly set health values
  updateHealth(player1Health, player2Health) {
    this.player1Health = Math.max(0, Math.min(100, player1Health));
    this.player2Health = Math.max(0, Math.min(100, player2Health));
  }

  // ADD: Method to update health from fighter objects directly
  updateFromFighters(fighter1, fighter2) {
    if (fighter1) {
      this.player1Health = Math.max(
        0,
        Math.min(100, fighter1.currentHealth || fighter1.health || 100)
      );
    }
    if (fighter2) {
      this.player2Health = Math.max(
        0,
        Math.min(100, fighter2.currentHealth || fighter2.health || 100)
      );
    }
  }

  updateTimer() {
    this.frameCounter++;

    if (this.frameCounter >= 60) {
      this.frameCounter = 0;

      if (this.timer > 0) {
        this.timer--;
      }
    }
  }

  resetTimer() {
    this.timer = 99;
    this.frameCounter = 0;
  }

  getTimer() {
    return this.timer;
  }

  isTimeUp() {
    return this.timer <= 0;
  }
}

export default StatusBar;
