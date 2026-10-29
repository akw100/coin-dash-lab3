/* global Phaser, COIN_DASH, CoinDash */
// Shield: a cyan bubble pickup appears now and then; grabbing it absorbs the next drone hit (the bubble pops).
// Hooks finish(): a drone hit while shielded is swallowed, plus a short grace so the same overlap can't re-hit.
const createWithoutShield = CoinDash.prototype.create;
const finishWithoutShield = CoinDash.prototype.finish;
CoinDash.prototype.create = function () {
  createWithoutShield.call(this);
  const s = COIN_DASH.shield;
  this.shielded = false;
  this.shieldGraceUntil = 0;
  if (!this.textures.exists('shield')) {
    this.add.graphics().fillStyle(s.color, 0.35).fillCircle(16, 16, 15)
      .lineStyle(3, s.glow, 1).strokeCircle(16, 16, 14).generateTexture('shield', 32, 32).destroy();
  }
  const bubble = this.add.image(0, 0, 'shield').setScale(1.8).setVisible(false);
  this.tweens.add({ targets: bubble, alpha: 0.55, duration: 400, yoyo: true, repeat: -1 });
  let pickup = null;
  this.activateShield = () => { this.shielded = true; bubble.setVisible(true); };
  this.popShield = () => {
    this.shielded = false;
    bubble.setVisible(false);
    this.shieldGraceUntil = this.time.now + s.graceMs;
    // bounce the nearest drone away from the player
    const d = this.drones.getChildren().reduce((a, b) =>
      Phaser.Math.Distance.BetweenPoints(a, this.player) < Phaser.Math.Distance.BetweenPoints(b, this.player) ? a : b);
    const sp = COIN_DASH.droneSpeed, an = Phaser.Math.Angle.BetweenPoints(this.player, d);
    d.body.setVelocity(Math.cos(an) * sp, Math.sin(an) * sp);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      const dot = this.add.circle(this.player.x, this.player.y, 4, s.glow);
      this.tweens.add({ targets: dot, x: dot.x + Math.cos(a) * 45, y: dot.y + Math.sin(a) * 45, alpha: 0,
        duration: 350, onComplete: () => dot.destroy() });
    }
  };
  this.spawnShield = () => {
    if (this.finished || pickup) return;
    const p = pickup = this.physics.add.existing(this.add.image(Phaser.Math.Between(40, COIN_DASH.width - 40),
      Phaser.Math.Between(80, COIN_DASH.height - 40), 'shield'));
    this.shieldPickup = p;
    const remove = () => { p.destroy(); if (pickup === p) pickup = this.shieldPickup = null; };
    this.physics.add.overlap(this.player, p, () => { if (!this.finished) { this.activateShield(); remove(); } });
    this.time.delayedCall(s.lifetimeMs, () => p.active && remove());
  };
  this.time.addEvent({ delay: s.spawnEveryMs, loop: true, callback: this.spawnShield });
  this.events.on('postupdate', () => bubble.setPosition(this.player.x, this.player.y));
};
CoinDash.prototype.finish = function (reason) {
  if (reason === 'A drone caught you!' && !this.finished) {
    if (this.shielded) return this.popShield();
    if (this.time.now < this.shieldGraceUntil) return;
  }
  finishWithoutShield.call(this, reason);
};
