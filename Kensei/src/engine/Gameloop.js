import Player from "../objects/player.js";
import Background from "../objects/Background.js";
import { canvas, ctx, clearCanvas, initCanvas } from "./Canvas.js";

// Objeto para rastrear teclas pressionadas
const keys = {};
let player;
let background;
let gameInitialized = false;

// Configurar eventos de teclado
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Loop principal do jogo
export function gameLoop() {
  // Use a fallback to get the canvas context if import failed
  const gameCanvas = canvas || document.getElementById("gameCanvas");
  const gameCtx = ctx || (gameCanvas ? gameCanvas.getContext('2d') : null);
  
  // Only clear and draw if we have a context
  if (gameCtx) {
    if (clearCanvas) {
      clearCanvas();
    } else if (gameCtx) {
      gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    }

    // Verificar se o jogo foi inicializado
    if (gameInitialized && background && player) {
      background.draw(gameCtx);
      player.draw(gameCtx);
    }
  } else {
    console.error("Context not available in gameLoop");
  }

  // Continuar o loop
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
export function startGame() {
  // Só inicializa uma vez
  if (gameInitialized) return;
  
  // Initialize canvas if not already done
  if (typeof initCanvas === 'function') {
    initCanvas();
  }

  try {
    // Criar objetos do jogo apenas depois de inicializar o canvas
    player = new Player(100, 100, 64, 64);
    background = new Background(108, 86, 623, 308);
    
    gameInitialized = true;
    gameLoop();
  } catch (error) {
    console.error("Error initializing game:", error);
  }
}

// Garantir que o DOM está carregado antes de iniciar
document.addEventListener("DOMContentLoaded", startGame);
