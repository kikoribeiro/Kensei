// Variaveis globais para armazenar o estado das teclas
const keys = {};
const justPressed = {};
const justReleased = {};

// Event listener para o keydown e keyup
window.addEventListener("keydown", (e) => {
  if (!keys[e.key]) {
    justPressed[e.key] = true;
  }
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  justReleased[e.key] = true;
});
// Função que reseta o estado das teclas
// e reseta para puder dar outros ataques
function resetKeyPress() {
  for (const key in justPressed) {
    justPressed[key] = false;
  }
  for (const key in justReleased) {
    justReleased[key] = false;
  }
}

export { keys, justPressed, justReleased, resetKeyPress };
