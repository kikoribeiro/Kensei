export class SpriteManager {
  constructor() {
    this.spriteData = null;
    this.isLoaded = false;
  }

  async loadSpriteData(jsonPath) {
    try {
      const response = await fetch(jsonPath);
      this.spriteData = await response.json();
      this.isLoaded = true;
      console.log("Sprite data loaded successfully");
      return this.spriteData;
    } catch (error) {
      console.error("Failed to load sprite data:", error);
    }
  }

  getFrameData(frameName) {
    if (!this.isLoaded) return null;
    return this.spriteData.frames[frameName];
  }

  getAnimationFrames(prefix) {
    if (!this.isLoaded) return [];

    // Encontra os nomes dos frames que começam com o prefixo
    // e os ordena para garantir a ordem correta dos frames
    const frameNames = Object.keys(this.spriteData.frames)
      .filter((name) => name.startsWith(prefix))
      .sort(); // Sort para garantir a ordem correta

    return frameNames;
  }
}
