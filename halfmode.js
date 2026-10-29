/* global COIN_DASH, CoinDash */
// Half-points mode: H toggles. A hit that would end the round (not the timer) halves the score instead,
// then the player blinks and is immune for invulnMs. A shield (shield.js) still absorbs the hit first.
const createWithoutHalf = CoinDash.prototype.create;
const finishWithoutHalf = CoinDash.prototype.finish;
let halfOn = false; // survives R
CoinDash.prototype.create = function () {
  createWithoutHalf.call(this);
  const h = COIN_DASH.halfMode;
  this.halfMode = halfOn;
  this.invulnUntil = 0;
  const badge = this.add.text(COIN_DASH.width / 2, 12, '½ MODE', { font: '16px monospace', color: h.color })
    .setOrigin(0.5, 0).setDepth(50).setVisible(halfOn);
  this.input.keyboard.on('keydown-' + h.key, () => { halfOn = this.halfMode = !halfOn; badge.setVisible(halfOn); });
  this.events.on('postupdate', () => {
    const t = this.time.now;
    this.player.setAlpha(t < this.invulnUntil && Math.floor(t / h.blinkMs) % 2 ? 0.25 : 1);
  });
};
CoinDash.prototype.finish = function (reason) {
  if (this.halfMode && !this.finished && reason !== 'Time is up!') {
    if (this.shielded || this.time.now < this.shieldGraceUntil) return finishWithoutHalf.call(this, reason); // shield.js handles it
    if (this.time.now < this.invulnUntil) return;
    this.invulnUntil = this.time.now + COIN_DASH.halfMode.invulnMs;
    this.score = Math.floor(this.score / 2);
    const pop = this.add.text(this.player.x, this.player.y - 20, '½', { font: 'bold 32px monospace', color: COIN_DASH.halfMode.color }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: pop, y: pop.y - 40, alpha: 0, duration: 700, onComplete: () => pop.destroy() });
    return;
  }
  finishWithoutHalf.call(this, reason);
};
