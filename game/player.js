const SPRITES = {
  idle: 'assets/dash-idle.webp',
  run: 'assets/dash-run.webp',
  jump: 'assets/dash-jump.webp',
  speed: 'assets/dash-speed.webp'
};

export class Player {
  constructor(element) {
    this.element = element;
    this.jumping = false;
    this.speeding = false;
    this.spriteCache = new Map();
    this.loadSprites();
  }

  async loadSprites() {
    await Promise.all(Object.entries(SPRITES).map(async ([name, src]) => {
      try {
        this.spriteCache.set(name, await makeTransparentSprite(src));
      } catch {
        this.spriteCache.set(name, src);
      }
    }));
    this.setSprite('run');
  }

  setSprite(name) {
    const sprite = this.spriteCache.get(name) || SPRITES[name];
    if (sprite) this.element.src = sprite;
  }

  jump() {
    if (this.jumping) return false;
    this.jumping = true;
    this.element.classList.add('is-jumping');
    this.setSprite('jump');

    const animation = this.element.animate(
      [
        { transform: 'translate3d(0, 0, 0) rotate(-2deg)' },
        { transform: 'translate3d(0, -135px, 0) rotate(4deg)' },
        { transform: 'translate3d(0, 0, 0) rotate(-2deg)' }
      ],
      { duration: 620, easing: 'cubic-bezier(.18,.8,.25,1)' }
    );

    animation.finished.catch(() => {}).finally(() => {
      this.jumping = false;
      this.element.classList.remove('is-jumping');
      this.setSprite(this.speeding ? 'speed' : 'run');
    });
    return true;
  }

  setSpeeding(active) {
    this.speeding = active;
    if (!this.jumping) this.setSprite(active ? 'speed' : 'run');
  }
}

async function makeTransparentSprite(src) {
  const image = new Image();
  image.src = src;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);

  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = frame.data;
  let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    const brightness = (r + g + b) / 3;
    const nearWhite = r > 242 && g > 242 && b > 242;

    if (nearWhite) {
      pixels[i + 3] = 0;
      continue;
    }

    if (a > 10 && brightness < 242) {
      const p = i / 4;
      const x = p % canvas.width;
      const y = Math.floor(p / canvas.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0) return src;

  ctx.putImageData(frame, 0, 0);
  const pad = 18;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const ex = Math.min(canvas.width, maxX + pad + 1);
  const ey = Math.min(canvas.height, maxY + pad + 1);

  const cropped = document.createElement('canvas');
  cropped.width = ex - sx;
  cropped.height = ey - sy;
  cropped.getContext('2d').drawImage(canvas, sx, sy, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
  return cropped.toDataURL('image/png');
}
