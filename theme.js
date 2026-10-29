/* global COIN_DASH */
// Theme toggle: T switches to the neon palette and back; choice is remembered in localStorage.
(() => {
  const game = window.coinDashGame;
  const cfg = COIN_DASH.neon;
  let neon = false;
  try { neon = localStorage.getItem(cfg.storageKey) === '1'; } catch (e) { /* storage blocked: stay default */ }

  function apply(scene) {
    const p = neon ? cfg : scene.lightMode ? COIN_DASH.lightColors : COIN_DASH.colors;
    scene.neonMode = neon;
    scene.cameras.main.setBackgroundColor(p.background);
    const grid = scene.children.list.find(o => o.type === 'Grid');
    if (grid) grid.setFillStyle(p.background, 1).setOutlineStyle(neon ? cfg.grid : scene.lightMode ? p.grid : 0x24334b, 0.45);
    const glow = (o, c) => { o.fillColor = c; if (neon) o.setStrokeStyle(2, c, 0.9); else o.setStrokeStyle(); };
    glow(scene.player, p.player);
    glow(scene.coin, p.coin);
    scene.drones.getChildren().forEach(d => glow(d, p.drone));
  }

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    scene.events.on('create', () => {
      apply(scene);
      scene.input.keyboard.on('keydown-T', () => {
        neon = !neon;
        try { localStorage.setItem(cfg.storageKey, neon ? '1' : '0'); } catch (e) { /* ignore */ }
        apply(scene);
      });
    });
    if (scene.sys.settings.status >= Phaser.Scenes.CREATING) scene.events.emit('create', scene);
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
