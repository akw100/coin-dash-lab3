/* global COIN_DASH, CoinDash, Phaser */
// Coin hop: an uncollected coin blinks for its last second, then jumps; a ring around it shrinks with the time left.
const placeCoinWithoutHop = CoinDash.prototype.placeCoin;
CoinDash.prototype.placeCoin = function () {
  placeCoinWithoutHop.call(this);
  this.coinBorn = this.time.now;
};
const createWithoutHop = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutHop.call(this);
  const ring = this.add.graphics();
  this.events.on('update', () => {
    const k = COIN_DASH.coinHop, left = k.lifetimeMs - (this.time.now - this.coinBorn);
    ring.clear();
    if (this.finished) return;
    if (left <= 0) { this.placeCoin(); this.coin.setAlpha(1); return; }
    this.coin.setAlpha(left < k.blinkMs && Math.floor(left / 100) % 2 ? 0.2 : 1);
    ring.lineStyle(2, k.ringColor, 0.8).strokeCircle(this.coin.x, this.coin.y, 10 + 12 * left / k.lifetimeMs);
  });
};
