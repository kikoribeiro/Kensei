import Fighter from "./Fighter.js";
import { FighterDirection } from "../constants/fighter.js";

class Enemy extends Fighter {
  constructor(x, y, width, height, direction = FighterDirection.LEFT) {
    // Call parent constructor with all required parameters
    super(
      x,
      y,
      width,
      height,
      "./assets/spritesheets/spritesheetKen.png", // Use same sprite for now
      "./assets/spritesheets/spritesheetKen.json", // Use same JSON for now
      direction,
      "enemy"
    );

    // Add AI properties
    this.isAI = true;
    this.aiState = "idle";
    this.actionTimer = 0;

    // AI Properties
    this.nextActionDelay = 60; // frames until next AI action
    this.aggroRange = 200; // Distance to start being aggressive
    this.attackRange = 80; // Distance to attack
    this.player = null; // Reference to player (set externally)
    this.direction = direction;

    // AI Behavior settings
    this.aggressiveness = 0.3; // 0-1, how likely to attack vs defend
    this.reactionTime = 15; // frames delay for reactions
    this.difficulty = "medium"; // easy, medium, hard

    // Movement AI
    this.moveDirection = 0; // -1 left, 0 still, 1 right
    this.moveTimer = 0;
    this.maxMoveTime = 120; // frames to move in one direction
  }

  // Override update to add AI behavior
  update(keys = {}, justPressed = {}, opponent = null) {
    console.log(
      `Enemy update called with opponent: ${opponent?.name || "null"}`
    );

    // Simulate AI inputs
    const aiKeys = this.getAIInputs(opponent);
    const aiJustPressed = this.getAIActions(opponent);

    // Call parent update with AI inputs
    super.update(aiKeys, aiJustPressed, opponent);

    // Update AI timers
    this.updateAITimers();
  }

  setPlayer(player) {
    this.player = player;
  }

  getAIInputs(opponent) {
    const aiKeys = {};

    // Use opponent instead of this.player
    if (!opponent) {
      console.log("Enemy has no opponent for AI inputs");
      return aiKeys;
    }

    // If in test mode, don't do anything
    if (this.difficulty === "test") {
      return aiKeys; // Return empty keys - no movement
    }

    const distanceToPlayer = Math.abs(this.x - opponent.x);
    const playerDirection = opponent.x > this.x ? 1 : -1;

    // Update AI state based on distance
    this.updateAIState(distanceToPlayer);

    // Movement logic
    switch (this.aiState) {
      case "aggressive":
        this.handleAggressiveMovement(
          aiKeys,
          distanceToPlayer,
          playerDirection
        );
        break;
      case "defensive":
        this.handleDefensiveMovement(aiKeys, distanceToPlayer, playerDirection);
        break;
      case "attacking":
        // Don't move while attacking
        break;
      default: // idle
        this.handleIdleMovement(aiKeys);
    }

    return aiKeys;
  }

  getAIActions(opponent) {
    const aiJustPressed = {};

    if (!opponent) {
      console.log("Enemy has no opponent for AI actions");
      return aiJustPressed;
    }

    // If in test mode, don't do any actions
    if (this.difficulty === "test") {
      return aiJustPressed; // Return empty actions - no attacks
    }

    const distanceToPlayer = Math.abs(this.x - opponent.x);

    // Only perform actions if not already acting and timer is ready
    if (this.actionTimer <= 0 && !this.isAttacking && !this.isHit) {
      // Attack logic
      if (
        distanceToPlayer <= this.attackRange &&
        this.aiState === "aggressive"
      ) {
        const attackRoll = Math.random();

        if (attackRoll < this.aggressiveness) {
          // Choose attack type
          if (Math.random() < 0.6) {
            aiJustPressed["z"] = true; // Punch
          } else {
            aiJustPressed["x"] = true; // Kick
          }

          this.aiState = "attacking";
          this.actionTimer = this.nextActionDelay;
        }
      }

      // Jump logic (random or if player is jumping)
      if (opponent.isJumping && Math.random() < 0.4) {
        aiJustPressed["ArrowUp"] = true;
        this.actionTimer = 30;
      }
    }

    return aiJustPressed;
  }

  updateAIState(distanceToPlayer) {
    // State transitions based on distance and health
    if (distanceToPlayer > this.aggroRange) {
      this.aiState = "idle";
    } else if (distanceToPlayer <= this.attackRange) {
      // Close range - attack or defend based on health and aggressiveness
      if (this.health < 30) {
        this.aiState = "defensive";
      } else {
        this.aiState =
          Math.random() < this.aggressiveness ? "aggressive" : "defensive";
      }
    } else {
      // Medium range - approach or circle
      this.aiState = this.health > 50 ? "aggressive" : "defensive";
    }
  }

  handleAggressiveMovement(aiKeys, distanceToPlayer, playerDirection) {
    // Move towards player
    if (distanceToPlayer > this.attackRange + 20) {
      if (playerDirection > 0) {
        aiKeys["ArrowRight"] = true;
      } else {
        aiKeys["ArrowLeft"] = true;
      }
    }

    // Sometimes jump towards player
    if (Math.random() < 0.01 && !this.isJumping) {
      aiKeys["ArrowUp"] = true;
      if (Math.random() < 0.5) {
        aiKeys[playerDirection > 0 ? "ArrowRight" : "ArrowLeft"] = true;
      }
    }
  }

  handleDefensiveMovement(aiKeys, distanceToPlayer, playerDirection) {
    // Keep distance from player
    if (distanceToPlayer < this.attackRange + 40) {
      // Move away from player
      if (playerDirection > 0) {
        aiKeys["ArrowLeft"] = true;
      } else {
        aiKeys["ArrowRight"] = true;
      }
    }

    // Crouch sometimes when defensive
    if (Math.random() < 0.05) {
      aiKeys["ArrowDown"] = true;
    }

    // Jump away if too close
    if (distanceToPlayer < this.attackRange && Math.random() < 0.02) {
      aiKeys["ArrowUp"] = true;
      aiKeys[playerDirection > 0 ? "ArrowLeft" : "ArrowRight"] = true;
    }
  }

  handleIdleMovement(aiKeys) {
    // Random movement when idle
    this.moveTimer++;

    if (this.moveTimer > this.maxMoveTime || this.moveDirection === 0) {
      // Choose new movement direction
      const roll = Math.random();
      if (roll < 0.3) {
        this.moveDirection = -1; // Left
      } else if (roll < 0.6) {
        this.moveDirection = 1; // Right
      } else {
        this.moveDirection = 0; // Stay still
      }
      this.moveTimer = 0;
    }

    // Apply movement
    if (this.moveDirection > 0) {
      aiKeys["ArrowRight"] = true;
    } else if (this.moveDirection < 0) {
      aiKeys["ArrowLeft"] = true;
    }
  }

  updateAITimers() {
    // Decrease action timer
    if (this.actionTimer > 0) {
      this.actionTimer--;
    }

    // Reset attacking state when attack animation ends
    if (this.aiState === "attacking" && !this.isAttacking) {
      this.aiState = "aggressive";
    }
  }

  // AI difficulty settings
  setDifficulty(difficulty) {
    this.difficulty = difficulty;

    switch (difficulty) {
      case "test":
        // Test mode - enemy just stands there
        this.aggressiveness = 0;
        this.reactionTime = 999;
        this.nextActionDelay = 999;
        this.aiState = "idle";
        break;
      case "easy":
        this.aggressiveness = 0.2;
        this.reactionTime = 30;
        this.nextActionDelay = 90;
        break;
      case "medium":
        this.aggressiveness = 0.4;
        this.reactionTime = 15;
        this.nextActionDelay = 60;
        break;
      case "hard":
        this.aggressiveness = 0.6;
        this.reactionTime = 5;
        this.nextActionDelay = 30;
        break;
    }
  }

  // Override takeHit to add AI reaction
  takeHit(damage) {
    super.takeHit(damage);

    // AI becomes more defensive after taking damage
    if (Math.random() < 0.7) {
      this.aiState = "defensive";
      this.actionTimer = this.reactionTime;
    }
  }

  // Debug method to see AI state
  drawDebugInfo(ctx) {
    if (window.DEBUG_MODE) {
      ctx.fillStyle = "yellow";
      ctx.font = "12px Arial";
      ctx.fillText(`AI: ${this.aiState}`, this.x, this.y - 20);
      ctx.fillText(`Health: ${this.health}`, this.x, this.y - 35);

      // Draw aggro range
      ctx.strokeStyle = "orange";
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.aggroRange,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Draw attack range
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.attackRange,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // Override draw to include debug info
  draw(ctx) {
    super.draw(ctx);
    this.drawDebugInfo(ctx);
  }
}

export default Enemy;
