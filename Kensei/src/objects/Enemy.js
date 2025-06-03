import Fighter from "./Fighter.js";
import { FighterDirection } from "../constants/fighter.js";

/**
 * Classe Enemy que estende Fighter para criar inimigos com IA.
 * Esta classe implementa uma IA básica que reage ao jogador,
 * decide quando atacar, defender ou se mover, e tem diferentes
 * níveis de dificuldade. Feito com IA.
 *
 */
class Enemy extends Fighter {
  constructor(
    x,
    y,
    width,
    height,
    direction = FighterDirection.LEFT,
    name = "enemy"
  ) {
    // Chamar o construtor pai com todos os parâmetros necessários
    super(
      x,
      y,
      width,
      height,
      "./assets/spritesheets/spritesheetKen.png",
      "./assets/spritesheets/spritesheetKen.json",
      direction,
      name
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
    // Simulate AI inputs
    const aiKeys = this.getAIInputs(opponent);
    const aiJustPressed = this.getAIActions(opponent);
    this.constrainToScreen();
    // Call parent update with AI inputs
    super.update(aiKeys, aiJustPressed, opponent);

    // Update AI timers
    this.updateAITimers();
  }

  setPlayer(player) {
    this.player = player;
  }

  constrainToScreen() {
    if (!canvas) return;

    // Esquerda
    if (this.x < 0) {
      this.x = 0;
      if (this.velocity) this.velocity.x = 0;
    }

    // Direita
    if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
      if (this.velocity) this.velocity.x = 0;
    }
  }

  updateAIState(distanceToPlayer) {
    // Transições de estado baseadas na distância e vida
    if (distanceToPlayer > this.aggroRange) {
      this.aiState = "idle";
    } else if (distanceToPlayer <= this.attackRange) {
      // Alcance próximo - SEMPRE agressivo em hard
      if (this.difficulty === "hard") {
        this.aiState = "aggressive";
      } else if (this.health < 30) {
        this.aiState = "defensive";
      } else {
        this.aiState =
          Math.random() < this.aggressiveness ? "aggressive" : "defensive";
      }
    } else {
      // Alcance médio - aproximar-se
      this.aiState = this.health > 30 ? "aggressive" : "defensive";
    }
  }

  getAIActions(opponent) {
    const aiJustPressed = {};

    if (!opponent) return aiJustPressed;
    if (this.difficulty === "test") return aiJustPressed;

    const distanceToPlayer = Math.abs(this.x - opponent.x);

    // Lógica de ataque (só não pode atacar se já está a atacar ou a ser atingido)
    if (!this.isAttacking && !this.isHit && this.actionTimer <= 0) {
      if (!this.isJumping && distanceToPlayer <= this.attackRange) {
        const attackChance = this.aggressiveness;
        if (Math.random() < attackChance) {
          if (Math.random() < 0.6) {
            aiJustPressed["z"] = true;
          } else {
            aiJustPressed["x"] = true;
          }
          this.aiState = "attacking";
          this.actionTimer = this.reactionTime;
        }
      }
    }

    // Lógica de salto (pode saltar para reagir ao salto do jogador, mesmo que não ataque)
    if (!this.isJumping && opponent.isJumping && Math.random() < 0.3) {
      aiJustPressed["ArrowUp"] = true;
      this.actionTimer = 20;
    }

    return aiJustPressed;
  }

  getAIInputs(opponent) {
    const aiKeys = {};

    if (!opponent) {
      console.log("Enemy has no opponent for AI inputs");
      return aiKeys;
    }

    if (this.difficulty === "test") {
      return aiKeys;
    }

    const distanceToPlayer = Math.abs(this.x - opponent.x);
    const playerDirection = opponent.x > this.x ? 1 : -1;

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
        this.aggressiveness = 0;
        this.reactionTime = 999;
        this.nextActionDelay = 999;
        this.aiState = "idle";
        break;
      case "easy":
        this.aggressiveness = 0.3;
        this.reactionTime = 30;
        this.nextActionDelay = 90;
        this.attackRange = 60;
        break;
      case "medium":
        this.aggressiveness = 0.5;
        this.reactionTime = 20;
        this.nextActionDelay = 60;
        this.attackRange = 70;
        break;
      case "hard":
        this.aggressiveness = 0.8; // MUITO agressivo
        this.reactionTime = 5; // Reação MUITO rápida
        this.nextActionDelay = 20; // Ataques frequentes
        this.attackRange = 80; // Alcance maior
        break;
    }

    console.log(`Enemy dificuldade definida para: ${difficulty}`);
    console.log(
      `Agressividade: ${this.aggressiveness}, Range: ${this.attackRange}`
    );
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
