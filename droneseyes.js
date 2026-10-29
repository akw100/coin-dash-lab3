/* global Phaser, COIN_DASH */
// Drone eyes: each drone gets two small white eyes that face the player. Within COIN_DASH.dronesEyes.alertDistance
// pixels of the player they glow (alpha 1, radius +1); further away they are dim (alpha dimAlpha).
// game.js is untouched: eyes are rebuilt on every scene 'create' (so they survive R) and repositioned each
// frame on 'postupdate', after arcade physics has moved the drones. scene.dronesEyes is the flat array of
// eye circles, two per drone in drone order, for tests.
(() => {
  const game = window.coinDashGame;

  function build(scene) {
    const e = COIN_DASH.dronesEyes;
    scene.dronesEyes = [];
    scene.drones.getChildren().forEach(drone => {
      for (let side = -1; side <= 1; side += 2) {
        const eye = scene.add.circle(drone.x, drone.y, e.radius, e.color).setAlpha(e.dimAlpha);
        eye.droneSide = side;
        eye.drone = drone;
        scene.dronesEyes.push(eye);
      }
    });
  }

  function tick(scene) {
    const eyes = scene.dronesEyes;
    if (!eyes || !scene.player) return;
    const e = COIN_DASH.dronesEyes, p = scene.player;
    for (const eye of eyes) {
      const d = eye.drone;
      if (!d.active) { eye.setVisible(false); continue; }
      const angle = Phaser.Math.Angle.Between(d.x, d.y, p.x, p.y);
      const alert = Phaser.Math.Distance.Between(d.x, d.y, p.x, p.y) <= e.alertDistance;
      // Both eyes sit `look` px towards the player, `spread` px apart across that direction.
      eye.setPosition(
        d.x + Math.cos(angle) * e.look - Math.sin(angle) * e.spread * eye.droneSide,
        d.y + Math.sin(angle) * e.look + Math.cos(angle) * e.spread * eye.droneSide);
      const r = alert ? e.radius + 1 : e.radius;
      eye.setAlpha(alert ? 1 : e.dimAlpha);
      if (eye.radius !== r) eye.setRadius(r); // setRadius rebuilds the geometry, so only on change
    }
  }

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    // 'create' fires after every start, including R restarts. Listen only: re-emitting would run other
    // features' create hooks twice. The frame listener is registered once; it survives restarts too.
    scene.events.on('create', () => build(scene));
    scene.events.on('shutdown', () => { scene.dronesEyes = []; }); // the old eyes die with the scene
    scene.events.on('postupdate', () => tick(scene));
    if (scene.sys.settings.status >= Phaser.Scenes.CREATING && scene.drones) build(scene);
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
