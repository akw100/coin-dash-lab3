/* global COIN_DASH, CoinDash */
// Touch controls: while a pointer is held the player moves toward it (keys still win); a tap on a finished round restarts.
const updateWithoutTouch = CoinDash.prototype.update;
const createWithoutTouch = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutTouch.call(this);
  this.input.on('pointerdown', () => { if (this.finished) this.scene.restart(); });
};
CoinDash.prototype.update = function () {
  updateWithoutTouch.call(this);
  const p = this.input.activePointer, b = this.player.body;
  if (this.finished || !p.isDown || b.velocity.x || b.velocity.y) return;
  const dx = p.worldX - this.player.x, dy = p.worldY - this.player.y, d = Math.hypot(dx, dy);
  if (d > COIN_DASH.touch.stopDistance) b.setVelocity(dx / d * COIN_DASH.playerSpeed, dy / d * COIN_DASH.playerSpeed);
};
