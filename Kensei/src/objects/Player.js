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
    this.jumpSpeed = -12; // Negative because y goes down in canvas
    this.gravity = 0.6;
    this.groundY = y; // Store initial y as ground position

    // Crouch state
    this.isCrouching = false;

    // Load sprite
    this.spriteManager
      .loadSpriteData("./assets/spritesheets/spritesheet.json")
      .then(() => {
        this.initAnimations();
      });
  }

  initAnimations() {
    // Define as animações disponíveis
    this.animations = {
      stance: this.spriteManager.getAnimationFrames("stance-"),
      walk_forward: this.spriteManager.getAnimationFrames("walk_forward-"),
      walk_backwards: this.spriteManager.getAnimationFrames("walk_backwards-"),
      jump: this.spriteManager.getAnimationFrames("jump-"),
      punch: this.spriteManager.getAnimationFrames("light_attack-"),
      kick: this.spriteManager.getAnimationFrames("kick-"),
    };
    console.log("Player animations loaded:", Object.keys(this.animations));
  }

  draw(ctx) {
    if (!ctx) {
      console.error("Context is undefined");
      return;
    }

    // Get current animation frames
    const frames = this.animations[this.currentAnimation];
    if (!frames || frames.length === 0) {
      console.error(`No frames found for animation: ${this.currentAnimation}`);
      return;
    }

    // Get current frame name
    const frameName = frames[this.frameIndex];

    // Get frame data from the sprite sheet
    const frameData = this.spriteManager.getFrameData(frameName);
    if (!frameData) return;

    // Draw the current frame
    ctx.drawImage(
      this.sprite,
      frameData.frame.x,
      frameData.frame.y,
      frameData.frame.w,
      frameData.frame.h,
      this.x,
      this.y,
      this.width,
      this.height
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
    }
  }

  update(keys) {
    // Track if the player is moving
    let moving = false;

    // Default animation
    let animation = "stance";

    // First check for attacks (highest priority) using switch
    switch (true) {
      case keys["z"]:
        this.setAnimation("punch");
        return;
      case keys["x"]:
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
      return; // Skip other movement while jumping
    }

    // Check for crouch
    if (keys["ArrowDown"]) {
      this.isCrouching = true;
      animation = "crouch";
      return; // Skip other movement while crouching
    } else {
      this.isCrouching = false;
    }

    // Start jump on ArrowUp if not already jumping
    if (keys["ArrowUp"] && !this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpSpeed;
      animation = "jump";
      return; // Skip other movement when starting a jump
    }

    // Process horizontal movement with if statements
    if (keys["ArrowLeft"]) {
      this.x -= this.speed;
      this.facingRight = false;
      animation = "walk_backwards";
      moving = true;
    }
    if (keys["ArrowRight"]) {
      this.x += this.speed;
      this.facingRight = true;
      animation = "walk_forward";
      moving = true;
    }

    // Set the appropriate animation
    this.setAnimation(animation);
  }
}

export default Player;
