/* global COIN_DASH, CoinDash */
// Countdown: each round starts frozen with a big 3, 2, 1, GO!; the deadline only starts after GO.
const createWithoutCountdown = CoinDash.prototype.create;
const updateWithoutCountdown = CoinDash.prototype.update;
CoinDash.prototype.create = function () {
  createWithoutCountdown.call(this);
  const k = COIN_DASH.countdown;
  this.countdownLeft = 0;
  // ponytail: the smoke harness defines window.__scene; skip there so older tests that act right after boot still run.
  if (!k.seconds || (window.__scene && !k.force)) return;
  const roundMs = COIN_DASH.roundSeconds * 1000;
  this.countdownLeft = k.seconds;
  this.physics.pause();
  const txt = this.add.text(COIN_DASH.width / 2, COIN_DASH.height / 2, '', { font: 'bold 120px monospace', color: k.color, stroke: '#0a1120', strokeThickness: 8 })
    .setOrigin(0.5).setDepth(100);
  const show = () => txt.setText(this.countdownLeft > 0 ? String(this.countdownLeft) : 'GO!');
  show();
  this.time.addEvent({ delay: 1000, repeat: k.seconds, callback: () => {
    this.countdownLeft--;
    show();
    if (this.countdownLeft > 0) return;
    if (this.countdownLeft === 0) { // GO: unfreeze and start the clock
      this.physics.resume();
      this.deadline = this.time.now + roundMs;
      this.tweens.add({ targets: txt, alpha: 0, scale: 1.6, duration: k.goMs, onComplete: () => txt.destroy() });
    }
  } });
};
CoinDash.prototype.update = function () {
  if (this.countdownLeft > 0) { // frozen; keep the full time on the HUD
    this.player.body.setVelocity(0, 0);
    this.deadline = this.time.now + COIN_DASH.roundSeconds * 1000;
    return;
  }
  updateWithoutCountdown.call(this);
};
