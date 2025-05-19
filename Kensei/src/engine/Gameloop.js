import Player from "../objects/player.js";
import Background from "../objects/Background.js";
import HealthBar from "../objects/HealthBar.js";
import FightTimer from "../objects/FightTimer.js";
import { canvas, ctx, clearCanvas, initCanvas } from "./Canvas.js";

// Objeto para rastrear teclas pressionadas
const keys = {};
let player;
let background;
let healthBar1, healthBar2;
let timer;
let gameInitialized = false;
let roundOver = false;

// Configurar eventos de teclado
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Loop principal do jogo
export function gameLoop() {
  if (!ctx) return;

  clearCanvas?.() || ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameInitialized && background && player) {
    background.draw(ctx);
    player.draw(ctx);

    healthBar1.draw();
    healthBar2.draw();
    timer.update();
    timer.draw();

    if (!roundOver) {
      if (timer.remaining <= 0 || healthBar1.currentHealth <= 0 || healthBar2.currentHealth <= 0) {
        endRound();
      }
    }
  }

  // teste temporario (premir D para causar dano no player 2)
if (keys["d"]) {
  healthBar2.decrease(1);
}
/// Continuar o loop do jogo
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
export function startGame() {
  if (gameInitialized) return;

  if (typeof initCanvas === "function") initCanvas();

  try {
    player = new Player(100, 100, 64, 64);
    background = new Background();

    // Cria o HUD
    healthBar1 = new HealthBar(50, 20, 200, 20, 100, "red");
    healthBar2 = new HealthBar(canvas.width - 250, 20, 200, 20, 100, "green");
    timer = new FightTimer(90);

    gameInitialized = true;
    gameLoop();
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
