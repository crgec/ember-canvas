export default class Frame {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  static zero() {
    return new Frame(0, 0, 0, 0);
  }
  
  static create(x, y, width, height) {
    return new Frame(x, y, width, height);
  }
  
  clone() {
    return new Frame(this.x, this.y, this.width, this.height);
  }
  
  intersects(otherFrame) {
    return !(otherFrame.x > this.x + this.width ||
           otherFrame.x + otherFrame.width < this.x ||
           otherFrame.y > this.y + this.height ||
           otherFrame.y + otherFrame.height < this.y);
  }
}

export function inset(frame, top, right, bottom, left) {
  let frameCopy = frame.clone();

  // inset(myFrame, 10, 0) => inset(myFrame, 10, 0, 10, 0)
  if (typeof bottom === 'undefined') {
    bottom = top;
    left = right;
  }

  // inset(myFrame, 10) => inset(myFrame, 10, 10, 10, 10)
  if (typeof right === 'undefined') {
    right = bottom = left = top;
  }

  frameCopy.x += left;
  frameCopy.y += top;
  frameCopy.height -= (top + bottom);
  frameCopy.width -= (left + right);

  return frameCopy;
}