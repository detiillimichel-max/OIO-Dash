import { Player } from './game/player.js';
import { createObstacle, moveObstacle } from './game/obstacles.js';
import { createCoin } from './game/coins.js';
import { hit } from './game/collision.js';
import { updateHud } from './ui/hud.js';
import { showMenu, hideMenu } from './ui/menu.js';
import { showGameOver } from './ui/game-over.js';

const arena = document.getElementById('arena');
const playerEl = document.getElementById('player');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
const start = document.getElementById('start');
const jumpBtn = document.getElementById('jump');

const player = new Player(playerEl);
let playing = false;
let score = 0;
let coins = 0;
let best = Number(localStorage.getItem('oio-dash-best') || 0);
let speed = 5;
let spawnTimer = 0;
let coinTimer = 0;
let last = 0;
let obstacles = [];
let coinItems = [];

updateHud(scoreEl, coinsEl, score, coins);
bestEl.textContent = best;

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
  speed = 5;
  spawnTimer = 0;
  coinTimer = 0;
  updateHud(scoreEl, coinsEl, score, coins);
  bestEl.textContent = best;
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
  score += dt * 0.01;
  speed = 5 + score / 70;
  updateHud(scoreEl, coinsEl, score, coins);
  player.setSpeeding(speed > 8);

  spawnTimer += dt;
  coinTimer += dt;

  if (spawnTimer > Math.max(560, 1120 - score * 2)) {
    spawn();
    spawnTimer = 0;
  }

  if (coinTimer > Math.max(720, 1250 - score * 1.5)) {
    spawnCoin();
    coinTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    const x = moveObstacle(obstacle, speed, dt);
    if (hit(playerEl, obstacle, 22) && !player.jumping) {
      gameOver();
      return;
    }
    if (x > arena.clientWidth + 80) {
      obstacle.remove();
      obstacles.splice(i, 1);
    }
  }

  for (let i = coinItems.length - 1; i >= 0; i -= 1) {
    const coin = coinItems[i];
    const x = moveObstacle(coin, speed, dt);
    if (hit(playerEl, coin, 5)) {
      collectCoin(coin);
      coinItems.splice(i, 1);
      continue;
    }
    if (x > arena.clientWidth + 80) {
      coin.remove();
      coinItems.splice(i, 1);
    }
  }

  requestAnimationFrame(loop);
}

start.addEventListener('click', startGame);
jumpBtn.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
arena.addEventListener('pointerdown', e => { if (e.target !== start) jump(); });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
  if (e.code === 'Enter' && !playing) startGame();
});

showMenu(message, 'OIO DASH 2.0', 'Toque para começar');
