class Game {
  constructor() {
    this.context = new GameContext();
    this.ui = new UIManager(this);
    
    this.lastTime = 0;
    this.fpsHistory = [];
    
    this.context.pacman = new Pacman();
    
    this.context.bonusSprite = SpriteFactory.createBonusSprite();
    this.context.ghostSprites = {
      red: SpriteFactory.createGhostSprite('red'),
      pink: SpriteFactory.createGhostSprite('pink'),
      cyan: SpriteFactory.createGhostSprite('cyan'),
      orange: SpriteFactory.createGhostSprite('orange'),
      blue: SpriteFactory.createGhostSprite('blue')
    };

    this.init();
  }

  async init() {
    try {
      await this.ui.loadComponents();
      this.context.canvas = document.getElementById('game');
      if (!this.context.canvas) {
        throw new Error('Canvas element #game not found after loading components');
      }
      this.context.ctx = this.context.canvas.getContext('2d');
      
      this.initEventListeners();
      this.adaptCanvasSize();
      this.run();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      if (this.ui.appContainer) {
        this.ui.appContainer.innerHTML = `<div style="color: white; text-align: center; padding: 20px;">
          <h3>Помилка завантаження гри</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()">Оновити сторінку</button>
        </div>`;
      }
    }
  }

  initEventListeners() {
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') this.context.pacman.setInput(0, -1);
      if (e.key === 'ArrowDown') this.context.pacman.setInput(0, 1);
      if (e.key === 'ArrowLeft') this.context.pacman.setInput(-1, 0);
      if (e.key === 'ArrowRight') this.context.pacman.setInput(1, 0);
    });

    window.addEventListener('resize', () => this.adaptCanvasSize());
  }

  adaptCanvasSize() {
    const canvas = this.context.canvas;
    if (!canvas) return;
    const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 240);
    const size = Math.max(320, Math.min(maxSize, 760));

    canvas.width = size;
    canvas.height = size;

    const mapWidth = Config.MAPS[this.context.currentLevel][0].length;
    this.context.tile = Math.floor(size / mapWidth);
    if (this.context.tile < 12) this.context.tile = 12;
  }

  start(level) {
    this.context.currentLevel = level;
    this.context.paused = false;
    this.resetGameState();
    this.ui.showGame();
  }

  resetGameState() {
    this.context.map = new GameMap(Config.MAPS[this.context.currentLevel]);
    this.context.pacman.reset();
    this.context.ghosts = this.createGhosts(this.context.currentLevel);
    this.context.score = 0;
    this.context.powered = 0;
    this.context.gameOver = false;
    this.context.win = false;
    this.ui.updateScore(this.context.score);
    this.adaptCanvasSize();
  }

  createGhosts(level) {
    return Config.LEVEL_CONFIGS[level].ghosts.map((color, index) => {
      const pos = Config.GHOST_POSITIONS[index];
      return new Ghost(pos.x, pos.y, color);
    });
  }

  restart() {
    if (this.ui.gameScreen && this.ui.gameScreen.classList.contains('hidden')) {
      this.ui.showGame();
    }
    this.start(this.context.currentLevel);
  }

  togglePause() {
    this.context.paused = !this.context.paused;
  }

  selectLevelTab(level) {
    this.ui.updateTabs(level);
  }

  update(dt) {
    if (this.context.paused || this.context.gameOver || this.context.win) return;

    if (this.context.powered > 0) this.context.powered -= dt;

    this.context.pacman.update(
      dt,
      this.context,
      (points) => {
        this.context.score += points;
        this.ui.updateScore(this.context.score);
      },
      (time) => {
        this.context.powered = time;
      },
      () => {
        this.context.win = true;
      }
    );

    this.context.ghosts.forEach(ghost => {
      ghost.update(
        dt,
        this.context,
        () => {
          this.context.gameOver = true;
        },
        (points) => {
          this.context.score += points;
          this.ui.updateScore(this.context.score);
        }
      );
    });
  }

  draw() {
    const ctx = this.context.ctx;
    const canvas = this.context.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.context.map) {
      this.context.map.draw(ctx, this.context);
    }

    PacmanRenderer.draw(ctx, this.context.pacman, this.context);
    this.context.ghosts.forEach(ghost => ghost.draw(ctx, this.context));

    if (this.context.powered > 0) {
      const blinkAlpha = (Math.sin(this.context.powered * Math.PI * 4) + 1) / 2 * 0.3;
      ctx.fillStyle = `rgba(255, 100, 0, ${blinkAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (this.context.gameOver || this.context.win) {
      this.drawEnd();
    } else if (this.context.paused) {
      this.drawPause();
    }
  }

  drawPause() {
    const ctx = this.context.ctx;
    const canvas = this.context.canvas;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(this.context.tile * 2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
  }

  drawEnd() {
    const ctx = this.context.ctx;
    const canvas = this.context.canvas;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(this.context.tile * 2)}px Arial`;
    ctx.textAlign = 'center';
    
    const text = this.context.win ? 'ТИ ВИГРАВ!' : 'GAME OVER';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.font = `${Math.floor(this.context.tile * 1.2)}px Arial`;
    ctx.fillText(`Рахунок: ${this.context.score}`, canvas.width / 2, canvas.height / 2 + this.context.tile * 2);
  }

  updateFpsCounter(dt) {
    if (dt === 0) return;
    const fps = 1 / dt;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 30) this.fpsHistory.shift();
    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    this.context.currentFps = Math.round(avgFps);
    this.ui.updateFps(this.context.currentFps);
  }

  loop(time) {
    let dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    if (dt > 0.1) dt = 0.016;

    this.update(dt);
    this.draw();
    this.updateFpsCounter(dt);

    requestAnimationFrame((t) => this.loop(t));
  }

  run() {
    this.resetGameState();
    requestAnimationFrame((t) => this.loop(t));
  }
}

const game = new Game();

// Global functions for HTML event handlers
function selectLevelTab(level) {
  if (game.ui.menuScreen) {
    game.selectLevelTab(level);
  }
}

function startGame(level) {
  if (game.ui.menuScreen) {
    game.start(level);
  }
}

function restart() {
  if (game.ui.gameScreen) {
    game.restart();
  }
}

function pauseGame() {
  if (game.ui.gameScreen) {
    game.togglePause();
  }
}

function showMenu() {
  if (game.ui.menuScreen) {
    game.paused = true;
    game.ui.showMenu();
  }
}
