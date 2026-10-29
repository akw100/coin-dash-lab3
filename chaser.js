/* global Phaser, COIN_DASH, CoinDash */
// Chaser drone: one purple triangle that steers toward the player at a slower speed. It joins scene.drones, so touching it ends the round.
const createWithoutChaser = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutChaser.call(this);
  const k = COIN_DASH.chaser;
  const chaser = this.add.triangle(k.startX, k.startY, 0, 26, 13, 0, 26, 26, k.color);
  this.drones.add(chaser);
  chaser.body.setCollideWorldBounds(true);
  this.chaser = chaser;
  const steer = () => {
    if (this.finished) return;
    const a = Phaser.Math.Angle.Between(chaser.x, chaser.y, this.player.x, this.player.y);
    chaser.body.setVelocity(Math.cos(a) * k.speed, Math.sin(a) * k.speed);
    chaser.rotation = a + Math.PI / 2;
    chaser.fillColor = k.color; // light mode recolours every drone; keep the chaser purple
  };
  this.events.on('update', steer);
  this.events.once('shutdown', () => this.events.off('update', steer)); // scene restart (R) rebuilds the chaser
};
