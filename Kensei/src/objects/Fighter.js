import { ctx } from "../engine/Canvas.js";

class Fighter {
  constructor(
    x,
    y,
    width,
    height,
    spritesheetPath,
    jsonPath,
    name = "fighter"
  ) {
    // Position and dimensions
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.name = name;

    // Visual properties
    this.color = "#ff0000"; // Default color for placeholder
    this.facing = "right"; // Direction fighter is facing
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

    // Initialize empty animations object (will be populated from JSON)
    this.animations = {};
    this.spriteData = null;

    // Animation-specific speeds
    this.animationSpeeds = {
      punch: 3,
      kick: 3,
      special_move: 2, // Slower for special move
      stance: 6,
      walk_forward: 6,
      walk_backwards: 6,
      jump: 5,
      crouch: 5,
      hit: 4,
      crouch_hit: 4,
      crouch_kick: 3,
      crouch_punch: 3,
      jump_front: 5,
      uppercut: 3,
      victory: 8, // Slower for victory pose
      dead: 10, // Very slow death animation
      turn: 4,
      face: 8,
      name: 8,
    };

    // Add animations that should hold their last frame
    this.holdLastFrameAnimations = ["crouch", "jump"];

    // Load sprite sheet and JSON data
    this.loadSpritesheet(spritesheetPath, jsonPath);
  }

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

    // Parse JSON spritesheet data
    const frames = this.spriteData.frames;

    // Group frames by animation name
    const animationGroups = {};

    for (const frameName in frames) {
      const frameData = frames[frameName];

      // Extract animation name from frame name
      const animationName = this.extractAnimationName(frameName);

      if (!animationGroups[animationName]) {
        animationGroups[animationName] = [];
      }

      // Convert JSON frame data to our format
      const frame = {
        x: frameData.frame.x,
        y: frameData.frame.y,
        w: frameData.frame.w,
        h: frameData.frame.h,
        // Calculate anchor points (center-bottom for fighting game characters)
        anchorX: frameData.frame.w / 2,
        anchorY: frameData.frame.h,
      };

      animationGroups[animationName].push({
        frame,
        frameName,
      });
    }

    // Sort frames by name to ensure correct order
    for (const animName in animationGroups) {
      animationGroups[animName].sort((a, b) =>
        a.frameName.localeCompare(b.frameName)
      );
      this.animations[animName] = animationGroups[animName].map(
        (item) => item.frame
      );
    }

    // Map common animation names to our expected names
    this.mapAnimationNames();

    console.log(
      `Loaded animations for ${this.name}:`,
      Object.keys(this.animations)
    );
  }

  extractAnimationName(frameName) {
    // Remove file extension
    const nameWithoutExt = frameName.replace(/\.(png|jpg|jpeg)$/i, "");

    // For your JSON format, extract everything before the last dash and number
    // e.g., "stance-0.png" -> "stance", "walk-forward-0.png" -> "walk-forward"
    const animationName = nameWithoutExt.replace(/-\d+$/, "");

    return animationName.toLowerCase();
  }

  mapAnimationNames() {
    // Map the exact JSON animation names to our expected game names
    const nameMapping = {
      // Keep exact matches
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

      // Additional mappings from JSON
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
    // Find maximum dimensions across ALL animations
    let maxWidth = 0;
    let maxHeight = 0;

    // Check all animations
    for (const animName in this.animations) {
      const frames = this.animations[animName];

      // Check all frames in this animation
      for (const frame of frames) {
        maxWidth = Math.max(maxWidth, frame.w);
        maxHeight = Math.max(maxHeight, frame.h);
      }
    }

    // Calculate a single scale based on maximum dimensions
    if (maxWidth > 0 && maxHeight > 0) {
      const sizeMultiplier = 1;
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

    // Get current frame data
    const frame = frames[this.frameIndex];

    // Use the consistent scale for all animations
    const scale = this.globalScale || 1;
    const scaledWidth = frame.w * scale;
    const scaledHeight = frame.h * scale;

    // Calculate anchor-based positioning
    const anchorX = frame.anchorX || frame.w / 2; // Default to center if no anchor
    const anchorY = frame.anchorY || frame.h; // Default to bottom if no anchor

    const scaledAnchorX = anchorX * scale;
    const scaledAnchorY = anchorY * scale;

    // Save context for transformations
    ctx.save();

    // Ensure full opacity
    ctx.globalAlpha = 1.0;

    // // Check if we need to flip horizontally based on facing direction
    // if (this.facing === "left") {
    //   ctx.scale(-1, 1);
    //   ctx.translate(-this.x - this.width, 0);

    //   // Draw using anchor point (flipped)
    //   ctx.drawImage(
    //     this.sprite,
    //     frame.x,
    //     frame.y,
    //     frame.w,
    //     frame.h, // Source rect
    //     this.x + this.width / 2 - (frame.w - scaledAnchorX), // Anchor-based X (flipped)
    //     this.y + this.height - scaledAnchorY, // Anchor-based Y
    //     scaledWidth,
    //     scaledHeight // Destination size
    //   );
    // }
    // else {
    // Normal drawing (facing right)
    ctx.drawImage(
      this.sprite,
      frame.x,
      frame.y,
      frame.w,
      frame.h, // Source rect
      this.x + this.width / 2 - scaledAnchorX, // Anchor-based X
      this.y + this.height - scaledAnchorY, // Anchor-based Y
      scaledWidth,
      scaledHeight // Destination size
    );
    // }

    // Restore context
    ctx.restore();

    // Update animation frame
    this.frameTimer++;

    // Get the appropriate speed for this animation (or use default)
    const currentDelay =
      this.animationSpeeds[this.currentAnimation] || this.frameDelay;

    if (this.frameTimer >= currentDelay) {
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
      this.drawHitboxes(ctx);
    }
  }

  drawHitboxes(ctx) {
    // Draw character hitbox
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw attack hitbox if attacking
    if (this.isAttacking) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;

      let hitboxX =
        this.facing === "right"
          ? this.x + this.attackBox.x
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
        this.frameTimer >=
          (this.animationSpeeds[animation] || this.frameDelay) - 1
      ) {
        this.isHit = false;
      } else {
        // Still in hit animation
        this.setAnimation(animation);
        return;
      }
    }

    // Movement logic
    if (keys["ArrowUp"]) {
      if (!this.isJumping) {
        this.isJumping = true;
        this.velocityY = this.jumpSpeed;
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
      this.y += this.velocityY;
      this.velocityY += this.gravity;
      animation = "jump";

      // Check if we've landed
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.velocityY = 0;
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

  // Update the checkScreenBounds method to work with static boundaries
  checkScreenBounds() {
    // Get canvas for boundary checking
    const canvas = document.querySelector("canvas");
    if (!canvas) return true;

    // Define stage boundaries with padding
    const padding = 20;
    const leftBound = padding;
    const rightBound = canvas.width - this.width - padding;

    // Check if fighter is within bounds
    return this.x >= leftBound && this.x <= rightBound;
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
