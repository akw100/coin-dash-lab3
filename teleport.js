/* global Phaser, COIN_DASH, CoinDash */
// Teleport: press the key to jump a short distance in the direction you're moving (or last moved), with a cooldown.
const createWithoutTeleport = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutTeleport.call(this);
  const t = COIN_DASH.teleport;
  this.teleportReadyAt = 0;
  this.teleportDir = new Phaser.Math.Vector2(1, 0);
  this.events.on('postupdate', () => {
    const v = this.player.body.velocity;
    if (v.lengthSq() > 0) this.teleportDir.copy(v).normalize();
  });
  this.input.keyboard.on(`keydown-${t.key}`, () => {
    if (this.finished || this.time.now < this.teleportReadyAt) return;
    this.teleportReadyAt = this.time.now + t.cooldownMs;
    const b = this.physics.world.bounds, p = this.player;
    const x = Phaser.Math.Clamp(p.x + this.teleportDir.x * t.distance, b.left + 12, b.right - 12);
    const y = Phaser.Math.Clamp(p.y + this.teleportDir.y * t.distance, b.top + 12, b.bottom - 12);
    for (const [fx, fy] of [[p.x, p.y], [x, y]]) {
      const flash = this.add.circle(fx, fy, 18, t.flashColor, 0.8);
      this.tweens.add({ targets: flash, scale: 2.5, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
    }
    p.setPosition(x, y);
    p.body.reset(x, y);
  });
};
