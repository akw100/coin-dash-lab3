/* global Phaser, COIN_DASH, CoinDash */
// Animations: player tilt, spinning drones, "+1" popup and HUD bounce on pickup, camera shake/flash on hit.
// Only visuals are tweened (angle, popup, HUD, camera); no physics body is scaled, so hitboxes stay the same.
COIN_DASH.anim = { tiltDeg: 10, droneSpinMs: 2500, popupRise: 40, popupMs: 600, hudBounce: 1.25, hudMs: 150, shakeMs: 250, shakeIntensity: 0.012 };
const createWithoutAnimations = CoinDash.prototype.create;
const finishWithoutAnimations = CoinDash.prototype.finish;
CoinDash.prototype.create = function () {
  createWithoutAnimations.call(this);
  const a = COIN_DASH.anim;
  let lastScore = 0;
  this.drones.getChildren().forEach(d => this.tweens.add({ targets: d, angle: 360, duration: a.droneSpinMs, repeat: -1 }));
  this.events.on('postupdate', () => {
    this.player.angle = this.player.body.velocity.x / COIN_DASH.playerSpeed * a.tiltDeg;
    if (this.score > lastScore) {
      const popup = this.add.text(this.player.x, this.player.y - 20, '+1',
        { font: 'bold 20px monospace', color: '#ffd166' }).setOrigin(0.5);
      this.tweens.add({ targets: popup, y: popup.y - a.popupRise, alpha: 0, duration: a.popupMs, onComplete: () => popup.destroy() });
      this.tweens.add({ targets: this.hud, scale: a.hudBounce, duration: a.hudMs, yoyo: true });
    }
    lastScore = this.score;
  });
};
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished;
  finishWithoutAnimations.call(this, reason);
  if (wasFinished) return;
  const a = COIN_DASH.anim;
  if (reason !== 'Time is up!') this.cameras.main.shake(a.shakeMs, a.shakeIntensity);
  this.cameras.main.flash(a.shakeMs, 255, 255, 255);
};
