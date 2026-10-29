/* global COIN_DASH */
// Fresh restart: every new round reloads the page instead of restarting the scene in place. Features register
// scene listeners on every start and never remove them, so after a few rounds stale listeners pile up and
// one of them eventually throws; a reload wipes them. Scores and presets live in localStorage and survive.
// Disabled under automated checks (navigator.webdriver), which drive restarts in-page and inspect the result.
(() => {
  const game = window.coinDashGame;
  const state = { active: !navigator.webdriver, reloads: 0 };
  window.coinDashFreshRestart = state;
  if (!state.active) return;

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    scene.events.on('shutdown', () => {
      const k = COIN_DASH.freshRestart || { enabled: true };
      if (!k.enabled || document.visibilityState !== 'visible' || state.reloads) return;
      state.reloads++;
      setTimeout(() => location.reload(), 0);
    });
  }
  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
