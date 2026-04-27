const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const fpsEl = document.getElementById('fps');

// Адаптивні змінні
let tile = 20;
let lastTime = 0;
let paused = true;
let fpsHistory = [];
let currentFps = 60;
let targetFps = 60;

const PAC_BASE_SPEED = 6;
let GHOST_BASE_SPEED = 4;
let PAC_SPEED = PAC_BASE_SPEED;
let GHOST_SPEED = GHOST_BASE_SPEED;

const maps = {
  easy: [
    "11111111111111111111",
    "10000000000000000001",
    "10111101111101111101",
    "10200001000001000001",
    "10101101011101011101",
    "10001000000001000001",
    "11101011111101011111",
    "10000010000000000001",
    "10111110111111111001",
    "10000000000000000001",
    "10111111111111111001",
    "10000000000000000001",
    "10111111111111111001",
    "10000000000000000001",
    "10101110111101011101",
    "10100000100001000001",
    "10111111101101111101",
    "20000000001100000002",
    "11111111111111111111"
  ],
  normal: [
    "11111111111111111111",
    "20000000001100000002",
    "10111111101101111101",
    "10100000100001000001",
    "10101110111101011101",
    "10001000000001000001",
    "11101011111101011111",
    "00000010000000000000",
    "10111110111111111001",
    "10000000000000000001",
    "10111111111111111001",
    "00000000000000000000",
    "11101111111111101111",
    "10001000000001000001",
    "10101110111101011101",
    "10100000100001000001",
    "10111111101101111101",
    "20000000001100000002",
    "11111111111111111111"
  ],
  hard: [
    "11111111111111111111",
    "12000110000001100021",
    "10111110111111101101",
    "10100000100001000001",
    "10101110111101011101",
    "10100000000001000001",
    "10101111101111011101",
    "10000010000000000001",
    "10111110111111111001",
    "10000000000000000001",
    "10111111111111111001",
    "10000001000001000001",
    "10101111101111011101",
    "10100000100001000001",
    "10111110111101111101",
    "10000000000001000001",
    "10111111101101111101",
    "10000000001100000001",
    "11111111111111111111"
  ]
};

const levelConfigs = {
  easy: { ghostSpeed: 3.2, ghosts: ['red', 'pink'], label: 'Легкий' },
  normal: { ghostSpeed: 4.2, ghosts: ['red', 'pink', 'cyan', 'orange'], label: 'Середній' },
  hard: { ghostSpeed: 5.2, ghosts: ['red', 'pink', 'cyan', 'orange', 'blue'], label: 'Важкий' }
};

let map, pac, ghosts, score, powered, gameOver, win;
let bonusSprite;
let ghostSprites = {};
let selectedLevel = 'normal';
let currentLevel = 'normal';
GHOST_BASE_SPEED = levelConfigs.normal.ghostSpeed;

function mapStringToArray(mapStrings) {
  return mapStrings.map(row => row.split(''));
}

// Адаптація розміру поля до вікна браузера
function adaptCanvasSize() {
  const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 240);
  const size = Math.max(320, Math.min(maxSize, 760));

  canvas.width = size;
  canvas.height = size;

  const mapWidth = maps[currentLevel][0].length;
  tile = Math.floor(size / mapWidth);
  if (tile < 12) tile = 12;

  // Адаптація швидкостей залежно від fps
  const fpsFactor = currentFps / 60;
  PAC_SPEED = PAC_BASE_SPEED / fpsFactor;
  GHOST_SPEED = GHOST_BASE_SPEED / fpsFactor;
}

function init() {
  map = mapStringToArray(maps[currentLevel]);
  pac = {
    x: 1,
    y: 1,
    dx: 0,
    dy: 0,
    nextDx: 0,
    nextDy: 0,
    dirX: 1,
    dirY: 0,
    progress: 0,
    mouth: 0,
    mouthDir: 1
  };
  ghosts = getLevelGhosts(currentLevel);
  score = 0;
  powered = 0;
  gameOver = false;
  win = false;
  scoreEl.textContent = score;
}

function createSpriteCanvas(width, height) {
  const sprite = document.createElement('canvas');
  sprite.width = width;
  sprite.height = height;
  return sprite;
}

function createGhostSprite(color) {
  const sprite = createSpriteCanvas(64, 64);
  const ctx2 = sprite.getContext('2d');
  const bodyColor = color === 'blue' ? '#3C9CFF' : color;

  ctx2.fillStyle = bodyColor;
  ctx2.beginPath();
  ctx2.moveTo(14, 44);
  ctx2.lineTo(14, 28);
  ctx2.arc(32, 28, 18, Math.PI, 0, false);
  ctx2.lineTo(50, 44);
  ctx2.quadraticCurveTo(46, 56, 38, 48);
  ctx2.quadraticCurveTo(32, 56, 26, 48);
  ctx2.quadraticCurveTo(18, 56, 14, 44);
  ctx2.closePath();
  ctx2.fill();

  ctx2.fillStyle = 'white';
  ctx2.beginPath();
  ctx2.arc(23, 28, 7, 0, Math.PI * 2);
  ctx2.arc(41, 28, 7, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.fillStyle = '#2A4D9A';
  ctx2.beginPath();
  ctx2.arc(23, 30, 3.5, 0, Math.PI * 2);
  ctx2.arc(41, 30, 3.5, 0, Math.PI * 2);
  ctx2.fill();

  return sprite;
}

function createBonusSprite() {
  const sprite = createSpriteCanvas(64, 64);
  const ctx2 = sprite.getContext('2d');

  ctx2.fillStyle = '#ff3b3b';
  ctx2.beginPath();
  ctx2.arc(32, 36, 14, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.fillStyle = '#83c242';
  ctx2.beginPath();
  ctx2.ellipse(22, 20, 8, 4, -0.8, 0, Math.PI * 2);
  ctx2.ellipse(36, 18, 8, 4, -0.2, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.strokeStyle = '#ffe3e3';
  ctx2.lineWidth = 3;
  ctx2.beginPath();
  ctx2.arc(28, 32, 5, Math.PI * 1.1, Math.PI * 1.8);
  ctx2.stroke();

  return sprite;
}

function setupSprites() {
  bonusSprite = createBonusSprite();
  ghostSprites = {
    red: createGhostSprite('red'),
    pink: createGhostSprite('pink'),
    cyan: createGhostSprite('cyan'),
    orange: createGhostSprite('orange'),
    blue: createGhostSprite('blue')
  };
}

function getLevelGhosts(level) {
  const positions = [
    { x: 18, y: 1 },
    { x: 18, y: 17 },
    { x: 1, y: 17 },
    { x: 10, y: 9 },
    { x: 1, y: 1 }
  ];
  return levelConfigs[level].ghosts.map((color, index) => ({
    x: positions[index].x,
    y: positions[index].y,
    color,
    progress: 0
  }));
}

function updateTabs() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === selectedLevel);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${selectedLevel}`);
  });
}

function selectLevelTab(level) {
  selectedLevel = level;
  updateTabs();
}

function showMenu() {
  paused = true;
  document.querySelector('.menu-screen').classList.remove('hidden');
  document.querySelector('.game-screen').classList.add('hidden');
}

function showGameScreen() {
  document.querySelector('.menu-screen').classList.add('hidden');
  document.querySelector('.game-screen').classList.remove('hidden');
}

function startGame(level = selectedLevel) {
  selectedLevel = level;
  currentLevel = level;
  GHOST_BASE_SPEED = levelConfigs[level].ghostSpeed;
  paused = false;
  init();
  showGameScreen();
}

function restart() {
  if (document.querySelector('.game-screen').classList.contains('hidden')) {
    showGameScreen();
  }
  startGame(currentLevel);
}

function pauseGame() {
  paused = !paused;
}

function canMove(x, y) {
  return map[y] && map[y][x] !== '1';
}

function remainingDots() {
  let count = 0;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === '0' || map[y][x] === '2') {
        count++;
      }
    }
  }
  return count;
}

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === '1') {
        ctx.fillStyle = '#0033aa';
        ctx.fillRect(x * tile, y * tile, tile, tile);
      } else if (map[y][x] === '0') {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x * tile + tile / 2, y * tile + tile / 2, Math.max(1, tile * 0.08), 0, Math.PI * 2);
        ctx.fill();
      } else if (map[y][x] === '2') {
        if (bonusSprite) {
          const size = Math.floor(tile * 0.8);
          const offset = (tile - size) / 2;
          ctx.drawImage(bonusSprite, x * tile + offset, y * tile + offset, size, size);
        }
      }
    }
  }
}

function drawPac() {
  const cx = pac.x * tile + tile / 2;
  const cy = pac.y * tile + tile / 2;
  const radius = Math.max(6, tile * 0.4);
  const directionAngle = Math.atan2(pac.dirY, pac.dirX);
  const mouth = pac.mouth + 0.12;

  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, directionAngle + mouth, directionAngle - mouth, false);
  ctx.closePath();
  ctx.fill();
}

function drawGhosts() {
  ghosts.forEach(g => {
    const sprite = powered > 0 ? ghostSprites.blue : ghostSprites[g.color];
    if (sprite) {
      const size = Math.floor(tile * 0.85);
      const offset = (tile - size) / 2;
      ctx.drawImage(sprite, g.x * tile + offset, g.y * tile + offset, size, size);
    }
  });
}

function updatePac(dt) {
  pac.mouth += dt * 6 * pac.mouthDir;
  if (pac.mouth > 0.3) {
    pac.mouth = 0.3;
    pac.mouthDir = -1;
  } else if (pac.mouth < 0) {
    pac.mouth = 0;
    pac.mouthDir = 1;
  }

  pac.progress += PAC_SPEED * dt;
  if (pac.progress >= 1) {
    pac.progress = 0;

    if (canMove(pac.x + pac.nextDx, pac.y + pac.nextDy)) {
      pac.dx = pac.nextDx;
      pac.dy = pac.nextDy;
    }

    if (canMove(pac.x + pac.dx, pac.y + pac.dy)) {
      pac.x += pac.dx;
      pac.y += pac.dy;
      pac.dirX = pac.dx || pac.dirX;
      pac.dirY = pac.dy || pac.dirY;

      // Телепорт
      if (pac.x < 0) pac.x = 19;
      if (pac.x > 19) pac.x = 0;

      let cell = map[pac.y][pac.x];
      if (cell === '0') score++;
      if (cell === '2') {
        powered = 5;
        score += 5;
      }

      map[pac.y][pac.x] = ' ';
      scoreEl.textContent = score;

      if (remainingDots() === 0) {
        win = true;
      }
    }
  }
}

function updateGhosts(dt) {
  ghosts.forEach(g => {
    g.progress += GHOST_SPEED * dt;
    if (g.progress >= 1) {
      g.progress = 0;

      let dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ].filter(d => canMove(g.x + d.dx, g.y + d.dy));

      let best;

      // Різна поведінка
      if (g.color === 'red') {
        best = dirs.sort((a, b) => {
          let da =
            Math.abs(g.x + a.dx - pac.x) + Math.abs(g.y + a.dy - pac.y);
          let db =
            Math.abs(g.x + b.dx - pac.x) + Math.abs(g.y + b.dy - pac.y);
          return da - db;
        })[0];
      } else {
        best = dirs[Math.floor(Math.random() * dirs.length)];
      }

      g.x += best.dx;
      g.y += best.dy;

      if (g.x === pac.x && g.y === pac.y) {
        if (powered > 0) {
          g.x = 10;
          g.y = 9;
          score += 10;
        } else {
          gameOver = true;
        }
      }
    }
  });
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') {
    pac.nextDx = 0;
    pac.nextDy = -1;
    pac.dirX = 0;
    pac.dirY = -1;
  }
  if (e.key === 'ArrowDown') {
    pac.nextDx = 0;
    pac.nextDy = 1;
    pac.dirX = 0;
    pac.dirY = 1;
  }
  if (e.key === 'ArrowLeft') {
    pac.nextDx = -1;
    pac.nextDy = 0;
    pac.dirX = -1;
    pac.dirY = 0;
  }
  if (e.key === 'ArrowRight') {
    pac.nextDx = 1;
    pac.nextDy = 0;
    pac.dirX = 1;
    pac.dirY = 0;
  }
});

function drawEnd() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'white';
  ctx.font = `${Math.floor(tile * 2)}px Arial`;
  ctx.textAlign = 'center';
  
  if (win) {
    ctx.fillText('ТИ ВИГРАВ!', canvas.width / 2, canvas.height / 2);
    ctx.font = `${Math.floor(tile * 1.2)}px Arial`;
    ctx.fillText(`Рахунок: ${score}`, canvas.width / 2, canvas.height / 2 + tile * 2);
  }
  if (gameOver) {
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = `${Math.floor(tile * 1.2)}px Arial`;
    ctx.fillText(`Рахунок: ${score}`, canvas.width / 2, canvas.height / 2 + tile * 2);
  }
}

// Функція для розрахунку fps та адаптації затримки
function updateFpsCounter(dt) {
  if (dt === 0) return;
  currentFps = 1 / dt;
  fpsHistory.push(currentFps);
  
  // Зберігаємо історію останніх 30 кадрів
  if (fpsHistory.length > 30) {
    fpsHistory.shift();
  }
  
  // Розраховуємо середній fps
  const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
  
  // Адаптуємо цільову швидкість (30-60 fps)
  if (avgFps > 55) {
    targetFps = 60;
  } else if (avgFps > 50) {
    targetFps = 55;
  } else if (avgFps < 35) {
    targetFps = 30;
  } else if (avgFps < 40) {
    targetFps = 40;
  } else {
    targetFps = 50;
  }
  
  currentFps = Math.round(avgFps);
  fpsEl.textContent = `FPS: ${currentFps}`;
}

function loop(time) {
  let dt = (time - lastTime) / 1000;
  lastTime = time;

  // Захист від надто великих dt (паузи браузера)
  if (dt > 0.1) dt = 0.016;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();

  if (!paused && !gameOver && !win) {
    if (powered > 0) powered -= dt;
    updatePac(dt);
    updateGhosts(dt);
  }

  drawPac();
  drawGhosts();
  
  // Показуємо powered режим з помаранчевою мерехтінням
  if (powered > 0) {
    const blinkAlpha = (Math.sin(powered * Math.PI * 4) + 1) / 2 * 0.3;
    ctx.fillStyle = `rgba(255, 100, 0, ${blinkAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gameOver || win) drawEnd();
  
  // Показуємо статус паузи
  if (paused && !gameOver && !win) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(tile * 2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
  }

  updateFpsCounter(dt);

  requestAnimationFrame(loop);
}

// Адаптація при зміні розміру вікна
window.addEventListener('resize', () => {
  adaptCanvasSize();
});

// Ініціалізація
adaptCanvasSize();
setupSprites();
updateTabs();
init();
requestAnimationFrame(loop);
