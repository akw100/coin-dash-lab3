// Drone eyes (droneseyes.js): two white eyes per drone that follow the drone and face the player,
// dim when far away and glowing (alpha 1) when the player is within COIN_DASH.dronesEyes.alertDistance.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
// Like core.mjs's touch, but 40 px to the right of the player: close enough to alert, no overlap (no hit).
const near = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x + 40, s.player.y); o.body.reset(s.player.x + 40, s.player.y); }`;
const eyes = '__scene().dronesEyes.map((e, i) => { const d = __scene().drones.getChildren()[Math.floor(i / 2)]; return { alpha: e.alpha, dist: Phaser.Math.Distance.Between(e.x, e.y, d.x, d.y) }; })';

export async function droneseyes(t) {
  await t.js(park);
  await t.sleep(100);
  const count = await t.js('__scene().dronesEyes.length');
  const expected = await t.js('__scene().drones.getChildren().length * 2'); // count the real group: presets and the chaser change it
  t.assert(count === expected, `expected ${expected} eyes (2 per drone), found ${count}`);
  const far = await t.js(eyes);
  t.assert(far.every(e => e.dist <= 14), `eyes are not on their drones (${JSON.stringify(far)})`);
  t.assert(far.every(e => e.alpha < 1), `eyes glow with the player far away (${JSON.stringify(far)})`);
  await t.js(near('s.drones.getChildren()[0]'));
  await t.sleep(200);
  const close = await t.js(eyes);
  t.assert(close[0].alpha === 1 && close[1].alpha === 1, `eyes of the nearby drone did not glow (${JSON.stringify(close)})`);
  t.assert(close.every(e => e.dist <= 14), `eyes lost their drone (${JSON.stringify(close)})`);
  t.assert(await t.js('__scene().finished') === false, 'the nearby drone ended the round');
  await t.shot('droneseyes');
  return `${count} eyes, alpha ${far[0].alpha} far → ${close[0].alpha} near`;
}
