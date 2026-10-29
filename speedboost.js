/* global COIN_DASH, CoinDash */
// Speed boost: a cyan diamond appears now and then; grabbing it multiplies player speed for a few seconds.
const createWithoutBoost = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutBoost.call(this);
  const k = COIN_DASH.speedBoost;
  if (!this.textures.exists('speedboost')) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(k.color).fillPoints([{ x: 14, y: 0 }, { x: 28, y: 14 }, { x: 14, y: 28 }, { x: 0, y: 14 }], true);
    g.generateTexture('speedboost', 28, 28);
    g.destroy();
  }
  this.boostUntil = 0;
  let pickup = null;
  const spawn = () => {
    if (this.finished || pickup) return;
    const p = pickup = this.physics.add.image(Phaser.Math.Between(40, COIN_DASH.width - 40),
      Phaser.Math.Between(80, COIN_DASH.height - 40), 'speedboost');
    this.boostPickup = p;
    const remove = () => { p.destroy(); if (pickup === p) pickup = this.boostPickup = null; };
    this.physics.add.overlap(this.player, p, () => {
      if (this.finished) return;
      this.boostUntil = this.time.now + k.durationMs;
      remove();
    });
    this.time.delayedCall(k.lifetimeMs, () => p.active && remove());
  };
  this.spawnBoost = spawn;
  this.time.addEvent({ delay: k.spawnEveryMs, loop: true, callback: spawn });
};
const updateWithoutBoost = CoinDash.prototype.update;
CoinDash.prototype.update = function () {
  updateWithoutBoost.call(this);
  if (this.finished || !this.player) return;
  this.boosted = this.time.now < this.boostUntil;
  if (this.boosted) this.player.body.velocity.scale(COIN_DASH.speedBoost.multiplier);
  if (this.boosted !== this.tinted) {  // touch the colour only on change, so other themes keep theirs
    if (this.boosted) this.preBoostColor = this.player.fillColor;
    this.player.setFillStyle(this.boosted ? COIN_DASH.speedBoost.color : this.preBoostColor);
    this.tinted = this.boosted;
  }
};
