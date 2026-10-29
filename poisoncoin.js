/* global Phaser, COIN_DASH, CoinDash */
// Poison coin: every so often a purple coin shows up for a few seconds; touching it costs points (never below 0).
// scene.poisonCoin is the current one (or null) and scene.spawnPoisonCoin() makes one now, for tests.
const createWithoutPoison = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutPoison.call(this);
  const k = COIN_DASH.poisonCoin;
  let poison = null;
  const remove = () => { if (poison) { poison.destroy(); poison = this.poisonCoin = null; } };
  this.poisonCoin = null;
  this.spawnPoisonCoin = () => {
    if (this.finished || poison) return;
    let x, y;
    do {
      x = Phaser.Math.Between(40, COIN_DASH.width - 40);
      y = Phaser.Math.Between(80, COIN_DASH.height - 40);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < k.minDistance);
    const o = poison = this.poisonCoin = this.add.circle(x, y, k.radius, k.color).setStrokeStyle(2, k.ring);
    this.physics.add.existing(o);
    o.body.setCircle(k.radius);
    this.tweens.add({ targets: o, angle: 360, scaleX: 0.75, duration: 500, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.player, o, () => {
      if (this.finished || poison !== o) return;
      this.score = Math.max(0, this.score - k.penalty);
      const label = this.add.text(o.x, o.y - 18, `-${k.penalty}`, { font: 'bold 18px monospace', color: k.textColor,
        stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(80);
      this.tweens.add({ targets: label, y: label.y - 30, alpha: 0, duration: 700, onComplete: () => label.destroy() });
      remove();
    });
    this.time.delayedCall(k.lifetimeMs, () => poison === o && remove());
  };
  this.time.addEvent({ delay: k.spawnEveryMs, loop: true, callback: this.spawnPoisonCoin });
};
