class PacmanRenderer {
  /**
   * Малює Pacman на полотні.
   * @param {CanvasRenderingContext2D} ctx - Контекст малювання.
   * @param {Pacman} pacman - Об'єкт Pacman (стан).
   * @param {GameContext} context - Контекст гри.
   */
  static draw(ctx, pacman, context) {
    const tile = context.tile;
    const cx = pacman.x * tile + tile / 2;
    const cy = pacman.y * tile + tile / 2;
    const radius = Math.max(6, tile * 0.4);
    const directionAngle = Math.atan2(pacman.dirY, pacman.dirX);
    const mouth = pacman.mouth + 0.12;

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, directionAngle + mouth, directionAngle - mouth, false);
    ctx.closePath();
    ctx.fill();
  }
}
