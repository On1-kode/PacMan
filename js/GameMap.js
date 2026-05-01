class GameMap {
  constructor(mapData) {
    this.data = mapData.map(row => row.split(''));
  }

  /**
   * Малює карту на полотні (canvas).
   * @param {CanvasRenderingContext2D} ctx - Контекст малювання 2D.
   * @param {GameContext} context - Контекст гри.
   */
  draw(ctx, context) {
    const tile = context.tile;
    const bonusSprite = context.bonusSprite;
    for (let y = 0; y < this.data.length; y++) {
      for (let x = 0; x < this.data[y].length; x++) {
        const cell = this.data[y][x];
        if (cell === Config.CELL_WALL) {
          ctx.fillStyle = '#0033aa';
          ctx.fillRect(x * tile, y * tile, tile, tile);
        } else if (cell === Config.CELL_DOT) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x * tile + tile / 2, y * tile + tile / 2, Math.max(1, tile * 0.08), 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === Config.CELL_BONUS) {
          if (bonusSprite) {
            const size = Math.floor(tile * 0.8);
            const offset = (tile - size) / 2;
            ctx.drawImage(bonusSprite, x * tile + offset, y * tile + offset, size, size);
          }
        }
      }
    }
  }

  canMove(x, y) {
    return this.data[y] && this.data[y][x] !== Config.CELL_WALL;
  }

  countRemainingDots() {
    let count = 0;
    for (let y = 0; y < this.data.length; y++) {
      for (let x = 0; x < this.data[y].length; x++) {
        const cell = this.data[y][x];
        if (cell === Config.CELL_DOT || cell === Config.CELL_BONUS) {
          count++;
        }
      }
    }
    return count;
  }

  getCell(x, y) {
    return this.data[y] ? this.data[y][x] : null;
  }

  setCell(x, y, value) {
    if (this.data[y]) this.data[y][x] = value;
  }
}
