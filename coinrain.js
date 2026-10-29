/* global Phaser, COIN_DASH, CoinDash */
// Coin rain: in the last COIN_DASH.coinRain.lastSeconds of a round, small coins fall from the top, worth 1 point each.
// scene.rainCoins (a physics group) and scene.rainCaught let tests see them.
const createWithoutRain = CoinDash.prototype.create;
const updateWithoutRain = CoinDash.prototype.update;
CoinDash.prototype.create = function () {
  createWithoutRain.call(this);
  const r = COIN_DASH.coinRain;
  this.rainCoins = this.physics.add.group();
  this.rainCaught = 0;
  this.nextRainAt = 0;
  this.physics.add.overlap(this.player, this.rainCoins, (p, o) => {
    if (this.finished) return;
    this.score += r.points;
    this.rainCaught++;
    o.destroy();
  });
};
CoinDash.prototype.update = function () {
  updateWithoutRain.call(this);
  const r = COIN_DASH.coinRain;
  if (this.finished || this.paused) return;
  const left = this.deadline - this.time.now;
  if (left < r.lastSeconds * 1000 && this.time.now >= this.nextRainAt) {
    this.nextRainAt = this.time.now + r.spawnEveryMs;
    const o = this.add.circle(Phaser.Math.Between(20, COIN_DASH.width - 20), 50, r.radius, r.color);
    this.rainCoins.add(o);
    o.body.setCircle(r.radius).setVelocityY(Phaser.Math.Between(r.minSpeed, r.maxSpeed));
  }
  this.rainCoins.getChildren().slice().forEach(o => o.y > COIN_DASH.height + r.radius && o.destroy());
};
