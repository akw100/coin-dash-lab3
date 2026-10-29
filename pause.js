/* global Phaser, COIN_DASH, coinDashGame */
// Pause key (P, COIN_DASH.pauseKey): freezes the player, coins, drones and the round timer and shows a
// PAUSED label; P again resumes. game.js is untouched: physics is paused in place, and while paused the
// deadline is pushed back by the time that passes, so the HUD keeps showing the same seconds left.
(() => {
  let scene = null, overlay = [], pausedAt = 0;

  function setPaused(on) {
    scene.paused = on;
    if (on) {
      pausedAt = scene.time.now;
      scene.physics.pause();
      const c = COIN_DASH;
      overlay = [
        scene.add.rectangle(c.width / 2, c.height / 2, 280, 90, 0x0a1120, 0.9),
        scene.add.text(c.width / 2, c.height / 2, 'PAUSED', { font: '32px monospace', color: '#ffffff' }).setOrigin(0.5)
      ];
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    } else {
      scene.physics.resume();
      overlay.forEach(o => o.destroy());
      overlay = [];
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    }
  }

  // R restarts the round while paused: the new round starts unpaused and the scene has destroyed the label.
  function onShutdown() { scene.paused = false; overlay = []; }

  window.addEventListener('keydown', e => {
    if (e.code !== COIN_DASH.pauseKey || e.repeat) return;
    scene = coinDashGame.scene.getScene('CoinDash');
    if (!scene || !scene.sys.isActive() || scene.finished) return;
    setPaused(!scene.paused);
  });

  // The scene clock keeps running while paused, so move the deadline along with it before each update.
  coinDashGame.events.on(Phaser.Core.Events.PRE_STEP, time => {
    if (!scene || !scene.paused) return;
    scene.deadline += time - pausedAt;
    pausedAt = time;
  });
})();
