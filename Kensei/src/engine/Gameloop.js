window.DEBUG_MODE = true;
import Player from "../objects/player.js";
import Background from "../objects/Background.js";
import StatusBar from "../objects/StatusBar.js";
import Enemy from "../objects/Enemy.js";
import { keys, justPressed, resetKeyPress } from "./InputHandler.js";
import { canvas, ctx, clearCanvas, initCanvas } from "./Canvas.js";
import { FighterDirection } from "../constants/fighter.js";

// Game objects
let player, player2;
let background;
let statusBar;
let gameInitialized = false;
let roundOver = false;

// FPS control variables
const FPS = 60;
const frameTime = 1000 / FPS;
let lastFrameTime = 0;

// Loop principal do jogo
export function gameLoop(timestamp) {
  if (!ctx || !canvas) {
    console.log("Canvas or context not ready");
    requestAnimationFrame(gameLoop);
    return;
  }

  // Calculate time since last frame
  const deltaTime = timestamp - lastFrameTime;

  // Only update if enough time has passed for 60 FPS
  if (deltaTime >= frameTime) {
    lastFrameTime = timestamp - (deltaTime % frameTime);

    // Clear canvas
    if (clearCanvas) {
      clearCanvas();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (gameInitialized && background && player) {
      // Update fighters
      player.update(keys, justPressed, player2);
      player2.update({}, {}, player);

      // Handle pushbox collisions between fighters
      if (player && player2) {
        player.resolvePushboxCollision(player2);
      }

      // Update timer
      if (statusBar) {
        statusBar.updateTimer();
        // UPDATE: Sync health from fighters every frame
        statusBar.updateFromFighters(player, player2);
      }

      // Check for attack collisions
      if (player.checkCollision(player2)) {
        if (!player2.isHit) {
          player2.takeHit(10);
          console.log(`Player2 took hit, health now: ${player2.currentHealth}`);
        }
      }

      if (player2.checkCollision(player)) {
        if (!player.isHit) {
          player.takeHit(10);
          console.log(`Player1 took hit, health now: ${player.currentHealth}`);
        }
      }

      // Rest of the game loop...
      background.update();
      background.draw(ctx);
      player.draw(ctx);
      if (player2) {
        player2.draw(ctx);
      }

      if (statusBar) {
        statusBar.draw();
      }

      // Test damage - UPDATE: Damage the fighters directly
      if (keys["d"]) {
        if (player2.currentHealth > 0) {
          player2.currentHealth = Math.max(0, player2.currentHealth - 5);
          console.log(
            `Manual damage to P2, health now: ${player2.currentHealth}`
          );
        }
      }

      if (keys["s"]) {
        if (player.currentHealth > 0) {
          player.currentHealth = Math.max(0, player.currentHealth - 5);
          console.log(
            `Manual damage to P1, health now: ${player.currentHealth}`
          );
        }
      }

      if (keys["r"]) {
        statusBar.resetTimer();
      }
    } else {
      // Draw loading message or debug info
      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Loading game...", canvas.width / 2, canvas.height / 2);

      console.log("Game not initialized:", {
        gameInitialized,
        background: !!background,
        player: !!player,
        canvas: { width: canvas.width, height: canvas.height },
      });
    }

    resetKeyPress();
  }

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
export function startGame() {
  console.log("Starting game...");

  if (gameInitialized) {
    console.log("Game already initialized");
    return;
  }

  // Force canvas initialization
  if (typeof initCanvas === "function") {
    console.log("Initializing canvas...");
    initCanvas();
  }

  // Check if canvas is ready
  if (!canvas || !ctx) {
    console.error("Canvas not ready, retrying in 100ms");
    setTimeout(startGame, 100);
    return;
  }

  console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

  try {
    // Create players
    player = new Player(
      400,
      canvas.height - 250,
      160,
      225,
      FighterDirection.RIGHT
    );
    player2 = new Enemy(
      1500,
      canvas.height - 250,
      160,
      225,
      FighterDirection.LEFT
    );
    player2.setDifficulty("test");

    background = new Background();
    statusBar = new StatusBar();

    gameInitialized = true;
    console.log("Game initialized successfully");

    // Start the game loop if not already running
    if (!window.gameLoopRunning) {
      window.gameLoopRunning = true;
      requestAnimationFrame(gameLoop);
    }
  } catch (error) {
    console.error("Error initializing game:", error);
  }
}

// Ensure proper initialization order
function initializeGame() {
  setTimeout(() => {
    startGame();
  }, 100);
}

// Multiple event listeners to ensure initialization
document.addEventListener("DOMContentLoaded", initializeGame);

// Handle window resize to fix canvas issues
window.addEventListener("resize", () => {
  if (typeof initCanvas === "function") {
    initCanvas();
  }
});
