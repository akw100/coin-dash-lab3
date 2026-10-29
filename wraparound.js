/* global COIN_DASH, CoinDash */
// Wraparound: the player leaves one edge and enters the opposite one (top wraps below the HUD). Drones still bounce.
const createWithoutWrap = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutWrap.call(this);
  const w = COIN_DASH.wraparound;
  if (!w.enabled) return;
  const b = this.physics.world.bounds, p = this.player, h = 12;
  p.body.setCollideWorldBounds(false);
  this.events.on('update', () => {
    if (p.x > b.right + h) p.x = b.left - h; else if (p.x < b.left - h) p.x = b.right + h;
    if (p.y > b.bottom + h) p.y = b.top - h; else if (p.y < b.top - h) p.y = b.bottom + h;
  });
};
