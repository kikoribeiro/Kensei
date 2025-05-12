import { canvas } from "../engine/Canvas.js";

class Background {
  constructor(
    sourceX = 0,
    sourceY = 0,
    sourceWidth = null,
    sourceHeight = null
  ) {
    this.image = new Image();
    this.image.src = "./assets/backgrounds/Empty_Dojo.png";
    this.imageLoaded = false;

    // Usar posição 0,0 para ocupar toda a tela
    this.x = 0;
    this.y = 0;

    // Usar o tamanho total do canvas
    if (canvas) {
      this.width = canvas.width;
      this.height = canvas.height;
    } else {
      // Valor padrão caso o canvas não esteja disponível ainda
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    this.image.onload = () => {
      this.imageLoaded = true;
    };
  }

  draw(ctx) {
    try {
      ctx.drawImage(
        this.image,
        0,
        0, 
        this.image.width, 
        this.image.height,
        this.x, 
        this.y,
        this.width,
        this.height
      );
    } catch (error) {
      console.error("Error drawing background:", error);
    }
  }

  update() {
    // Atualizar as dimensões para usar sempre o tamanho total do canvas
    if (canvas) {
      this.width = canvas.width;
      this.height = canvas.height;
    }
  }
}

export default Background;
