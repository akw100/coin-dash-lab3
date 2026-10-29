/* global COIN_DASH, CoinDash */
// Screen shake: a drone catch shakes the camera and flashes it red; the time-up ending does not.
const finishWithoutShake = CoinDash.prototype.finish;
CoinDash.prototype.finish = function (reason) {
  const first = !this.finished;
  finishWithoutShake.call(this, reason);
  if (first && /drone/i.test(reason)) {
    const k = COIN_DASH.screenShake;
    this.cameras.main.shake(k.ms, k.intensity, true).flash(k.ms, 255, 0, 0, true);
  }
};
