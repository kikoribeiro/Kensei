window.DEBUG_MODE = true;
//imports da pasta dos objetos
import Player from "../objects/player.js";
import Background from "../objects/Background.js";
import StatusBar from "../objects/StatusBar.js";
import Enemy from "../objects/Enemy.js";

//input handler
import { keys, justPressed,resetKeyPress } from "./InputHandler.js";
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

// Controlo de FPS para manter 60 FPS constantemente
const FPS = 60;
const frameTime = 1000 / FPS;
// Variável para armazenar o tempo do último frame para calcular deltaTime
// deltaTime é o tempo entre frames
let lastFrameTime = 0;

// Loop principal do jogo
export function gameLoop(timestamp) {
  // Calcular deltaTime
  const deltaTime = timestamp - lastFrameTime;

  // Só atualizar o jogo se o deltaTime for maior ou igual ao frameTime
  // Isto garante que o jogo não atualize mais do que 60 vezes por segundo(60FPS)
  if (deltaTime >= frameTime) {
    lastFrameTime = timestamp - (deltaTime % frameTime);

    // Limpar o canvas
    if (clearCanvas) {
      clearCanvas();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (gameInitialized && background && player) {
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
        // Atualização da barra de vida dos Fighters
        statusBar.updateFromFighters(player, player2);
      }

      // Verificação de colisão entre Fighters e de dano
      if (player.checkCollision(player2)) {
        if (!player2.isHit) {
          // Cada golpe causa 10 de dano
          player2.takeHit(10);
          console.log(`Player2 took hit, health now: ${player2.currentHealth}`);
        }
      }
      //Mesma situação para o player1
      if (player2.checkCollision(player)) {
        if (!player.isHit) {
          player.takeHit(10);
          console.log(`Player1 took hit, health now: ${player.currentHealth}`);
        }
      }

      // Desenhar o Background, Fighters e a statusBar
      background.update();
      background.draw(ctx);
      player.draw(ctx);
      if (player2) {
        player2.draw(ctx);
      }

      if (statusBar) {
        statusBar.draw();
      }
    }
  }

  resetKeyPress();
  // Atualizar o loop do jogo
  // Usar requestAnimationFrame para manter o loop
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
export function startGame() {
  // Forçar a inicialização do canvas
  if (typeof initCanvas === "function") {
    initCanvas();
  }

  // Variáveis para puder conseguir criar os jogadores dinamicamente
  // dependendo do tamanho do canvas(ou seja resolução do ecrã do utilizador)
  const playerWidth = 160;
  const playerHeight = 225;
  const groundOffset = 250;

  // estas constantes calculam a posição dos jogadores
  // dependendo do tamanho do canvas
  const player1X = canvas.width * 0.2; // 20% da margem esquerda
  const player2X = canvas.width * 0.8 - playerWidth; // 80% da esquerda menos a largura do jogador
  // Posição Y dos jogadores, para estarem no chão
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

  // Configuarção do player2(Enemy), para a sua dificuldade de jogo
  player2.setDifficulty("test");

  // Criação do background e da barra de status
  background = new Background();
  statusBar = new StatusBar();

  //Variavel para controlar se o jogo já foi inicializado
  gameInitialized = true;

  // Começar o loop do jogo
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

  // Listen for spacebar to start the game
  document.addEventListener("keydown", function onStartKey(e) {
    if (e.code === "Space") {
      e.preventDefault();
      document.removeEventListener("keydown", onStartKey);

      // Hide start screen
      if (startScreen) startScreen.style.display = "none";

      // Start game
      startGame();
    }
  });
});

