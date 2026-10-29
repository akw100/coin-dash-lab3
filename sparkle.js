/* global Phaser, COIN_DASH */
// Sparkly coins: gold glow pulse, twinkling stars that follow the coin, and a star burst on pickup.
// Hooks the play scene from outside, so game.js stays untouched.
function addSparkle(scene) {
  const s = COIN_DASH.sparkle, coin = scene.coin;
  if (scene.sparkle?.coin === coin) return; // lightmode.js re-emits 'create', so set up once per run
  // light mode (scene.lightMode, lightmode.js): white/ADD sparkle vanishes on a light background
  const colors = () => (scene.lightMode ? s.lightColors : s.colors);
  const tint = { onEmit: () => Phaser.Utils.Array.GetRandom(colors()) };
  if (!scene.textures.exists('sparkle')) {
    // 4-point star, 16x16
    const g = scene.make.graphics({ add: false }).fillStyle(0xffffff);
    g.fillPoints([{ x: 8, y: 0 }, { x: 10, y: 6 }, { x: 16, y: 8 }, { x: 10, y: 10 },
      { x: 8, y: 16 }, { x: 6, y: 10 }, { x: 0, y: 8 }, { x: 6, y: 6 }], true);
    g.generateTexture('sparkle', 16, 16).destroy();
  }
  const glow = scene.add.circle(coin.x, coin.y, 16, COIN_DASH.colors.coin, 0.5).setBlendMode('ADD');
  scene.children.moveBelow(glow, coin);
  const tweens = [
    scene.tweens.add({ targets: glow, scale: 1.4, alpha: 0.1, duration: s.pulseMs, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }),
    scene.tweens.add({ targets: coin, scale: 1.15, duration: s.pulseMs, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  ];
  const twinkle = scene.add.particles(0, 0, 'sparkle', {
    frequency: s.twinkleEvery, lifespan: 600, speed: { min: 5, max: 25 },
    scale: { start: 0.7, end: 0 }, alpha: { start: 1, end: 0 }, rotate: { min: 0, max: 90 },
    tint, blendMode: 'ADD',
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, s.twinkleRadius) }
  });
  twinkle.startFollow(coin);
  const burst = scene.add.particles(0, 0, 'sparkle', {
    emitting: false, lifespan: 650, speed: { min: s.burstSpeed / 3, max: s.burstSpeed },
    scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, tint, blendMode: 'ADD'
  });
  let lastScore = scene.score;
  const update = () => {
    // the player overlaps the coin at pickup, and the coin has already jumped to its next spot
    if (scene.score > lastScore) burst.explode(s.burstCount, scene.player.x, scene.player.y);
    if (scene.finished) twinkle.stop();
    const blend = scene.lightMode ? 'NORMAL' : 'ADD';
    [glow, twinkle, burst].forEach(o => o.setBlendMode(blend));
    glow.setPosition(coin.x, coin.y).fillColor = coin.fillColor;
    lastScore = scene.score;
  };
  scene.events.on('update', update);
  scene.events.once('shutdown', () => scene.events.off('update', update));
  scene.sparkle = { coin, glow, tweens, twinkle, burst };
}
window.coinDashGame.events.once('ready', () => {
  const scene = window.coinDashGame.scene.getScene('CoinDash');
  scene.events.on('create', addSparkle); // fires again on every restart (R)
  if (scene.coin) addSparkle(scene);
});
