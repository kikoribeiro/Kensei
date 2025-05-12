class Player {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = "red";
    this.speed = 5;

    this.imageLoaded = false;

    this.sprite = new Image();

    this.sprite.onload = () => {
      this.imageLoaded = true;
    };

    this.sprite.src = "./assets/spritesheets/Haohmaru.png";

    this.frameX = 0;
    this.frameY = 0;
    this.frameWidth = 32;
    this.frameHeight = 32;
    this.frameCount = 4;
    this.frameTimer = 0;
    this.frameDelay = 10;
    this.direction = 0;
  }

  draw(ctx) {
    ctx.drawImage(
      this.sprite,
      this.frameX * this.frameWidth,
      this.frameY * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  update(keys) {
    // Track if the player is moving
    let moving = false;

    // Process movement (separate from attacks to allow diagonal movement)
    switch (true) {
      case keys["ArrowLeft"]:
        this.x -= this.speed;
        this.frameY = 1; // Animation frame for left movement
        moving = true;
        break;

      case keys["ArrowRight"]:
        this.x += this.speed;
        this.frameY = 2; // Animation frame for right movement
        moving = true;
        break;

      case keys["ArrowUp"]:
        this.y -= this.speed;
        this.frameY = 3; // Animation frame for up movement
        moving = true;
        break;

      case keys["ArrowDown"]:
        this.y += this.speed;
        this.frameY = 0; // Animation frame for down movement
        moving = true;
        break;
    }

    // Process attack inputs
    if (keys["z"]) {
      this.punch();
    }

    if (keys["x"]) {
      this.kick();
    }

    // Update animation based on movement state
    if (moving) {
      this.frameTimer++;
      if (this.frameTimer >= this.frameDelay) {
        this.frameTimer = 0;
        this.frameX = (this.frameX + 1) % this.frameCount;
      }
    } else {
      //frame idle
      this.frameX = 0;
    }
  }

  // Add punch method
  punch() {
    this.frameY = 4; // Adjust this to match your spritesheet layout
    // Add attack hitbox/logic here
  }

  // Add kick method
  kick() {
    this.frameY = 5; // Adjust this to match your spritesheet layout
    // Add attack hitbox/logic here
  }
}

export default Player;
