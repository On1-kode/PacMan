class Pacman {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 1;
    this.y = 1;
    this.dx = 0;
    this.dy = 0;
    this.nextDx = 0;
    this.nextDy = 0;
    this.dirX = 1;
    this.dirY = 0;
    this.progress = 0;
    this.mouth = 0;
    this.mouthDir = 1;
  }

  update(dt, context, onScore, onPower, onWin) {
    this.mouth += dt * 6 * this.mouthDir;
    if (this.mouth > 0.3) {
      this.mouth = 0.3;
      this.mouthDir = -1;
    } else if (this.mouth < 0) {
      this.mouth = 0;
      this.mouthDir = 1;
    }

    this.progress += context.pacSpeed * dt;
    if (this.progress >= 1) {
      this.progress = 0;

      if (context.map.canMove(this.x + this.nextDx, this.y + this.nextDy)) {
        this.dx = this.nextDx;
        this.dy = this.nextDy;
      }

      if (context.map.canMove(this.x + this.dx, this.y + this.dy)) {
        this.x += this.dx;
        this.y += this.dy;
        this.dirX = this.dx || this.dirX;
        this.dirY = this.dy || this.dirY;

        // Телепорт
        if (this.x < 0) this.x = 19;
        if (this.x > 19) this.x = 0;

        let cell = context.map.getCell(this.x, this.y);
        if (cell === Config.CELL_DOT) onScore(1);
        if (cell === Config.CELL_BONUS) {
          onPower(5);
          onScore(5);
        }

        context.map.setCell(this.x, this.y, Config.CELL_EMPTY);

        if (context.map.countRemainingDots() === 0) {
          onWin();
        }
      }
    }
  }

  setInput(dx, dy) {
    this.nextDx = dx;
    this.nextDy = dy;
    this.dirX = dx;
    this.dirY = dy;
  }
}
