import { gameLoop } from './engine/Gameloop.js';

window.onload = () => {
  requestAnimationFrame(gameLoop);
};
