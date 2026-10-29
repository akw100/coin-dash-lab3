/* global COIN_DASH, CoinDash */
// Double points: a purple "2x" pickup appears now and then; grabbing it makes coins worth double for a while.
// Score stays the real score: any gain while active is multiplied after the physics step.
const createWithoutDouble = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutDouble.call(this);
  const d = COIN_DASH.doublePoints;
  this.doubleUntil = 0;
  let lastScore = 0, pickup = null;
  const label = this.add.text(COIN_DASH.width - 18, 48, '', { font: '18px monospace', color: '#b388ff' }).setOrigin(1, 0);
  this.activateDouble = () => { this.doubleUntil = this.time.now + d.durationMs; };
  const spawn = () => {
    if (this.finished || pickup) return;
    const p = pickup = this.add.rectangle(Phaser.Math.Between(40, COIN_DASH.width - 40),
      Phaser.Math.Between(80, COIN_DASH.height - 40), 24, 24, d.color);
    p.label = this.add.text(p.x, p.y, '2x', { font: 'bold 14px monospace', color: '#101c31' }).setOrigin(0.5);
    this.physics.add.existing(p);
    this.doublePickup = p;
    const remove = () => { p.label.destroy(); p.destroy(); if (pickup === p) pickup = this.doublePickup = null; };
    this.physics.add.overlap(this.player, p, () => { if (!this.finished) { this.activateDouble(); remove(); } });
    this.time.delayedCall(d.lifetimeMs, () => p.active && remove());
  };
  this.spawnDouble = spawn;
  this.time.addEvent({ delay: d.spawnEveryMs, loop: true, callback: spawn });
  this.events.on('postupdate', () => {
    if (this.time.now < this.doubleUntil && this.score > lastScore) this.score += (this.score - lastScore) * (d.multiplier - 1);
    lastScore = this.score;
    const left = Math.ceil((this.doubleUntil - this.time.now) / 1000);
    label.setText(!this.finished && left > 0 ? `${d.multiplier}x  ${left}s` : '');
  });
};
