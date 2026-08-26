export function createObstacle(arena) {
  const obstacle = document.createElement('div');
  obstacle.className = 'obstacle';
  obstacle.style.height = `${35 + Math.random() * 55}px`;
  obstacle.style.right = '-40px';
  arena.appendChild(obstacle);
  return obstacle;
}

export function moveObstacle(obstacle, speed, dt) {
  const x = parseFloat(obstacle.style.right) || 0;
  obstacle.style.right = `${x + speed * dt / 16}px`;
  return x;
}
