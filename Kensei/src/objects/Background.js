import { canvas } from "../engine/Canvas.js";

class Background {
  constructor(
    sourceX = 0,
    sourceY = 0,
    sourceWidth = null,
    sourceHeight = null
  ) {
    this.image = new Image();
    this.image.src = "./assets/backgrounds/Empty_Dojo.png"; // Caminho relativo à raiz do projeto

    // Coordenadas e dimensões da parte da spritesheet a ser usada
    this.sourceX = sourceX; // Posição X inicial na spritesheet
    this.sourceY = sourceY; // Posição Y inicial na spritesheet
    this.sourceWidth = sourceWidth; // Largura da parte a ser usada
    this.sourceHeight = sourceHeight; // Altura da parte a ser usada

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
      if (this.sourceWidth === null) this.sourceWidth = this.image.width;
      if (this.sourceHeight === null) this.sourceHeight = this.image.height;
    };
  }

  draw(ctx) {
    try {
      ctx.drawImage(
        this.image,
        this.sourceX,
        this.sourceY,
        this.sourceWidth,
        this.sourceHeight,
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
