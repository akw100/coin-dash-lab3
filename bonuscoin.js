/* global COIN_DASH, CoinDash */
// Bonus coin: every so often a big pulsing orange coin shows up for a few seconds, worth 5 points.
const createWithoutBonus = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutBonus.call(this);
  const b = COIN_DASH.bonusCoin;
  let bonus = null;
  const remove = () => { if (bonus) { bonus.destroy(); bonus = this.bonusCoin = null; } };
  this.spawnBonusCoin = () => {
    if (this.finished || bonus) return;
    const o = bonus = this.bonusCoin = this.add.circle(Phaser.Math.Between(40, COIN_DASH.width - 40),
      Phaser.Math.Between(80, COIN_DASH.height - 40), b.radius, b.color);
    this.physics.add.existing(o);
    o.body.setCircle(b.radius);
    this.tweens.add({ targets: o, scale: 1.3, duration: 350, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.player, o, () => { if (!this.finished && bonus === o) { this.score += b.points; remove(); } });
    this.time.delayedCall(b.lifetimeMs, () => bonus === o && remove());
  };
  this.time.addEvent({ delay: b.spawnEveryMs, loop: true, callback: this.spawnBonusCoin });
};
