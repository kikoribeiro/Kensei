import { canvas } from "../engine/Canvas.js";

/**
 * Class para criar o background do jogo.
 */
class Background {
  constructor(
    //Variáveis para definir a posição e tamanho do background
    sourceX = 0,
    sourceY = 0,
    sourceWidth = null,
    sourceHeight = null
  ) {
    //Criação da imagem do background
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

  //Desenho do background no canvas
  draw(ctx) {
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
