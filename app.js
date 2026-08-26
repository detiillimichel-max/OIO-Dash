import { Player } from './game/player.js';
import { createObstacle, moveObstacle } from './game/obstacles.js';
import { hit } from './game/collision.js';
import { updateHud } from './ui/hud.js';
import { showMenu, hideMenu } from './ui/menu.js';
import { showGameOver } from './ui/game-over.js';

const arena = document.getElementById('arena');
const playerEl = document.getElementById('player');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
const start = document.getElementById('start');
const jumpBtn = document.getElementById('jump');

const player = new Player(playerEl);
let playing = false;
let score = 0;
let best = Number(localStorage.getItem('oio-dash-best') || 0);
let speed = 5;
let spawnTimer = 0;
let last = 0;
let obstacles = [];

updateHud(scoreEl, bestEl, score, best);

function jump() {
  if (!playing) return;
  player.jump();
}

function startGame() {
  obstacles.forEach(o => o.remove());
  obstacles = [];
  score = 0;
  speed = 5;
  spawnTimer = 0;
  updateHud(scoreEl, bestEl, score, best);
  hideMenu(message);
  playerEl.src = 'assets/dash-run.webp';
  player.setSpeeding(false);
  playing = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

function spawn() {
  obstacles.push(createObstacle(arena));
}

function gameOver() {
  playing = false;
  best = showGameOver(message, start, score, best, bestEl);
  playerEl.src = 'assets/dash-idle.webp';
}

function loop(t) {
  if (!playing) return;
  const dt = Math.min(32, t - last);
  last = t;
  score += dt * 0.01;
  speed = 5 + score / 70;
  updateHud(scoreEl, bestEl, score, best);
  player.setSpeeding(speed > 8);

  spawnTimer += dt;
  if (spawnTimer > Math.max(600, 1150 - score * 2)) {
    spawn();
    spawnTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    const x = moveObstacle(obstacle, speed, dt);
    if (hit(playerEl, obstacle) && !player.jumping) {
      gameOver();
      return;
    }
    if (x > arena.clientWidth + 60) {
      obstacle.remove();
      obstacles.splice(i, 1);
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
