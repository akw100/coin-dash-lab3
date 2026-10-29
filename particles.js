/* global Phaser, COIN_DASH */
// Coin pickup burst: small yellow circles fly out from the old coin spot and fade (tweened shapes, no textures).
function addParticles(scene) {
  if (scene.particlesOn) return; // lightmode.js re-emits 'create'
  scene.particlesOn = true;
  const p = COIN_DASH.particles;
  let score = scene.score, x = scene.coin.x, y = scene.coin.y;
  const update = () => {
    if (scene.score > score) {
      for (let i = 0; i < p.count; i++) {
        const a = (i / p.count) * Math.PI * 2, d = p.distance * Phaser.Math.FloatBetween(0.6, 1);
        const dot = scene.add.circle(x, y, p.radius, COIN_DASH.colors.coin).setData('particle', true);
        scene.tweens.add({ targets: dot, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0,
          duration: p.fadeMs, onComplete: () => dot.destroy() });
      }
    }
    score = scene.score;
    if (scene.coin.x !== x || scene.coin.y !== y) { // coin moved: remember where it was one frame ago
      x = scene.coin.x; y = scene.coin.y;
    }
  };
  scene.events.on('update', update);
  scene.events.once('shutdown', () => scene.events.off('update', update));
}
window.coinDashGame.events.once('ready', () => {
  const scene = window.coinDashGame.scene.getScene('CoinDash');
  scene.events.on('create', addParticles);
  if (scene.coin) addParticles(scene);
});
