export function updateHud(scoreEl, bestEl, score, best) {
  scoreEl.textContent = Math.floor(score);
  bestEl.textContent = best;
}
