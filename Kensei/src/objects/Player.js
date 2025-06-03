import Fighter from "./Fighter.js";
import { FighterDirection } from "../constants/fighter.js";
import { canvas } from "../engine/Canvas.js";

class Player extends Fighter {
  constructor(x, y, width, height, direction = FighterDirection.RIGHT) {
    super(
      x,
      y,
      width,
      height,
      "./assets/spritesheets/spritesheetRyu.png",
      "./assets/spritesheets/spritesheetRyu.json",
      direction,
      "player1"
    );

    this.isPlayer = true;
    this.score = 0;
  }

  // Metodo para atualizar o estado do jogador
  // Recebe as teclas pressionadas e as ações recentes
  update(keys, justPressed = {}, opponent = null) {
    super.update(keys, justPressed, opponent);

    this.constrainToScreen();

    if (!this.isAttacking && !this.isJumping && !this.isCrouching) {
      if (justPressed["c"]) {
        this.performSpecialMove();
        return;
      }
    }
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

  performSpecialMove() {
    this.isAttacking = true;
    this.attackType = "special_move";
    this.attackFrameCount = 0;

    // Attackbox especial
    this.attackBox = {
      x: this.width * 0.5,
      y: this.height * 0.2,
      width: this.width * 0.8,
      height: this.width * 0.6,
    };

    this.setAnimation("special_move");
  }

  performAttack(attackType) {
    super.performAttack(attackType);
  }
}

export default Player;
