export class SpriteManager {
  /**
   * Esta classe irá gerir todos os sprites do jogo.
   * Carrega os dados dos sprites a partir de um ficheiro JSON e permite
   * aceder a frames específicos ou animações baseadas em prefixos.
   */
  constructor() {
    this.spriteData = null;
    this.isLoaded = false;
  }

  // Método para carregar os dados dos sprites a partir de um ficheiro JSON
  async loadSpriteData(jsonPath) {
    const response = await fetch(jsonPath);
    this.spriteData = await response.json();
    this.isLoaded = true;

    return this.spriteData;
  }

  // Método para receber os dados de um frame específico
  // com base no nome do frame
  getFrameData(frameName) {
    return this.spriteData.frames[frameName];
  }

  // Método para receber os frames de uma animação
  getAnimationFrames(prefix) {
    // Encontra todos os frames que começam com o prefixo fornecido
    const frameNames = Object.keys(this.spriteData.frames).filter((name) =>
      name.startsWith(prefix)
    );

    // Função que ordena os frames numericamente e não alfabeticamente
    // Isto é importante para as animações que têm mais que 10 frames,
    // como "special-move-1", "special-move-2", "special-move-11",....
    // fiquem na ordem correta
    // invés de 1, 11, 2, 21,...
    // fica 1, 2, 11, 21, ....

    frameNames.sort((a, b) => {
      // Variaveis para armazenar os números extraídos
      let numA = 0;
      let numB = 0;

      // Extrai os numeros depois do último hífen
      // Exemplo: "special-move-1" -> "1"
      const matchA = a.match(/-(\d+)/);
      const matchB = b.match(/-(\d+)/);

      // Se é encontrado um match, converte para inteiro
      if (matchA && matchA[1]) numA = parseInt(matchA[1], 10);
      if (matchB && matchB[1]) numB = parseInt(matchB[1], 10);

      // Compara os números extraídos
      return numA - numB;
    });

    return frameNames;
  }
}
