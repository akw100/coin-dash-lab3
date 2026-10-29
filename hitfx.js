/* global Phaser, COIN_DASH */
// Hit feedback: when a drone catches the player, the camera shakes briefly and the screen flashes red
// (tunables in COIN_DASH.hitFx). A round that ends because time ran out gets no shake. game.js is
// untouched: scene.finish is wrapped once; scene.hitFx.count tells tests how many hits were shown.
(() => {
  const game = window.coinDashGame;

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    scene.hitFx = { count: 0 };
    const original = scene.finish;
    scene.finish = function (reason) {
      const isHit = !this.finished && /drone/i.test(String(reason));
      original.call(this, reason);
      if (!isHit) return;
      const f = COIN_DASH.hitFx;
      this.cameras.main.shake(f.shakeMs, f.shakeIntensity);
      this.cameras.main.flash(f.flashMs, ...f.flashColor);
      this.hitFx.count++;
    };
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
