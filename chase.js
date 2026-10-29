/* global Phaser, COIN_DASH */
// Chase: drones hunt the player instead of only bouncing. Every frame, each drone within COIN_DASH.chase.range px
// of the player has its heading blended toward the player with weight COIN_DASH.chase.steer per second
// (1.2 = a firm turn, not a snap) while its speed stays at COIN_DASH.droneSpeed; further away it bounces as
// before. game.js is untouched: the work runs on the scene 'update' event (listen only; never re-emit 'create')
// and is skipped while the round is finished, paused (P) or the physics world is paused (countdown). A drone
// that is not moving has no heading to blend, so it stays put: tests park drones with body.reset, which
// zeroes the velocity. scene.chase = { active: true } tells tests the feature is loaded.
// Keep range at most 320: tests park drones at (30..90, 480), and (90, 480) is about 386 px from the centred
// player (400, 250), so parked drones stay out of range and cannot interrupt other checks.
(() => {
  const game = window.coinDashGame;
  const heading = new Phaser.Math.Vector2(), toPlayer = new Phaser.Math.Vector2();

  function tick(scene, time, delta) {
    if (scene.finished || scene.paused || scene.physics.world.isPaused || !scene.player || !scene.drones) return;
    const c = COIN_DASH.chase, p = scene.player, speed = COIN_DASH.droneSpeed;
    const weight = Math.min(1, c.steer * delta / 1000); // delta is ms since the last frame
    for (const drone of scene.drones.getChildren()) {
      const body = drone.body;
      if (!drone.active || !body) continue;
      heading.copy(body.velocity);
      if (heading.lengthSq() === 0) continue; // parked or stopped: nothing to steer
      const dist = Phaser.Math.Distance.Between(drone.x, drone.y, p.x, p.y);
      if (dist === 0 || dist > c.range) continue;
      toPlayer.set(p.x - drone.x, p.y - drone.y).normalize();
      heading.normalize().lerp(toPlayer, weight).normalize().scale(speed);
      body.setVelocity(heading.x, heading.y);
    }
  }

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    scene.chase = { active: true };
    // Registered once on the scene's emitter, so it survives R restarts; 'update' passes (time, delta).
    scene.events.on('update', (time, delta) => tick(scene, time, delta));
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
