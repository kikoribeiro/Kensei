import { ctx } from "../engine/Canvas.js";
import { FighterDirection, FighterState } from "../constants/fighter.js";

/**
 * Classe que representa um Fighter no jogo.
 * Esta classe gere as propriedades do Fighter, animações, física,
 * e interações com outros Fighteres.
 * @class Fighter
 **/
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
    // Posição e dimensões do Fighter
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = direction;
    this.name = name;

    // Propriedades visuais
    this.facing = direction === FighterDirection.RIGHT ? "right" : "left";
    this.globalScale = null;

    // Propriedades de física e movimento
    this.velocityX = 150 * direction;
    this.velocityY = 0;
    this.speed = 5; // Velocidade de movimento horizontal
    this.jumpSpeed = -18; // Velocidade inicial do salto
    this.gravity = 0.6; // Força da gravidade
    this.groundY = y; // Posição Y do chão

    // Estados do Fighter
    this.isJumping = false; // Se está a saltar
    this.isCrouching = false; // Se está agachado
    this.isAttacking = false; // Se está a atacar
    this.isBlocking = false; // Se está a bloquear
    this.isHit = false; // Se foi atingido
    this.isDead = false; // Se está morto

    // Propriedades de ataque
    this.attackType = null; // Tipo de ataque atual
    this.attackFrameCount = 0;
    this.attackBox = { x: 0, y: 0, width: 0, height: 0 };

    // Vida
    this.health = 100;
    this.currentHealth = 100;

    // Propriedades de animação
    this.currentAnimation = "stance";
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 6; // Velocidade padrão para animações lentas (stance, walk)
    this.animationsReady = false;
    this.animations = {};
    this.spriteData = null;

    // NOVO: Velocidades específicas para diferentes tipos de animação
    this.animationSpeeds = {
      // Animações de ataque - RÁPIDAS
      punch: 3,
      kick: 3,
      crouch_punch: 3,
      crouch_kick: 3,
      uppercut: 4,
      special_move: 4,

      // Animações de movimento - NORMAIS
      stance: 8,
      walk_forward: 6,
      walk_backwards: 6,
      crouch: 6,

      // Animações de salto - MÉDIAS
      jump: 4,
      jump_front: 4,

      // Animações de reação - RÁPIDAS
      hit: 3,
      crouch_hit: 3,

      // Animações especiais - LENTAS
      victory: 8,
      dead: 6,
    };
    // Animações que devem manter o último frame
    this.holdLastFrameAnimations = [
      "crouch",
      "jump",
      "jump_front",
      "victory",
      "dead",
    ];

    // Propriedades da pushbox
    this.pushBox = {
      x: this.width * 0.2,
      y: this.height * 0.1,
      width: this.width * 0.6, // Largura da pushbox
      height: this.height * 0.8, // Altura da pushbox
    };

    this.pushForce = 2; // Força do empurrão

    // Propriedades da hurtbox (onde o Fighter pode ser atingido)
    this.hurtBox = {
      x: this.width * 0.25,
      y: this.height * 0.1,
      width: this.width * 0.5,
      height: this.height * 0.8,
    };

    // Configurações das hitboxes para diferentes ataques
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
        height: this.width * 0.5,
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

    // Carregar spritesheet e dados JSON
    this.loadSpritesheet(spritesheetPath, jsonPath);
  }

  // Método para determinar o estado baseado na velocidade e direção
  changeState = () =>
    this.velocity * this.direction < 0 ? "walk-backwards" : "walk_forward";

  // Carregamento assíncrono da spritesheet e dados JSON
  async loadSpritesheet(spritesheetPath, jsonPath) {
    try {
      // Carregar dados JSON primeiro
      const response = await fetch(jsonPath);
      this.spriteData = await response.json();

      // Carregar imagem da sprite
      this.sprite = new Image();
      this.sprite.onload = () => {
        this.initAnimationsFromJSON();
        this.calculateGlobalScale();
        this.animationsReady = true;
      };
      this.sprite.src = spritesheetPath;
    } catch (error) {
      console.error(`Falha ao carregar spritesheet para ${this.name}:`, error);
    }
  }

  // Inicializar animações a partir dos dados JSON
  initAnimationsFromJSON() {
    // Agrupar frames por nome da animação
    const animationGroups = {};

    for (const frameName in this.spriteData.frames) {
      const frameData = this.spriteData.frames[frameName];
      const animationName = this.extractAnimationName(frameName);

      if (!animationGroups[animationName]) {
        animationGroups[animationName] = [];
      }

      // Converter dados do frame JSON para o formato usando pivot do JSON
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

    // Ordenar e converter para formato final
    for (const animName in animationGroups) {
      // Ordenar por valor numérico em vez de alfabeticamente
      animationGroups[animName].sort((a, b) => {
        // Extrair o número do nome do frame
        const getFrameNumber = (frameName) => {
          const match = frameName.match(/-(\d+)\.png$/);
          return match ? parseInt(match[1], 10) : 0;
        };

        const numA = getFrameNumber(a.frameName);
        const numB = getFrameNumber(b.frameName);

        return numA - numB; // Ordenação numérica em vez de alfabética
      });

      this.animations[animName] = animationGroups[animName].map(
        (item) => item.frame
      );
    }

    this.mapAnimationNames();
  }

  // Extrair nome da animação do nome do ficheiro
  extractAnimationName(frameName) {
    // Remover extensão do ficheiro
    const nameWithoutExt = frameName.replace(/\.(png|jpg|jpeg)$/i, "");
    const animationName = nameWithoutExt.replace(/-\d+$/, "");
    return animationName.toLowerCase();
  }

  // Mapear nomes das animações do JSON para os nomes esperados no jogo
  mapAnimationNames() {
    // Mapear os nomes exatos das animações JSON para os nomes esperados no jogo
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

  // Calcular escala global para manter proporções consistentes
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

  // Método para obter a velocidade atual da animação
  getCurrentAnimationSpeed() {
    return this.animationSpeeds[this.currentAnimation] || this.frameDelay;
  }

  // Definir animação atual (apenas se for diferente)
  setAnimation(name) {
    // Só mudar animação se for diferente
    if (this.currentAnimation !== name && this.animations[name]) {
      this.currentAnimation = name;
      this.frameIndex = 0;
      this.frameTimer = 0; // SEMPRE resetar timer ao mudar animação
    }
  }

  // Desenhar o Fighter no canvas
  draw(ctx) {
    // Durante a fase de carregamento, desenhar um placeholder
    if (
      !this.animationsReady ||
      !this.sprite ||
      !this.sprite.complete ||
      !this.animations ||
      Object.keys(this.animations).length === 0
    ) {
      ctx.fillStyle = this.color || "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    // Obter frames da animação atual
    const frames = this.animations[this.currentAnimation];
    if (!frames?.length) return;

    // Garantir que nunca saímos dos limites
    if (this.frameIndex >= frames.length) {
      this.frameIndex = 0;
    }

    // Obter dados do frame atual
    const frame = frames[this.frameIndex];

    // Usar escala consistente para todas as animações
    const scale = this.globalScale || 1;

    // Guardar contexto para transformações
    ctx.save();

    // Usar constante de direção para inversão da sprite
    const scaleX = this.direction === FighterDirection.RIGHT ? 1 : -1;

    ctx.scale(scaleX, 1);

    // Ajustar posição x quando invertido
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

    // Atualizar frame da animação usando velocidade específica
    this.frameTimer++;

    // USAR VELOCIDADE ESPECÍFICA PARA CADA ANIMAÇÃO
    const currentSpeed = this.getCurrentAnimationSpeed();

    if (this.frameTimer >= currentSpeed) {
      this.frameTimer = 0;

      // Verificar se esta é uma animação que mantém o último frame e está no fim
      const isHoldAnimation = this.holdLastFrameAnimations.includes(
        this.currentAnimation
      );
      const isLastFrame = this.frameIndex === frames.length - 1;

      // Só incrementar se não for uma animação de hold no último frame
      if (!(isHoldAnimation && isLastFrame)) {
        this.frameIndex = (this.frameIndex + 1) % frames.length;
      }
    }
    //NO FINAL RETIRAWFEBNIJFWEBIJWEI
    // if (window.DEBUG_MODE) {
    //   this.drawHitboxes(ctx);
    // }
  }

  // // Desenhar hitboxes para debug
  // drawHitboxes(ctx) {
  //   // Desenhar hurtbox do personagem (onde podem ser atingidos)
  //   const hurtbox = this.getDynamicHurtbox();
  //   ctx.strokeStyle = "blue";
  //   ctx.lineWidth = 2;
  //   ctx.strokeRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height);

  //   // Etiqueta da hurtbox
  //   ctx.fillStyle = "blue";
  //   ctx.font = "10px Arial";
  //   ctx.fillText("DANO", hurtbox.x, hurtbox.y - 5);

  //   // Desenhar hitbox de ataque se estiver a atacar
  //   const hitbox = this.getDynamicHitbox();
  //   if (hitbox) {
  //     ctx.strokeStyle = "red";
  //     ctx.lineWidth = 3;
  //     ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

  //     // Etiqueta da hitbox
  //     ctx.fillStyle = "red";
  //     ctx.font = "10px Arial";
  //     ctx.fillText(
  //       `ATAQUE-${this.attackType.toUpperCase()}`,
  //       hitbox.x,
  //       hitbox.y - 5
  //     );
  //   }

  //   // Desenhar pushbox
  //   const pushbox = {
  //     x: this.x + this.pushBox.x,
  //     y: this.y + this.pushBox.y,
  //     width: this.pushBox.width,
  //     height: this.pushBox.height,
  //   };

  //   ctx.strokeStyle = "green";
  //   ctx.lineWidth = 2;
  //   ctx.strokeRect(pushbox.x, pushbox.y, pushbox.width, pushbox.height);

  //   // Etiqueta da pushbox
  //   ctx.fillStyle = "green";
  //   ctx.font = "10px Arial";
  //   ctx.fillText("EMPURRAR", pushbox.x, pushbox.y - 5);
  // }

  // Hurtbox dinâmica baseada no estado atual
  getDynamicHurtbox() {
    let hurtbox = { ...this.hurtBox };

    if (this.isCrouching) {
      // Agachado - hurtbox menor e mais baixa
      hurtbox.y = this.height * 0.4;
      hurtbox.height = this.height * 0.5;
      hurtbox.width = this.width * 0.6;
    } else if (this.isJumping) {
      // A saltar - ajustar baseado na altura do salto
      const jumpProgress = Math.abs(this.velocityY) / Math.abs(this.jumpSpeed);

      if (this.currentAnimation === FighterState.JUMP_FRONT) {
        // Salto para a frente - estender horizontalmente
        hurtbox.width = this.width * 0.7;
        hurtbox.x = this.width * 0.2;
      }

      // Hurtbox ligeiramente menor quando no ar
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

  // Hitbox dinâmica baseada no ataque atual
  getDynamicHitbox() {
    if (!this.isAttacking || !this.attackType) {
      return null;
    }

    let hitboxConfig = this.hitboxConfigs[this.attackType];
    if (!hitboxConfig) {
      // Fallback para padrão
      hitboxConfig = this.hitboxConfigs.punch;
    }

    // Ajustar hitbox baseada na direção
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

  // Método principal de atualização do Fighter
  update(keys, justPressed = {}, opponent = null) {
    // Guardar posição antiga caso precisemos de reverter
    const oldX = this.x;
    const oldY = this.y;

    let animation = FighterState.STANCE;
    this.moving = false;

    // Atualizar orientação para sempre olhar para o oponente
    if (opponent) {
      this.updateFacing(opponent);
    }

    // Verificar se estamos no meio de uma animação de ataque
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

    // Quando o Fighter é atingido, usar animação de hit
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

    // Agachar - CORRIGIR: Usar as teclas mapeadas
    if (keys["down"] || keys["ArrowDown"]) {
      // Aceitar ambas
      this.isCrouching = true;
      animation = FighterState.CROUCH;
      this.moving = false;
    } else {
      this.isCrouching = false;
    }

    // Lógica de movimento - CORRIGIR: Usar as teclas mapeadas
    let isMovingForward = false;

    if (!this.isCrouching) {
      if (keys["right"] || keys["ArrowRight"]) {
        // Aceitar ambas
        this.x += this.speed;
        this.moving = true;
        animation =
          this.direction === FighterDirection.RIGHT
            ? FighterState.WALK_FORWARD
            : FighterState.WALK_BACKWARDS;
        isMovingForward = this.direction === FighterDirection.RIGHT;
      }

      if (keys["left"] || keys["ArrowLeft"]) {
        // Aceitar ambas
        this.x -= this.speed;
        this.moving = true;
        animation =
          this.direction === FighterDirection.LEFT
            ? FighterState.WALK_FORWARD
            : FighterState.WALK_BACKWARDS;
        isMovingForward = this.direction === FighterDirection.LEFT;
      }
    }

    // Lógica de salto - CORRIGIR: Usar as teclas mapeadas
    if (keys["up"] || keys["ArrowUp"]) {
      // Aceitar ambas
      if (!this.isJumping) {
        this.isJumping = true;
        this.velocityY = this.jumpSpeed;

        if (isMovingForward) {
          animation = FighterState.JUMP_FRONT;
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

    // Aplicar gravidade e física do salto
    if (this.isJumping) {
      this.y += this.velocityY;
      this.velocityY += this.gravity;

      if (
        animation !== FighterState.JUMP_FRONT &&
        animation !== FighterState.JUMP
      ) {
        animation = this.currentAnimation;
      }

      // Verificar se aterrou
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }

    // Processar ataques - incluindo ataques agachado
    if (!this.isAttacking && !this.isJumping) {
      if (this.isCrouching) {
        // Ataques agachado
        if (justPressed["z"]) {
          this.performAttack(FighterState.CROUCH_PUNCH);
          return;
        }
        if (justPressed["x"]) {
          this.performAttack(FighterState.CROUCH_KICK);
          return;
        }
      } else {
        // Ataques em pé
        if (justPressed["z"]) {
          this.performAttack(FighterState.PUNCH);
          return;
        }
        if (justPressed["x"]) {
          this.performAttack(FighterState.KICK);
          return;
        }
        // // Uppercut (poderia ser entrada especial como baixo+soco)
        // if (justPressed["z"] && keys["ArrowLeft"]) {
        //   this.performAttack(FighterState.UPPERCUT);
        //   return;
        // }
      }
    }

    // Lidar com colisões de pushbox após movimento
    if (opponent) {
      this.resolvePushboxCollision(opponent);
    }

    // Definir a animação atual baseada no estado
    this.setAnimation(animation);
  }

  // Executar um ataque específico
  performAttack(attackType) {
    console.log(`${this.name} executa ${attackType}!`);
    this.isAttacking = true;
    this.attackFrameCount = 0;
    this.attackType = attackType;

    // Definir caixa de ataque a partir da configuração
    const config = this.hitboxConfigs[attackType] || this.hitboxConfigs.punch;
    this.attackBox = { ...config };

    // IMPORTANTE: Resetar timer para resposta imediata
    this.frameTimer = 0;
    this.frameIndex = 0;

    this.setAnimation(this.attackType);
  }

  // Receber dano
  takeHit(damage) {
    this.health = Math.max(0, this.health - damage);
    this.currentHealth = this.health; // Sincronizar currentHealth
    this.isHit = true;
    this.frameIndex = 0;
    this.frameTimer = 0;

    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  // Verificar colisão
  checkCollision(opponent) {
    const hitbox = this.getDynamicHitbox();
    const opponentHurtbox = opponent.getDynamicHurtbox();

    if (!hitbox || !opponentHurtbox) return false;

    // Deteção de colisão AABB - https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
    return (
      hitbox.x < opponentHurtbox.x + opponentHurtbox.width &&
      hitbox.x + hitbox.width > opponentHurtbox.x &&
      hitbox.y < opponentHurtbox.y + opponentHurtbox.height &&
      hitbox.y + hitbox.height > opponentHurtbox.y
    );
  }

  // Verificar colisão de pushbox - https://glossary.infil.net/?t=Pushbox
  checkPushboxCollision(opponent) {
    if (!opponent) return false;

    // Calcular posição da pushbox deste Fighter
    const thisPushBox = {
      x: this.x + this.pushBox.x,
      y: this.y + this.pushBox.y,
      width: this.pushBox.width,
      height: this.pushBox.height,
    };

    // Calcular posição da pushbox do oponente
    const opponentPushBox = {
      x: opponent.x + opponent.pushBox.x,
      y: opponent.y + opponent.pushBox.y,
      width: opponent.pushBox.width,
      height: opponent.pushBox.height,
    };

    // Verificar colisão AABB
    return (
      thisPushBox.x < opponentPushBox.x + opponentPushBox.width &&
      thisPushBox.x + thisPushBox.width > opponentPushBox.x &&
      thisPushBox.y < opponentPushBox.y + opponentPushBox.height &&
      thisPushBox.y + thisPushBox.height > opponentPushBox.y
    );
  }

  // Resolver colisão de pushbox (empurrar Fighters)
  resolvePushboxCollision(opponent) {
    if (!this.checkPushboxCollision(opponent)) return;

    // Calcular sobreposição
    const thisCenterX = this.x + this.width / 2;
    const opponentCenterX = opponent.x + opponent.width / 2;
    const distance = Math.abs(thisCenterX - opponentCenterX);
    const minDistance = (this.pushBox.width + opponent.pushBox.width) / 2;
    const overlap = minDistance - distance;

    if (overlap > 0) {
      const pushDistance = overlap / 2;

      // Determinar direção do empurrão
      if (thisCenterX < opponentCenterX) {
        // Este Fighter está à esquerda, empurrar ambos para longe um do outro
        this.x -= pushDistance;
        opponent.x += pushDistance;
      } else {
        // Este Fighter está à direita, empurrar ambos para longe um do outro
        this.x += pushDistance;
        opponent.x -= pushDistance;
      }

      // Garantir que os Fighteres não saem do ecrã
      this.constrainToScreen();
      opponent.constrainToScreen();
    }
  }

  // Manter Fighter dentro dos limites do ecrã
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

  // Reiniciar Fighter para o estado inicial
  reset() {
    this.health = this.maxHealth;
    this.currentHealth = this.health;
    this.x = this.startX;
    this.y = this.groundY;
    this.isAttacking = false;
    this.isJumping = false;
    this.isCrouching = false;
    this.isHit = false;
    this.isDead = false;
    this.setAnimation("stance");
  }

  // Atualizar orientação para sempre olhar para o oponente
  updateFacing(opponent) {
    const shouldFaceRight = opponent.x > this.x;
    const newDirection = shouldFaceRight
      ? FighterDirection.RIGHT
      : FighterDirection.LEFT;

    if (this.direction !== newDirection) {
      this.direction = newDirection;
      this.facing = shouldFaceRight ? "right" : "left";
    }
  }
}

export default Fighter;
