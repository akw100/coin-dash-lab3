/* global Phaser, COIN_DASH */
// Timer bar: a thin bar under the HUD that shrinks with the time left in the round and turns red in the
// last seconds (tunables in COIN_DASH.timerBar). Survives R; game.js is untouched. The scene exposes it as
// scene.timerBar so tests/timerbar.mjs can read its width and colour.
(() => {
  const game = window.coinDashGame;

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    // 'create' fires after every start, including R restarts, which destroy the previous bar with the scene.
    scene.events.on('create', () => {
      const c = COIN_DASH, b = c.timerBar;
      scene.timerBar = scene.add.rectangle(0, b.y, c.width, b.height, b.colorStart).setOrigin(0, 0.5).setDepth(5);
      scene.timerBar.total = c.roundSeconds * 1000;
    });
    scene.events.on('update', () => {
      const bar = scene.timerBar;
      if (!bar || !bar.active) return;
      const b = COIN_DASH.timerBar, left = Math.max(0, scene.deadline - scene.time.now);
      bar.setSize(COIN_DASH.width * left / bar.total, b.height);
      const colour = left <= b.warnSeconds * 1000 ? b.colorEnd : b.colorStart;
      if (bar.fillColor !== colour) bar.setFillStyle(colour);
    });
    if (scene.sys.settings.status >= Phaser.Scenes.CREATING) scene.events.emit('create', scene);
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
