/* global COIN_DASH, CoinDash */
// Near miss: a drone that comes within COIN_DASH.nearMiss.gap px of the player and leaves without touching
// shows a "Close call!" popup. Visual only, no score change. scene.nearMisses counts them for tests.
const updateWithoutNearMiss = CoinDash.prototype.update;
CoinDash.prototype.update = function () {
  updateWithoutNearMiss.call(this);
  if (this.nearMisses === undefined) this.nearMisses = 0;
  if (this.finished) return;
  const n = COIN_DASH.nearMiss, p = this.player;
  for (const d of this.drones.getChildren()) {
    // gap between the edges, treating both shapes as circles of half their width
    const gap = Math.hypot(d.x - p.x, d.y - p.y) - (d.width + p.width) / 2;
    if (gap <= 0) d.nearTouched = true; // a real (e.g. shielded) hit is not a near miss
    if (gap < n.gap) { d.nearArmed = true; continue; }
    if (d.nearArmed && !d.nearTouched) {
      this.nearMisses++;
      const label = this.add.text(p.x, p.y - 24, n.text, { font: 'bold 16px monospace', color: n.color,
        stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(80);
      this.tweens.add({ targets: label, y: label.y - 30, alpha: 0, duration: n.popupMs, onComplete: () => label.destroy() });
    }
    d.nearArmed = d.nearTouched = false;
  }
};
