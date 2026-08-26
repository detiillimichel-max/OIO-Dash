export function updateHud(scoreEl, coinsEl, score, coins) {
  scoreEl.textContent = Math.floor(score);
  coinsEl.textContent = coins;
}
