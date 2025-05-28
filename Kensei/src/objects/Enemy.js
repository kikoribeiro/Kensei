import Fighter from "./Fighter.js";

class Enemy extends Fighter {
  constructor(x, y, width, height) {
    super(x, y, width, height, "./assets/sprites/Ken.png", "enemy");

    // Initialize enemy-specific animations
    this.initAnimations();
  }

  initAnimations() {
    // Define frame data specific to this enemy
    this.animations = {
      stance: [
        { x: 0, y: 0, w: 64, h: 80 },
        { x: 64, y: 0, w: 64, h: 80 },
        { x: 128, y: 0, w: 64, h: 80 },
        { x: 192, y: 0, w: 64, h: 80 },
      ],
      // Define all other enemy animations here...
      walk_forward: [
        { x: 8, y: 872, w: 53, h: 83 },
        { x: 70, y: 867, w: 60, h: 88 },
        { x: 140, y: 866, w: 64, h: 90 },
        { x: 215, y: 865, w: 63, h: 89 },
        { x: 288, y: 866, w: 54, h: 89 },
        { x: 357, y: 867, w: 50, h: 89 },
      ],
      // ... more animations
    };
  }

  // Add enemy-specific behavior methods here
}

export default Enemy;
