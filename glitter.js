/* global Phaser, COIN_DASH */
// Glitter mode (G): glitter trails the player, rains down the screen and shimmers on drones.
// Reuses the 'sparkle' star texture made by sparkle.js. The mode survives a restart (R).
let glitterOn = false;
function addGlitter(scene) {
  if (scene.glitter?.trail.active && scene.glitter.trail.scene) return; // already set up for this run
  const g = COIN_DASH.glitter, base = {
    emitting: false, tint: g.colors, blendMode: 'ADD', rotate: { min: 0, max: 180 }, alpha: { start: 1, end: 0 }
  };
  const trail = scene.add.particles(0, 0, 'sparkle', { ...base, frequency: g.trailEvery, lifespan: 700,
    speed: { min: 5, max: 40 }, scale: { start: 0.9, end: 0 } });
  trail.startFollow(scene.player);
  const rain = scene.add.particles(0, 0, 'sparkle', { ...base, frequency: g.rainEvery, lifespan: 2500,
    x: { min: 0, max: COIN_DASH.width }, y: -10, speedY: { min: 80, max: 200 }, speedX: { min: -20, max: 20 },
    scale: { min: 0.3, max: 0.8 } });
  const drones = scene.drones.getChildren().map(d => {
    const e = scene.add.particles(0, 0, 'sparkle', { ...base, frequency: g.droneEvery, lifespan: 500,
      speed: { min: 10, max: 50 }, scale: { start: 0.7, end: 0 },
      emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 14) } });
    e.startFollow(d);
    return e;
  });
  const emitters = [trail, rain, ...drones];
  const set = on => emitters.forEach(e => (on ? e.start() : e.stop()));
  const toggle = () => { glitterOn = !glitterOn; set(glitterOn); };
  set(glitterOn);
  scene.input.keyboard.on('keydown-G', toggle);
  scene.glitter = { trail, rain, drones, emitters, toggle, get on() { return glitterOn; } };
}
window.coinDashGame.events.once('ready', () => {
  const scene = window.coinDashGame.scene.getScene('CoinDash');
  scene.events.on('create', addGlitter); // fires again on every restart (R)
  if (scene.coin) addGlitter(scene);
});
