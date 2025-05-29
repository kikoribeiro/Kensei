import Fighter from "./Fighter.js";

class Player extends Fighter {
  constructor(x, y, width, height) {
    // Call parent constructor with both PNG and JSON paths
    super(
      x,
      y,
      width,
      height,
      "./assets/spritesheets/spritesheetRyu.png",
      "./assets/spritesheets/spritesheetRyu.json",
      "player1"
    );

    // Add any player-specific properties
    this.isPlayer = true;
    this.score = 0;
  }

  // Override update to add special move input
  update(keys, justPressed = {}) {
    // Call parent update first
    super.update(keys, justPressed);

    // Add special move input (only if not already attacking/jumping/crouching)
    if (!this.isAttacking && !this.isJumping && !this.isCrouching) {
      if (justPressed["c"]) {
        // 'C' key for special move
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
      height: this.width * 0.6,
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
