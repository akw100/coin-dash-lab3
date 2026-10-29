/* global COIN_DASH */
// Player trail: while moving, fading ghost squares are left behind (named 'trail').
function addTrail(scene) {
  const t = COIN_DASH.trail;
  scene.time.addEvent({ delay: t.everyMs, loop: true, callback: () => {
    const p = scene.player;
    if (scene.finished || !p.body.velocity.lengthSq()) return;
    const g = scene.add.rectangle(p.x, p.y, p.width, p.height, p.fillColor, t.alpha).setName('trail');
    scene.tweens.add({ targets: g, alpha: 0, duration: t.fadeMs, onComplete: () => g.destroy() });
  } });
}
window.coinDashGame.events.once('ready', () => {
  const scene = window.coinDashGame.scene.getScene('CoinDash');
  scene.events.on('create', addTrail); // fires again on every restart (R)
  if (scene.player) addTrail(scene);
});
