/* global Phaser, COIN_DASH */
// Characters: the player becomes a small rounded hero (circle head, rounded-rect body, one blinking eye) that
// bobs while moving and squashes on a direction change; each drone becomes a spiky star that wobbles ±wobbleDeg
// and pulses like a heartbeat. The physics rectangles stay exactly where they are (other features and the tests
// use scene.player / scene.drones and their bodies) but are drawn with fill alpha 0, and a character is placed
// over each one every frame on 'postupdate'. Colours are read from the rectangles each frame (fillColor), so
// light mode (L) and the neon theme (T) carry over; a neon outline on a rectangle becomes an outline on its
// character. animations.js still drives the rectangles' angle (player tilt, drone spin) and halfmode.js their
// alpha (blink): both are mirrored onto the characters. game.js is untouched: characters are rebuilt on every
// scene 'create' (so they survive R). scene.characters = { player: <container>, drones: [<star>, ...] } for tests.
(() => {
  const game = window.coinDashGame;
  const TAU = Math.PI * 2;
  let lastDir = { x: 0, y: 0 }, squashUntil = 0, squashAxis = 'x', facing = 1;

  // The hidden rectangle is only drawn through its character: fill alpha 0, and a neon stroke (theme.js)
  // is moved onto the character's parts instead.
  function hide(rect) { if (rect.fillAlpha !== 0) rect.setFillStyle(rect.fillColor, 0); }
  function mirrorStroke(rect, char, parts) {
    if (rect.isStroked && rect.strokeAlpha > 0) { char.outlineAlpha = rect.strokeAlpha; rect.strokeAlpha = 0; }
    const key = rect.isStroked ? `${rect.lineWidth}:${rect.strokeColor}` : '';
    if (char.outlineKey === key) return;
    char.outlineKey = key;
    parts.forEach(p => rect.isStroked ? p.setStrokeStyle(rect.lineWidth, rect.strokeColor, char.outlineAlpha || 1) : p.setStrokeStyle());
  }

  function paintBody(g, color, stroke) {
    g.clear().fillStyle(color, 1).fillRoundedRect(-9, 0, 18, 12, 5);
    if (stroke) g.lineStyle(stroke.width, stroke.color, stroke.alpha).strokeRoundedRect(-9, 0, 18, 12, 5);
  }

  function buildHero(scene) {
    const c = COIN_DASH.characters, p = scene.player;
    const body = scene.add.graphics();
    const head = scene.add.circle(0, -6, 7, p.fillColor);
    const eye = scene.add.circle(3, -7, 2.5, c.eye);
    const pupil = scene.add.circle(3.8, -7, 1.2, c.pupil);
    const hero = scene.add.container(p.x, p.y, [body, head, eye, pupil]);
    hero.parts = { body, head, eye, pupil };
    hero.paintKey = '';
    // Render right above the player square, under later decorations (shield bubble, trail, popups).
    scene.children.moveTo(hero, scene.children.getIndex(p) + 1);
    return hero;
  }

  function buildStar(scene, drone) {
    const c = COIN_DASH.characters;
    const star = scene.add.star(drone.x, drone.y, c.starPoints, c.starInner, c.starOuter, drone.fillColor);
    scene.children.moveTo(star, scene.children.getIndex(drone) + 1); // right above the drone square, under its eyes (droneseyes.js)
    return star;
  }

  function build(scene) {
    hide(scene.player);
    scene.drones.getChildren().forEach(hide);
    scene.characters = { player: buildHero(scene), drones: scene.drones.getChildren().map(d => buildStar(scene, d)) };
    lastDir = { x: 0, y: 0 }; squashUntil = 0; facing = 1;
  }

  // Two bumps per period, like a heartbeat: 0 at rest, 1 at the main beat.
  const bump = (phase, at) => Math.exp(-(((phase - at) / 0.05) ** 2));
  const beat = phase => bump(phase, 0.15) + 0.5 * bump(phase, 0.35);

  function tickHero(scene, now) {
    const c = COIN_DASH.characters, p = scene.player, hero = scene.characters.player, parts = hero.parts;
    hide(p);
    const v = p.body ? p.body.velocity : Phaser.Math.Vector2.ZERO;
    const moving = !scene.finished && !scene.paused && (v.x !== 0 || v.y !== 0);
    const dir = { x: Math.sign(v.x), y: Math.sign(v.y) };
    if (moving) {
      if (dir.x && lastDir.x && dir.x !== lastDir.x) { squashUntil = now + c.squashMs; squashAxis = 'x'; }
      else if (dir.y && lastDir.y && dir.y !== lastDir.y) { squashUntil = now + c.squashMs; squashAxis = 'y'; }
      if (dir.x) { lastDir.x = dir.x; facing = dir.x; }
      if (dir.y) lastDir.y = dir.y;
    }
    const bob = moving ? Math.sin(now / c.bobMs * TAU) * c.bobPx : 0;
    hero.setPosition(p.x, p.y + bob);
    hero.rotation = p.rotation; // tilt from animations.js
    const k = squashUntil > now ? c.squash * (squashUntil - now) / c.squashMs : 0;
    hero.setScale(1 + (squashAxis === 'x' ? k : -k), 1 + (squashAxis === 'x' ? -k : k));
    hero.setAlpha(p.alpha); // blink from halfmode.js
    hero.setVisible(p.active && p.visible);
    const open = now % c.blinkEveryMs > c.blinkMs;
    parts.eye.setPosition(3 * facing, -7).setScale(1, open ? 1 : 0.15);
    parts.pupil.setPosition(3.8 * facing, -7).setScale(1, open ? 1 : 0.15);
    mirrorStroke(p, hero, [parts.head]);
    const stroke = p.isStroked ? { width: p.lineWidth, color: p.strokeColor, alpha: hero.outlineAlpha || 1 } : null;
    const paintKey = `${p.fillColor}:${hero.outlineKey}`;
    parts.head.fillColor = p.fillColor;
    if (hero.paintKey !== paintKey) { hero.paintKey = paintKey; paintBody(parts.body, p.fillColor, stroke); }
  }

  function tickDrones(scene, now) {
    const c = COIN_DASH.characters, drones = scene.drones.getChildren(), stars = scene.characters.drones;
    if (drones.length !== stars.length) { // the drone group changed under us: start the stars over
      stars.forEach(s => s.destroy());
      scene.characters.drones = drones.map(d => buildStar(scene, d));
      return;
    }
    const wobble = Phaser.Math.DegToRad(c.wobbleDeg), pulse = 1 + c.pulse * beat(now % c.pulseMs / c.pulseMs);
    drones.forEach((d, i) => {
      const star = stars[i];
      hide(d);
      star.setPosition(d.x, d.y);
      star.rotation = d.rotation + Math.sin(now / c.wobbleMs * TAU + i) * wobble; // spin from animations.js + wobble
      star.setScale(pulse);
      star.setAlpha(d.alpha);
      star.setVisible(d.active && d.visible);
      star.fillColor = d.fillColor;
      mirrorStroke(d, star, [star]);
    });
  }

  function tick(scene) {
    if (!scene.characters || !scene.player || !scene.drones) return;
    const now = scene.time.now;
    tickHero(scene, now);
    tickDrones(scene, now);
  }

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    const frame = () => tick(scene);
    const start = () => {
      build(scene);
      // Re-register so this runs last on 'postupdate': after arcade physics has synced the squares' positions
      // (its listener is re-added on every scene start) and after animations.js / halfmode.js have set
      // angle and alpha. Listen only for 'create': re-emitting it would run other features' hooks twice.
      scene.events.off('postupdate', frame);
      scene.events.on('postupdate', frame);
    };
    scene.events.on('create', start);
    scene.events.on('shutdown', () => { scene.characters = null; }); // the characters die with the scene
    if (scene.sys.settings.status >= Phaser.Scenes.CREATING && scene.player) start();
  }

  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
