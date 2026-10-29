/* global COIN_DASH, CoinDash, Phaser */
// EMP bomb: E (once per round) sends a ring out from the player and freezes all drones for freezeMs.
const createWithoutEmp = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutEmp.call(this);
  const k = COIN_DASH.emp;
  this.empUsed = false;
  this.empFrozen = false;
  const label = this.add.text(COIN_DASH.width / 2, 14, 'EMP ready', { font: '16px monospace', color: '#4dd8ff' }).setOrigin(0.5, 0).setDepth(50);
  this.input.keyboard.on('keydown-' + k.key, () => {
    if (this.finished || this.empUsed) return;
    this.empUsed = this.empFrozen = true;
    label.setText('EMP used').setColor('#8fa3bf');
    const ring = this.add.circle(this.player.x, this.player.y, 10).setStrokeStyle(4, k.color);
    this.tweens.add({ targets: ring, radius: k.ringRadius, alpha: 0, duration: k.ringMs, onComplete: () => ring.destroy() });
    const drones = this.drones.getChildren();
    const saved = drones.map(d => ({ vx: d.body.velocity.x, vy: d.body.velocity.y, fill: d.fillColor }));
    drones.forEach(d => { d.body.setVelocity(0, 0); d.setFillStyle(k.frozenColor); });
    // ponytail: re-assert each frame so self-steering drones (chaser.js) stay frozen too
    const hold = () => { if (this.empFrozen) drones.forEach(d => { d.body.setVelocity(0, 0); d.setFillStyle(k.frozenColor); }); };
    this.events.on('postupdate', hold);
    this.events.once('shutdown', () => this.events.off('postupdate', hold));
    this.time.delayedCall(k.freezeMs, () => {
      this.empFrozen = false;
      this.events.off('postupdate', hold);
      drones.forEach((d, i) => { if (d.active) { d.body.setVelocity(saved[i].vx, saved[i].vy); d.setFillStyle(saved[i].fill); } });
    });
  });
};
