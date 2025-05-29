import { ctx } from "../engine/Canvas.js";
import { FighterDirection, FighterState } from "../constants/fighter.js";

class Fighter {
  constructor(
    x,
    y,
    width,
    height,
    spritesheetPath,
    jsonPath,
    direction = FighterDirection.RIGHT,
    name = "fighter"
  ) {
    // Position and dimensions
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = direction;
    this.name = name;

    // Visual properties
    this.facing = direction === FighterDirection.RIGHT ? "right" : "left";
    this.globalScale = null;

    // Physics properties
    this.velocityX = 150 * direction;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpSpeed = -18;
    this.gravity = 0.6;
    this.groundY = y;

    // State flags
    this.isJumping = false;
    this.isCrouching = false;
    this.isAttacking = false;
    this.isBlocking = false;
    this.isHit = false;
    this.isDead = false;

    // Attack properties
    this.attackType = null;
    this.attackFrameCount = 0;
    this.attackBox = { x: 0, y: 0, width: 0, height: 0 };

    // Health and damage
    this.health = 100;

    // Animation properties
    this.currentAnimation = "stance";
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 6; // Single animation speed for all animations
    this.animationsReady = false;
    this.animations = {};
    this.spriteData = null;

    // Add animations that should hold their last frame
    this.holdLastFrameAnimations = ["crouch", "jump", "jump_front"];

    // Pushbox properties
    this.pushBox = {
      x: this.width * 0.2, // Offset from fighter's x
      y: this.height * 0.1, // Offset from fighter's y
      width: this.width * 0.6, // Pushbox width
      height: this.height * 0.8, // Pushbox height
    };

    this.pushForce = 2; // How strong the push is

    // Hurtbox properties (where fighter can be hit)
    this.hurtBox = {
      x: this.width * 0.25,
      y: this.height * 0.1,
      width: this.width * 0.5,
      height: this.height * 0.8,
    };

    // Attack hitbox configurations for different attacks
    this.hitboxConfigs = {
      punch: {
        x: this.width * 0.6,
        y: this.height * 0.1,
        width: this.width * 0.6,
        height: this.height * 0.2,
      },
      kick: {
        x: this.width * 0.7,
        y: this.height * 0.01,
        width: this.width * 0.7,
        height: this.width * 0.3,
      },
      crouch_punch: {
        x: this.width * 0.8,
        y: this.height * 0.4,
        width: this.width * 0.5,
        height: this.height * 0.2,
      },
      crouch_kick: {
        x: this.width * 0.6,
        y: this.height * 0.9,
        width: this.width * 0.8,
        height: this.height * 0.1,
      },
      uppercut: {
        x: this.width * 0.6,
        y: this.height * 0.1,
        width: this.width * 0.4,
        height: this.height * 0.5,
      },
      special_move: {
        x: this.width * 0.5,
        y: this.height * 0.2,
        width: this.width * 1.2,
        height: this.height * 0.6,
      },
    };

    // Load sprite sheet and JSON data
    this.loadSpritesheet(spritesheetPath, jsonPath);
  }

  changeState = () =>
    this.velocity * this.direction < 0 ? "walk-backwards" : "walk_forward";

  async loadSpritesheet(spritesheetPath, jsonPath) {
    try {
      // Load JSON data first
      const response = await fetch(jsonPath);
      this.spriteData = await response.json();

      // Load sprite image
      this.sprite = new Image();
      this.sprite.onload = () => {
        console.log(`Loaded sprite for ${this.name}`);
        this.initAnimationsFromJSON();
        this.calculateGlobalScale();
        this.animationsReady = true;
      };
      this.sprite.src = spritesheetPath;
    } catch (error) {
      console.error(`Failed to load spritesheet data for ${this.name}:`, error);
    }
  }

  initAnimationsFromJSON() {
    if (!this.spriteData || !this.spriteData.frames) {
      console.error("No sprite data available");
      return;
    }

    // Group frames by animation name
    const animationGroups = {};

    for (const frameName in this.spriteData.frames) {
      const frameData = this.spriteData.frames[frameName];
      const animationName = this.extractAnimationName(frameName);

      if (!animationGroups[animationName]) {
        animationGroups[animationName] = [];
      }

      // Convert JSON frame data to our format using pivot from JSON
      const frame = {
        x: frameData.frame.x,
        y: frameData.frame.y,
        w: frameData.frame.w,
        h: frameData.frame.h,
        anchorX: frameData.pivot.x * frameData.frame.w,
        anchorY: frameData.pivot.y * frameData.frame.h,
        originalName: frameName,
      };

      animationGroups[animationName].push({
        frame,
        frameName,
      });
    }

    // Sort and convert to final format
    for (const animName in animationGroups) {
      // Sort by numeric value instead of alphabetically
      animationGroups[animName].sort((a, b) => {
        // Extract the number from the frame name
        const getFrameNumber = (frameName) => {
          const match = frameName.match(/-(\d+)\.png$/);
          return match ? parseInt(match[1], 10) : 0;
        };

        const numA = getFrameNumber(a.frameName);
        const numB = getFrameNumber(b.frameName);

        return numA - numB; // Numeric sort instead of alphabetical
      });

      this.animations[animName] = animationGroups[animName].map(
        (item) => item.frame
      );
    }

    this.mapAnimationNames();
  }

  extractAnimationName(frameName) {
    // Remove file extension
    const nameWithoutExt = frameName.replace(/\.(png|jpg|jpeg)$/i, "");
    const animationName = nameWithoutExt.replace(/-\d+$/, "");
    return animationName.toLowerCase();
  }

  mapAnimationNames() {
    // Map the exact JSON animation names to our expected game names
    const nameMapping = {
      stance: "stance",
      "walk-forward": "walk_forward",
      "walk-backwards": "walk_backwards",
      punch: "punch",
      kick: "kick",
      jump: "jump",
      crouch: "crouch",
      hit: "hit",
      "crouch-hit": "crouch_hit",
      "special-move": "special_move",
      "crouch-kick": "crouch_kick",
      "crouch-punch": "crouch_punch",
      "jump-front": "jump_front",
      uppercut: "uppercut",
      victory: "victory",
      dead: "dead",
      turn: "turn",
      face: "face",
      name: "name",
    };

    const newAnimations = {};

    for (const [originalName, frames] of Object.entries(this.animations)) {
      const mappedName = nameMapping[originalName] || originalName;
      newAnimations[mappedName] = frames;
    }

    this.animations = newAnimations;
  }

  calculateGlobalScale() {
    let maxWidth = 0;
    let maxHeight = 0;

    for (const frames of Object.values(this.animations)) {
      for (const frame of frames) {
        maxWidth = Math.max(maxWidth, frame.w);
        maxHeight = Math.max(maxHeight, frame.h);
      }
    }

    if (maxWidth > 0 && maxHeight > 0) {
      this.globalScale =
        Math.min(this.width / maxWidth, this.height / maxHeight) * 2;
    }
  }

  setAnimation(name) {
    // Only change animation if it's different
    if (this.currentAnimation !== name && this.animations[name]) {
      console.log(`🎯 ${this.name} switching to animation: ${name}`);
      this.currentAnimation = name;
      this.frameIndex = 0;
      this.frameTimer = 0;
    } else if (!this.animations[name]) {
      console.warn(`❌ ${this.name} tried to use missing animation: ${name}`);
    }
  }

  draw(ctx) {
    // During loading phase, draw a placeholder
    if (
      !this.animationsReady ||
      !this.sprite.complete ||
      !this.animations ||
      Object.keys(this.animations).length === 0
    ) {
      ctx.fillStyle = this.color || "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    // Get current animation frames
    const frames = this.animations[this.currentAnimation];
    if (!frames?.length) return;

    // SAFE FRAME INDEX - Make sure we never go out of bounds
    if (this.frameIndex >= frames.length) {
      this.frameIndex = 0;
    }

    // Get current frame data
    const frame = frames[this.frameIndex];

    // Use the consistent scale for all animations
    const scale = this.globalScale || 1;

    // Save context for transformations
    ctx.save();

    // Use direction constant for sprite flipping
    const scaleX = this.direction === FighterDirection.RIGHT ? 1 : -1;

    ctx.scale(scaleX, 1);

    // Adjust x position when flipped
    const drawX =
      this.direction === FighterDirection.RIGHT
        ? this.x + this.width / 2 - frame.anchorX * scale
        : -(this.x + this.width / 2 + frame.anchorX * scale);

    ctx.drawImage(
      this.sprite,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      drawX,
      this.y + this.height - frame.anchorY * scale,
      frame.w * scale,
      frame.h * scale
    );

    ctx.restore();

    // Update animation frame using single frameDelay
    this.frameTimer++;

    if (this.frameTimer >= this.frameDelay) {
      this.frameTimer = 0;

      // Check if this is a hold-last-frame animation that's at its end
      const isHoldAnimation = this.holdLastFrameAnimations.includes(
        this.currentAnimation
      );
      const isLastFrame = this.frameIndex === frames.length - 1;

      // Only increment if it's not a hold animation at its last frame
      if (!(isHoldAnimation && isLastFrame)) {
        this.frameIndex = (this.frameIndex + 1) % frames.length;
      }
    }

    // Optional: Draw hitbox for debugging
    if (window.DEBUG_MODE) {
      this.drawHitboxes(ctx); // Remove the drawPushbox call - it's already included in drawHitboxes
    }
  }

  drawHitboxes(ctx) {
    // Draw character hurtbox (where they can be hit)
    const hurtbox = this.getDynamicHurtbox();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height);

    // Label hurtbox
    ctx.fillStyle = "blue";
    ctx.font = "10px Arial";
    ctx.fillText("HURT", hurtbox.x, hurtbox.y - 5);

    // Draw attack hitbox if attacking
    const hitbox = this.getDynamicHitbox();
    if (hitbox) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

      // Label hitbox
      ctx.fillStyle = "red";
      ctx.font = "10px Arial";
      ctx.fillText(
        `HIT-${this.attackType.toUpperCase()}`,
        hitbox.x,
        hitbox.y - 5
      );
    }

    // Draw pushbox
    const pushbox = {
      x: this.x + this.pushBox.x,
      y: this.y + this.pushBox.y,
      width: this.pushBox.width,
      height: this.pushBox.height,
    };

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.strokeRect(pushbox.x, pushbox.y, pushbox.width, pushbox.height);

    // Label pushbox
    ctx.fillStyle = "green";
    ctx.font = "10px Arial";
    ctx.fillText("PUSH", pushbox.x, pushbox.y - 5);
  }

  // Dynamic hurtbox based on current state
  getDynamicHurtbox() {
    let hurtbox = { ...this.hurtBox };

    if (this.isCrouching) {
      // Crouching - smaller, lower hurtbox
      hurtbox.y = this.height * 0.4;
      hurtbox.height = this.height * 0.5;
      hurtbox.width = this.width * 0.6;
    } else if (this.isJumping) {
      // Jumping - adjust based on jump height
      const jumpProgress = Math.abs(this.velocityY) / Math.abs(this.jumpSpeed);

      if (this.currentAnimation === FighterState.JUMP_FRONT) {
        // Forward jump - extend horizontally
        hurtbox.width = this.width * 0.7;
        hurtbox.x = this.width * 0.2;
      }

      // Slightly smaller hurtbox when airborne
      hurtbox.width *= 0.9;
      hurtbox.height *= 0.95;
    }

    return {
      x: this.x + hurtbox.x,
      y: this.y + hurtbox.y,
      width: hurtbox.width,
      height: hurtbox.height,
    };
  }

  // Dynamic hitbox based on current attack
  getDynamicHitbox() {
    if (!this.isAttacking || !this.attackType) {
      return null;
    }

    let hitboxConfig = this.hitboxConfigs[this.attackType];
    if (!hitboxConfig) {
      // Fallback to default
      hitboxConfig = this.hitboxConfigs.punch;
    }

    // Adjust hitbox based on direction
    const hitboxX =
      this.direction === FighterDirection.RIGHT
        ? this.x + hitboxConfig.x
        : this.x - hitboxConfig.width;

    return {
      x: hitboxX,
      y: this.y + hitboxConfig.y,
      width: hitboxConfig.width,
      height: hitboxConfig.height,
    };
  }

  update(keys, justPressed = {}, opponent = null) {
    // Store old position in case we need to revert
    const oldX = this.x;
    const oldY = this.y;

    // Use constants instead of magic strings
    let animation = FighterState.STANCE;
    this.moving = false;

    // Update facing to always look at opponent
    if (opponent) {
      this.updateFacing(opponent);
    }

    // Check if we're in the middle of an attack animation
    if (this.isAttacking) {
      animation = this.attackType;

      if (this.frameTimer === 0) this.attackFrameCount++;

      if (this.attackFrameCount >= this.animations[this.attackType]?.length) {
        this.isAttacking = false;
        this.attackType = null;
        this.attackFrameCount = 0;
      } else {
        this.setAnimation(animation);
        return;
      }
    }

    // Handling being hit
    if (this.isHit) {
      animation = this.isCrouching ? "crouch_hit" : "hit";
      const hitFrames = this.animations[animation];

      if (this.frameIndex >= hitFrames.length - 1) {
        this.isHit = false;
      } else {
        this.setAnimation(animation);
        return;
      }
    }

    // Crouching
    if (keys["ArrowDown"]) {
      this.isCrouching = true;
      animation = FighterState.CROUCH;
      this.moving = false;
    } else {
      this.isCrouching = false;
    }

    // Movement and jump logic
    let isMovingForward = false;

    if (!this.isCrouching) {
      if (keys["ArrowRight"]) {
        this.x += this.speed;
        this.moving = true;
        animation =
          this.direction === FighterDirection.RIGHT
            ? FighterState.WALK_FORWARD
            : FighterState.WALK_BACKWARDS;

        isMovingForward = this.direction === FighterDirection.RIGHT;
      }

      if (keys["ArrowLeft"]) {
        this.x -= this.speed;
        this.moving = true;
        animation =
          this.direction === FighterDirection.LEFT
            ? FighterState.WALK_FORWARD
            : FighterState.WALK_BACKWARDS;

        isMovingForward = this.direction === FighterDirection.LEFT;
      }
    }

    // Jump logic - check if moving forward when jumping
    if (keys["ArrowUp"]) {
      if (!this.isJumping) {
        this.isJumping = true;
        this.velocityY = this.jumpSpeed;

        // If moving forward while jumping, use jump_front animation
        if (isMovingForward) {
          animation = FighterState.JUMP_FRONT;
          // Add extra forward momentum during jump_front
          if (this.direction === FighterDirection.RIGHT) {
            this.x += this.speed * 1.5;
          } else {
            this.x -= this.speed * 1.5;
          }
        } else {
          animation = FighterState.JUMP;
        }
      }
    }

    // Apply gravity and jumping physics
    if (this.isJumping) {
      this.y += this.velocityY;
      this.velocityY += this.gravity;

      // Don't override jump animations
      if (
        animation !== FighterState.JUMP_FRONT &&
        animation !== FighterState.JUMP
      ) {
        animation = this.currentAnimation;
      }

      // Check if we've landed
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }

    // Process attacks - including crouch attacks
    if (!this.isAttacking && !this.isJumping) {
      if (this.isCrouching) {
        // Crouch attacks
        if (justPressed["z"]) {
          this.performAttack(FighterState.CROUCH_PUNCH);
          return;
        }
        if (justPressed["x"]) {
          this.performAttack(FighterState.CROUCH_KICK);
          return;
        }
      } else {
        // Standing attacks
        if (justPressed["z"]) {
          this.performAttack(FighterState.PUNCH);
          return;
        }
        if (justPressed["x"]) {
          this.performAttack(FighterState.KICK);
          return;
        }
        // Uppercut (could be special input like down+punch)
        if (justPressed["z"] && keys["ArrowDown"]) {
          this.performAttack(FighterState.UPPERCUT);
          return;
        }
      }
    }

    // Handle pushbox collisions after movement
    if (opponent) {
      this.resolvePushboxCollision(opponent);
    }

    // Set the current animation based on state
    this.setAnimation(animation);
  }

  performAttack(attackType) {
    this.isAttacking = true;
    this.attackFrameCount = 0;
    this.attackType = attackType;

    // Set attack box from config
    const config = this.hitboxConfigs[attackType] || this.hitboxConfigs.punch;
    this.attackBox = { ...config };

    this.setAnimation(this.attackType);
  }

  takeHit(damage) {
    this.health = Math.max(0, this.health - damage);
    this.isHit = true;
    this.frameIndex = 0;
    this.frameTimer = 0;

    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  checkCollision(opponent) {
    const hitbox = this.getDynamicHitbox();
    const opponentHurtbox = opponent.getDynamicHurtbox();

    if (!hitbox || !opponentHurtbox) return false;

    // AABB collision detection
    return (
      hitbox.x < opponentHurtbox.x + opponentHurtbox.width &&
      hitbox.x + hitbox.width > opponentHurtbox.x &&
      hitbox.y < opponentHurtbox.y + opponentHurtbox.height &&
      hitbox.y + hitbox.height > opponentHurtbox.y
    );
  }

  checkPushboxCollision(opponent) {
    if (!opponent) return false;

    // Calculate this fighter's pushbox world position
    const thisPushBox = {
      x: this.x + this.pushBox.x,
      y: this.y + this.pushBox.y,
      width: this.pushBox.width,
      height: this.pushBox.height,
    };

    // Calculate opponent's pushbox world position
    const opponentPushBox = {
      x: opponent.x + opponent.pushBox.x,
      y: opponent.y + opponent.pushBox.y,
      width: opponent.pushBox.width,
      height: opponent.pushBox.height,
    };

    // Check for AABB collision
    return (
      thisPushBox.x < opponentPushBox.x + opponentPushBox.width &&
      thisPushBox.x + thisPushBox.width > opponentPushBox.x &&
      thisPushBox.y < opponentPushBox.y + opponentPushBox.height &&
      thisPushBox.y + thisPushBox.height > opponentPushBox.y
    );
  }

  resolvePushboxCollision(opponent) {
    if (!this.checkPushboxCollision(opponent)) return;

    // Calculate overlap
    const thisCenterX = this.x + this.width / 2;
    const opponentCenterX = opponent.x + opponent.width / 2;
    const distance = Math.abs(thisCenterX - opponentCenterX);
    const minDistance = (this.pushBox.width + opponent.pushBox.width) / 2;
    const overlap = minDistance - distance;

    if (overlap > 0) {
      const pushDistance = overlap / 2;

      // Determine push direction
      if (thisCenterX < opponentCenterX) {
        // This fighter is to the left, push both away from each other
        this.x -= pushDistance;
        opponent.x += pushDistance;
      } else {
        // This fighter is to the right, push both away from each other
        this.x += pushDistance;
        opponent.x -= pushDistance;
      }

      // Make sure fighters don't go off screen
      this.constrainToScreen();
      opponent.constrainToScreen();
    }
  }

  constrainToScreen() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const padding = 20;
    const leftBound = padding;
    const rightBound = canvas.width - this.width - padding;

    if (this.x < leftBound) {
      this.x = leftBound;
    } else if (this.x > rightBound) {
      this.x = rightBound;
    }
  }

  reset() {
    this.health = this.maxHealth;
    this.x = this.startX;
    this.y = this.groundY;
    this.isAttacking = false;
    this.isJumping = false;
    this.isCrouching = false;
    this.isHit = false;
    this.isDead = false;
    this.setAnimation("stance");
  }

  updateFacing(opponent) {
    if (!opponent) {
      console.log(`${this.name} has no opponent to face`);
      return;
    }

    console.log(`${this.name} at x:${this.x}, opponent at x:${opponent.x}`);

    const shouldFaceRight = opponent.x > this.x;
    const newDirection = shouldFaceRight
      ? FighterDirection.RIGHT
      : FighterDirection.LEFT;

    if (this.direction !== newDirection) {
      this.direction = newDirection;
      this.facing = shouldFaceRight ? "right" : "left";
      console.log(`${this.name} turning to face ${this.facing}`);
    }
  }
}

export default Fighter;
