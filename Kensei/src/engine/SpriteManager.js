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

    // Sort frames numerically - improved version
    frameNames.sort((a, b) => {
      // Extract frame numbers more reliably
      let numA = 0;
      let numB = 0;

      // Extract numbers after the dash
      const matchA = a.match(/-(\d+)/);
      const matchB = b.match(/-(\d+)/);

      // If we found matches, parse them as integers
      if (matchA && matchA[1]) numA = parseInt(matchA[1], 10);
      if (matchB && matchB[1]) numB = parseInt(matchB[1], 10);

      // Compare numerically
      return numA - numB;
    });

    // Debug the sorted order
    console.log(`Sorted ${prefix} frames:`, frameNames);

    return frameNames;
  }
}
