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
    // Define frame data specific to Ryu with anchor points
    this.animations = {
      stance: [
        { x: 7, y: 14, w: 59, h: 90, anchorX: 29, anchorY: 85 },  // Center bottom
        { x: 75, y: 14, w: 60, h: 89, anchorX: 29, anchorY: 85 },
        { x: 143, y: 13, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 211, y: 10, w: 55, h: 93, anchorX: 29, anchorY: 85 },
        { x: 277, y: 11, w: 58, h: 92, anchorX: 29, anchorY: 85 },
      ],
      walk_forward: [
        { x: 9, y: 136, w: 53, h: 90, anchorX: 29, anchorY: 85 },
        { x: 78, y: 131, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 152, y: 128, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 229, y: 130, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 307, y: 128, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 371, y: 128, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      walk_backwards: [
        { x: 0, y: 160, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 160, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 160, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 192, y: 160, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 256, y: 160, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 320, y: 160, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      jump: [
        { x: 0, y: 240, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 240, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 240, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      crouch: [
        { x: 0, y: 320, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 320, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 320, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      punch: [
        { x: 0, y: 400, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 400, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 400, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 192, y: 400, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      kick: [
        { x: 0, y: 480, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 480, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 480, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 192, y: 480, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      block: [
        { x: 0, y: 560, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 560, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      hit: [
        { x: 0, y: 640, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 640, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 640, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      crouch_hit: [
        { x: 0, y: 720, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 720, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 720, w: 59, h: 90, anchorX: 29, anchorY: 85 },
      ],
      // Player-specific special move
      special_move: [
        { x: 0, y: 800, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 64, y: 800, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 128, y: 800, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 192, y: 800, w: 59, h: 90, anchorX: 29, anchorY: 85 },
        { x: 256, y: 800, w: 59, h: 90, anchorX: 29, anchorY: 85 },
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
