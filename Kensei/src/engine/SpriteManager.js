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

      return this.spriteData;
    } catch (error) {
      console.error("Failed to load sprite data:", error);
    }
  }

  getFrameData(frameName) {
    if (!this.isLoaded || !this.spriteData.frames[frameName]) {
      return null;
    }
    return this.spriteData.frames[frameName];
  }

  getAnimationFrames(prefix) {
    if (!this.isLoaded) {
      return [];
    }

    // Find all frames that match the prefix
    const frameNames = Object.keys(this.spriteData.frames).filter((name) =>
      name.startsWith(prefix)
    );

    // Sort frames numerically
    frameNames.sort((a, b) => {
      // Extract the numeric part from between "-" and ".png" using a regex
      const numA = parseInt(a.match(/-(\d+)\.png$/)?.[1]);
      const numB = parseInt(b.match(/-(\d+)\.png$/)?.[1]);

      return numA - numB;
    });

    // Debug the sorted order
    console.log(`Sorted ${prefix} frames:`, frameNames);

    return frameNames;
  }
}
