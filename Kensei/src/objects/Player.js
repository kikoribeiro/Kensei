import Fighter from "./Fighter.js";

class Player extends Fighter {
  constructor(x, y, width, height) {
    // Call parent constructor with specific spritesheet path (PNG instead of JSON)
    super(
      x,
      y,
      width,
      height,
      "./assets/spritesheets/Ryu.png", // Changed from .json to .png
      "player1"
    );

    // Add any player-specific properties
    this.isPlayer = true;
    this.score = 0;
    
    // Initialize player-specific animations
    this.initAnimations();
  }

  // Define player-specific animations
  initAnimations() {
    // Define frame data specific to Ryu
    this.animations = {
      stance: [
        { x: 7, y: 14, w: 59, h: 90 },
        { x: 75, y: 14, w: 59, h: 90 },
        { x: 143, y: 14, w: 59, h: 90 },
        { x: 211, y: 14, w: 59, h: 90 },
      ],
      walk_forward: [
        { x: 8, y: 872, w: 53, h: 83 },
        { x: 70, y: 867, w: 60, h: 90 },
        { x: 140, y: 866, w: 59, h: 90 },
        { x: 215, y: 865, w: 59, h: 90 },
        { x: 288, y: 866, w: 59, h: 90 },
        { x: 357, y: 867, w: 59, h: 90 },
      ],
      walk_backwards: [
        { x: 0, y: 160, w: 59, h: 90 },
        { x: 64, y: 160, w: 59, h: 90 },
        { x: 128, y: 160, w: 59, h: 90 },
        { x: 192, y: 160, w: 59, h: 90 },
        { x: 192, y: 80, w: 59, h: 90 },
        { x: 192, y: 80, w: 59, h: 90 },
      ],
      jump: [
        { x: 0, y: 240, w: 59, h: 90 },
        { x: 64, y: 240, w: 59, h: 90 },
        { x: 128, y: 240, w: 59, h: 90 },
      ],
      crouch: [
        { x: 0, y: 320, w: 59, h: 90 },
        { x: 64, y: 320, w: 59, h: 90 },
        { x: 128, y: 320, w: 59, h: 90 },
      ],
      punch: [
        { x: 0, y: 400, w: 59, h: 90 },
        { x: 64, y: 400, w: 59, h: 90 },
        { x: 128, y: 400, w: 59, h: 90 },
        { x: 192, y: 400, w: 59, h: 90 },
      ],
      kick: [
        { x: 0, y: 480, w: 59, h: 90 },
        { x: 64, y: 480, w: 59, h: 90 },
        { x: 128, y: 480, w: 59, h: 90 },
        { x: 192, y: 480, w: 59, h: 90 },
      ],
      block: [
        { x: 0, y: 560, w: 59, h: 90 },
        { x: 64, y: 560, w: 59, h: 90 },
      ],
      hit: [
        { x: 0, y: 640, w: 59, h: 90 },
        { x: 64, y: 640, w: 59, h: 90 },
        { x: 128, y: 640, w: 59, h: 90 },
      ],
      crouch_hit: [
        { x: 0, y: 720, w: 59, h: 90 },
        { x: 64, y: 720, w: 59, h: 90 },
        { x: 128, y: 720, w: 59, h: 90 },
      ],
      // Player-specific special move
      special_move: [
        { x: 0, y: 800, w: 59, h: 90 },
        { x: 64, y: 800, w: 59, h: 90 },
        { x: 128, y: 800, w: 59, h: 90 },
        { x: 192, y: 800, w: 59, h: 90 },
        { x: 256, y: 800, w: 59, h: 90 },
      ],
    };
  }

  // Override update to add special move input
  update(keys, justPressed = {}) {
    // Call parent update first
    super.update(keys, justPressed);
    
    // Add special move input (only if not already attacking/jumping/crouching)
    if (!this.isAttacking && !this.isJumping && !this.isCrouching) {
      if (justPressed["c"]) { // 'C' key for special move
        this.performSpecialMove();
        return;
      }
    }
  }

  // Player-specific special move method
  performSpecialMove() {
    this.isAttacking = true;
    this.attackType = "special_move";
    this.attackFrameCount = 0;
    
    // Configure special move hitbox (bigger than normal attacks)
    this.attackBox = { 
      x: this.width * 0.5, 
      y: this.height * 0.2, 
      width: this.width * 0.8, 
      height: this.height * 0.6 
    };
    
    this.setAnimation("special_move");
  }
  
  // Override performAttack to handle special move damage
  performAttack(attackType) {
    super.performAttack(attackType);
    
    // Special moves could have different properties
    if (attackType === "special_move") {
      // Special move specific logic
      console.log(`${this.name} performs special move!`);
    }
  }
}

export default Player;
