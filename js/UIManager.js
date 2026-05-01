class UIManager {
  constructor(game) {
    this.game = game;
    this.appContainer = document.getElementById('app');
    if (!this.appContainer) {
      console.error('Critical Error: <div id="app"> not found in index.html');
    }
    this.scoreEl = null;
    this.fpsEl = null;
    this.menuScreen = null;
    this.gameScreen = null;
    this.tabButtons = [];
    this.tabPanels = [];
  }

  async loadComponents() {
    if (!this.appContainer) {
      throw new Error('<div id="app"> is missing');
    }
    const [menuHtml, gameHtml] = await Promise.all([
      fetch('components/menu.html').then(r => {
        if (!r.ok) throw new Error(`Failed to load menu component: ${r.statusText}`);
        return r.text();
      }),
      fetch('components/game.html').then(r => {
        if (!r.ok) throw new Error(`Failed to load game component: ${r.statusText}`);
        return r.text();
      })
    ]);

    this.appContainer.innerHTML = menuHtml + gameHtml;
    this.initElements();
  }

  initElements() {
    this.scoreEl = document.getElementById('score');
    this.fpsEl = document.getElementById('fps');
    this.menuScreen = document.querySelector('.menu-screen');
    this.gameScreen = document.querySelector('.game-screen');
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabPanels = document.querySelectorAll('.tab-panel');
  }

  updateScore(score) {
    if (this.scoreEl) this.scoreEl.textContent = score;
  }

  updateFps(fps) {
    if (this.fpsEl) this.fpsEl.textContent = `FPS: ${fps}`;
  }

  showMenu() {
    if (this.menuScreen && this.gameScreen) {
      this.menuScreen.classList.remove('hidden');
      this.gameScreen.classList.add('hidden');
    }
  }

  showGame() {
    if (this.menuScreen && this.gameScreen) {
      this.menuScreen.classList.add('hidden');
      this.gameScreen.classList.remove('hidden');
    }
  }

  updateTabs(selectedLevel) {
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === selectedLevel);
    });
    this.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${selectedLevel}`);
    });
  }
}
