export function showGameOver(message, start, score, best, bestEl) {
  message.classList.remove('hidden');
  message.querySelector('h1').textContent = 'GAME OVER';
  message.querySelector('p').textContent = `Você fez ${Math.floor(score)} pontos`;
  start.textContent = 'JOGAR DE NOVO';
  if (score > best) {
    best = Math.floor(score);
    localStorage.setItem('oio-dash-best', best);
    bestEl.textContent = best;
  }
  return best;
}
