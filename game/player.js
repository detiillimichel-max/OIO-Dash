export class Player {
  constructor(element) {
    this.element = element;
    this.jumping = false;
    this.speeding = false;
  }

  jump() {
    if (this.jumping) return false;
    this.jumping = true;
    this.element.classList.add('is-jumping');
    this.element.src = 'assets/dash-jump.webp';
    this.element.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-105px)' }, { transform: 'translateY(0)' }],
      { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' }
    ).finished.finally(() => {
      this.jumping = false;
      this.element.classList.remove('is-jumping');
      this.element.src = 'assets/dash-run.webp';
    });
    return true;
  }

  setSpeeding(active) {
    this.speeding = active;
    if (!this.jumping) this.element.src = active ? 'assets/dash-speed.webp' : 'assets/dash-run.webp';
  }
}
