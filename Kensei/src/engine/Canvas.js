import { gameLoop } from "./Gameloop.js";
let canvas;
let ctx;

function initCanvas() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  // Make canvas fill the entire page
  resizeCanvas(false);

  // Add event listener to resize canvas when window size changes
  window.addEventListener("resize", () => resizeCanvas(true));

  return true;
}

function resizeCanvas(triggerRedraw = false) {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (triggerRedraw) {
      // Just trigger a redraw instead of restarting the game
      requestAnimationFrame(gameLoop);
    }
  }
}

function clearCanvas() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Exportar as funções e variáveis
export { canvas, ctx, initCanvas, clearCanvas };