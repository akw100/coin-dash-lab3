/* global COIN_DASH, CoinDash */
// Drone warning: a drone within warnDistance of the player gets a pulsing white outline and the screen border glows red.
const createWithoutWarning = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutWarning.call(this);
  const w = COIN_DASH.droneWarning;
  this.droneWarning = false;
  const border = this.add.rectangle(COIN_DASH.width / 2, COIN_DASH.height / 2, COIN_DASH.width - 6, COIN_DASH.height - 6)
    .setStrokeStyle(6, 0xff2a2a).setDepth(50).setVisible(false);
  this.tweens.add({ targets: border, alpha: 0.35, duration: 300, yoyo: true, repeat: -1 });
  const pulse = { v: 0 };
  this.tweens.add({ targets: pulse, v: 1, duration: 250, yoyo: true, repeat: -1 });
  this.events.on('postupdate', () => {
    let near = false;
    this.drones.getChildren().forEach(d => {
      const close = Math.hypot(d.x - this.player.x, d.y - this.player.y) <= w.distance;
      near = near || close;
      if (close) d.setStrokeStyle(2 + 2 * pulse.v, 0xffffff, 0.6 + 0.4 * pulse.v);
      else d.isStroked = false;
    });
    this.droneWarning = near;
    border.setVisible(near);
  });
};
