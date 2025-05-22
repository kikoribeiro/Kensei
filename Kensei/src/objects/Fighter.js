import { ctx } from "../engine/Canvas.js";
import { SpriteManager } from "../engine/SpriteManager.js";

class Fighter {
  constructor(x, y, width, height, spritesheetPath, name = "fighter") {
    // Position and dimensions
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.name = name;

    // Visual properties
    this.color = "#ff0000"; // Default color for placeholder
    // this.facing = "right";  // Direction fighter is facing
    this.globalScale = null;

    // Physics properties
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5; // Walking speed
    this.jumpSpeed = -18; // Jump velocity (negative = up)
    this.gravity = 0.6; // Gravity force
    this.groundY = y; // Initial ground level

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
    this.maxHealth = 100;

    // Animation properties
    this.currentAnimation = "stance";
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 6; // Animation speed (higher = slower)
    this.animationsReady = false;
    this.animationScales = {};
    this.currentScale = 1;

    // Sprite management
    this.spriteManager = new SpriteManager();
    this.sprite = new Image();

    // Add this new property to track animations that should hold their last frame
    this.holdLastFrameAnimations = ["crouch", "jump"];

    // Load the fighter's spritesheet
    this.loadSprites(spritesheetPath);
  }

  loadSprites(spritesheetPath) {
    this.sprite.src = spritesheetPath.replace(".json", ".png");
    this.sprite.onload = () => {
      console.log(`Loaded sprite for ${this.name}`);
    };

    this.spriteManager
      .loadSpriteData(spritesheetPath)
      .then(() => {
        this.initAnimations();
        this.calculateGlobalScale();
        this.animationsReady = true;
        console.log(`${this.name} animations fully initialized`);
      })
      .catch((err) => {
        console.error(`Failed to load animations for ${this.name}:`, err);
      });
  }

  initAnimations() {
    // Default animations - each fighter can override with their specific animations
    this.animations = {
      stance: this.spriteManager.getAnimationFrames("stance-"),
      walk_forward: this.spriteManager.getAnimationFrames("walk_forward-"),
      walk_backwards: this.spriteManager.getAnimationFrames("walk_backwards-"),
      jump: this.spriteManager.getAnimationFrames("jump-"),
      crouch: this.spriteManager.getAnimationFrames("crouch-"),
      punch: this.spriteManager.getAnimationFrames("light_attack-"),
      kick: this.spriteManager.getAnimationFrames("kick-"),
      block: this.spriteManager.getAnimationFrames("block-"),
      hit: this.spriteManager.getAnimationFrames("getting_hit-"),
      crouch_hit: this.spriteManager.getAnimationFrames("getting_hit_crouch-"),
    };

    // Set initial animation
    this.setAnimation("stance");
  }

  calculateGlobalScale() {
    // Find maximum dimensions across ALL animations
    let maxWidth = 0;
    let maxHeight = 0;

    // Check all animations
    for (const animName in this.animations) {
      const frames = this.animations[animName];

      // Check all frames in this animation
      for (const frameName of frames) {
        const frameData = this.spriteManager.getFrameData(frameName);
        if (!frameData || !frameData.frame) continue;

        maxWidth = Math.max(maxWidth, frameData.frame.w);
        maxHeight = Math.max(maxHeight, frameData.frame.h);
      }
    }

    // Calculate a single scale based on maximum dimensions
    if (maxWidth > 0 && maxHeight > 0) {
      const sizeMultiplier = 1.8;
      this.globalScale =
        Math.min(this.width / maxWidth, this.height / maxHeight) *
        sizeMultiplier;
      console.log(
        `${this.name} global scale set to: ${this.globalScale}, with size multiplier: ${sizeMultiplier}`
      );
    }
  }

  setAnimation(name) {
    // Only change animation if it's different
    if (this.currentAnimation !== name && this.animations[name]) {
      this.currentAnimation = name;
      this.frameIndex = 0; // Start from the first frame
      this.frameTimer = 0;
    }
  }

  draw(ctx) {
    if (!ctx) {
      console.error("Context is undefined");
      return;
    }

    // First check if animations are initialized
    const animationsInitialized =
      this.animations &&
      Object.keys(this.animations).length > 0 &&
      this.spriteManager.isLoaded;

    // During loading phase, draw a placeholder
    if (!animationsInitialized) {
      ctx.fillStyle = this.color || "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    // Get current animation frames (with safety check)
    const frames = this.animations[this.currentAnimation];
    if (!frames || frames.length === 0) {
      console.error(`No frames found for animation: ${this.currentAnimation}`);
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    // SAFE FRAME INDEX - Make sure we never go out of bounds
    if (this.frameIndex >= frames.length) {
      this.frameIndex = 0;
    }

    // Get current frame name
    const frameName = frames[this.frameIndex];

    // Get frame data from the sprite sheet
    const frameData = this.spriteManager.getFrameData(frameName);
    if (!frameData || !frameData.frame) return;

    // Draw the current frame, maintaining aspect ratio
    const frameWidth = frameData.frame.w;
    const frameHeight = frameData.frame.h;

    // Use the consistent scale for this animation
    const scale = this.globalScale || 1;
    const scaledWidth = frameWidth * scale;
    const scaledHeight = frameHeight * scale;

    // Save context for transformations
    ctx.save();


    // Check if we need to flip horizontally based on facing direction
    // if (this.facing === "left") {
    //   ctx.scale(-1, 1);
    //   ctx.translate(-this.x - this.width, 0);

    //   // Draw centered horizontally, but aligned to bottom vertically
    //   ctx.drawImage(
    //     this.sprite,
    //     frameData.frame.x,
    //     frameData.frame.y,
    //     frameData.frame.w,
    //     frameData.frame.h,
    //     this.width - (this.width - scaledWidth) / 2 - scaledWidth, // Center horizontally (flipped)
    //     this.y + (this.height - scaledHeight), // Align to bottom
    //     scaledWidth,
    //     scaledHeight
    //   );
    // } else {
    // Normal drawing (facing right)
    ctx.drawImage(
      this.sprite,
      frameData.frame.x,
      frameData.frame.y,
      frameData.frame.w,
      frameData.frame.h,
      this.x + (this.width - scaledWidth) / 2, // Center horizontally
      this.y + (this.height - scaledHeight), // Align to bottom
      scaledWidth,
      scaledHeight
    );
    // }

    // Restore context
    ctx.restore();

    // Update animation frame
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

    // Optional: Draw hitbox/hurtbox for debugging
    // if (window.DEBUG_MODE) {
    //   this.drawHitboxes(ctx);
    // }
  }

  drawHitboxes(ctx) {
    // Draw character hitbox
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw attack hitbox if attacking
    if (this.isAttacking) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;

      let hitboxX =
        this.facing === "right"
          ? this.x + this.width / 2
          : this.x - this.attackBox.width;

      ctx.strokeRect(
        hitboxX,
        this.y + this.attackBox.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }

  update(keys, justPressed = {}) {
    // Default animation
    let animation = "stance";

    // Track if the player is moving
    let moving = false;

    // Check if we're in the middle of an attack animation
    if (this.isAttacking) {
      // Continue the current attack animation
      animation = this.attackType;

      // Get the animation frames for the current attack
      const attackFrames = this.animations[this.attackType];

      // Only increment attack counter when frame changes
      if (this.frameTimer === 0) {
        this.attackFrameCount++;
      }

      // Check if we've played through all frames once
      if (this.attackFrameCount >= attackFrames.length) {
        // Animation complete, reset attack state
        this.isAttacking = false;
        this.attackType = null;
        this.attackFrameCount = 0;

        // Reset to stance
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.setAnimation("stance");
      } else {
        // Still attacking, don't process other inputs
        this.setAnimation(animation);
        return;
      }
    }

    // Handling being hit
    if (this.isHit) {
      animation = this.isCrouching ? "crouch_hit" : "hit";

      // Get hit animation frames
      const hitFrames = this.animations[animation];

      // Check if the hit animation is complete
      if (
        this.frameIndex >= hitFrames.length - 1 &&
        this.frameTimer >= this.frameDelay - 1
      ) {
        this.isHit = false;
      } else {
        // Still in hit animation
        this.setAnimation(animation);
        return;
      }
    }

    // Implement basic movement
    if (keys["ArrowUp"]) {
      if (!this.isJumping) {
        this.isJumping = true;
        this.jumpVelocity = this.jumpSpeed;
        animation = "jump";
      }
    }

    if (keys["ArrowDown"]) {
      this.isCrouching = true;
      animation = "crouch";
      moving = false;
    } else {
      this.isCrouching = false;
    }

    // Don't allow horizontal movement while crouching
    if (!this.isCrouching) {
      if (keys["ArrowRight"]) {
        this.x += this.speed;
        this.facing = "right";
        animation = "walk_forward";
        moving = true;
      }

      if (keys["ArrowLeft"]) {
        this.x -= this.speed;
        this.facing = "left";
        animation = "walk_backwards";
        moving = true;
      }
    }

    // Apply gravity and jumping physics
    if (this.isJumping) {
      this.y += this.jumpVelocity;
      this.jumpVelocity += this.gravity;
      animation = "jump";

      // Check if we've landed
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }

    // Process attacks - using justPressed to prevent holding attack button
    if (!this.isAttacking && !this.isJumping && !this.isCrouching) {
      if (justPressed["z"]) {
        this.performAttack("punch");
        return;
      }

      if (justPressed["x"]) {
        this.performAttack("kick");
        return;
      }
    }

    // Set the current animation based on state
    this.setAnimation(animation);
  }

  performAttack(attackType) {
    this.isAttacking = true;
    this.attackType = attackType;
    this.attackFrameCount = 0;

    // Configure attack hitbox
    switch (attackType) {
      case "punch":
        this.attackBox = {
          x: this.width * 0.7,
          y: this.height * 0.3,
          width: this.width * 0.5,
          height: this.height * 0.2,
        };
        break;
      case "kick":
        this.attackBox = {
          x: this.width * 0.6,
          y: this.height * 0.5,
          width: this.width * 0.6,
          height: this.height * 0.3,
        };
        break;
      default:
        this.attackBox = { x: 0, y: 0, width: 0, height: 0 };
    }

    this.setAnimation(attackType);
  }

  takeHit(damage) {
    this.health = Math.max(0, this.health - damage);
    this.isHit = true;
    this.frameIndex = 0;
    this.frameTimer = 0;

    // If health is depleted
    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  checkCollision(opponent) {
    if (!this.isAttacking) return false;

    // Check if this fighter's attack box collides with opponent
    const hitboxX =
      this.facing === "right"
        ? this.x + this.attackBox.x
        : this.x - this.attackBox.width;

    return (
      hitboxX < opponent.x + opponent.width &&
      hitboxX + this.attackBox.width > opponent.x &&
      this.y + this.attackBox.y < opponent.y + opponent.height &&
      this.y + this.attackBox.y + this.attackBox.height > opponent.y
    );
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
}

export default Fighter;
