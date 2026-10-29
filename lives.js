/* global COIN_DASH, CoinDash */
// Lives: a drone hit costs one life, respawns the player at center and makes it blink-immune; the last life ends the round.
const createWithoutLives = CoinDash.prototype.create;
const finishWithoutLives = CoinDash.prototype.finish;
CoinDash.prototype.create = function () {
  createWithoutLives.call(this);
  const l = COIN_DASH.lives;
  this.lives = l.count;
  this.livesUntil = 0;
  const hearts = this.add.text(COIN_DASH.width - 18, 12, '', { font: '18px monospace', color: l.color }).setOrigin(1, 0).setDepth(50);
  this.events.on('postupdate', () => {
    const t = this.time.now;
    hearts.setText('♥'.repeat(Math.max(0, this.lives)));
    this.player.setAlpha(t < this.livesUntil && Math.floor(t / l.blinkMs) % 2 ? 0.25 : 1);
  });
};
CoinDash.prototype.finish = function (reason) {
  if (reason === 'A drone caught you!' && !this.finished) {
    if (this.halfMode || this.shielded || this.time.now < this.shieldGraceUntil) return finishWithoutLives.call(this, reason); // shield.js / halfmode.js handle it
    if (this.time.now < this.livesUntil) return;
    if (this.lives > 1) {
      this.lives--;
      this.livesUntil = this.time.now + COIN_DASH.lives.invulnMs;
      this.player.setPosition(COIN_DASH.width / 2, COIN_DASH.height / 2);
      this.player.body.reset(COIN_DASH.width / 2, COIN_DASH.height / 2);
      if (COIN_DASH.anim) this.cameras.main.shake(COIN_DASH.anim.shakeMs, COIN_DASH.anim.shakeIntensity); // animations.js never sees this hit
      return;
    }
    this.lives = 0;
  }
  finishWithoutLives.call(this, reason);
};
