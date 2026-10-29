/* global Phaser, COIN_DASH, CoinDash */
// Dash: Space = 3x speed for a moment in the current (or last) move direction, with a cooldown bar under the HUD.
const createWithoutDash = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutDash.call(this);
  const d = COIN_DASH.dash;
  this.dashUntil = 0;
  this.dashReadyAt = 0;
  this.dashDir = new Phaser.Math.Vector2(1, 0);
  const back = this.add.rectangle(d.x, d.y, d.w, d.h, 0x0a1120, 0.78).setOrigin(0, 0).setDepth(50);
  const bar = this.add.rectangle(d.x, d.y, d.w, d.h, d.color).setOrigin(0, 0).setDepth(51);
  this.events.on('postupdate', () => {
    const v = this.player.body.velocity, now = this.time.now;
    if (v.lengthSq() > 0) this.dashDir.copy(v).normalize();
    // ponytail: dashing a still player uses the last direction
    if (now < this.dashUntil && !this.finished) v.copy(this.dashDir).scale(COIN_DASH.playerSpeed * d.multiplier);
    bar.width = d.w * Phaser.Math.Clamp(1 - (this.dashReadyAt - now) / d.cooldownMs, 0, 1);
  });
  this.input.keyboard.on(`keydown-${d.key}`, () => {
    if (this.finished || this.time.now < this.dashReadyAt) return;
    this.dashUntil = this.time.now + d.durationMs;
    this.dashReadyAt = this.time.now + d.cooldownMs;
  });
};
