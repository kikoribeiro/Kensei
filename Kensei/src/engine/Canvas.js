import { gameLoop } from "./Gameloop.js";
let canvas;
let ctx;

//inicialização do canvas e contexto
function initCanvas() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  // função que da rezise ao canvas
  resizeCanvas(false);

  // event listener para resize do canvas
  window.addEventListener("resize", () => resizeCanvas(true));

  return true;
}

// Função para redimensionar o canvas quando necessário
function resizeCanvas(triggerRedraw = false) {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (triggerRedraw) {
      // dá trigger num redraw que basicamente desenha o jogo de novo invés
      // de dar refresh
      requestAnimationFrame(gameLoop);
    }
  }
}

// função que limpa o canvas
function clearCanvas() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Exportar as funções e variáveis
export { canvas, ctx, initCanvas, clearCanvas };
