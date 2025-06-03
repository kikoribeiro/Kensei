window.DEBUG_MODE = true;
//imports da pasta dos objetos
import Player from "../objects/Player.js";
import Background from "../objects/Background.js";
import StatusBar from "../objects/StatusBar.js";
import Enemy from "../objects/Enemy.js";

//input handler
import { keys, justPressed, resetKeyPress } from "./InputHandler.js";
//canvas
import { canvas, ctx, clearCanvas, initCanvas } from "./Canvas.js";
//constantes
import { FighterDirection } from "../constants/fighter.js";

// Objetos do jogo e
// Variáveis globais
let player, player2;
let background;
let statusBar;
let gameInitialized = false;
let roundOver = false;
let gameEnded = false; // Nova variável para controlar se o jogo terminou
let winner = null; // Armazenar o vencedor

let ambientAudio = null;
let attackAudio = null;
let victoryAudio = null;

// Controlo de FPS para manter 60 FPS constantemente
const FPS = 60;
const frameTime = 1000 / FPS;
let lastFrameTime = 0;

// Loop principal do jogo
export function gameLoop(timestamp) {
  // Calcular deltaTime
  const deltaTime = timestamp - lastFrameTime;

  if (deltaTime >= frameTime) {
    lastFrameTime = timestamp - (deltaTime % frameTime);

    // Limpar o canvas
    if (clearCanvas) {
      clearCanvas();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (gameInitialized && background && player) {
      // Se o jogo não terminou, atualizar normalmente
      if (!gameEnded) {
        // Atualizar players
        player.update(keys, justPressed, player2);
        player2.update({}, {}, player);

        // Verificação de colisão de pushbox entre Fighters
        if (player && player2) {
          player.resolvePushboxCollision(player2);
        }

        // Atualização do contador de tempo
        if (statusBar) {
          statusBar.updateTimer();
          statusBar.updateFromFighters(player, player2);
        }

        // Verificação de colisão entre Fighters e de dano
        if (player.checkCollision(player2)) {
          if (!player2.isHit) {
            player2.takeHit(10);
          }
        }

        if (player2.checkCollision(player)) {
          if (!player.isHit) {
            player.takeHit(10);
          }
        }

        // Verificar condições de fim de jogo
        checkGameEnd();
      }

      // Desenhar sempre (mesmo quando o jogo terminou)
      background.update();
      background.draw(ctx);
      player.draw(ctx);
      if (player2) {
        player2.draw(ctx);
      }

      if (statusBar) {
        statusBar.draw();
      }

      // Se o jogo terminou, desenhar mensagem de vitória
      if (gameEnded && winner) {
        drawVictoryMessage();
      }
    }
    resetKeyPress();
  }

  requestAnimationFrame(gameLoop);
}

// Função para verificar se o jogo terminou
function checkGameEnd() {
  if (player.isDead || player2.isDead || statusBar.isTimeUp()) {
    endGame();
  }
}

// Função para terminar o jogo
function endGame() {
  if (gameEnded) return; // Evitar chamar múltiplas vezes

  gameEnded = true;

  // PARAR MÚSICA DE AMBIENTE
  if (ambientAudio) {
    ambientAudio.pause();
    ambientAudio.currentTime = 0;
  }

  // Determinar vencedor
  if (player.isDead && !player2.isDead) {
    winner = "ENEMY";
    // Player 2 (Enemy) faz animação de vitória
    player2.setAnimation("victory");
    // Player 1 faz animação de derrota
    player.setAnimation("dead");
  } else if (player2.isDead && !player.isDead) {
    winner = "RYU";
    // Player 1 faz animação de vitória
    player.setAnimation("victory");
    // Player 2 faz animação de derrota
    player2.setAnimation("dead");
  } else if (statusBar.isTimeUp()) {
    // Vence quem tem mais vida
    if (player.health > player2.health) {
      winner = "RYU";
      player.setAnimation("victory");
      player2.setAnimation("dead");
    } else if (player2.health > player.health) {
      winner = "ENEMY";
      player2.setAnimation("victory");
      player.setAnimation("dead");
    } else {
      winner = "EMPATE";
      // Ambos fazem animação stance em caso de empate
      player.setAnimation("stance");
      player2.setAnimation("stance");
    }
  }

  // TOCAR SOM DE VITÓRIA
  if (victoryAudio && winner !== "EMPATE") {
    victoryAudio.currentTime = 0;
    victoryAudio.play().catch((e) => {
      console.warn("Não foi possível tocar o som de vitória:", e);
    });
  }

  console.log(`Vencedor: ${winner}`);

  // Opcional: Reiniciar jogo após alguns segundos
  setTimeout(() => {
    showRestartMessage();
  }, 3000);
}

// Função para desenhar a mensagem de vitória
function drawVictoryMessage() {
  ctx.save();

  // Fundo semi-transparente
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configurar texto principal
  ctx.font = "bold 80px Arial";
  ctx.fillStyle = "#FFD700"; // Dourado
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";

  // Sombra do texto
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Desenhar texto principal
  const mainText = `${winner} WINS!`;
  const textY = canvas.height / 2 - 50;

  // Contorno preto
  ctx.strokeText(mainText, canvas.width / 2, textY);
  // Preenchimento dourado
  ctx.fillText(mainText, canvas.width / 2, textY);

  // Texto secundário
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 5;

  ctx.strokeText("VICTORY!", canvas.width / 2, textY + 80);
  ctx.fillText("VICTORY!", canvas.width / 2, textY + 80);

  ctx.restore();
}

// Função para mostrar mensagem de reinício
function showRestartMessage() {
  ctx.save();

  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 5;

  const restartText = "Pressiona ESPAÇO para jogar novamente";
  const restartY = canvas.height / 2 + 150;

  ctx.strokeText(restartText, canvas.width / 2, restartY);
  ctx.fillText(restartText, canvas.width / 2, restartY);

  ctx.restore();

  // Adicionar listener para reiniciar
  document.addEventListener("keydown", handleRestart);
}

// Função para reiniciar o jogo
function handleRestart(e) {
  if (e.code === "Space") {
    e.preventDefault();
    document.removeEventListener("keydown", handleRestart);

    // Reiniciar variáveis do jogo
    gameEnded = false;
    winner = null;
    roundOver = false;

    // Reiniciar jogadores
    if (player) {
      player.health = 100;
      player.currentHealth = 100;
      player.isDead = false;
      player.isHit = false;
      player.isAttacking = false;
      player.setAnimation("stance");
    }

    if (player2) {
      player2.health = 100;
      player2.currentHealth = 100;
      player2.isDead = false;
      player2.isHit = false;
      player2.isAttacking = false;
      player2.setAnimation("stance");
    }

    // Reiniciar timer
    if (statusBar) {
      statusBar.resetTimer();
    }

    // PARAR SOM DE VITÓRIA E REINICIAR MÚSICA DE AMBIENTE
    if (victoryAudio) {
      victoryAudio.pause();
      victoryAudio.currentTime = 0;
    }

    if (ambientAudio) {
      ambientAudio.currentTime = 0;
      ambientAudio.play().catch((e) => {
        console.warn("Não foi possível tocar o áudio:", e);
      });
    }

    // REINICIAR SOM DE ATAQUE
    if (attackAudio) {
      attackAudio.currentTime = 0;
    }
  }
}

// Iniciar o jogo
export function startGame() {
  // Forçar a inicialização do canvas
  if (typeof initCanvas === "function") {
    initCanvas();
  }

  // CARREGAR E TOCAR ÁUDIO DE AMBIENTE
  if (!ambientAudio) {
    ambientAudio = new Audio("./assets/audios/ambiente.wav");
    ambientAudio.loop = true; // Repetir infinitamente
    ambientAudio.volume = 0.3; // Volume baixo para não incomodar (0.0 a 1.0)

    // Tocar quando estiver carregado
    ambientAudio.addEventListener("canplaythrough", () => {
      ambientAudio.play().catch((e) => {});
    });
  } else {
    // Se já existe, apenas tocar
    ambientAudio.currentTime = 0; // Recomeçar do início
    ambientAudio.play().catch((e) => {});
  }

  // CARREGAR SOM DE ATAQUE E TORNAR GLOBAL
  if (!attackAudio) {
    attackAudio = new Audio("./assets/audios/2AH.wav");
    attackAudio.volume = 0.5;
    window.attackAudio = attackAudio; // TORNAR GLOBAL
  }

  // CARREGAR SOM DE VITÓRIA
  if (!victoryAudio) {
    victoryAudio = new Audio("./assets/audios/A0H.wav");
    victoryAudio.volume = 0.7;
  }

  // Variáveis para puder conseguir criar os jogadores dinamicamente
  const playerWidth = 160;
  const playerHeight = 225;
  const groundOffset = 250;

  const player1X = canvas.width * 0.2;
  const player2X = canvas.width * 0.8 - playerWidth;
  const playerY = canvas.height - groundOffset;

  // Criação dos players(Fighters)
  player = new Player(
    player1X,
    playerY,
    playerWidth,
    playerHeight,
    FighterDirection.RIGHT
  );

  player2 = new Enemy(
    player2X,
    playerY,
    playerWidth,
    playerHeight,
    FighterDirection.LEFT
  );

  player2.setDifficulty("hard");

  background = new Background();
  statusBar = new StatusBar();

  gameInitialized = true;

  if (!window.gameLoopRunning) {
    window.gameLoopRunning = true;
    requestAnimationFrame(gameLoop);
  }
}

// função para inicializar o jogo de forma assíncrona
function initializeGame() {
  setTimeout(() => {
    startGame();
  }, 100);
}

// Handler para redimensionar o canvas quando a janela for redimensionada
window.addEventListener("resize", () => {
  if (typeof initCanvas === "function") {
    initCanvas();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");

  document.addEventListener("keydown", function onStartKey(e) {
    if (e.code === "Space") {
      e.preventDefault();
      document.removeEventListener("keydown", onStartKey);

      if (startScreen) startScreen.style.display = "none";

      startGame();
    }
  });
});
