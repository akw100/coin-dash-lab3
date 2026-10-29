/* global COIN_DASH, CoinDash */
// Combo: a coin picked up within windowMs of the previous one raises the multiplier (x1..max); each coin is worth it.
// core calls placeCoin() right after score++, so the extra (multiplier - 1) is added there; doublepoints.js then doubles the total.
const createWithoutCombo = CoinDash.prototype.create;
const placeWithoutCombo = CoinDash.prototype.placeCoin;
CoinDash.prototype.create = function () {
  this.comboReady = false;
  createWithoutCombo.call(this);
  const k = COIN_DASH.combo;
  this.combo = 0;
  this.lastCoinAt = -Infinity;
  this.comboReady = true;
  const label = this.add.text(COIN_DASH.width - 18, 28, '', { font: '18px monospace', color: k.color }).setOrigin(1, 0);
  this.events.on('postupdate', () => {
    if (this.time.now - this.lastCoinAt > k.windowMs) this.combo = 0;
    label.setText(!this.finished && this.combo > 0 ? `Combo x${this.combo}` : '');
  });
};
CoinDash.prototype.placeCoin = function () {
  if (this.comboReady) {
    const k = COIN_DASH.combo, now = this.time.now;
    this.combo = now - this.lastCoinAt <= k.windowMs ? Math.min(k.max, this.combo + 1) : 1;
    this.lastCoinAt = now;
    this.score += this.combo - 1;
  }
  placeWithoutCombo.call(this);
};
