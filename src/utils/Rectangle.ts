class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  static createFromSegment(x: number, y: number, w: number, h: number) {
    return new Rectangle(x, y, w, h);
  }
}

export default Rectangle;
