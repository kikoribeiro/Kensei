import Fighter from "./Fighter.js";

class Player extends Fighter {
  constructor(x, y, width, height) {
    // Call parent constructor with specific spritesheet path
    super(
      x,
      y,
      width,
      height,
      "./assets/spritesheets/spritesheet.json",
      "player1"
    );

    // Add any player-specific properties
    this.isPlayer = true;
    this.score = 0;
  }

  // Override methods as needed for player-specific behavior
  initAnimations() {
    // Call the parent method first
    super.initAnimations();

    // Add any player-specific animations
    this.animations.special_move =
      this.spriteManager.getAnimationFrames("special-");
  }

  // Add player-specific methods
  performSpecialMove() {
    // Player-specific special move implementation
    this.isAttacking = true;
    this.attackType = "special_move";
    this.attackFrameCount = 0;
    this.setAnimation("special_move");
  }
}

export default Player;
