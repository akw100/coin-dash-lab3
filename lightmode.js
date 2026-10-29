/* global COIN_DASH */
// Light mode: L toggles between the dark and light palettes. Survives R (restart).
(() => {
  const game = window.coinDashGame;
  let light = false;

  function apply(scene) {
    const p = light ? COIN_DASH.lightColors : { ...COIN_DASH.colors, grid: 0x24334b, hud: '#ffffff', page: '', pageText: '' };
    scene.lightMode = light;
    scene.cameras.main.setBackgroundColor(p.background);
    const grid = scene.children.list.find(o => o.type === 'Grid');
    if (grid) grid.setFillStyle(p.background, 1).setOutlineStyle(p.grid, 0.45);
    scene.hud.setColor(p.hud);
    scene.player.fillColor = p.player;
    scene.coin.fillColor = p.coin;
    scene.drones.getChildren().forEach(d => { d.fillColor = p.drone; });
    document.body.style.background = p.page;
    document.body.style.color = p.pageText;
  }

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    // 'create' fires after every start, including R restarts, which also reset the keyboard listeners.
    scene.events.on('create', () => {
      apply(scene);
      scene.input.keyboard.on('keydown-L', () => { light = !light; apply(scene); });
    });
    if (scene.sys.settings.status >= Phaser.Scenes.CREATING) scene.events.emit('create', scene);
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
