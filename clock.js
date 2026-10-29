/* global COIN_DASH, CoinDash */
// Clock pickup: a green/white stopwatch appears now and then; grabbing it adds seconds to the real deadline.
const createWithoutClock = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutClock.call(this);
  const k = COIN_DASH.clock;
  if (!this.textures.exists('clock')) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(k.color).fillCircle(14, 16, 12).fillStyle(0xffffff).fillCircle(14, 16, 9);
    g.fillStyle(k.color).fillRect(11, 0, 6, 4);
    g.lineStyle(2, k.color).lineBetween(14, 16, 14, 9).lineBetween(14, 16, 19, 16);
    g.generateTexture('clock', 28, 28);
    g.destroy();
  }
  let pickup = null;
  const spawn = () => {
    if (this.finished || pickup) return;
    const p = pickup = this.physics.add.image(Phaser.Math.Between(40, COIN_DASH.width - 40),
      Phaser.Math.Between(80, COIN_DASH.height - 40), 'clock');
    this.clockPickup = p;
    const remove = () => { p.destroy(); if (pickup === p) pickup = this.clockPickup = null; };
    this.physics.add.overlap(this.player, p, () => {
      if (this.finished) return;
      this.deadline += k.addSeconds * 1000;
      const txt = this.add.text(p.x, p.y, `+${k.addSeconds}s`, { font: 'bold 20px monospace', color: '#7dff9a' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: p.y - 40, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
      const old = this.hud.style.color;
      this.hud.setColor('#7dff9a');
      this.time.delayedCall(300, () => this.hud.setColor(old));
      remove();
    });
    this.time.delayedCall(k.lifetimeMs, () => p.active && remove());
  };
  this.spawnClock = spawn;
  this.time.addEvent({ delay: k.spawnEveryMs, loop: true, callback: spawn });
};
