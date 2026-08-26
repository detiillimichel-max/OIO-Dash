export function createObstacle(arena) {
  const obstacle = document.createElement('div');
  obstacle.className = 'obstacle';
  const height = 48 + Math.random() * 42;
  obstacle.style.height = `${height}px`;
  obstacle.style.right = '-60px';
  obstacle.dataset.passed = 'false';
  arena.appendChild(obstacle);
  return obstacle;
}

export function moveObstacle(obstacle, speed, dt) {
  const x = parseFloat(obstacle.style.right) || 0;
  const next = x + speed * dt / 16;
  obstacle.style.right = `${next}px`;
  return next;
}
