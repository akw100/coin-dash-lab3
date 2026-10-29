/* global COIN_DASH, CoinDash, Phaser */
// Magnet: a blue/silver U pickup appears now and then; grabbing it pulls nearby coins toward the player for a while.
const createWithoutMagnet = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutMagnet.call(this);
  const m = COIN_DASH.magnet;
  this.magnetUntil = 0;
  let pickup = null;
  if (!this.textures.exists('magnet')) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xd9dee6).fillRect(0, 0, 8, 6).fillRect(16, 0, 8, 6); // silver tips
    g.fillStyle(m.color).fillRect(0, 6, 8, 12).fillRect(16, 6, 8, 12).fillRect(0, 18, 24, 6); // blue U
    g.generateTexture('magnet', 24, 24);
    g.destroy();
  }
  const ring = this.add.circle(0, 0, m.radius).setStrokeStyle(2, m.color, 0.6).setVisible(false);
  const label = this.add.text(COIN_DASH.width - 18, 72, '', { font: '18px monospace', color: '#6bb0ff' }).setOrigin(1, 0);
  this.activateMagnet = () => { this.magnetUntil = this.time.now + m.durationMs; };
  const spawn = () => {
    if (this.finished || pickup) return;
    let x, y;
    do { // safe spot: away from the player and every drone
      x = Phaser.Math.Between(40, COIN_DASH.width - 40);
      y = Phaser.Math.Between(80, COIN_DASH.height - 40);
    } while ([this.player, ...this.drones.getChildren()].some(o => Phaser.Math.Distance.Between(x, y, o.x, o.y) < 80));
    const p = pickup = this.add.image(x, y, 'magnet');
    this.physics.add.existing(p);
    this.magnetPickup = p;
    const remove = () => { p.destroy(); if (pickup === p) pickup = this.magnetPickup = null; };
    this.physics.add.overlap(this.player, p, () => { if (!this.finished) { this.activateMagnet(); remove(); } });
    this.time.delayedCall(m.lifetimeMs, () => p.active && remove());
  };
  this.spawnMagnet = spawn;
  this.time.addEvent({ delay: m.spawnEveryMs, loop: true, callback: spawn });
  // The scene's event emitter survives restarts, but ring and label do not: detach this listener on shutdown,
  // or the stale one from the previous round throws inside Phaser's step and the whole game freezes.
  const onPostUpdate = () => {
    const left = Math.ceil((this.magnetUntil - this.time.now) / 1000);
    const on = !this.finished && left > 0;
    label.setText(on ? `Magnet ${left}s` : '');
    ring.setVisible(on).setPosition(this.player.x, this.player.y);
    if (!on) return;
    const c = this.coin, d = Phaser.Math.Distance.Between(c.x, c.y, this.player.x, this.player.y);
    if (d > m.radius || d === 0) return;
    const step = Math.min(d, m.pullSpeed * this.game.loop.delta / 1000);
    const x = c.x + (this.player.x - c.x) / d * step, y = c.y + (this.player.y - c.y) / d * step;
    c.setPosition(x, y);
    c.body.reset(x, y);
  };
  this.events.on('postupdate', onPostUpdate);
  this.events.once('shutdown', () => this.events.off('postupdate', onPostUpdate));
};
