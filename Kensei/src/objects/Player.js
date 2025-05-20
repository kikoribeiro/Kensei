import { SpriteManager } from "../engine/SpriteManager.js";

class Player {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = "red";
    this.speed = 5;
    this.facingRight = true;

    // Propriedades relacionadas ao sprite
    this.sprite = new Image();
    this.sprite.src = "./assets/spritesheets/spritesheet.png";
    this.spriteManager = new SpriteManager();
    this.currentAnimation = "stance";
    this.frameIndex = 0;
    this.frameDelay = 6; // Delay entre frames
    this.frameTimer = 0;
    this.animations = {};

    // Jump properties
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.jumpSpeed = -18; // Increased by 50% for a much higher jump
    this.gravity = 0.6;
    // Set the ground position to be the bottom of the sprite
    this.groundY = y; // Store initial y as ground position

    // Crouch state
    this.isCrouching = false;

    // Flag to track if animations are ready
    this.animationsReady = false;

    // Attack state
    this.isAttacking = false;
    this.attackType = null;
    this.attackFrameCount = 0;
    this.completedOneCycle = false; // Track if one cycle of the attack animation is complete

    // Animation durations (in frames)
    this.animationDurations = {
      punch: 12, // Adjust these numbers based on actual animation length
      kick: 15,
    };

    // Add these new properties
    this.animationScales = {}; // Store scale for each animation
    this.currentScale = 1; // Current animation's scale factor

    // Use a single consistent scale for ALL animations
    this.globalScale = null;

    // Load sprite data
    this.spriteManager
      .loadSpriteData("./assets/spritesheets/spritesheet.json")
      .then(() => {
        this.initAnimations();
        // Calculate global scale ONCE for all animations
        this.calculateGlobalScale();
        this.animationsReady = true;
        console.log("Player animations fully initialized");
      })
      .catch((err) => {
        console.error("Failed to load animations:", err);
      });
  }

  initAnimations() {
    // Define as animações disponíveis
    this.animations = {
      stance: this.spriteManager.getAnimationFrames("stance-"),
      walk_forward: this.spriteManager.getAnimationFrames("walk_forward-"),
      walk_backwards: this.spriteManager.getAnimationFrames("walk_backwards-"),
      jump: this.spriteManager.getAnimationFrames("jump-"),
      crouch: this.spriteManager.getAnimationFrames("crouch-"),
      punch: this.spriteManager.getAnimationFrames("light_attack-"),
      kick: this.spriteManager.getAnimationFrames("kick-"),
      jump_attack: this.spriteManager.getAnimationFrames("jump_attack-"),
      crouch_attack: this.spriteManager.getAnimationFrames("crouch_attack-"),
      crouch_walk: this.spriteManager.getAnimationFrames("crouch_walk-"),
    };

    // Check if animations are empty
    const emptyAnimations = Object.entries(this.animations)
      .filter(([name, frames]) => !frames || frames.length === 0)
      .map(([name]) => name);

    if (emptyAnimations.length > 0) {
      console.warn("Empty animations:", emptyAnimations);
    } else {
      console.log("All animations loaded successfully");
    }
  }

  // Add this new method to calculate global scale
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
      // Apply a size multiplier (1.3 = 30% larger)
      const sizeMultiplier = 2.7;
      this.globalScale =
        Math.min(this.width / maxWidth, this.height / maxHeight) *
        sizeMultiplier;
      console.log(
        `Global scale set to: ${this.globalScale}, from max dims: ${maxWidth}x${maxHeight}`
      );
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
      // Draw placeholder rectangle until animations load
      ctx.fillStyle = this.color || "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    // Get current animation frames (with safety check)
    const frames = this.animations[this.currentAnimation];
    if (!frames || frames.length === 0) {
      // Only log this error if we're not in initialization phase
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
    if (!frameData) return;

    // Draw the current frame, maintaining aspect ratio
    const frameWidth = frameData.frame.w;
    const frameHeight = frameData.frame.h;

    // Use GLOBAL scale instead of animation-specific scale
    // This ensures ALL animations use the same scale
    const scale = this.globalScale || 1;
    const scaledWidth = frameWidth * scale;
    const scaledHeight = frameHeight * scale;

    // Draw centered horizontally, but aligned to bottom vertically
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

    // Update animation frame
    this.frameTimer++;
    if (this.frameTimer >= this.frameDelay) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % frames.length;
    }
  }

  setAnimation(name) {
    // Only change animation if it's different
    if (this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.frameIndex = 0; // Start from the first frame
      this.frameTimer = 0;
      // Don't recalculate scale here
    }
  }

  update(keys, justPressed = {}) {
    // Debug key presses
    if (Object.keys(keys).some((k) => keys[k])) {
      console.log(
        "Keys pressed:",
        Object.keys(keys).filter((k) => keys[k])
      );
    }

    // Track if the player is moving
    let moving = false;

    // Default animation
    let animation = "stance";

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
      // This is the key fix - we compare with actual frame count
      if (this.attackFrameCount >= attackFrames.length) {
        // Animation complete, reset attack state
        this.isAttacking = false;
        this.attackType = null;
        this.attackFrameCount = 0;
        this.completedOneCycle = false;

        // IMPORTANT: Make sure we switch to a valid stance frame
        this.frameIndex = 0;
        this.frameTimer = 0;

        // Explicitly set animation to stance
        this.setAnimation("stance");
      } else {
        // Still attacking, don't process other inputs
        this.setAnimation(animation);
        return;
      }
    }

    // Not currently attacking, so check for new attacks
    // For actions that should only happen once per key press:
    if (justPressed["z"] && !this.isAttacking) {
      this.isAttacking = true;
      this.attackType = "punch";
      this.attackFrameCount = 0;
      this.setAnimation("punch");
      return;
    }

    if (justPressed["x"] && !this.isAttacking) {
      this.isAttacking = true;
      this.attackType = "kick";
      this.attackFrameCount = 0;
      this.setAnimation("kick");
      return;
    }

    // Handle jumping physics
    if (this.isJumping) {
      // Apply gravity to jump velocity
      this.jumpVelocity += this.gravity;
      this.y += this.jumpVelocity;

      // Check if landed
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }

      animation = "jump";
    }

    // Check for crouch
    if (keys["ArrowDown"] && !this.isJumping) {
      // Don't allow crouch during jump
      this.isCrouching = true;
      animation = "crouch";
      // REMOVED return - but don't move horizontally while crouching
    } else {
      this.isCrouching = false;
    }

    // Start jump on ArrowUp if not already jumping
    if (keys["ArrowUp"] && !this.isJumping && !this.isCrouching) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpSpeed;
      animation = "jump";
      // REMOVED return - allow horizontal movement when starting jump
    }

    // Process horizontal movement if not crouching
    if (!this.isCrouching) {
      if (keys["ArrowLeft"]) {
        this.x -= this.speed;
        this.facingRight = false;
        if (!this.isJumping) animation = "walk_backwards"; // Only change animation if not jumping
        moving = true;
      }
      if (keys["ArrowRight"]) {
        this.x += this.speed;
        this.facingRight = true;
        if (!this.isJumping) animation = "walk_forward"; // Only change animation if not jumping
        moving = true;
      }
    }

    // Set the appropriate animation
    this.setAnimation(animation);
  }
}

export default Player;
