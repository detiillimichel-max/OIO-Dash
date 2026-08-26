import { Player } from './game/player.js';
import { createObstacle, moveObstacle } from './game/obstacles.js';
import { createCoin } from './game/coins.js';
import { hit } from './game/collision.js';
import { updateHud } from './ui/hud.js';
import { showMenu, hideMenu } from './ui/menu.js';
import { showGameOver } from './ui/game-over.js';

const arena = document.getElementById('arena');
const playerEl = document.getElementById('player');
const hitboxEl = document.getElementById('player-hitbox');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
const start = document.getElementById('start');
const jumpBtn = document.getElementById('jump');

const player = new Player(playerEl, hitboxEl);
let playing = false;
let score = 0;
let coins = 0;
let best = Number(localStorage.getItem('oio-dash-best') || 0);
let speed = 4.5;
let spawnTimer = 0;
let coinTimer = 0;
let last = 0;
let obstacles = [];
let coinItems = [];

updateHud(scoreEl, bestEl, score, best);
coinsEl.textContent = '0';

function jump() {
  if (!playing) return;
  player.jump();
}

function startGame() {
  obstacles.forEach(o => o.remove());
  coinItems.forEach(c => c.remove());
  obstacles = [];
  coinItems = [];
  score = 0;
  coins = 0;
  speed = 4.5;
  spawnTimer = -700;
  coinTimer = 500;
  updateHud(scoreEl, bestEl, score, best);
  coinsEl.textContent = '0';
  hideMenu(message);
  player.setSpeeding(false);
  playing = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

function spawn() {
  obstacles.push(createObstacle(arena));
}

function spawnCoin() {
  coinItems.push(createCoin(arena));
}

function collectCoin(coin) {
  coins += 1;
  score += 10;
  const rect = coin.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  coin.remove();
}

function burst(x, y) {
  const arenaRect = arena.getBoundingClientRect();
  for (let i = 0; i < 8; i += 1) {
    const particle = document.createElement('i');
    particle.className = 'particle';
    particle.style.left = `${x - arenaRect.left}px`;
    particle.style.top = `${y - arenaRect.top}px`;
    particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 90}px`);
    particle.style.setProperty('--dy', `${(Math.random() - 0.5) * 90}px`);
    arena.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
  }
}

function gameOver() {
  playing = false;
  best = showGameOver(message, start, score, best, bestEl);
  player.setSpeeding(false);
}

function loop(t) {
  if (!playing) return;
  const dt = Math.min(32, t - last);
  last = t;
  score += dt * 0.0075;
  speed = Math.min(8.2, 4.5 + score / 110);
  updateHud(scoreEl, bestEl, score, best);
  coinsEl.textContent = String(coins);
  player.setSpeeding(speed > 7.1);

  spawnTimer += dt;
  coinTimer += dt;

  const obstacleGap = Math.max(1250, 2050 - score * 3.2);
  if (spawnTimer > obstacleGap && obstacles.length < 2) {
    spawn();
    spawnTimer = 0;
  }

  if (coinTimer > Math.max(850, 1500 - score * 1.2)) {
    spawnCoin();
    coinTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    const x = moveObstacle(obstacle, speed, dt);
    if (hit(hitboxEl, obstacle, 3)) {
      gameOver();
      return;
    }
    if (x > arena.clientWidth + 100) {
      obstacle.remove();
      obstacles.splice(i, 1);
    }
  }

  for (let i = coinItems.length - 1; i >= 0; i -= 1) {
    const coin = coinItems[i];
    const x = moveObstacle(coin, speed, dt);
    if (hit(hitboxEl, coin, 2)) {
      collectCoin(coin);
      coinItems.splice(i, 1);
      continue;
    }
    if (x > arena.clientWidth + 100) {
      coin.remove();
      coinItems.splice(i, 1);
    }
  }

  requestAnimationFrame(loop);
}

start.addEventListener('click', startGame);
jumpBtn.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
arena.addEventListener('pointerdown', e => { if (!e.target.closest('button')) jump(); });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
  if (e.code === 'Enter' && !playing) startGame();
});

showMenu(message, 'OIO DASH 2.0', 'Toque para começar');
