export function showMenu(message, title = 'OIO DASH', text = 'Toque para saltar') {
  message.classList.remove('hidden');
  message.querySelector('h1').textContent = title;
  message.querySelector('p').textContent = text;
}

export function hideMenu(message) {
  message.classList.add('hidden');
}
