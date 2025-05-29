window.DEBUG_MODE = true;
import Player from "../objects/player.js";
import Background from "../objects/Background.js";
import HealthBar from "../objects/HealthBar.js";
import FightTimer from "../objects/FightTimer.js";
import { keys, justPressed, resetKeyPress } from "./InputHandler.js";
import { canvas, ctx, clearCanvas, initCanvas } from "./Canvas.js";

// Game objects
let player, player2;
let background;

const barWidth = 500;
const barHeight = 30;
let healthBar1, healthBar2;
let timer;
let gameInitialized = false;
let roundOver = false;

// FPS control variables
const FPS = 60;
const frameTime = 1000 / FPS;
let lastFrameTime = 0;

// Loop principal do jogo
export function gameLoop(timestamp) {
  if (!ctx) return;

  // Calculate time since last frame
  const deltaTime = timestamp - lastFrameTime;

  // Only update if enough time has passed for 60 FPS
  if (deltaTime >= frameTime) {
    lastFrameTime = timestamp - (deltaTime % frameTime);

    clearCanvas?.() || ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameInitialized && background && player) {
      // Update game objects
      player.update(keys, justPressed);
      if (player2) {
        player2.update({}, {}); // Add player2 controls later
      }
      background.update();

      // Draw everything (no camera transformations)
      background.draw(ctx);
      player.draw(ctx);
      if (player2) {
        player2.draw(ctx);
      }

      // Draw UI elements
      healthBar1.draw();
      healthBar2.draw();
      timer.update();
      timer.draw();

      if (!roundOver) {
        if (
          timer.remaining <= 0 ||
          healthBar1.currentHealth <= 0 ||
          healthBar2.currentHealth <= 0
        ) {
          endRound();
        }
      }
    }

    // teste temporario (premir D para causar dano no player 2)
    if (keys["d"]) {
      healthBar2.decrease(1);
    }

    resetKeyPress();
  }

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
export function startGame() {
  if (gameInitialized) return;

  if (typeof initCanvas === "function") initCanvas();

  try {
    // Create players
    player = new Player(100, canvas.height - 250, 160, 225);
    player2 = new Player(400, canvas.height - 250, 160, 225);

    background = new Background();

    // Cria o HUD
    healthBar1 = new HealthBar(50, 20, barWidth, barHeight, 100, "p1");
    healthBar2 = new HealthBar(
      canvas.width - barWidth - 50,
      20,
      barWidth,
      barHeight,
      100,
      "p2"
    );
    timer = new FightTimer(99);

    gameInitialized = true;
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
  } catch (error) {
    console.error("Error initializing game:", error);
  }
}

function endRound() {
  roundOver = true;

  let message = "Draw!";
  if (healthBar1.currentHealth > healthBar2.currentHealth) {
    message = "Player 1 Wins!";
  } else if (healthBar2.currentHealth > healthBar1.currentHealth) {
    message = "Player 2 Wins!";
  }

  ctx.fillStyle = "yellow";
  ctx.font = "36px Arial";
  ctx.fillText(message, canvas.width / 2 - 100, canvas.height / 2);

  setTimeout(() => {
    healthBar1.reset();
    healthBar2.reset();
    timer.reset();
    roundOver = false;
  }, 3000);
}

// Garantir que o DOM está carregado antes de iniciar
document.addEventListener("DOMContentLoaded", startGame);
