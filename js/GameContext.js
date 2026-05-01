/**
 * Клас GameContext для централізованого керування станом та налаштуваннями гри.
 */
class GameContext {
  constructor() {
    // Налаштування рендерингу
    this.tile = 0;
    this.ctx = null;
    this.canvas = null;

    // Стан гри
    this.currentLevel = 'easy';
    this.score = 0;
    this.powered = 0;
    this.paused = false;
    this.gameOver = false;
    this.win = false;
    this.currentFps = 60;

    // Об'єкти та ресурси
    this.map = null;
    this.pacman = null;
    this.ghosts = [];
    this.ghostSprites = null;
    this.bonusSprite = null;
  }

  /**
   * Обчислює швидкість Pac-Man з урахуванням FPS.
   */
  get pacSpeed() {
    const fpsFactor = this.currentFps / 60;
    return Config.PAC_BASE_SPEED / fpsFactor;
  }

  /**
   * Обчислює швидкість привидів з урахуванням FPS та рівня складності.
   */
  get ghostSpeed() {
    const fpsFactor = this.currentFps / 60;
    return Config.LEVEL_CONFIGS[this.currentLevel].ghostSpeed / fpsFactor;
  }

  /**
   * Перевіряє, чи активний режим "енерджайзера".
   */
  get isPowered() {
    return this.powered > 0;
  }
}
