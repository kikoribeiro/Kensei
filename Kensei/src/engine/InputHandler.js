const keys = {};
const justPressed = {};
const justReleased = {};

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

// Call this at the end of each game frame to reset one-time press flags
function resetKeyPress() {
  for (const key in justPressed) {
    justPressed[key] = false;
  }
  for (const key in justReleased) {
    justReleased[key] = false;
  }
}

export { keys, justPressed, justReleased, resetKeyPress };
