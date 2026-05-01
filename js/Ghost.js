class Ghost {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.progress = 0;
  }

  update(dt, context, onGameOver, onEaten) {
    this.progress += context.ghostSpeed * dt;
    if (this.progress >= 1) {
      this.progress = 0;

      let dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ].filter(d => context.map.canMove(this.x + d.dx, this.y + d.dy));

      let best;

      // Різна поведінка
      if (this.color === 'red') {
        best = dirs.sort((a, b) => {
          let da = Math.abs(this.x + a.dx - context.pacman.x) + Math.abs(this.y + a.dy - context.pacman.y);
          let db = Math.abs(this.x + b.dx - context.pacman.x) + Math.abs(this.y + b.dy - context.pacman.y);
          return da - db;
        })[0];
      } else {
        best = dirs[Math.floor(Math.random() * dirs.length)];
      }

      if (best) {
        this.x += best.dx;
        this.y += best.dy;
      }

      if (this.x === context.pacman.x && this.y === context.pacman.y) {
        if (context.isPowered) {
          this.x = 10;
          this.y = 9;
          onEaten(10);
        } else {
          onGameOver();
        }
      }
    }
  }

  draw(ctx, context) {
    const isPowered = context.isPowered;
    const sprite = isPowered ? context.ghostSprites.blue : context.ghostSprites[this.color];
    if (sprite) {
      const tile = context.tile;
      const size = Math.floor(tile * 0.85);
      const offset = (tile - size) / 2;
      ctx.drawImage(sprite, this.x * tile + offset, this.y * tile + offset, size, size);
    }
  }
}
