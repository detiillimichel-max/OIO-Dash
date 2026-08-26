export function createCoin(arena) {
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.style.right = `${-30 - Math.random() * 180}px`;
  coin.style.bottom = `${70 + Math.random() * 100}px`;
  arena.appendChild(coin);
  return coin;
}
