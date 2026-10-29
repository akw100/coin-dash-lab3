/* global COIN_DASH, CoinDash */
// Time bonus: a white clock pickup appears every ~10s; grabbing it adds seconds to the deadline.
const createWithoutTimeBonus = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutTimeBonus.call(this);
  const k = COIN_DASH.timeBonus;
  if (!this.textures.exists('timebonus')) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff).fillCircle(14, 14, 13);
    g.lineStyle(2, 0x222222).strokeCircle(14, 14, 13).lineBetween(14, 14, 14, 6).lineBetween(14, 14, 20, 14);
    g.generateTexture('timebonus', 28, 28);
    g.destroy();
  }
  let pickup = null;
  const spawn = () => {
    if (this.finished || pickup) return;
    const p = pickup = this.physics.add.image(Phaser.Math.Between(40, COIN_DASH.width - 40),
      Phaser.Math.Between(80, COIN_DASH.height - 40), 'timebonus');
    this.timeBonusPickup = p;
    const remove = () => { p.destroy(); if (pickup === p) pickup = this.timeBonusPickup = null; };
    this.physics.add.overlap(this.player, p, () => {
      if (this.finished) return;
      this.deadline += k.addSeconds * 1000;
      const txt = this.add.text(p.x, p.y, `+${k.addSeconds}s`, { font: 'bold 20px monospace', color: '#ffffff' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: p.y - 40, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
      remove();
    });
    this.time.delayedCall(k.lifetimeMs, () => p.active && remove());
  };
  this.spawnTimeBonus = spawn;
  this.time.addEvent({ delay: k.spawnEveryMs, loop: true, callback: spawn });
};
