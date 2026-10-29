/* global COIN_DASH, CoinDash */
// Round stats: distance travelled, time survived and coins/minute, shown under the end-of-round text.
const createWithoutStats = CoinDash.prototype.create;
const updateWithoutStats = CoinDash.prototype.update;
const finishWithoutStats = CoinDash.prototype.finish;
CoinDash.prototype.create = function () {
  createWithoutStats.call(this);
  this.stats = { distance: 0, seconds: 0, coinsPerMin: 0 };
  this.statsStart = this.time.now;
  this.statsLast = { x: this.player.x, y: this.player.y };
};
CoinDash.prototype.update = function () {
  updateWithoutStats.call(this);
  if (this.finished) return;
  this.stats.distance += Math.hypot(this.player.x - this.statsLast.x, this.player.y - this.statsLast.y);
  this.statsLast = { x: this.player.x, y: this.player.y };
};
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished;
  finishWithoutStats.call(this, reason);
  if (wasFinished) return;
  const s = this.stats;
  s.seconds = (this.time.now - this.statsStart) / 1000;
  s.coinsPerMin = s.seconds > 0 ? this.score / s.seconds * 60 : 0;
  this.statsText = this.add.text(COIN_DASH.width / 2, COIN_DASH.height / 2 + 120,
    `Distance: ${Math.round(s.distance)} px   Survived: ${s.seconds.toFixed(1)}s   Coins/min: ${s.coinsPerMin.toFixed(1)}`,
    { font: '16px monospace', color: '#8fa3bf' }).setOrigin(0.5).setDepth(60);
};
