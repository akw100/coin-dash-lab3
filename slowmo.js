/* global COIN_DASH, CoinDash, Phaser */
// Slow-mo: hold Q (Shift needs smoke support) to slow drones to a fraction of their speed, draining a recharging energy bar.
COIN_DASH.slowMo = { key: 'Q', factor: 0.4, seconds: 3, rechargeSeconds: 6, color: 0x9ad8ff };
const createWithoutSlowMo = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutSlowMo.call(this);
  const s = COIN_DASH.slowMo;
  this.slowEnergy = s.seconds;
  this.slowActive = false;
  const key = this.input.keyboard.addKey(s.key);
  const barW = 100;
  this.add.rectangle(18, 486, barW, 8, 0x000000, 0.6).setOrigin(0, 0.5).setDepth(50);
  const fill = this.add.rectangle(18, 486, barW, 8, s.color).setOrigin(0, 0.5).setDepth(51);
  this.events.on('postupdate', () => {
    if (this.finished) return;
    const dt = this.game.loop.delta / 1000;
    const want = key.isDown && this.slowEnergy > 0;
    if (want) this.slowEnergy = Math.max(0, this.slowEnergy - dt);
    else this.slowEnergy = Math.min(s.seconds, this.slowEnergy + dt * s.seconds / s.rechargeSeconds);
    // ponytail: scale velocity only on state change; drones bounce by sign flip so magnitude ratio holds
    if (want !== this.slowActive) {
      const k = want ? s.factor : 1 / s.factor;
      this.drones.getChildren().forEach(d => d.body.velocity.scale(k));
      this.slowActive = want;
    }
    fill.width = barW * this.slowEnergy / s.seconds;
  });
};
