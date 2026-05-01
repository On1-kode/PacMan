class SpriteFactory {
  static createSpriteCanvas(width, height) {
    const sprite = document.createElement('canvas');
    sprite.width = width;
    sprite.height = height;
    return sprite;
  }

  static createGhostSprite(color) {
    const sprite = this.createSpriteCanvas(64, 64);
    const ctx = sprite.getContext('2d');
    const bodyColor = color === 'blue' ? '#3C9CFF' : color;

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(14, 44);
    ctx.lineTo(14, 28);
    ctx.arc(32, 28, 18, Math.PI, 0, false);
    ctx.lineTo(50, 44);
    ctx.quadraticCurveTo(46, 56, 38, 48);
    ctx.quadraticCurveTo(32, 56, 26, 48);
    ctx.quadraticCurveTo(18, 56, 14, 44);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(23, 28, 7, 0, Math.PI * 2);
    ctx.arc(41, 28, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2A4D9A';
    ctx.beginPath();
    ctx.arc(23, 30, 3.5, 0, Math.PI * 2);
    ctx.arc(41, 30, 3.5, 0, Math.PI * 2);
    ctx.fill();

    return sprite;
  }

  static createBonusSprite() {
    const sprite = this.createSpriteCanvas(64, 64);
    const ctx = sprite.getContext('2d');

    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath();
    ctx.arc(32, 36, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#83c242';
    ctx.beginPath();
    ctx.ellipse(22, 20, 8, 4, -0.8, 0, Math.PI * 2);
    ctx.ellipse(36, 18, 8, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffe3e3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(28, 32, 5, Math.PI * 1.1, Math.PI * 1.8);
    ctx.stroke();

    return sprite;
  }
}
