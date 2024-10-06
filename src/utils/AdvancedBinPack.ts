import Skyline from './Skyline';

class AdvancedBinPack {
  skyline: Skyline;

  constructor(
    public binWidth: number,
    public binHeight: number,
    public padding: number
  ) {
    this.skyline = new Skyline(binWidth);
  }

  insert(width: number, height: number) {
    const paddedWidth = width + this.padding * 2;
    const paddedHeight = height + this.padding * 2;

    let newNode = this.skyline.findPosition(paddedWidth, paddedHeight);
    if (!newNode) {
      newNode = this.skyline.findPosition(paddedHeight, paddedWidth);
      if (newNode) {
        [newNode.width, newNode.height] = [newNode.height, newNode.width];
      }
    }

    if (newNode) {
      this.skyline.addRectangle(newNode);
      return {
        x: newNode.x + this.padding,
        y: newNode.y + this.padding,
        width: newNode.width - this.padding * 2,
        height: newNode.height - this.padding * 2,
        rotated: newNode.width !== paddedWidth,
      };
    }

    return null;
  }
}

export default AdvancedBinPack;
