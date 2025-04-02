import Rectangle from './Rectangle';

class Skyline {
  segments: { x: number; y: number; width: number }[];

  constructor(public width: number) {
    this.segments = [{ x: 0, y: 0, width }];
  }

  addRectangle(rect: Rectangle) {
    let index = 0;
    while (index < this.segments.length) {
      const segment = this.segments[index];
      if (segment.x + segment.width > rect.x) {
        if (segment.x >= rect.x + rect.width) {
          break;
        }
        if (segment.y < rect.y + rect.height) {
          if (segment.x < rect.x) {
            this.segments.splice(index, 0, {
              x: segment.x,
              y: segment.y,
              width: rect.x - segment.x,
            });
            index++;
            segment.x = rect.x;
            segment.width -= rect.x - segment.x;
          }
          if (segment.x + segment.width > rect.x + rect.width) {
            this.segments.splice(index + 1, 0, {
              x: rect.x + rect.width,
              y: segment.y,
              width: segment.x + segment.width - (rect.x + rect.width),
            });
            segment.width = rect.x + rect.width - segment.x;
          }
          segment.y = rect.y + rect.height;
        }
      }
      index++;
    }
    this.mergeSegments();
  }

  mergeSegments() {
    let i = 0;
    while (i < this.segments.length - 1) {
      if (this.segments[i].y === this.segments[i + 1].y) {
        this.segments[i].width += this.segments[i + 1].width;
        this.segments.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }

  findPosition(width: number, height: number): Rectangle | null {
    let bestY = Infinity;
    let bestX = 0;
    for (let i = 0; i < this.segments.length; i++) {
      const { width: segmentWidth, y, x } = this.segments[i];
      if (segmentWidth >= width) {
        if (y < bestY) {
          bestY = y;
          bestX = x;
        }
      }
    }
    return bestY !== Infinity
      ? Rectangle.createFromSegment(bestX, bestY, width, height)
      : null;
  }
}

export default Skyline;
